// node --test scripts/lib/extract-page.test.mjs
// 1. 移植區跟 workspace 的 scripts/blog-baseline.mjs 行為相同：
//    fixtures/hexo/ 的 9 頁（從基準 commit 用 git show 存下）算出來的欄位等於 pages.json；
//    找得到 workspace 時，兩邊每個移植函式的原始碼逐字相同，並對同一批 HTML 輸出相同結果；
//    讀得到基準 commit 的 git 物件時，657 頁全部重算一次跟 pages.json 比。
// 2. VitePress 專用的工具：本文範圍、比對用的正規化、相似度、卡片、連結、內容輪廓、JSON-LD。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as port from './extract-page.mjs'
import {
  extractPage, articleOf, builtArticleOf, hasProse, comparableText, normalizePunct, editDistance, similarity, firstDiff,
  normalizeHref, postLinks, linkSet, hexoCards, builtCards, idsIn, hashLinks, contentProfile, listProfile, softBreaks, demoCssLinks, jsonLdNodes,
  fingerprintText, sha256, textOf,
} from './extract-page.mjs'
import { hexoFiles, readHexo, builtHtml, toVitePressProse } from '../fixtures/world.mjs'
import { gitBaselineReader } from '../audit-build.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const BASELINE = JSON.parse(fs.readFileSync(path.join(ROOT, 'baseline/hexo-2026-11-03/pages.json'), 'utf8'))
const byFile = new Map(BASELINE.pages.map((p) => [p.file, p]))
const WORKSPACE_SCRIPT = path.resolve(ROOT, '../../scripts/blog-baseline.mjs')
const original = fs.existsSync(WORKSPACE_SCRIPT) ? await import(WORKSPACE_SCRIPT) : null

const PORTED = [
  'fileToUrl', 'urlAliases', 'pageType', 'decodeEntities', 'parseAttrs', 'findTags', 'stripHidden', 'textOf', 'headOf',
  'mainOf', 'articleOf', 'fingerprintText', 'sha256', 'headings', 'extractPage', 'sitemapLocs',
]
const fieldsOf = ({ url, file, type, alias, ...rest }) => rest

test('移植區：fixtures 的 9 頁算出的欄位等於基準 pages.json', () => {
  const files = hexoFiles()
  assert.equal(files.length, 9)
  for (const file of files) {
    const p = byFile.get(file)
    assert.ok(p, `pages.json 沒有 ${file}`)
    assert.deepEqual(extractPage(readHexo(file)), fieldsOf(p), file)
    assert.equal(port.fileToUrl(file), p.url)
    assert.equal(port.pageType(file), p.type)
    assert.equal(port.urlAliases(file)[0] ?? null, p.alias)
  }
})

test('移植區：每個函式的原始碼跟 workspace 的 blog-baseline.mjs 逐字相同', { skip: !original && '找不到 workspace 的 scripts/blog-baseline.mjs' }, () => {
  for (const name of PORTED) {
    assert.equal(typeof port[name], 'function', name)
    assert.equal(port[name].toString(), original[name].toString(), `${name} 跟 blog-baseline.mjs 不同`)
  }
  assert.equal(port.SITE, original.SITE)
})

test('移植區：同一份 HTML，兩邊的 extractPage 與文字指紋結果相同', { skip: !original && '找不到 workspace 的 scripts/blog-baseline.mjs' }, () => {
  for (const file of hexoFiles()) {
    const html = readHexo(file)
    assert.deepEqual(port.extractPage(html), original.extractPage(html), file)
    assert.equal(port.fingerprintText(port.articleOf(html)), original.fingerprintText(original.articleOf(html)), file)
    assert.deepEqual(port.headings(html), original.headings(html), file)
    assert.equal(port.textOf(html), original.textOf(html), file)
  }
  const odd = '<html lang="en"><head><title> a &amp;  b </title><meta name="description" content=\'x &#x2F; y\'><meta name="description" content="dup"></head><body><main><h2 id="A">一</h2><div class="prose"><p>內&nbsp;文</p></div></main></body></html>'
  assert.deepEqual(port.extractPage(odd), original.extractPage(odd))
})

