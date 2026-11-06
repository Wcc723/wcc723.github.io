import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  archiveMonthPaths,
  archiveYearPaths,
  blogIndexPaths,
  categoryPagePaths,
  categoryPaths,
  hexoOrder,
  LEGACY_TAG_ORDER,
  listUrls,
  orderedTags,
  pageDataFor,
  pagerFor,
  popularTags,
  relatedOf,
  sidebarRelatedOf,
  SIDEBAR_RELATED_COUNT,
  SIDEBAR_TAG_COUNT,
  siteIndex,
  tagPagePaths,
  tagPaths,
  urlOf
} from './pagedata.mjs'
import { decodeEntities } from '../../../scripts/freeze-legacy-cards.mjs'
import { SOURCE_DIR, hasHexoOutput, hexoFileOf, hexoOutputs, readBaseline } from './test-fixture.mjs'

const srcDir = SOURCE_DIR
const index = siteIndex(srcDir)
const run = (relativePath, frontmatter = {}) => pageDataFor({ relativePath, frontmatter: { ...frontmatter } }, {}, srcDir).frontmatter
const hrefs = (html) => [...html.matchAll(/<h2 class="post-card__title"><a href="([^"]+)">/g)].map((m) => decodeURI(m[1]))
const baselinePages = JSON.parse(readBaseline('pages.json')).pages

// README 列的預期差異：合併成小寫的標籤（分頁變多）
const MERGED_TAGS = ['/tags/sass/', '/tags/bootstrap/', '/tags/vue/']
const isMergedTag = (url) => MERGED_TAGS.some((t) => url.startsWith(t))

test('hexoOrder：日期新到舊，同一天依檔名升冪（跟基準的首頁分頁相同）', () => {
  const a = { date: '2020-09-22', file: '2020-09-22-javascript-training-1st.md' }
  const b = { date: '2020-09-22', file: '2020-09-22-js-function.md' }
  const c = { date: '2020-09-23', file: '2020-09-23-js-object.md' }
  assert.deepEqual(hexoOrder([b, a, c]), [c, a, b])
})

test('orderedTags：凍結的順序只在標籤是同一組時套用，有增減就回到 Hexo 資料庫順序', () => {
  const file = '2019-12-01-vscode-chinese.md'
  assert.deepEqual(LEGACY_TAG_ORDER[file], ['vscode', 'develop'])
  assert.deepEqual(orderedTags({ file, tags: ['develop', 'vscode'] }, index), ['vscode', 'develop'])
  const changed = orderedTags({ file, tags: ['develop', 'vscode', 'css'] }, index)
  assert.deepEqual([...changed].sort(), ['css', 'develop', 'vscode'])
  assert.notDeepEqual(changed, ['vscode', 'develop', 'css'])
  for (const [f, tags] of Object.entries(LEGACY_TAG_ORDER)) {
    const post = index.posts.find((p) => p.file === f)
    assert.ok(post, `${f} 不在文章索引`)
    assert.deepEqual([...post.tags].sort(), [...tags].sort(), `${f} 的標籤跟凍結的不是同一組`)
  }
})

test('pagerFor：第 2 頁的上一頁是第 1 頁（base），跳頁選單列出每一頁', () => {
  const p = pagerFor('/', 2, 37)
  assert.equal(p.prevUrl, '/')
  assert.equal(p.nextUrl, '/page/3/')
  assert.equal(p.pages.length, 37)
  assert.deepEqual(p.pages[0], { number: 1, url: '/' })
  assert.deepEqual(p.pages[36], { number: 37, url: '/page/37/' })
  const last = pagerFor('/categories/CSS/', 10, 10)
  assert.equal(last.prevUrl, '/categories/CSS/page/9/')
  assert.equal(last.nextUrl, null)
  assert.deepEqual(pagerFor('/tags/AI/', 1, 1), { current: 1, total: 1, base: '/tags/AI/', prevUrl: null, nextUrl: null, pages: [{ number: 1, url: '/tags/AI/' }] })
})

