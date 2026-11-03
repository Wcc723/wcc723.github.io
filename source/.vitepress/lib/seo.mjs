// 負責：seo 模組（P1 workflow）。介面見 ../README.md。
// head 的 SEO 標籤、追蹤碼、JSON-LD、cssdemo 與 AdSense loader 的去留。只在 Node 端執行（config.mts）。
//
// 舊頁的 head 照 Hexo（casper-2026 主題的 common/head.ejs 加 Hexo 8 的 open_graph helper）逐欄輸出，
// 值的來源也照舊：
// - title：文章與一般頁「<頁名> | 站名」，首頁與 /page/N/ 只有站名，分類、標籤、封存用主題的公式。
// - og:title 是 Hexo 的 page.title：文章、about、/tags/ 這類有自己標題的頁才有，列表頁沒有就用站名。
// - description：front matter 有就用；文章與 about 沒寫的用凍結值（legacy-descriptions.json）；
//   首頁、列表、封存用主題的公式，而且跟 Hexo 一樣不輸出 og:description。
// - og:image：front matter 的 photos（或 photo）→ thumbnail → 內文第一張圖，跟 open_graph 與主題的 thumbnail helper 相同。
// - article:published_time：文章用檔名日期的台北 00:00；一般頁用 front matter 的 date（台北當地時間）。
//   article:modified_time 用 front matter 的 updated，沒有就等於發布時間（站長 2026-11-03 決定，不用檔案時間）。
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { SITE_TITLE_LEGACY, adsenseHead, shouldLoadAds, stripAdsLoader } from '../theme/shared/shell/site.mjs'
import { SITE_URL, toAbsolute } from './posts.mjs'
import { pageTypeOf } from './pagetype.mjs'
import { NOT_FOUND_DESCRIPTION, NOT_FOUND_TITLE } from '../theme/head.mjs'
import LEGACY from './legacy-descriptions.json' with { type: 'json' }

// ---------------------------------------------------------------------------
// 常數：追蹤碼與 OG 的值從 develop 的 _config.yml、themes/casper-2026/_config.yml 抄來
// ---------------------------------------------------------------------------

export const PRODUCTION_HOST = 'www.casper.tw'
export const GA4_ID = 'G-97433H4032'
export const FB_PIXEL_ID = '152520611964487'
export const FB_APP_ID = '556473851118881'
export const OG_LOCALE = 'zh_TW'
/** Hexo 的 config.author，open_graph 在每一頁輸出 article:author */
export const ARTICLE_AUTHOR = 'Wang Casper'
/** 首頁與 /page/N/ 的 description：Hexo 的 config.description 是空的，主題改用 theme.tagline */
export const HOME_DESCRIPTION = '前端，沒有極限'
export const DEMO_CSS_BASE = 'https://img.casper.tw/demoFile/css/'

/** 全站唯一的作者與出品者（計畫「SEO」的結構化資料）。P3 改成 ProfilePage 時也指向這個 @id */
export const PERSON_ID = `${SITE_URL}/about/#person`
export const PERSON = { '@type': 'Person', '@id': PERSON_ID, name: '卡斯伯', url: `${SITE_URL}/about/` }

// ---------------------------------------------------------------------------
// 全站 head（config.mts 的 head）
// ---------------------------------------------------------------------------

// GA4 只在正式主機名執行：本機預覽、建置後的 preview 不送資料。gtag.js 也只在正式主機名才插入。
// content_group 依計畫的 GA4 規則標成 blog（工具各用自己的 slug）。
const GA4_SNIPPET =
  `(function(){if(location.hostname!=='${PRODUCTION_HOST}')return;` +
  `var w=window,d=document,s=d.createElement('script');s.async=true;` +
  `s.src='https://www.googletagmanager.com/gtag/js?id=${GA4_ID}';d.head.appendChild(s);` +
  `w.dataLayer=w.dataLayer||[];w.gtag=function(){w.dataLayer.push(arguments)};` +
  `w.gtag('js',new Date());w.gtag('config','${GA4_ID}',{content_group:'blog'})})()`

