// audit-build.test.mjs 用的測試世界：拿 hexo/ 底下的 Hexo 原始頁（從基準 commit 用 git show 存下來的 9 頁）
// 1. 照 workspace scripts/blog-baseline.mjs 的算法產生迷你基準（pages.json、urls.txt、atom、sitemap、content.json、凍結檔）；
// 2. 模擬 VitePress 產物：同樣的 SEO 欄位與本文，換成新主題的外框（vp-raw、prose、post-foot、post-card、
//    程式碼區塊的複製鈕與語言標籤、標題錨點的零寬字元、直引號），加上新頁、404、assets。
// 這份 dist 應該通過全部檢查；各測試再用 mutate 改壞一個地方，確認對應的檢查會失敗。
// 另有兩份世界（主站首頁規格 J.1）：stage 's'（S 之後：共用頁首頁尾、404 不 hydrate）與 stage 'i1'
// （I1 之後：/en/、/ 的 hreflang、語言選單、一支有英文版的工具、404 的多語提示）。頁首頁尾照共用元件的 DOM 手寫，
// 外語首頁的 head 用 lib/seo.mjs 的 siteHomeHead()、文案用 lib/site-shell.mjs 的 siteHomeView()，跟建置同一份資料。
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SITE, fileToUrl, urlAliases, pageType, extractPage, articleOf, hexoCards, postLinks, mainOf, demoCssLinks,
} from '../lib/extract-page.mjs'
import { SITE_TITLE_LEGACY, ADSENSE_CLIENT, ADSENSE_LOADER_SRC, shouldLoadAds } from '../../source/.vitepress/theme/shared/shell/site.mjs'
import { pageTypeOf } from '../../source/.vitepress/lib/pagetype.mjs'
import { NOT_FOUND_TITLE, NOT_FOUND_DESCRIPTION } from '../../source/.vitepress/theme/head.mjs'
import { expectedSitemap, expectedContentEntry, NEW_PAGES, CATEGORIES_FILE } from '../audit-build.mjs'
import { siteHomeTitle, languageTargets, formatHomeCopy, readHomeMessages } from '../../source/.vitepress/lib/site-home.mjs'
import { siteHomeView, notFoundIntl, textFor } from '../../source/.vitepress/lib/site-shell.mjs'
import { WEBSITE_ID, clusterHead, siteHomeHead } from '../../source/.vitepress/lib/seo.mjs'
import { getLocale } from '../../source/.vitepress/theme/shared/shell/i18n/locales.mjs'
import { LEGAL_DECISIONS, LEGAL_PAGES } from '../../source/.vitepress/theme/shared/shell/i18n/legal.mjs'
import { siteHomeUrl } from '../../source/.vitepress/theme/shared/shell/i18n/urls.mjs'
import { siteName } from '../../source/.vitepress/theme/shared/shell/i18n/seo.mjs'
import { ts } from '../../source/.vitepress/theme/shared/shell/i18n/shell-strings.mjs'
import { siteToolLinks } from '../../source/.vitepress/theme/shared/shell/tools.mjs'
import { brandLang } from '../../source/.vitepress/theme/shared/shell/shell-model.mjs'
import { ga4HeadHtml } from '../../source/.vitepress/theme/shared/shell/analytics.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const HEXO_DIR = path.join(HERE, 'hexo')

/** hexo/ 底下的檔案（樹裡的路徑） */
export function hexoFiles() {
  const out = []
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(HEXO_DIR, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) walk(r)
      else out.push(r)
    }
  }
  walk('')
  return out.sort()
}

export const readHexo = (file) => fs.readFileSync(path.join(HEXO_DIR, file), 'utf8')

const CATEGORIES = JSON.parse(fs.readFileSync(path.join(HERE, '../..', CATEGORIES_FILE), 'utf8')).categories.map((c) => c.name)

// 文章索引（lib/posts.mjs 的形狀），日期從網址取；install-nvm 有 updated
const POSTS = [
  { file: '2021-09-11-css-selector.md', url: '/development/2021/09/11/css-selector/', category: 'development', tags: ['css'] },
  { file: '2015-01-08-2014-year-report.md', url: '/life/2015/01/08/2014-year-report/', category: 'life', tags: ['life'] },
  { file: '2013-09-29-css-target.md', url: '/css/2013/09/29/css-target/', category: 'css', tags: ['css'], cssdemo: ['2013-autumn'] },
  { file: '2022-01-10-install-nvm.md', url: '/development/2022/01/10/install-nvm/', category: 'development', tags: ['javascript', 'nodejs'], updated: '2026-07-09' },
  { file: '2020-01-01-draft.md', url: '/development/2020/01/01/draft/', category: 'development', tags: [], published: false },
].map((p) => ({ date: p.url.split('/').slice(2, 5).join('-'), updated: null, published: true, ads: true, cssdemo: [], ...p }))

