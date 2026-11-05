// 頁面欄位擷取與本文指紋：從 workspace 的 scripts/blog-baseline.mjs 移植。
// 基準（baseline/hexo-*/pages.json）就是用那支腳本的 extractPage 算出來的，audit 要拿同一套演算法處理 VitePress 產物，
// 數字才能直接比。所以「移植區」的函式必須跟 blog-baseline.mjs 逐行同義：要改演算法先改 workspace 那一支、重產基準，
// 再同步到這裡；extract-page.test.mjs 會拿兩邊對同一批 HTML 比結果（找得到 workspace 時）。
//
// 「移植區」之後是 VitePress 產物專用的工具（本文範圍、比對用的正規化、相似度），只有 audit 用，不影響指紋。
// HTML 用正規表示式解析，對象是固定格式的產物（Hexo 的 casper-2026 主題、本 repo 的 VitePress 主題），不是通用的 HTML parser。
import { createHash } from 'node:crypto'

// ============================================================================
// 移植區：與 blog-baseline.mjs 相同，不要單獨修改
// ============================================================================

export const SITE = 'https://www.casper.tw'

// --- 網址 -------------------------------------------------------------------

/** 樹裡的檔案路徑 → 網址路徑。index.html 用結尾斜線的形式；大小寫照舊，非 ASCII 用 encodeURI（與 Hexo 的 canonical 相同） */
export function fileToUrl(file) {
  const p = file === 'index.html' ? '' : file.endsWith('/index.html') ? file.slice(0, -'index.html'.length) : file
  return encodeURI('/' + p)
}

/** GitHub Pages 對非 index 的 x.html 也會回應 /x，這種別名另外列出 */
export function urlAliases(file) {
  if (!file.endsWith('.html') || file === 'index.html' || file.endsWith('/index.html')) return []
  return [encodeURI('/' + file.slice(0, -'.html'.length))]
}

/** 依路徑分類 HTML 頁面（基準的 type 欄位；VitePress 的頁型另見 source/.vitepress/lib/pagetype.mjs） */
export function pageType(file) {
  if (file === 'index.html') return 'home'
  if (/^page\/\d+\/index\.html$/.test(file)) return 'home-page'
  if (file.startsWith('archives/')) return 'archive'
  if (file.startsWith('categories/')) return 'category'
  if (file === 'tags/index.html') return 'tags-index'
  if (file.startsWith('tags/')) return 'tag'
  if (file.startsWith('about/')) return 'about'
  if (/^[^/]+\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/index\.html$/.test(file)) return 'post'
  return 'other'
}

// --- HTML 擷取（純函式）------------------------------------------------------

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', middot: '·',
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', mdash: '—', ndash: '–',
  laquo: '«', raquo: '»', copy: '©', reg: '®', trade: '™', times: '×',
  rarr: '→', larr: '←', deg: '°', bull: '•',
}

/** 解開數字實體和常見的具名實體；不認得的照原樣留著 */
export function decodeEntities(s) {
  return s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, e) => {
    if (e[0] !== '#') return NAMED[e] ?? m
    const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
    return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m
  })
}

export const TAG_BODY = `(?:[^>"']|"[^"]*"|'[^']*')*`