const git = gitBaselineReader(ROOT, BASELINE.source.commit, BASELINE.pages.map((p) => p.file))
test('移植區：基準 commit 的 657 頁全部重算，等於 pages.json（兩邊實作也相同）', { skip: !git.ok && git.error }, () => {
  let n = 0
  for (const p of BASELINE.pages) {
    const html = git.get(p.file).toString('utf8')
    const mine = extractPage(html)
    assert.deepEqual(mine, fieldsOf(p), p.url)
    if (original) assert.deepEqual(mine, original.extractPage(html), p.url)
    n++
  }
  assert.equal(n, 657)
})

// --- VitePress 專用 ------------------------------------------------------------

const wrap = (main) => `<html><head></head><body><div id="app"><div class="vp-raw"><main data-v-1>${main}</main></div></div></body></html>`

test('builtArticleOf：用 class token 找 prose 與最後一個 post-foot，Vue 的 data-v-* 不影響', () => {
  const html = wrap('<h1>標題</h1><div class="prose content" data-v-abc><p>本文</p><div class="post-foot-note">不是 foot</div></div><div data-v-abc class="post-foot"><a>標籤</a></div>')
  assert.equal(textOf(builtArticleOf(html)), '本文不是 foot')
  assert.equal(hasProse(html), true)
  // 跟 articleOf 一樣：沒有 post-foot 就到 </article>，沒有 prose 就是整個 main
  const noFoot = wrap('<article><div class="prose"><p>甲</p></div><p>乙</p></article><p>丙</p>')
  assert.equal(textOf(builtArticleOf(noFoot)), '甲乙')
  assert.equal(builtArticleOf(noFoot), articleOf(noFoot))
  assert.equal(textOf(builtArticleOf(wrap('<p>列表</p>'))), '列表')
  assert.equal(hasProse(wrap('<p>列表</p>')), false)
  // 標記完全照 Hexo 寫時，兩個函式結果相同
  for (const file of ['development/2021/09/11/css-selector/index.html', 'about/hexschool-traning.html']) {
    const h = readHexo(file)
    assert.equal(builtArticleOf(h), articleOf(h), file)
  }
})

test('comparableText：去掉程式碼外框與零寬字元，彎引號、破折號、刪節號倒回 smartypants 之前', () => {
  assert.equal(normalizePunct('“a” ‘b’ x—y x–y …​'), '"a" \'b\' x---y x--y ...')
  const vp = '<div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki"><code>let a = 1</code></pre></div><h2 id="x">標題 <a class="header-anchor" href="#x">&#8203;</a></h2>'
  const hexo = '<pre><code class="hljs js">let a = 1</code></pre><h2 id="x"><a href="#x" class="headerlink" title="標題"></a>標題</h2>'
  assert.equal(comparableText(vp), comparableText(hexo))
  assert.equal(comparableText(vp), 'leta=1標題')
  // markdown renderer 直接輸出的 header-anchor 是 &ZeroWidthSpace;（Vue 編譯後才變成 U+200B），兩種都要拿掉
  const raw = '<h2 id="x" tabindex="-1">標題 <a class="header-anchor" href="#x" aria-label="Permalink to &quot;標題&quot;">&ZeroWidthSpace;</a></h2>'
  assert.equal(comparableText(raw), '標題')
})

test('comparableText：Hexo 本文轉成 VitePress 的樣子後，比對文字完全相同（指紋則不同）', () => {
  for (const file of ['development/2021/09/11/css-selector/index.html', 'css/2013/09/29/css-target/index.html', 'life/2015/01/08/2014-year-report/index.html']) {
    const h = readHexo(file)
    const url = port.fileToUrl(file)
    const built = builtHtml({ file, title: 't', canonical: 'x', main: `<div class="prose" data-v-1><div>${toVitePressProse(articleOf(h), url)}</div></div><div class="post-foot"></div>` })
    assert.equal(comparableText(builtArticleOf(built)), comparableText(articleOf(h)), file)
  }
  const css = readHexo('development/2021/09/11/css-selector/index.html')
  const built = builtHtml({ file: 'development/2021/09/11/css-selector/index.html', title: 't', main: `<div class="prose"><div>${toVitePressProse(articleOf(css), '/x/')}</div></div>` })
  assert.notEqual(sha256(fingerprintText(builtArticleOf(built))), sha256(fingerprintText(articleOf(css))))
})

