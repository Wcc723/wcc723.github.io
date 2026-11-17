// 多語工具與全站首頁的網址純函式。cfg 是工具的 src/tool.config.mjs（slug、rootLocale、xDefaultLocale、locales、previewLocales、pages，
// 子網域工具另有 origin、basePath）。
// 網址形狀：<base>（rootLocale）、<base><code>/、<base><code>/<page>/；一律小寫、帶尾斜線，
// 對外（canonical、og:url、hreflang、站內連結）一律寫 <origin> 開頭的完整網址。
//   www 的工具：origin、basePath 都不寫，origin 是 SITE_URL，base 是 /<slug>/（每支工具到 2026-11-17 都是這種，輸出逐字不變）
//   子網域工具：origin 'https://<host>'（projects.json 的 host，例如 https://illustrations.casper.tw），basePath '/'
//     （決策 0015，站長 2026-11-17 選 1A）。slug 照舊是 GA4 content_group、tools.json 的 key、scan-paths 的永久保留字，
//     也是產物檔名的第一段（見下面「產物檔名」）
import { SITE_URL, isSubdomainHost } from '../site.mjs'
import { BLOG_LOCALES, LOCALE, getLocale, sortLocaleCodes as sortCodes } from './locales.mjs'

// 全站首頁 / 的語系：部落格的繁中首頁就是 /，不產生 /zh-tw/（主站首頁規格 B.2）
const SITE_ROOT_LOCALE = BLOG_LOCALES[0]

/** 單語工具：只開一個語系，而且沒有 previewLocales。不輸出 hreflang、語言選單、og:locale:alternate、_redirects 別名 */
export const isSingleLocale = (cfg) => cfg.locales.length === 1 && (cfg.previewLocales ?? []).length === 0

/** 子頁 slug 不能用的形式：2 個字母、xx-xx、xx-xxxx。之後加語系就不必改網址 */
export const isLocaleLikeSegment = (seg) => /^[a-z]{2}$|^[a-z]{2}-[a-z]{2,4}$/.test(seg)

const checkPagePath = (pagePath) => {
  if (pagePath === '') return
  if (typeof pagePath !== 'string' || pagePath.startsWith('/') || !pagePath.endsWith('/')) {
    throw new Error(`pagePath 要是 '' 或 'about/' 這種以 / 結尾、不以 / 開頭的路徑：${JSON.stringify(pagePath)}`)
  }
}

/**
 * 工具的對外 origin：cfg.origin 沒寫是 SITE_URL；子網域工具寫 'https://<host>'（host 要過 isSubdomainHost，不帶路徑與尾斜線）。
 * 寫錯就丟錯，不默默退回 www
 */
export function toolOrigin(cfg) {
  const o = cfg.origin
  if (o === undefined || o === null || o === SITE_URL) return SITE_URL
  const host = typeof o === 'string' && o.startsWith('https://') ? o.slice('https://'.length) : null
  if (!isSubdomainHost(host)) throw new Error(`origin 要是 ${SITE_URL} 或 https://<名稱>.casper.tw（不帶路徑與尾斜線）：${JSON.stringify(o)}`)
  return o
}

/**
 * 工具網址的前綴：cfg.basePath 沒寫是 '/<slug>/'；子網域工具寫 '/'。一定以 / 開頭與結尾，每段小寫英數字與單一連字號。
 * origin 是 www（SITE_URL）時只能是 '/<slug>/'：www 上的工具只住在自己的 slug 底下（AGENTS.md 鐵則）
 */
export function toolBasePath(cfg) {
  const own = `/${cfg.slug}/`
  const b = cfg.basePath
  if (b === undefined || b === null) return own
  if (typeof b !== 'string' || !/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)*$/.test(b)) throw new Error(`basePath 要是 '/' 或 '/<段>/' 這種以 / 開頭與結尾的小寫路徑：${JSON.stringify(b)}`)
  if (b !== own && toolOrigin(cfg) === SITE_URL) throw new Error(`www 的工具 basePath 只能是 ${own}（要放在根目錄的是子網域工具，另寫 origin）：${JSON.stringify(b)}`)
  return b
}

/** 站內路徑：rootLocale 是 <base><pagePath>，其他是 <base><code>/<pagePath>；base 是 toolBasePath(cfg)，pagePath 是 '' 或 'about/' */
export function localePath(cfg, code, pagePath = '') {
  getLocale(code)
  checkPagePath(pagePath)
  const base = toolBasePath(cfg)
  return code === cfg.rootLocale ? `${base}${pagePath}` : `${base}${code}/${pagePath}`
}

