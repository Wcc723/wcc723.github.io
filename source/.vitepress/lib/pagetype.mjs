// 由 rewrites 之後的 relativePath（例 javascript/2019/03/18/JS-THIS/index.md）判斷頁型。
// 頁型名稱跟 theme/shared/shell/site.mjs 的 AD_PAGE_TYPES 一致；不認得的路徑丟錯，新頁型要在這裡登記。
const POST_RE = /^[^/]+\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/index\.md$/

export function pageTypeOf(relativePath) {
  const p = relativePath.replace(/\\/g, '/')
  if (p === 'index.md') return 'home'
  if (p === '404.md') return 'not-found'
  if (/^page\/[^/]+\/index\.md$/.test(p)) return 'blog-index'
  if (p === 'categories/index.md' || p === 'tags/index.md') return 'nav-index'
  if (/^archives\/(index\.md|[^/]+\/index\.md|[^/]+\/[^/]+\/index\.md)$/.test(p)) return 'nav-index'
  if (/^categories\/[^/]+\/(index\.md|page\/[^/]+\/index\.md)$/.test(p)) return 'taxonomy-list'
  if (/^tags\/[^/]+\/(index\.md|page\/[^/]+\/index\.md)$/.test(p)) return 'taxonomy-list'
  if (p === 'about/index.md' || p === 'about/hexschool-traning.md') return 'about'
  if (['privacy/index.md', 'contact/index.md', 'terms/index.md'].includes(p)) return 'legal'
  if (POST_RE.test(p)) return 'post'
  throw new Error(`pageTypeOf：不認得的頁面路徑 ${relativePath}，請在 lib/pagetype.mjs 登記`)
}
