// 頁首頁尾的資料模型（主站首頁規格 G.2）：連結、連結字、語言標示、aria-current 都在這裡算好，SiteHeader.vue、SiteFooter.vue 只顯示。
// 純函式，前後端都能用（不 import node: 模組）：元件在 computed 裡呼叫，Node 端的測試與 audit 也呼叫同一支，連結規則只寫一次。
// text 是已綁定頁面語系的外殼字串函式 (key, params) => string（ts(locale, …) 或 formatShell 包起來的版本）。
import { SITE_NAME } from './site.mjs'
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

function checkKind(locale, kind) {
  getLocale(locale)
  if (!KINDS.includes(kind)) throw new Error(`未知的 kind：${kind}（只有 ${KINDS.join('、')}）`)
  if (kind === 'site-home' && isBlog(locale)) throw new Error(`${locale} 的全站首頁就是部落格首頁 /，不用 kind: 'site-home'`)
}

/**
 * @typedef {(key: string, params?: Record<string, string | number>) => string} TextFn
 * @typedef {{ key: string, href: string, label: string, current: 'page' | 'true' | null }} HeaderNavLink
 * @typedef {{ href: string, label: string, lang: string | null, current: boolean }} HeaderBrand
 */

/**
 * 頁首。規則：
 *   siteNav：BLOG_LOCALES 的頁是 HEADER_SITE_NAV（nav.tools 只在 liveTools 時有）；kind 'site-home' 是一條 footer.tools 連 /<code>/#tools；
 *            其他外語頁沒有（工具自己的頁由元件的 nav prop 接在後面）
 *   current：網址等於 currentUrl 時 'page'，section 相同時 'true'
 *   brand：BLOG_LOCALES 連 SITE_HOME、字是 SITE_NAME、current 一律 false；kind 'site-home' 連 /<code>/、current true；
 *          其他外語頁照 foreignSiteHome()（foreignBrand 預設 FOREIGN_BRAND）：有該語系的全站首頁就連它，沒有就連 toolHome
 * @param {{ locale: string, text: TextFn, kind?: string, currentUrl?: string, section?: string | null, liveTools?: boolean,
 *           siteHomes?: string[], toolHome?: string | null, foreignBrand?: string }} p
 * @returns {{ brand: HeaderBrand, siteNav: HeaderNavLink[] }}
 */
export function headerModel({ locale, text, kind = 'page', currentUrl = '', section = null, liveTools = true, siteHomes = [], toolHome = null, foreignBrand = FOREIGN_BRAND }) {
  checkKind(locale, kind)
  const own = foreignSiteHome(locale, siteHomes, foreignBrand)
  const lang = brandLang(locale)
  const currentOf = (href, sec) => (currentUrl && href === currentUrl ? 'page' : sec && section && sec === section ? 'true' : null)

  if (isBlog(locale)) {
    const siteNav = HEADER_SITE_NAV.filter((n) => liveTools || !n.needsLiveTools).map((n) => {
      const href = (n.legal ? legalLink(n.legal, locale)?.href : n.href) ?? SITE_HOME
      return { key: n.key, href, label: text(n.key), current: currentOf(href, n.section) }
    })
    return { brand: { href: SITE_HOME, label: SITE_NAME, lang, current: false }, siteNav }
  }
  if (kind === 'site-home') {
    const home = siteHomeUrl(locale)
    return {
      brand: { href: home, label: siteName(locale), lang, current: true },
      siteNav: [{ key: 'footer.tools', href: `${home}#tools`, label: text('footer.tools'), current: null }],
    }
  }
  return { brand: { href: own ?? toolHome ?? SITE_HOME, label: siteName(locale), lang, current: false }, siteNav: [] }
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
 * @param {{ locale: string, text: TextFn, kind?: string, currentUrl?: string, siteTools?: import('./tools.mjs').SiteToolLink[],
 *           siteHomes?: string[], toolName?: string, toolNav?: ToolNavLink[] }} p
 * @returns {{ groups: FooterGroup[], site: FooterLink[], legal: FooterLink[], tagline: string | null,
 *             signature: FooterSignature | null, copyright: string | null }}
 */
export function footerModel({ locale, text, kind = 'page', currentUrl = '', siteTools = [], siteHomes = [], toolName = '', toolNav = [] }) {
  checkKind(locale, kind)
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
    }
  }

  // 外語頁：連到別的語言時接 inChinese 或 inEnglish、加目的地的 hreflang（urls.mjs 的 localeLink）
  const toLocale = (key, href, target, exact) => {
    const l = localeLink(locale, { href, label: text(key), target, exact }, text)
    return link(key, l.href, l.label, { hreflang: l.hreflang, current: !!currentUrl && l.href === currentUrl })
  }
  const toLegal = (key, kindName) => {
    const l = legalLink(kindName, locale)
    return l ? [toLocale(key, l.href, l.exact ? locale : BLOG_LOCALES[0], l.exact)] : []
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
  return { groups, site, legal, tagline: null, signature: null, copyright: text('footer.copyright') }
}