/** 完整網址：toolOrigin(cfg) + localePath(...)；www 的工具就是 SITE_URL + /<slug>/… */
export const pageUrl = (cfg, code, pagePath = '') => toolOrigin(cfg) + localePath(cfg, code, pagePath)

/**
 * x-default 指向的語系代碼：pageLocales 有 cfg.xDefaultLocale 就用它，其次 cfg.rootLocale；兩個都沒有回 null（不輸出 x-default）。
 * 一般的頁一定有 rootLocale（J31 超集合），只有豁免 J31 的頁（插圖站的意圖套組頁，page.rootOptional）會回 null
 */
export function resolveXDefault(cfg, pageLocales) {
  const codes = [...pageLocales]
  if (codes.includes(cfg.xDefaultLocale)) return cfg.xDefaultLocale
  return codes.includes(cfg.rootLocale) ? cfg.rootLocale : null
}

// published：這次建置每頁實際發布的語系，{ [page.id]: ['zh-tw', 'en', …] }（陣列或 Set 都可以；Map 也收）
const publishedOf = (published, id) => {
  const v = published instanceof Map ? published.get(id) : published?.[id]
  return v ? [...v] : []
}
const homePageOf = (cfg) => {
  const home = cfg.pages.find((p) => p.path === '')
  if (!home) throw new Error('tool.config.mjs 的 pages 沒有首頁（path: \'\'）')
  return home
}

/**
 * hreflang 的組：多語工具回這頁實際發布的語系 [{ code, hreflang, href }]，照 LOCALES 順序，至少 1 筆；單語工具回 []。
 * 永遠不收錄的頁（indexing: 'never'）、404 不要呼叫，由呼叫端決定。
 */
export function alternatesFor(cfg, page, published) {
  if (isSingleLocale(cfg)) return []
  const codes = sortCodes(publishedOf(published, page.id))
  if (!codes.length) throw new Error(`頁面 ${page.id} 沒有任何發布的語系`)
  return codes.map((code) => ({ code, hreflang: LOCALE[code].hreflang, href: pageUrl(cfg, code, page.path) }))
}

/**
 * 語言選單的目標：列出首頁有發布的每個語系（照 LOCALES 順序，包含 current 自己），回 [{ code, href, exact, preview }]。
 * 該語系沒有這頁就連它的工具首頁，exact 為 false（選單標 data-fallback，並用目標語系的 lang.homeOnly 說明）。
 * preview 為 true 代表這個語系只在 previewLocales（選單標 data-preview）。單語工具回 []。
 */
export function switchTargets(cfg, page, current, published) {
  if (isSingleLocale(cfg)) return []
  const home = homePageOf(cfg)
  const listed = sortCodes(publishedOf(published, home.id))
  const here = new Set(publishedOf(published, page.id))
  if (!here.has(current)) throw new Error(`頁面 ${page.id} 沒有發布 ${current}，不能當目前語系`)
  const previewOnly = new Set((cfg.previewLocales ?? []).filter((c) => !cfg.locales.includes(c)))
  return listed.map((code) => {
    const exact = here.has(code)
    return { code, href: pageUrl(cfg, code, exact ? page.path : home.path), exact, preview: previewOnly.has(code) }
  })
}

// ── 全站首頁、退路、語言標示（主站首頁規格 D.3）──────────────────────────────

/** 全站首頁網址：'zh-tw' 是 https://www.casper.tw/，其他是 https://www.casper.tw/<code>/。code 不在登錄表丟錯 */
export function siteHomeUrl(code) {
  getLocale(code)
  return code === SITE_ROOT_LOCALE ? `${SITE_URL}/` : `${SITE_URL}/${code}/`
}

/**
 * 簡中與其他沒對上 zh-Hant 的中文使用者，要不要多一條 hreflang="zh" 指 /（主站首頁規格 M.1 第 2 題）。
 * true：站長 2026-11-04 選 A。要改成 B 時改成 false，只動這一行與測試
 */
export const ZH_CATCHALL = true

/**
 * 首頁叢集：codes 是已上線的外語首頁（不含 zh-tw）。回 [{ code, hreflang, href }]，照 LOCALES 排序；
 * zh-tw 的 /（hreflang zh-Hant）後面緊接 zhCatchall 為 true 時的一條 { code: null, hreflang: 'zh', href: / }。
 * codes 是空陣列回 []（P1 到 SP 的 / 不輸出 hreflang）；codes 不含 en 丟錯（x-default 一定是 /en/）；
 * codes 含 zh-tw 也丟錯（/ 一定存在，不由呼叫端列）
 */