function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Int32Array(b.length + 1))
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1])
  return dp[a.length][b.length]
}

test('editDistance：跟動態規劃的 LCS 結果一致（隨機字串），超過 maxD 回 null', () => {
  let seed = 7
  const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
  for (let round = 0; round < 300; round++) {
    const gen = () => Array.from({ length: Math.floor(rand() * 40) }, () => 'abc中文'[Math.floor(rand() * 5)]).join('')
    const a = gen()
    const b = rand() < 0.5 ? gen() : a.slice(0, Math.floor(rand() * a.length)) + 'x' + a.slice(Math.floor(rand() * a.length))
    const d = a.length + b.length - 2 * lcs(a, b)
    assert.equal(editDistance(a, b), d, `${a} / ${b}`)
    if (d > 0) assert.equal(editDistance(a, b, d - 1), null)
  }
  assert.equal(editDistance('', ''), 0)
  assert.equal(editDistance('abc', ''), 3)
})

test('similarity：1 - D/(n+m)；低於 min 只回上限；上限不小於實際值', () => {
  assert.deepEqual(similarity('', ''), { ratio: 1, upper: 1 })
  const s = similarity('abcdefghij', 'abcdXefghij')
  assert.equal(s.ratio, 1 - 1 / 21)
  assert.ok(s.upper >= s.ratio)
  const low = similarity('aaaaaaaaaa', 'bbbbbbbbbb', { min: 0.5 })
  assert.equal(low.ratio, null)
  assert.equal(low.upper, 0)
  // 含 emoji（UTF-16 代理對）時上限也不能低於實際值
  const e = similarity('🙂abc🙂def', '🙂abc🙂deXf')
  assert.ok(e.upper >= e.ratio)
  assert.deepEqual(firstDiff('abcdef', 'abcxef', 2), { at: 3, expected: 'abcde', actual: 'abcxe' })
  assert.equal(firstDiff('same', 'same'), null)
})

test('normalizeHref：去掉網域、查詢字串與 #，中文統一成 percent-encoding，站外與協定相對網址回 null', () => {
  assert.equal(normalizeHref('https://www.casper.tw/tags/資安/?a=1#x'), '/tags/%E8%B3%87%E5%AE%89/')
  assert.equal(normalizeHref('/tags/%E8%B3%87%E5%AE%89/'), '/tags/%E8%B3%87%E5%AE%89/')
  assert.equal(normalizeHref('/javascript/2019/03/18/JS-THIS/'), '/javascript/2019/03/18/JS-THIS/')
  assert.equal(normalizeHref('https://example.com/a/'), null)
  assert.equal(normalizeHref('//example.com/a/'), null)
  assert.equal(normalizeHref('#top'), null)
})

