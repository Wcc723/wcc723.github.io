import { test } from 'node:test'
import assert from 'node:assert/strict'
import { activeSlug, tocItems, TOC_MAX_ITEMS, TOC_MIN_H2 } from './toc.mjs'

const h = (level, title, children = []) => ({ level, title, slug: title.replace(/\s+/g, '-'), link: '#x', children })

test('tocItems：h2 少於 3 個不出現目錄', () => {
  assert.equal(TOC_MIN_H2, 3)
  assert.deepEqual(tocItems([h(2, 'A'), h(2, 'B', [h(3, 'B1'), h(3, 'B2'), h(3, 'B3')])]), [])
  assert.deepEqual(tocItems([]), [])
  assert.deepEqual(tocItems(undefined), [])
})

test('tocItems：照文章順序攤平 h2 與 h3，h4 以下不列，slug 照用', () => {
  const headers = [h(2, 'A', [h(3, 'A1', [h(4, 'A1x')])]), h(2, 'B'), h(2, 'C 段', [h(3, 'C1')])]
  assert.deepEqual(tocItems(headers), [
    { level: 2, title: 'A', slug: 'A' },
    { level: 3, title: 'A1', slug: 'A1' },
    { level: 2, title: 'B', slug: 'B' },
    { level: 2, title: 'C 段', slug: 'C-段' },
    { level: 3, title: 'C1', slug: 'C1' }
  ])
})

test('tocItems：文章開頭先出現 h3 也照順序；空標題、沒有 slug 的略過', () => {
  const headers = [h(3, 'intro'), h(2, 'A'), { level: 2, title: '  ', slug: 'blank', children: [] }, { level: 2, title: 'no slug', slug: '', children: [] }, h(2, 'B'), h(2, 'C')]
  assert.deepEqual(tocItems(headers).map((x) => x.slug), ['intro', 'A', 'B', 'C'])
})

test('tocItems：h2 加 h3 太多時只列 h2', () => {
  const many = Array.from({ length: 5 }, (_, i) => h(2, `S${i}`, Array.from({ length: 5 }, (_, j) => h(3, `S${i}-${j}`))))
  assert.ok(5 * 6 > TOC_MAX_ITEMS)
  assert.deepEqual(tocItems(many).map((x) => x.level), [2, 2, 2, 2, 2])
  assert.equal(tocItems(many, { maxItems: 30 }).length, 30)
})

test('activeSlug：最後一個已經過線的標題；都還沒過線就是空字串', () => {
  const slugs = ['a', 'b', 'c']
  assert.equal(activeSlug(slugs, [false, false, false]), '')
  assert.equal(activeSlug(slugs, [true, false, false]), 'a')
  assert.equal(activeSlug(slugs, [true, true, false]), 'b')
  assert.equal(activeSlug(slugs, [true, true, true]), 'c')
})
