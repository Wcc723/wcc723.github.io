// lib/pagetype.mjs 的測試：外語首頁 /<code>/ 是 site-home（主站首頁規格 B.6），zh-tw/index.md 不認得
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { pageTypeOf } from './pagetype.mjs'
import { AD_PAGE_TYPES } from '../theme/shared/shell/site.mjs'

test('pageTypeOf：既有頁型照舊', () => {
  assert.equal(pageTypeOf('index.md'), 'home')
  assert.equal(pageTypeOf('404.md'), 'not-found')
  assert.equal(pageTypeOf('page/2/index.md'), 'blog-index')
  assert.equal(pageTypeOf('categories/index.md'), 'nav-index')
  assert.equal(pageTypeOf('categories/CSS/page/2/index.md'), 'taxonomy-list')
  assert.equal(pageTypeOf('javascript/2019/03/18/JS-THIS/index.md'), 'post')
  assert.equal(pageTypeOf('about\\index.md'), 'about')
})

test('pageTypeOf：外語首頁是 site-home，每個非繁中語系都認得', () => {
  for (const code of ['en', 'zh-cn', 'ja', 'ko', 'de', 'es']) assert.equal(pageTypeOf(`${code}/index.md`), 'site-home', code)
  assert.ok(Object.values(AD_PAGE_TYPES).flat().includes('site-home'))
})

test('pageTypeOf：zh-tw/index.md、外語首頁底下的子頁、大小寫不同都丟錯', () => {
  assert.throws(() => pageTypeOf('zh-tw/index.md'), /不認得的頁面路徑 zh-tw\/index\.md/)
  assert.throws(() => pageTypeOf('en/about/index.md'), /不認得的頁面路徑/)
  assert.throws(() => pageTypeOf('EN/index.md'), /不認得的頁面路徑/)
  assert.throws(() => pageTypeOf('it/index.md'), /不認得的頁面路徑/)
})
