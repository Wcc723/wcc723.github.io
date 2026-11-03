import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pageUrl, pagerModel } from './pager.mjs'

test('pageUrl：第 1 頁是 base，其他頁加 page/N/', () => {
  assert.equal(pageUrl('/', 1), '/')
  assert.equal(pageUrl('/', 2), '/page/2/')
  assert.equal(pageUrl('/categories/CSS/', 10), '/categories/CSS/page/10/')
  assert.equal(pageUrl('/tags/%E8%B3%87%E5%AE%89', 2), '/tags/%E8%B3%87%E5%AE%89/page/2/')
  assert.equal(pageUrl('tags/sass/', 1), '/tags/sass/')
})

test('pagerModel：首頁第 1 頁沒有上一頁，下一頁是 /page/2/', () => {
  const m = pagerModel({ current: 1, total: 37, prevUrl: null, nextUrl: '/page/2/', base: '/' })
  assert.equal(m.prevUrl, null)
  assert.equal(m.nextUrl, '/page/2/')
  assert.equal(m.options.length, 37)
  assert.deepEqual(m.options[0], { n: 1, url: '/', label: '第 1 頁', selected: true })
  assert.equal(m.options[36].url, '/page/37/')
})

test('pagerModel：第 2 頁的上一頁指回 base；沒給網址時由 base 算', () => {
  const m = pagerModel({ current: 2, total: 3, base: '/categories/CSS/' })
  assert.equal(m.prevUrl, '/categories/CSS/')
  assert.equal(m.nextUrl, '/categories/CSS/page/3/')
  assert.equal(m.options.find((o) => o.selected).n, 2)
})

test('pagerModel：最後一頁沒有下一頁', () => {
  const m = pagerModel({ current: 3, total: 3, base: '/' })
  assert.equal(m.nextUrl, null)
  assert.equal(m.prevUrl, '/page/2/')
})

test('pagerModel：只有 1 頁或沒有資料就不輸出', () => {
  assert.equal(pagerModel(null), null)
  assert.equal(pagerModel(undefined), null)
  assert.equal(pagerModel({ current: 1, total: 1, base: '/tags/x/' }), null)
  assert.equal(pagerModel({ current: 'a', total: 3, base: '/' }), null)
})
