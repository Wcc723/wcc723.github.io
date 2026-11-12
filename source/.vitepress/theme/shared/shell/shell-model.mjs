// 頁首頁尾的資料模型（主站首頁規格 G.2）：連結、連結字、語言標示、aria-current 都在這裡算好，SiteHeader.vue、SiteFooter.vue 只顯示。
// 純函式，前後端都能用（不 import node: 模組）：元件在 computed 裡呼叫，Node 端的測試與 audit 也呼叫同一支，連結規則只寫一次。
// text 是已綁定頁面語系的外殼字串函式 (key, params) => string（ts(locale, …) 或 formatShell 包起來的版本）。
import { SITE_NAME, SITE_URL } from './site.mjs'
import { BLOG_LOCALES, getLocale } from './i18n/locales.mjs'
import { siteName } from './i18n/seo.mjs'
import { legalLink } from './i18n/legal.mjs'
import { localeLink, siteHomeLink, siteHomeUrl } from './i18n/urls.mjs'
import { FOOTER_BLOG_GROUPS, FOOTER_LEGAL_NAV, FOOTER_SITE_NAV, HEADER_SITE_NAV, SITE_HOME } from './nav.mjs'
import { MARK } from './tools.mjs'

/**
 * 外語工具頁的字標與麵包屑第一層要連哪裡（主站首頁規格 M.1 第 3 題，站長 2026-11-04 選 A，所以是 'site-home'）。
 *   'site-home'：該語系的全站首頁已上線時，字標連 /<code>/，麵包屑第一層是 /<code>/（breadcrumb.home）；沒上線時字標連工具首頁、麵包屑從工具名開始
 *   'tool-home'：一律照 0008 M.1 第 9、10 題，字標連該語系的工具首頁、麵包屑從工具名開始（M.1 第 3 題的 B）
 */
export const FOREIGN_BRAND = 'site-home'
export const FOREIGN_BRANDS = ['tool-home', 'site-home']
export const KINDS = ['page', 'site-home']

const isBlog = (code) => BLOG_LOCALES.includes(code)
const groupId = (key) => key.split('.').at(-1)

/** 站名在這個語系的頁上是不是外語片段：回 'en' 或 null（登錄表 brand 是 en、而且頁面不是 en）。字標、外語首頁的 H1 共用 */
export function brandLang(code) {
  return getLocale(code).brand === 'en' && code !== 'en' ? 'en' : null
}

/**
 * 外語工具頁的全站首頁：foreignBrand 是 'site-home'、頁面不是 BLOG_LOCALES、而且 siteHomes 有這個語系時回 /<code>/，否則 null。
 * 字標（headerModel）與範本的麵包屑第一層、BreadcrumbList（plan.mjs、audit J11）都用這一支，規則只寫一次
 * @param {string} locale
 * @param {string[] | null | undefined} siteHomes  已上線的外語全站首頁（工具傳 tools.json 的 siteHomes）
 * @param {string} [foreignBrand]
 * @returns {string | null}
 */
export function foreignSiteHome(locale, siteHomes, foreignBrand = FOREIGN_BRAND) {
  getLocale(locale)
  if (!FOREIGN_BRANDS.includes(foreignBrand)) throw new Error(`未知的 foreignBrand：${foreignBrand}`)
  if (isBlog(locale) || foreignBrand !== 'site-home') return null
  return (siteHomes ?? []).includes(locale) ? siteHomeUrl(locale) : null
}

/**
 * 頁尾翻譯說明：頁面內容的正本語系（sourceLocale）對到哪個外殼 key（站長 2026-11-10 的 Q9 A）。
 * 表裡的 key 在 shell-strings.mjs 的 audience 一定是 { sourceLocale: <同一個語系> }（測試會驗），只在呼叫端給同一個 ctx 時才拿得到字
 */
export const TRANSLATED_NOTE_KEYS = { en: 'footer.translatedFromEn' }
/** 沒給 sourceLocale 時的正本語系：部落格、全站首頁與正本是繁中的工具（等於 shell-strings.mjs 的 SHELL_SOURCE，測試會驗） */
export const DEFAULT_SOURCE_LOCALE = BLOG_LOCALES[0]

/**
 * 頁尾的翻譯說明，沒有就是 null。規則：
 *   sourceLocale 在 TRANSLATED_NOTE_KEYS（en）：正本以外的每個語系（繁中頁也算）用那個 key，正本語系的頁沒有
 *   sourceLocale 是 DEFAULT_SOURCE_LOCALE（zh-tw）：決策 0010，登錄表 nativeReviewer 是 'ai-cross' 的語系用 footer.translated（以繁中版為準）
 *   其他正本語系還沒有說明的字：丟錯，不讓「以繁中版為準」出現在不是譯自繁中的頁上
 * @param {string} locale
 * @param {TextFn} text
 * @param {string} [sourceLocale]
 * @returns {string | null}
 */
