import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  cardExcerpt,
  cardFor,
  cardCover,
  escapeHtml,
  excerptOf,
  firstImage,
  hrefOf,
  legacyCards,
  postCover,
  readingTimeFor,
  readingTimeOf,
  renderArchive,
  renderCards,
  renderCategoryList,
  renderTagCloud
} from './cards.mjs'
import { siteIndex } from './pagedata.mjs'
import { SOURCE_DIR, hasHexoOutput, hexoFiles, hexoOutputs } from './test-fixture.mjs'
import { decodeEntities, parseListCards } from '../../../scripts/freeze-legacy-cards.mjs'

test('cardExcerpt：照 card-helpers.js 去掉標籤與 # * ` > - [ ] !，空白壓成一格，超過 80 字補「…」', () => {
  assert.equal(cardExcerpt('<p>Hello  **world**</p>\n<p>[a-b]!</p>'), 'Hello world ab')
  const long = '字'.repeat(81)
  assert.equal(cardExcerpt(long), '字'.repeat(80) + '…')
  assert.equal(cardExcerpt('字'.repeat(80)), '字'.repeat(80))
  assert.equal(cardExcerpt('abc', 2), 'ab…')
  assert.equal(cardExcerpt(undefined), '')
})

test('readingTimeOf：中文每分鐘 350 字、英數單字每分鐘 200 個，四捨五入，至少 1 分鐘', () => {
  assert.equal(readingTimeOf(''), 1)
  assert.equal(readingTimeOf('中'.repeat(350)), 1)
  assert.equal(readingTimeOf('中'.repeat(700) + ' word'.repeat(100)), 3) // 2 + 0.5 → 3
  assert.equal(readingTimeOf('<p class="x">' + 'a '.repeat(500) + '</p>'), 3) // 標籤不算字
})

test('firstImage：Markdown 圖片或 <img>，取先出現的；註解裡的不算；&amp; 解開', () => {
  assert.equal(firstImage('文字\n![a](https://x/1.png "t")\n<img src="https://x/2.png">'), 'https://x/1.png')
  assert.equal(firstImage('<img class="a" src="https://x/2.png?a=1&amp;b=2"> ![a](https://x/1.png)'), 'https://x/2.png?a=1&b=2')
  assert.equal(firstImage('<!-- ![a](https://x/0.png) -->沒有圖'), '')
})

test('cardCover 只收絕對網址；postCover 只用 thumbnail，而且內文沒有同一張圖', () => {
  assert.equal(cardCover({ thumbnail: '', content: '![a](https://x/1.png)' }), 'https://x/1.png')
  assert.equal(cardCover({ thumbnail: '', content: '![a](images/1.png)' }), null)
  assert.equal(cardCover({ thumbnail: 'https://x/t.png', content: '![a](https://x/1.png)' }), 'https://x/t.png')
  assert.equal(postCover({ thumbnail: 'https://x/t.png', content: '內文' }), 'https://x/t.png')
  assert.equal(postCover({ thumbnail: 'https://x/t.png', content: '![](https://x/t.png)' }), null)
  assert.equal(postCover({ thumbnail: '/images/t.png', content: '' }), null)
  assert.equal(postCover({ thumbnail: '', content: '![a](https://x/1.png)' }), null)
})