test('urlOf：rewrites 之後的 relativePath → 未編碼的網址', () => {
  assert.equal(urlOf('index.md'), '/')
  assert.equal(urlOf('404.md'), '/404.html')
  assert.equal(urlOf('javascript/2019/03/18/JS-THIS/index.md'), '/javascript/2019/03/18/JS-THIS/')
  assert.equal(urlOf('about/hexschool-traning.md'), '/about/hexschool-traning')
  assert.equal(urlOf('tags/資安/index.md'), '/tags/資安/')
  assert.equal(urlOf('categories/CSS/page/2/index.md'), '/categories/CSS/page/2/')
})

test('索引：364 篇、27 個分類、70 個標籤（sass 71、bootstrap 17、vue 4 篇）、12 年 68 個月', () => {
  assert.equal(index.posts.length, 364)
  assert.equal(index.categories.length, 27)
  assert.equal(index.tags.length, 70)
  const count = (slug) => index.tagBySlug.get(slug).posts.length
  assert.deepEqual([count('sass'), count('bootstrap'), count('vue')], [71, 17, 4])
  assert.equal(index.years.length, 12)
  assert.equal(index.years.reduce((n, y) => n + y.months.length, 0), 68)
  assert.ok(index.categoryByDir.has('CSS') && !index.categoryByDir.has('css'))
})

test('首頁：最新 10 張卡、分頁 37 頁、H1 是站名，沒有麵包屑', () => {
  const fm = run('index.md')
  assert.equal(fm.pageType, 'home')
  assert.equal(fm.url, '/')
  assert.equal(fm.cards.length, 10)
  assert.deepEqual(Object.keys(fm.cards[0]).sort(), ['category', 'categoryUrl', 'cover', 'date', 'excerpt', 'readingTime', 'title', 'url'])
  assert.equal(fm.cards[0].url, index.posts[0].url)
  assert.equal(fm.pager.total, 37)
  assert.equal(fm.pager.nextUrl, '/page/2/')
  assert.equal(fm.heading, '卡斯伯工具') // P3 起 H1 是新站名（SITE_NAME）
  assert.equal(fm.breadcrumbs, undefined)
})

test('/page/N/：H1、麵包屑、分頁；超出範圍的頁碼丟錯', () => {
  const fm = run('page/2/index.md')
  assert.equal(fm.pageType, 'blog-index')
  assert.equal(fm.heading, '最新文章：第 2 頁')
  assert.deepEqual(fm.breadcrumbs, [{ name: '首頁', url: '/' }, { name: '最新文章第 2 頁' }])
  assert.equal(fm.pager.prevUrl, '/')
  assert.equal(fm.pager.nextUrl, '/page/3/')
  assert.throws(() => run('page/38/index.md'), /沒有第 38 頁/)
  assert.throws(() => run('page/1/index.md'), /沒有第 1 頁/)
})

test('分類與標籤列表：H1 跟 Hexo 相同，CSS 分頁連結用大寫，第 N 頁的麵包屑多一層', () => {
  const css = run('categories/CSS/page/2/index.md')
  assert.equal(css.pageType, 'taxonomy-list')
  assert.equal(css.url, '/categories/CSS/page/2/')
  assert.equal(css.heading, '分類：css')
  assert.equal(css.pager.base, '/categories/CSS/')
  assert.equal(css.pager.prevUrl, '/categories/CSS/')
  assert.ok(css.pager.pages.every((p) => p.url.startsWith('/categories/CSS/')))
  assert.deepEqual(css.breadcrumbs, [
    { name: '首頁', url: '/' },
    { name: '文章', url: '/categories/' },
    { name: 'css', url: '/categories/CSS/' },
    { name: '第 2 頁' }
  ])
  const tag = run('tags/資安/index.md')
  assert.equal(tag.heading, '標籤：資安')
  assert.equal(tag.url, '/tags/資安/')
  assert.deepEqual(tag.breadcrumbs.map((b) => b.name), ['首頁', '文章', '標籤', '資安'])
  assert.equal(tag.breadcrumbs.at(-1).url, undefined)
  assert.equal(run('tags/Claude-Code/index.md').heading, '標籤：Claude Code')
  assert.throws(() => run('categories/css/index.md'), /沒有這個分類 css/)
})

