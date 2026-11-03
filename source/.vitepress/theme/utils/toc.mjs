// 文章側欄的本文目錄。資料來自 VitePress 的 page.headers（lib/markdown.mjs 開了 headers，slug 就是標題 id），
// 主題不 import lib/。只用標準 JavaScript，Vue 元件和 node:test 都能 import。

/** 文章至少要有幾個 h2 才出現目錄 */
export const TOC_MIN_H2 = 3

/** h2 加 h3 超過這個數量時只列 h2，目錄才不會長到要一直捲 */
export const TOC_MAX_ITEMS = 24

/**
 * page.headers（巢狀：{ level, title, slug, children }）→ 目錄項目 [{ level, title, slug }]，照文章順序。
 * h2 少於 TOC_MIN_H2 個時回傳 []（不出現目錄）。只列 h2 與 h3；標題文字或 slug 是空的略過。
 * 連結一律指向既有的標題 id（slug），不另外產生 id。
 */
export function tocItems(headers, { minH2 = TOC_MIN_H2, maxItems = TOC_MAX_ITEMS } = {}) {
  const flat = []
  const walk = (list) => {
    for (const h of Array.isArray(list) ? list : []) {
      if (!h || typeof h !== 'object') continue
      const level = Number(h.level)
      const title = String(h.title ?? '').replace(/\s+/g, ' ').trim()
      const slug = String(h.slug ?? '')
      if ((level === 2 || level === 3) && title && slug) flat.push({ level, title, slug })
      walk(h.children)
    }
  }
  walk(headers)
  const h2 = flat.filter((h) => h.level === 2)
  if (h2.length < minH2) return []
  return flat.length > maxItems ? h2 : flat
}

/**
 * 目前段落：標題的上緣已經捲過判定線的最後一個（照文章順序）。passed[i] 是第 i 個標題是否已經過線。
 * 還沒捲到第一個標題時回傳 ''。
 */
export function activeSlug(slugs, passed) {
  let current = ''
  slugs.forEach((slug, i) => {
    if (passed[i]) current = slug
  })
  return current
}