const FROZEN = {
  'ads.txt': 'google.com, pub-8296684122088055, DIRECT, f08c47fec0942fa0\n',
  'robots.txt': 'User-agent: *\nAllow: /\n',
  CNAME: 'www.casper.tw\n',
  'search.xml': '<?xml version="1.0"?><search></search>\n',
  'css/style.css': 'body{color:#333}\n',
  'img/casper-avatar.webp': 'RIFF-avatar',
  'img/js-interview-cover.webp': 'RIFF-cover',
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Hexo 本文 → VitePress 的樣子：標題錨點、程式碼外框，文字節點裡的 smartypants 轉換倒回去（typographer 關閉；
 * 標題 id 不動，markdown 模組會模擬 Hexo 的 slugify），install-nvm 的佔位字重新顯示
 */
export function toVitePressProse(prose, url) {
  const unSmarty = (t) => t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/—/g, '---').replace(/–/g, '--').replace(/…/g, '...')
  let h = prose
    .replace(/<a href="#([^"]*)" class="headerlink" title="[^"]*"><\/a>([\s\S]*?)<\/h([1-6])>/g, (m, id, text, lv) => `${text} <a class="header-anchor" href="#${id}" aria-label="Permalink">&#8203;</a></h${lv}>`)
    .replace(/<pre><code class="hljs ([\w-]+)">/g, '<div class="language-$1 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">$1</span><pre class="shiki" tabindex="0"><code>')
    .replace(/<\/code><\/pre>/g, '</code></pre></div>')
    .replace(/>([^<]+)</g, (m, text) => `>${unSmarty(text)}<`)
  if (url.endsWith('/install-nvm/')) h = h.replaceAll('nvm install ：', 'nvm install {{ version }}：')
  return h
}

function jsonLd(type, extra = {}) {
  const graph = {
    post: ['BlogPosting', 'BreadcrumbList'], 'blog-index': ['CollectionPage', 'BreadcrumbList'], 'taxonomy-list': ['CollectionPage', 'BreadcrumbList'],
    'nav-index': ['CollectionPage', 'BreadcrumbList'], about: ['WebPage', 'BreadcrumbList'], legal: ['WebPage', 'BreadcrumbList'],
  }[type]
  if (!graph) return ''
  const nodes = graph.map((t) => (t === 'BlogPosting' ? { '@type': t, ...extra } : { '@type': t }))
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })}</script>`
}

/** P3 在 / 加的 WebSite（I1、multi 世界的首頁用；name 照 M.1 第 1 題的建議） */
export const HOME_WEBSITE_LD = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': WEBSITE_ID, url: `${SITE}/`, name: '卡斯伯工具' })}</script>`

/** 一頁 VitePress 風格的 HTML */
export function builtHtml({ file, title, description, canonical, robots, published, modified, ldExtra, main, adsFalse = false, demoCss = [], tags = [], chrome = LEGACY_CHROME, headTail = '' }) {
  const type = pageTypeOf(file.replace(/\.html$/, '.md'))
  const loader = shouldLoadAds({ type, adsFalse })
  const head = [
    '<meta charset="utf-8">',
    `<title>${esc(title)}</title>`,
    description ? `<meta name="description" content="${esc(description)}">` : '',
    // keywords 照標籤的建立順序，article:tag 依名稱的字碼順序（跟 Hexo 與 lib/seo.mjs 相同）
    tags.length ? `<meta name="keywords" content="${esc(tags.join(','))}">` : '',
    ...[...tags].sort().map((t) => `<meta property="article:tag" content="${esc(t)}">`),
    `<meta name="google-adsense-account" content="${ADSENSE_CLIENT}">`,
    loader ? `<script async src="${ADSENSE_LOADER_SRC}" crossorigin="anonymous"></script>` : '',
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '',
    canonical ? `<meta property="og:url" content="${esc(canonical)}">` : '',
    `<meta property="og:site_name" content="${SITE_TITLE_LEGACY}">`,
    published ? `<meta property="article:published_time" content="${published}">` : '',
    modified ? `<meta property="article:modified_time" content="${modified}">` : '',
    robots ? `<meta name="robots" content="${robots}">` : '',
    ...demoCss.map((href) => `<link rel="stylesheet" href="${href}">`),
    jsonLd(type, ldExtra),
    // VitePress 把 config.head 序列化進每一頁；loader 網址出現在字串裡，但不是 <script src>，不能被算成 loader。
    // router.prefetchLinks 也在站點資料裡（整頁載入，關掉預抓；layout 檢查會看）
    SITE_DATA_SCRIPT,
    headTail,
  ].filter(Boolean).join('\n')
  return pageShell({ lang: 'zh-TW', head, rootClass: `vp-raw site page-type-${type}`, header: chrome.header(file), main, footer: chrome.footer(file) })
}

