// 每頁 frontmatter 的 site（主站首頁規格 G.4）：共用頁首頁尾與外語首頁要的資料，全部在 Node 端算好，元件只顯示。
// 只在 Node 端執行（lib/pagedata.mjs），主題不 import。
// 寫入時機：外語首頁（site-home）一律寫（preview 在 shell 'legacy' 時也要有文案，C.3）；其他頁在 effectiveShell() 是 'shared' 時寫
// （S 版起，或任何 preview 建置，lib/pagedata.mjs）。siteHomes 寫 clusterCodes(plan)：live 建置等於 plan.published，preview 建置是 plan.pages。
import { getLocale, sortLocaleCodes } from '../theme/shared/shell/i18n/locales.mjs'
import { localeLink, siteHomeUrl } from '../theme/shared/shell/i18n/urls.mjs'
import { siteName } from '../theme/shared/shell/i18n/seo.mjs'
import { shellStringsFor, ts } from '../theme/shared/shell/i18n/shell-strings.mjs'
import { legalLink } from '../theme/shared/shell/i18n/legal.mjs'
import { siteToolLinks } from '../theme/shared/shell/tools.mjs'
import { brandLang } from '../theme/shared/shell/shell-model.mjs'
import { SITE_URL } from '../theme/shared/shell/site.mjs'
import { SITE_INDEX, clusterCodes, formatHomeCopy, languageTargets, readHomeMessages } from './site-home.mjs'

/**
 * 頁型屬於頁首的哪一區（aria-current="true"）：文章頁、列表、導覽索引算「文章」，關於頁算「關於」。
 * 從 theme/utils/nav.mjs 搬過來；legacy 頁首那份留到 K.3，site-shell.test.mjs 驗兩份結果相同
 */
export function sectionOf(pageType) {
  if (['post', 'blog-index', 'taxonomy-list', 'nav-index'].includes(pageType)) return 'posts'
  if (pageType === 'about') return 'about'
  return ''
}

/** 綁定語系的外殼字串函式 (key, params) => string */
export const textFor = (code) => (key, params) => ts(code, key, params)

/**
 * 外語首頁的文案（已代入佔位符），加上 H1 與幾個 Node 端算好的連結：
 *   h1：{ text: siteName(code), lang: brandLang(code) }（站名的語言跟頁面不同時元件包 <span lang data-foreign>）
 *   hero.toolsHref：https://www.casper.tw/<code>/#tools
 *   links.latest、links.categories、links.about：連到繁中頁，走 localeLink()（連結字接 inChinese、<a> 加 hreflang zh-Hant）
 */
export function siteHomeView(code, { readHome = readHomeMessages } = {}) {
  const file = readHome(code)
  if (!file) throw new Error(`site-home ${code}：沒有 i18n/home/${code}.json`)
  const copy = formatHomeCopy(file, code)
  const text = textFor(code)
  const zh = (href, label) => localeLink(code, { href, label, target: 'zh-tw' }, text)
  return {
    ...copy,
    h1: { text: siteName(code), lang: brandLang(code) },
    hero: { ...copy.hero, toolsHref: `${siteHomeUrl(code)}#tools` },
    links: {
      latest: zh(siteHomeUrl('zh-tw'), copy.articles.latest),
      categories: zh(`${SITE_URL}/categories/`, copy.articles.categories),
      about: zh(legalLink('about', 'zh-tw').href, copy.about.link),
    },
  }
}

/** 404 的多語提示（E.5）：叢集裡每個外語首頁一行，字串用那個語系的外殼字串 */
export function notFoundIntl(plan) {
  return sortLocaleCodes(clusterCodes(plan)).map((code) => {
    const l = getLocale(code)
    return { code, htmlLang: l.htmlLang, hreflang: l.hreflang, title: ts(code, 'notFound.title'), linkText: ts(code, 'notFound.siteHome'), href: siteHomeUrl(code) }
  })
}

/**
 * 一頁的 fm.site（G.4）。
 * @param {{ pageType: string, canonical?: string, locale?: string, plan: object, index?: object, readHome?: Function }} p
 *   locale：site-home 是外語首頁的 code，其他頁是 zh-tw；canonical：本頁網址（404 是 ''）
 */
export function siteFrontmatter({ pageType, canonical = '', locale = 'zh-tw', plan, index = SITE_INDEX, readHome = readHomeMessages }) {
  if (!plan) throw new Error('siteFrontmatter 要傳 plan（lib/site-home.mjs 的 buildSiteHomePlan()）')
  const isHome = pageType === 'site-home'
  const notFound = pageType === 'not-found'
  const page = isHome ? plan.pages.find((p) => p.code === locale) : null
  if (isHome && !page) throw new Error(`site-home ${locale} 不在這次建置的 plan.pages`)
  return {
    locale,
    kind: isHome ? 'site-home' : 'page',
    shell: shellStringsFor(locale),
    tools: siteToolLinks(index, { locale, text: textFor(locale) }),
    // 部落格自己的外語首頁清單：這次建置的叢集（clusterCodes），不讀 tools.json 的 siteHomes（C.1）。
    // live 時就是 plan.published；preview 時是 plan.pages，跟語言選單同一組，外語頁尾的首頁、關於連結照上線後的樣子連
    siteHomes: clusterCodes(plan),
    languages: notFound ? [] : languageTargets({ pageType, canonical, plan, readHome }),
    section: sectionOf(pageType),
    canonical: notFound ? '' : canonical,
    home: isHome ? siteHomeView(locale, { readHome }) : null,
    // preview 建置的外語首頁是 true：seo 加 noindex、Layout 在根元素加 cs-preview（C.3）。頁面上不再放提示條（站長 2026-11-05）
    preview: isHome && page.preview === true,
    notFoundIntl: notFound ? notFoundIntl(plan) : [],
  }
}
