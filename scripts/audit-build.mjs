#!/usr/bin/env node
// 建置後的對等檢查：npm run build 之後自動跑（package.json 的 postbuild），有任何問題就 exit 1。
// 用法：node scripts/audit-build.mjs [--dist <資料夾>] [--baseline <資料夾>] [--report <檔案>]
//       node scripts/audit-build.mjs --print-baseline-commit   （印出基準 commit，給 CI 先 git fetch）
// 預設：dist = source/.vitepress/dist，基準 = baseline/ 底下最新的 hexo-*，報告 = source/.vitepress/cache/audit-report.json
//
// 拿 VitePress 產物跟 Hexo 基準逐項比：網址、每頁 SEO 欄位、標題 id、本文指紋、列表卡片、feed、sitemap、廣告 loader、
// vp-raw、文章側欄、分類白名單、模板殘留、主題 chunk。檢查項目來自計畫（workspace docs/architecture/site-architecture-v2.md）
// P1 的 audit 清單與「遷移：Hexo 到 VitePress」各節的「檢查」。
//
// 基準有兩部分：baseline/hexo-*/ 的檔案（pages.json 等），以及基準 commit 裡的原始 HTML（git cat-file 讀，
// 用在本文相似度、卡片摘要、內容輪廓）。CI 要先 git fetch --depth=1 origin <基準 commit>，見 .github/workflows/deploy.yml。
//
// 預期差異一律寫成下面的白名單常數，每條附理由；不在白名單的差異就是失敗。
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import {
  SITE, fileToUrl, urlAliases, decodeEntities, findTags, stripHidden, textOf, headOf, mainOf, articleOf,
  fingerprintText, sha256, extractPage, sitemapLocs, startTags, hasClass, builtArticleOf, hasProse,
  normalizePunct, comparableText, similarity, firstDiff, normalizeHref, postLinks, linkSet, hexoCards,
  builtCards, idsIn, headingIdsOf, hashLinks, contentProfile, demoCssLinks, jsonLdNodes, POST_URL_RE,
  elementsWhere, rootClassesOf, hreflangLinksOf, ogLocalesOf, siteHomeHeadSequence, anchorsIn, toolLinksIn, languageItemsIn,
} from './lib/extract-page.mjs'
import {
  SITE_TITLE_LEGACY, ADS_MODE, ADSENSE_CLIENT, shouldLoadAds, countAdsLoaders,
} from '../source/.vitepress/theme/shared/shell/site.mjs'
import { pageTypeOf } from '../source/.vitepress/lib/pagetype.mjs'
import { NOT_FOUND_TITLE, NOT_FOUND_DESCRIPTION } from '../source/.vitepress/theme/head.mjs'
import siteConfig from '../source/.vitepress/site.config.mjs'
import {
  PREVIEW_NOTICE, PREVIEW_TOOLS_NOTE, SITE_HOME_CODES, SITE_INDEX, buildSiteHomePlan, formatHomeCopy, languageTargets, readHomeMessages, siteHomeTitle,
} from '../source/.vitepress/lib/site-home.mjs'
import { SITE_HOME_OG_IMAGE, WEBSITE_ID } from '../source/.vitepress/lib/seo.mjs'
import { LOCALES, getLocale, sortLocaleCodes } from '../source/.vitepress/theme/shared/shell/i18n/locales.mjs'
import { ZH_CATCHALL, siteHomeAlternates, siteHomeUrl } from '../source/.vitepress/theme/shared/shell/i18n/urls.mjs'
import { siteName } from '../source/.vitepress/theme/shared/shell/i18n/seo.mjs'
import { ts } from '../source/.vitepress/theme/shared/shell/i18n/shell-strings.mjs'
import { checkScript } from '../source/.vitepress/theme/shared/shell/i18n/script-check.mjs'
import { leafEntries } from '../source/.vitepress/theme/shared/shell/i18n/review.mjs'
import { LEGAL_DECISIONS, LEGAL_PAGES } from '../source/.vitepress/theme/shared/shell/i18n/legal.mjs'
import { MARK, hasSiteTools, siteToolLinks } from '../source/.vitepress/theme/shared/shell/tools.mjs'
import { brandLang } from '../source/.vitepress/theme/shared/shell/shell-model.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** 登錄表的語系代碼（小寫，含 zh-tw）：網址路徑段的保留字（主站首頁規格 B.3） */
const LOCALE_CODES = new Set(LOCALES.map((l) => l.code))

// ============================================================================
// 門檻與白名單（預期差異）
// ============================================================================

/** 本文相似度門檻（計畫 P1 完成條件：每篇正規化後至少 0.98，低於門檻逐篇列出、人工確認後才進 TEXT_EXPECTED） */
export const TEXT_MIN = 0.98

/**
 * 主題 chunk（assets/chunks/theme.*.js）上限：120 KiB，未壓縮。
 * 理由：每一頁都會下載它。自訂主題只有版面、頁首頁尾、麵包屑、⌘K 搜尋、FB 留言、深淺色切換，正常應在數十 KB；
 * 把文章資料打包進來就會明顯超過：364 篇的卡片摘要約 100 KB（每篇約 90 字，UTF-8 約 270 bytes），content.json 本身 145,678 bytes。
 * demos/ 的示範元件已改成按需載入（theme/index.ts 的 defineAsyncComponent，每支各自一個 chunk），不算在主題 chunk 裡；
 * 2026-11-03 整合時主題 chunk 是 41,792 bytes（改之前 91,166）。超過上限時先查是誰被打進主題 chunk，不要直接調高上限。
 */
export const THEME_CHUNK_MAX = 120 * 1024

/** 只有大小寫不同的三組舊標籤，遷移時合併成小寫（計畫「只差大小寫的標籤」、站長 2026-11-03 決定） */
export const MERGED_TAGS = { Sass: 'sass', Bootstrap: 'bootstrap', Vue: 'vue' }

/**
 * 舊網址裡已知壞掉、新版改正的寫法（基準 README「搬家時要特別注意的現況」）：
 * /categories/css/ → /categories/CSS/（資料夾一直是大寫，canonical、sitemap、分頁連結卻寫小寫，線上 404）；
 * /tags/Sass/ 等 → 小寫（樹裡沒有大寫資料夾，線上 404）。
 */
export function legacyUrlFix(url) {
  let u = url.replace(/^((?:https:\/\/www\.casper\.tw)?\/categories\/)css(\/|$)/, '$1CSS$2')
  for (const [from, to] of Object.entries(MERGED_TAGS)) u = u.replace(new RegExp(`^((?:https://www\\.casper\\.tw)?/tags/)${from}(/|$)`), `$1${to}$2`)
  return u
}

const MERGED_TAG_PAGE_RE = /^\/tags\/(sass|bootstrap|vue)\/(?:page\/\d+\/)?$/

/** 允許的新網址（計畫 P1 完成條件「新增的只有…」），每條附理由 */
export const NEW_URLS = [
  { test: (u) => u === '/categories/', reason: '新增分類總覽，頁首「文章」與麵包屑的目的地（計畫「網站地圖」）' },
  { test: (u) => ['/privacy/', '/contact/', '/terms/'].includes(u), reason: '新增隱私權、聯絡、使用條款頁（計畫「法務與聯絡」，AdSense 要求的揭露）' },
  { test: (u) => u === '/404.html' || u === '/404', reason: 'VitePress 的 404 頁，GitHub Pages 對不存在的路徑都回這頁；/404 是 GitHub Pages 對 .html 的無副檔名別名' },
  { test: (u) => /^\/tags\/(sass|bootstrap|vue)\/page\/\d+\/$/.test(u), reason: 'Sass、Bootstrap、Vue 併入小寫後篇數變多，多出來的分頁' },
  { test: (u) => u.startsWith('/assets/'), reason: 'VitePress 的雜湊資產（JS、CSS、字型）' },
  { test: (u) => u === '/hashmap.json' || u === '/vp-icons.css', reason: 'VitePress 產物，名稱已列進 config/reserved-paths.json' },
]

/** 外語首頁的網址規則：plan.published 的每個 /<code>/（主站首頁規格 J.1 的 checkUrls）；P1 是空陣列，什麼都不放行 */
export function siteHomeUrlRule(published = []) {
  const urls = new Set(published.map((c) => `/${c}/`))
  return { test: (u) => urls.has(u), reason: '外語首頁 /<code>/：site.config.mjs 的 home.locales（主站首頁規格 B.1）' }
}

/** 預期從 dist 消失的基準網址 */
export const REMOVED_URLS = [
  { url: '/_headers', reason: 'Hexo 主題產生的 Cloudflare 標頭檔，Jekyll 本來就略過它，線上一直是 404；新版不再輸出（計畫「舊主題檔與 _headers」）' },
]

/** 新頁：要存在，canonical 是小寫、帶尾斜線的完整網址 */
export const NEW_PAGES = ['/categories/', '/privacy/', '/contact/', '/terms/']

/** /privacy/ 一定要連到的網站：Google 的廣告設定、停用個人化廣告的 aboutads.info */
export const PRIVACY_REQUIRED_HOSTS = ['adssettings.google.com', 'www.aboutads.info']

/** 基準 commit 裡、要逐位元比對的 public/ 檔（基準資料夾有副本的直接比副本，其餘比 git blob） */
export const FROZEN_FILES = ['ads.txt', 'robots.txt', 'CNAME', 'search.xml', 'css/style.css', 'img/casper-avatar.webp', 'img/js-interview-cover.webp']

/**
 * 本文相似度低於 TEXT_MIN、但人工確認過的頁：{ url, min, reason }。min 是這一頁仍要達到的下限，避免整頁壞掉也被放過。
 * 新增一條前，先看 audit 報告裡那一頁的 firstDiff，確認差異是刻意的。
 */
export const TEXT_EXPECTED = [
  {
    url: '/development/2021/10/04/css-animation/',
    min: 0.92,
    reason: '計畫「css-animation 的 Vue 3 示範」：原本用 unpkg 的 vue@next 在瀏覽器裡掛載，基準 HTML 是還沒編譯的模板文字（{{ ani.name… }}、v-for）；改寫成 CssAnimationDemo.vue 後 SSR 直接輸出 8 組選單的標籤與選項，以及套用中的 CSS（2026-11-03 整合時看過 firstDiff，差異都在示範區）',
  },
]

/**
 * 每篇文章要跟基準相同的內容輪廓（extract-page.mjs 的 contentProfile）。
 * <br> 比的是段落裡真正的換行（softBr）：Hexo 在程式碼區塊前後、<!-- more --> 前、<video> 裡多出來的 <br>
 * 畫面上沒有多一行，不比。計畫「換行與標點」的檢查就是這一項。
 */
export const PROFILE_LABEL = {
  pre: '<pre> 數量',
  softBr: '段落換行（<br>）數量',
  img: '<img> 數量',
  emphasis: '粗體與斜體（<strong>、<em>）數量',
  marks: '程式碼以外照字面顯示的 * 與 _（多了通常是 ** 或 _ 的強調沒生效：CommonMark 規定 ** 緊貼全形標點、_ 夾在字中間時不算強調）',
}

/**
 * 逐個比對的內容輪廓（extract-page.mjs 的 contentProfile），每篇文章與 about 頁都比：
 * inline code（計畫「inline code 裡的 {{ }}」，VitePress 不保護 inline code；CommonMark 的 code span 規則也跟 marked 不同），
 * 清單結構（marked 與 CommonMark 對子清單縮排、相鄰清單的規則不同，巢狀被攤平時文字指紋看不出來）。
 */
export const PROFILE_SEQUENCE_LABEL = {
  inlineCode: 'inline code', // <pre> 以外的 <code>，逐個比文字
  lists: '清單結構', // ul、ol 的範圍，每個 li 的層級與 ol 編號（例 ol( 1#5 ol( 2#1 2#2 ) 1#6 )）
}

/** 內容輪廓的預期差異：{ url, field, reason }，field 是 PROFILE_LABEL 或 PROFILE_SEQUENCE_LABEL 的鍵。出現差異先查原因再加 */
export const PROFILE_EXPECTED = [
  { url: '/design/2018/10/18/grid-system/', field: 'emphasis', reason: 'Hexo 把公式裡的兩個乘號 * 當成斜體吃掉（「欄位寬度 * (欄數 - 1)」到「20 * 11」變成一段 <em>），新版照字面顯示乘號，公式才是對的' },
  { url: '/design/2018/10/18/grid-system/', field: 'marks', reason: '同上：新版多出來的 2 個 * 是公式的乘號' },
  { url: '/rails/2014/05/09/rails-go/', field: 'emphasis', reason: 'Hexo 把連結文字（一串網址）裡 back=開新_rails_應用程式 的 _rails_ 轉成斜體，網址顯示錯了；新版照字面顯示，跟 href 一致' },
  { url: '/rails/2014/05/09/rails-go/', field: 'marks', reason: '同上：新版多出來的 2 個 _ 是網址本來就有的底線' },
  { url: '/development/2021/10/04/css-animation/', field: 'marks', reason: '計畫「css-animation 的 Vue 3 示範」改寫成 .vue 元件：3 個選單標籤的說明（*動畫所套用的 keyframe 名稱、*動畫持續時間、*動畫播放次數）原本寫在 <script> 的資料裡，基準頁沒有顯示；SSR 之後照字面顯示' },
  { url: '/css/2016/12/06/css-status/', field: 'inlineCode', reason: '計畫「遷移」的個別修正：內文的 <a> 加反引號（Hexo 版被當成標籤吃掉，畫面上看不到），新版多 1 個 inline code「<a>」（scripts/migrate-hexo.mjs 的 PATCHES）' },
  { url: '/javascript/2017/03/03/vscode-for-mac/', field: 'inlineCode', reason: 'Hexo（marked）輸出 <code>Ctrl + \\`</code>，畫面多一個反斜線；CommonMark 的 code span 不認反斜線跳脫，遷移時改用雙反引號，顯示原意的「Ctrl + `」（scripts/migrate-hexo.mjs 的 PATCHES）' },
]

/** 一定要是 ads: false 的頁（計畫「網站地圖」、docs/architecture/ads.md），front matter 的 ads: false 被拿掉時 audit 擋下 */
export const ADS_FALSE_REQUIRED = [
  { url: '/about/hexschool-traning.html', reason: '內容停在 2023 年的舊梯次預約頁，front matter 設 ads: false' },
]

/** <pre>、<code> 以外仍出現 {{ 或 {% 的允許清單：{ url, token, reason } */
export const TEMPLATE_ALLOW = [
  { url: '/development/2022/01/10/install-nvm/', token: '{{', reason: '計畫「內文裡的 {{ version }}」：Hexo 把 4 行佔位字吃掉，遷移時包 <span v-pre> 讓它重新顯示（scripts/migrate-hexo.mjs 的 PATCHES）' },
]

/** 計畫「標題錨點 id」的 23 個固定案例：16 個含 smartypants 字元（9 篇）、7 個含跳脫字元留下的片段（6 篇），從基準 pages.json 查出 */
export const FIXED_ANCHORS = [
  ['/css/2016/01/24/css-3d/', '2016年的冬天…'],
  ['/css/2016/12/08/framework-bootstrap/', 'buttons-scss-tables-scss-utilities-scss-…'],
  ['/design/2018/10/21/color/', '講古中…'],
  ['/development/2020/09/16/chrome-js-alert/', 'Uncaught-SyntaxError-Unexpected-token-‘-’'],
  ['/development/2020/09/16/chrome-js-alert/', 'Uncaught-SyntaxError-Identifier-‘a’-has-already-been-declared'],
  ['/development/2020/09/16/chrome-js-alert/', 'Uncaught-TypeError-Cannot-read-property-‘a’-of-undefined'],
  ['/development/2020/09/16/chrome-js-alert/', 'Uncaught-TypeError-console-log-…-is-not-a-function'],
  ['/development/2020/10/16/async-await/', '使用-try…catch-進行錯誤的處理'],
  ['/development/2021/09/11/css-selector/', '包含特定-“屬性”-的選取'],
  ['/development/2021/09/11/css-selector/', '“屬性及值”-完全符合'],
  ['/development/2021/09/11/css-selector/', '屬性值-”包含特定字串“'],
  ['/development/2021/09/11/css-selector/', '“開頭值”-包含特定文字'],
  ['/development/2021/09/11/css-selector/', '”結尾值“-包含特定文字'],
  ['/javascript/2017/03/03/vscode-for-mac/', 'Gulp、Webpack-…-整合'],
  ['/javascript/2017/12/10/javascript-reference/', 'for…in'],
  ['/javascript/2017/12/15/javascript-use-strict/', '‘use-strict’-及-this'],
  ['/d3js/2014/10/03/Ironman-30-days-04/', 'Example-sweep-flag-amp-large-arc-flag'],
  ['/development/2020/09/18/js-expression-2/', '邏輯運算子-、-amp-amp'],
  ['/development/2020/10/02/about-ajax-3/', '先打開-Chrome-開發者工具-gt-Network'],
  ['/jekyll/2013/12/14/ashare-technology/', 'Git-amp-Github-amp-Github-page'],
  ['/jekyll/2013/12/14/ashare-technology/', 'Sass-amp-Compass-amp-Susy'],
  ['/js/2015/04/23/reactjs-environment/', '安裝Node-js-amp-Gulp'],
  ['/life/2015/01/08/2014-year-report/', 'SASS-amp-Compass'],
].map(([u, id]) => [encodeURI(u), id])