test('hexoCards、builtCards、postLinks、linkSet：從真實的 Hexo 列表頁與模擬的新版卡片取出同樣的順序', () => {
  const page2 = readHexo('page/2/index.html')
  const cards = hexoCards(page2)
  assert.equal(cards.length, 10)
  assert.equal(cards[0].url, '/development/2023/09/29/fireabase-storage/')
  assert.match(cards[0].excerpt, /^這是鐵人賽相關文章/)
  assert.deepEqual(postLinks(page2), cards.map((c) => c.url))
  const built = wrap(cards.map((c) => `<article class="post-card" data-v-2><a class="post-card__cover" href="${c.url}"><img></a><h3 class="post-card__title"><a href="https://www.casper.tw${c.url}">t</a></h3><p class="post-card__meta">m</p><p class="post-card__excerpt">${c.excerpt}</p></article>`).join(''))
  assert.deepEqual(builtCards(built), cards)
  // 標題本身就是 <a> 也可以
  assert.deepEqual(builtCards(wrap('<div class="post-card"><a class="post-card__title" href="/a/2020/01/01/b/">t</a></div>')), [{ url: '/a/2020/01/01/b/', excerpt: null }])
  assert.equal(postLinks(readHexo('archives/2014/05/index.html')).length, 6)
  assert.deepEqual([...linkSet(wrap('<a href="/tags/vue/">v</a><a href="https://www.casper.tw/tags/資安/">s</a><a href="/tags/">all</a>'), /^\/tags\/[^/]+\/$/)], ['/tags/vue/', '/tags/%E8%B3%87%E5%AE%89/'])
})

test('idsIn、hashLinks：css-target 的站內 # 連結都找得到目標', () => {
  const h = readHexo('css/2013/09/29/css-target/index.html')
  const ids = idsIn(h)
  const targets = hashLinks(articleOf(h)).filter((t) => ids.has(t))
  assert.equal(targets.length, 2)
  assert.deepEqual(hashLinks('<a href="#">x</a><a href="#%E4%B8%AD">y</a><a class="headerlink" href="#h">z</a>'), ['中'])
})

test('contentProfile：pre、br、img、粗體斜體、照字面的 * 與 _，以及 <pre> 以外的 inline code', () => {
  const p = contentProfile('<p>a<br>b<br/><img src="x"></p><pre><code>x {{ y }} a**b**</code></pre><p><code>nvm use {{ 版本號 }} _x_</code></p><script>"<br>"</script>')
  assert.deepEqual(p, { pre: 1, br: 2, softBr: 2, img: 1, emphasis: 0, marks: 0, inlineCode: ['nvmuse{{版本號}}_x_'], lists: [] })
  // async-await 的情形：Hexo（marked）把 **重要：** 轉成粗體，markdown-it 不轉，畫面上多 4 個星號
  const hexo = contentProfile('<p><strong>重要：</strong>當使用 async/await 時，<em>注意</em> snake_case</p>')
  const vp = contentProfile('<p>**重要：**當使用 async/await 時，<em>注意</em> snake_case</p>')
  assert.deepEqual([hexo.emphasis, hexo.marks], [2, 1])
  assert.deepEqual([vp.emphasis, vp.marks], [1, 5])
  const nvm = contentProfile(articleOf(readHexo('development/2022/01/10/install-nvm/index.html')))
  assert.deepEqual(nvm.inlineCode.filter((c) => c.includes('{{')), ['nvminstall{{版本號}}', 'nvmaliasdefault{{版本號}}', 'nvmuse{{版本號}}'])
})

test('listProfile：清單的範圍、每個 li 的層級與 ol 編號；巢狀被攤平、兩段清單被合併都看得出來', () => {
  // nodejs-github-action 步驟 5：Hexo（marked）是 5 底下的 1、2，再接 6
  const hexo = '<ol start="5"><li>接下來將公鑰加入至 Server 中<ol><li><code>cat</code> 查看公鑰</li><li>執行指令</li></ol></li><li><p>設置權限</p></li></ol>'
  assert.deepEqual(listProfile(hexo), ['ol(', '1#5', 'ol(', '2#1', '2#2', ')', '1#6', ')'])
  // 子清單只縮排 2 格時 CommonMark 攤平成 5、6、7、8
  const flat = '<ol start="5"><li><p>接下來將公鑰加入至 Server 中</p></li><li><p><code>cat</code> 查看公鑰</p></li><li><p>執行指令</p></li><li><p>設置權限</p></li></ol>'
  assert.deepEqual(listProfile(flat), ['ol(', '1#5', '1#6', '1#7', '1#8', ')'])
  // hexschool-traning：兩個 ul 合成一個，li 數量、層級都一樣，靠範圍分辨
  assert.notDeepEqual(listProfile('<ul><li>a</li></ul><ul><li>b</li></ul>'), listProfile('<ul><li><p>a</p></li><li><p>b</p></li></ul>'))
  // <pre> 裡、註解裡的不算；屬性裡有 > 也不會切錯；不在清單裡的 li 記成 0*
  assert.deepEqual(listProfile('<pre><code><ul><li>x</li></ul></code></pre><!-- <ol><li>y</li></ol> --><ul data-x="a>b"><li>z</li></ul><li>w</li>'), ['ul(', '1*', ')', '0*'])
  // 真實的 Hexo 頁兩邊算出來一樣（測試世界的新版本文是同一份內容換外框）
  const file = 'development/2021/09/11/css-selector/index.html'
  assert.deepEqual(listProfile(articleOf(readHexo(file))), listProfile(toVitePressProse(articleOf(readHexo(file)), '/development/2021/09/11/css-selector/')))
})

