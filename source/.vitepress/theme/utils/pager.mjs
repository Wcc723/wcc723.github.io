// 分頁：讀 frontmatter.pager（{ current, total, prevUrl, nextUrl, base }），算出上一頁、下一頁和跳頁選單。
// 網址規則跟 Hexo 相同：第 1 頁是 base，第 N 頁是 base + 'page/N/'。base 的大小寫照給的值（/categories/CSS/）。

const withSlashes = (base) => {
  let b = String(base ?? '/')
  if (!b.startsWith('/')) b = `/${b}`
  if (!b.endsWith('/')) b = `${b}/`
  return b
}

/** 第 n 頁的網址 */
export function pageUrl(base, n) {
  const b = withSlashes(base)
  return n <= 1 ? b : `${b}page/${n}/`
}

/** frontmatter.pager → 版面要的資料；只有 1 頁或資料不完整時回 null，整個分頁區不輸出 */
export function pagerModel(pager) {
  if (!pager) return null
  const total = Math.trunc(Number(pager.total))
  const current = Math.trunc(Number(pager.current))
  if (!Number.isFinite(total) || total <= 1 || !Number.isFinite(current) || current < 1) return null
  const base = withSlashes(pager.base)
  const prevUrl = pager.prevUrl ?? (current > 1 ? pageUrl(base, current - 1) : null)
  const nextUrl = pager.nextUrl ?? (current < total ? pageUrl(base, current + 1) : null)
  const options = Array.from({ length: total }, (_, i) => {
    const n = i + 1
    return { n, url: pageUrl(base, n), label: `第 ${n} 頁`, selected: n === current }
  })
  return { current, total, prevUrl, nextUrl, options }
}