/** 標籤內的屬性字串 → { 小寫名稱: 解碼後的值 }，同名屬性取第一個 */
export function parseAttrs(s) {
  const attrs = {}
  for (const m of s.matchAll(/([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const name = m[1].toLowerCase()
    if (!(name in attrs)) attrs[name] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? '')
  }
  return attrs
}

/** 找出所有 <name ...> 開始標籤的屬性 */
export function findTags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b(${TAG_BODY})>`, 'gi'))].map((m) => parseAttrs(m[1]))
}

/** 拿掉看不到的部分：註解、script、style、noscript、template */
export function stripHidden(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, '')
}

/** HTML 片段 → 顯示文字（去標籤、解實體、空白壓成一格） */
export function textOf(html) {
  return decodeEntities(stripHidden(html).replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim()
}

/** </head> 之前 */
export function headOf(html) {
  const end = html.search(/<\/head\s*>/i)
  return end === -1 ? html : html.slice(0, end)
}

/** <main> 的內容；沒有 <main> 就用整份 */
export function mainOf(html) {
  const m = new RegExp(`<main\\b${TAG_BODY}>`, 'i').exec(html)
  if (!m) return html
  const start = m.index + m[0].length
  const end = html.lastIndexOf('</main>')
  return html.slice(start, end > start ? end : html.length)
}

/** 文章本文：<div class="prose"> 到 post-foot（沒有就到 </article>）；不是文章頁就是整個 <main> */
export function articleOf(html) {
  const main = mainOf(html)
  const open = '<div class="prose">'
  const i = main.indexOf(open)
  if (i === -1) return main
  const rest = main.slice(i + open.length)
  const foot = rest.lastIndexOf('<div class="post-foot">')
  const end = foot !== -1 ? foot : rest.lastIndexOf('</article>')
  return end === -1 ? rest : rest.slice(0, end)
}

/** 指紋用的正規化：顯示文字去掉所有空白（含換行與 nbsp）後做 NFC */
export function fingerprintText(html) {
  return textOf(html).replace(/\s+/g, '').normalize('NFC')
}

export const sha256 = (s) => createHash('sha256').update(s).digest('hex')

/** 所有 h1 到 h6：[{ level, id, text }] */
export function headings(html) {
  const re = new RegExp(`<h([1-6])\\b(${TAG_BODY})>([\\s\\S]*?)<\\/h\\1\\s*>`, 'gi')
  return [...stripHidden(html).matchAll(re)].map((m) => ({ level: Number(m[1]), id: parseAttrs(m[2]).id ?? null, text: textOf(m[3]) }))
}

const relHas = (rel, v) => (rel ?? '').toLowerCase().split(/\s+/).includes(v)

/**
 * 一頁 HTML → 基準線欄位。單值欄位取第一個，出現不只一次的欄位名稱列在 dupes。
 * 找不到的欄位是 null；headingIds 只看 <main> 裡有 id 的標題；h1 是整個 body 的 h1 文字。
 */
export function extractPage(html) {
  const head = headOf(html)
  const body = html.slice(head.length)
  const metas = findTags(head, 'meta')
  const links = findTags(head, 'link')
  const meta = (attr, key) => metas.filter((m) => (m[attr] ?? '').toLowerCase() === key).map((m) => m.content ?? '')
  const lists = {
    title: [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)].map((m) => decodeEntities(m[1]).replace(/\s+/g, ' ').trim()),
    description: meta('name', 'description'),
    canonical: links.filter((l) => relHas(l.rel, 'canonical')).map((l) => l.href ?? ''),
    ogUrl: meta('property', 'og:url'),
    ogTitle: meta('property', 'og:title'),
    ogSiteName: meta('property', 'og:site_name'),
    ogDescription: meta('property', 'og:description'),
    ogType: meta('property', 'og:type'),
    ogImage: meta('property', 'og:image'),
    robots: meta('name', 'robots'),
    publishedTime: meta('property', 'article:published_time'),
    modifiedTime: meta('property', 'article:modified_time'),
  }
  const out = { lang: findTags(html, 'html')[0]?.lang ?? null }
  const dupes = []
  for (const [k, v] of Object.entries(lists)) {
    out[k] = v[0] ?? null
    if (v.length > 1) dupes.push(k)
  }
  out.jsonLdTypes = [...head.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)].map((m) => {
    try { return [JSON.parse(m[1])].flat().map((o) => o['@type']).join(',') } catch { return 'INVALID_JSON' }
  })
  out.fbCommentsHref = findTags(body, 'div').find((d) => /(^|\s)fb-comments(\s|$)/.test(d.class ?? ''))?.['data-href'] ?? null
  out.h1 = headings(body).filter((h) => h.level === 1).map((h) => h.text)
  out.headingIds = headings(mainOf(html)).filter((h) => h.id !== null).map((h) => h.id)
  const text = fingerprintText(articleOf(html))
  out.textChars = [...text].length
  out.textSha256 = sha256(text)
  out.dupes = dupes
  return out
}

/** sitemap.xml 的 <loc> 值 */
export function sitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((m) => decodeEntities(m[1].trim()))
}

// ============================================================================
// VitePress 產物專用（不在 blog-baseline.mjs 裡）
// ============================================================================

// --- 標籤與 class ------------------------------------------------------------

const START_TAG_RE = new RegExp(`<([a-zA-Z][\\w:-]*)\\b(${TAG_BODY})>`, 'g')

/** 所有開始標籤：[{ name, attrs, index, end }]，index 是 < 的位置，end 是 > 之後 */
export function startTags(html) {
  return [...html.matchAll(START_TAG_RE)].map((m) => ({ name: m[1].toLowerCase(), attrs: parseAttrs(m[2]), index: m.index, end: m.index + m[0].length }))
}

/** class 屬性裡有沒有這個 token（post-card 不會配到 post-card__title） */
export const hasClass = (attrs, cls) => (attrs.class ?? '').split(/\s+/).includes(cls)

/** 某個元素的內容：從開始標籤之後到第一個同名結束標籤（假設裡面沒有同名的巢狀元素，用在 p、a、span 這類小元素） */
function innerOf(html, tag) {
  const close = html.toLowerCase().indexOf(`</${tag.name}`, tag.end)
  return html.slice(tag.end, close === -1 ? html.length : close)
}

// --- 本文範圍 ----------------------------------------------------------------

/**
 * VitePress 產物的文章本文：<main> 裡第一個 class 含 prose 的元素，到它後面最後一個 class 含 post-foot 的元素
 * （沒有就到 </article>，再沒有就到 <main> 結尾）；沒有 prose 就是整個 <main>。
 * 跟 articleOf 同一個範圍定義，差別只在用 class token 找，Vue 加上的 data-v-* 屬性或多個 class 都不影響。
 */
export function builtArticleOf(html) {
  const main = mainOf(html)
  const prose = startTags(main).find((t) => hasClass(t.attrs, 'prose'))
  if (!prose) return main
  const rest = main.slice(prose.end)
  const feet = startTags(rest).filter((t) => hasClass(t.attrs, 'post-foot'))
  const end = feet.length ? feet[feet.length - 1].index : rest.lastIndexOf('</article>')
  return end === -1 ? rest : rest.slice(0, end)
}

/** 有沒有找到本文容器（主題沒加 class="prose" 時，指紋會變成整個 <main>，audit 要先擋下來） */
export const hasProse = (html) => startTags(mainOf(html)).some((t) => hasClass(t.attrs, 'prose'))

// --- 比對用的文字 --------------------------------------------------------------

// VitePress 加的外框：程式碼區塊的複製鈕和語言標籤（<span class="lang">js</span>），以及標題旁的 header-anchor
// （內容是 &ZeroWidthSpace; 或 U+200B）。Hexo 沒有這些字（它的 headerlink 是空的），比對前拿掉。
// 文章有 <style scoped> 時每個元素都多一個 data-v-xxxx 屬性（例 <span class="lang" data-v-75d912e9>），屬性不限順序與數量。
const CODE_CHROME_RE = /<button\b[^>]*\bclass="copy"[^>]*>[\s\S]*?<\/button>|<span\b[^>]*\bclass="lang"[^>]*>[\s\S]*?<\/span>|<a\b[^>]*\bclass="header-anchor"[^>]*>[\s\S]*?<\/a>/g

/**
 * 引號與破折號類字元的正規化，把 Hexo 的 smartypants 轉換倒回去：彎引號 → 直引號，U+2014 → ---，U+2013 → --，U+2026 → ...；
 * 零寬字元（VitePress 標題錨點裡的 U+200B）刪掉。兩邊都套同一個函式，作者原本就打的彎引號兩邊也一樣。
 */
export function normalizePunct(s) {
  return s
    .replace(/[​‌‍⁠﻿]/g, '')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„‟]/g, '"')
    .replace(/—/g, '---')
    .replace(/–/g, '--')
    .replace(/…/g, '...')
}

/** 比對用的本文文字：拿掉程式碼外框 → fingerprintText → normalizePunct。只用在相似度，不影響 textSha256 */
export function comparableText(html) {
  return normalizePunct(fingerprintText(html.replace(CODE_CHROME_RE, '')))
}

// --- 相似度 ------------------------------------------------------------------

/**
 * 只算插入與刪除的編輯距離 D（= n + m - 2 × LCS），Myers O((n+m)·D) 演算法，只留一列 V，不重建路徑。
 * 超過 maxD 就停，回傳 null。文字幾乎相同時很快；差很多時靠 maxD 截斷，不會卡住。
 */
export function editDistance(a, b, maxD = a.length + b.length) {
  let start = 0
  while (start < a.length && start < b.length && a[start] === b[start]) start++
  let ea = a.length
  let eb = b.length
  while (ea > start && eb > start && a[ea - 1] === b[eb - 1]) { ea--; eb-- }
  const n = ea - start
  const m = eb - start
  if (n === 0 || m === 0) return n + m <= maxD ? n + m : null
  const max = Math.min(maxD, n + m)
  const off = max + 1
  const v = new Int32Array(2 * max + 3)
  for (let d = 0; d <= max; d++) {
    for (let k = -d; k <= d; k += 2) {
      let x = k === -d || (k !== d && v[off + k - 1] < v[off + k + 1]) ? v[off + k + 1] : v[off + k - 1] + 1
      let y = x - k
      while (x < n && y < m && a[start + x] === b[start + y]) { x++; y++ }
      v[off + k] = x
      if (x >= n && y >= m) return d
    }
  }
  return null
}

/** 字元直方圖重疊數：LCS 的上限，用來快速判斷「不可能到門檻」。跟 editDistance 一樣以 UTF-16 code unit 計 */
function overlap(a, b) {
  const count = new Int32Array(65536)
  for (let i = 0; i < a.length; i++) count[a.charCodeAt(i)]++
  let n = 0
  for (let i = 0; i < b.length; i++) {
    const c = b.charCodeAt(i)
    if (count[c] > 0) { n++; count[c]-- }
  }
  return n
}

/**
 * 相似度 = 1 - D / (n + m)，也就是 2 × LCS / (n + m)，1 是完全相同。
 * 只精算到 min：低於 min 時回傳 { ratio: null, upper }，upper 是由字元重疊數算出的上限。
 */
export function similarity(a, b, { min = 0 } = {}) {
  const total = a.length + b.length
  if (total === 0) return { ratio: 1, upper: 1 }
  const upper = (2 * overlap(a, b)) / total
  if (upper < min) return { ratio: null, upper }
  const d = editDistance(a, b, Math.floor((1 - min) * total))
  return d === null ? { ratio: null, upper } : { ratio: 1 - d / total, upper }
}

/** 第一個不同的位置和前後文，給人看差在哪裡 */
export function firstDiff(a, b, span = 30) {
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  if (i === a.length && i === b.length) return null
  const from = Math.max(0, i - 10)
  return { at: i, expected: a.slice(from, i + span), actual: b.slice(from, i + span) }
}

// --- 連結與卡片 ----------------------------------------------------------------

export const POST_URL_RE = /^\/[^/]+\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/

function safeDecodeURI(s) {
  try { return decodeURI(s) } catch { return s }
}

/** 站內連結正規化：去掉 https://www.casper.tw、查詢字串與 #，percent-encoding 統一成 encodeURI 的寫法 */
export function normalizeHref(href) {
  let h = (href ?? '').trim()
  if (h.startsWith(SITE + '/')) h = h.slice(SITE.length)
  if (!h.startsWith('/') || h.startsWith('//')) return null
  h = h.replace(/[?#].*$/, '')
  return encodeURI(safeDecodeURI(h))
}

/** <main> 裡所有連到文章的連結，照出現順序，連續重複的只留一個（卡片的標題和封面常連到同一篇） */
export function postLinks(html) {
  const out = []
  for (const a of findTags(stripHidden(mainOf(html)), 'a')) {
    const u = normalizeHref(a.href)
    if (u && POST_URL_RE.test(u) && out[out.length - 1] !== u) out.push(u)
  }
  return out
}

/** <main> 裡符合 pattern 的站內連結集合（正規化後） */
export function linkSet(html, pattern) {
  const out = new Set()
  for (const a of findTags(stripHidden(mainOf(html)), 'a')) {
    const u = normalizeHref(a.href)
    if (u && pattern.test(u)) out.add(u)
  }
  return out
}

/** Hexo（casper-2026）列表頁的卡片：<article class="card"> 裡 h2 的連結和 <p class="excerpt"> */
export function hexoCards(html) {
  const main = stripHidden(mainOf(html))
  const parts = main.split('<article class="card">').slice(1)
  return parts.map((part) => {
    const h2 = part.indexOf('<h2')
    const a = findTags(h2 === -1 ? part : part.slice(h2), 'a')[0]
    const ex = /<p class="excerpt">([\s\S]*?)<\/p>/.exec(part)
    return { url: normalizeHref(a?.href), excerpt: ex ? textOf(ex[1]) : null }
  })
}

/**
 * VitePress 列表頁的卡片（lib/cards.mjs 的 class）：每個 class 含 post-card 的元素是一張卡，
 * 連結取 post-card__title（本身是 <a> 或裡面第一個 <a>），摘要取 post-card__excerpt 的文字。
 */
export function builtCards(html) {
  const main = stripHidden(mainOf(html))
  const tags = startTags(main)
  const starts = tags.filter((t) => hasClass(t.attrs, 'post-card'))
  return starts.map((card, i) => {
    const stop = i + 1 < starts.length ? starts[i + 1].index : main.length
    const inside = tags.filter((t) => t.index > card.index && t.index < stop)
    const title = inside.find((t) => hasClass(t.attrs, 'post-card__title'))
    const link = title && (title.name === 'a' ? title : inside.find((t) => t.index >= title.index && t.name === 'a'))
    const ex = inside.find((t) => hasClass(t.attrs, 'post-card__excerpt'))
    return { url: normalizeHref(link?.attrs.href), excerpt: ex ? textOf(innerOf(main, ex)) : null }
  })
}

// --- 錨點與內容輪廓 -------------------------------------------------------------

/** <main> 裡所有元素的 id（標題的 id，也包含例外用的空 <span id>） */
export function idsIn(html) {
  return new Set(startTags(stripHidden(mainOf(html))).map((t) => t.attrs.id).filter((id) => id != null))
}

/** 本文裡有 id 的標題，照順序 */
export const headingIdsOf = (articleHtml) => headings(articleHtml).filter((h) => h.id !== null).map((h) => h.id)

/** 本文裡的站內 # 連結（不含標題自己的錨點），回傳解碼後的目標 id */
export function hashLinks(articleHtml) {
  const out = []
  for (const a of findTags(stripHidden(articleHtml), 'a')) {
    if (!a.href || !a.href.startsWith('#') || a.href === '#') continue
    if (hasClass(a, 'headerlink') || hasClass(a, 'header-anchor')) continue
    let id = a.href.slice(1)
    try { id = decodeURIComponent(id) } catch { /* 保留原樣 */ }
    out.push(id)
  }
  return out
}

// 區塊元素：<br> 緊鄰它們的開頭或結尾時不會多出一行（或是根本不顯示，像 <video> 裡的 <br>）
const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'audio', 'blockquote', 'dd', 'details', 'div', 'dl', 'dt', 'figcaption', 'figure',
  'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'iframe', 'li', 'main', 'nav', 'object', 'ol', 'p',
  'picture', 'pre', 'section', 'source', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'track', 'ul', 'video',
])
// 自己就是內容的行內元素：<br> 夾在它們和文字之間時是真的換行
const CONTENT_TAGS = new Set(['img', 'svg', 'input', 'button', 'textarea', 'select', 'canvas', 'embed'])

/**
 * 段落裡真正的換行：前後最近的內容都是文字或行內內容（<img> 等）的 <br>，連續的 <br> 各算一個。
 * 緊鄰區塊開頭或結尾的 <br> 不算：Hexo（marked，breaks: true）在程式碼區塊前後、<!-- more --> 前、
 * 原始 HTML 的 <video> 裡都會多一個 <br>，畫面上沒有多一行，新版不需要照抄。<pre> 裡的不算。
 */
export function softBreaks(html) {
  const h = stripHidden(html).replace(/<pre\b[\s\S]*?<\/pre\s*>/gi, '<pre></pre>')
  const tokens = []
  for (const m of h.matchAll(/<(\/?)([a-zA-Z][\w-]*)\b[^>]*>|[^<]+|</g)) {
    if (m[2]) {
      const name = m[2].toLowerCase()
      if (name === 'br') tokens.push('br')
      else if (BLOCK_TAGS.has(name)) tokens.push('block')
      else if (!m[1] && CONTENT_TAGS.has(name)) tokens.push('content')
    } else if (decodeEntities(m[0].replace(/&(?:ZeroWidthSpace|#8203|#x200b);/gi, '')).replace(/[\s\u200b]/g, '')) tokens.push('content')
  }
  let n = 0
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== 'br') continue
    let a = i - 1
    while (a >= 0 && tokens[a] === 'br') a--
    let b = i + 1
    while (b < tokens.length && tokens[b] === 'br') b++
    if (tokens[a] === 'content' && tokens[b] === 'content') n++
  }
  return n
}

const LIST_TAG_RE = new RegExp(`<(\\/?)(ol|ul|li)\\b(${TAG_BODY})>`, 'gi')

/**
 * 清單結構：照出現順序列出 <ul>、<ol> 的開始（「ul(」「ol(」）與結束（「)」），以及每個 <li> 的層級與編號：
 * <ol> 裡是「層級#編號」（編號從 start 屬性起算），<ul> 裡是「層級*」，不在清單裡的 <li> 是「0*」。<pre> 裡的不算。
 * 例：<ol start="5"><li>a<ol><li>b</li></ol></li></ol> → ['ol(', '1#5', 'ol(', '2#1', ')', ')']。
 * marked 與 CommonMark 對子清單縮排的規則不同（marked 縮 2 格就算巢狀，CommonMark 要對齊上一層的內容欄），
 * 兩段清單中間只隔空行時 CommonMark 也會合成一個，這些差異文字指紋看不出來，要比這一項。
 */
export function listProfile(articleHtml) {
  const h = stripHidden(articleHtml).replace(/<pre\b[\s\S]*?<\/pre\s*>/gi, '')
  const stack = []
  const out = []
  for (const m of h.matchAll(LIST_TAG_RE)) {
    const close = m[1] === '/'
    const name = m[2].toLowerCase()
    if (name === 'li') {
      if (close) continue
      const top = stack[stack.length - 1]
      out.push(!top ? '0*' : top.type === 'ol' ? `${stack.length}#${top.n++}` : `${stack.length}*`)
    } else if (close) {
      if (stack.length) stack.pop()
      out.push(')')
    } else {
      const start = name === 'ol' ? parseInt(parseAttrs(m[3]).start ?? '1', 10) : 1
      stack.push({ type: name, n: Number.isFinite(start) ? start : 1 })
      out.push(`${name}(`)
    }
  }
  return out
}