/**
 * 頁型 → 一定要有的 JSON-LD @type（計畫「SEO」的結構化資料）；home 與 not-found 在 P2 不輸出 JSON-LD。
 * home 在有外語首頁時（plan.published 不是空的）另外一定要有 @id 為 WEBSITE_ID 的 WebSite（checkJsonLd）；P3 把 home 改成 ['WebSite']。
 * 法務頁計畫只寫 WebPage，所以只要求 WebPage；about（含 hexschool-traning）計畫寫 WebPage ＋ BreadcrumbList。
 */
export const JSONLD_TYPES = {
  post: ['BlogPosting', 'BreadcrumbList'],
  'blog-index': ['CollectionPage', 'BreadcrumbList'],
  'taxonomy-list': ['CollectionPage', 'BreadcrumbList'],
  'nav-index': ['CollectionPage', 'BreadcrumbList'],
  about: ['WebPage', 'BreadcrumbList'],
  legal: ['WebPage'],
  home: [],
  'not-found': [],
  // 外語首頁（主站首頁規格 D.4）：WebPage，另驗 inLanguage 與 isPartOf
  'site-home': ['WebPage'],
}

/** 文章側欄（theme/components/PostAside.vue）：外框的 class、相關文章上限（lib/pagedata.mjs 的 SIDEBAR_RELATED_COUNT） */
export const SIDEBAR_CLASS = 'post-aside'
export const SIDEBAR_RELATED_MAX = 5

// 要比 h1 的基準頁型（首頁與 /page/N/ 的 H1 依計畫改成站名與「最新文章」，不比）
const H1_TYPES = new Set(['post', 'about', 'category', 'tag', 'archive', 'tags-index'])
const LIST_TYPES = new Set(['home', 'home-page', 'category', 'tag'])

// ============================================================================
// 讀檔
// ============================================================================

/** baseline/ 底下最新的 hexo-* 資料夾 */
export function latestBaselineDir(root = ROOT) {
  const dir = path.join(root, 'baseline')
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((n) => n.startsWith('hexo-')).sort() : []
  if (!names.length) throw new Error(`找不到基準資料夾：${dir}/hexo-*`)
  return path.join(dir, names[names.length - 1])
}

/** 讀基準資料夾 */
export function loadBaseline(dir) {
  const read = (f) => fs.readFileSync(path.join(dir, f))
  const pagesJson = JSON.parse(read('pages.json').toString('utf8'))
  const pages = pagesJson.pages
  return {
    dir,
    commit: pagesJson.source?.commit ?? null,
    pages,
    byUrl: new Map(pages.map((p) => [p.url, p])),
    urls: read('urls.txt').toString('utf8').split('\n').filter(Boolean),
    atom: read('atom.xml').toString('utf8'),
    sitemap: read('sitemap.xml').toString('utf8'),
    content: JSON.parse(read('content.json').toString('utf8')),
    file: (f) => (fs.existsSync(path.join(dir, f)) ? read(f) : null),
  }
}

/** dist 裡所有檔案的相對路徑（/ 分隔，大小寫照檔案系統實際的名稱），HTML 另外讀進來 */
export function scanDist(distDir) {
  if (!fs.existsSync(distDir)) throw new Error(`找不到 dist：${distDir}（先跑 npm run build，或用 --dist 指定）`)
  const files = []
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(distDir, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) walk(r)
      else files.push(r)
    }
  }
  walk('')
  files.sort()
  const html = new Map(files.filter((f) => f.endsWith('.html')).map((f) => [f, fs.readFileSync(path.join(distDir, f), 'utf8')]))
  return { dir: distDir, files, html }
}

/**
 * 從 git 讀基準 commit 裡的檔案（git cat-file --batch，一次讀完）。回傳 { ok, error, get(file) → Buffer|null }。
 * 讀不到（不是 git repo、沒 fetch 基準 commit）時 ok = false，用到它的檢查會列出 error。
 */
export function gitBaselineReader(repoRoot, commit, files) {
  const fail = (error) => ({ ok: false, error, get: () => null })
  if (!commit) return fail('pages.json 沒有 source.commit')
  const hint = `讀不到基準 commit ${commit.slice(0, 10)} 的 git 物件，先跑 git fetch --no-tags --depth=1 origin ${commit}`
  const probe = spawnSync('git', ['-C', repoRoot, 'cat-file', '-e', `${commit}^{commit}`])
  if (probe.status !== 0) return fail(hint)
  const r = spawnSync('git', ['-C', repoRoot, 'cat-file', '--batch'], { input: files.map((f) => `${commit}:${f}\n`).join(''), maxBuffer: 1 << 30 })
  if (r.status !== 0) return fail(`${hint}（${r.stderr?.toString().trim()}）`)
  const out = new Map()
  const buf = r.stdout
  let pos = 0
  for (const f of files) {
    const nl = buf.indexOf(10, pos)
    const [, type, size] = buf.slice(pos, nl).toString().split(' ')
    pos = nl + 1
    if (type !== 'blob') { out.set(f, null); continue }
    out.set(f, buf.subarray(pos, pos + Number(size)))
    pos += Number(size) + 1
  }
  return { ok: true, error: null, get: (f) => out.get(f) ?? null }
}

/** 文章索引（lib/posts.mjs）。讀不到 source/ 時回 null，相關的子檢查改成說明 */
async function tryLoadPosts(srcDir) {
  if (!srcDir || !fs.existsSync(path.join(srcDir, '_posts'))) return null
  const { loadPosts } = await import('../source/.vitepress/lib/posts.mjs')
  return loadPosts(srcDir, { includeUnpublished: true })
}

/** 非文章頁 front matter 的 ads: false（例：about/hexschool-traning.md） */
function frontmatterAdsFalse(srcDir, mdRel) {
  if (!srcDir) return false
  const file = path.join(srcDir, mdRel)
  if (!fs.existsSync(file)) return false
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(file, 'utf8'))
  return !!m && /^ads:\s*false\s*$/m.test(m[1])
}

// ============================================================================
// 共用小工具
// ============================================================================

const instant = (s) => {
  const t = Date.parse(s ?? '')
  return Number.isNaN(t) ? null : t
}
/** ISO 時間 → 台北的日期（YYYY-MM-DD） */
const taipeiDate = (s) => {
  const t = instant(s)
  return t === null ? null : new Date(t + 8 * 3600e3).toISOString().slice(0, 10)
}
const show = (v) => (v === null || v === undefined ? '（無）' : `「${String(v).length > 80 ? String(v).slice(0, 80) + '…' : v}」`)
const dateOfPostUrl = (u) => {
  const m = /^\/[^/]+\/(\d{4})\/(\d{2})\/(\d{2})\//.exec(u)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : ''
}

function newCheck(id, title) {
  return { id, title, ok: true, failures: [], notes: [], stats: {}, summary: '' }
}
function fail(check, msg) {
  check.ok = false
  check.failures.push(msg)
}

/** 把 dist 的 HTML 解析成頁：{ file, url, html, f（extractPage 欄位）, type（VitePress 頁型或錯誤） } */
function parseDistPages(dist) {
  const pages = new Map()
  for (const [file, html] of dist.html) {
    const url = fileToUrl(file)
    let type = null
    let typeError = null
    try { type = pageTypeOf(file.replace(/\.html$/, '.md')) } catch (e) { typeError = e.message }
    pages.set(url, { file, url, html, f: extractPage(html), type, typeError })
  }
  return pages
}

// ============================================================================
// 檢查
// ============================================================================

/** npm script 是否把 hexo 當指令呼叫（hexo g、npx hexo d、a && hexo clean）；migrate-hexo.mjs 這類檔名不算 */
export function callsHexo(script) {
  return /(^|[\s;&|(])hexo(?=$|[\s;&|)])/.test(script)
}

/** repo 裡沒有 wrangler 設定與 Hexo 設定；npm scripts 不再呼叫 hexo */
export function checkRepo(ctx) {
  const c = newCheck('repo', 'repo 裡沒有 wrangler 設定與 _config.yml')
  const skip = new Set(['node_modules', '.git', '.wrangler'])
  const found = []
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(ctx.root, rel), { withFileTypes: true })) {
      if (skip.has(e.name)) continue
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) walk(r)
      else if (/^wrangler\./i.test(e.name) || /^_config(\.[^.]+)?\.ya?ml$/i.test(e.name)) found.push(r)
    }
  }
  walk('')
  for (const f of found) fail(c, `不該存在的設定檔：${f}（部落格 repo 不放 wrangler 設定，Hexo 設定已退役）`)
  const pkgFile = path.join(ctx.root, 'package.json')
  if (fs.existsSync(pkgFile)) {
    const scripts = JSON.parse(fs.readFileSync(pkgFile, 'utf8')).scripts ?? {}
    for (const [k, v] of Object.entries(scripts)) if (callsHexo(v)) fail(c, `package.json 的 scripts.${k} 還在呼叫 hexo：${v}`)
  }
  c.summary = found.length ? `找到 ${found.length} 個` : '沒有'
  return c
}

/** 網址對等：基準的網址都在（逐字、分大小寫），新增的都在允許清單，/_headers 移除 */
export function checkUrls(ctx) {
  const c = newCheck('urls', '網址對等')
  const distUrls = new Set(ctx.dist.files.flatMap((f) => [fileToUrl(f), ...urlAliases(f)]))
  const removed = new Map(REMOVED_URLS.map((r) => [r.url, r.reason]))
  const baseHtml = ctx.baseline.pages
  const missingHtml = baseHtml.filter((p) => !distUrls.has(p.url) || (p.alias && !distUrls.has(p.alias)))
  for (const p of missingHtml) fail(c, `基準頁不在 dist：${p.url}`)
  for (const u of ctx.baseline.urls) {
    if (removed.has(u)) {
      if (distUrls.has(u)) fail(c, `預期移除的 ${u} 還在 dist`)
      else ctx.expect('urls', u, removed.get(u))
      continue
    }
    if (!distUrls.has(u) && !ctx.baseline.byUrl.has(u) && !baseHtml.some((p) => p.alias === u)) fail(c, `基準網址不在 dist：${u}`)
  }
  const base = new Set(ctx.baseline.urls)
  const added = [...distUrls].filter((u) => !base.has(u)).sort()
  const byRule = new Map()
  const rules = [siteHomeUrlRule(ctx.plan.published), ...NEW_URLS]
  for (const u of added) {
    const rule = rules.find((r) => r.test(u))
    if (!rule) fail(c, `未預期的新網址：${u}`)
    else byRule.set(rule.reason, (byRule.get(rule.reason) ?? 0) + 1)
  }
  for (const [reason, n] of byRule) ctx.expect('urls', `新增 ${n} 個`, reason)
  for (const group of caseCollisions(distUrls)) fail(c, `只差大小寫的網址：${group.join('、')}`)
  for (const t of Object.keys(MERGED_TAGS)) if (distUrls.has(`/tags/${t}/`)) fail(c, `大寫標籤目錄應該已併入小寫：/tags/${t}/`)
  const htmlUrls = ctx.dist.files.filter((f) => f.endsWith('.html')).length
  c.stats = { baselineHtml: baseHtml.length, baselineHtmlPresent: baseHtml.length - missingHtml.length, distFiles: ctx.dist.files.length, distHtml: htmlUrls, added: added.length }
  c.summary = `基準 ${baseHtml.length} 個 HTML 頁有 ${c.stats.baselineHtmlPresent} 個在 dist；dist 共 ${htmlUrls} 個 HTML、${ctx.dist.files.length} 個檔；新增網址 ${added.length} 個`
  return c
}

/**
 * 只差大小寫的網址組：GitHub Pages 分大小寫，但 VitePress 用小寫查頁面 chunk，兩頁會互相衝突（計畫「網址規則」第 14 條）。
 * macOS 的檔案系統不分大小寫，這種情況只會在 Linux（CI）上真的出現在 dist 裡。
 */
export function caseCollisions(urls) {
  const folded = new Map()
  for (const u of urls) folded.set(u.toLowerCase(), [...(folded.get(u.toLowerCase()) ?? []), u])
  return [...folded.values()].filter((g) => g.length > 1).map((g) => g.sort())
}

/** 凍結檔逐位元相同：ads.txt、robots.txt、CNAME、search.xml、舊主題的 css 與兩張圖 */
export function checkFrozenFiles(ctx) {
  const c = newCheck('frozen-files', '凍結檔與基準逐位元相同')
  let same = 0
  for (const f of FROZEN_FILES) {
    const distFile = path.join(ctx.dist.dir, f)
    if (!ctx.dist.files.includes(f)) { fail(c, `dist 沒有 ${f}`); continue }
    const expected = ctx.baseline.file(f) ?? (ctx.git.ok ? ctx.git.get(f) : null)
    if (!expected) { fail(c, `沒有 ${f} 的基準可比：${ctx.git.error ?? '基準 commit 裡沒有這個檔'}`); continue }
    const actual = fs.readFileSync(distFile)
    if (sha256(actual) !== sha256(expected)) fail(c, `${f} 跟基準不同（sha256 ${sha256(actual).slice(0, 12)}，基準 ${sha256(expected).slice(0, 12)}）`)
    else same++
  }
  c.summary = `${same} / ${FROZEN_FILES.length} 個相同`
  return c
}

/** 基準頁的 SEO 欄位：title、description、canonical、og:url、FB data-href、lang、h1、published_time、robots、文章的 keywords 與 article:tag、head 標籤不重複 */
export function checkPages(ctx) {
  const c = newCheck('pages', '每頁 SEO 欄位跟基準相同')
  let compared = 0
  let tagged = 0
  for (const p of ctx.baseline.pages) {
    const d = ctx.pages.get(p.url)
    if (!d) continue
    compared++
    const exp = {
      title: p.title, description: p.description, canonical: p.canonical, ogUrl: p.ogUrl,
      fbCommentsHref: p.fbCommentsHref, lang: p.lang, h1: p.h1,
    }
    const fixedCanonical = legacyUrlFix(p.canonical ?? '')
    if (fixedCanonical !== p.canonical) {
      exp.canonical = fixedCanonical
      exp.ogUrl = legacyUrlFix(p.ogUrl ?? '')
      ctx.expect('pages', p.url, '基準的 canonical、og:url 指向線上 404 的寫法（/categories/css/、大寫標籤），新版改成實際的網址（基準 README「對等基準」）')
    }
    const merged = /^\/tags\/(sass|bootstrap|vue)\/$/.exec(p.url)
    if (merged) {
      const upper = Object.keys(MERGED_TAGS).find((k) => MERGED_TAGS[k] === merged[1])
      for (const k of ['title', 'description']) exp[k] = exp[k]?.replaceAll(upper, merged[1]) ?? exp[k]
      exp.h1 = p.h1.map((h) => h.replaceAll(upper, merged[1]))
      ctx.expect('pages', p.url, `基準第 1 頁其實是大寫標籤「${upper}」的內容，合併後 title、description、h1 都用小寫（基準 README「對等基準」）`)
    }
    for (const k of ['title', 'canonical', 'ogUrl', 'fbCommentsHref', 'lang']) {
      if (d.f[k] !== exp[k]) fail(c, `${p.url} ${k}：預期 ${show(exp[k])}，實際 ${show(d.f[k])}`)
    }
    if (p.description === null) {
      if (d.f.description !== null) ctx.expect('pages', p.url, '基準沒有 description（只有 /tags/），新版補上一句不算退步')
    } else if (d.f.description !== exp.description) fail(c, `${p.url} description：預期 ${show(exp.description)}，實際 ${show(d.f.description)}`)
    if (H1_TYPES.has(p.type) && JSON.stringify(d.f.h1) !== JSON.stringify(exp.h1)) fail(c, `${p.url} h1：預期 ${show(exp.h1.join(' / '))}，實際 ${show(d.f.h1.join(' / '))}`)
    if (p.type === 'post' && instant(d.f.publishedTime) !== instant(p.publishedTime)) fail(c, `${p.url} article:published_time：預期 ${show(p.publishedTime)}，實際 ${show(d.f.publishedTime)}`)
    if (/noindex/i.test(d.f.robots ?? '')) fail(c, `${p.url} 有 noindex：${d.f.robots}`)
    if (p.type === 'post' && checkPostTags(ctx, c, p, d)) tagged++
  }
  for (const d of ctx.pages.values()) if (d.f.dupes.length) fail(c, `${d.url} head 標籤重複：${d.f.dupes.join('、')}`)
  c.stats = { compared, tagged }
  c.summary = `比了 ${compared} 頁，其中 ${tagged} 篇文章比了 keywords 與 article:tag`
  return c
}

