import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { SITE_TITLE_LEGACY, SITE_URL } from './theme/shared/shell/site.mjs'
import { postRewrites, unpublishedFiles } from './lib/posts.mjs'
import { markdownOptions } from './lib/markdown.mjs'
import { pageDataFor } from './lib/pagedata.mjs'
import { siteHeadFor, seoPageData, transformHtml } from './lib/seo.mjs'
import { buildFeeds, sitemapTransformItems } from './lib/feeds.mjs'
import { buildSiteHomePlan, effectiveShell, vitepressLocales } from './lib/site-home.mjs'
import { themeHead } from './theme/head.mjs'
import { previewHead } from './lib/preview-links.mjs'

// 介面與分工見同資料夾的 README.md。這個檔只負責接線。
const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// 外語首頁（主站首頁規格 C、D.1）：site.config.mjs 的 home.locales 與 CS_STAGE 決定這次要產生哪些頁。
// live 時列進 home.locales 卻沒過關卡就建置失敗，不會默默少一頁（上線後不下架）
const homePlan = buildSiteHomePlan()
if (homePlan.problems.length) throw new Error(`外語首頁沒過關卡：\n${homePlan.problems.join('\n')}`)
for (const w of homePlan.warnings) console.warn(`[site-home] ${w}`)
const hasSiteHome = homePlan.pages.length > 0
// 共用頁首頁尾（G.5）：preview 一律用，正式建置照 site.config.mjs 的 shell（P1、P2 是 legacy）
const sharedShell = effectiveShell(homePlan) === 'shared'

export default defineConfig({
  // 有外語首頁才設 locales；P1、P2 不設，產物跟改之前相同（K.4 第 2 步的 dist-diff 驗）。
  ...(hasSiteHome ? { locales: vitepressLocales(homePlan) } : {}),
  // 兩個建置開關，true 時才把對應的非同步元件與它們 import 的 CSS 放進建置；P1、P2 的正式建置兩個都是 false。
  // 兩種情況都要給值：沒有定義時 Layout.vue 在 SSR 會丟 ReferenceError
  //   __CS_SITE_HOME__：這次有外語首頁要產生（B.6），登記 SiteHomePage
  //   __CS_SHARED_SHELL__：這次用共用頁首頁尾（G.5，S 版起或 preview），Layout 換成 components/SharedHeader.vue、SharedFooter.vue
  vite: {
    define: {
      __CS_SITE_HOME__: hasSiteHome ? 'true' : 'false',
      __CS_SHARED_SHELL__: sharedShell ? 'true' : 'false'
    }
  },
  // preview 不寫 dist/（C.3）：outDir 相對於 source/，vitepress preview 讀同一份設定，所以 preview:intl 也帶 CS_STAGE=preview
  ...(homePlan.stage === 'preview' ? { outDir: '.vitepress/preview-dist' } : {}),
  lang: 'zh-TW',
  title: SITE_TITLE_LEGACY,
  cleanUrls: true,
  appearance: false,
  srcExclude: [...unpublishedFiles(srcDir), 'README.md'],
  rewrites: postRewrites(srcDir),
  // 整頁載入（版面根元素 vp-raw，決策 0006）：換頁一律是新的 document，hydrate 用的是 .lean.js。
  // VitePress 預設會替視窗裡每個站內連結預抓目標頁的 .md.js（SPA 換頁才用得到），這裡全部白抓，關掉。
  // 不影響 SSR 輸出與 SEO；audit 的 layout 檢查會擋下重新打開。
  router: { prefetchLinks: false },
  // 每頁內嵌的 __VP_HASH_MAP__ 與 site data（約 34 KB，壓縮後約 9 KB）抽成 assets/chunks/metadata.<hash>.js：
  // 整頁載入時每換一頁都要重抓內嵌那段，抽出來之後瀏覽器可以快取。只動 head 的一支 module script，不影響 SSR 內文與 SEO。
  metaChunk: true,
  // 不設 true（計畫「SEO」的站內連結）。VitePress 把 http://localhost:<port> 當成站內連結檢查，
  // 舊文教學裡要讀者打開自己電腦上的網址（rails-go 的 http://localhost:3000/drinks），不是本站網址，只略過這一種。
  // 之後的工具與 Pages 專案站的樣式由 data/tools.json、Pages repo 清單產生後加在這裡。
  ignoreDeadLinks: [/^https?:\/\/localhost[:/]/],
  markdown: markdownOptions,
  // 舊文的原始 HTML 照寫的網址輸出（Hexo 不處理它們）：只有 ./ 開頭的相對網址交給 Vite 打包，
  // movie.ogg、/xxx/xx（示範用的壞圖）這類網址不轉成 import，否則 build 會因為找不到檔案而失敗。
  vue: { template: { transformAssetUrls: { includeAbsolute: false } } },
  // preview 才多一段：本機預覽點 https://www.casper.tw/ 的站內連結留在 localhost，tools.json 裡工具的網址除外（lib/preview-links.mjs）
  head: [...siteHeadFor(sharedShell ? 'shared' : 'legacy'), ...themeHead, ...previewHead(homePlan)],
  transformPageData(pageData, ctx) {
    pageDataFor(pageData, ctx, srcDir, { plan: homePlan })
    seoPageData(pageData, ctx, { plan: homePlan })
  },
  transformHtml,
  buildEnd: (siteConfig) => buildFeeds(siteConfig, srcDir),
  // lastmodDateOnly：lastmod 輸出 2026-10-05（跟 Hexo 的 sitemap 同格式），不輸出 2026-10-05T00:00:00.000Z
  sitemap: { hostname: SITE_URL, lastmodDateOnly: true, transformItems: sitemapTransformItems(srcDir) }
})