// FB Pixel：Hexo 主題的原始碼，外面同樣包一層正式主機名判斷。
// Hexo 版另有 <noscript><img></noscript>，這裡不放：head 裡的 img 會讓不執行 script 的剖析器提早結束 head，
// 排在後面的 canonical、og、JSON-LD 會被當成 body 的內容。
const FB_PIXEL_SNIPPET =
  `(function(){if(location.hostname!=='${PRODUCTION_HOST}')return;` +
  `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};` +
  `if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;` +
  `s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');` +
  `fbq('init','${FB_PIXEL_ID}');fbq('track','PageView')})()`

/**
 * 每一頁都一樣的 head。VitePress 把它放在各頁 frontmatter.head 前面（mergeHead）。
 * 字型、favicon、深淺色 script 在 theme/head.mjs；highlight.js 的 CSS 不再載入（Shiki 在建置時上色）。
 */
export const siteHead = [
  ['meta', { property: 'og:site_name', content: SITE_TITLE_LEGACY }],
  ['meta', { property: 'og:locale', content: OG_LOCALE }],
  ['meta', { property: 'article:author', content: ARTICLE_AUTHOR }],
  ['meta', { name: 'twitter:card', content: 'summary' }],
  ['meta', { property: 'fb:app_id', content: FB_APP_ID }],
  ['link', { rel: 'alternate', href: '/atom.xml', title: SITE_TITLE_LEGACY, type: 'application/atom+xml' }],
  ['script', {}, GA4_SNIPPET],
  ['script', {}, FB_PIXEL_SNIPPET],
  // google-adsense-account meta 與靜態 loader；不該載入的頁由 transformHtml 拿掉 loader，meta 一律保留
  ...adsenseHead(),
]

// ---------------------------------------------------------------------------
// 小工具
// ---------------------------------------------------------------------------

function asArray(v) {
  if (v == null || v === '') return []
  return Array.isArray(v) ? v : [v]
}

const pad = (n) => String(n).padStart(2, '0')

/** front matter 的日期（js-yaml 的 Date 或字串）→ YYYY-MM-DD。js-yaml 把沒有時區的值當 UTC，取 UTC 的年月日就是原本寫的日期 */
export function dateOnly(v) {
  if (!v) return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v.toISOString().slice(0, 10)
  const m = String(v).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  return m ? `${m[1]}-${pad(m[2])}-${pad(m[3])}` : null
}

/** YYYY-MM-DD → 台北當地 00:00 的 UTC ISO（Hexo 的 moment 在 Asia/Taipei 的輸出），例 2022-01-10 → 2022-01-09T16:00:00.000Z */
export function taipeiMidnightIso(date) {
  return new Date(`${date}T00:00:00+08:00`).toISOString()
}

/**
 * 一般頁 front matter 的 date（例 2019-11-12 15:28:32，沒有時區）→ UTC ISO。
 * Hexo 用建置機器的時區（Asia/Taipei）解讀；js-yaml 解成 UTC 的 Date，所以減 8 小時。
 */
export function taipeiDateTimeIso(v) {
  if (!v) return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : new Date(v.getTime() - 8 * 3600 * 1000).toISOString()
  const m = String(v).match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/)
  if (!m) return null
  const [, y, mo, d, h = '0', mi = '00', s = '00'] = m
  return new Date(`${y}-${pad(mo)}-${pad(d)}T${pad(h)}:${mi}:${s}+08:00`).toISOString()
}

export function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function decodeEntities(s) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
  return s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] !== '#') return named[e] ?? m
    const cp = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
    return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m
  })
}