test('hrefOf：跟 canonical 一樣 percent-encode 中文，大小寫照舊', () => {
  assert.equal(hrefOf('/tags/資安/'), '/tags/%E8%B3%87%E5%AE%89/')
  assert.equal(hrefOf('/javascript/2019/03/18/JS-THIS/'), '/javascript/2019/03/18/JS-THIS/')
  assert.equal(escapeHtml(`<a href="x">'&`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;')
})

const sampleCard = {
  title: 'nvm {{ version }} <教學>',
  url: '/development/2022/01/10/install-nvm/',
  date: '2022-01-10',
  category: 'css',
  categoryUrl: '/categories/CSS/',
  excerpt: '摘要 & {{ x }}',
  readingTime: 4,
  cover: 'https://img.casper.tw/a.png?x=1&y=2'
}

test('renderCards：一行、外層 v-pre、README 的 class 名稱、內容跳脫', () => {
  const html = renderCards([sampleCard, { ...sampleCard, cover: null }])
  assert.ok(!html.includes('\n'), 'markdown-it 的 HTML 區塊遇到空行就結束，整段要在同一行')
  assert.ok(html.startsWith('<div class="post-list" v-pre>'))
  for (const cls of ['post-card', 'post-card__title', 'post-card__meta', 'post-card__excerpt', 'post-card__cover']) {
    assert.ok(html.includes(`class="${cls}"`), cls)
  }
  assert.equal(html.match(/class="post-card__cover"/g).length, 1, '沒有封面的卡不輸出封面')
  assert.ok(html.includes('nvm {{ version }} &lt;教學&gt;'))
  assert.ok(html.includes('src="https://img.casper.tw/a.png?x=1&amp;y=2"'))
  assert.ok(html.includes('<a href="/categories/CSS/">css</a>'))
  assert.ok(html.includes('<time datetime="2022-01-10">2022 年 01 月 10 日</time>'))
  assert.ok(!renderCards([sampleCard], { pre: false }).includes('v-pre'))
})

test('renderArchive、renderCategoryList、renderTagCloud：一行、連結編碼、可關掉 v-pre', () => {
  const post = { url: '/css/2013/08/31/why-sass/', title: 'Sass <問答>', date: '2013-08-31', month: '08', day: '31', category: 'sass' }
  const groups = [{ year: '2013', url: '/archives/2013/', months: [{ month: '08', url: '/archives/2013/08/', posts: [post] }] }]
  const full = renderArchive(groups)
  assert.ok(!full.includes('\n'))
  assert.ok(full.includes('<a href="/archives/2013/">2013 年</a>') && full.includes('<a href="/archives/2013/08/">8 月</a>'))
  assert.ok(full.includes('Sass &lt;問答&gt;') && full.includes('>08/31</time>'))
  const onlyList = renderArchive(groups, { showYears: false, showMonths: false, pre: false })
  assert.ok(!onlyList.includes('<h2') && !onlyList.includes('<h3') && !onlyList.includes('v-pre'))
  const cats = renderCategoryList([{ name: 'css', url: '/categories/CSS/', posts: [1, 2] }])
  assert.ok(cats.includes('href="/categories/CSS/"') && cats.includes('2 篇'))
  const tags = renderTagCloud([{ name: '資安', url: '/tags/資安/', posts: [1] }])
  assert.ok(tags.includes('href="/tags/%E8%B3%87%E5%AE%89/"') && tags.includes('rel="tag"'))
})

test('legacy-cards.json：364 篇都有閱讀時間，摘要只收沒有 description 的文章', () => {
  const srcDir = SOURCE_DIR
  const data = legacyCards()
  const index = siteIndex(srcDir)
  assert.equal(Object.keys(data.posts).length, 364)
  for (const p of index.posts) {
    const hit = data.posts[p.url]
    assert.ok(hit, `${p.url} 不在 legacy-cards.json`)
    assert.ok(Number.isInteger(hit.readingTime) && hit.readingTime >= 1)
    assert.equal('excerpt' in hit, !p.description, `${p.url}：有 description 的文章不該凍結摘要`)
  }
})

test('凍結值只用到 frozenAt；之後加了 updated 的文章改用重算的值', () => {
  const srcDir = SOURCE_DIR
  const p = siteIndex(srcDir).posts.find((x) => !x.description && legacyCards().posts[x.url])
  const frozen = legacyCards().posts[p.url]
  const rewritten = { ...p, updated: '2099-01-01', content: '新內容 '.repeat(10) }
  assert.equal(readingTimeFor(p), frozen.readingTime)
  assert.equal(excerptOf(p), frozen.excerpt)
  assert.equal(readingTimeFor(rewritten), 1)
  assert.equal(excerptOf(rewritten), cardExcerpt('新內容 '.repeat(10)))
})

test('基準：364 篇的卡片摘要、閱讀時間、封面跟 Hexo 列表頁的卡片相同', { skip: !hasHexoOutput() && '沒有 origin/master' }, () => {
  const srcDir = SOURCE_DIR
  const files = hexoFiles().filter((f) => /^(index\.html|page\/\d+\/index\.html|categories\/.+\/index\.html|tags\/.+\/index\.html)$/.test(f))
  const pages = hexoOutputs(files)
  const base = new Map()
  for (const html of pages.values()) {
    for (const m of html.matchAll(/<article class="card[^"]*">([\s\S]*?)<\/article>/g)) {
      const img = m[1].match(/<img src="([^"]*)"/)
      const [c] = parseListCards(m[0])
      base.set(c.url, { ...c, cover: img ? decodeEntities(img[1]) : null })
    }
  }
  const index = siteIndex(srcDir)
  assert.equal(base.size, 364)
  const diffs = []
  for (const p of index.posts) {
    const b = base.get(p.url)
    const c = cardFor(p)
    for (const k of ['excerpt', 'readingTime', 'cover']) if (c[k] !== b[k]) diffs.push(`${p.url} ${k}：${c[k]} ≠ ${b[k]}`)
  }
  assert.deepEqual(diffs, [])
})
