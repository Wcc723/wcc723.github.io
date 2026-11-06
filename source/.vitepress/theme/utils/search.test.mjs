import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { buildPostIndex, buildSiteToolIndex, buildToolIndex, searchIndex, highlightParts } from './search.mjs'

const baselineJson = fileURLToPath(new URL('../../../../baseline/hexo-2026-11-03/content.json', import.meta.url))

test('buildPostIndex：讀 Hexo 的 content.json 格式', () => {
  const idx = buildPostIndex([
    {
      title: '資安習慣養成',
      date: '2026-10-04T16:00:00.000Z',
      path: 'development/2026/10/05/security-habits/',
      categories: [{ name: 'development', slug: 'development' }],
      tags: [{ name: 'develop' }, { name: '資安' }]
    }
  ])
  assert.equal(idx.length, 1)
  assert.equal(idx[0].url, '/development/2026/10/05/security-habits/')
  assert.equal(idx[0].date, '2026-10-05', '日期從網址取，不用 UTC 的 date')
  assert.equal(idx[0].category, 'development')
  assert.ok(idx[0].hay.includes('資安'))
})

test('buildPostIndex：也接受 { posts: [] } 和奇怪的輸入', () => {
  assert.equal(buildPostIndex({ posts: [{ title: 'a', path: '/x/' }] })[0].url, '/x/')
  assert.deepEqual(buildPostIndex(null), [])
  assert.deepEqual(buildPostIndex({}), [])
})

test('基準的 content.json 364 篇都能建索引，網址都以 / 開頭', { skip: !fs.existsSync(baselineJson) }, () => {
  const idx = buildPostIndex(JSON.parse(fs.readFileSync(baselineJson, 'utf8')))
  assert.equal(idx.length, 364)
  assert.ok(idx.every((e) => e.url.startsWith('/') && e.url.endsWith('/')))
  assert.ok(idx.every((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date)))
  const hits = searchIndex(idx, 'nvm')
  assert.ok(hits.some((e) => e.url === '/development/2022/01/10/install-nvm/'))
  assert.ok(idx.some((e) => e.url === '/javascript/2019/03/18/JS-THIS/'), '大寫網址照舊')
})

test('searchIndex：每個詞都要出現，比對標題、分類、標籤，不分大小寫', () => {
  const idx = buildPostIndex([
    { title: 'CSS Flex 圖解', path: 'css/2017/07/21/css-flex/', categories: ['css'], tags: ['flex'] },
    { title: 'Vue 入門', path: 'vue/2020/01/01/vue/', categories: ['vue'], tags: ['javascript'] }
  ])
  assert.deepEqual(searchIndex(idx, 'flex').map((e) => e.title), ['CSS Flex 圖解'])
  assert.deepEqual(searchIndex(idx, 'JAVASCRIPT').map((e) => e.title), ['Vue 入門'])
  assert.deepEqual(searchIndex(idx, 'css 圖解').map((e) => e.title), ['CSS Flex 圖解'])
  assert.deepEqual(searchIndex(idx, 'css vue'), [])
  assert.deepEqual(searchIndex(idx, '   '), [])
})

test('searchIndex：工具排在文章前面，最多 limit 筆', () => {
  const posts = buildPostIndex(Array.from({ length: 80 }, (_, i) => ({ title: `抽獎 ${i}`, path: `life/2020/01/01/p${i}/` })))
  const tools = buildToolIndex([{ slug: 'lucky-draw', name: '抽獎大師', description: '抽獎、轉盤、分組' }])
  const hits = searchIndex([...posts, ...tools], '抽獎')
  assert.equal(hits.length, 50)
  assert.equal(hits[0].kind, 'tool')
  assert.equal(hits[0].url, '/lucky-draw/')
})

test('highlightParts：切出命中的片段，不分大小寫', () => {
  assert.deepEqual(highlightParts('CSS Flex 圖解', 'flex'), [
    { text: 'CSS ', hit: false },
    { text: 'Flex', hit: true },
    { text: ' 圖解', hit: false }
  ])
  assert.deepEqual(highlightParts('abc', ''), [{ text: 'abc', hit: false }])
  assert.deepEqual(highlightParts('aXa', 'a'), [
    { text: 'a', hit: true },
    { text: 'X', hit: false },
    { text: 'a', hit: true }
  ])
})

test('buildSiteToolIndex：fm.site.tools（siteToolLinks()）轉成搜尋項目，連結是完整網址，比對名稱、說明與 keywords', () => {
  const tools = buildSiteToolIndex([
    { slug: 'sound-effects', href: 'https://www.casper.tw/sound-effects/zh-tw/', label: '音效庫', summary: '免費音效', keywords: ['MP3 音效'] }
  ])
  assert.deepEqual(tools, [{ kind: 'tool', title: '音效庫', url: 'https://www.casper.tw/sound-effects/zh-tw/', description: '免費音效', hay: '音效庫 免費音效 mp3 音效' }])
  assert.equal(searchIndex(tools, 'mp3').length, 1)
  assert.deepEqual(buildSiteToolIndex(null), [])
})
