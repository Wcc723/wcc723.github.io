#!/usr/bin/env node
// 兩份 dist 的比對（主站首頁規格 K.4 第 2 步與第 6 步），P1 與 S 的驗收工具。只用 Node 內建模組。
//
//   node scripts/dist-diff.mjs <舊 dist> <新 dist>                 P1：產物不變
//   node scripts/dist-diff.mjs <舊 dist> <新 dist> --mode shell    S：只有 G.5「可以不同」的差異
//   選項：--tokens <tokens.css>（預設 source/.vitepress/theme/shared/tokens/tokens.css）、--max <n>（每類最多列幾條，預設 20）
//
// 正規化：資產檔名的雜湊（assets/x.<8 字>.js → assets/x.[hash].js）、HTML 內嵌的 __VP_HASH_MAP__ 的值、hashmap.json 的值。
// P1 的規則：
//   - 檔案集合（雜湊正規化之後）相同：不得多出 SiteHomePage chunk 這類新檔
//   - HTML、XML、JSON 與其他文字檔正規化之後逐字相同；圖片、字型等二進位檔逐位元組相同
//   - assets 的 CSS 只容許 tokens.css 新增的自訂屬性（舊 CSS 沒有、tokens.css 有宣告的 --x）；不得出現外語首頁的樣式
//   - JS 不比內容（theme chunk 的大小由 audit 的上限檢查）
// 符合就 exit 0，有差異 exit 1，參數錯 exit 2。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { SITE, elementsWhere, headOf, startTags, stripHidden, textOf } from './lib/extract-page.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const DEFAULT_TOKENS = path.join(ROOT, 'source/.vitepress/theme/shared/tokens/tokens.css')

/** P1 的 CSS 不得出現的字：外語首頁與 preview 的樣式只在 __CS_SITE_HOME__ 為 true 時進建置（B.6） */
export const CSS_FORBIDDEN = ['.cs-shome', '.cs-toolcard', 'cs-preview', 'Nunito Intl']