test('導覽索引：/categories/、/tags/、/archives/ 與年、月的 H1、麵包屑、清單', () => {
  const cats = run('categories/index.md', { title: '文章分類' })
  assert.equal(cats.pageType, 'nav-index')
  assert.deepEqual(cats.breadcrumbs, [{ name: '首頁', url: '/' }, { name: '文章' }])
  assert.equal((cats.listHtml.match(/class="category-card"/g) ?? []).length, 27)
  assert.ok(cats.listHtml.includes('href="/categories/CSS/"') && !cats.listHtml.includes('v-pre'))
  const tags = run('tags/index.md', { title: '所有標籤' })
  assert.equal(tags.heading, '所有標籤')
  assert.deepEqual(tags.breadcrumbs.map((b) => b.name), ['首頁', '文章', '標籤'])
  assert.equal((tags.listHtml.match(/class="tag-cloud__item"/g) ?? []).length, 70)
  const all = run('archives/index.md')
  assert.equal(all.heading, '封存')
  assert.equal((all.listHtml.match(/class="archive-row"/g) ?? []).length, 364)
  const year = run('archives/2013/index.md')
  assert.equal(year.heading, '封存：2013')
  assert.deepEqual(year.breadcrumbs.map((b) => b.name), ['首頁', '文章', '封存', '2013 年'])
  const month = run('archives/2013/08/index.md')
  assert.equal(month.heading, '封存：2013 / 8')
  assert.deepEqual(month.breadcrumbs.at(-2), { name: '2013 年', url: '/archives/2013/' })
  assert.deepEqual(month.breadcrumbs.at(-1), { name: '8 月' })
  assert.equal(month.postCount, 8)
})

test('文章：post、上下篇（prev 較新、next 較舊）、接著讀、FB data-href、麵包屑', () => {
  const fm = run('development/2020/09/22/js-function/index.md')
  assert.equal(fm.pageType, 'post')
  assert.deepEqual(fm.prev, { title: index.byUrl.get('/development/2020/09/22/javascript-training-1st/').title, url: '/development/2020/09/22/javascript-training-1st/' })
  assert.equal(fm.next.url, '/development/2020/09/21/js-object/')
  assert.equal(fm.fbHref, 'https://www.casper.tw/development/2020/09/22/js-function/')
  assert.deepEqual(Object.keys(fm.post).sort(), ['category', 'categoryUrl', 'cover', 'date', 'readingTime', 'tags', 'updated'])
  assert.equal(fm.post.categoryUrl, '/categories/development/')
  assert.equal(fm.related.length, 3)
  assert.ok(fm.related.every((r) => index.byUrl.get(r.url).category === 'development' && r.url !== fm.url))
  assert.ok(!fm.related.some((r) => r.url === fm.prev.url || r.url === fm.next.url), '接著讀不重複上下篇')
  assert.deepEqual(fm.breadcrumbs.map((b) => b.name), ['首頁', '文章', 'development', fm.heading])
  const css = run('css/2013/10/20/Vertical-write/index.md')
  assert.equal(css.post.categoryUrl, '/categories/CSS/')
  assert.equal(css.breadcrumbs[2].url, '/categories/CSS/')
  const newest = run(index.posts[0].out)
  assert.equal(newest.prev, null)
  const oldest = run(index.posts.at(-1).out)
  assert.equal(oldest.next, null)
  const nvm = run('development/2022/01/10/install-nvm/index.md')
  assert.equal(nvm.post.updated, '2026-07-09')
})

test('relatedOf：分類太小時才補上下篇', () => {
  const small = index.categories.find((c) => c.posts.length === 2)
  if (!small) return
  const [a, b] = small.posts
  assert.deepEqual(relatedOf(a, index, [b.url]), [{ title: b.title, url: b.url }])
})

