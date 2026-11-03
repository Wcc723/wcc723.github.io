// 部落格（VitePress）和每支工具共用的站名、網址與 AdSense head 片段。正本在 workspace 的 shared/shell/，
// 由 scripts/shell-sync.mjs 複製進各專案：GitHub Actions 和 Workers Builds 只 clone 子專案，建置時讀不到這裡。
// 只用標準 JavaScript，不 import 任何套件，Node 腳本、Vite、VitePress config 都能直接 import。

// 站名。P2 切換那一版維持「卡斯伯 Blog」，首頁 title 和全站 og:site_name 也逐字照舊（SITE_TITLE_LEGACY）。
// P3 跟第一支工具 /lucky-draw/ 同一版改成 SITE_NAME = '卡斯伯工具'，
// 同時把 SITE_NAME_EN 設成 "Casper's Sidekick"（站長 2026-11-03 選定，見 docs/decisions/0005-site-name.md）。
// 改名只動這兩個常數和它們出現的位置（首頁 title、og:site_name、WebSite JSON-LD、字標、頁尾署名），網址不動。
export const SITE_NAME = '卡斯伯 Blog'
export const SITE_NAME_EN = '' // 空字串代表不顯示英文站名；P3 改成 "Casper's Sidekick"
export const SITE_TITLE_LEGACY = '卡斯伯 Blog - 前端，沒有極限'
export const SITE_CODE_NAME = 'caspers-sidekick' // 需要英文代號的地方（帳號名、識別字）用這個
export const SITE_URL = 'https://www.casper.tw'

// AdSense 發布商 ID，跟口袋工具共用同一個帳戶（線上 /ads.txt 與每頁的 loader 都公開這個值）。
export const ADSENSE_CLIENT = 'ca-pub-8296684122088055'
export const ADSENSE_LOADER_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`

// 廣告模式（docs/architecture/ads.md、docs/decisions/0003-auto-ads-only.md）：
// standard：casper.tw 在 AdSense 是「就緒」而且沒有政策通知；
// allowlist：狀態不是就緒、需要審查或還不知道，只在文章、/about/、工具頁載入。
// 2026-11-03 站長確認 casper.tw 的 AdSense 狀態正常，用 standard；收到政策通知或要重新審查時，一個 commit 改回 allowlist。
export const ADS_MODE = 'standard'

// 頁型對廣告 loader 的規則。never 的頁兩種模式都不載入，但仍保留 google-adsense-account meta。
export const AD_PAGE_TYPES = {
  always: ['post', 'about', 'tool'],
  standardOnly: ['home', 'blog-index', 'taxonomy-list'], // 首頁、/page/N/、分類與標籤列表（每頁 10 段摘要）
  never: ['not-found', 'tool-not-found', 'nav-index', 'legal'], // 404、工具 404、/categories/ /tags/ /archives/、/privacy/ /contact/ /terms/
}

/**
 * 這一頁要不要載入 Auto ads 的 loader。front matter 寫 ads: false 的頁一律不載入。
 * 不認得的頁型丟錯，避免新頁型默默載入或默默不載入。
 */
export function shouldLoadAds({ type, adsFalse = false }, mode = ADS_MODE) {
  if (!['standard', 'allowlist'].includes(mode)) throw new Error(`未知的 ADS_MODE：${mode}`)
  const known = Object.values(AD_PAGE_TYPES).flat()
  if (!known.includes(type)) throw new Error(`未知的頁型：${type}`)
  if (adsFalse || AD_PAGE_TYPES.never.includes(type)) return false
  if (AD_PAGE_TYPES.always.includes(type)) return true
  return mode === 'standard'
}

/** VitePress head 格式（[tag, attrs]）。loader: false 時只留 meta，給 404 這類不載入廣告的頁 */
export function adsenseHead({ loader = true } = {}) {
  const head = [['meta', { name: 'google-adsense-account', content: ADSENSE_CLIENT }]]
  if (loader) head.push(['script', { async: '', src: ADSENSE_LOADER_SRC, crossorigin: 'anonymous' }])
  return head
}

/** 同一段 head 的 HTML 字串，給工具的 index.html 或 vite-ssg 的 head 用 */
export function adsenseHeadHtml({ loader = true } = {}) {
  const meta = `<meta name="google-adsense-account" content="${ADSENSE_CLIENT}">`
  return loader ? `${meta}\n<script async src="${ADSENSE_LOADER_SRC}" crossorigin="anonymous"></script>` : meta
}

// 比照口袋工具 hub 的 transformHtml：建置時從產物 HTML 拿掉 loader，meta 保留。audit 用 countAdsLoaders 直接讀 dist。
const LOADER_RE = /\s*<script\b[^>]*\bsrc="https:\/\/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js[^"]*"[^>]*><\/script>/g
export const stripAdsLoader = (html) => html.replace(LOADER_RE, '')
export const countAdsLoaders = (html) => (html.match(LOADER_RE) ?? []).length
