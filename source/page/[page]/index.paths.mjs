// /page/2/ 到 /page/N/：最新文章每頁 10 篇，第 1 頁是首頁（index.md）。
// 資料與卡片 HTML 來自 .vitepress/lib/pagedata.mjs；H1、麵包屑、分頁由同一個模組在 transformPageData 寫進 frontmatter。
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { blogIndexPaths } from '../../.vitepress/lib/pagedata.mjs'

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../')

export default {
  paths: () => blogIndexPaths(srcDir)
}