// 側欄相關文章用的迷你索引：只需要 posts（列表順序：日期新到舊，同日依檔名）
const fakePost = (file, category, tags) => {
  const date = file.slice(0, 10)
  return { file, date, category, tags, title: file, url: `/${category}/${date.replaceAll('-', '/')}/${file.slice(11, -3)}/` }
}
const FAKE = hexoOrder([
  fakePost('2020-01-01-me.md', 'css', ['css', 'sass', 'grid']),
  fakePost('2019-01-01-three.md', 'javascript', ['css', 'sass', 'grid']), // 3 分、不同分類
  fakePost('2021-01-01-two-same.md', 'css', ['css', 'sass']), // 2 分、同分類
  fakePost('2022-01-01-two-other.md', 'javascript', ['sass', 'grid']), // 2 分、不同分類，比 two-same 新
  fakePost('2018-05-05-one-a.md', 'design', ['css']), // 1 分、不同分類
  fakePost('2018-05-05-one-b.md', 'design', ['grid']), // 1 分、不同分類，同一天，檔名較後
  fakePost('2023-01-01-zero-same.md', 'css', ['vue']), // 0 分、同分類：可以補位
  fakePost('2024-01-01-zero-other.md', 'life', ['vue']), // 0 分、不同分類：不算相關
  fakePost('2017-01-01-one-dup.md', 'css', ['css', 'css']) // 重複的標籤只算一次：1 分、同分類
])
const fakeIndex = { posts: FAKE }
const me = FAKE.find((p) => p.file === '2020-01-01-me.md')
const files = (list) => list.map((r) => FAKE.find((p) => p.url === r.url).file.slice(11, -3))

test('sidebarRelatedOf：標籤重疊數高的先，同分時同分類的先，再依日期新到舊，同一天依檔名', () => {
  const all = sidebarRelatedOf(me, fakeIndex)
  assert.equal(all.length, SIDEBAR_RELATED_COUNT)
  assert.deepEqual(files(all), ['three', 'two-same', 'two-other', 'one-dup', 'one-a'])
  assert.deepEqual(Object.keys(all[0]).sort(), ['date', 'title', 'url'])
  assert.equal(all[0].date, '2019-01-01')
})

test('sidebarRelatedOf：排除本篇與傳入的網址（上下篇、接著讀），標籤分類都不同的不收，寧可少於 5 篇', () => {
  const url = (f) => FAKE.find((p) => p.file.includes(f)).url
  const out = sidebarRelatedOf(me, fakeIndex, [url('three'), url('two-same'), url('one-dup')])
  assert.deepEqual(files(out), ['two-other', 'one-a', 'one-b', 'zero-same'])
  assert.ok(!out.some((r) => r.url === me.url))
  assert.ok(!files(sidebarRelatedOf(me, fakeIndex, FAKE.map((p) => p.url).filter((u) => !u.includes('zero')))).includes('zero-other'))
  assert.deepEqual(sidebarRelatedOf(fakePost('2020-02-02-alone.md', 'ssl', ['ssl']), fakeIndex), [])
})

test('sidebarRelatedOf：決定性，文章讀進來的順序不影響結果', () => {
  const want = sidebarRelatedOf(me, fakeIndex)
  for (const order of [[...FAKE].reverse(), [...FAKE].sort((a, b) => (a.title < b.title ? 1 : -1))]) {
    assert.deepEqual(sidebarRelatedOf(me, { posts: order }), want)
  }
})

test('文章側欄（真實資料）：相關文章至多 5 篇，不重複本篇、上下篇、接著讀，都是存在的文章；同一頁算兩次結果相同', () => {
  const counts = new Map()
  for (const p of index.posts) {
    const fm = run(p.out)
    const rel = fm.sidebar.related
    counts.set(rel.length, (counts.get(rel.length) ?? 0) + 1)
    assert.ok(rel.length <= SIDEBAR_RELATED_COUNT, p.url)
    const taken = new Set([fm.url, fm.prev?.url, fm.next?.url, ...fm.related.map((r) => r.url)])
    for (const r of rel) {
      const target = index.byUrl.get(r.url)
      assert.ok(target, `${p.url} 的相關文章 ${r.url} 不存在`)
      assert.ok(!taken.has(r.url), `${p.url} 的相關文章 ${r.url} 跟本篇、上下篇或接著讀重複`)
      assert.ok(target.category === p.category || target.tags.some((t) => p.tags.includes(t)), `${p.url} → ${r.url} 標籤和分類都不同`)
      assert.equal(r.title, target.title)
      assert.equal(r.date, target.date)
    }
    assert.equal(new Set(rel.map((r) => r.url)).size, rel.length, `${p.url} 的相關文章有重複`)
  }
  // 364 篇裡絕大多數湊得滿 5 篇；只有標籤和分類都獨一無二的少數幾篇是 0 篇（側欄就不輸出這一塊）
  assert.ok((counts.get(SIDEBAR_RELATED_COUNT) ?? 0) >= 330, JSON.stringify([...counts]))
  const page = 'javascript/2019/03/18/JS-THIS/index.md'
  assert.deepEqual(run(page).sidebar, run(page).sidebar)
})