export function siteHomeAlternates(codes, { zhCatchall = ZH_CATCHALL } = {}) {
  const list = sortCodes(codes ?? [])
  if (list.includes(SITE_ROOT_LOCALE)) throw new Error(`siteHomeAlternates 的 codes 不能含 ${SITE_ROOT_LOCALE}：/ 一定在叢集裡，不由呼叫端列`)
  if (!list.length) return []
  if (!list.includes('en')) throw new Error('首頁叢集一定要有 en：x-default 是 /en/，en 沒上線就整組不輸出')
  const out = []
  for (const code of sortCodes([SITE_ROOT_LOCALE, ...list])) {
    out.push({ code, hreflang: LOCALE[code].hreflang, href: siteHomeUrl(code) })
    if (code === SITE_ROOT_LOCALE && zhCatchall) out.push({ code: null, hreflang: 'zh', href: siteHomeUrl(SITE_ROOT_LOCALE) })
  }
  return out
}

// 同語言家族的退路：讀得懂另一種書寫系統的讀者。只有簡中退繁中；繁中不退簡中（沒有「（簡體中文）」這種標示字串）
export const LOCALE_FAMILY = { 'zh-cn': ['zh-tw'] }

/**
 * 找不到同語言的目的地時的退路，全站只有這一份（站長 2026-11-04：外語 default 是英文）。
 * available 是目的地有的語系；回 { code, exact }，exact 代表就是 page 本身的語系。順序：
 *   1. page 自己
 *   2. 同語言家族（LOCALE_FAMILY）：page 是 zh-cn 時先試 zh-tw
 *   3. xDefault（預設 'en'）
 *   4. root
 * 都沒有就丟錯。
 */
export function pickTarget(page, available, { xDefault = 'en', root = null } = {}) {
  getLocale(page)
  const have = new Set(available ?? [])
  for (const c of have) getLocale(c)
  if (have.has(page)) return { code: page, exact: true }
  for (const c of LOCALE_FAMILY[page] ?? []) if (have.has(c)) return { code: c, exact: false }
  if (xDefault && have.has(xDefault)) return { code: xDefault, exact: false }
  if (root && have.has(root)) return { code: root, exact: false }
  throw new Error(`找不到 ${page} 頁可以連的語系：目的地只有 ${[...have].join('、') || '（沒有語系）'}`)
}

/**
 * 某語系的頁要連的全站首頁。siteHomes 是已上線的外語首頁：部落格傳 clusterCodes(plan)（live 建置等於 plan.published，
 * preview 建置是 plan.pages），工具傳 tools.json 的 siteHomes。
 * available = ['zh-tw', ...siteHomes]，root 是 zh-tw、x-default 是 en。回 { href, target, exact }
 */
export function siteHomeLink(code, siteHomes = []) {
  const { code: target, exact } = pickTarget(code, [SITE_ROOT_LOCALE, ...(siteHomes ?? [])], { xDefault: 'en', root: SITE_ROOT_LOCALE })
  return { href: siteHomeUrl(target), target, exact }
}

// 目的地語系對到的語言標示 key：根語系與 x-default 只能是 zh-tw 或 en（主站首頁規格 F.2），所以只有這兩種
export const LOCALE_MARK_KEYS = { 'zh-tw': 'inChinese', en: 'inEnglish' }

/**
 * 連到別的語言的頁時，連結字接語言標示、<a> 加目的地的 hreflang（chineseLink 的一般化）。
 * exact、target 等於 page、或兩者都在 BLOG_LOCALES 時照原樣；target 是 zh-tw 用 inChinese，en 用 inEnglish，其他丟錯。
 * text 是已綁定 page 語系的外殼字串函式 (key, params) => string。回 { href, label, hreflang }（不需要時 hreflang 是 undefined）
 */
export function localeLink(page, { href, label, target, exact = false }, text) {
  getLocale(page)
  getLocale(target)
  if (exact || target === page || (BLOG_LOCALES.includes(page) && BLOG_LOCALES.includes(target))) return { href, label, hreflang: undefined }
  const key = LOCALE_MARK_KEYS[target]
  if (!key) throw new Error(`連到 ${target} 的頁沒有語言標示字串（只有 ${Object.keys(LOCALE_MARK_KEYS).join('、')}）`)
  return { href, label: text(key, { label }), hreflang: LOCALE[target].hreflang }
}

