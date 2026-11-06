// lib/posts.mjs 的測試：文章網址的 category 或 slug 段不能等於語系代碼（主站首頁規格 B.3）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { assertNoLocaleSegment, loadPosts, postRewrites, POSTS_DIR } from './posts.mjs'
import { BASELINE_DATE, REAL_SOURCE_DIR, SOURCE_DIR, postsAfterBaseline } from './test-fixture.mjs'

const post = (category, slug) => ({ file: `2020-01-01-${slug}.md`, category, slug })

test('assertNoLocaleSegment：category 或 slug 等於語系代碼（不分大小寫）就丟錯', () => {
  assert.throws(() => assertNoLocaleSegment(post('es', 'hello')), /文章 2020-01-01-hello\.md 的 es 跟語系代碼相同/)
  assert.throws(() => assertNoLocaleSegment(post('javascript', 'JA')), /的 JA 跟語系代碼相同/)
  assert.throws(() => assertNoLocaleSegment(post('javascript', 'zh-tw')), /跟語系代碼相同/)
  assert.throws(() => assertNoLocaleSegment(post('Zh-CN', 'x')), /跟語系代碼相同/)
  const ok = post('javascript', 'english-notes')
  assert.equal(assertNoLocaleSegment(ok), ok)
})

test('postRewrites：真實的文章（基準 364 篇加基準之後的新文章）都沒有語系段', () => {
  assert.equal(Object.keys(postRewrites(REAL_SOURCE_DIR)).length, 364 + postsAfterBaseline().length)
})

test('基準視圖（test-fixture 的 SOURCE_DIR）只排除基準日之後的新文章：364 篇舊文章都在，排除的每篇都比基準晚', () => {
  const fresh = postsAfterBaseline()
  for (const p of fresh) assert.ok(p.date > BASELINE_DATE, `${p.file} 不在基準裡，日期卻不晚於基準日 ${BASELINE_DATE}：舊文章的網址或分類被改了？`)
  assert.equal(loadPosts(SOURCE_DIR).length, 364)
  const real = fs.readdirSync(path.join(REAL_SOURCE_DIR, POSTS_DIR)).length
  assert.equal(fs.readdirSync(path.join(SOURCE_DIR, POSTS_DIR)).length, real - fresh.length)
})