test('文章側欄：熱門標籤是文章數前 20 名，網址是合併後的小寫，每頁 frontmatter 只多一點點', () => {
  const tags = popularTags(index)
  assert.equal(tags.length, SIDEBAR_TAG_COUNT)
  assert.deepEqual(Object.keys(tags[0]).sort(), ['count', 'name', 'url'])
  for (let i = 1; i < tags.length; i++) assert.ok(tags[i - 1].count >= tags[i].count, `${tags[i - 1].name} 應該排在 ${tags[i].name} 前面`)
  assert.equal(tags[0].count, Math.max(...index.tags.map((t) => t.posts.length)))
  for (const t of tags) {
    assert.equal(index.tagBySlug.get(decodeURI(t.url).split('/')[2])?.name, t.name, t.url)
    assert.ok(!/\/tags\/(Sass|Bootstrap|Vue)\//.test(t.url), `${t.url} 是線上 404 的大寫標籤`)
  }
  assert.ok(tags.some((t) => t.url === '/tags/sass/'))
  const fm = run('development/2020/09/22/js-function/index.md')
  assert.deepEqual(fm.sidebar.tags, tags)
  // 相關 5 篇加標籤 20 個，JSON 不到 2.5 KB
  assert.ok(Buffer.byteLength(JSON.stringify(fm.sidebar)) < 2500, `${Buffer.byteLength(JSON.stringify(fm.sidebar))} bytes`)
  // 列表、首頁不帶側欄資料
  assert.equal(run('index.md').sidebar, undefined)
  assert.equal(run('tags/資安/index.md').sidebar, undefined)
})

test('關於、法務、404', () => {
  const about = run('about/index.md', { title: '關於卡斯伯' })
  assert.equal(about.fbHref, 'https://www.casper.tw/about/')
  assert.deepEqual(about.breadcrumbs, [{ name: '首頁', url: '/' }, { name: '關於卡斯伯' }])
  const hex = run('about/hexschool-traning.md', { title: '卡斯伯 前端作品實戰直播班預約' })
  assert.equal(hex.url, '/about/hexschool-traning')
  assert.equal(hex.fbHref, 'https://www.casper.tw/about/hexschool-traning')
  assert.deepEqual(hex.breadcrumbs.map((b) => b.name), ['首頁', '關於卡斯伯', '卡斯伯 前端作品實戰直播班預約'])
  const privacy = run('privacy/index.md', { title: '隱私權政策' })
  assert.equal(privacy.pageType, 'legal')
  assert.deepEqual(privacy.breadcrumbs, [{ name: '首頁', url: '/' }, { name: '隱私權政策' }])
  const nf = run('404.md')
  assert.equal(nf.url, '/404.html')
  assert.equal(nf.breadcrumbs, undefined)
})

test('FB data-href：364 篇與 2 個 about 頁跟基準逐字相同', () => {
  const diffs = []
  for (const b of baselinePages.filter((x) => x.type === 'post' || x.type === 'about')) {
    // 文章：/<category>/.../<slug>/ → .../index.md；about：about/index.html、about/hexschool-traning.html → .md
    const rel = b.type === 'post' ? decodeURI(b.url).slice(1) + 'index.md' : b.file.replace(/\.html$/, '.md')
    const fm = run(rel)
    if (fm.fbHref !== b.fbCommentsHref) diffs.push(`${b.url}：${fm.fbHref} ≠ ${b.fbCommentsHref}`)
  }
  assert.deepEqual(diffs, [])
})

test('網址對等：列表與文章網址跟 urls.txt 的 HTML 網址相同，差異只有 README 列的預期新增', () => {
  const generated = new Set([
    ...listUrls(srcDir),
    ...index.posts.map((p) => p.url),
    '/about/',
    '/about/hexschool-traning',
    '/privacy/',
    '/contact/',
    '/terms/',
    '/404.html'
  ].map((u) => encodeURI(u)))
  const NON_HTML = /^\/(CNAME|_headers|ads\.txt|atom\.xml|content\.json|robots\.txt|search\.xml|sitemap\.xml|css\/style\.css|img\/.+)$/
  const baseline = readBaseline('urls.txt').split('\n').filter((u) => u && !NON_HTML.test(u))
  assert.equal(baseline.length, 658) // 657 頁加 /about/hexschool-traning 的無副檔名網址
  const missing = baseline.filter((u) => !generated.has(u))
  const added = [...generated].filter((u) => !baseline.includes(u)).sort()
  // about/hexschool-traning.md 輸出成 .html，兩種網址都回 200，產生的清單只記無副檔名的那個
  assert.deepEqual(missing, ['/about/hexschool-traning.html'])
  assert.deepEqual(added, ['/404.html', '/categories/', '/contact/', '/privacy/', '/tags/bootstrap/page/2/', '/tags/sass/page/8/', '/terms/'])
})

test('動態路由的數量：/page/ 36、分類 27 加 26、標籤 70 加 51、封存年 12、月 68', () => {
  assert.equal(blogIndexPaths(srcDir).length, 36)
  assert.equal(categoryPaths(srcDir).length, 27)
  assert.equal(categoryPagePaths(srcDir).length, 26)
  assert.equal(tagPaths(srcDir).length, 70)
  assert.equal(tagPagePaths(srcDir).length, 51)
  assert.equal(archiveYearPaths(srcDir).length, 12)
  assert.equal(archiveMonthPaths(srcDir).length, 68)
  for (const r of [...blogIndexPaths(srcDir), ...categoryPagePaths(srcDir), ...tagPagePaths(srcDir)]) {
    assert.ok(!r.content.includes('\n') && r.content.includes(' v-pre>'))
    assert.ok(Number(r.params.page) >= 2)
  }
  assert.deepEqual(categoryPaths(srcDir).find((r) => r.params.name === 'css').params, { cat: 'CSS', name: 'css' })
})

test('H1：分類、標籤、封存、/tags/ 跟基準相同（合併的 3 個標籤除外）', () => {
  const diffs = []
  for (const b of baselinePages.filter((x) => ['category', 'tag', 'archive', 'tags-index'].includes(x.type))) {
    const url = decodeURI(b.url)
    if (isMergedTag(url)) continue
    const fm = run(url.slice(1) + 'index.md', url === '/tags/' ? { title: '所有標籤' } : {})
    if (fm.heading !== b.h1[0]) diffs.push(`${url}：${fm.heading} ≠ ${b.h1[0]}`)
  }
  assert.deepEqual(diffs, [])
})

test('/tags/sass/ 第 1 頁是 71 篇裡最新的 10 篇，分頁 8 頁', () => {
  const sass = index.tagBySlug.get('sass')
  const first = tagPaths(srcDir).find((r) => r.params.tag === 'sass')
  assert.deepEqual(hrefs(first.content), sass.posts.slice(0, 10).map((p) => p.url))
  assert.equal(run('tags/sass/index.md').pager.total, 8)
})

const hexo = hasHexoOutput()

test('基準：首頁、/page/N/、分類、標籤每一頁的卡片順序跟 Hexo 相同', { skip: !hexo && '沒有 origin/master' }, () => {
  const pages = [
    { url: '/', cards: run('index.md').cards.map((c) => c.url) },
    ...blogIndexPaths(srcDir).map((r) => ({ url: `/page/${r.params.page}/`, cards: hrefs(r.content) })),
    ...categoryPaths(srcDir).map((r) => ({ url: `/categories/${r.params.cat}/`, cards: hrefs(r.content) })),
    ...categoryPagePaths(srcDir).map((r) => ({ url: `/categories/${r.params.cat}/page/${r.params.page}/`, cards: hrefs(r.content) })),
    ...tagPaths(srcDir).map((r) => ({ url: `/tags/${r.params.tag}/`, cards: hrefs(r.content) })),
    ...tagPagePaths(srcDir).map((r) => ({ url: `/tags/${r.params.tag}/page/${r.params.page}/`, cards: hrefs(r.content) }))
  ].filter((p) => !isMergedTag(p.url))
  const html = hexoOutputs(pages.map((p) => hexoFileOf(p.url)))
  const diffs = []
  for (const p of pages) {
    const base = html.get(hexoFileOf(p.url))
    if (base == null) {
      diffs.push(`${p.url}：基準沒有這頁`)
      continue
    }
    const expected = [...base.matchAll(/<h2><a href="([^"]+)">/g)].map((m) => decodeURI(m[1]))
    if (JSON.stringify(expected) !== JSON.stringify(p.cards)) diffs.push(`${p.url}：順序不同`)
  }
  assert.equal(pages.length, 1 + 36 + 27 + 26 + 70 - 3 + 51 - 7 - 1)
  assert.deepEqual(diffs, [])
})

test('基準：封存 81 頁的文章與順序跟 Hexo 相同', { skip: !hexo && '沒有 origin/master' }, () => {
  const pages = [
    { url: '/archives/', html: run('archives/index.md').listHtml },
    ...archiveYearPaths(srcDir).map((r) => ({ url: `/archives/${r.params.year}/`, html: r.content })),
    ...archiveMonthPaths(srcDir).map((r) => ({ url: `/archives/${r.params.year}/${r.params.month}/`, html: r.content }))
  ]
  assert.equal(pages.length, 81)
  const html = hexoOutputs(pages.map((p) => hexoFileOf(p.url)))
  const diffs = []
  for (const p of pages) {
    const expected = [...html.get(hexoFileOf(p.url)).matchAll(/<a class="archive-row" href="([^"]+)">/g)].map((m) => decodeURI(m[1]))
    const got = [...p.html.matchAll(/<a class="archive-row__title" href="([^"]+)">/g)].map((m) => decodeURI(m[1]))
    if (JSON.stringify(expected) !== JSON.stringify(got)) diffs.push(p.url)
  }
  assert.deepEqual(diffs, [])
})

test('基準：364 篇的上下篇（方向、網址、標題）跟 Hexo 的 post-nav 相同', { skip: !hexo && '沒有 origin/master' }, () => {
  const html = hexoOutputs(index.posts.map((p) => hexoFileOf(p.url)))
  const diffs = []
  for (const p of index.posts) {
    const nav = html.get(hexoFileOf(p.url)).match(/<nav class="post-nav">([\s\S]*?)<\/nav>/)?.[1] ?? ''
    const pick = (cls) => {
      const m = nav.match(new RegExp(`<a class="${cls}" href="([^"]+)">[\\s\\S]*?<span class="ttl">([\\s\\S]*?)</span>`))
      return m ? { title: decodeEntities(m[2]), url: decodeURI(m[1]) } : null
    }
    const fm = run(p.out)
    // Hexo 的 <a class="next"> 是較新一篇（page.prev），<a class="prev"> 是較舊一篇（page.next）
    if (JSON.stringify(fm.prev) !== JSON.stringify(pick('next'))) diffs.push(`${p.url} prev`)
    if (JSON.stringify(fm.next) !== JSON.stringify(pick('prev'))) diffs.push(`${p.url} next`)
  }
  assert.deepEqual(diffs, [])
})

// 放在最後：用暫存的 srcDir 會換掉 posts.mjs 與 siteIndex 的快取
test('只差大小寫的標籤讓建置失敗（CI 規則），兩種寫法對到同一個 slug 也失敗', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'casper-pagedata-'))
  try {
    const write = (dir, name, tags) => {
      fs.mkdirSync(path.join(dir, '_posts'), { recursive: true })
      fs.writeFileSync(path.join(dir, '_posts', name), `---\ntitle: t\ncategory: css\ntags: [${tags}]\n---\n內文\n`)
    }
    const a = path.join(tmp, 'a')
    write(a, '2020-01-01-x.md', 'Vue')
    write(a, '2020-01-02-y.md', 'vue')
    assert.throws(() => siteIndex(a), /標籤只差大小寫：(Vue、vue|vue、Vue)/)
    const b = path.join(tmp, 'b')
    write(b, '2020-01-01-x.md', 'node.js')
    write(b, '2020-01-02-y.md', 'node js')
    assert.throws(() => siteIndex(b), /網址都是 \/tags\/node-js\//)
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true })
  }
})