/** head 裡某個 meta 的所有 content（照出現順序），例 metaValues(html, 'property', 'article:tag') */
export function metaValues(html, attr, key) {
  return findTags(headOf(html), 'meta').filter((m) => (m[attr] ?? '').toLowerCase() === key).map((m) => m.content ?? '')
}

/**
 * 文章的 keywords 與 article:tag 跟基準相同（標籤名稱照 content.json，合併的大寫標籤改成小寫）：
 * keywords 是 Hexo 資料庫的標籤建立順序（等於 content.json 的順序），article:tag 依名稱的字碼順序（基準 364 篇都是）。
 * 比過（基準 content.json 有這一篇）就回傳 true。
 */
function checkPostTags(ctx, c, p, d) {
  ctx.contentByUrl ??= new Map(ctx.baseline.content.map((x) => [encodeURI('/' + x.path), x]))
  const entry = ctx.contentByUrl.get(p.url)
  if (!entry) { fail(c, `${p.url} 不在基準的 content.json，keywords 與 article:tag 沒有基準可比`); return false }
  const byCodeUnit = (xs) => [...xs].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
  const raw = entry.tags.map((t) => t.name)
  const want = expectedContentEntry(entry).tags.map((t) => t.name)
  const kw = metaValues(d.html, 'name', 'keywords')
  const wantKw = want.length ? [want.join(',')] : []
  if (JSON.stringify(kw) !== JSON.stringify(wantKw)) fail(c, `${p.url} keywords：預期 ${show(wantKw[0] ?? null)}，實際 ${show(kw.length ? kw.join(' / ') : null)}`)
  const tags = metaValues(d.html, 'property', 'article:tag')
  if (JSON.stringify(tags) !== JSON.stringify(byCodeUnit(want))) {
    fail(c, `${p.url} article:tag：預期 ${show(byCodeUnit(want).join('、') || null)}（依名稱的字碼順序，跟 Hexo 相同），實際 ${show(tags.join('、') || null)}`)
  }
  if (JSON.stringify(want) !== JSON.stringify(raw)) {
    ctx.expect('pages', `${p.url} keywords、article:tag`, '只差大小寫的標籤（Sass、Bootstrap、Vue）合併成小寫，keywords 與 article:tag 用小寫的名稱，article:tag 依新名稱重新排序（基準 README「對等基準」）')
  }
  return true
}

/** 站名：首頁 title 與全站 og:site_name 仍是舊站名（P2 不改站名，計畫「站名與首頁 title」） */
export function checkSiteName(ctx) {
  const c = newCheck('site-name', '首頁 title 與全站 og:site_name')
  const home = ctx.pages.get('/')
  if (!home) fail(c, 'dist 沒有首頁')
  else if (home.f.title !== SITE_TITLE_LEGACY) fail(c, `首頁 title：預期 ${show(SITE_TITLE_LEGACY)}，實際 ${show(home.f.title)}`)
  let n = 0
  let homes = 0
  for (const d of ctx.pages.values()) {
    // 外語首頁的 og:site_name 是 siteName(code)，蓋掉 siteHead 的舊站名（主站首頁規格 D.2）
    if (d.type === 'site-home') {
      const code = d.url.slice(1, -1)
      const want = siteName(code)
      if (d.f.ogSiteName !== want) fail(c, `${d.url} og:site_name：預期 ${show(want)}（siteName('${code}')），實際 ${show(d.f.ogSiteName)}`)
      else homes++
      continue
    }
    if (d.f.ogSiteName === SITE_TITLE_LEGACY) { n++; continue }
    if (d.type === 'not-found' && d.f.ogSiteName === null) continue
    fail(c, `${d.url} og:site_name：預期 ${show(SITE_TITLE_LEGACY)}，實際 ${show(d.f.ogSiteName)}`)
  }
  c.summary = `${n} 頁的 og:site_name 是「${SITE_TITLE_LEGACY}」${homes ? `，${homes} 個外語首頁是 siteName(code)` : ''}`
  return c
}

/** 新頁：/categories/、/privacy/、/contact/、/terms/ 的 canonical 與基本 SEO 欄位；404 要 noindex，title 與 description 是中文 */
export function checkNewPages(ctx) {
  const c = newCheck('new-pages', '新頁與 404 的 SEO 欄位')
  for (const u of NEW_PAGES) {
    const d = ctx.pages.get(u)
    if (!d) { fail(c, `缺少新頁 ${u}`); continue }
    const want = SITE + u
    if (d.f.canonical !== want) fail(c, `${u} canonical：預期 ${show(want)}，實際 ${show(d.f.canonical)}`)
    if (d.f.ogUrl !== want) fail(c, `${u} og:url：預期 ${show(want)}，實際 ${show(d.f.ogUrl)}`)
    if (!d.f.title) fail(c, `${u} 沒有 title`)
    if (!d.f.description) fail(c, `${u} 沒有 description`)
    if (d.f.h1.length !== 1) fail(c, `${u} 的 h1 有 ${d.f.h1.length} 個，應該剛好 1 個`)
    if (/noindex/i.test(d.f.robots ?? '')) fail(c, `${u} 不該 noindex`)
  }
  // /privacy/ 要留著 AdSense 規定的停用個人化廣告連結（docs/architecture/ads.md「/privacy/ 要寫的內容」），改稿時不小心刪掉會被擋
  const privacy = ctx.pages.get('/privacy/')
  if (privacy) {
    const hrefs = findTags(stripHidden(privacy.html), 'a').map((a) => a.href ?? '')
    for (const host of PRIVACY_REQUIRED_HOSTS) {
      if (!hrefs.some((h) => { try { return new URL(h).hostname === host } catch { return false } })) fail(c, `/privacy/ 少了連到 ${host} 的連結（AdSense 規定的揭露）`)
    }
  }
  const nf = ctx.pages.get('/404.html')
  if (!nf) fail(c, '缺少 /404.html')
  else {
    if (!/noindex/i.test(nf.f.robots ?? '')) fail(c, '/404.html 要有 <meta name="robots" content="noindex">')
    // 頁面文案用繁體中文：VitePress 內建的 404 是「404 | 站名」與「Not Found」，換成 theme/head.mjs 的中文
    if (nf.f.title !== NOT_FOUND_TITLE) fail(c, `/404.html title：預期 ${show(NOT_FOUND_TITLE)}，實際 ${show(nf.f.title)}`)
    if (nf.f.description !== NOT_FOUND_DESCRIPTION) fail(c, `/404.html description：預期 ${show(NOT_FOUND_DESCRIPTION)}，實際 ${show(nf.f.description)}`)
  }
  c.summary = `${NEW_PAGES.length} 個新頁、404`
  return c
}

/** 標題 id：基準的 id 全部找得到、23 個固定案例、基準能用的站內 # 連結仍然能用 */
export function checkAnchors(ctx) {
  const c = newCheck('anchors', '標題 id 與站內 # 連結')
  let ids = 0
  let exact = 0
  let links = 0
  const reordered = []
  for (const p of ctx.baseline.pages) {
    if (p.type !== 'post' && p.type !== 'about') continue
    const d = ctx.pages.get(p.url)
    if (!d) continue
    const have = idsIn(d.html)
    for (const id of p.headingIds) {
      ids++
      if (!have.has(id)) fail(c, `${p.url} 少了標題 id「${id}」`)
    }
    const now = headingIdsOf(builtArticleOf(d.html))
    if (JSON.stringify(now) === JSON.stringify(p.headingIds)) exact++
    else if (p.headingIds.every((id) => have.has(id))) reordered.push(p.url)
    if (!ctx.git.ok) continue
    const baseHtml = ctx.baseHtml(p)
    if (!baseHtml) continue
    const baseIds = idsIn(baseHtml)
    const nowLinks = new Set(hashLinks(builtArticleOf(d.html)))
    for (const target of hashLinks(articleOf(baseHtml))) {
      if (!baseIds.has(target)) continue // 基準就壞掉的連結（多半是示範用的 href="#1"），不追究
      links++
      if (!nowLinks.has(target)) fail(c, `${p.url} 少了站內連結 #${target}`)
      else if (!have.has(target)) fail(c, `${p.url} 的 #${target} 找不到目標`)
    }
  }
  let fixed = 0
  for (const [u, id] of ctx.fixedAnchors) {
    const d = ctx.pages.get(u)
    if (d && idsIn(d.html).has(id)) fixed++
    else fail(c, `固定案例 ${u}#${id} 找不到`)
  }
  if (!ctx.git.ok) fail(c, `站內 # 連結沒檢查：${ctx.git.error}`)
  for (const u of reordered) c.notes.push(`${u}：舊 id 都在，但標題 id 的順序或數量跟基準不同（例外錨點），請確認列在 anchor-exceptions.md`)
  c.stats = { ids, exactPages: exact, fixed, links }
  c.summary = `基準 ${ids} 個標題 id；${exact} 頁逐一相同；固定案例 ${fixed} / ${ctx.fixedAnchors.length}；站內 # 連結 ${links} 個`
  return c
}

/** 本文指紋：文章與 about 頁的本文，正規化後相似度至少 TEXT_MIN */
export function checkText(ctx) {
  const c = newCheck('text', '本文文字指紋')
  const allow = new Map(TEXT_EXPECTED.map((e) => [encodeURI(e.url), e]))
  const used = new Set()
  let exact = 0
  let close = 0
  let worst = 1
  const results = []
  for (const p of ctx.baseline.pages) {
    if (p.type !== 'post' && p.type !== 'about') continue
    const d = ctx.pages.get(p.url)
    if (!d) continue
    if (!hasProse(d.html)) { fail(c, `${p.url} 找不到本文容器（class 含 prose 的元素）`); continue }
    const article = builtArticleOf(d.html)
    if (sha256(fingerprintText(article)) === p.textSha256) { exact++; continue }
    const now = comparableText(article)
    if (!now) { fail(c, `${p.url} 文章內文是空的`); continue }
    const baseHtml = ctx.baseHtml(p)
    if (!baseHtml) { fail(c, `${p.url} 指紋不同，但讀不到基準 HTML 算相似度：${ctx.git.error}`); continue }
    const before = comparableText(articleOf(baseHtml))
    const rule = allow.get(p.url)
    const sim = similarity(before, now, { min: Math.min(TEXT_MIN, rule?.min ?? TEXT_MIN) })
    const ratio = sim.ratio
    results.push({ url: p.url, ratio, upper: sim.upper })
    if (ratio !== null) worst = Math.min(worst, ratio)
    if (ratio !== null && ratio >= TEXT_MIN) { close++; continue }
    if (rule && ratio !== null && ratio >= rule.min) { used.add(p.url); ctx.expect('text', p.url, rule.reason); continue }
    const diff = firstDiff(before, now)
    const r = ratio === null ? `低於 ${rule?.min ?? TEXT_MIN}（上限 ${sim.upper.toFixed(4)}）` : ratio.toFixed(4)
    fail(c, `${p.url} 相似度 ${r}${diff ? `，第 ${diff.at} 字起：基準「${diff.expected}」，新版「${diff.actual}」` : ''}`)
  }
  for (const u of allow.keys()) if (!used.has(u)) c.notes.push(`白名單沒用到：${u}（已經達到 ${TEXT_MIN}，可以拿掉）`)
  c.stats = { exact, close, worst, below: results.filter((r) => r.ratio === null || r.ratio < TEXT_MIN).map((r) => r.url) }
  c.summary = `指紋完全相同 ${exact} 頁，正規化後 ≥ ${TEXT_MIN} 有 ${close} 頁，最低 ${worst.toFixed(4)}`
  return c
}

/** 本文結構：文章與 about 頁的 <pre>、<br>、<img> 數量，inline code 與清單結構逐個比，cssdemo 樣式，css-animation 不載入 unpkg */
export function checkContent(ctx) {
  const c = newCheck('content', '本文結構（pre、段落換行、img、粗體斜體、inline code、清單、cssdemo）')
  const allow = new Map(PROFILE_EXPECTED.map((e) => [`${encodeURI(e.url)} ${e.field}`, e.reason]))
  const totals = Object.fromEntries(Object.keys(PROFILE_LABEL).map((k) => [k, 0]))
  const seqTotals = { inlineCode: 0, lists: 0 }
  if (!ctx.git.ok) fail(c, `讀不到基準 HTML，pre、br、img、inline code、清單、cssdemo 都沒比：${ctx.git.error}`)
  for (const p of ctx.baseline.pages) {
    if ((p.type !== 'post' && p.type !== 'about') || !ctx.git.ok) continue
    const d = ctx.pages.get(p.url)
    const baseHtml = ctx.baseHtml(p)
    if (!d || !baseHtml) continue
    const before = contentProfile(articleOf(baseHtml))
    const now = contentProfile(builtArticleOf(d.html))
    for (const k of Object.keys(PROFILE_LABEL)) {
      totals[k] += before[k]
      if (before[k] === now[k]) continue
      const reason = allow.get(`${p.url} ${k}`)
      if (reason) ctx.expect('content', `${p.url} ${k}`, reason)
      else fail(c, `${p.url} ${PROFILE_LABEL[k]}：基準 ${before[k]}，新版 ${now[k]}`)
    }
    // inline code 比的是去空白後的文字，兩邊都先套 normalizePunct，彎引號、破折號這類字元的寫法不算差異
    const seq = { inlineCode: [before.inlineCode.map(normalizePunct), now.inlineCode.map(normalizePunct)], lists: [before.lists, now.lists] }
    for (const [k, [a, b]] of Object.entries(seq)) {
      seqTotals[k] += k === 'lists' ? a.filter((x) => x !== ')' && !x.endsWith('(')).length : a.length
      if (JSON.stringify(a) === JSON.stringify(b)) continue
      const reason = allow.get(`${p.url} ${k}`)
      if (reason) { ctx.expect('content', `${p.url} ${k}`, reason); continue }
      let i = a.findIndex((x, j) => x !== b[j])
      if (i === -1) i = a.length // 基準是新版的開頭一段，差在新版多出來的部分
      const around = (xs) => (k === 'lists' ? `「${xs.slice(Math.max(0, i - 3), i + 6).join(' ')}」` : show(xs[i]))
      fail(c, `${p.url} ${PROFILE_SEQUENCE_LABEL[k]} 不同：第 ${i + 1} 個起，基準 ${around(a)}，新版 ${around(b)}（基準 ${a.length} 個，新版 ${b.length} 個）`)
    }
    const demoBefore = demoCssLinks(baseHtml)
    const demoNow = new Set(demoCssLinks(d.html))
    for (const href of demoBefore) if (!demoNow.has(href)) fail(c, `${p.url} head 少了 cssdemo 樣式 ${href}`)
  }
  if (ctx.posts) {
    for (const post of ctx.posts.filter((x) => x.published && x.cssdemo?.length)) {
      const u = encodeURI(post.url)
      const d = ctx.pages.get(u)
      if (!d) continue
      const have = new Set(demoCssLinks(d.html))
      for (const name of post.cssdemo) {
        if (![...have].some((h) => h.endsWith(`/demoFile/css/${name}.css`))) fail(c, `${u} head 少了 cssdemo「${name}」的樣式`)
      }
    }
  }
  const anim = ctx.pages.get('/development/2021/10/04/css-animation/')
  if (anim && /unpkg\.com/.test(anim.html)) fail(c, '/development/2021/10/04/css-animation/ 還在載入 unpkg（計畫：改寫成 .vue 元件）')
  c.stats = { ...totals, ...seqTotals }
  c.summary = ctx.git.ok
    ? `基準文章與 about 頁共 <pre> ${totals.pre}、段落換行 ${totals.softBr}、<img> ${totals.img}、粗體斜體 ${totals.emphasis}、照字面的 * 與 _ ${totals.marks}、inline code ${seqTotals.inlineCode}、清單項目 ${seqTotals.lists}`
    : '沒比（缺基準 HTML）'
  return c
}

