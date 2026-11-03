// 負責：routes 模組（P1 workflow）。介面見 ../README.md。
import { pageTypeOf } from './pagetype.mjs'
export function pageDataFor(pageData, ctx, srcDir) {
  pageData.frontmatter.pageType = pageTypeOf(pageData.relativePath)
}
