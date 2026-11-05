// 多語工具與全站首頁的網址純函式。cfg 是工具的 src/tool.config.mjs（slug、rootLocale、xDefaultLocale、locales、previewLocales、pages）。
// 網址形狀：/<slug>/（rootLocale）、/<slug>/<code>/、/<slug>/<code>/<page>/；一律小寫、帶尾斜線，
// 對外（canonical、og:url、hreflang、站內連結）一律寫 SITE_URL 開頭的完整網址。
import { SITE_URL } from '../site.mjs'
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

/** 站內路徑：rootLocale 是 /<slug>/<pagePath>，其他是 /<slug>/<code>/<pagePath>；pagePath 是 '' 或 'about/' */
export function localePath(cfg, code, pagePath = '') {
  getLocale(code)
  checkPagePath(pagePath)
  return code === cfg.rootLocale ? `/${cfg.slug}/${pagePath}` : `/${cfg.slug}/${code}/${pagePath}`
}

/** 完整網址：SITE_URL + localePath(...) */
export const pageUrl = (cfg, code, pagePath = '') => SITE_URL + localePath(cfg, code, pagePath)

/** x-default 指向的語系代碼：pageLocales 有 cfg.xDefaultLocale 就用它，否則用 cfg.rootLocale */
export function resolveXDefault(cfg, pageLocales) {
  return [...pageLocales].includes(cfg.xDefaultLocale) ? cfg.xDefaultLocale : cfg.rootLocale
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

/**
 * 從 dist 的相對路徑推出語系：'sound-effects/ja/about/index.html' → 'ja'；
 * 資產根目錄的 '404.html'（接 /<slug>x 的那份）→ rootLocale。不在 <slug>/ 底下的其他檔案丟錯。
 */
export function localeOfFile(cfg, distRelPath) {
  const rel = String(distRelPath).replace(/\\/g, '/').replace(/^\.?\//, '')
  if (rel === '404.html') return cfg.rootLocale
  const [first, second, ...rest] = rel.split('/')
  if (first !== cfg.slug || second === undefined) throw new Error(`不是這支工具的產物路徑：${distRelPath}`)
  return rest.length && LOCALE[second] ? second : cfg.rootLocale
}
