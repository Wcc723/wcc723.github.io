import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { AUTHOR, BOOK, SOCIAL, isExternalHref } from './aside.mjs'

const publicFile = (src) => new URL(`../../../public${src}`, import.meta.url)

test('側欄固定內容：文字照 Hexo 版，圖片檔都在 public/，寬高照原始比例', () => {
  assert.equal(AUTHOR.bio, '前端工程師、教學者。在 Web 上寫筆記，自 2013 年至今，也在六角學院教授前端。')
  assert.equal(BOOK.href, 'https://hex.school/byKCb')
  assert.deepEqual(SOCIAL.map((s) => s.name), ['Facebook', 'GitHub', 'YouTube', 'RSS'])
  for (const src of [AUTHOR.avatar.src, BOOK.cover.src]) assert.ok(fs.existsSync(publicFile(src)), src)
  assert.equal(AUTHOR.avatar.width, AUTHOR.avatar.height)
  assert.deepEqual([BOOK.cover.width, BOOK.cover.height], [72, 101])
})

test('側欄固定內容：站外連結都是 https，RSS 是站內的 /atom.xml', () => {
  for (const s of SOCIAL) assert.ok(isExternalHref(s.href) ? s.href.startsWith('https://') : s.href === '/atom.xml', s.href)
  assert.equal(isExternalHref('/atom.xml'), false)
  assert.equal(isExternalHref(BOOK.href), true)
})

test('側欄固定內容：文案不用破折號', () => {
  const text = JSON.stringify({ AUTHOR, BOOK, SOCIAL })
  assert.ok(!/[—–]/.test(text))
})
