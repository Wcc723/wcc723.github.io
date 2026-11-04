// lib/posts.mjs 的測試：文章網址的 category 或 slug 段不能等於語系代碼（主站首頁規格 B.3）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assertNoLocaleSegment, postRewrites } from './posts.mjs'
import { SOURCE_DIR } from './test-fixture.mjs'

const post = (category, slug) => ({ file: `2020-01-01-${slug}.md`, category, slug })

test('assertNoLocaleSegment：category 或 slug 等於語系代碼（不分大小寫）就丟錯', () => {
  assert.throws(() => assertNoLocaleSegment(post('es', 'hello')), /文章 2020-01-01-hello\.md 的 es 跟語系代碼相同/)
  assert.throws(() => assertNoLocaleSegment(post('javascript', 'JA')), /的 JA 跟語系代碼相同/)
  assert.throws(() => assertNoLocaleSegment(post('javascript', 'zh-tw')), /跟語系代碼相同/)
  assert.throws(() => assertNoLocaleSegment(post('Zh-CN', 'x')), /跟語系代碼相同/)
  const ok = post('javascript', 'english-notes')
  assert.equal(assertNoLocaleSegment(ok), ok)
})

test('postRewrites：真實的 364 篇文章都沒有語系段', () => {
  assert.equal(Object.keys(postRewrites(SOURCE_DIR)).length, 364)
})