/** 列表：首頁、/page/N/、分類、標籤的卡片順序與摘要，合併標籤的分頁，封存、/tags/、/categories/ 的連結 */
export function checkLists(ctx) {
  const c = newCheck('lists', '列表頁的卡片與連結')
  if (!ctx.git.ok) { fail(c, `讀不到基準 HTML，列表沒比：${ctx.git.error}`); return c }
  const excerpts = new Map()
  for (const p of ctx.baseline.pages) {
    if (!LIST_TYPES.has(p.type)) continue
    for (const card of hexoCards(ctx.baseHtml(p) ?? '')) if (!excerpts.has(card.url)) excerpts.set(card.url, card.excerpt)
  }
  let pages = 0
  let cards = 0
  for (const p of ctx.baseline.pages) {
    const d = ctx.pages.get(p.url)
    const baseHtml = ctx.baseHtml(p)
    if (!d || !baseHtml) continue
    if (LIST_TYPES.has(p.type)) {
      pages++
      if (MERGED_TAG_PAGE_RE.test(p.url)) continue // 合併標籤另外比
      const before = hexoCards(baseHtml).map((x) => x.url)
      const now = builtCards(d.html).map((x) => x.url)
      if (!now.length) { fail(c, `${p.url} 找不到卡片（class 含 post-card 的元素）`); continue }
      if (JSON.stringify(before) !== JSON.stringify(now)) {
        const i = before.findIndex((u, j) => u !== now[j])
        fail(c, `${p.url} 卡片順序不同：第 ${i + 1} 張，基準 ${before[i] ?? '（無）'}，新版 ${now[i] ?? '（無）'}（基準 ${before.length} 張，新版 ${now.length} 張）`)
      }
    } else if (p.type === 'archive') {
      pages++
      const before = postLinks(baseHtml)
      const now = postLinks(d.html)
      if (JSON.stringify(before) !== JSON.stringify(now)) fail(c, `${p.url} 封存的文章連結不同：基準 ${before.length} 篇，新版 ${now.length} 篇`)
    } else if (p.type === 'tags-index') {
      pages++
      const pattern = /^\/tags\/[^/]+\/$/
      const want = new Set([...linkSet(baseHtml, pattern)].map(legacyUrlFix))
      const now = linkSet(d.html, pattern)
      for (const u of want) if (!now.has(u)) fail(c, `/tags/ 少了 ${u}`)
      for (const u of now) if (!want.has(u)) fail(c, `/tags/ 多了 ${u}`)
      ctx.expect('lists', '/tags/', 'Sass、Bootstrap、Vue 併入小寫，標籤雲少了 3 個大寫的連結')
    }
  }
  // 每張卡的摘要跟基準同一篇的卡片摘要相同（計畫「文章卡片」：首頁和列表頁的卡片摘要跟基準相同）
  const badExcerpt = new Set()
  for (const d of ctx.pages.values()) {
    if (d.type !== 'home' && d.type !== 'blog-index' && d.type !== 'taxonomy-list') continue
    for (const card of builtCards(d.html)) {
      cards++
      if (!excerpts.has(card.url) || badExcerpt.has(card.url)) continue
      const want = normalizePunct((excerpts.get(card.url) ?? '').replace(/\s+/g, ''))
      const got = normalizePunct((card.excerpt ?? '').replace(/\s+/g, ''))
      if (want !== got) {
        badExcerpt.add(card.url)
        fail(c, `${card.url} 的卡片摘要不同（${d.url}）：基準 ${show(excerpts.get(card.url))}，新版 ${show(card.excerpt)}`)
      }
    }
  }
  checkMergedTags(ctx, c)
  // /categories/ 總覽：連到 27 個分類
  const overview = ctx.pages.get('/categories/')
  if (overview) {
    const want = new Set(ctx.categories.map((name) => encodeURI(`/categories/${categoryDirOf(name)}/`)))
    const now = linkSet(overview.html, /^\/categories\/[^/]+\/$/)
    for (const u of want) if (!now.has(u)) fail(c, `/categories/ 少了 ${u}`)
    for (const u of now) if (!want.has(u)) fail(c, `/categories/ 多了不在白名單的 ${u}`)
  }
  // 站內連結不能再指向線上 404 的舊寫法
  for (const d of ctx.pages.values()) {
    const bad = [...new Set(findTags(stripHidden(d.html), 'a').map((a) => normalizeHref(a.href)).filter((u) => u && legacyUrlFix(u) !== u))]
    if (bad.length) fail(c, `${d.url} 還連到舊寫法：${bad.slice(0, 3).join('、')}`)
  }
  c.stats = { pages, cards, excerpts: excerpts.size }
  c.summary = `比了 ${pages} 個列表頁、${cards} 張卡片`
  return c
}

const categoryDirOf = (name) => (name === 'css' ? 'CSS' : name)

/** 合併的小寫標籤：篇數、分頁數、每頁 10 篇、日期由新到舊（計畫「只差大小寫的標籤」） */
function checkMergedTags(ctx, c) {
  for (const tag of Object.values(MERGED_TAGS)) {
    const want = ctx.baseline.content.filter((post) => post.tags.some((t) => t.name.toLowerCase() === tag)).map((post) => encodeURI('/' + post.path))
    const total = Math.ceil(want.length / 10)
    const seq = []
    for (let n = 1; n <= total; n++) {
      const u = n === 1 ? `/tags/${tag}/` : `/tags/${tag}/page/${n}/`
      const d = ctx.pages.get(u)
      if (!d) { fail(c, `合併標籤缺少 ${u}`); continue }
      const cards = builtCards(d.html).map((x) => x.url)
      const size = n < total ? 10 : want.length - 10 * (total - 1)
      if (cards.length !== size) fail(c, `${u} 有 ${cards.length} 張卡，應該是 ${size} 張`)
      seq.push(...cards)
    }
    if (ctx.pages.has(`/tags/${tag}/page/${total + 1}/`)) fail(c, `合併標籤多出 /tags/${tag}/page/${total + 1}/`)
    const missing = want.filter((u) => !seq.includes(u))
    const extra = seq.filter((u) => !want.includes(u))
    if (missing.length) fail(c, `/tags/${tag}/ 少了 ${missing.length} 篇：${missing.slice(0, 3).join('、')}`)
    if (extra.length) fail(c, `/tags/${tag}/ 多了 ${extra.length} 篇：${extra.slice(0, 3).join('、')}`)
    for (let i = 1; i < seq.length; i++) {
      if (dateOfPostUrl(seq[i]) > dateOfPostUrl(seq[i - 1])) { fail(c, `/tags/${tag}/ 的文章不是由新到舊：${seq[i - 1]} 之後是 ${seq[i]}`); break }
    }
    ctx.expect('lists', `/tags/${tag}/`, `大小寫合併後共 ${want.length} 篇、${total} 頁，跟基準的分頁內容不同（計畫「只差大小寫的標籤」）`)
  }
}

/** atom.xml、content.json、sitemap.xml，以及 published: false 的文章不外流 */
export function checkFeeds(ctx) {
  const c = newCheck('feeds', 'atom.xml、content.json、sitemap.xml')
  const homeLocs = ctx.plan.published.map((x) => siteHomeUrl(x))
  const readDist = (f) => (ctx.dist.files.includes(f) ? fs.readFileSync(path.join(ctx.dist.dir, f), 'utf8') : null)
  // atom：20 筆的 id、link、published 逐字相同
  const atom = readDist('atom.xml')
  if (!atom) fail(c, 'dist 沒有 atom.xml')
  else {
    const before = atomEntries(ctx.baseline.atom)
    const now = atomEntries(atom)
    if (now.length !== before.length) fail(c, `atom.xml 有 ${now.length} 筆，基準 ${before.length} 筆`)
    before.forEach((e, i) => {
      for (const k of ['id', 'link', 'published']) if (now[i]?.[k] !== e[k]) fail(c, `atom.xml 第 ${i + 1} 筆 <${k}>：預期 ${show(e[k])}，實際 ${show(now[i]?.[k])}`)
    })
    for (const u of homeLocs) if (atom.includes(`>${u}<`) || atom.includes(`"${u}"`)) fail(c, `atom.xml 有外語首頁 ${u}（只放中文文章，主站首頁規格 D.8）`)
  }
  // content.json：364 筆，欄位與內容跟基準相同（分類與合併標籤的網址照新寫法）
  const contentRaw = readDist('content.json')
  let content = null
  if (!contentRaw) fail(c, 'dist 沒有 content.json')
  else {
    try { content = JSON.parse(contentRaw) } catch (e) { fail(c, `content.json 不是合法的 JSON：${e.message}`) }
  }
  if (content) {
    const list = Array.isArray(content) ? content : []
    if (list.length !== ctx.baseline.content.length) fail(c, `content.json 有 ${list.length} 筆，基準 ${ctx.baseline.content.length} 筆`)
    const byPath = new Map(list.map((x) => [x.path, x]))
    for (const post of ctx.baseline.content) {
      const got = byPath.get(post.path)
      if (!got) { fail(c, `content.json 少了 ${post.path}`); continue }
      const want = expectedContentEntry(post)
      if (canonicalJson(got) !== canonicalJson(want)) fail(c, `content.json 的 ${post.path} 跟基準不同：預期 ${canonicalJson(want).slice(0, 160)}，實際 ${canonicalJson(got).slice(0, 160)}`)
    }
    for (const u of homeLocs) if (contentRaw.includes(`"${u}"`) || list.some((x) => `${SITE}/${x.path}` === u)) fail(c, `content.json 有外語首頁 ${u}（⌘K 只搜中文文章與工具，主站首頁規格 D.8）`)
    ctx.expect('feeds', 'content.json', '分類 css 的 permalink 改成 /categories/CSS/，Sass、Bootstrap、Vue 改成小寫（基準 README「對等基準」）')
  }
  // sitemap：網址集合 = 基準 - 3 個大寫標籤，/categories/css/ 換成 /categories/CSS/，再加新頁
  const sitemap = readDist('sitemap.xml')
  if (!sitemap) fail(c, 'dist 沒有 sitemap.xml')
  else {
    const want = expectedSitemap(ctx.baseline.sitemap, { siteHomes: ctx.plan.published })
    const items = sitemapItems(sitemap)
    const now = new Set(items.map((x) => x.loc))
    for (const u of want) if (!now.has(u)) fail(c, `sitemap 少了 ${u}`)
    for (const u of now) if (!want.has(u)) fail(c, `sitemap 多了 ${u}`)
    const postsByUrl = new Map((ctx.posts ?? []).map((x) => [SITE + encodeURI(x.url), x]))
    for (const it of items) {
      const pathPart = it.loc.startsWith(SITE) ? it.loc.slice(SITE.length) : it.loc
      const d = ctx.pages.get(pathPart) ?? ctx.pages.get(pathPart + '.html')
      if (d && d.f.canonical !== it.loc) fail(c, `sitemap 的 ${it.loc} 跟該頁 canonical ${show(d.f.canonical)} 不同`)
      if (d && (d.type === 'taxonomy-list' || d.type === 'nav-index') && it.lastmod) fail(c, `sitemap 的列表頁 ${it.loc} 不該有 lastmod`)
      if (homeLocs.includes(it.loc) && it.lastmod) fail(c, `sitemap 的外語首頁 ${it.loc} 不該有 lastmod（首頁沒有可信的更新日，主站首頁規格 D.8）`)
      if (it.lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(it.lastmod)) fail(c, `sitemap 的 ${it.loc} lastmod 應該只有日期（YYYY-MM-DD，跟基準同格式），實際 ${show(it.lastmod)}`)
      const post = postsByUrl.get(it.loc)
      if (post) {
        const want2 = post.updated ?? post.date
        const got = it.lastmod && it.lastmod.length > 10 ? taipeiDate(it.lastmod) : it.lastmod
        if (got !== want2) fail(c, `sitemap 的 ${it.loc} lastmod：預期 ${want2}（updated，沒有就用發布日），實際 ${show(it.lastmod)}`)
      }
    }
    if (!ctx.posts) c.notes.push('讀不到文章索引，sitemap 的 lastmod 沒比')
    ctx.expect('feeds', 'sitemap.xml', '拿掉 3 個線上 404 的大寫標籤、/categories/css/ 換成 /categories/CSS/、加上 /categories/ 與 3 個法務頁（計畫「/sitemap.xml」）')
  }
  if (ctx.plan.published.length) ctx.expect('feeds', 'sitemap.xml 的外語首頁', `sitemap 加上 ${ctx.plan.published.map((x) => `/${x}/`).join('、')}（主站首頁規格 D.8）`)
  // published: false 的文章：dist、atom、content.json 都沒有（計畫「published: false」）
  const hidden = (ctx.posts ?? []).filter((x) => !x.published)
  for (const post of hidden) {
    const u = encodeURI(post.url)
    if (ctx.pages.has(u)) fail(c, `未發布的文章出現在 dist：${u}`)
    if (atom?.includes(SITE + u)) fail(c, `未發布的文章出現在 atom.xml：${u}`)
    if (content?.some?.((x) => '/' + x.path === post.url || encodeURI('/' + x.path) === u)) fail(c, `未發布的文章出現在 content.json：${u}`)
    if (sitemap?.includes(SITE + u)) fail(c, `未發布的文章出現在 sitemap.xml：${u}`)
  }
  c.summary = `atom ${atom ? atomEntries(atom).length : 0} 筆、content.json ${Array.isArray(content) ? content.length : 0} 筆、sitemap ${sitemap ? sitemapItems(sitemap).length : 0} 個網址；未發布 ${hidden.length} 篇`
  return c
}

export function atomEntries(xml) {
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => ({
    id: decodeEntities(/<id>([\s\S]*?)<\/id>/.exec(m[1])?.[1]?.trim() ?? ''),
    link: decodeEntities(/<link\b[^>]*\bhref="([^"]*)"/.exec(m[1])?.[1] ?? ''),
    published: /<published>([\s\S]*?)<\/published>/.exec(m[1])?.[1]?.trim() ?? '',
  }))
}

export function sitemapItems(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: sitemapLocs(m[1])[0] ?? '',
    lastmod: /<lastmod>([\s\S]*?)<\/lastmod>/.exec(m[1])?.[1]?.trim() ?? null,
  }))
}

/** 新 sitemap 應有的網址集合；siteHomes 是 plan.published，每個外語首頁的完整網址也要在（主站首頁規格 J.1） */
export function expectedSitemap(baselineXml, { siteHomes = [] } = {}) {
  const out = new Set()
  for (const u of sitemapLocs(baselineXml)) {
    if (Object.keys(MERGED_TAGS).some((t) => u === `${SITE}/tags/${t}/`)) continue
    out.add(legacyUrlFix(u))
  }
  for (const u of NEW_PAGES) out.add(SITE + u)
  for (const code of siteHomes) out.add(siteHomeUrl(code))
  return out
}

/** 基準 content.json 的一筆 → 新版應有的樣子：合併標籤改小寫（重複的去掉），permalink 照新寫法 */
export function expectedContentEntry(post) {
  const fixTerm = (t) => {
    const name = MERGED_TAGS[t.name] ?? t.name
    const slug = MERGED_TAGS[t.slug] ?? t.slug
    return { ...t, name, slug, permalink: legacyUrlFix(t.permalink) }
  }
  const tags = []
  for (const t of post.tags.map(fixTerm)) if (!tags.some((x) => x.name === t.name)) tags.push(t)
  return { ...post, categories: post.categories.map((t) => ({ ...t, permalink: legacyUrlFix(t.permalink) })), tags }
}

/** key 排序後的 JSON，比內容不比 key 順序 */
export function canonicalJson(v) {
  if (Array.isArray(v)) return `[${v.map(canonicalJson).join(',')}]`
  if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(v[k])}`).join(',')}}`
  return JSON.stringify(v)
}

