// /tags/<標籤>/：每個標籤的第 1 頁（slug 是空白和點換成 -，中文保留）。
// 資料與卡片 HTML 來自 .vitepress/lib/pagedata.mjs；H1、麵包屑、分頁由同一個模組在 transformPageData 寫進 frontmatter。
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tagPaths } from '../../.vitepress/lib/pagedata.mjs'

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../')

export default {
  paths: () => tagPaths(srcDir)
}