/** JSON-LD 放進 <script> 前把 < 換成 <，內容裡的 </script> 才不會提早結束標籤 */
export function jsonLdString(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/** rewrites 之後的 relativePath → 網址（frontmatter.url 沒給時的備案） */
export function urlFromRelativePath(rel) {
  const p = String(rel).replace(/\\/g, '/')
  if (p === 'index.md') return '/'
  if (p.endsWith('/index.md')) return '/' + p.slice(0, -'index.md'.length)
  return '/' + p.replace(/\.md$/, '')
}

// ---------------------------------------------------------------------------
// og:image：照 Hexo 的 open_graph 與主題的 thumbnail helper
// ---------------------------------------------------------------------------

// 主題的 thumbnail helper 對 Hexo 渲染後的 HTML 跑這個正規表示式；Markdown 的圖另外比對，取先出現的那張
const HTML_IMG_RE = /<img\s.*?\s?src\s*=\s*['|"]?([^\s'"]+).*?>/i
const MD_IMG_RE = /!\[[^\]]*\]\(\s*<?([^\s)>]+)>?(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/
// 程式碼區塊和行內程式碼裡的 <img> 在 Hexo 的 HTML 是跳脫過的，不算圖
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?\n {0,3}\1[`~]*[ \t]*$/gm
const INLINE_CODE_RE = /`[^`\n]+`/g

/** Markdown 原始碼裡第一張圖的網址，沒有就是空字串 */
export function firstImage(content) {
  const text = String(content ?? '').replace(FENCE_RE, '').replace(INLINE_CODE_RE, '')
  const md = MD_IMG_RE.exec(text)
  const html = HTML_IMG_RE.exec(text)
  const hit = md && html ? (md.index < html.index ? md : html) : md || html
  return hit ? decodeEntities(hit[1]) : ''
}

/** 相對網址照 open_graph 的做法以本頁網址為基準轉成絕對網址 */
function absoluteImage(src, pageUrl) {
  if (!src) return ''
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith('//')) return 'https:' + src
  return new URL(src, pageUrl || SITE_URL + '/').href
}

function readContent(srcDir, filePath) {
  if (!srcDir || !filePath) return ''
  try {
    return matter(fs.readFileSync(path.join(srcDir, filePath), 'utf8')).content
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// 每一頁的 SEO 欄位（純函式，測試直接比對基準）
// ---------------------------------------------------------------------------

const POST_URL_RE = /^\/[^/]+\/(\d{4})\/(\d{2})\/(\d{2})\/[^/]+\/$/
const TAXONOMY_RE = /^(分類|標籤)：(.+)$/

/** /archives/、/archives/2014/、/archives/2014/05/ → 封存、封存：2014、封存：2014/5（月份不補零，跟 Hexo 相同） */
export function archiveTitle(url) {
  const m = url.match(/^\/archives\/(?:(\d{4})\/(?:(\d{1,2})\/)?)?$/)
  if (!m) throw new Error(`seo：看不懂的封存網址 ${url}`)
  if (!m[1]) return '封存'
  return m[2] ? `封存：${m[1]}/${Number(m[2])}` : `封存：${m[1]}`
}

/**
 * 分類、標籤列表頁的名稱：讀 frontmatter.heading（routes 模組寫的 H1，逐字是「分類：css」「標籤：node.js」）。
 * 名稱是 front matter 的分類值與合併成小寫後的標籤名，title 與 description 都用它。
 */
export function taxonomyOf(url, fm) {
  const kind = url.startsWith('/categories/') ? '分類' : url.startsWith('/tags/') ? '標籤' : null
  for (const s of [fm.heading, fm.title]) {
    const m = typeof s === 'string' ? s.match(TAXONOMY_RE) : null
    if (m && m[1] === kind) return { kind, name: m[2], title: s }
  }
  throw new Error(`seo：${url} 需要 frontmatter.heading（例「${kind ?? '分類'}：名稱」）才能產生 title 與 description`)
}

/**
 * 算出一頁的 SEO 欄位。
 * input：{ type, url, fm, inferredTitle, content }，content 是 Markdown 原始碼（只有文章與 about 用來找第一張圖）。
 */
export function pageSeo({ type, url, fm = {}, inferredTitle = '', content = '' }) {
  const isArchive = url.startsWith('/archives/')
  const notFound = type === 'not-found'

  // 頁名（<title> 的前半段）與 Hexo 的 page.title（og:title 用）
  let displayTitle = ''
  let ownTitle = false
  let taxonomy = null
  if (type === 'home' || type === 'blog-index') {
    displayTitle = ''
  } else if (isArchive) {
    displayTitle = archiveTitle(url)
  } else if (type === 'taxonomy-list') {
    taxonomy = taxonomyOf(url, fm)
    displayTitle = taxonomy.title
  } else {
    displayTitle = String(fm.title || inferredTitle || fm.heading || '')
    ownTitle = Boolean(displayTitle)
  }
  const title = displayTitle ? `${displayTitle} | ${SITE_TITLE_LEGACY}` : SITE_TITLE_LEGACY

  // description 與 og:description
  const fmDescription = fm.description ? String(fm.description) : ''
  let description = fmDescription
  let ogDescription = fmDescription
  if (!description) {
    if (type === 'home' || type === 'blog-index') description = HOME_DESCRIPTION
    else if (isArchive) description = `文章封存 — ${SITE_TITLE_LEGACY}`
    else if (taxonomy?.kind === '分類') description = `「${taxonomy.name}」分類的所有文章 — ${SITE_TITLE_LEGACY}`
    else if (taxonomy?.kind === '標籤') description = `標籤「${taxonomy.name}」的相關文章 — ${SITE_TITLE_LEGACY}`
    else if (type === 'post' || type === 'about') {
      const key = url.replace(/\.html$/, '')
      const frozen = LEGACY.descriptions[key] ?? LEGACY.descriptions[safeDecode(key)]
      if (!frozen) throw new Error(`seo：${url} 沒有 front matter description，也不在 legacy-descriptions.json；新文章請在 front matter 寫 description`)
      description = ogDescription = frozen
    }
  }

  const canonical = notFound ? '' : toAbsolute(url)

  // og:image
  let ogImage = ''
  if (type === 'post' || type === 'about') {
    const photos = asArray(fm.photos ?? fm.photo).filter(Boolean).map(String)
    const thumbnail = fm.thumbnail ? String(fm.thumbnail) : ''
    ogImage = absoluteImage(photos[0] || thumbnail || firstImage(content), canonical)
  }

  // 日期
  let date = null
  let publishedTime = null
  let modifiedTime = null
  const updated = dateOnly(fm.updated)
  if (type === 'post') {
    const m = url.match(POST_URL_RE)
    if (!m) throw new Error(`seo：文章網址格式不對 ${url}`)
    date = `${m[1]}-${m[2]}-${m[3]}`
    publishedTime = taipeiMidnightIso(date)
    modifiedTime = taipeiMidnightIso(updated ?? date)
  } else if (fm.date) {
    publishedTime = taipeiDateTimeIso(fm.date)
    modifiedTime = updated ? taipeiMidnightIso(updated) : publishedTime
  }

  // 標籤順序：routes 模組的 post.tags 照 Hexo 資料庫的建立順序排過（Hexo 的 keywords 就是這個順序，基準 content.json 也是），
  // 沒有時用 front matter 的順序。article:tag 另外依名稱的字碼順序輸出（pageHead）
  const tags = (Array.isArray(fm.post?.tags) ? fm.post.tags.map((t) => t?.name) : asArray(fm.tags))
    .filter((t) => t != null && t !== '')
    .map(String)
  const cssdemo = asArray(fm.cssdemo).flat().filter(Boolean).map(String)

  return {
    type,
    url,
    title,
    pageTitle: displayTitle,
    description,
    canonical,
    ogType: type === 'post' ? 'article' : 'website',
    ogTitle: ownTitle ? displayTitle : SITE_TITLE_LEGACY,
    ogUrl: canonical,
    ogDescription,
    ogImage,
    date,
    updated,
    publishedTime,
    modifiedTime,
    tags,
    cssdemo,
    robots: notFound ? 'noindex' : null,
    jsonLd: jsonLdFor({ type, url, fm, canonical, displayTitle, description, ogImage, date, updated }),
  }
}

function safeDecode(s) {
  try {
    return decodeURI(s)
  } catch {
    return s
  }
}

// ---------------------------------------------------------------------------
// JSON-LD
// ---------------------------------------------------------------------------

const CONTEXT = 'https://schema.org'

/** frontmatter.breadcrumbs（[{ name, url }]，最後一層沒有 url）→ BreadcrumbList；最後一層的 item 用本頁 canonical */
export function breadcrumbList(crumbs, canonical) {
  if (!Array.isArray(crumbs) || !crumbs.length) return null
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => {
      const item = c.url ? toAbsolute(c.url) : i === crumbs.length - 1 ? canonical : null
      return { '@type': 'ListItem', position: i + 1, name: String(c.name), ...(item ? { item } : {}) }
    }),
  }
}

/**
 * 一頁的 JSON-LD 物件陣列，放在同一個 <script> 的頂層陣列裡（同一份資料，author 的 @id 指得到 Person）。
 * 文章：BlogPosting ＋ BreadcrumbList ＋ Person；列表、分類、標籤、索引頁：CollectionPage ＋ BreadcrumbList；
 * about 與法務頁：WebPage ＋ BreadcrumbList；首頁這一版不加，404 不輸出。全站不做 FAQPage。
 */
export function jsonLdFor({ type, fm, canonical, displayTitle, description, ogImage, date, updated }) {
  if (type === 'home' || type === 'not-found') return []
  const crumbs = breadcrumbList(fm.breadcrumbs, canonical)
  if (type === 'post') {
    const article = {
      '@context': CONTEXT,
      '@type': 'BlogPosting',
      headline: displayTitle,
      datePublished: `${date}T00:00:00+08:00`,
      dateModified: `${updated ?? date}T00:00:00+08:00`,
      ...(ogImage ? { image: [ogImage] } : {}),
      mainEntityOfPage: canonical,
      author: { '@id': PERSON_ID },
      publisher: { '@id': PERSON_ID },
    }
    return [article, crumbs, { '@context': CONTEXT, ...PERSON }].filter(Boolean)
  }
  const pageType = type === 'about' || type === 'legal' ? 'WebPage' : 'CollectionPage'
  const lastCrumb = Array.isArray(fm.breadcrumbs) && fm.breadcrumbs.length ? fm.breadcrumbs.at(-1).name : ''
  const page = {
    '@context': CONTEXT,
    '@type': pageType,
    '@id': canonical,
    url: canonical,
    name: String(displayTitle || fm.heading || lastCrumb || SITE_TITLE_LEGACY),
    ...(description ? { description } : {}),
    inLanguage: 'zh-TW',
    ...(crumbs ? { breadcrumb: { '@id': crumbs['@id'] } } : {}),
  }
  return [page, crumbs].filter(Boolean)
}

// ---------------------------------------------------------------------------
// head 陣列
// ---------------------------------------------------------------------------

/** article:tag 的順序：依名稱的 UTF-16 字碼排序（大寫在小寫前面，例 Cloudflare、side project、vue），不改原陣列 */
export function articleTagOrder(tags) {
  return [...tags].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

/** pageSeo 的結果 → 這一頁 frontmatter.head 要加的標籤（VitePress 的 [tag, attrs, innerHTML] 格式） */
export function pageHead(seo) {
  const head = []
  const meta = (key, name, content) => head.push(['meta', { [key]: name, content }])
  if (seo.tags.length) meta('name', 'keywords', seo.tags.join(','))
  meta('property', 'og:type', seo.ogType)
  meta('property', 'og:title', seo.ogTitle)
  if (seo.ogUrl) meta('property', 'og:url', seo.ogUrl)
  if (seo.ogDescription) meta('property', 'og:description', seo.ogDescription)
  if (seo.ogImage) meta('property', 'og:image', seo.ogImage)
  if (seo.publishedTime) meta('property', 'article:published_time', seo.publishedTime)
  if (seo.modifiedTime) meta('property', 'article:modified_time', seo.modifiedTime)
  // Hexo 的 article:tag 一律依名稱的字碼順序（基準 364 篇都是），跟 keywords 的順序不同
  if (seo.type === 'post') for (const tag of articleTagOrder(seo.tags)) meta('property', 'article:tag', tag)
  if (seo.ogImage) meta('name', 'twitter:image', seo.ogImage)
  if (seo.canonical) head.push(['link', { rel: 'canonical', href: seo.canonical }])
  if (seo.robots) meta('name', 'robots', seo.robots)
  if (seo.jsonLd.length) head.push(['script', { type: 'application/ld+json' }, jsonLdString(seo.jsonLd)])
  // cssdemo：跟 Hexo head.ejs 同一個網址與屬性；陣列值攤平成一個 link 一個檔
  for (const name of seo.cssdemo) head.push(['link', { href: `${DEMO_CSS_BASE}${name}.css`, rel: 'stylesheet', type: 'text/css' }])
  return head
}

// ---------------------------------------------------------------------------
// VitePress hooks
// ---------------------------------------------------------------------------

/**
 * transformPageData 的後半段（pagedata 之後跑）：寫 pageData.title、description，以及 frontmatter.head、frontmatter.ads。
 * title 交給 VitePress：config 的 title 是 SITE_TITLE_LEGACY，預設的 titleTemplate 補上「 | 站名」；
 * 首頁與 /page/N/ 只有站名，用 titleTemplate: false。
 */
export function seoPageData(pageData, ctx = {}) {
  const fm = (pageData.frontmatter ??= {})
  const type = fm.pageType ?? pageTypeOf(pageData.relativePath)
  const url = fm.url ?? urlFromRelativePath(pageData.relativePath)
  const content = type === 'post' || type === 'about' ? readContent(ctx.siteConfig?.srcDir, pageData.filePath) : ''
  const seo = pageSeo({ type, url, fm, inferredTitle: pageData.title, content })

  if (seo.pageTitle) {
    pageData.title = seo.pageTitle
  } else {
    pageData.title = SITE_TITLE_LEGACY
    pageData.titleTemplate = false
  }
  pageData.description = seo.description
  fm.head = [...asArray(fm.head), ...pageHead(seo)]
  fm.ads = shouldLoadAds({ type, adsFalse: fm.ads === false })
  return seo
}

/**
 * transformHtml：
 * 1. VitePress 的 <meta name="description"> 沒有跳脫屬性值，這裡換成跳脫過的版本；
 *    這一頁沒有 description（例如 /tags/）就整個拿掉，不讓 config 的預設描述（A VitePress site）出現。
 * 2. AdSense loader：依 shouldLoadAds 拿掉；404 一律拿掉，並補上 noindex。
 *    404 的 title 與 description 換成 theme/head.mjs 的中文（VitePress 內建的是「404」與「Not Found」）。
 * 3. 404 的內容：VitePress 1.6.4 的 404.html 一律輸出空的 <div id="app"></div>（等瀏覽器掛載），
 *    但 SSR 已經算好內容（ctx.content）。這裡補回去：沒有 JavaScript 的讀者、爬蟲與 live-check 都看得到
 *    「這頁找不到」和回首頁的連結，版面根元素的 vp-raw 也在（計畫：每一頁都要過 SSR 檢查）。
 *    瀏覽器端照樣用 createSSRApp 掛載，內容相同就直接 hydrate。
 */
export function transformHtml(code, id, ctx = {}) {
  let html = code
  const pageData = ctx.pageData ?? {}
  const fm = pageData.frontmatter ?? {}

  if (typeof ctx.description === 'string') {
    const raw = `<meta name="description" content="${ctx.description}">`
    if (html.includes(raw)) {
      const next = pageData.description ? `<meta name="description" content="${escapeHtml(ctx.description)}">` : ''
      html = html.replace(raw, () => next)
    }
  }

  const notFound = ctx.page === '404.md' || pageData.isNotFound || fm.pageType === 'not-found'
  if (notFound) {
    const empty = '<div id="app"></div>'
    if (typeof ctx.content === 'string' && ctx.content && html.includes(empty)) html = html.replace(empty, () => `<div id="app">${ctx.content}</div>`)
    // VitePress 內建的 404 是 title「404 | 站名」、description「Not Found」，換成頁面上的中文（theme/head.mjs）
    html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${escapeHtml(NOT_FOUND_TITLE)}</title>`)
    const description = `<meta name="description" content="${escapeHtml(NOT_FOUND_DESCRIPTION)}">`
    if (/<meta\s+name="description"[^>]*>/.test(html)) html = html.replace(/<meta\s+name="description"[^>]*>/, () => description)
    else html = html.replace('</head>', () => `${description}\n</head>`)
    html = stripAdsLoader(html)
    if (!/<meta\s+name="robots"/i.test(html)) html = html.replace('</head>', () => '<meta name="robots" content="noindex">\n</head>')
    return html
  }

  const type = fm.pageType ?? pageTypeOf(pageData.relativePath ?? ctx.page)
  if (!shouldLoadAds({ type, adsFalse: fm.ads === false })) html = stripAdsLoader(html)
  return html
}