/**
 * 本文的結構輪廓：<pre>、<br>、<img> 的數量，段落裡真正的換行（softBreaks），
 * 粗體與斜體（<strong>、<em>）的數量，程式碼以外照字面顯示的 * 與 _（marks），
 * <pre> 以外的 inline code 文字（去空白），以及清單結構（listProfile）。
 * marks 變多通常是 Markdown 的強調沒生效：CommonMark（markdown-it）規定 ** 緊貼全形標點、底線夾在字中間時不算強調，
 * Hexo 的 marked 算，畫面上就會多出星號或底線。
 */
export function contentProfile(articleHtml) {
  const h = stripHidden(articleHtml)
  const count = (re) => (h.match(re) ?? []).length
  const noPre = h.replace(/<pre\b[\s\S]*?<\/pre\s*>/gi, '')
  const noCode = noPre.replace(/<code\b[^>]*>[\s\S]*?<\/code\s*>/gi, '')
  return {
    pre: count(/<pre\b/gi),
    br: count(/<br\b/gi),
    softBr: softBreaks(h),
    img: count(/<img\b/gi),
    emphasis: (noPre.match(/<(strong|em)\b/gi) ?? []).length,
    marks: (textOf(noCode).match(/[*_]/g) ?? []).length,
    inlineCode: [...noPre.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code\s*>/gi)].map((m) => textOf(m[1]).replace(/\s+/g, '')),
    lists: listProfile(h),
  }
}