const SITE_DATA_SCRIPT = `<script>window.__VP_SITE_DATA__=JSON.parse("{\\"head\\":[[\\"script\\",{\\"src\\":\\"${ADSENSE_LOADER_SRC}\\"}]],\\"router\\":{\\"prefetchLinks\\":false}}")</script>`

/** 整頁的外框：版面根元素、跳到主內容、頁首、<main id="main">、頁尾（同 theme/Layout.vue） */
function pageShell({ lang, head, rootClass, header, main, footer }) {
  return `<!DOCTYPE html>\n<html lang="${lang}" dir="ltr">\n<head>\n${head}\n</head>\n<body><div id="app"><!--[--><div class="${rootClass}" data-v-7a1b2c3d><a class="skip-link" href="#main">跳到主要內容</a>${header}<main id="main" class="site-main" tabindex="-1" data-v-7a1b2c3d>${main}</main>${footer}</div><!--]--></div></body>\n</html>\n`
}

/** P1、P2 的部落格頁首頁尾（theme/components/SiteHeader.vue、SiteFooter.vue 的簡化版） */
export const LEGACY_CHROME = {
  header: () => '<header class="site-header"><a href="/">卡斯伯 Blog</a><a href="/categories/">文章</a></header>',
  footer: () => '<footer class="site-footer"><a href="/privacy/">隱私權政策</a></footer>',
}

// --- S、I1 的共用頁首頁尾（theme/shared/shell/SiteHeader.vue、SiteFooter.vue、LanguageMenu.vue 的 DOM） ---------

/** 語言選單：variant 'menu' 是頁首的 details.cs-lang，'list' 是頁尾的 ul.cs-langlist */
export function languageMenuHtml(targets, current, variant = 'menu') {
  if (targets.length < 2) return ''
  const pre = variant === 'menu' ? 'cs-lang' : 'cs-langlist'
  const pageLang = targets.find((t) => t.code === current)?.htmlLang
  const items = targets.map((t) => (t.code === current
    ? `<li><span class="${pre}__item ${pre}__item--current" aria-current="true" lang="${t.htmlLang}">${esc(t.autonym)}</span></li>`
    : `<li><a class="${pre}__item" href="${t.href}" hreflang="${t.hreflang}" lang="${t.htmlLang}"${t.htmlLang !== pageLang ? ' data-foreign' : ''}${t.exact ? '' : ' data-fallback'}>${esc(t.autonym)}${!t.exact && t.homeOnly ? `<span class="${pre}__note"> ${esc(t.homeOnly)}</span>` : ''}</a></li>`)).join('')
  if (variant === 'list') return `<ul class="cs-langlist">${items}</ul>`
  return `<details class="cs-lang" data-cs-lang><summary class="cs-lang__btn" aria-label="語言"><span class="cs-lang__current">${esc(targets.find((t) => t.code === current)?.autonym ?? '')}</span></summary><ul class="cs-lang__list">${items}</ul></details>`
}

/** 工具連結的內容：{before}<span lang data-foreign>{label}</span>{after} */
const toolName = (l) => `${esc(l.before)}${l.lang ? `<span lang="${l.lang}" data-foreign>${esc(l.label)}</span>` : esc(l.label)}${esc(l.after)}`

/** 頁尾工具組 nav.cs-ftr__group--tools；清單空的時候整組不輸出 */
export function footerToolsHtml(links, code) {
  if (!links.length) return ''
  return `<nav class="cs-ftr__group cs-ftr__group--tools" aria-label="${esc(ts(code, 'footer.tools'))}"><p class="cs-ftr__h">${esc(ts(code, 'footer.tools'))}</p><ul class="cs-ftr__links">${links.map((l) => `<li><a href="${l.href}" hreflang="${l.hreflang}">${toolName(l)}</a></li>`).join('')}</ul></nav>`
}

/** 首頁與外語首頁的工具卡（SiteHomePage.vue 的 ul.cs-toolcards） */
export function toolCardsHtml(links) {
  if (!links.length) return ''
  return `<ul class="cs-toolcards">${links.map((l) => `<li><a class="cs-toolcard" href="${l.href}" hreflang="${l.hreflang}"><img class="ghost" src="https://img.casper.tw/brand/ghost/s-${l.ghost || 'spot2'}.webp" alt="" width="340" height="340" loading="lazy"><span class="cs-toolcard__name">${toolName(l)}</span>${l.summary ? `<span class="cs-toolcard__sum">${esc(l.summary)}</span>` : ''}</a></li>`).join('')}</ul>`
}