export function translatedNote(locale, text, sourceLocale = DEFAULT_SOURCE_LOCALE) {
  getLocale(locale)
  getLocale(sourceLocale)
  const key = TRANSLATED_NOTE_KEYS[sourceLocale]
  if (key) return locale === sourceLocale ? null : text(key)
  if (sourceLocale !== DEFAULT_SOURCE_LOCALE) {
    throw new Error(`正本是 ${sourceLocale} 的頁還沒有頁尾翻譯說明：先在 shell-strings.mjs 加 { sourceLocale: '${sourceLocale}' } 的 key，再登記到 TRANSLATED_NOTE_KEYS`)
  }
  return getLocale(locale).nativeReviewer === 'ai-cross' ? text('footer.translated') : null
}

function checkKind(locale, kind) {
  getLocale(locale)
  if (!KINDS.includes(kind)) throw new Error(`未知的 kind：${kind}（只有 ${KINDS.join('、')}）`)
  if (kind === 'site-home' && isBlog(locale)) throw new Error(`${locale} 的全站首頁就是部落格首頁 /，不用 kind: 'site-home'`)
}

/**
 * @typedef {(key: string, params?: Record<string, string | number>) => string} TextFn
 * @typedef {{ key: string, href: string, label: string, current: 'page' | 'true' | null }} HeaderNavLink
 * @typedef {{ href: string, label: string, lang: string | null, current: boolean, logo?: string, hub?: { href: string, label: string } }} HeaderBrand
 *   logo、hub 只在有 toolBrand 時有；沒有 logo 時元件用 SHELL_LOGO（全站的小幽靈）。hub 是站名下面那行連回全站首頁的小字
 * @typedef {{ label: string, logo: string, href: string, lang?: string | null }} ToolBrand
 *   工具自己的品牌：label 是頁面語系的站名，logo 是正方形圖的網址，href 是這個語系的工具首頁（完整網址），
 *   lang 是站名的語言跟頁面不同時的語言標籤（例如外語頁放英文站名時給 'en'）
 */

/** 工具品牌頁首的小字：連回全站首頁，字是網域（比照音效庫的 brand__hub，站長 2026-11-12「logo 應該跟 free-sound 一樣，可以回到主頁」） */
export const TOOL_BRAND_HUB_LABEL = new URL(SITE_URL).hostname.replace(/^www\./, '')

/**
 * 工具品牌頁首的小字連到哪個全站首頁：繁中頁是 /；外語頁是該語系已上線的全站首頁 /<code>/，沒有就退 /en/（也沒有就 /）。
 * 不看 foreignBrand：這行字的用途就是回全站首頁
 * @param {string} locale
 * @param {string[] | null | undefined} siteHomes
 */
export function toolBrandHub(locale, siteHomes) {
  if (isBlog(locale)) return SITE_HOME
  const homes = siteHomes ?? []
  return foreignSiteHome(locale, homes, 'site-home') ?? (homes.includes('en') ? siteHomeUrl('en') : SITE_HOME)
}

/**
 * 工具自己的品牌（站長 2026-11-12 決定，第一支是背景音樂站）→ 頁首的 brand。
 * 字標換成工具的 logo 與站名、連 href；在工具首頁（currentUrl 等於 href）時 current；hub 是站名下面連回全站首頁的小字。
 * 欄位不齊就丟錯，讓建置失敗
 * @param {ToolBrand} toolBrand
 * @param {string} currentUrl
 * @param {string} hubHref
 * @returns {HeaderBrand}
 */
function toolBrandOf(toolBrand, currentUrl, hubHref) {
  const { label, logo, href, lang = null } = toolBrand
  for (const [k, v] of Object.entries({ label, logo, href })) {
    if (typeof v !== 'string' || !v.trim()) throw new Error(`toolBrand.${k} 要是非空字串`)
  }
  if (lang !== null && (typeof lang !== 'string' || !lang.trim())) throw new Error('toolBrand.lang 要是語言標籤（例如 en）或 null')
  return { href, label, lang, current: !!currentUrl && currentUrl === href, logo, hub: { href: hubHref, label: TOOL_BRAND_HUB_LABEL } }
}

