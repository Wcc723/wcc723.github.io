// /tags/<標籤>/page/N/：標籤的第 2 頁以後，每頁 10 篇。
// 資料與卡片 HTML 來自 .vitepress/lib/pagedata.mjs；H1、麵包屑、分頁由同一個模組在 transformPageData 寫進 frontmatter。
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tagPagePaths } from '../../../../.vitepress/lib/pagedata.mjs'

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../')

export default {
  paths: () => tagPagePaths(srcDir)
}