/**
 * S、I1 世界的頁首頁尾。stage 是 's' 或 'i1'；plan、index、legal 是這個世界的預期值。
 * 繁中頁：字標、導覽（有工具時多「工具」）、語言選單（I1）；頁尾工具組、文章組、語言列（I1）、署名。
 * 外語首頁：字標連自己、導覽一條連 #tools、語言選單；頁尾工具組、全站連結、法務連結（隱私權用 legal 的網址）、語言列。
 */
function sharedChrome({ plan, index, legal }) {
  const urlOf = (file) => SITE + fileToUrl(file)
  const header = (file) => {
    const type = pageTypeOf(file.replace(/\.html$/, '.md'))
    if (type === 'site-home') {
      const code = file.split('/')[0]
      const t = textFor(code)
      const menu = languageMenuHtml(languageTargets({ pageType: type, canonical: siteHomeUrl(code), plan }), code)
      return `<header class="cs-hdr"><div class="cs-hdr__in"><a class="cs-hdr__brand" href="${siteHomeUrl(code)}" aria-current="page"><img class="cs-hdr__logo" src="https://img.casper.tw/brand/ghost/s-logo.webp" width="36" height="36" alt="" decoding="async"><span class="cs-hdr__name"${brandLang(code) ? ` lang="${brandLang(code)}" data-foreign` : ''}>${esc(siteName(code))}</span></a><nav class="cs-hdr__nav" aria-label="${esc(t('nav.label'))}"><a href="${siteHomeUrl(code)}#tools">${esc(t('footer.tools'))}</a></nav><div class="cs-hdr__tools">${menu}</div></div></header>`
    }
    const menu = type === 'not-found' ? '' : languageMenuHtml(languageTargets({ pageType: type, canonical: urlOf(file), plan }), 'zh-tw')
    const tools = index.tools.length ? `<a href="${SITE}/#tools">工具</a>` : ''
    return `<header class="cs-hdr"><div class="cs-hdr__in"><a class="cs-hdr__brand" href="${SITE}/"><img class="cs-hdr__logo" src="https://img.casper.tw/brand/ghost/s-logo.webp" width="36" height="36" alt="" decoding="async"><span class="cs-hdr__name">卡斯伯 Blog</span></a><nav class="cs-hdr__nav" aria-label="主選單">${tools}<a href="${SITE}/categories/">文章</a><a href="${SITE}/about/">關於</a></nav><div class="cs-hdr__tools">${menu}</div></div></header>`
  }
  const footer = (file) => {
    const type = pageTypeOf(file.replace(/\.html$/, '.md'))
    const code = type === 'site-home' ? file.split('/')[0] : 'zh-tw'
    const t = textFor(code)
    const tools = footerToolsHtml(siteToolLinks(index, { locale: code, text: t }), code)
    const langs = type === 'not-found' ? [] : languageTargets({ pageType: type, canonical: type === 'site-home' ? siteHomeUrl(code) : urlOf(file), plan })
    const langRow = langs.length > 1 ? `<nav class="cs-ftr__group cs-ftr__langs" aria-labelledby="cs-ftr-lang"><p id="cs-ftr-lang" class="cs-ftr__h">${esc(t('footer.languages'))}</p>${languageMenuHtml(langs, code, 'list')}</nav>` : ''
    if (type !== 'site-home') {
      return `<footer class="cs-ftr"><div class="cs-ftr__in"><div class="cs-ftr__top"><div class="cs-ftr__groups">${tools}<nav class="cs-ftr__group cs-ftr__group--posts" aria-label="文章"><h2 class="cs-ftr__h">文章</h2><ul class="cs-ftr__links"><li><a href="${SITE}/">最新文章</a></li><li><a href="${SITE}/privacy/">隱私權政策</a></li></ul></nav></div></div>${langRow}<div class="cs-ftr__bottom"><p class="cs-ftr__copy">© 卡斯伯，<a href="${SITE}/about/">卡斯伯 Blog</a></p></div></div></footer>`
    }
    const privacy = legal.pages.privacy[code]
    // 登錄表有旗標、而且有網址的法務頁（nav.mjs 的 FOOTER_LEGAL_NAV）：de 的 Impressum 是站長豁免，沒有網址就不放
    const flagged = Object.keys(getLocale(code).legal).filter((f) => f !== 'privacy' && LEGAL_KEYS[f] && legal.pages[f]?.[code])
    const bottom = [
      `<li><a href="${siteHomeUrl(code)}#about">${esc(t('footer.about'))}</a></li>`,
      privacy ? `<li><a href="${privacy}" hreflang="${getLocale(code).hreflang}">${esc(t('footer.privacy'))}</a></li>` : '',
      `<li><a href="${SITE}/terms/" hreflang="zh-Hant">${esc(t('inChinese', { label: t('footer.terms') }))}</a></li>`,
      ...flagged.map((f) => `<li><a href="${legal.pages[f][code]}" hreflang="${getLocale(code).hreflang}">${esc(t(LEGAL_KEYS[f]))}</a></li>`),
    ].join('')
    return `<footer class="cs-ftr"><div class="cs-ftr__in"><div class="cs-ftr__top"><div class="cs-ftr__groups">${tools}</div></div>${langRow}<div class="cs-ftr__bottom"><ul class="cs-ftr__links">${bottom}</ul><p class="cs-ftr__copy">${esc(t('footer.copyright'))}</p></div></div></footer>`
  }
  return { header, footer }
}

