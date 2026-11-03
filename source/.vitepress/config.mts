import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { SITE_TITLE_LEGACY, SITE_URL } from './theme/shared/site.mjs'
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
  markdown: markdownOptions,
  head: [...siteHead, ...themeHead],
  transformPageData(pageData, ctx) {
    pageDataFor(pageData, ctx, srcDir)
    seoPageData(pageData, ctx)
  },
  transformHtml,
  buildEnd: (siteConfig) => buildFeeds(siteConfig, srcDir),
  sitemap: { hostname: SITE_URL, transformItems: sitemapTransformItems(srcDir) }
})