/** head 裡 cssdemo 的樣式連結（https://img.casper.tw/demoFile/...） */
export function demoCssLinks(html) {
  return findTags(headOf(html), 'link').map((l) => l.href ?? '').filter((h) => h.includes('/demoFile/')).sort()
}

/** 所有 JSON-LD 的 @type（含陣列與 @graph 裡的），解析失敗的 script 記成 INVALID_JSON */
export function jsonLdNodes(html) {
  const nodes = []
  let invalid = 0
  for (const m of headOf(html).matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script\s*>/gi)) {
    let data
    try { data = JSON.parse(m[1]) } catch { invalid++; continue }
    const walk = (o) => {
      if (Array.isArray(o)) return o.forEach(walk)
      if (!o || typeof o !== 'object') return
      if (o['@type']) nodes.push(o)
      if (o['@graph']) walk(o['@graph'])
    }
    walk(data)
  }
  return { nodes, invalid }
}

// --- 外語首頁、語言選單、工具組（主站首頁規格 J.1） ---------------------------------
// DOM 照共用頁首頁尾（theme/shared/shell/SiteHeader.vue、SiteFooter.vue、LanguageMenu.vue）與 pages/SiteHomePage.vue。

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])

/** 開始標籤 t（startTags 的一筆）的整個元素，同名標籤照巢狀層數配對結束標籤；void 元素只有開始標籤 */
export function outerHtmlOf(html, t) {
  if (VOID_TAGS.has(t.name)) return html.slice(t.index, t.end)
  const re = new RegExp(`<(/?)${t.name}\\b${TAG_BODY}>`, 'gi')
  re.lastIndex = t.end
  let depth = 1
  for (let m = re.exec(html); m; m = re.exec(html)) {
    if (!m[1]) depth++
    else if (--depth === 0) return html.slice(t.index, m.index + m[0].length)
  }
  return html.slice(t.index)
}