const LEGAL_KEYS = { impressum: 'footer.legalNotice', externalTransmission: 'footer.thirdParty' }

/** head 陣列（VitePress 的 [tag, attrs, content]）序列化 */
const headTags = (head) => head.map(([tag, attrs, content]) => `<${tag}${Object.entries(attrs ?? {}).map(([k, v]) => ` ${k}="${esc(v)}"`).join('')}>${content !== undefined ? `${content}</${tag}>` : ''}`).join('\n')

/** 外語首頁 /<code>/（I1 世界）：head 照 D.2，<main> 照 E.1 */
export function siteHomeBuiltHtml(code, { plan, index, chrome, readHome = readHomeMessages }) {
  const file = `${code}/index.html`
  const copy = formatHomeCopy(readHome(code), code)
  const view = siteHomeView(code, { readHome })
  const title = siteHomeTitle(code, copy)
  const head = [
    '<meta charset="utf-8">',
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(copy.meta.description)}">`,
    '<meta name="twitter:card" content="summary">',
    `<meta name="google-adsense-account" content="${ADSENSE_CLIENT}">`,
    // loader 跟繁中首頁一樣照 shouldLoadAds（site-home 是 standardOnly，0008 更正第 9 點）
    shouldLoadAds({ type: 'site-home' }) ? `<script async src="${ADSENSE_LOADER_SRC}" crossorigin="anonymous"></script>` : '',
    SITE_DATA_SCRIPT,
    headTags(siteHomeHead({ code, canonical: siteHomeUrl(code), title, home: copy, codes: plan.pages.map((p) => p.code) })),
    ga4HeadHtml({ contentGroup: 'site-home', pageLocale: code }),
  ].filter(Boolean).join('\n')
  const tools = siteToolLinks(index, { locale: code, text: textFor(code) })
  const link = (l) => `<a href="${l.href}"${l.hreflang ? ` hreflang="${l.hreflang}"` : ''}>${esc(l.label)}</a>`
  const h1 = view.h1.lang ? `<span lang="${view.h1.lang}" data-foreign>${esc(view.h1.text)}</span>` : esc(view.h1.text)
  const main = '<div class="cs-shome">' +
    `<section class="cs-shome__hero" aria-labelledby="cs-shome-h1"><img class="ghost" src="https://img.casper.tw/brand/ghost/s-hero.webp" width="960" height="894" alt="" decoding="async" fetchpriority="high"><h1 id="cs-shome-h1">${h1}</h1><p class="cs-lead">${esc(view.hero.lead)}</p><a class="b3d" href="${view.hero.toolsHref}">${esc(view.hero.toolsButton)}</a></section>` +
    `<section id="tools" class="cs-shome__tools" aria-labelledby="cs-shome-tools"><h2 id="cs-shome-tools">${esc(view.tools.h2)}</h2><p>${esc(view.tools.lead)}</p>${toolCardsHtml(tools)}</section>` +
    `<section class="cs-shome__articles" aria-labelledby="cs-shome-articles"><h2 id="cs-shome-articles">${esc(view.articles.h2)}</h2><p>${esc(view.articles.body)}</p><p class="cs-shome__links">${link(view.links.latest)}${link(view.links.categories)}</p></section>` +
    `<section id="about" class="cs-shome__about" aria-labelledby="cs-shome-about"><h2 id="cs-shome-about">${esc(view.about.title)}</h2><p>${esc(view.about.body)}</p>${link(view.links.about)}</section>` +
    '</div>'
  return pageShell({ lang: code, head, rootClass: 'vp-raw site page-type-site-home', header: chrome.header(file), main, footer: chrome.footer(file) })
}