test('softBreaks：只算段落裡夾在內容之間的 <br>，Hexo 在區塊旁多出來的不算', () => {
  // 真實的 Hexo 寫法（js-console、javascript-event-queue、banner-slider、gulp-on-diff-os）和對應的新版
  const cases = [
    ['<p>比較相同屬性之間的關係。<br><pre><code>a<br>b</code></pre><br><img src="x"></p>', 0],
    ['<p>比較相同屬性之間的關係。</p><div class="language-js"><pre><code>a</code></pre></div><p><img src="x"></p>', 0],
    ['<p>小明故事：<br>小明在完成早上的事情後</p>', 1],
    ['<p>小明故事：<br>\n小明在完成早上的事情後</p>', 1],
    ['<video width="100%" controls><br><source src="x" type="video/mp4"><br>Your browser does not support the video tag.<br></video>', 0],
    ['<p>讓他不斷的向右移動。<br><span id="more"></span></p>', 0],
    ['<li><a href="/gulp/2014/09/22/gulp-install">Gulp 環境安裝<br> </a></li>', 0],
    ['<p>a<br><br>b</p>', 2],
    ['<p>圖解概念：<br> <img src="x"></p>', 1],
    ['<p><code>map</code><br>會在執行時</p>', 1],
    ['<p>a<br>&ZeroWidthSpace;</p><p>&#8203;<br>b</p>', 0],
  ]
  for (const [html, n] of cases) assert.equal(softBreaks(html), n, html)
  // 真實的 Hexo 頁：<br> 的總數包含程式碼區塊旁的，softBr 只算段落換行
  const p = contentProfile(articleOf(readHexo('development/2021/09/11/css-selector/index.html')))
  assert.ok(p.softBr <= p.br)
})

test('demoCssLinks 與 jsonLdNodes', () => {
  const head = '<head><link href="https://img.casper.tw/demoFile/css/2013-summer.css" rel="stylesheet"><script type="application/ld+json">{"@graph":[{"@type":"BlogPosting"},{"@type":["WebPage","X"]}]}</script><script type="application/ld+json">{bad</script></head>'
  assert.deepEqual(demoCssLinks(head), ['https://img.casper.tw/demoFile/css/2013-summer.css'])
  const { nodes, invalid } = jsonLdNodes(head)
  assert.deepEqual(nodes.map((n) => n['@type']), ['BlogPosting', ['WebPage', 'X']])
  assert.equal(invalid, 1)
})

// ---------------------------------------------------------------------------
// 外語首頁、語言選單、工具組（主站首頁規格 J.1）
// ---------------------------------------------------------------------------

test('outerHtmlOf 與 elementsWhere：同名標籤照巢狀配對，void 元素只有開始標籤', () => {
  const html = '<div class="a"><div class="b"><img src="x"></div><p>t</p></div><div class="c"></div>'
  const els = port.elementsWhere(html, (t) => t.name === 'div')
  assert.deepEqual(els.map((e) => e.attrs.class), ['a', 'b', 'c'])
  assert.equal(els[0].outer, '<div class="a"><div class="b"><img src="x"></div><p>t</p></div>')
  assert.equal(els[0].inner, '<div class="b"><img src="x"></div><p>t</p>')
  const img = port.elementsWhere(html, (t) => t.name === 'img')[0]
  assert.deepEqual([img.outer, img.inner], ['<img src="x">', ''])
})