/** 廣告：每頁 loader 0 或 1 次，依頁型與 ADS_MODE；每頁有 google-adsense-account meta；全站沒有 ins.adsbygoogle */
export function checkAds(ctx) {
  const c = newCheck('ads', `AdSense loader（ADS_MODE = ${ctx.adsMode}）`)
  const dist = {}
  for (const d of ctx.pages.values()) {
    if (!d.type) { fail(c, `${d.url} 判斷不出頁型：${d.typeError}`); continue }
    const n = countAdsLoaders(d.html)
    const adsFalse = ctx.adsFalse.has(d.url)
    // 外語首頁 site-home 跟其他頁型一樣照 shouldLoadAds（站長 2026-11-04 改成 standardOnly，0008 更正第 9 點）
    const want = shouldLoadAds({ type: d.type, adsFalse }, ctx.adsMode)
    const key = adsFalse ? `${d.type}（ads: false）` : d.type
    dist[key] ??= { pages: 0, loaded: 0, expected: want ? 1 : 0 }
    dist[key].pages++
    if (n) dist[key].loaded++
    if (n > 1) fail(c, `${d.url} 的 loader 出現 ${n} 次`)
    else if (want && n !== 1) fail(c, `${d.url}（${key}）應該載入 loader，但沒有`)
    else if (!want && n !== 0) fail(c, `${d.url}（${key}）不該載入 loader`)
    const meta = findTags(headOf(d.html), 'meta').some((m) => m.name === 'google-adsense-account' && m.content === ADSENSE_CLIENT)
    if (!meta) fail(c, `${d.url} 少了 google-adsense-account meta`)
    if (findTags(d.html, 'ins').some((t) => hasClass(t, 'adsbygoogle'))) fail(c, `${d.url} 有 <ins class="adsbygoogle">（只用 Auto ads，不放手動版位）`)
  }
  for (const r of ADS_FALSE_REQUIRED) {
    const d = ctx.pages.get(encodeURI(r.url))
    if (!d) continue
    if (!ctx.adsFalse.has(d.url)) fail(c, `${r.url} 的 front matter 要有 ads: false（${r.reason}）`)
    if (countAdsLoaders(d.html) !== 0) fail(c, `${r.url} 不該載入 loader（${r.reason}）`)
  }
  for (const f of ctx.dist.files.filter((x) => /^assets\/.*\.js$/.test(x))) {
    const js = fs.readFileSync(path.join(ctx.dist.dir, f), 'utf8')
    if (/<ins\b[^>]*adsbygoogle|["']ins["'][^;]{0,200}?["']adsbygoogle["']/.test(js)) fail(c, `${f} 裡有 ins.adsbygoogle`)
  }
  c.stats = dist
  c.summary = Object.entries(dist).map(([k, v]) => `${k} ${v.loaded}/${v.pages}`).join('、')
  return c
}

/**
 * 版面根元素有 vp-raw（計畫「站內換頁」：整頁載入）；站點資料的 router.prefetchLinks 是 false。
 * 整頁載入時下一頁 hydrate 用 .lean.js，VitePress 預設替視窗裡的站內連結預抓的 .md.js 全部用不到（側欄一篇就多 20 多個）。
 */
export function checkLayout(ctx) {
  const c = newCheck('layout', '版面根元素有 vp-raw，每頁一個 <main>，關掉連結預抓')
  let n = 0
  let prefetchOff = 0
  const shared = ctx.shell === 'shared'
  for (const d of ctx.pages.values()) {
    if (rootHasVpRaw(d.html)) n++
    else fail(c, `${d.url} 的版面根元素沒有 vp-raw`)
    // 每頁剛好一個 <main>、一個 id="main"（Layout.vue 輸出，SiteHomePage.vue 不再自己包，主站首頁規格 E.1）
    const tags = startTags(stripHidden(d.html.slice(headOf(d.html).length)))
    const mains = tags.filter((t) => t.name === 'main').length
    const ids = tags.filter((t) => t.attrs.id === 'main').length
    if (mains !== 1) fail(c, `${d.url} 有 ${mains} 個 <main>，要剛好一個`)
    if (ids !== 1) fail(c, `${d.url} 有 ${ids} 個 id="main"，要剛好一個`)
    if (d.type === 'site-home' && !rootClassesOf(d.html).includes('page-type-site-home')) fail(c, `${d.url} 是外語首頁，版面根元素要有 page-type-site-home`)
    // S 起每頁都有共用頁首頁尾（主站首頁規格 G.5）
    if (shared) {
      if (!tags.some((t) => t.name === 'header' && hasClass(t.attrs, 'cs-hdr'))) fail(c, `${d.url} 沒有共用頁首 <header class="cs-hdr">（shell 是 shared）`)
      if (!tags.some((t) => t.name === 'footer' && hasClass(t.attrs, 'cs-ftr'))) fail(c, `${d.url} 沒有共用頁尾 <footer class="cs-ftr">（shell 是 shared）`)
    }
    const prefetch = prefetchLinksOf(d.html)
    if (prefetch === false) prefetchOff++
    else if (prefetch === true) fail(c, `${d.url} 的站點資料 router.prefetchLinks 是 true（整頁載入用不到預抓的 .md.js，config.mts 要設 false）`)
  }
  if (ctx.pages.size && !prefetchOff) fail(c, '每一頁的站點資料都讀不到 router.prefetchLinks: false（config.mts 要設 router: { prefetchLinks: false }）')
  c.summary = `vp-raw ${n} / ${ctx.pages.size} 頁，關掉預抓 ${prefetchOff} 頁`
  return c
}

/** 頁面內嵌的 VitePress 站點資料（window.__VP_SITE_DATA__=JSON.parse("…")）的 router.prefetchLinks；讀不到是 null */
export function prefetchLinksOf(html) {
  const m = /__VP_SITE_DATA__\s*=\s*JSON\.parse\(("(?:[^"\\]|\\.)*")\)/.exec(html)
  if (!m) return null
  try {
    const value = JSON.parse(JSON.parse(m[1]))?.router?.prefetchLinks
    return typeof value === 'boolean' ? value : null
  } catch {
    return null
  }
}

/** <main> 裡 class 含 cls 的 <tagName> 元素的 HTML（開始標籤到第一個同名結束標籤；側欄、上下篇、接著讀裡都沒有同名的巢狀元素） */
export function regionsOf(html, tagName, cls) {
  const main = mainOf(html)
  return startTags(main)
    .filter((t) => t.name === tagName && hasClass(t.attrs, cls))
    .map((t) => {
      const close = main.indexOf(`</${tagName}>`, t.end)
      return { attrs: t.attrs, html: main.slice(t.index, close === -1 ? main.length : close + tagName.length + 3) }
    })
}

const safeDecode = (s) => {
  try { return decodeURIComponent(s) } catch { return s }
}

/**
 * 文章側欄（站長 2026-11-03 要求補上；計畫的 SSR、SEO、廣告規則）：
 * 每篇文章剛好一個 <aside class="post-aside" aria-label>，SSR 就輸出，不在本文指紋範圍（prose 到 post-foot）裡，沒有 h1；
 * 沒有廣告元素（adsbygoogle、<ins>、Hexo 版的「廣告版位」佔位框）；
 * 站內連結都指向 dist 裡存在的頁面或檔案，# 連結（本文目錄）都找得到 id，另開分頁的外連有 rel="noopener"；
 * 相關文章至多 5 篇、都是存在的文章，不連回本篇，也不跟上一篇、下一篇、接著讀重複。
 */
export function checkSidebar(ctx) {
  const c = newCheck('sidebar', '文章側欄（每篇都有、沒有廣告、相關文章連到存在的文章）')
  const distUrls = new Set(ctx.dist.files.flatMap((f) => [fileToUrl(f), ...urlAliases(f)]))
  let posts = 0
  let withSidebar = 0
  let withToc = 0
  let relatedLinks = 0
  const relatedCounts = {}
  for (const d of ctx.pages.values()) {
    if (d.type !== 'post') continue
    posts++
    const asides = regionsOf(d.html, 'aside', SIDEBAR_CLASS)
    if (asides.length !== 1) { fail(c, asides.length ? `${d.url} 有 ${asides.length} 個側欄` : `${d.url} 沒有側欄（<aside class="${SIDEBAR_CLASS}">）`); continue }
    withSidebar++
    const aside = asides[0]
    const body = stripHidden(aside.html)
    if (!(aside.attrs['aria-label'] ?? '').trim()) fail(c, `${d.url} 的側欄沒有 aria-label`)
    // 找不到 prose 時本文指紋的範圍是整個 <main>，那由「本文文字指紋」報錯，這裡不重複
    if (hasProse(d.html) && startTags(builtArticleOf(d.html)).some((t) => t.name === 'aside' && hasClass(t.attrs, SIDEBAR_CLASS))) fail(c, `${d.url} 的側欄在本文指紋範圍（prose 到 post-foot）裡`)
    if (/adsbygoogle/i.test(aside.html)) fail(c, `${d.url} 的側欄有 adsbygoogle（只用 Auto ads，不放手動版位）`)
    if (findTags(body, 'ins').length) fail(c, `${d.url} 的側欄有 <ins>（不放廣告元素）`)
    if (/廣告版位/.test(textOf(body))) fail(c, `${d.url} 的側欄有「廣告版位」佔位框（Hexo 版的贊助區不重現）`)
    if (/<h1\b/i.test(body)) fail(c, `${d.url} 的側欄有 h1（文章的 h1 只有一個）`)
    if (startTags(body).some((t) => t.name === 'nav' && hasClass(t.attrs, 'post-toc'))) withToc++

    const ids = idsIn(d.html)
    const taken = new Set([d.url])
    for (const region of [...regionsOf(d.html, 'nav', 'post-nav'), ...regionsOf(d.html, 'section', 'related')]) {
      for (const a of findTags(stripHidden(region.html), 'a')) {
        const u = normalizeHref(a.href)
        if (u) taken.add(u)
      }
    }
    const related = []
    for (const a of findTags(body, 'a')) {
      const href = (a.href ?? '').trim()
      if (href.startsWith('#')) {
        const id = href.slice(1)
        if (!id || !(ids.has(id) || ids.has(safeDecode(id)))) fail(c, `${d.url} 的側欄連到不存在的標題 ${href}`)
        continue
      }
      if (/^https?:\/\//i.test(href) && !href.startsWith(SITE + '/')) {
        if (!/^https:\/\//i.test(href)) fail(c, `${d.url} 的側欄外連不是 https：${href}`)
        if ((a.target ?? '') === '_blank' && !(a.rel ?? '').toLowerCase().split(/\s+/).includes('noopener')) fail(c, `${d.url} 的側欄外連另開分頁卻沒有 rel="noopener"：${href}`)
        continue
      }
      const u = normalizeHref(href)
      if (!u) { fail(c, `${d.url} 的側欄有看不懂的連結：${show(href)}`); continue }
      if (!distUrls.has(u)) fail(c, `${d.url} 的側欄連到不存在的網址 ${u}`)
      if (POST_URL_RE.test(u)) related.push(u)
    }
    relatedLinks += related.length
    relatedCounts[related.length] = (relatedCounts[related.length] ?? 0) + 1
    if (related.length > SIDEBAR_RELATED_MAX) fail(c, `${d.url} 的側欄有 ${related.length} 篇相關文章，上限 ${SIDEBAR_RELATED_MAX}`)
    if (new Set(related).size !== related.length) fail(c, `${d.url} 的側欄相關文章有重複`)
    for (const u of related) {
      const target = ctx.pages.get(u)
      if (target && target.type !== 'post') fail(c, `${d.url} 的側欄相關文章 ${u} 不是文章頁`)
      if (u === d.url) fail(c, `${d.url} 的側欄相關文章連回本篇`)
      else if (taken.has(u)) fail(c, `${d.url} 的側欄相關文章 ${u} 跟上一篇、下一篇或接著讀重複`)
    }
  }
  const published = ctx.posts ? ctx.posts.filter((x) => x.published).length : null
  if (published !== null && posts !== published) c.notes.push(`dist 有 ${posts} 篇文章頁，文章索引有 ${published} 篇已發布（差異由「網址對等」檢查）`)
  if (!posts) fail(c, 'dist 裡沒有文章頁')
  c.stats = { posts, withSidebar, withToc, relatedLinks, relatedCounts }
  c.summary = `${withSidebar} / ${posts} 篇文章有側欄，${withToc} 篇有本文目錄，相關文章連結 ${relatedLinks} 個`
  return c
}

/** #app 裡第一個元素（略過空白和 Vue 的 <!--[--> 註解）的 class 有沒有 vp-raw */
export function rootHasVpRaw(html) {
  const m = /<div\b[^>]*\bid=["']app["'][^>]*>/.exec(html)
  if (!m) return false
  const rest = html.slice(m.index + m[0].length).replace(/^(?:\s|<!--[\s\S]*?-->)+/, '')
  const first = startTags(rest)[0]
  return !!first && first.index === 0 && hasClass(first.attrs, 'vp-raw')
}

/** 分類：dist 沒有 categories/css/，分類資料夾與文章網址的分類都在白名單，標籤沒有只差大小寫的 */
export function checkCategories(ctx) {
  const c = newCheck('categories', '分類白名單、標籤大小寫、路徑段沒有語系代碼')
  const allowed = new Set(ctx.categories)
  const dirs = new Set(ctx.categories.map(categoryDirOf))
  const seen = new Set()
  // 語系代碼是保留字（主站首頁規格 B.3）：分類、標籤、文章網址的路徑段都不能用，比對不分大小寫
  const isLocale = (seg) => LOCALE_CODES.has(safeDecode(seg).toLowerCase())
  for (const f of ctx.dist.files) {
    const m = /^categories\/([^/]+)\//.exec(f)
    if (m) {
      seen.add(m[1])
      if (m[1] === 'css') fail(c, `dist 有 categories/css/（應該只有大寫的 categories/CSS/）：${f}`)
      else if (!dirs.has(m[1])) fail(c, `分類資料夾不在白名單：categories/${m[1]}/`)
    }
    const t = /^(categories|tags)\/([^/]+)\//.exec(f)
    if (t && isLocale(t[2])) fail(c, `${t[1]}/${t[2]}/ 的路徑段是語系代碼（主站首頁規格 B.3）`)
  }
  for (const d of ctx.pages.values()) {
    if (d.type !== 'post') continue
    const cat = decodeURI(d.url.split('/')[1])
    if (!allowed.has(cat)) fail(c, `${d.url} 的分類「${cat}」不在白名單`)
    for (const seg of d.url.split('/').filter(Boolean)) if (isLocale(seg)) fail(c, `${d.url} 的路徑段「${seg}」是語系代碼（主站首頁規格 B.3）`)
  }
  if (ctx.posts) {
    const tags = new Map()
    for (const post of ctx.posts.filter((x) => x.published)) {
      if (!allowed.has(post.category)) fail(c, `${post.file} 的 category「${post.category}」不在白名單`)
      for (const t of [post.category, ...post.tags]) if (isLocale(String(t))) fail(c, `${post.file} 的分類或標籤「${t}」是語系代碼（主站首頁規格 B.3）`)
      for (const t of post.tags) tags.set(t.toLowerCase(), new Set([...(tags.get(t.toLowerCase()) ?? []), t]))
    }
    for (const group of tags.values()) if (group.size > 1) fail(c, `只差大小寫的標籤：${[...group].join('、')}（一律用小寫）`)
  } else c.notes.push('讀不到文章索引，原始碼的分類與標籤沒檢查')
  c.summary = `白名單 ${allowed.size} 個分類，dist 有 ${seen.size} 個分類資料夾`
  return c
}

/** 模板殘留與 iframe：<pre>、<code> 以外沒有 {% 和 {{，沒有 {% raw %}，--lts 沒被轉成破折號，iframe 沒有 http:// 與 // */
export function checkTemplates(ctx) {
  const c = newCheck('templates', '模板殘留與 iframe 網址')
  const allow = TEMPLATE_ALLOW.map((a) => ({ ...a, url: encodeURI(a.url) }))
  const used = new Set()
  let iframes = 0
  for (const d of ctx.pages.values()) {
    const body = stripHidden(d.html.slice(headOf(d.html).length))
    const outside = body.replace(/<pre\b[\s\S]*?<\/pre\s*>/gi, '').replace(/<code\b[\s\S]*?<\/code\s*>/gi, '')
    for (const token of ['{%', '{{']) {
      if (!outside.includes(token)) continue
      const rule = allow.find((a) => a.url === d.url && a.token === token)
      if (rule) { used.add(rule); ctx.expect('templates', `${d.url} ${token}`, rule.reason); continue }
      const i = outside.indexOf(token)
      fail(c, `${d.url} 在 <pre>、<code> 以外有 ${token}：「${outside.slice(Math.max(0, i - 20), i + 30).replace(/\s+/g, ' ')}」`)
    }
    const text = textOf(body)
    if (/\{%-?\s*(?:end)?raw\s*-?%\}/.test(text)) fail(c, `${d.url} 有沒處理掉的 {% raw %} 或 {% endraw %}`)
    if (/[\u2013\u2014]lts\b/.test(text)) fail(c, `${d.url} 的 --lts 被轉成破折號`)
    for (const f of findTags(body, 'iframe')) {
      iframes++
      const src = (f.src ?? '').trim()
      if (/^http:\/\//i.test(src) || src.startsWith('//')) fail(c, `${d.url} 的 iframe src 不是 https：${src}`)
    }
  }
  const nvm = ctx.pages.get('/development/2022/01/10/install-nvm/')
  if (nvm && !fingerprintText(builtArticleOf(nvm.html)).includes('nvminstall{{version}}')) fail(c, 'install-nvm 沒有出現「nvm install {{ version }}」（計畫：佔位字要重新顯示）')
  for (const a of allow) if (!used.has(a)) c.notes.push(`白名單沒用到：${a.url} ${a.token}`)
  c.summary = `${ctx.pages.size} 頁，iframe ${iframes} 個`
  return c
}

/** 主題 chunk 大小上限；共用 chunk 裡找不到文章摘要與內文 */
export function checkChunks(ctx) {
  const c = newCheck('chunks', `主題 chunk 不超過 ${ctx.limits.themeChunk} bytes，共用 chunk 沒有文章資料`)
  const shared = ctx.dist.files.filter((f) => /^assets\/app\.[^/]+\.js$/.test(f) || /^assets\/chunks\/[^/]+\.js$/.test(f))
  const themes = shared.filter((f) => /^assets\/chunks\/theme\.[^/]+\.js$/.test(f))
  const sizes = {}
  for (const f of [...shared, ...ctx.dist.files.filter((x) => /^assets\/style\.[^/]+\.css$/.test(x))]) {
    const buf = fs.readFileSync(path.join(ctx.dist.dir, f))
    sizes[f] = { bytes: buf.length, gzip: gzipSync(buf).length }
  }
  if (themes.length !== 1) fail(c, `assets/chunks/theme.*.js 應該剛好 1 個，找到 ${themes.length} 個`)
  for (const f of themes) if (sizes[f].bytes > ctx.limits.themeChunk) fail(c, `${f} 有 ${sizes[f].bytes} bytes，超過上限 ${ctx.limits.themeChunk}`)
  const probes = chunkProbes(ctx)
  for (const f of shared) {
    const js = fs.readFileSync(path.join(ctx.dist.dir, f), 'utf8')
    const hits = probes.filter((p) => p.forms.some((x) => js.includes(x)))
    if (hits.length) fail(c, `${f} 裡有 ${hits.length} 段文章資料，例如 ${hits[0].url} 的「${hits[0].text}」`)
  }
  // 沒上線的語系文案與 preview 提示字不能出現在任何 client chunk（含各頁的 .md.js，主站首頁規格 J.1、C.3）
  const localeProbes = unpublishedCopyProbes(ctx)
  let scanned = 0
  for (const f of ctx.dist.files.filter((x) => /^assets\/.*\.js$/.test(x))) {
    scanned++
    const js = fs.readFileSync(path.join(ctx.dist.dir, f), 'utf8')
    for (const p of localeProbes) if (p.forms.some((x) => js.includes(x))) fail(c, `${f} 裡有${p.label}「${p.text}」`)
  }
  c.stats = { sizes, probes: probes.length, localeProbes: localeProbes.length, scannedJs: scanned }
  c.summary = [...themes.map((f) => `${f} ${sizes[f].bytes} bytes（gzip ${sizes[f].gzip}）`), `比對 ${probes.length} 段文章文字`, `${localeProbes.length} 段未上線語系文案與 preview 提示字（${scanned} 支 JS）`].join('；')
  return c
}

/** 打包工具可能把非 ASCII 字元寫成 \uXXXX（大寫或小寫的十六進位），三種寫法都找 */
export function probeForms(t) {
  const esc = (upper) => [...t].map((ch) => {
    if (ch.charCodeAt(0) <= 0x7e) return ch
    return [...ch].map((_, i) => '\\u' + ch.charCodeAt(i).toString(16).padStart(4, '0')).map((x) => (upper ? '\\u' + x.slice(2).toUpperCase() : x)).join('')
  }).join('')
  return [...new Set([t, esc(false), esc(true)])]
}

// 文案字串切成可以拿去找的片段：拿掉佔位符與引號、反斜線、角括號這些在 JS 字串裡會被跳脫的字元，取最長的一段
const PROBE_BREAK_RE = /\{[a-zA-Z_][\w.]*\}|["'\\<>&`\n]/g
const longestLiteral = (s) => String(s).split(PROBE_BREAK_RE).map((x) => x.trim()).sort((a, b) => [...b].length - [...a].length)[0] ?? ''
/** 未上線語系文案的片段：menu.homeOnly 不論長度，其他 key 取 8 字以上；已上線語系也有的字串不算（不是外洩） */
export const LOCALE_PROBE_MIN = 8

/**
 * 沒上線的語系（SITE_HOME_CODES 不在 plan.published、而且有文案檔）的文案片段，加上 preview 的提示字。
 * [{ label, text, forms }]
 */
export function unpublishedCopyProbes({ plan, readHome }) {
  const published = new Set(plan.published)
  const files = new Map(SITE_HOME_CODES.map((code) => [code, readHome(code)]).filter(([, f]) => f))
  const publishedStrings = new Set([...files].filter(([code]) => published.has(code)).flatMap(([, f]) => leafEntries(f).map(([, v]) => longestLiteral(v))))
  const out = []
  const seen = new Set()
  const add = (label, text) => {
    if (!text || seen.has(text) || publishedStrings.has(text)) return
    seen.add(text)
    out.push({ label, text, forms: probeForms(text) })
  }
  for (const [code, file] of files) {
    if (published.has(code)) continue
    for (const [key, v] of leafEntries(file)) {
      if (typeof v !== 'string') continue
      const t = longestLiteral(v)
      if (key === 'menu.homeOnly' || [...t].length >= LOCALE_PROBE_MIN) add(`沒上線的 ${code} 文案（${key}）`, t)
    }
  }
  for (const s of [PREVIEW_NOTICE, PREVIEW_TOOLS_NOTE]) for (const part of s.split(' / ')) add(' preview 的提示字', longestLiteral(part))
  return out
}

/** 用來找外洩的文字片段：每篇 description 的前 20 字，以及（有基準 HTML 時）本文第一段的 20 字 */
function chunkProbes(ctx) {
  const out = []
  const add = (url, s) => {
    const t = [...s.replace(/\s+/g, ' ').trim()].slice(0, 20).join('')
    if ([...t].length < 12 || /["'\\<>&`]/.test(t)) return
    out.push({ url, text: t, forms: probeForms(t) })
  }
  for (const p of ctx.baseline.pages) {
    if (p.type !== 'post') continue
    if (p.description) add(p.url, p.description)
    const html = ctx.git.ok ? ctx.baseHtml(p) : null
    if (html) {
      const para = /<p>([^<]{24,})<\/p>/.exec(articleOf(html))
      if (para) add(p.url, decodeEntities(para[1]))
    }
  }
  return out
}

/** JSON-LD：都能解析、依頁型有該有的 @type，BlogPosting 的日期規則 */
export function checkJsonLd(ctx) {
  const c = newCheck('jsonld', '結構化資料（JSON-LD）')
  const postsByUrl = new Map((ctx.posts ?? []).map((x) => [encodeURI(x.url), x]))
  const published = ctx.plan?.published ?? []
  let n = 0
  for (const d of ctx.pages.values()) {
    const { nodes, invalid } = jsonLdNodes(d.html)
    if (invalid) fail(c, `${d.url} 有 ${invalid} 段 JSON-LD 解析失敗`)
    n += nodes.length
    const types = new Set(nodes.flatMap((x) => [x['@type']].flat()))
    // 有外語首頁時，/ 一定要有外語首頁 WebPage 的 isPartOf 指的 WebSite（D.4；P3 在 / 加，I1 在 P3 之後）。
    // 只比 isPartOf 的字串擋不住「P3 只改站名、沒加 WebSite」，所以這裡驗 / 真的有這個節點
    const homeNeedsSite = d.type === 'home' && published.length > 0
    const want = d.type ? (homeNeedsSite ? [...new Set([...JSONLD_TYPES.home, 'WebSite'])] : JSONLD_TYPES[d.type]) : null
    if (homeNeedsSite && !nodes.some((x) => [x['@type']].flat().includes('WebSite') && x['@id'] === WEBSITE_ID)) {
      fail(c, `${d.url}（home）沒有 @id 是 ${WEBSITE_ID} 的 WebSite：外語首頁 ${published.map((x) => `/${x}/`).join('、')} 的 WebPage isPartOf 指向它（主站首頁規格 D.4，P3 在 / 加）`)
    }
    if (want) {
      for (const t of want) if (!types.has(t) && !(homeNeedsSite && t === 'WebSite')) fail(c, `${d.url}（${d.type}）少了 JSON-LD ${t}`)
      if (!want.length && types.size) fail(c, `${d.url}（${d.type}）在 P2 不輸出 JSON-LD，卻有 ${[...types].join('、')}`)
    }
    if (d.type === 'site-home') {
      const code = d.url.slice(1, -1)
      const wp = nodes.find((x) => [x['@type']].flat().includes('WebPage'))
      const lang = LOCALE_CODES.has(code) ? getLocale(code).htmlLang : null
      if (wp && wp.inLanguage !== lang) fail(c, `${d.url} 的 WebPage inLanguage：預期 ${show(lang)}，實際 ${show(wp.inLanguage)}`)
      if (wp && wp.isPartOf?.['@id'] !== WEBSITE_ID) fail(c, `${d.url} 的 WebPage isPartOf：預期 { "@id": "${WEBSITE_ID}" }，實際 ${show(JSON.stringify(wp.isPartOf ?? null))}`)
      if (wp && wp['@id'] !== `${siteHomeUrl(code)}#webpage`) fail(c, `${d.url} 的 WebPage @id：預期 ${siteHomeUrl(code)}#webpage，實際 ${show(wp['@id'])}`)
      for (const t of types) if (t !== 'WebPage') fail(c, `${d.url}（site-home）只放 WebPage，卻有 ${t}（WebSite 只放 /，主站首頁規格 D.2）`)
    }
    if (d.type !== 'post') continue
    const base = ctx.baseline.byUrl.get(d.url)
    const bp = nodes.find((x) => [x['@type']].flat().includes('BlogPosting'))
    if (bp && base && instant(bp.datePublished) !== instant(base.publishedTime)) fail(c, `${d.url} datePublished：預期 ${show(base.publishedTime)} 同一時刻，實際 ${show(bp.datePublished)}`)
    const post = postsByUrl.get(d.url)
    if (post) {
      const want2 = post.updated ?? post.date
      if (bp && taipeiDate(bp.dateModified) !== want2) fail(c, `${d.url} dateModified：預期 ${want2}（updated，沒有就用發布日），實際 ${show(bp.dateModified)}`)
      if (taipeiDate(d.f.modifiedTime) !== want2) fail(c, `${d.url} article:modified_time：預期 ${want2}，實際 ${show(d.f.modifiedTime)}`)
    }
  }
  if (ctx.posts) ctx.expect('jsonld', '文章', 'article:modified_time 與 dateModified 改用 front matter 的 updated，沒有就用發布日；BlogPosting 改新格式並加 BreadcrumbList（基準 README「對等基準」）')
  c.summary = `${ctx.pages.size} 頁共 ${n} 個 JSON-LD 節點`
  return c
}

// ============================================================================
// 外語首頁與全站工具清單（主站首頁規格 J.1：checkLocales L1 到 L13、checkTools T1 到 T4）
// 預期值一律來自 buildSiteHomePlan({ env: {} }) 的 plan、theme/shared/data/tools.json 與 shared/shell 的純函式。
// S 才有的 DOM（共用頁首頁尾、語言選單、頁尾工具組與法務連結、404 不 hydrate）只在 shell 是 'shared' 時驗；
// I1 起才有的（外語首頁、hreflang 叢集、多語提示）跟著 plan.published。P1 兩邊都是空的，這些檢查驗的是「什麼都沒有」。
// ============================================================================

const ZH_LANG = 'zh-TW'
const textOfCode = (code) => (key, params) => ts(code, key, params)
const sameList = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const listDiff = (want, got) => {
  const missing = want.filter((x) => !got.includes(x))
  const extra = got.filter((x) => !want.includes(x))
  return [missing.length ? `少了 ${missing.join('、')}` : '', extra.length ? `多了 ${extra.join('、')}` : ''].filter(Boolean).join('；') || `順序不同：預期 ${want.join('、')}，實際 ${got.join('、')}`
}
const firstSeqDiff = (want, got) => {
  const i = want.findIndex((x, k) => got[k] !== x)
  const at = i === -1 ? want.length : i
  return `第 ${at + 1} 項預期 ${show(want[at] ?? '（沒有）')}，實際 ${show(got[at] ?? '（沒有）')}`
}
/** 外語首頁 /<code>/ 的 code；不是外語首頁的網址回 null */
const homeCodeOf = (url) => SITE_HOME_CODES.find((c) => url === `/${c}/`) ?? null
/** 頁面的第一個 <tag> 元素 */
const firstElement = (html, name, pred = () => true) => elementsWhere(html, (t) => t.name === name && pred(t))[0] ?? null
/** id 是 tools 的元素（首頁與外語首頁的工具區） */
const toolsRegionOf = (html) => elementsWhere(mainOf(html), (t) => t.attrs.id === 'tools')[0] ?? null
/** 頁尾的工具組（共用頁尾 nav.cs-ftr__group--tools） */
const footerToolsOf = (html) => {
  const footer = firstElement(html, 'footer')
  return footer ? elementsWhere(footer.outer, (t) => t.name === 'nav' && hasClass(t.attrs, 'cs-ftr__group--tools'))[0] ?? null : null
}

/** 外語首頁 head 的預期序列（D.2），格式同 extract-page.mjs 的 siteHomeHeadSequence */
export function expectedSiteHomeHead(code, { plan, readHome }) {
  const file = readHome(code)
  if (!file) throw new Error(`沒有 i18n/home/${code}.json`)
  const copy = formatHomeCopy(file, code)
  const url = siteHomeUrl(code)
  const published = plan.published
  const alternates = published.includes('en') ? siteHomeAlternates(published) : []
  const others = sortLocaleCodes(['zh-tw', ...published]).filter((x) => x !== code)
  return [
    `title=${siteHomeTitle(code, copy)}`,
    `description=${copy.meta.description}`,
    `canonical=${url}`,
    ...alternates.map((a) => `hreflang:${a.hreflang}=${a.href}`),
    ...(alternates.length ? [`hreflang:x-default=${siteHomeUrl('en')}`] : []),
    'og:type=website',
    `og:url=${url}`,
    `og:title=${copy.meta.tagline}`,
    `og:description=${copy.meta.description}`,
    `og:site_name=${siteName(code)}`,
    `og:locale=${getLocale(code).ogLocale}`,
    ...others.map((x) => `og:locale:alternate=${getLocale(x).ogLocale}`),
    `og:image=${SITE_HOME_OG_IMAGE.url}`,
    `og:image:width=${SITE_HOME_OG_IMAGE.width}`,
    `og:image:height=${SITE_HOME_OG_IMAGE.height}`,
    `og:image:alt=${copy.meta.ogImageAlt}`,
    'jsonld=WebPage',
  ]
}

/** 外語首頁的 DOM 契約（E.1）：根元素、.cs-shome 與四個區塊、H1、按鈕、連到繁中頁的連結、裝飾圖 alt="" */
export function siteHomeDomProblems(html, code) {
  const out = []
  const root = rootClassesOf(html)
  for (const cls of ['vp-raw', 'site', 'page-type-site-home']) if (!root.includes(cls)) out.push(`版面根元素沒有 class ${cls}`)
  const main = firstElement(html, 'main')
  if (!main) return [...out, '沒有 <main>']
  if (main.attrs.id !== 'main') out.push('<main> 的 id 不是 main')
  const shomes = elementsWhere(main.inner, (t) => hasClass(t.attrs, 'cs-shome'))
  if (shomes.length !== 1) return [...out, `<main> 裡要剛好一個 .cs-shome，找到 ${shomes.length} 個`]
  const s = shomes[0].inner
  const sections = elementsWhere(s, (t) => t.name === 'section')
  const kinds = sections.map((e) => (e.attrs.class ?? '').split(/\s+/).find((x) => x.startsWith('cs-shome__')) ?? '?')
  const want = ['cs-shome__hero', 'cs-shome__tools', 'cs-shome__articles', 'cs-shome__about']
  if (!sameList(kinds, want)) out.push(`.cs-shome 的區塊是 ${kinds.join('、') || '（沒有）'}，要依序是 ${want.join('、')}`)
  const byKind = Object.fromEntries(sections.map((e, i) => [kinds[i], e]))
  if (byKind['cs-shome__tools'] && byKind['cs-shome__tools'].attrs.id !== 'tools') out.push('工具區的 id 不是 tools')
  if (byKind['cs-shome__about'] && byKind['cs-shome__about'].attrs.id !== 'about') out.push('簡介區的 id 不是 about')
  const h1s = elementsWhere(s, (t) => t.name === 'h1')
  if (h1s.length !== 1) out.push(`要剛好一個 <h1>，找到 ${h1s.length} 個`)
  else {
    const name = siteName(code)
    if (textOf(h1s[0].inner) !== name) out.push(`<h1> 是 ${show(textOf(h1s[0].inner))}，要是 siteName('${code}') ${show(name)}`)
    const lang = brandLang(code)
    const span = elementsWhere(h1s[0].inner, (t) => t.name === 'span' && 'lang' in t.attrs)[0]
    if (lang && (!span || span.attrs.lang !== lang || !('data-foreign' in span.attrs))) out.push(`<h1> 的站名語言跟頁面不同，要包 <span lang="${lang}" data-foreign>`)
    if (!lang && span) out.push(`<h1> 的站名語言跟頁面相同，不該有 <span lang="${span.attrs.lang}">`)
  }
  const cta = byKind['cs-shome__hero'] ? elementsWhere(byKind['cs-shome__hero'].inner, (t) => t.name === 'a')[0] : null
  if (!cta || cta.attrs.href !== `${siteHomeUrl(code)}#tools`) out.push(`首屏按鈕要連 ${siteHomeUrl(code)}#tools，實際 ${show(cta?.attrs.href)}`)
  for (const k of ['cs-shome__articles', 'cs-shome__about']) {
    for (const a of anchorsIn(byKind[k]?.inner ?? '')) {
      if (a.hreflang !== getLocale('zh-tw').hreflang || !(a.href ?? '').startsWith(`${SITE}/`)) out.push(`${k} 的連結 ${show(a.href)} 連到繁中頁，要是絕對網址並加 hreflang="zh-Hant"（localeLink）`)
    }
  }
  for (const img of elementsWhere(s, (t) => t.name === 'img')) if (img.attrs.alt !== '') out.push(`裝飾圖 ${show(img.attrs.src)} 的 alt 要是空字串`)
  return out
}

// L12 取樣時拿掉的元素：外語片段與程式碼不算進本頁語言（同範本 J15 的 SCRIPT_SAMPLE_SKIP）
const SCRIPT_SAMPLE_SKIP_TAGS = new Set(['code', 'kbd', 'pre', 'samp', 'script', 'style', 'svg', 'template'])
/** <main> 的文字，扣掉 [data-foreign] 與程式碼類元素 */
export function mainTextWithoutForeign(html) {
  let main = firstElement(html, 'main')?.inner ?? ''
  for (;;) {
    const hit = elementsWhere(main, (t) => 'data-foreign' in t.attrs || SCRIPT_SAMPLE_SKIP_TAGS.has(t.name))[0]
    if (!hit) break
    main = main.slice(0, hit.index) + ' ' + main.slice(hit.index + hit.outer.length)
  }
  return textOf(main)
}

/** 這頁頁首的語言選單（details.cs-lang）；頁尾的 ul.cs-langlist 不算 */
const headerMenuOf = (html) => {
  const header = firstElement(html, 'header')
  return header ? elementsWhere(header.outer, (t) => t.name === 'details' && hasClass(t.attrs, 'cs-lang'))[0] ?? null : null
}

/** 語言選單項目的預期（languageTargets 的結果轉成 languageItemsIn 的形狀） */
function expectedLanguageItems(targets, current) {
  return targets.map((t) => ({
    current: t.code === current,
    href: t.code === current ? null : t.href,
    hreflang: t.code === current ? null : t.hreflang,
    lang: t.htmlLang,
    text: t.autonym,
    note: t.code === current || t.exact ? null : (t.homeOnly ?? null),
  }))
}

/** 外語首頁與語系（主站首頁規格 J.1 的 L1 到 L13） */
export function checkLocales(ctx) {
  const c = newCheck('locales', '外語首頁與語系（L1 到 L13）')
  const { plan } = ctx
  const published = plan.published
  const shared = ctx.shell === 'shared'
  for (const p of plan.problems ?? []) fail(c, `L0：外語首頁沒過關卡（config.mts 會擋下建置）：${p}`)
  const homes = published.map((code) => ({ code, url: `/${code}/`, d: ctx.pages.get(`/${code}/`) }))
  const cluster = [{ code: 'zh-tw', url: '/', d: ctx.pages.get('/') }, ...homes]
  const clusterUrls = new Set(cluster.map((x) => x.url))

  // L1：<html lang>
  for (const d of ctx.pages.values()) {
    const code = published.includes(homeCodeOf(d.url)) ? homeCodeOf(d.url) : null
    const want = code ? getLocale(code).htmlLang : ZH_LANG
    if (d.f.lang !== want) fail(c, `L1：${d.url} 的 <html lang> 是 ${show(d.f.lang)}，要是 ${want}`)
  }

  // L2：dist 底下語系代碼的資料夾剛好是 plan.published，外語首頁底下沒有子頁
  const dirs = new Set()
  for (const f of ctx.dist.files) {
    const seg = f.split('/')[0]
    if (!f.includes('/') || !LOCALE_CODES.has(seg.toLowerCase())) continue
    dirs.add(seg)
    if (seg.toLowerCase() === 'zh-tw') fail(c, `L2：dist 有 ${f}：繁中首頁就是 /，/zh-tw/ 不產生（主站首頁規格 B.2）`)
    else if (f !== `${seg}/index.html`) fail(c, `L2：dist 有 ${f}：這份規格範圍內外語首頁底下不放子頁，要加子頁另開規格`)
  }
  for (const code of published) if (!dirs.has(code)) fail(c, `L2：dist 沒有 ${code}/（${code} 在 home.locales）`)
  for (const seg of dirs) if (seg.toLowerCase() !== 'zh-tw' && !published.includes(seg)) fail(c, `L2：dist 有 ${seg}/，但 ${seg} 不在 home.locales`)

  // L3：外語首頁的 head 與 DOM
  for (const h of homes) {
    if (!h.d) { fail(c, `L3：dist 沒有 ${h.url}`); continue }
    if (h.d.type !== 'site-home') fail(c, `L3：${h.url} 的頁型是 ${show(h.d.type ?? h.d.typeError)}，要是 site-home`)
    let want = null
    try { want = expectedSiteHomeHead(h.code, ctx) } catch (e) { fail(c, `L3：${h.url} 算不出預期的 head：${e.message}`) }
    if (want) {
      const got = siteHomeHeadSequence(h.d.html)
      if (!sameList(got, want)) fail(c, `L3：${h.url} 的 head 跟 D.2 的值與順序不同，${firstSeqDiff(want, got)}`)
    }
    for (const p of siteHomeDomProblems(h.d.html, h.code)) fail(c, `L3：${h.url} ${p}`)
  }

  // L4：hreflang 叢集；L5：og:locale:alternate
  const wantHreflang = published.includes('en') ? [...siteHomeAlternates(published).map((a) => `${a.hreflang}=${a.href}`), `x-default=${siteHomeUrl('en')}`] : []
  for (const x of cluster) {
    if (!x.d) continue
    const links = hreflangLinksOf(x.d.html)
    const got = links.map((l) => `${l.hreflang}=${l.href}`)
    if (!sameList([...got].sort(), [...wantHreflang].sort())) fail(c, `L4：${x.url} 的 hreflang 跟首頁叢集不同：${listDiff(wantHreflang, got)}`)
    for (const l of links) if (!/^https:\/\//.test(l.href)) fail(c, `L4：${x.url} 的 hreflang="${l.hreflang}" 不是絕對網址：${l.href}`)
    if (wantHreflang.length && !got.includes(`x-default=${siteHomeUrl('en')}`)) fail(c, `L4：${x.url} 的 x-default 要是 ${siteHomeUrl('en')}`)
    if (wantHreflang.length && ZH_CATCHALL && !got.includes(`zh=${siteHomeUrl('zh-tw')}`)) fail(c, `L4：${x.url} 要有 hreflang="zh" 指 /（ZH_CATCHALL）`)
    const wantOg = published.length ? sortLocaleCodes(['zh-tw', ...published]).filter((k) => k !== x.code).map((k) => getLocale(k).ogLocale) : []
    const gotOg = ogLocalesOf(x.d.html).alternates
    if (!sameList([...gotOg].sort(), [...wantOg].sort())) fail(c, `L5：${x.url} 的 og:locale:alternate 跟叢集裡的其他語系不同：${listDiff(wantOg, gotOg)}`)
  }
  for (const d of ctx.pages.values()) {
    if (clusterUrls.has(d.url)) continue
    if (hreflangLinksOf(d.html).length) fail(c, `L4：${d.url} 不在首頁叢集，不能有 link[hreflang]（文章頁的語言選單只是連結）`)
    if (ogLocalesOf(d.html).alternates.length) fail(c, `L5：${d.url} 不在首頁叢集，不能有 og:locale:alternate`)
  }

  // L6：sitemap
  const sitemap = ctx.dist.files.includes('sitemap.xml') ? fs.readFileSync(path.join(ctx.dist.dir, 'sitemap.xml'), 'utf8') : null
  if (sitemap) {
    const locs = new Set(sitemapLocs(sitemap))
    for (const h of homes) if (!locs.has(siteHomeUrl(h.code))) fail(c, `L6：sitemap 少了外語首頁 ${siteHomeUrl(h.code)}`)
    if (/<xhtml:link\b/.test(sitemap)) fail(c, 'L6：sitemap 不放 xhtml:link（hreflang 只在 head，主站首頁規格 D.8）')
    for (const u of [`${SITE}/zh-tw/`, `${SITE}/404`, `${SITE}/404.html`]) if (locs.has(u)) fail(c, `L6：sitemap 不該有 ${u}`)
  } else fail(c, 'L6：dist 沒有 sitemap.xml')

  // L7：沒有 preview 的痕跡；外語首頁沒有 robots meta
  for (const d of ctx.pages.values()) {
    const preview = startTags(d.html).find((t) => (t.attrs.class ?? '').split(/\s+/).some((x) => x.startsWith('cs-preview')))
    if (preview) fail(c, `L7：${d.url} 有 preview 的 class（${preview.attrs.class}）：preview 產物不能進 dist`)
    if (PREVIEW_NOTICE.split(' / ').some((x) => d.html.includes(x))) fail(c, `L7：${d.url} 有 preview 的提示字`)
  }
  for (const h of homes) if (h.d && h.d.f.robots !== null) fail(c, `L7：${h.url} 有 robots meta ${show(h.d.f.robots)}，外語首頁要被收錄`)

  // L8：404（S 起不 hydrate；I1 起有多語提示）
  const nf = ctx.pages.get('/404.html')
  if (shared && nf) {
    if (startTags(nf.html).some((t) => t.name === 'script' && (t.attrs.type ?? '').toLowerCase() === 'module')) fail(c, 'L8：404 有 <script type="module">：S 起 404 不 hydrate（主站首頁規格 E.5）')
    if (findTags(nf.html, 'link').some((l) => (l.rel ?? '').toLowerCase().split(/\s+/).includes('modulepreload'))) fail(c, 'L8：404 有 <link rel="modulepreload">：S 起 404 不 hydrate')
    if (startTags(mainOf(nf.html)).some((t) => t.name === 'button')) fail(c, 'L8：404 的 <main> 裡有 <button>：不 hydrate 的頁不能有按了沒反應的按鈕')
  }
  if (nf) {
    const intl = elementsWhere(mainOf(nf.html), (t) => t.name === 'ul' && hasClass(t.attrs, 'cs-404__intl'))[0]
    const lis = intl ? elementsWhere(intl.inner, (t) => t.name === 'li') : []
    const got = lis.map((li) => li.attrs.lang ?? '（沒有 lang）')
    const want = sortLocaleCodes(published).map((k) => getLocale(k).htmlLang)
    if (!sameList(got, want)) fail(c, `L8：404 的多語提示要剛好列出 ${want.join('、') || '（沒有）'}，實際 ${got.join('、') || '（沒有）'}`)
    for (const [i, li] of lis.entries()) {
      const code = sortLocaleCodes(published)[i]
      const a = anchorsIn(li.inner)[0]
      if (code && (!a || a.href !== siteHomeUrl(code) || a.hreflang !== getLocale(code).hreflang)) fail(c, `L8：404 多語提示的 ${code} 那一行要連 ${siteHomeUrl(code)} 並加 hreflang="${getLocale(code).hreflang}"`)
    }
  }

  // L9：頁首的語言選單
  for (const d of ctx.pages.values()) {
    const menu = headerMenuOf(d.html)
    const code = homeCodeOf(d.url)
    if (d.type === 'not-found' || !shared || !published.length) {
      if (menu) fail(c, `L9：${d.url} 不該有語言選單（${d.type === 'not-found' ? '404 用多語提示' : '還沒有已上線的外語首頁或 shell 不是 shared'}）`)
      continue
    }
    if (!d.type) continue
    let targets
    try { targets = languageTargets({ pageType: d.type, canonical: d.f.canonical ?? '', plan, readHome: ctx.readHome }) } catch (e) { fail(c, `L9：${d.url} 算不出語言選單：${e.message}`); continue }
    const want = expectedLanguageItems(targets, code && d.type === 'site-home' ? code : 'zh-tw')
    if (!menu) { fail(c, `L9：${d.url} 沒有語言選單（details.cs-lang）`); continue }
    const got = languageItemsIn(menu.outer)
    if (!sameList(got, want)) fail(c, `L9：${d.url} 的語言選單跟 languageTargets() 不同：預期 ${JSON.stringify(want)}，實際 ${JSON.stringify(got)}`)
    for (const it of got) if (!it.current && (!it.hreflang || !it.lang)) fail(c, `L9：${d.url} 的語言選單連結 ${show(it.href)} 要有 hreflang 與 lang`)
  }

  // L10：site-card.json 與 tools.json
  if (!ctx.siteCard) fail(c, 'L10：repo 根目錄沒有 site-card.json（npm run site:card 產生）')
  else {
    if (ctx.siteCard.shell !== ctx.shell) fail(c, `L10：site-card.json 的 shell 是 ${show(ctx.siteCard.shell)}，site.config.mjs 是 ${show(ctx.shell)}`)
    if (!sameList(ctx.siteCard.siteHomes ?? null, [...published])) fail(c, `L10：site-card.json 的 siteHomes ${show(JSON.stringify(ctx.siteCard.siteHomes))} 不等於 plan.published ${JSON.stringify(published)}（npm run site:card）`)
  }
  for (const code of ctx.toolsIndex?.siteHomes ?? []) if (!published.includes(code)) fail(c, `L10：tools.json 的 siteHomes 有 ${code}，但部落格沒有上線這個外語首頁`)

  // L11：外語首頁的廣告與追蹤碼；繁中頁的 GA4 沒有 page_locale
  for (const d of ctx.pages.values()) {
    const ga = gaConfigsOf(d.html)
    if (d.type !== 'site-home') {
      for (const g of ga) if (g && 'page_locale' in g) fail(c, `L11：${d.url} 是繁中頁，GA4 不帶 page_locale`)
      continue
    }
    const code = homeCodeOf(d.url)
    // loader 照 shouldLoadAds（站長 2026-11-04 把 site-home 改成 standardOnly，0008 更正第 9 點）：standard 要有一個，allowlist 要沒有
    const loaders = countAdsLoaders(d.html)
    const wantLoader = shouldLoadAds({ type: d.type, adsFalse: ctx.adsFalse.has(d.url) }, ctx.adsMode)
    if (wantLoader && loaders !== 1) fail(c, `L11：${d.url} 要載一次 AdSense loader（ADS_MODE ${ctx.adsMode}），找到 ${loaders} 個`)
    else if (!wantLoader && loaders) fail(c, `L11：${d.url} 不該載 AdSense loader（ADS_MODE ${ctx.adsMode}）`)
    if (/connect\.facebook\.net\/[^"']*fbevents\.js/.test(d.html)) fail(c, `L11：${d.url} 有 FB Pixel`)
    if (metaValues(d.html, 'property', 'article:author').length) fail(c, `L11：${d.url} 有 article:author`)
    if (ga.length !== 1) fail(c, `L11：${d.url} 要剛好一段 GA4 config，找到 ${ga.length} 段`)
    else if (ga[0]?.content_group !== 'site-home' || ga[0]?.page_locale !== code) fail(c, `L11：${d.url} 的 GA4 要是 content_group 'site-home'、page_locale '${code}'，實際 ${JSON.stringify(ga[0])}`)
  }

  // L12：外語首頁 <main> 的書寫系統
  for (const h of homes) {
    if (!h.d) continue
    for (const p of checkScript(h.code, mainTextWithoutForeign(h.d.html), { scope: 'page' })) fail(c, `L12：${h.url} 的 <main>（扣掉 data-foreign 與程式碼）${p.rule}：${p.detail}；其他語言的片段要包 lang 與 data-foreign`)
    const pageLang = getLocale(h.code).htmlLang.toLowerCase()
    for (const el of elementsWhere(firstElement(h.d.html, 'main')?.inner ?? '', (t) => 'lang' in t.attrs)) {
      if (el.attrs.lang.toLowerCase() !== pageLang && !('data-foreign' in el.attrs) && !('hreflang' in el.attrs)) fail(c, `L12：${h.url} 的 <${el.name} lang="${el.attrs.lang}"> 跟頁面語言不同，要加 data-foreign`)
    }
  }

  // L13：外語首頁頁尾的法務連結
  for (const h of homes) {
    if (!h.d) continue
    const footer = firstElement(h.d.html, 'footer')
    const links = anchorsIn(footer?.outer ?? '')
    const l = getLocale(h.code)
    const privacy = ctx.legal.pages.privacy?.[h.code]
    if (!privacy) fail(c, `L13：${h.url}：LEGAL_PAGES.privacy 沒有 ${h.code}（G5 應該先擋下）`)
    else {
      const a = links.find((x) => x.href === privacy)
      const zhMark = splitMarkOf(h.code, 'inChinese')
      if (!a) fail(c, `L13：${h.url} 的頁尾沒有連到 ${privacy} 的隱私權連結`)
      else {
        if (a.hreflang !== l.hreflang) fail(c, `L13：${h.url} 的隱私權連結 hreflang 是 ${show(a.hreflang)}，要是 ${l.hreflang}`)
        if (zhMark && ((zhMark.after && a.text.endsWith(zhMark.after)) || (zhMark.before && a.text.startsWith(zhMark.before)))) fail(c, `L13：${h.url} 的隱私權連結是同語言的頁，連結字不該有繁中標示：${a.text}`)
      }
    }
    for (const [flag, level] of Object.entries(l.legal)) {
      if (flag === 'privacy' || !['required', 'disclose'].includes(level)) continue
      const url = ctx.legal.pages[flag]?.[h.code]
      const key = LEGAL_FOOTER_KEYS[flag]
      const label = key ? safeTs(h.code, key) : null
      if (url) {
        if (!links.some((x) => x.href === url)) fail(c, `L13：${h.url} 的頁尾沒有 ${flag} 連結 ${url}`)
      } else if (ctx.legal.decisions.some((x) => x.locale === h.code && x.flag === flag && x.decision === 'waived')) {
        const bad = links.find((x) => Object.values(ctx.legal.pages[flag] ?? {}).includes(x.href) || (label && x.text === label))
        if (bad) fail(c, `L13：${h.url} 的 ${flag} 是站長豁免（LEGAL_DECISIONS），頁尾不該有這個連結：${show(bad.href)}`)
      } else fail(c, `L13：${h.url} 的 ${flag}（${level}）沒有網址也沒有豁免（G5 應該先擋下）`)
    }
  }

  // 摘要用量到的數字，不從 plan 推：檢查失敗時摘要才不會跟明細互相矛盾
  const all = [...ctx.pages.values()]
  const measured = {
    zh: all.filter((d) => d.f.lang === ZH_LANG).length,
    hreflang: all.filter((d) => hreflangLinksOf(d.html).length).length,
    menu: all.filter((d) => headerMenuOf(d.html)).length,
  }
  c.stats = { published, shell: ctx.shell, homes: homes.filter((h) => h.d).length, pages: all.length, ...measured }
  const counts = `量到 ${all.length} 頁裡 ${measured.zh} 頁是 zh-TW、${measured.hreflang} 頁有 hreflang、${measured.menu} 頁有語言選單`
  c.summary = published.length ? `外語首頁 ${published.map((x) => `/${x}/`).join('、')}，shell ${ctx.shell}；${counts}` : `沒有外語首頁（home.locales 是空的），shell ${ctx.shell}；${counts}`
  return c
}

// 頁尾法務連結的外殼字串 key（shared/shell/nav.mjs 的 FOOTER_LEGAL_NAV）
const LEGAL_FOOTER_KEYS = { impressum: 'footer.legalNotice', externalTransmission: 'footer.thirdParty' }
const safeTs = (code, key, params) => {
  try { return ts(code, key, params) } catch { return null }
}
/** 語言標示切成名稱前後兩段（tools.mjs 的切法）；這個語系沒有這個 key 時回 null */
function splitMarkOf(code, key) {
  const s = safeTs(code, key, { label: MARK })
  if (s === null) return null
  const [before, after] = s.split(MARK)
  return { before: before.trim(), after: (after ?? '').trim() }
}

/** 頁面裡每段 gtag('config', 'G-…', {…}) 的第三個參數（解析不了是 null） */
export function gaConfigsOf(html) {
  return [...html.matchAll(/gtag\(\s*['"]config['"]\s*,\s*['"]G-[A-Z0-9]+['"]\s*,\s*(\{[^}]*\})\s*\)/g)].map((m) => {
    try { return JSON.parse(m[1]) } catch { /* 舊片段是 JS 物件字面值，不是 JSON */ }
    try { return JSON.parse(m[1].replace(/([{,]\s*)([A-Za-z_]\w*)\s*:/g, '$1"$2":').replace(/'/g, '"')) } catch { return null }
  })
}

/** 工具連結比對用的形狀（頁尾不帶說明） */
const toolShape = (l, { summary }) => ({ href: l.href, hreflang: l.hreflang, label: l.label, lang: l.lang ?? null, before: (l.before ?? '').trim(), after: (l.after ?? '').trim(), ...(summary ? { summary: l.summary ?? null } : {}) })

/** 全站工具清單（主站首頁規格 J.1 的 T1 到 T4） */
export function checkTools(ctx) {
  const c = newCheck('tools', '全站工具清單（T1 到 T4）')
  const index = ctx.toolsIndex
  const slugs = new Set((index?.tools ?? []).map((t) => t.slug))
  const hasTools = hasSiteTools(index)
  let compared = 0
  const linksOf = (code) => {
    try { return siteToolLinks(index, { locale: code, text: textOfCode(code) }) } catch (e) { fail(c, `T1：${code} 的工具組算不出來：${e.message}`); return [] }
  }
  const expected = new Map()
  const want = (code) => {
    if (!expected.has(code)) expected.set(code, linksOf(code))
    return expected.get(code)
  }
  const compare = (where, region, code, summary) => {
    const exp = want(code).map((l) => toolShape(l, { summary }))
    const got = region ? toolLinksIn(region.inner).map((l) => toolShape(l, { summary })) : []
    compared++
    if (!sameList(got, exp)) fail(c, `T1：${where} 跟 siteToolLinks(index, { locale: '${code}' }) 不同：預期 ${JSON.stringify(exp)}，實際 ${JSON.stringify(got)}`)
    return got
  }
  for (const d of ctx.pages.values()) {
    const code = d.type === 'site-home' ? homeCodeOf(d.url) : 'zh-tw'
    const regions = []
    // T1：首頁與外語首頁的 #tools；每頁頁尾的工具組
    if (d.url === '/' || d.type === 'site-home') {
      const tools = toolsRegionOf(d.html)
      if (d.url === '/' && !hasTools && tools) fail(c, 'T1：tools.json 沒有工具，/ 不該有 #tools（整區不輸出）')
      if (d.type === 'site-home' || hasTools) regions.push(...compare(`${d.url} 的 #tools`, tools, code, true))
    }
    const footerTools = footerToolsOf(d.html)
    if (!hasTools && footerTools) fail(c, `T1：${d.url} 的頁尾有工具組，但 tools.json 沒有工具（清單空的時候整組不輸出）`)
    if (hasTools || footerTools) regions.push(...compare(`${d.url} 的頁尾工具組`, footerTools, code, false))
    // T2：工具連結全是 https://www.casper.tw/<slug>/ 開頭、帶尾斜線
    for (const l of regions) {
      const m = /^https:\/\/www\.casper\.tw\/([a-z0-9]+(?:-[a-z0-9]+)*)\//.exec(l.href ?? '')
      if (!m || !slugs.has(m[1]) || !l.href.endsWith('/')) fail(c, `T2：${d.url} 的工具連結 ${show(l.href)} 要是 https://www.casper.tw/<slug>/ 開頭、帶尾斜線`)
    }
    // T3：頁首、頁尾、#tools、外語首頁沒有 pocketool.app
    const scopes = d.type === 'site-home' ? [d.html.slice(headOf(d.html).length)] : [firstElement(d.html, 'header')?.outer, firstElement(d.html, 'footer')?.outer, toolsRegionOf(d.html)?.outer]
    for (const html of scopes.filter(Boolean)) for (const a of anchorsIn(html)) if (/pocketool\.app/i.test(a.href ?? '')) fail(c, `T3：${d.url} 有連到口袋工具的連結 ${a.href}（口袋工具的工具不搬、不雙掛）`)
    // T4：繁中頁頁首的「工具」連結存在若且唯若 tools.json 有工具
    if (d.type !== 'site-home') {
      const header = firstElement(d.html, 'header')
      const toolsLink = anchorsIn(header?.outer ?? '').some((a) => [`${SITE}/#tools`, '/#tools'].includes(a.href))
      if (hasTools && !toolsLink) fail(c, `T4：${d.url} 的頁首沒有「工具」連結（tools.json 有 ${index.tools.length} 支工具）`)
      if (!hasTools && toolsLink) fail(c, `T4：${d.url} 的頁首有「工具」連結，但 tools.json 沒有工具`)
    }
  }
  for (const t of index?.tools ?? []) {
    for (const [code, v] of Object.entries(t.locales ?? {})) if (!(v?.url ?? '').startsWith(`${SITE}/${t.slug}/`) || !v.url.endsWith('/')) fail(c, `T2：tools.json 的 ${t.slug}（${code}）網址 ${show(v?.url)} 要是 ${SITE}/${t.slug}/ 開頭、帶尾斜線`)
  }
  c.stats = { tools: index?.tools?.length ?? 0, compared }
  c.summary = hasTools ? `tools.json 有 ${index.tools.length} 支工具，比了 ${compared} 個工具區與頁尾工具組` : `tools.json 沒有工具：${ctx.pages.size} 頁都沒有工具區、頁尾工具組與頁首「工具」連結`
  return c
}

// ============================================================================
// 執行
// ============================================================================

export const CHECKS = [checkRepo, checkUrls, checkFrozenFiles, checkPages, checkSiteName, checkNewPages, checkAnchors, checkText, checkContent, checkLists, checkFeeds, checkAds, checkLayout, checkSidebar, checkCategories, checkTemplates, checkChunks, checkJsonLd, checkLocales, checkTools]

/** 分類白名單：theme/shared/data/categories.json（workspace 的 site-data 從 config/reserved-paths.json 產生，shell-sync 複製過來，主站首頁規格 H.3） */
export const CATEGORIES_FILE = 'source/.vitepress/theme/shared/data/categories.json'

/**
 * 跑全部檢查，回傳報告物件。opts：
 * root（repo 根目錄）、distDir、baselineDir、srcDir（null 代表不讀原始碼）、adsMode、limits、
 * 測試用的注入：posts（文章索引）、adsFalseUrls、baselineHtml（Map：基準檔案路徑 → HTML，取代 git）、categories、fixedAnchors，
 * 以及外語首頁與工具清單的預期值：plan（buildSiteHomePlan 的結果）、shell、toolsIndex（tools.json）、siteCard（null 代表沒有檔）、
 * legal（{ pages, decisions }）、readHome（(code) => 文案檔）。沒給時讀 repo 裡的 site.config.mjs、tools.json、site-card.json。
 */
export async function runAudit(opts = {}) {
  const root = opts.root ?? ROOT
  const baselineDir = opts.baselineDir ?? latestBaselineDir(root)
  const baseline = loadBaseline(baselineDir)
  const dist = scanDist(opts.distDir ?? path.join(root, 'source/.vitepress/dist'))
  const srcDir = opts.srcDir === undefined ? path.join(root, 'source') : opts.srcDir
  const posts = opts.posts !== undefined ? opts.posts : await tryLoadPosts(srcDir)
  const git = opts.baselineHtml
    ? { ok: true, error: null, get: (f) => (opts.baselineHtml.has(f) ? Buffer.from(opts.baselineHtml.get(f)) : null) }
    : gitBaselineReader(root, baseline.commit, [...baseline.pages.map((p) => p.file), ...FROZEN_FILES])
  const pages = parseDistPages(dist)
  const adsFalse = opts.adsFalseUrls ?? new Set([
    ...(posts ?? []).filter((x) => x.ads === false).map((x) => encodeURI(x.url)),
    ...[...pages.values()].filter((d) => d.type !== 'post' && frontmatterAdsFalse(srcDir, d.file.replace(/\.html$/, '.md'))).map((d) => d.url),
  ])
  const categories = opts.categories ?? JSON.parse(fs.readFileSync(path.join(root, CATEGORIES_FILE), 'utf8')).categories.map((x) => x.name)
  const config = opts.siteConfig ?? siteConfig
  const siteCardFile = path.join(root, 'site-card.json')
  const htmlCache = new Map()
  const expected = []
  const ctx = {
    root, baseline, dist, pages, posts, git, adsFalse, categories,
    plan: opts.plan ?? buildSiteHomePlan({ config, env: {} }),
    shell: opts.shell ?? config.shell,
    toolsIndex: opts.toolsIndex ?? SITE_INDEX,
    siteCard: opts.siteCard !== undefined ? opts.siteCard : (fs.existsSync(siteCardFile) ? JSON.parse(fs.readFileSync(siteCardFile, 'utf8')) : null),
    legal: opts.legal ?? { pages: LEGAL_PAGES, decisions: LEGAL_DECISIONS },
    readHome: opts.readHome ?? readHomeMessages,
    fixedAnchors: opts.fixedAnchors ?? FIXED_ANCHORS,
    adsMode: opts.adsMode ?? ADS_MODE,
    limits: { themeChunk: THEME_CHUNK_MAX, ...opts.limits },
    baseHtml(p) {
      if (!htmlCache.has(p.file)) htmlCache.set(p.file, git.get(p.file)?.toString('utf8') ?? null)
      return htmlCache.get(p.file)
    },
    expect(check, target, reason) { expected.push({ check, target, reason }) },
  }
  const checks = CHECKS.map((fn) => fn(ctx))
  return {
    ok: checks.every((x) => x.ok),
    generatedAt: new Date().toISOString(),
    dist: path.relative(root, dist.dir) || '.',
    baseline: { dir: path.relative(root, baselineDir), commit: baseline.commit, html: git.ok ? 'git' : git.error },
    adsMode: ctx.adsMode,
    checks,
    expected,
  }
}

/** 人看的摘要 */
export function formatReport(report, { maxLines = 15 } = {}) {
  const out = [`audit-build：dist ${report.dist}，基準 ${report.baseline.dir}（${(report.baseline.commit ?? '').slice(0, 10)}），ADS_MODE ${report.adsMode}`]
  for (const c of report.checks) {
    out.push(`[${c.ok ? '通過' : '失敗'}] ${c.title}：${c.ok ? c.summary : `${c.failures.length} 個問題；${c.summary}`}`)
    for (const f of c.failures.slice(0, maxLines)) out.push(`    ${f}`)
    if (c.failures.length > maxLines) out.push(`    另外 ${c.failures.length - maxLines} 個，完整清單見報告`)
    for (const n of c.notes.slice(0, 5)) out.push(`    說明：${n}`)
    if (c.notes.length > 5) out.push(`    說明另有 ${c.notes.length - 5} 條，見報告`)
  }
  const reasons = new Map()
  for (const e of report.expected) reasons.set(e.reason, (reasons.get(e.reason) ?? 0) + 1)
  if (reasons.size) {
    out.push('預期差異（白名單）：')
    for (const [r, n] of reasons) out.push(`    ${n} 處：${r}`)
  }
  const bad = report.checks.filter((c) => !c.ok)
  out.push(bad.length ? `結果：失敗，${bad.length} 項檢查沒過（${bad.map((c) => c.id).join('、')}）` : `結果：全部 ${report.checks.length} 項通過`)
  return out.join('\n')
}

function parseArgs(argv) {
  const opts = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--print-baseline-commit') { opts.printCommit = true; continue }
    const key = { '--dist': 'distDir', '--baseline': 'baselineDir', '--report': 'report' }[a]
    if (!key || argv[i + 1] === undefined) throw new Error(`不認得的參數：${a}（可用 --dist、--baseline、--report、--print-baseline-commit）`)
    opts[key] = path.resolve(argv[++i])
  }
  return opts
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))
  if (opts.printCommit) {
    console.log(loadBaseline(opts.baselineDir ?? latestBaselineDir()).commit)
    return
  }
  const report = await runAudit(opts)
  const reportPath = opts.report ?? path.join(ROOT, 'source/.vitepress/cache/audit-report.json')
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 1) + '\n')
  console.log(formatReport(report))
  console.log(`報告：${path.relative(process.cwd(), reportPath)}`)
  if (!report.ok) process.exitCode = 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}