/** 各階段世界的設定：plan、shell、tools.json、法務頁對照 */
export const P1_PLAN = Object.freeze({ stage: 'live', published: [], pages: [], problems: [], warnings: [] })
export const I1_PLAN = Object.freeze({ stage: 'live', published: ['en'], pages: [{ code: 'en', url: 'https://www.casper.tw/en/', preview: false }], problems: [], warnings: [] })
export const EMPTY_INDEX = Object.freeze({ schema: 1, blogShell: 'legacy', siteHomes: [], tools: [] })
export const I1_INDEX = Object.freeze({
  schema: 1, blogShell: 'shared', siteHomes: ['en'],
  tools: [{
    slug: 'lucky-draw', rootLocale: 'zh-tw', xDefaultLocale: 'en', ghost: 'spot3', keywords: ['抽獎', '轉盤', '分組'],
    locales: {
      'zh-tw': { url: 'https://www.casper.tw/lucky-draw/', name: '抽獎大師', summary: '抽獎、轉盤、分組' },
      en: { url: 'https://www.casper.tw/lucky-draw/en/', name: 'Lucky Draw', summary: 'Draw names, spin a wheel, split teams' },
    },
  }],
})
// I1 世界假設 site-policies 已經上線（SP 在 I1 之前）：en 的隱私權網址
export const I1_LEGAL = Object.freeze({ pages: { ...LEGAL_PAGES, privacy: { ...LEGAL_PAGES.privacy, en: 'https://www.casper.tw/site-policies/privacy/' } }, decisions: LEGAL_DECISIONS })
// 多語世界（I4 之後的樣子，少 ko）：en、ja、de 上線；ja 有外部送信說明的網址，de 的 Impressum 照站長豁免（LEGAL_DECISIONS），頁尾不放
export const MULTI_PLAN = Object.freeze({ stage: 'live', published: ['en', 'ja', 'de'], pages: ['en', 'ja', 'de'].map((code) => ({ code, url: `https://www.casper.tw/${code}/`, preview: false })), problems: [], warnings: [] })
export const MULTI_INDEX = Object.freeze({
  ...I1_INDEX,
  tools: [{ ...I1_INDEX.tools[0], locales: { ...I1_INDEX.tools[0].locales, ja: { url: 'https://www.casper.tw/lucky-draw/ja/', name: 'ラッキードロー', summary: '抽選、ルーレット、チーム分け' } } }],
})
export const MULTI_LEGAL = Object.freeze({
  pages: {
    ...LEGAL_PAGES,
    privacy: { ...LEGAL_PAGES.privacy, en: 'https://www.casper.tw/site-policies/privacy/', ja: 'https://www.casper.tw/site-policies/ja/privacy/', de: 'https://www.casper.tw/site-policies/de/privacy/' },
    externalTransmission: { ja: 'https://www.casper.tw/site-policies/ja/privacy/#external' },
  },
  decisions: LEGAL_DECISIONS,
})
export const STAGES = {
  p1: { plan: P1_PLAN, shell: 'legacy', toolsIndex: EMPTY_INDEX, legal: { pages: LEGAL_PAGES, decisions: LEGAL_DECISIONS } },
  s: { plan: P1_PLAN, shell: 'shared', toolsIndex: { ...EMPTY_INDEX, blogShell: 'shared' }, legal: { pages: LEGAL_PAGES, decisions: LEGAL_DECISIONS } },
  i1: { plan: I1_PLAN, shell: 'shared', toolsIndex: I1_INDEX, legal: I1_LEGAL },
  multi: { plan: MULTI_PLAN, shell: 'shared', toolsIndex: MULTI_INDEX, legal: MULTI_LEGAL },
}

const cardHtml = (c) => `<article class="post-card"><a class="post-card__cover" href="${c.url}" tabindex="-1"><img src="https://img.casper.tw/x.png" alt=""></a><h2 class="post-card__title"><a href="${c.url}">標題</a></h2><p class="post-card__meta"><time>2023</time></p><p class="post-card__excerpt">${esc(c.excerpt)}</p></article>`

/**
 * 建一個臨時的 repo 根目錄：baseline/hexo-fixture/、dist/、package.json。
 * mutate(dist, world) 可以在寫檔前改 dist（Map：相對路徑 → 字串）或 world.rootFiles。
 * 回傳 { root, opts }，opts 直接交給 runAudit。
 */