// ---------------------------------------------------------------------------
// 外語首頁與 fm.site（主站首頁規格 G.4）
// ---------------------------------------------------------------------------

const homePage = (code, preview = false) => ({ code, url: `https://www.casper.tw/${code}/`, preview })
const LIVE_PLAN = { stage: 'live', published: ['en'], pages: [homePage('en')], problems: [], warnings: [] }
const PREVIEW_PLAN = { stage: 'preview', published: [], pages: ['en', 'ja', 'ko', 'de'].map((c) => homePage(c, true)), problems: [], warnings: [] }
const runWith = (relativePath, opts, frontmatter = {}) => pageDataFor({ relativePath, frontmatter: { ...frontmatter } }, {}, srcDir, opts).frontmatter

test('外語首頁：寫 fm.site、fm.title、fm.description，titleTemplate 是 false', () => {
  const fm = runWith('en/index.md', { plan: LIVE_PLAN })
  assert.equal(fm.pageType, 'site-home')
  assert.equal(fm.url, '/en/')
  assert.equal(fm.titleTemplate, false)
  assert.equal(fm.site.kind, 'site-home')
  assert.equal(fm.site.locale, 'en')
  assert.equal(fm.site.canonical, 'https://www.casper.tw/en/')
  assert.equal(fm.description, fm.site.home.meta.description)
  assert.ok(fm.title.endsWith(fm.site.home.meta.tagline))
  assert.equal(fm.site.preview, false)
  assert.equal(fm.breadcrumbs, undefined)
  assert.throws(() => runWith('ja/index.md', { plan: LIVE_PLAN }), /site-home ja 不在這次建置的 plan\.pages/)
})