// VitePress（Rollup）的資產雜湊是 8 個 base64url 字元，接在名稱後面、副檔名（含 .lean）前面
const ASSET_HASH_RE = /\.([A-Za-z0-9_-]{8})((?:\.lean)?\.(?:js|mjs|css|woff2?|ttf|otf|svg|png|jpe?g|webp|gif|avif|ico|json|wasm))(?=$|[?#"'`\s)\\])/g
const TEXT_EXT = new Set(['.html', '.xml', '.json', '.txt', '.css', '.js', '.mjs', '.svg', '.webmanifest', ''])
const COMPARED_TEXT_EXT = new Set(['.html', '.xml', '.json', '.txt', '.svg', '.webmanifest', ''])

/** assets/ 底下的檔名去掉雜湊：assets/chunks/theme.CHunwxFA.js → assets/chunks/theme.[hash].js；其他路徑不變 */
export function normalizeAssetPath(rel) {
  if (!rel.startsWith('assets/')) return rel
  return rel.replace(ASSET_HASH_RE, '.[hash]$2')
}

/** 文字裡的 /assets/... 參照去掉雜湊 */
export function normalizeAssetRefs(s) {
  return s.replace(/(\/?assets\/[^"'`\s)\\]*?)\.([A-Za-z0-9_-]{8})((?:\.lean)?\.[a-z0-9]+)(?=$|[?#"'`\s)\\])/g, '$1.[hash]$3')
}

// 雜湊表的值換成 [hash]，key 排序；dropKeys 是比對時不算的 key（S 的 404.md）
const normalizeMap = (map, dropKeys) => Object.fromEntries(Object.keys(map).filter((k) => !dropKeys.includes(k)).sort().map((k) => [k, '[hash]']))

/** HTML 內嵌的 window.__VP_HASH_MAP__=JSON.parse("…") 的值換成 [hash]（key 照留：頁面集合要相同） */
export function normalizeVpHashMap(html, { dropKeys = [] } = {}) {
  return html.replace(/(__VP_HASH_MAP__\s*=\s*JSON\.parse\()("(?:[^"\\]|\\.)*")(\))/g, (m, a, lit, b) => {
    let map
    try { map = JSON.parse(JSON.parse(lit)) } catch { return m }
    return `${a}${JSON.stringify(JSON.stringify(normalizeMap(map, dropKeys)))}${b}`
  })
}

/** hashmap.json 的值換成 [hash] */
export function normalizeHashmapJson(text, { dropKeys = [] } = {}) {
  return JSON.stringify(normalizeMap(JSON.parse(text), dropKeys))
}

/** 一個檔的比對用內容（文字檔） */
export function normalizeContent(rel, text, opts = {}) {
  if (rel === 'hashmap.json') return normalizeHashmapJson(text, opts)
  let s = normalizeAssetRefs(text)
  if (rel.endsWith('.html')) s = normalizeVpHashMap(s, opts)
  return s
}

/** 資料夾底下所有檔（相對路徑，/ 分隔），排序 */
export function listFiles(dir) {
  const out = []
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(dir, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) walk(r)
      else out.push(r)
    }
  }
  walk('')
  return out.sort()
}

// --- CSS --------------------------------------------------------------------

/** CSS 切成「選擇器或 at-rule」、「{」「}」、「宣告」的序列（壓縮過的 CSS 用；註解先拿掉） */
export function cssTokens(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').split(/([{};])/).map((x) => x.trim()).filter((x) => x && x !== ';')
}

const customPropOf = (tok) => /^(--[\w-]+)\s*:/.exec(tok)?.[1] ?? null

/** tokens.css 宣告的自訂屬性名稱 */
export function declaredCustomProps(css) {
  return new Set(cssTokens(css).map(customPropOf).filter(Boolean))
}

/**
 * 新舊 CSS 的差異：新 CSS 拿掉「舊 CSS 沒有、tokens.css 有宣告」的自訂屬性宣告之後，要跟舊 CSS 逐個 token 相同。
 * 回 { problems, allowed }：allowed 是放行的屬性名稱
 */
export function cssDiff(oldCss, newCss, { tokenProps = new Set(), forbidden = CSS_FORBIDDEN } = {}) {
  const problems = []
  for (const f of forbidden) if (newCss.includes(f)) problems.push(`新 CSS 有 ${f}（外語首頁的樣式只在 __CS_SITE_HOME__ 為 true 時進建置）`)
  const before = cssTokens(oldCss)
  const oldProps = new Set(before.map(customPropOf).filter(Boolean))
  const allowed = new Set()
  const after = cssTokens(newCss).filter((tok) => {
    const p = customPropOf(tok)
    if (!p || oldProps.has(p)) return true
    if (tokenProps.has(p)) { allowed.add(p); return false }
    return true
  })
  if (before.length !== after.length || before.some((t, i) => t !== after[i])) {
    const i = before.findIndex((t, k) => t !== after[k])
    const at = i === -1 ? before.length : i
    problems.push(`CSS 在第 ${at + 1} 個 token 不同：舊「${(before[at] ?? '（結束）').slice(0, 120)}」，新「${(after[at] ?? '（結束）').slice(0, 120)}」`)
  }
  return { problems, allowed: [...allowed].sort() }
}

// --- --mode shell（G.5） -------------------------------------------------------

/** <details> 關著時無障礙樹看得到的部分：只留 summary，其他內容拿掉 */
export function stripClosedDetails(html) {
  let out = html
  for (;;) {
    const d = elementsWhere(out, (t) => t.name === 'details')[0]
    if (!d) return out
    const summary = elementsWhere(d.inner, (t) => t.name === 'summary')[0]
    out = out.slice(0, d.index) + (summary ? summary.outer : '') + out.slice(d.index + d.outer.length)
  }
}

const resolveHref = (href, pageUrl) => {
  if (href === null || href === undefined) return null
  try { return new URL(href, SITE + pageUrl).href } catch { return href }
}

/**
 * 頁首或頁尾的比對事實（G.5「必須相同」）：地標與 aria-label、標題、連結（解析後網址、字、aria-current、hreflang、lang、rel、target）、
 * 按鈕（aria-label、title、aria-keyshortcuts、字）、看得到的文字。class 名稱與包裝的 div、span 不算
 */
export function regionFacts(html, pageUrl = '/') {
  const h = stripClosedDetails(stripHidden(html))
  const tags = startTags(h)
  const landmarks = tags.filter((t) => ['header', 'nav', 'footer'].includes(t.name)).map((t) => `${t.name}${t.attrs['aria-label'] ? `[${t.attrs['aria-label']}]` : ''}`)
  const headings = elementsWhere(h, (t) => /^h[1-6]$/.test(t.name)).map((e) => `${e.name}:${textOf(e.inner)}`)
  const links = elementsWhere(h, (t) => t.name === 'a').map((e) => {
    const innerLang = startTags(e.inner).find((t) => 'lang' in t.attrs)?.attrs.lang ?? null
    return {
      href: resolveHref(e.attrs.href ?? null, pageUrl), text: textOf(e.inner), current: e.attrs['aria-current'] ?? null,
      hreflang: e.attrs.hreflang ?? null, lang: e.attrs.lang ?? innerLang, rel: e.attrs.rel ?? null, target: e.attrs.target ?? null,
    }
  })
  const buttons = elementsWhere(h, (t) => t.name === 'button').map((e) => ({
    label: e.attrs['aria-label'] ?? null, title: e.attrs.title ?? null, keys: e.attrs['aria-keyshortcuts'] ?? null, text: textOf(e.inner),
  }))
  return { landmarks, headings, links, buttons, text: textOf(h) }
}

/** 頁面最外層的 <header> 與 <footer>（版面根元素的子元素） */
function chromeOf(html) {
  const header = elementsWhere(html, (t) => t.name === 'header')[0] ?? null
  const footers = elementsWhere(html, (t) => t.name === 'footer')
  return { header, footer: footers[footers.length - 1] ?? null }
}

/** GA4 那段 <script>（舊的 siteHead 片段與 ga4HeadHtml() 都載 gtag.js）、module script、modulepreload */
const stripGa4 = (html) => html.replace(/<script>(?:(?!<\/script>)[\s\S])*?googletagmanager\.com\/gtag\/js(?:(?!<\/script>)[\s\S])*?<\/script>\s*/g, '')
const stripHydration = (html) => html.replace(/<script type="module"[^>]*><\/script>\s*/g, '').replace(/<link rel="modulepreload"[^>]*>\s*/g, '')

/** 一頁在 shell 模式的比對：header、footer 的事實，加上 header、footer 以外的 HTML（拿掉 GA4）；404 只比 head 與頁尾 */
export function shellPageProblems(rel, oldHtml, newHtml, pageUrl) {
  const out = []
  const a = chromeOf(oldHtml)
  const b = chromeOf(newHtml)
  const is404 = rel === '404.html'
  const regions = is404 ? ['footer'] : ['header', 'footer']
  for (const k of regions) {
    if (!a[k] || !b[k]) { if (a[k] || b[k]) out.push(`${rel}：${a[k] ? '新' : '舊'}的頁面沒有 <${k}>`); continue }
    const fa = regionFacts(a[k].outer, pageUrl)
    const fb = regionFacts(b[k].outer, pageUrl)
    for (const f of ['landmarks', 'headings', 'links', 'buttons', 'text']) {
      if (JSON.stringify(fa[f]) !== JSON.stringify(fb[f])) out.push(`${rel} 的 <${k}> ${f} 不同：舊 ${JSON.stringify(fa[f]).slice(0, 300)}，新 ${JSON.stringify(fb[f]).slice(0, 300)}`)
    }
  }
  const rest = (html, c) => {
    let s = html
    for (const r of [c.footer, c.header]) if (r) s = s.replace(r.outer, '<!--shell-->')
    return stripGa4(s)
  }
  if (is404) {
    const ha = stripHydration(stripGa4(headOf(oldHtml)))
    const hb = stripHydration(stripGa4(headOf(newHtml)))
    if (ha !== hb) out.push(`${rel} 的 <head> 除了 GA4、modulepreload、module script 以外不同`)
  } else if (rest(oldHtml, a) !== rest(newHtml, b)) {
    const x = rest(oldHtml, a)
    const y = rest(newHtml, b)
    let i = 0
    while (i < x.length && x[i] === y[i]) i++
    out.push(`${rel} 在頁首頁尾以外不同（第 ${i} 字附近）：舊「${x.slice(Math.max(0, i - 40), i + 80)}」，新「${y.slice(Math.max(0, i - 40), i + 80)}」`)
  }
  return out
}

// S 才多出來的檔：source/404.md 的兩支 page chunk（C.4）
const SHELL_EXTRA_FILES = ['assets/404.md.[hash].js', 'assets/404.md.[hash].lean.js']

// --- 比對 ---------------------------------------------------------------------

const urlOfHtml = (rel) => `/${rel === 'index.html' ? '' : rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel}`

/**
 * 比對兩份 dist。mode：'p1'（預設）或 'shell'。回 { ok, problems: { files, content, css }, stats }
 */
export function compareDists(oldDir, newDir, { mode = 'p1', tokensFile = DEFAULT_TOKENS } = {}) {
  if (!['p1', 'shell'].includes(mode)) throw new Error(`不認得的 --mode：${mode}（p1、shell）`)
  for (const d of [oldDir, newDir]) if (!fs.existsSync(d) || !fs.statSync(d).isDirectory()) throw new Error(`找不到 dist 資料夾：${d}`)
  const problems = { files: [], content: [], css: [] }
  const index = (dir) => {
    const m = new Map()
    for (const rel of listFiles(dir)) {
      const key = normalizeAssetPath(rel)
      if (m.has(key)) problems.files.push(`${path.basename(dir)}：雜湊正規化之後撞名 ${key}（${m.get(key)}、${rel}）`)
      m.set(key, rel)
    }
    return m
  }
  const before = index(oldDir)
  const after = index(newDir)
  for (const k of before.keys()) if (!after.has(k)) problems.files.push(`新 dist 少了 ${k}`)
  for (const k of after.keys()) {
    if (before.has(k)) continue
    if (mode === 'shell' && SHELL_EXTRA_FILES.includes(k)) continue
    problems.files.push(`新 dist 多了 ${k}${/SiteHomePage/.test(k) ? '（外語首頁的 chunk 只在 __CS_SITE_HOME__ 為 true 時產生）' : ''}`)
  }
  const tokenProps = fs.existsSync(tokensFile) ? declaredCustomProps(fs.readFileSync(tokensFile, 'utf8')) : new Set()
  const stats = { files: after.size, html: 0, compared: 0, binary: 0, js: 0, css: 0, allowedCssProps: [] }
  for (const [key, relNew] of after) {
    const relOld = before.get(key)
    if (!relOld) continue
    const ext = path.extname(key).toLowerCase()
    const a = fs.readFileSync(path.join(oldDir, relOld))
    const b = fs.readFileSync(path.join(newDir, relNew))
    if (key.startsWith('assets/') && (ext === '.js' || ext === '.mjs')) { stats.js++; continue }
    if (key.startsWith('assets/') && ext === '.css') {
      stats.css++
      const r = cssDiff(a.toString('utf8'), b.toString('utf8'), { tokenProps })
      if (mode === 'shell') problems.css.push(...r.problems.filter((p) => !p.startsWith('CSS 在第')).map((p) => `${key}：${p}`))
      else problems.css.push(...r.problems.map((p) => `${key}：${p}`))
      stats.allowedCssProps.push(...r.allowed)
      continue
    }
    const text = COMPARED_TEXT_EXT.has(ext) || (!key.startsWith('assets/') && TEXT_EXT.has(ext))
    if (!text) {
      stats.binary++
      if (!a.equals(b)) problems.content.push(`${key} 的位元組不同`)
      continue
    }
    stats.compared++
    // S 起 hashmap.json 與每頁的 __VP_HASH_MAP__ 多 404.md 一筆（C.4），shell 模式不算
    const norm = { dropKeys: mode === 'shell' ? ['404.md'] : [] }
    const x = normalizeContent(key, a.toString('utf8'), norm)
    const y = normalizeContent(key, b.toString('utf8'), norm)
    if (key.endsWith('.html')) {
      stats.html++
      if (mode === 'shell') {
        problems.content.push(...shellPageProblems(key, x, y, urlOfHtml(key)))
        continue
      }
    }
    if (x !== y) {
      let i = 0
      while (i < x.length && x[i] === y[i]) i++
      problems.content.push(`${key} 正規化之後不同（第 ${i} 字附近）：舊「${x.slice(Math.max(0, i - 40), i + 80).replace(/\n/g, '⏎')}」，新「${y.slice(Math.max(0, i - 40), i + 80).replace(/\n/g, '⏎')}」`)
    }
  }
  stats.allowedCssProps = [...new Set(stats.allowedCssProps)].sort()
  const ok = !problems.files.length && !problems.content.length && !problems.css.length
  return { ok, mode, problems, stats }
}

/** 人看的結果 */
export function formatResult(r, { max = 20 } = {}) {
  const out = [`dist-diff（${r.mode}）：${r.stats.files} 個檔；比了 ${r.stats.compared} 個文字檔（HTML ${r.stats.html}）、${r.stats.binary} 個二進位檔、${r.stats.css} 支 CSS；JS ${r.stats.js} 支只比檔案集合`]
  if (r.stats.allowedCssProps.length) out.push(`CSS 放行的 tokens.css 新自訂屬性：${r.stats.allowedCssProps.join('、')}`)
  for (const [k, label] of [['files', '檔案集合'], ['content', '內容'], ['css', 'CSS']]) {
    const list = r.problems[k]
    if (!list.length) continue
    out.push(`${label}：${list.length} 個差異`)
    for (const p of list.slice(0, max)) out.push(`  ${p}`)
    if (list.length > max) out.push(`  另外 ${list.length - max} 個`)
  }
  out.push(r.ok ? '結果：相同（只有允許的差異）' : '結果：不同')
  return out.join('\n')
}

export function parseArgs(argv) {
  const o = { dirs: [], mode: 'p1', tokensFile: DEFAULT_TOKENS, max: 20 }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const val = () => {
      const v = argv[++i]
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} 要接一個值`)
      return v
    }
    if (a === '--mode') o.mode = val()
    else if (a === '--tokens') o.tokensFile = path.resolve(val())
    else if (a === '--max') o.max = Number(val())
    else if (a.startsWith('--')) throw new Error(`不認得的參數：${a}（--mode、--tokens、--max）`)
    else o.dirs.push(path.resolve(a))
  }
  if (o.dirs.length !== 2) throw new Error('用法：node scripts/dist-diff.mjs <舊 dist> <新 dist> [--mode shell]')
  if (!['p1', 'shell'].includes(o.mode)) throw new Error(`不認得的 --mode：${o.mode}（p1、shell）`)
  return o
}

export function main(argv = process.argv.slice(2), { log = console.log } = {}) {
  let o
  try { o = parseArgs(argv) } catch (e) { log(`✗ ${e.message}`); return 2 }
  const r = compareDists(o.dirs[0], o.dirs[1], { mode: o.mode, tokensFile: o.tokensFile })
  log(formatResult(r, { max: o.max }))
  return r.ok ? 0 : 1
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exitCode = main()
  } catch (e) {
    console.error(`✗ ${e.message}`)
    process.exitCode = 2
  }
}