/** 符合 pred(開始標籤) 的元素：[{ name, attrs, index, outer, inner }]，照出現順序（巢狀的也列） */
export function elementsWhere(html, pred) {
  return startTags(html).filter(pred).map((t) => {
    const outer = outerHtmlOf(html, t)
    const inner = VOID_TAGS.has(t.name) ? '' : outer.slice(t.end - t.index, Math.max(t.end - t.index, outer.lastIndexOf('</')))
    return { name: t.name, attrs: t.attrs, index: t.index, outer, inner }
  })
}

/** 版面根元素（#app 裡第一個元素）的 class token；找不到是 [] */
export function rootClassesOf(html) {
  const m = /<div\b[^>]*\bid=["']app["'][^>]*>/.exec(html)
  if (!m) return []
  const rest = html.slice(m.index + m[0].length).replace(/^(?:\s|<!--[\s\S]*?-->)+/, '')
  const first = startTags(rest)[0]
  return first && first.index === 0 ? (first.attrs.class ?? '').split(/\s+/).filter(Boolean) : []
}

/** head 的 <link rel="alternate" hreflang>：[{ hreflang, href }]，照出現順序 */
export function hreflangLinksOf(html) {
  return findTags(headOf(html), 'link').filter((l) => relHas(l.rel, 'alternate') && 'hreflang' in l).map((l) => ({ hreflang: l.hreflang, href: l.href ?? '' }))
}

/** head 的 og:locale 與 og:locale:alternate */
export function ogLocalesOf(html) {
  const metas = findTags(headOf(html), 'meta')
  const of = (key) => metas.filter((m) => (m.property ?? '').toLowerCase() === key).map((m) => m.content ?? '')
  return { locale: of('og:locale'), alternates: of('og:locale:alternate') }
}

const SEQUENCE_META_PROPS = /^og:/
/**
 * head 裡外語首頁 D.2 列的元素，照出現順序，各寫成「key=值」：title、description、canonical、hreflang、og:*、jsonld（只記 @type）。
 * twitter:card、fb:app_id、Atom、字型、AdSense meta 這些 siteHead 照留的項目不列
 */
export function siteHomeHeadSequence(html) {
  const head = headOf(html)
  const out = []
  for (const m of head.matchAll(new RegExp(`<(title|meta|link|script)\\b(${TAG_BODY})>`, 'gi'))) {
    const name = m[1].toLowerCase()
    const a = parseAttrs(m[2])
    if (name === 'title') {
      const t = /^([\s\S]*?)<\/title\s*>/i.exec(head.slice(m.index + m[0].length))
      out.push(`title=${decodeEntities(t?.[1] ?? '').replace(/\s+/g, ' ').trim()}`)
    } else if (name === 'meta' && (a.name ?? '').toLowerCase() === 'description') out.push(`description=${a.content ?? ''}`)
    else if (name === 'meta' && (a.name ?? '').toLowerCase() === 'robots') out.push(`robots=${a.content ?? ''}`)
    else if (name === 'meta' && SEQUENCE_META_PROPS.test(a.property ?? '')) out.push(`${a.property}=${a.content ?? ''}`)
    else if (name === 'link' && relHas(a.rel, 'canonical')) out.push(`canonical=${a.href ?? ''}`)
    else if (name === 'link' && relHas(a.rel, 'alternate') && 'hreflang' in a) out.push(`hreflang:${a.hreflang}=${a.href ?? ''}`)
    else if (name === 'script' && (a.type ?? '').toLowerCase() === 'application/ld+json') {
      const body = /^([\s\S]*?)<\/script\s*>/i.exec(head.slice(m.index + m[0].length))?.[1] ?? ''
      let types = 'INVALID_JSON'
      try { types = [JSON.parse(body)].flat().map((o) => o['@type']).join(',') } catch { /* 留著 INVALID_JSON */ }
      out.push(`jsonld=${types}`)
    }
  }
  return out
}

/** 一段 HTML 裡的 <a>：[{ href, hreflang, lang, attrs, inner, text }]；lang 是 <a> 自己的 lang */
export function anchorsIn(html) {
  return elementsWhere(html, (t) => t.name === 'a').map((e) => ({ href: e.attrs.href ?? null, hreflang: e.attrs.hreflang ?? null, lang: e.attrs.lang ?? null, attrs: e.attrs, inner: e.inner, text: textOf(e.inner) }))
}

const squash = (s) => decodeEntities(stripHidden(s).replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ')

/** 工具名那一段：{before}<span lang data-foreign>{label}</span>{after}；沒有 span 時整段是名稱 */
function splitToolName(html) {
  const span = startTags(html).find((t) => t.name === 'span')
  if (!span) return { before: '', label: squash(html).trim(), lang: null, after: '' }
  const outer = outerHtmlOf(html, span)
  return {
    before: squash(html.slice(0, span.index)).trim(),
    label: squash(outer).trim(),
    lang: span.attrs.lang || null,
    after: squash(html.slice(span.index + outer.length)).trim(),
  }
}

/**
 * 工具連結：頁尾工具組的 <a>，或 #tools 的卡片（a.cs-toolcard 裡的 .cs-toolcard__name 與 .cs-toolcard__sum）。
 * [{ href, hreflang, label, lang, before, after, summary, img }]，before、after 去掉前後空白；img 是連結裡第一張 <img> 的 src（沒有是 null）
 */
export function toolLinksIn(html) {
  return elementsWhere(html, (t) => t.name === 'a').map(toolLinkOf)
}

/** 一個 <a> 元素（elementsWhere 的一筆）的工具連結形狀，toolLinksIn 與 toolCardsIn 共用 */
function toolLinkOf(e) {
  const name = elementsWhere(e.inner, (t) => hasClass(t.attrs, 'cs-toolcard__name'))[0]
  const sum = elementsWhere(e.inner, (t) => hasClass(t.attrs, 'cs-toolcard__sum'))[0]
  const img = elementsWhere(e.inner, (t) => t.name === 'img')[0]
  return { href: e.attrs.href ?? null, hreflang: e.attrs.hreflang ?? null, ...splitToolName(name ? name.inner : e.inner), summary: sum ? squash(sum.inner).trim() : null, img: img ? (img.attrs.src ?? null) : null }
}

/** <img> 的 { src, width, height }；width、height 轉成數字，沒寫或不是數字時是 null */
const imageOf = (e) => {
  const num = (v) => (/^\d+$/.test(v ?? '') ? Number(v) : null)
  return { src: e.attrs.src ?? null, width: num(e.attrs.width), height: num(e.attrs.height) }
}
const firstWithClass = (html, cls, pred = () => true) => elementsWhere(html, (t) => hasClass(t.attrs, cls) && pred(t))[0] ?? null

/**
 * 介紹區塊 div.cs-toolfeature 的內容（主站首頁規格 E.1）：
 * { intro, highlights, cta: { href, hreflang, text }, art: { src, width, height }, deco: [{ src, width, height }] }。
 * intro 是 .cs-toolfeature__intro 的文字，highlights 是 .cs-toolfeature__points 每個 <li> 的文字，cta 是 a.cs-toolfeature__cta，
 * art 是區塊裡 a.cs-toolcard 的第一張圖，deco 是 .cs-toolfeature__strip 裡的圖；找不到的欄位是 null 或空陣列
 */
export function toolFeatureOf(block) {
  const html = block.inner
  const intro = firstWithClass(html, 'cs-toolfeature__intro')
  const points = firstWithClass(html, 'cs-toolfeature__points')
  const cta = firstWithClass(html, 'cs-toolfeature__cta', (t) => t.name === 'a')
  const card = firstWithClass(html, 'cs-toolcard', (t) => t.name === 'a')
  const art = card ? elementsWhere(card.inner, (t) => t.name === 'img')[0] : null
  const strip = firstWithClass(html, 'cs-toolfeature__strip')
  return {
    intro: intro ? squash(intro.inner).trim() : null,
    highlights: points ? elementsWhere(points.inner, (t) => t.name === 'li').map((li) => squash(li.inner).trim()) : [],
    cta: cta ? { href: cta.attrs.href ?? null, hreflang: cta.attrs.hreflang ?? null, text: squash(cta.inner).trim() } : null,
    art: art ? imageOf(art) : null,
    deco: strip ? elementsWhere(strip.inner, (t) => t.name === 'img').map(imageOf) : [],
  }
}

/** 介紹區塊：class 有 cs-toolfeature 這個 token 的元素（elementsWhere 的形狀），照出現順序（巢狀的也列） */
export const toolFeatureBlocksIn = (html) => elementsWhere(html, (t) => hasClass(t.attrs, 'cs-toolfeature'))

/** a.cs-toolcard 元素（elementsWhere 的形狀），照出現順序 */
export const toolCardElementsIn = (html) => elementsWhere(html, (t) => t.name === 'a' && hasClass(t.attrs, 'cs-toolcard'))

/** blocks（同一段 HTML 的 elementsWhere 結果）裡包住元素 e 的最內層一個，也就是最近的祖先；沒有是 null */
export function blockAround(blocks, e) {
  let near = null
  for (const b of blocks) if (e.index > b.index && e.index < b.index + b.outer.length && (!near || b.index > near.index)) near = b
  return near
}

/**
 * #tools 裡的工具卡：只數 a.cs-toolcard（介紹區塊的按鈕 a.cs-toolfeature__cta 是第二個連到同一頁的連結，不算一張卡）。
 * 每筆是 toolLinksIn 的形狀加 feature：卡片在 div.cs-toolfeature 裡時是最近那個區塊的 toolFeatureOf()，否則是 null。照出現順序。
 * 卡片以外多出來的連結、沒包卡片的介紹區塊這裡看不到，由 audit 的 toolsRegionProblems 另外檢查
 */
export function toolCardsIn(html) {
  const blocks = toolFeatureBlocksIn(html)
  return toolCardElementsIn(html).map((e) => {
    const block = blockAround(blocks, e)
    return { ...toolLinkOf(e), feature: block ? toolFeatureOf(block) : null }
  })
}

/**
 * 語言選單的項目：頁首 details.cs-lang（data-cs-lang）或頁尾 ul.cs-langlist。
 * [{ current, href, hreflang, lang, text, note }]；目前語系是 <span aria-current="true">，沒有 href
 */
export function languageItemsIn(html) {
  return elementsWhere(html, (t) => (t.name === 'a' || t.name === 'span') && (hasClass(t.attrs, 'cs-lang__item') || hasClass(t.attrs, 'cs-langlist__item'))).map((e) => {
    const note = elementsWhere(e.inner, (t) => hasClass(t.attrs, 'cs-lang__note') || hasClass(t.attrs, 'cs-langlist__note'))[0]
    return {
      current: e.attrs['aria-current'] === 'true',
      href: e.name === 'a' ? (e.attrs.href ?? null) : null,
      hreflang: e.attrs.hreflang ?? null,
      lang: e.attrs.lang ?? null,
      text: textOf(note ? e.inner.replace(note.outer, '') : e.inner),
      note: note ? textOf(note.inner) : null,
    }
  })
}