/**
 * 頁首。規則：
 *   siteNav：BLOG_LOCALES 的頁是 HEADER_SITE_NAV（nav.tools 只在 liveTools 時有）；kind 'site-home' 是一條 footer.tools 連 /<code>/#tools；
 *            其他外語頁沒有（工具自己的頁由元件的 nav prop 接在後面）
 *   current：網址等於 currentUrl 時 'page'，section 相同時 'true'
 *   brand：BLOG_LOCALES 連 SITE_HOME、字是 SITE_NAME、current 一律 false；kind 'site-home' 連 /<code>/、current true；
 *          其他外語頁照 foreignSiteHome()（foreignBrand 預設 FOREIGN_BRAND）：有該語系的全站首頁就連它，沒有就連 toolHome
 *   toolBrand：有給時 brand 換成工具自己的（toolBrandOf：連工具首頁、在工具首頁時 current、多 logo 與 hub），siteNav 不變：
 *          繁中頁照舊有工具、文章、關於，讀者還回得去卡斯伯工具。kind 'site-home' 是全站首頁，不收 toolBrand。
 *          沒給（null、undefined）時回傳值跟沒有這個參數時逐欄相同
 * @param {{ locale: string, text: TextFn, kind?: string, currentUrl?: string, section?: string | null, liveTools?: boolean,
 *           siteHomes?: string[], toolHome?: string | null, foreignBrand?: string, toolBrand?: ToolBrand | null }} p
 * @returns {{ brand: HeaderBrand, siteNav: HeaderNavLink[] }}
 */
export function headerModel({ locale, text, kind = 'page', currentUrl = '', section = null, liveTools = true, siteHomes = [], toolHome = null, foreignBrand = FOREIGN_BRAND, toolBrand = null }) {
  checkKind(locale, kind)
  if (toolBrand && kind === 'site-home') throw new Error("kind 'site-home' 是全站首頁，字標一律是全站站名，不收 toolBrand")
  const own = foreignSiteHome(locale, siteHomes, foreignBrand)
  const lang = brandLang(locale)
  const currentOf = (href, sec) => (currentUrl && href === currentUrl ? 'page' : sec && section && sec === section ? 'true' : null)
  const brandOr = (site) => (toolBrand ? toolBrandOf(toolBrand, currentUrl, toolBrandHub(locale, siteHomes)) : site)

  if (isBlog(locale)) {
    const siteNav = HEADER_SITE_NAV.filter((n) => liveTools || !n.needsLiveTools).map((n) => {
      const href = (n.legal ? legalLink(n.legal, locale)?.href : n.href) ?? SITE_HOME
      return { key: n.key, href, label: text(n.key), current: currentOf(href, n.section) }
    })
    return { brand: brandOr({ href: SITE_HOME, label: SITE_NAME, lang, current: false }), siteNav }
  }
  if (kind === 'site-home') {
    const home = siteHomeUrl(locale)
    return {
      brand: { href: home, label: siteName(locale), lang, current: true },
      siteNav: [{ key: 'footer.tools', href: `${home}#tools`, label: text('footer.tools'), current: null }],
    }
  }
  return { brand: brandOr({ href: own ?? toolHome ?? SITE_HOME, label: siteName(locale), lang, current: false }), siteNav: [] }
}

/**
 * @typedef {object} FooterLink
 * @property {string} key
 * @property {string} href
 * @property {string} label          連結字（已接好語言標示）；工具組是目的地語言的工具名，標示在 before、after
 * @property {string | undefined} hreflang  連到別的語言時是目的地的 hreflang
 * @property {string | null} lang    只有工具組：工具名的語言跟頁面不同時是目的地的 htmlLang
 * @property {string} before
 * @property {string} after
 * @property {boolean} external      站外連結（加外連圖示）
 * @property {boolean} current       aria-current="page"
 *
 * @typedef {{ id: string, title: string, heading: 'h2' | null, links: FooterLink[] }} FooterGroup
 * @typedef {{ before: string, site: string, href: string, after: string }} FooterSignature
 * @typedef {{ label: string, href: string, current?: boolean }} ToolNavLink
 */

const link = (key, href, label, extra = {}) => ({
  key, href, label, hreflang: undefined, lang: null, before: '', after: '', external: false, current: false, ...extra,
})

/**
 * 頁尾。規則（主站首頁規格 E.4、G.2）：
 *   groups 照顯示順序：工具（siteTools 不是空的才有）、這支工具（toolNav）、BLOG_LOCALES 的頁再接 FOOTER_BLOG_GROUPS 四組。
 *     BLOG_LOCALES 的頁每組 heading 'h2'（元件輸出 <nav aria-label><h2>）；外語頁 heading null（元件用 <p class="cs-ftr__h">）。
 *     這支工具那組的標題只當 aria-label，heading 一律 null
 *   site：只有外語頁，FOOTER_SITE_NAV.other。footer.home 用 siteHomeLink 加 localeLink；footer.about 在該語系首頁已上線時連 /<code>/#about
 *   legal：只有外語頁，FOOTER_LEGAL_NAV（Impressum、外部送信要登錄表有旗標、而且有網址）。繁中頁的法務連結在「關於本站」那組
 *   current：工具組照 siteTools 的 current；外語頁的 site、legal 網址等於 currentUrl 時 true；繁中頁四組不標（跟部落格現在相同）
 *   tagline、signature：只有 BLOG_LOCALES；signature 的 site 是 SITE_NAME，href 是繁中關於頁
 *   copyright：BLOG_LOCALES 以外
 *   translated：translatedNote(locale, text, sourceLocale)。sourceLocale 沒給（zh-tw）時照決策 0010：nativeReviewer 'ai-cross' 的語系
 *     「以繁中版為準」，其他 null；正本是 en 的工具傳 'en'：en 以外每個語系（繁中頁也算）「以英文版為準」，en 頁 null
 * @param {{ locale: string, text: TextFn, kind?: string, currentUrl?: string, siteTools?: import('./tools.mjs').SiteToolLink[],
 *           siteHomes?: string[], toolName?: string, toolNav?: ToolNavLink[], sourceLocale?: string }} p
 * @returns {{ groups: FooterGroup[], site: FooterLink[], legal: FooterLink[], tagline: string | null,
 *             signature: FooterSignature | null, copyright: string | null, translated: string | null }}
 */