test('rootClassesOf、hreflangLinksOf、ogLocalesOf、siteHomeHeadSequence', () => {
  const html = '<html><head><title>A &amp; B</title><meta name="description" content="d"><meta name="twitter:card" content="summary">' +
    '<link rel="canonical" href="https://www.casper.tw/en/"><link rel="alternate" hreflang="en" href="https://www.casper.tw/en/">' +
    '<link rel="alternate" hreflang="x-default" href="https://www.casper.tw/en/"><link rel="alternate" href="/atom.xml" type="application/atom+xml">' +
    '<meta property="og:locale" content="en_US"><meta property="og:locale:alternate" content="zh_TW">' +
    '<script type="application/ld+json">[{"@type":"WebPage"}]</script></head>' +
    '<body><div id="app"> <!-- x --><div class="vp-raw site page-type-site-home"></div></div></body></html>'
  assert.deepEqual(port.rootClassesOf(html), ['vp-raw', 'site', 'page-type-site-home'])
  assert.deepEqual(port.rootClassesOf('<div id="app"></div>'), [])
  assert.deepEqual(port.hreflangLinksOf(html), [{ hreflang: 'en', href: 'https://www.casper.tw/en/' }, { hreflang: 'x-default', href: 'https://www.casper.tw/en/' }])
  assert.deepEqual(port.ogLocalesOf(html), { locale: ['en_US'], alternates: ['zh_TW'] })
  assert.deepEqual(port.siteHomeHeadSequence(html), [
    'title=A & B', 'description=d', 'canonical=https://www.casper.tw/en/', 'hreflang:en=https://www.casper.tw/en/',
    'hreflang:x-default=https://www.casper.tw/en/', 'og:locale=en_US', 'og:locale:alternate=zh_TW', 'jsonld=WebPage',
  ])
})

test('toolLinksIn：頁尾的工具連結與 #tools 的卡片，名稱拆成 before、label（lang）、after', () => {
  const footer = '<a href="https://www.casper.tw/lucky-draw/" hreflang="zh-Hant">抽獎大師 <span lang="en" data-foreign="">Lucky Draw</span>（中文）</a>'
  assert.deepEqual(port.toolLinksIn(footer), [{ href: 'https://www.casper.tw/lucky-draw/', hreflang: 'zh-Hant', before: '抽獎大師', label: 'Lucky Draw', lang: 'en', after: '（中文）', summary: null }])
  const card = '<a class="cs-toolcard" href="https://www.casper.tw/lucky-draw/en/"><img alt=""><span class="cs-toolcard__name">Lucky Draw</span><span class="cs-toolcard__sum">Draw &amp; spin</span></a>'
  assert.deepEqual(port.toolLinksIn(card), [{ href: 'https://www.casper.tw/lucky-draw/en/', hreflang: null, before: '', label: 'Lucky Draw', lang: null, after: '', summary: 'Draw & spin' }])
})

test('languageItemsIn：目前語系是 span，沒有 href；附註另外拆出', () => {
  const menu = '<details class="cs-lang"><summary>Language</summary><ul>' +
    '<li><span class="cs-lang__item cs-lang__item--current" aria-current="true" lang="en">English</span></li>' +
    '<li><a class="cs-lang__item" href="https://www.casper.tw/" hreflang="zh-Hant" lang="zh-Hant-TW">繁體中文<span class="cs-lang__note">（首頁）</span></a></li></ul></details>'
  assert.deepEqual(port.languageItemsIn(menu), [
    { current: true, href: null, hreflang: null, lang: 'en', text: 'English', note: null },
    { current: false, href: 'https://www.casper.tw/', hreflang: 'zh-Hant', lang: 'zh-Hant-TW', text: '繁體中文', note: '（首頁）' },
  ])
})
