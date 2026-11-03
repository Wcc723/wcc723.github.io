import { test } from 'node:test'
import assert from 'node:assert/strict'
import { headerLinks, footerGroups, sectionOf, isExternal } from './nav.mjs'
import { liveTools, TOOLS } from '../tools.mjs'

const tool = { slug: 'lucky-draw', name: '抽獎大師', description: '抽獎、轉盤、分組', live: true }

test('P2 的工具清單是空的', () => {
  assert.deepEqual(liveTools(), [])
  assert.equal(TOOLS.filter((t) => t.live).length, 0)
})

test('liveTools：只留 live 而且 slug 合規的工具', () => {
  assert.deepEqual(liveTools([tool, { ...tool, slug: 'beta', live: false }, { ...tool, slug: 'Bad_Slug' }]), [tool])
})

test('headerLinks：0 支工具時沒有「工具」，文章、關於照計畫', () => {
  const links = headerLinks({ tools: [] })
  assert.deepEqual(links.map((l) => [l.text, l.href]), [['文章', '/categories/'], ['關於', '/about/']])
})

test('headerLinks：有工具時第一個是「工具」連到 /#tools', () => {
  assert.deepEqual(headerLinks({ tools: [tool] }).map((l) => l.href), ['/#tools', '/categories/', '/about/'])
})

test('headerLinks：文章頁標示「文章」，/categories/ 本身標成 page', () => {
  const post = headerLinks({ pageType: 'post', url: '/css/2017/07/21/css-flex/' })
  assert.equal(post.find((l) => l.key === 'posts').current, 'true')
  assert.equal(post.find((l) => l.key === 'about').current, null)
  const cats = headerLinks({ pageType: 'nav-index', url: '/categories/' })
  assert.equal(cats.find((l) => l.key === 'posts').current, 'page')
  const about = headerLinks({ pageType: 'about', url: '/about/' })
  assert.equal(about.find((l) => l.key === 'about').current, 'page')
  const home = headerLinks({ pageType: 'home', url: '/' })
  assert.ok(home.every((l) => l.current === null))
})

test('sectionOf', () => {
  for (const t of ['post', 'blog-index', 'taxonomy-list', 'nav-index']) assert.equal(sectionOf(t), 'posts')
  assert.equal(sectionOf('about'), 'about')
  assert.equal(sectionOf('legal'), '')
  assert.equal(sectionOf(undefined), '')
})

test('footerGroups：0 支工具時沒有工具組，其餘照計畫的順序與網址', () => {
  const groups = footerGroups({ tools: [] })
  assert.deepEqual(groups.map((g) => g.title), ['文章', '熱門主題', '關於本站', '卡斯伯的其他地方'])
  const hrefs = groups.flatMap((g) => g.links.map((l) => l.href))
  for (const h of ['/', '/categories/', '/tags/', '/archives/', '/atom.xml', '/categories/CSS/', '/categories/javascript/', '/categories/development/', '/categories/design/', '/about/', '/contact/', '/privacy/', '/terms/', 'https://games.casper.tw/', 'https://hex.school/byKCb', 'https://www.facebook.com/WccCasper', 'https://github.com/wcc723']) {
    assert.ok(hrefs.includes(h), h)
  }
  assert.ok(!hrefs.some((h) => /^\/tools?\//.test(h)), '不連到 /tools/ 或 /tool/')
})

test('footerGroups：有工具時工具組排第一', () => {
  const groups = footerGroups({ tools: [tool] })
  assert.equal(groups[0].title, '工具')
  assert.deepEqual(groups[0].links, [{ text: '抽獎大師', href: '/lucky-draw/' }])
})

test('文案不用破折號', () => {
  const text = JSON.stringify([footerGroups({ tools: [tool] }), headerLinks({ tools: [tool] })])
  assert.ok(!/[\u2013\u2014]/.test(text))
})

test('isExternal', () => {
  assert.equal(isExternal('https://github.com/wcc723'), true)
  assert.equal(isExternal('/about/'), false)
})