test('preview 的外語首頁：fm.site.home 有 H1 與 hero.lead，fm.site.preview 是 true，siteHomes 是叢集', () => {
  const fm = runWith('ko/index.md', { plan: PREVIEW_PLAN })
  assert.equal(typeof fm.site.home.h1.text, 'string')
  assert.ok(fm.site.home.h1.text.length > 0)
  assert.ok(fm.site.home.hero.lead.length > 0)
  assert.equal(fm.site.preview, true)
  assert.deepEqual(fm.site.siteHomes, ['en', 'ja', 'ko', 'de'])
})

test('preview：shell 是 legacy 也每頁都寫 fm.site（effectiveShell），首頁的語言選單列出每個 preview 的外語首頁', () => {
  const legacy = { shell: 'legacy', home: { locales: [], roadmap: [], sourceLocale: 'en' } }
  const home = runWith('index.md', { plan: PREVIEW_PLAN, config: legacy })
  assert.equal(home.site.locale, 'zh-tw')
  assert.equal(home.site.kind, 'page')
  assert.equal(home.site.preview, false)
  assert.deepEqual(home.site.languages.map((l) => l.code), ['zh-tw', 'en', 'ja', 'ko', 'de'])
  assert.ok(home.site.languages.every((l) => l.exact))
  const post = runWith('about/index.md', { plan: PREVIEW_PLAN, config: legacy }, { title: '關於卡斯伯' })
  assert.equal(post.site.section, 'about')
  assert.equal(post.site.shell.skipToContent, '跳到主要內容')
  assert.deepEqual(post.site.languages.map((l) => [l.code, l.exact]), [['zh-tw', true], ['en', false], ['ja', false], ['ko', false], ['de', false]])
  // live 的 legacy 照舊不寫（P1 產物不變）
  assert.equal(runWith('index.md', { plan: LIVE_PLAN, config: legacy }).site, undefined)
})

test('fm.site：shell 是 legacy 時其他頁不寫（P1 產物不變），shared 時每頁都寫，404 也有', () => {
  const legacy = { shell: 'legacy', home: { locales: [], roadmap: [], sourceLocale: 'en' } }
  const shared = { ...legacy, shell: 'shared' }
  assert.equal(runWith('about/index.md', { plan: LIVE_PLAN, config: legacy }, { title: '關於卡斯伯' }).site, undefined)
  assert.equal(runWith('404.md', { plan: LIVE_PLAN, config: legacy }).site, undefined)
  const about = runWith('about/index.md', { plan: LIVE_PLAN, config: shared }, { title: '關於卡斯伯' })
  assert.equal(about.site.section, 'about')
  assert.equal(about.site.canonical, 'https://www.casper.tw/about/')
  assert.deepEqual(about.site.siteHomes, ['en'])
  const nf = runWith('404.md', { plan: LIVE_PLAN, config: shared })
  assert.equal(nf.site.kind, 'page')
  assert.equal(nf.site.canonical, '')
  assert.deepEqual(nf.site.languages, [])
  assert.deepEqual(nf.site.notFoundIntl.map((r) => r.code), ['en'])
})
