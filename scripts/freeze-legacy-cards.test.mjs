import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildLegacy, decodeEntities, parseAtomSummaries, parseListCards } from './freeze-legacy-cards.mjs'

const card = (url, excerpt, minutes) => `
<article class="card">
  <div class="body">
    <div class="topline">
      <span>css</span><span>·</span>
      <span>${minutes} 分鐘</span>
    </div>
    <h2><a href="${url}">標題</a></h2>
    <p class="excerpt">${excerpt}</p>
  </div>
</article>`

test('decodeEntities：Hexo EJS 跳脫過的字元解回來，只解一層', () => {
  assert.equal(decodeEntities('&lt;div&gt; &amp;lt; &quot;a&quot; &#39;b&#39; &#x27;c&#x27;'), `<div> &lt; "a" 'b' 'c'`)
})

test('parseListCards：網址解開 percent-encoding，摘要解開實體，閱讀時間是數字', () => {
  const html = card('/tags/%E8%B3%87%E5%AE%89/x/', '用 &amp;lt;div&amp;gt; 排版…', 3) + card('/css/2013/08/20/a/', '摘要', 1)
  assert.deepEqual(parseListCards(html), [
    { url: '/tags/資安/x/', excerpt: '用 &lt;div&gt; 排版…', readingTime: 3 },
    { url: '/css/2013/08/20/a/', excerpt: '摘要', readingTime: 1 }
  ])
  assert.throws(() => parseListCards('<article class="card"><h2>壞掉</h2></article>'), /卡片格式不認得/)
})

test('parseAtomSummaries：只收 CDATA 的 summary（沒有 description 的文章）', () => {
  const xml = `<entry><id>https://www.casper.tw/a/2020/01/01/x/</id><summary>純文字</summary></entry>
<entry><id>https://www.casper.tw/a/2020/01/02/y/</id><summary>
      <![CDATA[<p>HTML</p>]]>
    </summary></entry>`
  assert.deepEqual(parseAtomSummaries(xml), { '/a/2020/01/02/y/': '<p>HTML</p>' })
})

test('buildLegacy：摘要只凍結沒有 description 的文章；同一篇在不同頁不同就丟錯', () => {
  const listPages = { 'index.html': card('/a/', '甲', 2) + card('/b/', '乙', 5), 'page/2/index.html': card('/a/', '甲', 2) }
  const atomXml = '<entry><id>https://www.casper.tw/a/</id><summary><![CDATA[<p>甲</p>]]></summary></entry>'
  const data = buildLegacy({ listPages, atomXml, described: new Set(['/b/']) })
  assert.deepEqual(data.posts, { '/a/': { readingTime: 2, excerpt: '甲', atomSummary: '<p>甲</p>' }, '/b/': { readingTime: 5 } })
  assert.equal(data.frozenAt, '2026-11-03')
  const bad = { ...listPages, 'page/3/index.html': card('/a/', '甲', 3) }
  assert.throws(() => buildLegacy({ listPages: bad, atomXml: '', described: new Set() }), /卡片不同/)
})