export function buildWorld(mutate, { stage = 'p1' } = {}) {
  const cfg = STAGES[stage]
  if (!cfg) throw new Error(`不認得的世界：${stage}（${Object.keys(STAGES).join('、')}）`)
  const chrome = stage === 'p1' ? LEGACY_CHROME : sharedChrome({ plan: cfg.plan, index: cfg.toolsIndex, legal: cfg.legal })
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-world-'))
  const files = hexoFiles()
  const pages = files.map((file) => ({ url: fileToUrl(file), file, type: pageType(file), alias: urlAliases(file)[0] ?? null, ...extractPage(readHexo(file)) }))
    .sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0))
  const posts = POSTS.filter((p) => p.published)
  const bdir = path.join(root, 'baseline', 'hexo-fixture')
  const atomEntry = (p) => `  <entry>\n    <id>${SITE}${p.url}</id>\n    <link href="${SITE}${p.url}"/>\n    <published>${pages.find((x) => x.url === p.url).publishedTime}</published>\n  </entry>\n`
  const content = posts.map((p) => ({
    title: pages.find((x) => x.url === p.url).h1[0],
    date: pages.find((x) => x.url === p.url).publishedTime,
    path: p.url.slice(1),
    categories: [{ name: p.category, slug: p.category, permalink: `${SITE}/categories/${p.category}/` }],
    tags: p.tags.map((t) => ({ name: t, slug: t, permalink: `${SITE}/tags/${t}/` })),
  }))
  const sitemapBase = [...posts.map((p) => p.url), '/', '/about/hexschool-traning', '/tags/vue/', '/tags/Vue/', '/categories/css/']
  const baseFiles = {
    'pages.json': JSON.stringify({ source: { commit: 'fixture' }, pageCount: pages.length, pages }, null, 1),
    'urls.txt': [...new Set([...files.flatMap((f) => [fileToUrl(f), ...urlAliases(f)]), ...Object.keys(FROZEN).map((f) => '/' + f), '/_headers', '/atom.xml', '/content.json', '/sitemap.xml'])].sort().join('\n') + '\n',
    'atom.xml': `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n${posts.map(atomEntry).join('')}</feed>\n`,
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n${sitemapBase.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>2026-01-01</lastmod></url>\n`).join('')}</urlset>\n`,
    'content.json': JSON.stringify(content),
    ...Object.fromEntries(['ads.txt', 'robots.txt', 'CNAME', 'search.xml'].map((f) => [f, FROZEN[f]])),
  }
  fs.mkdirSync(bdir, { recursive: true })
  for (const [f, v] of Object.entries(baseFiles)) fs.writeFileSync(path.join(bdir, f), v)

  // --- dist ---
  const dist = new Map()
  const listMain = (h1, cards) => `<h1>${esc(h1)}</h1><div class="post-list">${cards.map(cardHtml).join('')}</div><nav class="pager"><a href="/page/3/">下一頁</a></nav>`
  for (const p of pages) {
    const hexo = readHexo(p.file)
    const fix = (u) => u?.replace('/tags/Vue/', '/tags/vue/')
    const lower = (s) => (p.url === '/tags/vue/' ? s?.replaceAll('Vue', 'vue') : s)
    const common = { file: p.file, title: lower(p.title), description: lower(p.description), canonical: fix(p.canonical) }
    common.chrome = chrome
    let main
    if (p.type === 'post' || p.type === 'about') {
      const post = POSTS.find((x) => x.url === p.url)
      const prose = toVitePressProse(articleOf(hexo), p.url)
      main = `<nav class="breadcrumbs"><a href="/">首頁</a></nav><article class="post"><header><h1>${esc(p.h1[0])}</h1></header>` +
        `<div class="prose" data-v-7a1b2c3d><div>${prose}</div></div><div class="post-foot" data-v-7a1b2c3d><div class="fb-comments" data-href="${p.fbCommentsHref}" data-width="100%"></div></div></article>`
      common.demoCss = demoCssLinks(hexo)
      if (post) {
        common.tags = expectedContentEntry(content.find((x) => '/' + x.path === p.url)).tags.map((t) => t.name)
        const mod = `${post.updated ?? post.date}T00:00:00+08:00`
        Object.assign(common, { published: p.publishedTime, modified: mod, ldExtra: { datePublished: `${post.date}T00:00:00+08:00`, dateModified: mod } })
      }
      if (p.type === 'about') common.adsFalse = true
    } else if (p.type === 'archive') {
      main = `<h1>${esc(p.h1[0])}</h1>${postLinks(hexo).map((u) => `<a class="archive-row" href="${u}">文章</a>`).join('')}`
    } else {
      const h1 = p.type === 'home' ? '卡斯伯 Blog' : p.type === 'home-page' ? '最新文章：第 2 頁' : lower(p.h1[0])
      main = listMain(h1, hexoCards(hexo))
      // 首頁：有工具時多 #tools（P3 起）；有外語首頁時 head 多叢集的 hreflang 與 og:locale:alternate（I1 起，D.9），
      // 以及外語首頁 isPartOf 指的 WebSite JSON-LD（P3 在 / 加，I1 在 P3 之後，D.4）
      if (p.type === 'home') {
        const tools = siteToolLinks(cfg.toolsIndex, { locale: 'zh-tw', text: textFor('zh-tw') })
        if (tools.length) main += `<section id="tools" class="home-section" aria-label="工具">${toolCardsHtml(tools)}</section>`
        const codes = cfg.plan.pages.map((x) => x.code)
        if (codes.length) {
          const { hreflang, ogLocale } = clusterHead('zh-tw', codes)
          common.headTail = headTags([...hreflang, ...ogLocale.filter(([, a]) => a.property === 'og:locale:alternate')])
          if (cfg.plan.published.length) common.headTail += `\n${HOME_WEBSITE_LD}`
        }
      }
    }
    dist.set(p.file, builtHtml({ ...common, main }))
  }
  const newPage = (u, title, body) => dist.set(u.slice(1) + 'index.html', builtHtml({ file: u.slice(1) + 'index.html', title, description: `${title}的說明`, canonical: SITE + u, main: `<h1>${title}</h1>${body}`, chrome }))
  newPage('/categories/', '文章分類', CATEGORIES.map((c) => `<a href="/categories/${c === 'css' ? 'CSS' : c}/">${c}</a>`).join(''))
  newPage('/privacy/', '隱私權政策', '<p>可以到 <a href="https://adssettings.google.com/">廣告設定</a> 或 <a href="https://www.aboutads.info/">www.aboutads.info</a> 停用個人化廣告。</p>')
  newPage('/contact/', '聯絡', '<p>內容</p>')
  newPage('/terms/', '使用條款', '<p>內容</p>')
  // 404：I1 起主內容最後多一段多語提示（E.5）
  const intl = notFoundIntl(cfg.plan)
  const intlHtml = intl.length ? `<ul class="cs-404__intl">${intl.map((x) => `<li lang="${x.htmlLang}"><span>${esc(x.title)}</span> <a href="${x.href}" hreflang="${x.hreflang}">${esc(x.linkText)}</a></li>`).join('')}</ul>` : ''
  dist.set('404.html', builtHtml({ file: '404.html', title: NOT_FOUND_TITLE, description: NOT_FOUND_DESCRIPTION, robots: 'noindex', main: `<h1>這頁找不到</h1>${intlHtml}`, chrome }))
  for (const code of cfg.plan.published) dist.set(`${code}/index.html`, siteHomeBuiltHtml(code, { plan: cfg.plan, index: cfg.toolsIndex, chrome }))
  for (const [f, v] of Object.entries(FROZEN)) dist.set(f, v)
  dist.set('atom.xml', baseFiles['atom.xml'])
  dist.set('content.json', JSON.stringify(content.map(expectedContentEntry)))
  const lastmod = new Map(posts.map((p) => [SITE + p.url, p.updated ?? p.date]))
  dist.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n${[...expectedSitemap(baseFiles['sitemap.xml'], { siteHomes: cfg.plan.published })].map((u) => `<url><loc>${u}</loc>${lastmod.has(u) ? `<lastmod>${lastmod.get(u)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`)
  dist.set('assets/app.Bc12xY.js', 'import"./chunks/theme.Dx9.js";console.log("app")\n')
  dist.set('assets/chunks/theme.Dx9.js', 'export const theme={name:"casper"};\n')
  dist.set('assets/chunks/framework.Fa1.js', 'export const vue={};\n')
  dist.set('assets/style.Cc3.css', 'body{margin:0}\n')
  dist.set('hashmap.json', '{}')

  const world = {
    stage,
    rootFiles: new Map([
      ['package.json', JSON.stringify({ scripts: { build: 'vitepress build source', postbuild: 'node scripts/audit-build.mjs' } })],
      ['site-card.json', JSON.stringify({ schema: 1, shell: cfg.shell, siteHomes: [...cfg.plan.published] })],
    ]),
  }
  if (mutate) mutate(dist, world)
  for (const [f, v] of world.rootFiles) fs.writeFileSync(path.join(root, f), v)
  const distDir = path.join(root, 'dist')
  for (const [f, v] of dist) {
    fs.mkdirSync(path.dirname(path.join(distDir, f)), { recursive: true })
    fs.writeFileSync(path.join(distDir, f), v)
  }
  const baselineHtml = new Map([...files.map((f) => [f, readHexo(f)]), ...['css/style.css', 'img/casper-avatar.webp', 'img/js-interview-cover.webp'].map((f) => [f, FROZEN[f]])])
  return {
    root,
    opts: {
      root, distDir, baselineDir: bdir, srcDir: null, posts: POSTS, categories: CATEGORIES,
      plan: cfg.plan, shell: cfg.shell, toolsIndex: cfg.toolsIndex, legal: cfg.legal,
      adsFalseUrls: new Set(['/about/hexschool-traning.html']), baselineHtml,
      fixedAnchors: [
        ['/development/2021/09/11/css-selector/', '“屬性及值”-完全符合'],
        ['/life/2015/01/08/2014-year-report/', 'SASS-amp-Compass'],
      ].map(([u, id]) => [encodeURI(u), id]),
    },
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  }
}

export { NEW_PAGES, mainOf }