export function footerModel({ locale, text, kind = 'page', currentUrl = '', siteTools = [], siteHomes = [], toolName = '', toolNav = [], sourceLocale = DEFAULT_SOURCE_LOCALE }) {
  checkKind(locale, kind)
  getLocale(sourceLocale)
  const blog = isBlog(locale)
  const heading = blog ? 'h2' : null
  const homes = siteHomes ?? []
  const groups = []

  if (siteTools?.length) {
    groups.push({
      id: 'tools',
      title: text('footer.tools'),
      heading,
      links: siteTools.map((t) => link(t.slug, t.href, t.label, { hreflang: t.hreflang, lang: t.lang, before: t.before, after: t.after, current: t.current })),
    })
  }
  if (toolNav?.length) {
    groups.push({ id: 'tool', title: toolName, heading: null, links: toolNav.map((n) => link(n.href, n.href, n.label, { current: !!n.current })) })
  }

  if (blog) {
    for (const g of FOOTER_BLOG_GROUPS) {
      groups.push({
        id: groupId(g.key),
        title: text(g.key),
        heading,
        links: g.links.flatMap((n) => {
          const href = n.legal ? legalLink(n.legal, locale)?.href : n.href
          return href ? [link(n.key, href, text(n.key), { external: !!n.external })] : []
        }),
      })
    }
    const parts = text('footer.signature', { site: MARK }).split(MARK)
    if (parts.length !== 2) throw new Error('footer.signature 要剛好有一個 {site}')
    return {
      groups,
      site: [],
      legal: [],
      tagline: text('footer.tagline'),
      signature: { before: parts[0], site: SITE_NAME, href: legalLink('about', BLOG_LOCALES[0]).href, after: parts[1] },
      copyright: null,
      // 部落格與正本是繁中的工具：null（繁中不是 ai-cross）；正本是 en 的工具的繁中頁：以英文版為準
      translated: translatedNote(locale, text, sourceLocale),
    }
  }

  // 外語頁：連到別的語言時接 inChinese 或 inEnglish、加目的地的 hreflang（urls.mjs 的 localeLink）
  const toLocale = (key, href, target, exact) => {
    const l = localeLink(locale, { href, label: text(key), target, exact }, text)
    return link(key, l.href, l.label, { hreflang: l.hreflang, current: !!currentUrl && l.href === currentUrl })
  }
  const toLegal = (key, kindName) => {
    const l = legalLink(kindName, locale)
    if (!l) return []
    const out = toLocale(key, l.href, l.exact ? locale : BLOG_LOCALES[0], l.exact)
    // 同語言的法務頁在別的 repo（site-policies）：外語頁的連結也帶目的地的 hreflang（部落格 audit 的 L13）
    if (l.exact && !BLOG_LOCALES.includes(locale)) out.hreflang = l.hreflang
    return [out]
  }
  const site = FOOTER_SITE_NAV.other.flatMap((n) => {
    if (n.siteHome) {
      const t = siteHomeLink(locale, homes)
      return [toLocale(n.key, t.href, t.target, t.exact)]
    }
    if (n.siteHomeHash && homes.includes(locale)) return [toLocale(n.key, `${siteHomeUrl(locale)}#${n.siteHomeHash}`, locale, true)]
    if (n.legal) return toLegal(n.key, n.legal)
    return [toLocale(n.key, n.href ?? SITE_HOME, BLOG_LOCALES[0], false)]
  })
  const flags = getLocale(locale).legal
  const legal = FOOTER_LEGAL_NAV.flatMap((n) => (n.flag && !(n.flag in flags) ? [] : toLegal(n.key, n.legal)))
  const translated = translatedNote(locale, text, sourceLocale)
  return { groups, site, legal, tagline: null, signature: null, copyright: text('footer.copyright'), translated }
}
