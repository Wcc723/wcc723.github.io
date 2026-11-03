import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { SITE_TITLE_LEGACY, SITE_URL } from './theme/shared/shell/site.mjs'
import { postRewrites, unpublishedFiles } from './lib/posts.mjs'
import { markdownOptions } from './lib/markdown.mjs'
import { pageDataFor } from './lib/pagedata.mjs'
import { siteHead, seoPageData, transformHtml } from './lib/seo.mjs'
import { buildFeeds, sitemapTransformItems } from './lib/feeds.mjs'
import { themeHead } from './theme/head.mjs'

// 介面與分工見同資料夾的 README.md。這個檔只負責接線。
const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export default defineConfig({
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
  // 不設 true（計畫「SEO」的站內連結）。VitePress 把 http://localhost:<port> 當成站內連結檢查，
  // 舊文教學裡要讀者打開自己電腦上的網址（rails-go 的 http://localhost:3000/drinks），不是本站網址，只略過這一種。
  // 之後的工具與 Pages 專案站的樣式由 data/tools.json、Pages repo 清單產生後加在這裡。
  ignoreDeadLinks: [/^https?:\/\/localhost[:/]/],
  markdown: markdownOptions,
  // 舊文的原始 HTML 照寫的網址輸出（Hexo 不處理它們）：只有 ./ 開頭的相對網址交給 Vite 打包，
  // movie.ogg、/xxx/xx（示範用的壞圖）這類網址不轉成 import，否則 build 會因為找不到檔案而失敗。
  vue: { template: { transformAssetUrls: { includeAbsolute: false } } },
  head: [...siteHead, ...themeHead],
  transformPageData(pageData, ctx) {
    pageDataFor(pageData, ctx, srcDir)
    seoPageData(pageData, ctx)
  },
  transformHtml,
  buildEnd: (siteConfig) => buildFeeds(siteConfig, srcDir),
  // lastmodDateOnly：lastmod 輸出 2026-10-05（跟 Hexo 的 sitemap 同格式），不輸出 2026-10-05T00:00:00.000Z
  sitemap: { hostname: SITE_URL, lastmodDateOnly: true, transformItems: sitemapTransformItems(srcDir) }
})
