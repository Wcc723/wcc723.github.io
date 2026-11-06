// 負責：theme 模組（P1 workflow）。主題需要的全站 head（深淺色防閃 script、favicon），由 config.mts 併進 head；
// 另外放 404 頁的 title 與 description 文字。只放標準 JavaScript，config 在 Node 端 import。
//
// 字型：中文用讀者電腦上的字（Noto Sans TC、蘋方、微軟正黑體），Nunito 和 JetBrains Mono 的拉丁子集自架在
// theme/fonts/，由主題 CSS 的 @font-face 載入（font-display: swap），所以這裡沒有任何外部字型 CSS。
import { FAVICON_URL, SITE_TITLE_LEGACY } from './shared/shell/site.mjs'

// 404 頁：VitePress 內建的 notFoundPageData 是 title「404」、description「Not Found」，換成頁面上的中文。
// lib/seo.mjs 的 transformHtml 改 404.html 的 SSR 輸出；瀏覽器端 VitePress 會再用內建值改一次 head，
// 由 pages/NotFound.vue 在掛載後改回來。H1 與說明文字也用這兩個常數，畫面和 head 一致。
export const NOT_FOUND_HEADING = '這頁找不到'
export const NOT_FOUND_DESCRIPTION = '網址可能打錯了，或是這頁搬家了。'
/** 跟其他頁同一個格式：「頁名 | 站名」 */
export const NOT_FOUND_TITLE = `${NOT_FOUND_HEADING} | ${SITE_TITLE_LEGACY}`

/** localStorage 的 key，跟 Hexo 版相同，讀者原本的設定不會掉；部落格和工具同源，設定共用 */
export const THEME_STORAGE_KEY = 'casper-theme'

// 跟 Hexo 版 themes/casper-2026/layout/common/head.ejs 開頭那段相同（default_mode: light）：
// 只有存的是 dark 才在 <html> 加 .dark，沒存或讀不到（隱私模式、停用 storage）都是亮色。
export const THEME_SCRIPT =
  "(function(){try{var m=localStorage.getItem('casper-theme')||'light';if(m==='dark')document.documentElement.classList.add('dark');}catch(e){}})();"

// favicon 跟工具共用 workspace shared/shell/site.mjs 的 FAVICON_URL（整個 www 只能有一個）；2026-11-06 起是小幽靈頭像
export const FAVICON = FAVICON_URL

export const themeHead = [
  ['script', {}, THEME_SCRIPT],
  ['link', { rel: 'icon', href: FAVICON }]
]