/**
 * 連到繁中頁（部落格、全站頁面、沒有同語言版本的法務頁）的連結（範本規格 G 節）：頁面語系在 BLOG_LOCALES 裡，
 * 或目標本來就是同語言的版本（exact，例如 legalLink() 回的 exact）時照原樣；
 * 其他語系的頁，連結字用 inChinese(label) 接上「（繁體中文）」這類標示，<a> 加繁中的 hreflang。
 * inChinese 由呼叫端傳入已綁定語系的外殼字串函式，這裡不 import 外殼字串（client 只拿當頁語系的字串）。
 * localeLink() 的包裝，輸出不變。回 { href, label, hreflang }（hreflang 不需要時是 undefined）
 */
export function chineseLink(code, { href, label, exact = false }, inChinese) {
  return localeLink(code, { href, label, target: SITE_ROOT_LOCALE, exact }, (_key, params) => inChinese(params.label))
}

// ── 產物檔名 ─────────────────────────────────────────────────────────────────
// 建置、audit、Worker 的資料檔用「產物檔名」認頁：'<slug>/index.html'、'<slug>/<code>/<page>/index.html'，第一段一律是 slug，
// 跟對外網址的前綴無關。www 的工具，產物檔名就是站內路徑去掉開頭的 / 再接 index.html（dist 的實際檔名）；
// 子網域工具（basePath '/'）的網址沒有 slug 段，產物檔名照樣以 slug 開頭：插圖站的頁由 Worker 產生（決策 0017），
// audit、node-host、資料檔都用這個虛擬的形狀，搬到子網域時不必跟著改。
// 網址與產物檔名之間只用 localeFile、fileOfToolPath、fileOfUrl、toolPathOfFile 換算，不要自己拼字串。

const normRel = (p) => String(p).replace(/\\/g, '/').replace(/^\.?\//, '')

/** 一頁的產物檔名：'sound-effects/ja/about/index.html'；子網域工具一樣以 slug 開頭（'illustrations/ja/index.html'） */
export function localeFile(cfg, code, pagePath = '') {
  getLocale(code)
  checkPagePath(pagePath)
  return code === cfg.rootLocale ? `${cfg.slug}/${pagePath}index.html` : `${cfg.slug}/${code}/${pagePath}index.html`
}

/** 站內路徑（localePath 的結果，或請求的 pathname）→ 產物檔名；不在 toolBasePath 底下、或不以 / 結尾回 null */
export function fileOfToolPath(cfg, path) {
  const base = toolBasePath(cfg)
  if (typeof path !== 'string' || !path.startsWith(base) || !path.endsWith('/')) return null
  return `${cfg.slug}/${path.slice(base.length)}index.html`
}

/** 完整網址 → 產物檔名：origin 要等於 toolOrigin(cfg)，路徑在 toolBasePath 底下、帶尾斜線（查詢字串與 # 不看）；其他回 null，不丟錯 */
export function fileOfUrl(cfg, href) {
  let u
  try { u = new URL(href) } catch { return null }
  if (u.origin !== toolOrigin(cfg)) return null
  return fileOfToolPath(cfg, u.pathname)
}

/**
 * 產物檔名 → 站內路徑（fileOfToolPath 的反向）：'<slug>/ja/about/index.html' → '<base>ja/about/'；
 * 不是 index.html 的檔（例如 '<slug>/brand/x.webp'）只換前綴。不在 '<slug>/' 底下丟錯
 */
export function toolPathOfFile(cfg, distRelPath) {
  const rel = normRel(distRelPath)
  if (!rel.startsWith(`${cfg.slug}/`)) throw new Error(`不是這支工具的產物路徑：${distRelPath}`)
  return toolBasePath(cfg) + rel.slice(cfg.slug.length + 1).replace(/(^|\/)index\.html$/, '$1')
}

/**
 * 從產物檔名推出語系：'sound-effects/ja/about/index.html' → 'ja'；
 * 資產根目錄的 '404.html'（接 /<slug>x 的那份）→ rootLocale。不在 <slug>/ 底下的其他檔案丟錯。
 * 子網域工具也傳以 slug 開頭的產物檔名（localeFile、fileOfUrl 的結果），不是網址路徑
 */
export function localeOfFile(cfg, distRelPath) {
  const rel = normRel(distRelPath)
  if (rel === '404.html') return cfg.rootLocale
  const [first, second, ...rest] = rel.split('/')
  if (first !== cfg.slug || second === undefined) throw new Error(`不是這支工具的產物路徑：${distRelPath}`)
  return rest.length && LOCALE[second] ? second : cfg.rootLocale
}
