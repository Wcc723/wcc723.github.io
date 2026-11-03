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
  relatedOf,
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
  assert.equal(fm.heading, '卡斯伯 Blog')
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
