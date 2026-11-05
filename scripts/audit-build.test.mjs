// node --test scripts/audit-build.test.mjs
// 現在還沒有可用的 VitePress dist，所以用 fixtures/world.mjs 的測試世界：真實的 Hexo 頁產生迷你基準，
// 再模擬新版產物。沒改壞的世界要全部通過；每個測試改壞一個地方，確認對應的檢查會失敗、訊息講得出原因。
// 另外對真實的基準（baseline/hexo-2026-11-03/）驗白名單與預期集合的數字。
// 外語首頁與工具清單（checkLocales、checkTools，主站首頁規格 J.1）另有三份世界：S 之後、I1 之後、多語（en、ja、de）。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  runAudit, formatReport, legacyUrlFix, expectedSitemap, expectedContentEntry, canonicalJson, atomEntries,
  rootHasVpRaw, caseCollisions, callsHexo, loadBaseline, latestBaselineDir, NEW_URLS, FIXED_ANCHORS, TEXT_EXPECTED, TEMPLATE_ALLOW,
  PROFILE_EXPECTED, PROFILE_LABEL, PROFILE_SEQUENCE_LABEL, THEME_CHUNK_MAX, SIDEBAR_RELATED_MAX, regionsOf, prefetchLinksOf, metaChunkOf,
  CHECKS, CATEGORIES_FILE, siteHomeUrlRule, gaConfigsOf, unpublishedCopyProbes, mainTextWithoutForeign, expectedSiteHomeHead,
  toolsRegionProblems, previewLinkScriptsIn, PREVIEW_LINKS_TOKEN,
} from './audit-build.mjs'
import { buildWorld, HOME_WEBSITE_LD, I1_INDEX, I1_PLAN, P1_PLAN, FEATURE_INDEX } from './fixtures/world.mjs'
import { toolCardsIn } from './lib/extract-page.mjs'
import { readHomeMessages } from '../source/.vitepress/lib/site-home.mjs'
import { previewLinkScript } from '../source/.vitepress/lib/preview-links.mjs'
import { SITE_TITLE_LEGACY, shouldLoadAds, countAdsLoaders } from '../source/.vitepress/theme/shared/shell/site.mjs'
import { pageTypeOf } from '../source/.vitepress/lib/pagetype.mjs'
import { SIDEBAR_RELATED_COUNT } from '../source/.vitepress/lib/pagedata.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REAL = loadBaseline(path.join(ROOT, 'baseline/hexo-2026-11-03'))

/**
 * 測試世界的文章頁補上側欄（照 theme/components/PostAside.vue 的結構，放在 </article> 之後）：
 * 本文目錄連到該頁第一個標題 id，相關文章連到世界裡其他文章，站內頁（世界裡沒有 /about/，改連 /contact/）、
 * 熱門標籤、RSS、站外連結各一個。
 */
const SIDEBAR_POSTS = new Map()
function sidebarHtml(url, html, { related } = {}) {
  const id = /<h[2-6]\b[^>]*\bid="([^"]+)"/.exec(html)?.[1]
  const toc = id ? `<div class="post-aside__track"><nav class="post-toc" aria-label="本文目錄"><h2 class="side-block__title">本文目錄</h2><ol><li><a class="post-toc__link" href="#${id}">第一段</a></li></ol></nav></div>` : ''
  const rel = (related ?? [...SIDEBAR_POSTS.keys()].filter((u) => u !== url)).map((u) => `<li><a class="side-related__link" href="${u}"><span>相關</span></a></li>`).join('')
  return `<aside class="post-aside post-aside--toc" aria-label="文章側欄" data-v-7a1b2c3d>${toc}<div class="post-aside__more">` +
    `<section class="side-block side-related"><h2 class="side-block__title">相關文章</h2><ol class="side-related__list">${rel}</ol></section>` +
    '<section class="side-block side-author"><h2 class="side-block__title">關於作者</h2><img src="/img/casper-avatar.webp" width="64" height="64" alt="" loading="lazy"><a href="/contact/">聯絡卡斯伯 →</a></section>' +
    '<section class="side-block side-book"><h2 class="side-block__title">我的著作</h2><a class="c3d" href="https://hex.school/byKCb" target="_blank" rel="noopener">JavaScript 面試力</a></section>' +
    '<section class="side-block side-tags"><h2 class="side-block__title">熱門標籤</h2><a class="chip" href="/tags/vue/">vue</a></section>' +
    '<section class="side-block side-social"><h2 class="side-block__title">社群</h2><a href="https://github.com/wcc723" target="_blank" rel="noopener">GitHub</a><a href="/atom.xml">RSS</a></section>' +
    '</div></aside>'
}
function withSidebars(dist) {
  const posts = [...dist.keys()].filter((f) => f.endsWith('index.html') && pageTypeOf(f.replace(/\.html$/, '.md')) === 'post')
  for (const f of posts) SIDEBAR_POSTS.set('/' + f.slice(0, -'index.html'.length), f)
  for (const [url, f] of SIDEBAR_POSTS) dist.set(f, dist.get(f).replace('</article>', `</article>${sidebarHtml(url, dist.get(f))}`))
}

/** 建世界（文章頁先補上側欄）、跑 audit、清掉暫存，回傳報告；stage 見 fixtures/world.mjs 的 STAGES，worldOpts 是 buildWorld 的其他選項（toolsIndex） */
async function audit(mutate, extra = {}, stage = 'p1', worldOpts = {}) {
  const w = buildWorld((dist, world) => {
    withSidebars(dist)
    if (mutate) mutate(dist, world)
  }, { stage, ...worldOpts })
  try {
    return await runAudit({ ...w.opts, ...extra })
  } finally {
    w.cleanup()
  }
}
const check = (report, id) => report.checks.find((c) => c.id === id)
/** 只有 ids 這幾項失敗，而且每項的失敗訊息都符合 pattern */
function assertFails(report, ids, pattern) {
  const failed = report.checks.filter((c) => !c.ok).map((c) => c.id)
  assert.deepEqual(failed.sort(), [...ids].sort(), formatReport(report))
  for (const id of ids) assert.ok(check(report, id).failures.some((f) => pattern.test(f)), `${id}：${check(report, id).failures.join('\n')}`)
}
const edit = (file, fn) => (dist) => dist.set(file, fn(dist.get(file)))
const POST = 'development/2021/09/11/css-selector/index.html'
const POST_URL = '/development/2021/09/11/css-selector/'

test('沒改壞的測試世界：20 項檢查全部通過', async () => {
  const r = await audit()
  assert.equal(r.ok, true, formatReport(r))
  assert.equal(r.checks.length, 20)
  assert.equal(CHECKS.length, 20)
  assert.match(formatReport(r), /結果：全部 20 項通過/)
  assert.equal(check(r, 'sidebar').stats.withSidebar, 4)
  assert.equal(check(r, 'sidebar').stats.posts, 4)
  assert.ok(r.expected.some((e) => e.target === '/_headers'))
  assert.ok(r.expected.some((e) => e.target === '/tags/vue/' && /大寫標籤/.test(e.reason)))
})

test('網址：少了基準頁、多了沒登記的網址、_headers 還在、只差大小寫', async () => {
  // 少一頁時，那一頁的固定錨點案例也會跟著失敗，其他文章側欄裡連到它的相關文章也變成死連結
  assertFails(await audit((d) => d.delete(POST)), ['urls', 'anchors', 'sidebar'], /基準頁不在 dist：\/development\/2021\/09\/11\/css-selector\/|固定案例|側欄連到不存在的網址 \/development\/2021\/09\/11\/css-selector\//)
  assertFails(await audit((d) => d.set('foo/index.html', d.get('privacy/index.html'))), ['urls', 'ads'], /未預期的新網址：\/foo\/|判斷不出頁型/)
  assertFails(await audit((d) => d.set('_headers', '/*\n')), ['urls'], /預期移除的 \/_headers 還在 dist/)
  // macOS 不分大小寫，兩個資料夾寫不出來，只驗判斷邏輯
  assert.deepEqual(caseCollisions(['/tags/sass/', '/tags/Sass/', '/tags/vue/', '/categories/CSS/']), [['/tags/Sass/', '/tags/sass/']])
  assert.deepEqual(caseCollisions(['/categories/CSS/', '/css/2013/10/20/Vertical-write/']), [])
})

test('每頁欄位：canonical、FB data-href 的尾斜線、title、description、noindex', async () => {
  // canonical 跑掉時，sitemap 的網址也對不上該頁 canonical
  assertFails(await audit(edit(POST, (h) => h.replace(`href="https://www.casper.tw${POST_URL}"`, 'href="https://www.casper.tw/development/2021/09/11/css-selector"'))), ['pages', 'feeds'], /canonical/)
  assertFails(await audit(edit(POST, (h) => h.replace(/data-href="([^"]*)\/"/, 'data-href="$1"'))), ['pages'], /fbCommentsHref：預期/)
  assertFails(await audit(edit(POST, (h) => h.replace(/<title>[^<]*<\/title>/, '<title>新標題</title>'))), ['pages'], /title：預期/)
  assertFails(await audit(edit(POST, (h) => h.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="改寫">'))), ['pages'], /description：預期/)
  assertFails(await audit(edit(POST, (h) => h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex">'))), ['pages'], /有 noindex/)
  assertFails(await audit(edit(POST, (h) => h.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n<link rel="canonical" href="https://www.casper.tw${POST_URL}">`))), ['pages'], /head 標籤重複：canonical/)
})

test('合併標籤的第 1 頁：還用大寫的 canonical 會失敗', async () => {
  assertFails(await audit(edit('tags/vue/index.html', (h) => h.replaceAll('/tags/vue/', '/tags/Vue/'))), ['pages', 'feeds'], /canonical/)
})

test('站名：og:site_name 改掉、首頁 title 改掉', async () => {
  assertFails(await audit(edit(POST, (h) => h.replace(/og:site_name" content="[^"]*"/, 'og:site_name" content="卡斯伯工具"'))), ['site-name'], /og:site_name：預期/)
  assertFails(await audit(edit('index.html', (h) => h.replace(/<title>[^<]*<\/title>/, '<title>卡斯伯工具</title>'))), ['site-name', 'pages'], /title：預期/)
})

test('新頁與 404：canonical 不對、404 沒有 noindex', async () => {
  assertFails(await audit(edit('privacy/index.html', (h) => h.replaceAll('https://www.casper.tw/privacy/', 'https://www.casper.tw/Privacy'))), ['new-pages', 'feeds'], /canonical|sitemap/)
  assertFails(await audit(edit('404.html', (h) => h.replace('<meta name="robots" content="noindex">', ''))), ['new-pages'], /noindex/)
  // VitePress 內建的 404 文案（英文的 Not Found、「404 | 站名」）沒換掉
  assertFails(await audit(edit('404.html', (h) => h.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Not Found">'))), ['new-pages'], /\/404\.html description：預期/)
  assertFails(await audit(edit('404.html', (h) => h.replace(/<title>[^<]*<\/title>/, `<title>404 | ${SITE_TITLE_LEGACY}</title>`))), ['new-pages'], /\/404\.html title：預期/)
  // /privacy/ 改稿時刪掉 AdSense 規定的停用連結
  assertFails(await audit(edit('privacy/index.html', (h) => h.replace('https://www.aboutads.info/', 'https://example.com/'))), ['new-pages'], /少了連到 www\.aboutads\.info/)
})

test('標題 id：舊 id 不見、固定案例不見；用空 <span id> 保留舊 id 就算通過', async () => {
  const lost = await audit(edit(POST, (h) => h.replace('id="“屬性及值”-完全符合"', 'id="屬性及值-完全符合"')))
  assertFails(lost, ['anchors'], /少了標題 id「“屬性及值”-完全符合」/)
  assert.ok(check(lost, 'anchors').failures.some((f) => /固定案例/.test(f)))
  const kept = await audit(edit(POST, (h) => h.replace('<h3 id="“屬性及值”-完全符合"', '<span id="“屬性及值”-完全符合"></span><h3 id="屬性及值-完全符合"')))
  assert.equal(check(kept, 'anchors').ok, true, check(kept, 'anchors').failures.join('\n'))
  assert.ok(check(kept, 'anchors').notes.some((n) => /例外錨點/.test(n)))
  assertFails(await audit(edit('css/2013/09/29/css-target/index.html', (h) => h.replace('<a href="#test1"', '<a href="#gone"'))), ['anchors'], /少了站內連結 #test1/)
})

test('本文指紋：少一大段會失敗並指出位置，主題沒有 prose 也會失敗', async () => {
  const cut = await audit(edit(POST, (h) => h.replace(/(<div class="prose"[^>]*><div>)([\s\S]{2000})/, '$1')))
  // 側欄的本文目錄連到被刪掉的那個標題，也一起失敗
  assertFails(cut, ['text', 'anchors', 'content', 'sidebar'], /相似度|少了|數量|側欄連到不存在的標題/)
  assert.ok(check(cut, 'text').failures.some((f) => /相似度 0\.\d+，第 \d+ 字起/.test(f) || /相似度 低於/.test(f)))
  // 沒有 prose 時本文範圍變成整個 <main>，側欄的圖片與清單也算進去，內容輪廓跟著不同
  assertFails(await audit(edit(POST, (h) => h.replace('class="prose"', 'class="article-body"'))), ['text', 'content'], /找不到本文容器|數量|清單結構/)
  // 少幾個字仍在 0.98 以上
  const small = await audit(edit(POST, (h) => h.replace(/(<div class="prose"[^>]*><div><p>)(.{5})/, '$1')))
  assert.equal(check(small, 'text').ok, true, check(small, 'text').failures.join('\n'))
})

test('本文結構：段落換行、粗體變成照字面的 **、inline code、cssdemo 樣式', async () => {
  assertFails(await audit(edit(POST, (h) => h.replace(/(<div class="prose"[\s\S]*?<p>[^<]{4})/, '$1<br>'))), ['content'], /段落換行（<br>）數量：基準 \d+，新版 \d+/)
  // 程式碼區塊前多一個 <br>（Hexo 的寫法）不算段落換行
  assert.equal((await audit(edit(POST, (h) => h.replace(/(<div class="prose"[\s\S]*?)(<div class="language-)/, '$1<br>$2')))).checks.find((x) => x.id === 'content').ok, true)
  const bold = await audit(edit(POST, (h) => h.replace(/<strong>([^<]*)<\/strong>/, '**$1**')))
  assertFails(bold, ['content'], /粗體與斜體/)
  assert.match(bold.checks.find((x) => x.id === 'content').failures.join('\n'), /照字面顯示的 \* 與 _（[^）]*）：基準 0，新版 4/)
  assertFails(await audit(edit('development/2022/01/10/install-nvm/index.html', (h) => h.replace('<code>nvm use &#123;&#123; 版本號 &#125;&#125;</code>', '<code>nvm use </code>'))), ['content'], /inline code 不同/)
  assertFails(await audit(edit('css/2013/09/29/css-target/index.html', (h) => h.replace(/<link rel="stylesheet" href="[^"]*demoFile[^"]*">/, ''))), ['content'], /cssdemo/)
  // 每篇都比 inline code：CommonMark 沒認出 code span、照字面顯示反引號（vscode-for-mac 的情形）
  assertFails(await audit(edit(POST, (h) => h.replace('其中一個 <code>a</code>', '其中一個 `a`'))), ['content'], /css-selector\/ inline code 不同：第 \d+ 個起/)
})

test('本文結構：清單的巢狀被攤平、兩段清單被合併（about 頁也比）', async () => {
  // 清單換了種類（ul 變 ol）
  assertFails(await audit(edit(POST, (h) => h.replace('<ul>', '<ol>'))), ['content'], /css-selector\/ 清單結構 不同：第 1 個起，基準 「ul\( 1\* 1\*/)
  // hexschool-traning：兩段相鄰的清單被合成一個（CommonMark 遇到中間只有空行的情形）
  const merged = await audit(edit('about/hexschool-traning.html', (h) => h.replace('</ul>\n<ul>', '\n')))
  assertFails(merged, ['content'], /\/about\/hexschool-traning\.html 清單結構 不同/)
})

test('每頁欄位：文章的 keywords 照標籤建立順序，article:tag 依名稱的字碼順序', async () => {
  const nvm = 'development/2022/01/10/install-nvm/index.html'
  // install-nvm 的標籤是 javascript、nodejs：article:tag 照 keywords 的順序輸出（舊版的寫法）就算錯
  const swapped = await audit(edit(nvm, (h) => h.replace('<meta property="article:tag" content="javascript">\n<meta property="article:tag" content="nodejs">', '<meta property="article:tag" content="nodejs">\n<meta property="article:tag" content="javascript">')))
  assertFails(swapped, ['pages'], /install-nvm\/ article:tag：預期 「javascript、nodejs」/)
  assertFails(await audit(edit(nvm, (h) => h.replace('content="javascript,nodejs"', 'content="nodejs,javascript"'))), ['pages'], /install-nvm\/ keywords：預期 「javascript,nodejs」/)
  assertFails(await audit(edit(nvm, (h) => h.replace(/<meta property="article:tag" content="nodejs">\n/, ''))), ['pages'], /article:tag：預期/)
  const r = await audit()
  assert.equal(check(r, 'pages').stats.tagged, 4)
})

test('列表：卡片順序、摘要、/categories/ 少一個分類、連到舊的 /categories/css/', async () => {
  const swap = (h) => {
    const cards = [...h.matchAll(/<article class="post-card">[\s\S]*?<\/article>/g)].map((m) => m[0])
    return h.replace(cards[0], '\u0000').replace(cards[1], cards[0]).replace('\u0000', cards[1])
  }
  assertFails(await audit(edit('page/2/index.html', swap)), ['lists'], /卡片順序不同：第 1 張/)
  assertFails(await audit(edit('page/2/index.html', (h) => h.replace(/(<p class="post-card__excerpt">)([^<]{3})/, '$1'))), ['lists'], /卡片摘要不同/)
  assertFails(await audit(edit('categories/index.html', (h) => h.replace('<a href="/categories/CSS/">css</a>', ''))), ['lists'], /\/categories\/ 少了 \/categories\/CSS\//)
  assertFails(await audit(edit('page/2/index.html', (h) => h.replace('<a href="/page/3/">', '<a href="/categories/css/page/2/">'))), ['lists'], /還連到舊寫法：\/categories\/css\/page\/2\//)
  assertFails(await audit(edit('archives/2014/05/index.html', (h) => h.replace(/<a class="archive-row" href="[^"]*">文章<\/a>/, ''))), ['lists'], /封存的文章連結不同/)
})

test('feed：atom 的 published、content.json 的一筆、sitemap 少一個、lastmod、未發布文章外流', async () => {
  assertFails(await audit(edit('atom.xml', (x) => x.replace(/<published>[^<]*<\/published>/, '<published>2000-01-01T00:00:00.000Z</published>'))), ['feeds'], /atom.xml 第 1 筆 <published>/)
  assertFails(await audit(edit('content.json', (x) => JSON.stringify(JSON.parse(x).map((p, i) => (i ? p : { ...p, title: '改' }))))), ['feeds'], /content.json 的 .* 跟基準不同/)
  assertFails(await audit(edit('sitemap.xml', (x) => x.replace(/<url><loc>https:\/\/www\.casper\.tw\/terms\/<\/loc><\/url>/, ''))), ['feeds'], /sitemap 少了 https:\/\/www\.casper\.tw\/terms\//)
  assertFails(await audit(edit('sitemap.xml', (x) => x.replace('<lastmod>2026-07-09</lastmod>', '<lastmod>2022-01-10</lastmod>'))), ['feeds'], /lastmod：預期 2026-07-09/)
  assertFails(await audit(edit('sitemap.xml', (x) => x.replace('<lastmod>2026-07-09</lastmod>', '<lastmod>2026-07-09T00:00:00.000Z</lastmod>'))), ['feeds'], /lastmod 應該只有日期/)
  assertFails(await audit(edit('atom.xml', (x) => x.replace('</feed>', '<entry><id>https://www.casper.tw/development/2020/01/01/draft/</id></entry></feed>'))), ['feeds'], /未發布的文章出現在 atom.xml|atom.xml 有/)
})

test('廣告：不該載入的頁有 loader、loader 兩次、少了 meta、ins.adsbygoogle、ADS_MODE allowlist', async () => {
  const loader = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8296684122088055" crossorigin="anonymous"></script>'
  assertFails(await audit(edit('404.html', (h) => h.replace('</head>', `${loader}\n</head>`))), ['ads'], /404.html（not-found）不該載入 loader/)
  assertFails(await audit(edit(POST, (h) => h.replace('</head>', `${loader}\n</head>`))), ['ads'], /loader 出現 2 次/)
  assertFails(await audit(edit(POST, (h) => h.replace(/<meta name="google-adsense-account"[^>]*>/, ''))), ['ads'], /少了 google-adsense-account meta/)
  assertFails(await audit(edit(POST, (h) => h.replace('<footer', '<ins class="adsbygoogle" data-ad-client="x"></ins><footer'))), ['ads'], /ins class="adsbygoogle"/)
  assertFails(await audit(edit('assets/chunks/theme.Dx9.js', (x) => x + 'h("ins",{class:"adsbygoogle"})')), ['ads'], /theme.Dx9.js 裡有 ins.adsbygoogle/)
  // hexschool-traning 一定要是 ads: false：front matter 被拿掉時，就算 loader 跟著出現也要擋下
  const noFlag = await audit(edit('about/hexschool-traning.html', (h) => h.replace('</head>', `${loader}\n</head>`)), { adsFalseUrls: new Set() })
  assertFails(noFlag, ['ads'], /hexschool-traning\.html 的 front matter 要有 ads: false/)
  // 同一份 dist 用 allowlist 模式檢查：首頁、/page/N/、列表頁不該載入
  const r = await audit(null, { adsMode: 'allowlist' })
  assertFails(r, ['ads'], /（home）不該載入 loader/)
  assert.ok(check(r, 'ads').failures.some((f) => /（taxonomy-list）不該載入/.test(f)))
})

test('版面根元素沒有 vp-raw', async () => {
  assertFails(await audit(edit(POST, (h) => h.replace('<div class="vp-raw ', '<div class="layout '))), ['layout'], /沒有 vp-raw/)
  assert.equal(rootHasVpRaw('<div id="app"><!--[--><div data-v-1 class="a vp-raw">'), true)
  assert.equal(rootHasVpRaw('<div id="app"><main><div class="vp-raw">'), false)
  assert.equal(rootHasVpRaw('<body><div class="vp-raw">'), false)
})

test('站點資料的 router.prefetchLinks 不是 false（整頁載入用不到預抓）', async () => {
  const on = (h) => h.replace('\\"prefetchLinks\\":false', '\\"prefetchLinks\\":true')
  assertFails(await audit(edit(POST, on)), ['layout'], /css-selector\/ 的站點資料 router\.prefetchLinks 是 true/)
  const site = (json) => `<script>window.__VP_SITE_DATA__=JSON.parse(${JSON.stringify(JSON.stringify(json))})</script>`
  assert.equal(prefetchLinksOf(site({ router: { prefetchLinks: false } })), false)
  assert.equal(prefetchLinksOf(site({ router: { prefetchLinks: true } })), true)
  assert.equal(prefetchLinksOf(site({ title: 'x' })), null)
  // 文章內文提到 prefetchLinks 不算
  assert.equal(prefetchLinksOf('<p>"prefetchLinks":false</p>'), null)
})

/** 照 config.mts 的 metaChunk: true：每頁內嵌的站點資料搬進 assets/chunks/metadata.<hash>.js，head 改引用它 */
const META_CHUNK = 'assets/chunks/metadata.abcd1234.js'
function toMetaChunk(dist, { chunk = (js) => js, keepFile = true } = {}) {
  let content = null
  for (const [f, html] of dist) {
    if (!f.endsWith('.html')) continue
    const m = /<script>(window\.__VP_SITE_DATA__=[\s\S]*?)<\/script>/.exec(html)
    if (!m) continue
    content = m[1]
    dist.set(f, html.replace(m[0], `<script type="module" src="/${META_CHUNK}"></script>`))
  }
  assert.ok(content, '測試世界的頁面要有內嵌的站點資料')
  if (keepFile) dist.set(META_CHUNK, chunk(content))
}

test('metaChunk: true：站點資料在 head 引用的 metadata chunk 裡，照樣檢查 router.prefetchLinks', async () => {
  const r = await audit((dist) => toMetaChunk(dist))
  assert.equal(r.ok, true, formatReport(r))
  assert.match(check(r, 'layout').summary, /關掉預抓 [1-9]\d* 頁/)
  const on = (js) => js.replace('\\"prefetchLinks\\":false', '\\"prefetchLinks\\":true')
  assertFails(await audit((dist) => toMetaChunk(dist, { chunk: on })), ['layout'], /的站點資料 router\.prefetchLinks 是 true/)
  assertFails(await audit((dist) => toMetaChunk(dist, { keepFile: false })), ['layout'], /引用 \/assets\/chunks\/metadata\.abcd1234\.js，dist 裡沒有這支/)
  assert.equal(metaChunkOf(`<head><script type="module" src="/${META_CHUNK}"></script></head><body></body>`), META_CHUNK)
  // 只認 head 裡的；內嵌的頁面是 null
  assert.equal(metaChunkOf(`<head></head><body><script type="module" src="/${META_CHUNK}"></script></body>`), null)
  assert.equal(metaChunkOf('<head><script>window.__VP_SITE_DATA__=JSON.parse("{}")</script></head>'), null)
})

test('文章側欄：少了側欄、放了廣告或「廣告版位」、相關文章連到不存在的頁、超過 5 篇', async () => {
  const OTHER = '/life/2015/01/08/2014-year-report/'
  const aside = (h) => regionsOf(h, 'aside', 'post-aside')[0].html
  assertFails(await audit(edit(POST, (h) => h.replace(aside(h), ''))), ['sidebar'], /css-selector\/ 沒有側欄/)
  // <ins class="adsbygoogle"> 兩邊都擋（廣告檢查看全頁，側欄檢查看側欄）；不是 ins 的 adsbygoogle 與佔位框只有側欄檢查擋
  assertFails(await audit(edit(POST, (h) => h.replace('</aside>', '<ins class="adsbygoogle" data-ad-slot="1"></ins></aside>'))), ['sidebar', 'ads'], /adsbygoogle/)
  assertFails(await audit(edit(POST, (h) => h.replace('</aside>', '<div class="adsbygoogle"></div></aside>'))), ['sidebar'], /側欄有 adsbygoogle/)
  assertFails(await audit(edit(POST, (h) => h.replace('</aside>', '<section><h2>贊助</h2><div class="ad">廣告版位<br>Google AdSense</div></section></aside>'))), ['sidebar'], /「廣告版位」佔位框/)
  assertFails(await audit(edit(POST, (h) => h.replace(`href="${OTHER}"`, 'href="/life/2015/01/09/gone/"'))), ['sidebar'], /連到不存在的網址 \/life\/2015\/01\/09\/gone\//)
  const many = Array.from({ length: SIDEBAR_RELATED_MAX + 1 }, () => `<li><a href="${OTHER}">x</a></li>`).join('')
  const over = await audit(edit(POST, (h) => h.replace('<ol class="side-related__list">', `<ol class="side-related__list">${many}`)))
  assertFails(over, ['sidebar'], /相關文章，上限 5/)
  assert.ok(check(over, 'sidebar').failures.some((f) => /相關文章有重複/.test(f)))
  assert.equal(SIDEBAR_RELATED_MAX, SIDEBAR_RELATED_COUNT)
})

test('文章側欄：在本文指紋範圍裡、跟上下篇或接著讀重複、連回本篇、目錄連到不存在的標題、另開分頁沒有 noopener、沒有 aria-label', async () => {
  const OTHER = '/life/2015/01/08/2014-year-report/'
  const move = (h) => {
    const a = regionsOf(h, 'aside', 'post-aside')[0].html
    return h.replace(a, '').replace('<div class="post-foot"', `${a}<div class="post-foot"`)
  }
  const inside = await audit(edit(POST, move))
  assert.ok(check(inside, 'sidebar').failures.some((f) => /在本文指紋範圍/.test(f)), check(inside, 'sidebar').failures.join('\n'))
  const nav = `<nav class="post-nav" aria-label="上一篇與下一篇"><a class="c3d post-nav__item" href="${OTHER}">較舊一篇</a></nav>`
  assertFails(await audit(edit(POST, (h) => h.replace('<div class="fb-comments"', `${nav}<div class="fb-comments"`))), ['sidebar'], /跟上一篇、下一篇或接著讀重複/)
  const next = `<section class="related" aria-label="接著讀"><h2>接著讀</h2><a class="c3d related__card" href="${OTHER}">x</a></section>`
  assertFails(await audit(edit(POST, (h) => h.replace('</article>', `</article>${next}`))), ['sidebar'], /跟上一篇、下一篇或接著讀重複/)
  assertFails(await audit(edit(POST, (h) => h.replace(`href="${OTHER}"`, `href="${POST_URL}"`))), ['sidebar'], /相關文章連回本篇/)
  assertFails(await audit(edit(POST, (h) => h.replace(/(class="post-toc__link" href=")#[^"]+"/, '$1#no-such-heading"'))), ['sidebar'], /連到不存在的標題 #no-such-heading/)
  assertFails(await audit(edit(POST, (h) => h.replace('href="https://github.com/wcc723" target="_blank" rel="noopener"', 'href="https://github.com/wcc723" target="_blank"'))), ['sidebar'], /沒有 rel="noopener"/)
  assertFails(await audit(edit(POST, (h) => h.replace('aria-label="文章側欄"', ''))), ['sidebar'], /沒有 aria-label/)
})

test('分類：categories/css/ 小寫資料夾、不在白名單的分類', async () => {
  assertFails(await audit((d) => d.set('categories/css/index.html', d.get('tags/vue/index.html'))), ['categories', 'urls'], /categories\/css\/|未預期/)
  const r = await audit((d) => d.set('categories/rust/index.html', d.get('tags/vue/index.html')))
  assert.ok(check(r, 'categories').failures.some((f) => /不在白名單：categories\/rust\//.test(f)))
})

test('模板殘留：{% raw %}、<code> 以外的 {{、http 的 iframe、--lts 被轉成破折號', async () => {
  assertFails(await audit(edit(POST, (h) => h.replace('<div class="prose" data-v-7a1b2c3d><div>', '<div class="prose" data-v-7a1b2c3d><div><p>{% raw %}</p>'))), ['templates'], /\{%/)
  assertFails(await audit(edit('css/2013/09/29/css-target/index.html', (h) => h.replace('</footer>', '{{ site.url }}</footer>'))), ['templates'], /以外有 \{\{/)
  assertFails(await audit(edit(POST, (h) => h.replace('</footer>', '<iframe src="//codepen.io/x"></iframe></footer>'))), ['templates'], /iframe src 不是 https：\/\/codepen.io\/x/)
  assertFails(await audit(edit('development/2022/01/10/install-nvm/index.html', (h) => h.replace('--lts', '–lts'))), ['templates'], /--lts 被轉成破折號/)
  assertFails(await audit(edit('development/2022/01/10/install-nvm/index.html', (h) => h.replaceAll('{{ version }}', ''))), ['templates'], /nvm install \{\{ version \}\}/)
})

test('主題 chunk：超過上限、裡面有文章摘要（含 \\u 跳脫的寫法）', async () => {
  assertFails(await audit(null, { limits: { themeChunk: 10 } }), ['chunks'], /超過上限 10/)
  const desc = REAL.byUrl.get(POST_URL).description.slice(0, 30)
  assertFails(await audit(edit('assets/chunks/theme.Dx9.js', (x) => `${x}const d="${desc}"`)), ['chunks'], /theme.Dx9.js 裡有 \d+ 段文章資料/)
  const escaped = [...desc].map((ch) => (ch.charCodeAt(0) > 0x7e ? '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0') : ch)).join('')
  assertFails(await audit(edit('assets/app.Bc12xY.js', (x) => `${x}const d="${escaped}"`)), ['chunks'], /app.Bc12xY.js 裡有/)
  assertFails(await audit((d) => d.delete('assets/chunks/theme.Dx9.js')), ['chunks'], /應該剛好 1 個/)
})

test('repo：有 wrangler.jsonc 或 _config.yml 就失敗，npm scripts 不能再呼叫 hexo', async () => {
  assertFails(await audit((d, w) => w.rootFiles.set('wrangler.jsonc', '{}')), ['repo'], /wrangler.jsonc/)
  assertFails(await audit((d, w) => w.rootFiles.set('_config.yml', 'title: x')), ['repo'], /_config.yml/)
  assertFails(await audit((d, w) => w.rootFiles.set('package.json', JSON.stringify({ scripts: { deploy: 'hexo d' } }))), ['repo'], /hexo/)
  const ok = await audit((d, w) => w.rootFiles.set('package.json', JSON.stringify({ scripts: { migrate: 'node scripts/migrate-hexo.mjs' } })))
  assert.equal(ok.checks.find((x) => x.id === 'repo').ok, true, '檔名裡有 hexo 不算呼叫 hexo')
})

test('callsHexo：只認 hexo 這個指令，不認檔名', () => {
  for (const s of ['hexo d', 'hexo g -d', 'npx hexo clean', 'npm run x && hexo generate', 'hexo', '(hexo s)']) assert.equal(callsHexo(s), true, s)
  for (const s of ['node scripts/migrate-hexo.mjs', 'vitepress build source', 'node hexo-baseline.mjs', 'echo hexo-2026-11-03']) assert.equal(callsHexo(s), false, s)
})

test('凍結檔：ads.txt 被改、少了舊主題的 css', async () => {
  assertFails(await audit((d) => d.set('ads.txt', 'google.com, pub-0, DIRECT\n')), ['frozen-files'], /ads.txt 跟基準不同/)
  assertFails(await audit((d) => d.delete('css/style.css')), ['frozen-files', 'urls'], /dist 沒有 css\/style.css|基準網址不在 dist：\/css\/style.css/)
})

test('JSON-LD：解析失敗、文章少了 BlogPosting、datePublished 不對、首頁多了 JSON-LD', async () => {
  assertFails(await audit(edit(POST, (h) => h.replace('</head>', '<script type="application/ld+json">{oops</script>\n</head>'))), ['jsonld'], /解析失敗/)
  assertFails(await audit(edit(POST, (h) => h.replace('"@type":"BlogPosting"', '"@type":"Article"'))), ['jsonld'], /少了 JSON-LD BlogPosting/)
  assertFails(await audit(edit(POST, (h) => h.replace('"datePublished":"2021-09-11T00:00:00+08:00"', '"datePublished":"2021-09-11"'))), ['jsonld'], /datePublished/)
  assertFails(await audit(edit('index.html', (h) => h.replace('</head>', '<script type="application/ld+json">{"@type":"WebSite"}</script>\n</head>'))), ['jsonld'], /P2 不輸出 JSON-LD/)
})

test('讀不到基準 HTML（沒 fetch 基準 commit）時，用到它的檢查失敗並說明怎麼補', async () => {
  const w = buildWorld()
  try {
    const { baselineHtml, ...opts } = w.opts
    const r = await runAudit({ ...opts, root: w.root })
    assert.equal(r.ok, false)
    for (const id of ['lists', 'content']) assert.ok(check(r, id).failures.some((f) => /git fetch|讀不到基準/.test(f)), id)
    assert.match(r.baseline.html, /git fetch --no-tags --depth=1 origin fixture|不是 git|讀不到/)
  } finally {
    w.cleanup()
  }
})

// --- 真實基準上的資料 ------------------------------------------------------------

test('FIXED_ANCHORS 等於從基準 pages.json 查出的 23 個（16 個 smartypants、7 個跳脫片段）', () => {
  const found = []
  for (const p of REAL.pages) for (const id of p.headingIds) {
    if (/[‘’“”…–—]/.test(id) || /(^|-)(amp|gt|lt|quot)(-|$)/.test(id)) found.push([p.url, id])
  }
  assert.equal(found.length, 23)
  assert.deepEqual(new Set(FIXED_ANCHORS.map((x) => x.join('#'))), new Set(found.map((x) => x.join('#'))))
})

test('legacyUrlFix：只改 /categories/css/ 與三個大寫標籤', () => {
  assert.equal(legacyUrlFix('https://www.casper.tw/categories/css/page/2/'), 'https://www.casper.tw/categories/CSS/page/2/')
  assert.equal(legacyUrlFix('/categories/css/'), '/categories/CSS/')
  assert.equal(legacyUrlFix('/tags/Sass/'), '/tags/sass/')
  assert.equal(legacyUrlFix('https://www.casper.tw/tags/Vue/'), 'https://www.casper.tw/tags/vue/')
  for (const u of ['/css/2013/10/20/Vertical-write/', '/categories/css-x/', '/tags/Sassy/', '/tags/Claude-Code/', '/categories/CSS/']) assert.equal(legacyUrlFix(u), u)
})

test('expectedSitemap：真實基準 468 個 - 3 個大寫標籤 + 4 個新頁 = 469 個', () => {
  const s = expectedSitemap(REAL.sitemap)
  assert.equal(s.size, 469)
  assert.ok(s.has('https://www.casper.tw/categories/CSS/'))
  assert.ok(!s.has('https://www.casper.tw/categories/css/'))
  for (const t of ['Sass', 'Bootstrap', 'Vue']) assert.ok(!s.has(`https://www.casper.tw/tags/${t}/`))
  for (const u of ['/categories/', '/privacy/', '/contact/', '/terms/', '/tags/sass/']) assert.ok(s.has('https://www.casper.tw' + u), u)
})

test('expectedContentEntry：364 筆；大寫標籤改小寫，css 分類的 permalink 改大寫，其餘不動', () => {
  const all = REAL.content.map(expectedContentEntry)
  assert.equal(all.length, 364)
  const zip = all.find((p) => p.path === 'development/2026/07/16/taiwan-zipcode-side-project/')
  assert.deepEqual(zip.tags[0], { name: 'vue', slug: 'vue', permalink: 'https://www.casper.tw/tags/vue/' })
  const css = all.find((p) => p.categories[0].name === 'css')
  assert.equal(css.categories[0].permalink, 'https://www.casper.tw/categories/CSS/')
  assert.equal(css.categories[0].slug, 'css')
  const merged = { sass: 71, bootstrap: 17, vue: 4 }
  for (const [t, n] of Object.entries(merged)) assert.equal(all.filter((p) => p.tags.some((x) => x.name === t)).length, n, t)
  assert.equal(canonicalJson({ b: 1, a: [1, { d: 2, c: 3 }] }), '{"a":[1,{"c":3,"d":2}],"b":1}')
})

test('atomEntries：真實基準 20 筆，id 與 link 是含尾斜線的完整網址', () => {
  const e = atomEntries(REAL.atom)
  assert.equal(e.length, 20)
  assert.deepEqual(e[0], { id: 'https://www.casper.tw/development/2026/10/05/security-habits/', link: 'https://www.casper.tw/development/2026/10/05/security-habits/', published: '2026-10-04T16:00:00.000Z' })
})

test('白名單：每條都有理由，指到的網址在基準裡；NEW_URLS 只放行計畫列的新網址', () => {
  for (const e of [...TEXT_EXPECTED, ...TEMPLATE_ALLOW, ...PROFILE_EXPECTED]) {
    assert.ok(e.reason && e.reason.length > 10, JSON.stringify(e))
    assert.ok(REAL.byUrl.has(encodeURI(e.url)), e.url)
  }
  for (const e of PROFILE_EXPECTED) assert.ok(e.field in PROFILE_LABEL || e.field in PROFILE_SEQUENCE_LABEL, `${e.url} 的 field「${e.field}」不是內容輪廓的欄位`)
  const allowed = (u) => NEW_URLS.some((r) => r.test(u))
  for (const u of ['/categories/', '/privacy/', '/contact/', '/terms/', '/404.html', '/404', '/tags/sass/page/8/', '/tags/bootstrap/page/2/', '/assets/app.x.js', '/hashmap.json', '/vp-icons.css']) assert.ok(allowed(u), u)
  for (const u of ['/tags/css/page/99/', '/foo/', '/categories/css/', '/tags/Sass/', '/_headers', '/sitemap-index.xml', '/.nojekyll']) assert.ok(!allowed(u), u)
  assert.equal(THEME_CHUNK_MAX, 122880)
})

test('分類白名單只有一份：theme/shared/data/categories.json，舊的 scripts/data/categories.json 已刪', () => {
  assert.equal(CATEGORIES_FILE, 'source/.vitepress/theme/shared/data/categories.json')
  assert.equal(fs.existsSync(path.join(ROOT, 'scripts/data/categories.json')), false)
  assert.equal(JSON.parse(fs.readFileSync(path.join(ROOT, CATEGORIES_FILE), 'utf8')).categories.length, 27)
})

test('theme/shared/data/categories.json 跟 workspace 的 config/reserved-paths.json 一致', { skip: !fs.existsSync(path.resolve(ROOT, '../../config/reserved-paths.json')) && '找不到 workspace' }, () => {
  const mine = JSON.parse(fs.readFileSync(path.join(ROOT, CATEGORIES_FILE), 'utf8'))
  const src = JSON.parse(fs.readFileSync(path.resolve(ROOT, '../../config/reserved-paths.json'), 'utf8'))
  assert.deepEqual(mine.categories, src.categories)
  assert.equal(mine.categories.length, 27)
})

test('CLI：--print-baseline-commit 印出基準 commit；--dist 指到測試世界會寫報告並 exit 1；找不到 dist 時說明', () => {
  const script = path.join(ROOT, 'scripts/audit-build.mjs')
  const commit = spawnSync(process.execPath, [script, '--print-baseline-commit'], { encoding: 'utf8' })
  assert.equal(commit.status, 0)
  assert.equal(commit.stdout.trim(), REAL.commit)
  assert.equal(path.basename(latestBaselineDir(ROOT)), 'hexo-2026-11-03')
  const w = buildWorld()
  const report = path.join(os.tmpdir(), `audit-report-${process.pid}.json`)
  try {
    // 測試世界的 commit 是假的、文章索引是真的 source/，不會通過；這裡只驗 CLI 的接線
    const r = spawnSync(process.execPath, [script, '--dist', w.opts.distDir, '--baseline', w.opts.baselineDir, '--report', report], { encoding: 'utf8' })
    assert.equal(r.status, 1, r.stderr)
    assert.match(r.stdout, /^audit-build：/)
    assert.match(r.stdout, /結果：失敗/)
    assert.equal(JSON.parse(fs.readFileSync(report, 'utf8')).ok, false)
  } finally {
    w.cleanup()
    fs.rmSync(report, { force: true })
  }
  const missing = spawnSync(process.execPath, [script, '--dist', path.join(os.tmpdir(), 'no-such-dist-xyz')], { encoding: 'utf8' })
  assert.equal(missing.status, 1)
  assert.match(missing.stderr, /找不到 dist/)
  const bad = spawnSync(process.execPath, [script, '--nope'], { encoding: 'utf8' })
  assert.equal(bad.status, 1)
  assert.match(bad.stderr, /不認得的參數/)
})

// ============================================================================
// 外語首頁與全站工具清單（主站首頁規格 J.1）
// ============================================================================

const EN = 'en/index.html'
const HOME = 'index.html'
const at = (stage) => (mutate, extra = {}) => audit(mutate, extra, stage)
const p1 = at('p1')
const s = at('s')
const i1 = at('i1')
const multi = at('multi')
const feature = at('feature')
/** feature 世界，但 tools.json 換成 toolsIndex（產物照它產生，資料與 HTML 一致） */
const featureWith = (toolsIndex, mutate = null) => audit(mutate, {}, 'feature', { toolsIndex })

test('S 之後、I1 之後、多語、介紹區塊四份世界：20 項全部通過', async () => {
  for (const [stage, run] of [['s', s], ['i1', i1], ['multi', multi], ['feature', feature]]) {
    const r = await run()
    assert.equal(r.ok, true, `${stage}\n${formatReport(r)}`)
    assert.equal(r.checks.length, 20)
  }
  const r = await i1()
  assert.deepEqual(check(r, 'locales').stats.published, ['en'])
  assert.equal(check(r, 'locales').stats.homes, 1)
  assert.ok(check(r, 'tools').stats.compared > 10)
  assert.ok(r.expected.some((e) => /外語首頁/.test(e.reason)))
})

test('checkLocales 的摘要用量到的數字，不從 plan 推：P1 是全部 zh-TW、0 頁 hreflang；改壞時摘要跟著變', async () => {
  const ok = check(await p1(), 'locales')
  assert.equal(ok.stats.zh, ok.stats.pages)
  assert.equal(ok.stats.hreflang, 0)
  assert.equal(ok.stats.menu, 0)
  assert.match(ok.summary, new RegExp(`沒有外語首頁（home\\.locales 是空的），shell legacy；量到 ${ok.stats.pages} 頁裡 ${ok.stats.pages} 頁是 zh-TW、0 頁有 hreflang、0 頁有語言選單`))
  const bad = check(await p1(edit(POST, (h) => h.replace('</head>', '<link rel="alternate" hreflang="en" href="https://www.casper.tw/en/">\n</head>'))), 'locales')
  assert.equal(bad.stats.hreflang, 1)
  assert.match(bad.summary, /、1 頁有 hreflang、/)
  const multiLocales = check(await i1(), 'locales')
  assert.equal(multiLocales.stats.zh, multiLocales.stats.pages - 1)
  assert.match(multiLocales.summary, /^外語首頁 \/en\/，shell shared；量到/)
})

test('checkUrls：外語首頁只在 plan.published 時放行', () => {
  assert.equal(siteHomeUrlRule([]).test('/en/'), false)
  assert.equal(siteHomeUrlRule(['en']).test('/en/'), true)
  assert.equal(siteHomeUrlRule(['en']).test('/ja/'), false)
  assert.equal(siteHomeUrlRule(['en']).test('/en/index.html'), false)
  assert.equal(NEW_URLS.some((r) => r.test('/en/')), false)
})

test('L1：外語首頁的 <html lang> 是 htmlLang(code)，其他是 zh-TW', async () => {
  assertFails(await i1(edit(EN, (h) => h.replace('<html lang="en"', '<html lang="zh-TW"'))), ['locales'], /L1：\/en\/ 的 <html lang> 是 「zh-TW」，要是 en/)
  assertFails(await i1(edit(POST, (h) => h.replace('<html lang="zh-TW"', '<html lang="en"'))), ['locales', 'pages'], /L1：.*css-selector.*要是 zh-TW|lang：預期/)
})

test('L2：外語首頁底下不放子頁，沒上線的語系不能有資料夾', async () => {
  assertFails(await i1((d) => d.set('en/notes.txt', 'x')), ['locales', 'urls'], /這份規格範圍內外語首頁底下不放子頁，要加子頁另開規格|未預期的新網址/)
  assertFails(await i1((d) => d.delete(EN)), ['locales'], /L2：dist 沒有 en\/|L3：dist 沒有 \/en\//)
  assertFails(await p1((d) => d.set('zh-tw/robots.txt', 'x')), ['locales', 'urls'], /\/zh-tw\/ 不產生|未預期的新網址/)
})

test('L3：外語首頁的 head 值與順序、DOM 契約', async () => {
  assertFails(await i1(edit(EN, (h) => h.replace(/property="og:title" content="[^"]*"/, 'property="og:title" content="Tools"'))), ['locales'], /L3：\/en\/ 的 head 跟 D\.2 的值與順序不同/)
  // canonical 搬到 og:url 後面：值都對，順序不對
  assertFails(await i1(edit(EN, (h) => {
    const canonical = /<link rel="canonical"[^>]*>\n?/.exec(h)[0]
    return h.replace(canonical, '').replace(/(<meta property="og:url"[^>]*>)/, `$1\n${canonical}`)
  })), ['locales'], /第 3 項預期 「canonical=https:\/\/www\.casper\.tw\/en\/」/)
  assertFails(await i1(edit(EN, (h) => h.replace('class="b3d" href="https://www.casper.tw/en/#tools"', 'class="b3d" href="#tools"'))), ['locales'], /首屏按鈕要連 https:\/\/www\.casper\.tw\/en\/#tools/)
  assertFails(await i1(edit(EN, (h) => h.replace('<section class="cs-shome__articles"', '<section class="cs-shome__posts"'))), ['locales'], /\.cs-shome 的區塊是/)
  assertFails(await i1(edit(EN, (h) => h.replace(/(<a href="https:\/\/www\.casper\.tw\/about\/") hreflang="zh-Hant"/, '$1'))), ['locales'], /要是絕對網址並加 hreflang="zh-Hant"/)
  // ja 頁的站名是英文，要包 <span lang="en" data-foreign>
  assertFails(await multi(edit('ja/index.html', (h) => h.replace(/<h1 id="cs-shome-h1"><span lang="en" data-foreign>([^<]*)<\/span><\/h1>/, '<h1 id="cs-shome-h1">$1</h1>'))), ['locales'], /要包 <span lang="en" data-foreign>/)
})

test('L4、L5：hreflang 叢集與 og:locale:alternate', async () => {
  assertFails(await i1(edit(HOME, (h) => h.replace(/<link rel="alternate" hreflang="zh"[^>]*>\n?/, ''))), ['locales'], /L4：\/ 的 hreflang 跟首頁叢集不同：少了 zh=https:\/\/www\.casper\.tw\/|hreflang="zh" 指 \//)
  assertFails(await i1(edit(EN, (h) => h.replace('hreflang="x-default" href="https://www.casper.tw/en/"', 'hreflang="x-default" href="https://www.casper.tw/"'))), ['locales'], /x-default 要是 https:\/\/www\.casper\.tw\/en\/|L3/)
  assertFails(await i1(edit(POST, (h) => h.replace('</head>', '<link rel="alternate" hreflang="en" href="https://www.casper.tw/en/">\n</head>'))), ['locales'], /不在首頁叢集，不能有 link\[hreflang\]/)
  assertFails(await p1(edit(HOME, (h) => h.replace('</head>', '<link rel="alternate" hreflang="en" href="https://www.casper.tw/en/">\n</head>'))), ['locales'], /L4：\/ 的 hreflang 跟首頁叢集不同：多了 en=/)
  assertFails(await i1(edit(HOME, (h) => h.replace(/<meta property="og:locale:alternate"[^>]*>\n?/, ''))), ['locales'], /L5：\/ 的 og:locale:alternate 跟叢集裡的其他語系不同/)
})

test('L6：sitemap 有外語首頁，沒有 xhtml:link', async () => {
  assertFails(await i1(edit('sitemap.xml', (x) => x.replace('<url><loc>https://www.casper.tw/en/</loc></url>', ''))), ['locales', 'feeds'], /L6：sitemap 少了外語首頁|sitemap 少了 https:\/\/www\.casper\.tw\/en\//)
  assertFails(await i1(edit('sitemap.xml', (x) => x.replace('<url><loc>https://www.casper.tw/en/</loc></url>', '<url><loc>https://www.casper.tw/en/</loc><xhtml:link rel="alternate" hreflang="en" href="https://www.casper.tw/en/"/></url>'))), ['locales'], /不放 xhtml:link/)
})

test('L7：dist 沒有 preview 的痕跡，外語首頁沒有 robots meta', async () => {
  assertFails(await i1(edit(EN, (h) => h.replace('page-type-site-home"', 'page-type-site-home cs-preview"'))), ['locales'], /L7：\/en\/ 有 preview 的 class/)
  assertFails(await i1(edit(EN, (h) => h.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<meta name="robots" content="noindex, nofollow">'))), ['locales'], /L7：\/en\/ 有 robots meta/)
})

// 2026-11-05 build:preview 的 head 裡真的長這樣（VitePress 用 esbuild 壓縮過，變數名稱換掉、註解拿掉）
const MINIFIED_PREVIEW_LINKS = '(()=>{const n="https://www.casper.tw/";location.hostname!=="www.casper.tw"&&document.addEventListener("click",t=>{if(t.defaultPrevented||t.button!==0||t.metaKey||t.ctrlKey||t.shiftKey||t.altKey)return;const e=t.target instanceof Element&&t.target.closest("a[href]");if(!e||e.target==="_blank")return;const r=e.getAttribute("href");!r||!r.startsWith(n)||(t.preventDefault(),t.stopImmediatePropagation(),location.href=location.origin+r.slice(n.length-1))},!0)})();'
/** previewLinkScript() 經過 VitePress 同一個壓縮（renderHead 的 transformWithEsbuild minify）；vite 載不到時回 null */
async function minifiedPreviewLinks() {
  try {
    const { transformWithEsbuild } = await import('vite')
    return (await transformWithEsbuild(previewLinkScript(undefined, ['sound-effects']), 'inline-script.js', { minify: true })).code.trim()
  } catch {
    return null
  }
}

test('previewLinkScriptsIn：認得原字串、VitePress 壓縮過的寫法與記號；其他 head 腳本與程式碼區塊不算', async () => {
  const fresh = await minifiedPreviewLinks()
  // 拿掉 /*! … */ 記號的版本也要認得：記號只是輔助，靠的是壓縮後不會變的片段
  const bare = fresh?.replace(/\/\*![\s\S]*?\*\//g, '')
  if (fresh) assert.ok(fresh.includes(PREVIEW_LINKS_TOKEN), `VitePress 壓縮後記號要留著：${fresh.slice(0, 60)}`)
  for (const js of [previewLinkScript(), previewLinkScript(undefined, ['sound-effects']), MINIFIED_PREVIEW_LINKS, fresh, bare].filter(Boolean)) {
    assert.equal(previewLinkScriptsIn(`<head><meta charset="utf-8">\n<script>${js}</script>\n</head>`).length, 1, js)
  }
  assert.equal(previewLinkScriptsIn(`<script data-${PREVIEW_LINKS_TOKEN}>x()</script>`).length, 1)
  assert.equal(previewLinkScriptsIn(`<script>/*! ${PREVIEW_LINKS_TOKEN} */(()=>{})()</script>`).length, 1)
  // 正式產物的 head 腳本（GA4 只在 www 上載入、主題切換）不算
  assert.deepEqual(previewLinkScriptsIn('<script>(function(){if(location.hostname==="www.casper.tw"){var t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js"}})();</script><script>(function(){try{var t=localStorage.getItem("casper-theme")}catch{}})();</script>'), [])
  // 文章裡的程式碼區塊照字面寫出同一段也不算（不在 <script> 裡）
  assert.deepEqual(previewLinkScriptsIn(`<pre><code>${MINIFIED_PREVIEW_LINKS.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</code></pre>`), [])
  // 只有一部分片段的腳本不算
  assert.deepEqual(previewLinkScriptsIn('<script>location.href=location.origin+p.slice(1)</script>'), [])
})

test('L7：preview 的站內連結腳本（lib/preview-links.mjs）不能進 dist，P1 與外語首頁都驗', async () => {
  const js = (await minifiedPreviewLinks()) ?? MINIFIED_PREVIEW_LINKS
  assertFails(await p1(edit(POST, (h) => h.replace('</head>', `<script>${js}</script>\n</head>`))), ['locales'], /L7：\/development\/2021\/09\/11\/css-selector\/ 有 preview 的站內連結腳本/)
  assertFails(await p1(edit('404.html', (h) => h.replace('</head>', `<script>${MINIFIED_PREVIEW_LINKS}</script>\n</head>`))), ['locales'], /L7：\/404\.html 有 preview 的站內連結腳本/)
  assertFails(await i1(edit(EN, (h) => h.replace('</head>', `<script>${js}</script>\n</head>`))), ['locales'], /L7：\/en\/ 有 preview 的站內連結腳本/)
})

test('L8：S 起 404 不 hydrate；I1 起 404 有多語提示', async () => {
  assertFails(await s(edit('404.html', (h) => h.replace('</head>', '<script type="module" src="/assets/app.Bc12xY.js"></script>\n</head>'))), ['locales'], /404 有 <script type="module">/)
  assertFails(await s(edit('404.html', (h) => h.replace('</head>', '<link rel="modulepreload" href="/assets/chunks/theme.Dx9.js">\n</head>'))), ['locales'], /modulepreload/)
  assertFails(await s(edit('404.html', (h) => h.replace('<h1>這頁找不到</h1>', '<h1>這頁找不到</h1><button type="button">搜尋文章</button>'))), ['locales'], /404 的 <main> 裡有 <button>/)
  // P1 的 404 會 hydrate（還是 VitePress 內建的 404），不驗
  assert.equal((await p1(edit('404.html', (h) => h.replace('</head>', '<script type="module" src="/assets/app.Bc12xY.js"></script>\n</head>')))).ok, true)
  assertFails(await i1(edit('404.html', (h) => h.replace(/<ul class="cs-404__intl">[\s\S]*?<\/ul>/, ''))), ['locales'], /L8：404 的多語提示要剛好列出 en/)
  assertFails(await i1(edit('404.html', (h) => h.replace('<li lang="en">', '<li>'))), ['locales'], /多語提示要剛好列出 en，實際 （沒有 lang）/)
})

test('L9：繁中頁的語言選單是繁中加 plan.published，每個連結有 hreflang 與 lang', async () => {
  assertFails(await i1(edit(POST, (h) => h.replace(/<details class="cs-lang"[\s\S]*?<\/details>/, ''))), ['locales'], /L9：.*沒有語言選單/)
  assertFails(await i1(edit(POST, (h) => h.replace(/(<details class="cs-lang"[\s\S]*?)<span class="cs-lang__note"> \(home page\)<\/span>/, '$1'))), ['locales'], /L9：.*跟 languageTargets\(\) 不同/)
  assertFails(await i1(edit(POST, (h) => h.replace(/(<details class="cs-lang"[\s\S]*?) hreflang="en"/, '$1'))), ['locales'], /要有 hreflang 與 lang|跟 languageTargets/)
  assertFails(await i1(edit('404.html', (h) => h.replace('<div class="cs-hdr__tools">', '<div class="cs-hdr__tools"><details class="cs-lang"><ul></ul></details>'))), ['locales'], /404 用多語提示/)
})

test('L10：site-card.json 等於 { shell, siteHomes: plan.published }；tools.json 的 siteHomes 是子集', async () => {
  assertFails(await i1((d, w) => w.rootFiles.set('site-card.json', JSON.stringify({ schema: 1, shell: 'shared', siteHomes: [] }))), ['locales'], /L10：site-card\.json 的 siteHomes/)
  assertFails(await p1((d, w) => w.rootFiles.set('site-card.json', JSON.stringify({ schema: 1, shell: 'shared', siteHomes: [] }))), ['locales'], /L10：site-card\.json 的 shell/)
  assertFails(await p1((d, w) => w.rootFiles.delete('site-card.json')), ['locales'], /沒有 site-card\.json/)
  assertFails(await i1(null, { toolsIndex: { ...I1_INDEX, siteHomes: ['en', 'ja'] } }), ['locales'], /tools\.json 的 siteHomes 有 ja/)
  // tools.json 落後一版（還沒有 en）是正常的
  assert.equal((await i1(null, { toolsIndex: { ...I1_INDEX, siteHomes: [] } })).ok, true)
})

test('L11：外語首頁的 AdSense loader 照 shouldLoadAds；沒有 FB Pixel、article:author；GA4 是 site-home 加 page_locale', async () => {
  const loader = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8296684122088055" crossorigin="anonymous"></script>'
  // site-home 跟繁中首頁一樣是 standardOnly（站長 2026-11-04，0008 更正第 9 點）：standard 要有一個 loader，allowlist 要沒有
  assert.equal(shouldLoadAds({ type: 'site-home' }, 'standard'), true)
  assert.equal(shouldLoadAds({ type: 'site-home' }, 'allowlist'), false)
  let enHtml = ''
  assert.equal((await i1((d) => { enHtml = d.get(EN) })).ok, true)
  assert.equal(countAdsLoaders(enHtml), 1, 'I1 世界的 /en/ 有一個 loader')
  assertFails(await i1(edit(EN, (h) => h.replace(loader, ''))), ['locales', 'ads'], /L11：\/en\/ 要載一次 AdSense loader（ADS_MODE standard），找到 0 個|（site-home）應該載入 loader/)
  assertFails(await i1(edit(EN, (h) => h.replace('</head>', `${loader}\n</head>`))), ['locales', 'ads'], /L11：\/en\/ 要載一次 AdSense loader（ADS_MODE standard），找到 2 個|loader 出現 2 次/)
  const allow = await i1(null, { adsMode: 'allowlist' })
  assert.ok(check(allow, 'locales').failures.some((f) => /L11：\/en\/ 不該載 AdSense loader（ADS_MODE allowlist）/.test(f)), check(allow, 'locales').failures.join('\n'))
  assert.ok(check(allow, 'ads').failures.some((f) => /\/en\/（site-home）不該載入 loader/.test(f)), check(allow, 'ads').failures.join('\n'))
  assert.equal((await i1(edit(EN, (h) => h.replace(loader, '')), { adsMode: 'allowlist' }).then((r) => check(r, 'locales').failures.filter((f) => /L11/.test(f)))).length, 0, 'allowlist 時沒有 loader 的 /en/ 過 L11')
  assertFails(await i1(edit(EN, (h) => h.replace('</head>', "<script>!function(){var s=document.createElement('script');s.src='https://connect.facebook.net/en_US/fbevents.js'}()</script>\n</head>"))), ['locales'], /有 FB Pixel/)
  assertFails(await i1(edit(EN, (h) => h.replace('</head>', '<meta property="article:author" content="Wang Casper">\n</head>'))), ['locales'], /有 article:author/)
  assertFails(await i1(edit(EN, (h) => h.replace('"page_locale":"en"', '"page_locale":"zh-tw"'))), ['locales'], /GA4 要是 content_group 'site-home'、page_locale 'en'/)
  assertFails(await i1(edit(POST, (h) => h.replace('</head>', `<script>gtag('config', "G-97433H4032", {"content_group":"blog","page_locale":"zh-tw"})</script>\n</head>`))), ['locales'], /是繁中頁，GA4 不帶 page_locale/)
  // 舊的 GA4 片段是 JS 物件字面值
  assert.deepEqual(gaConfigsOf("w.gtag('config','G-97433H4032',{content_group:'blog'})"), [{ content_group: 'blog' }])
})

test('L12：外語首頁 <main> 的書寫系統，其他語言的片段要有 lang 與 data-foreign', async () => {
  assertFails(await i1(edit(EN, (h) => h.replace('<section id="about"', '<p>卡斯伯的前端筆記</p><section id="about"'))), ['locales'], /L12：\/en\/ .*no-cjk/)
  assertFails(await i1(edit(EN, (h) => h.replace('<section id="about"', '<p><span lang="ja">テスト</span></p><section id="about"'))), ['locales'], /<span lang="ja"> 跟頁面語言不同，要加 data-foreign/)
  // 包了 lang 與 data-foreign 的外語片段不算進本頁語言
  assert.equal((await i1(edit(EN, (h) => h.replace('<section id="about"', '<p><span lang="zh-Hant" data-foreign>卡斯伯</span></p><section id="about"')))).ok, true)
  assert.equal(mainTextWithoutForeign('<main><p>A <span data-foreign>中文</span> <code>x</code> b</p></main>'), 'A b')
})

test('L13：外語首頁頁尾的法務連結（隱私權、ja 的外部送信、de 的 Impressum 豁免）', async () => {
  assertFails(await i1(edit(EN, (h) => h.replace(/<li><a href="https:\/\/www\.casper\.tw\/site-policies\/privacy\/"[^>]*>[^<]*<\/a><\/li>/, ''))), ['locales'], /L13：\/en\/ 的頁尾沒有連到 https:\/\/www\.casper\.tw\/site-policies\/privacy\/ 的隱私權連結/)
  assertFails(await i1(edit(EN, (h) => h.replace('hreflang="en">Privacy policy', 'hreflang="zh-Hant">Privacy policy'))), ['locales'], /隱私權連結 hreflang 是 「zh-Hant」，要是 en/)
  assertFails(await i1(edit(EN, (h) => h.replace('hreflang="en">Privacy policy</a>', 'hreflang="en">Privacy policy (in Traditional Chinese)</a>'))), ['locales'], /連結字不該有繁中標示/)
  assertFails(await multi(edit('ja/index.html', (h) => h.replace(/<li><a href="https:\/\/www\.casper\.tw\/site-policies\/ja\/privacy\/#external"[^>]*>[^<]*<\/a><\/li>/, ''))), ['locales'], /L13：\/ja\/ 的頁尾沒有 externalTransmission 連結/)
  assertFails(await multi(edit('de/index.html', (h) => h.replace('</ul><p class="cs-ftr__copy">', '<li><a href="https://www.casper.tw/site-policies/de/impressum/" hreflang="de">Impressum</a></li></ul><p class="cs-ftr__copy">'))), ['locales'], /L13：\/de\/ 的 impressum 是站長豁免（LEGAL_DECISIONS），頁尾不該有這個連結/)
})

test('T1：首頁與外語首頁的 #tools、每頁頁尾的工具組等於 siteToolLinks()', async () => {
  assertFails(await i1(edit(POST, (h) => h.replace('>抽獎大師</a></li></ul></nav>', '>抽獎</a></li></ul></nav>'))), ['tools'], /T1：.*css-selector.* 的頁尾工具組 跟 siteToolLinks/)
  assertFails(await i1(edit(EN, (h) => h.replace(/<span class="cs-toolcard__sum">[^<]*<\/span>/, ''))), ['tools'], /T1：\/en\/ 的 #tools 跟 siteToolLinks\(index, \{ locale: 'en' \}\) 不同/)
  assertFails(await i1(edit(HOME, (h) => h.replace(/<section id="tools"[\s\S]*?<\/section>/, ''))), ['tools'], /T1：\/ 的 #tools/)
  assertFails(await p1(edit(POST, (h) => h.replace('</footer>', '<nav class="cs-ftr__group cs-ftr__group--tools"><a href="https://www.casper.tw/lucky-draw/">抽獎大師</a></nav></footer>'))), ['tools'], /頁尾有工具組，但 tools\.json 沒有工具/)
  // 工具卡的圖：toolCardArt() 給的小幽靈或工具自己的站徽（F.2）
  assertFails(await i1(edit(EN, (h) => h.replace('brand/ghost/s-spot3.webp', 'brand/ghost/s-spot1.webp'))), ['tools'], /T1：\/en\/ 的 #tools .*s-spot1\.webp/)
  const mark = 'https://www.casper.tw/lucky-draw/brand/card-340.webp'
  const own = { ...I1_INDEX, tools: [{ ...I1_INDEX.tools[0], ghost: undefined, mark }] }
  assertFails(await i1(null, { toolsIndex: own }), ['tools'], new RegExp(`T1：/en/ 的 #tools .*${mark.replaceAll('.', '\\.')}`))
  // multi：de 沒有 lucky-draw 的德文版，卡片退到 en，名稱包 lang="en" 並接 inEnglish 標示
  assertFails(await multi(edit('de/index.html', (h) => h.replace(/<span class="cs-toolcard__name">([^<]*)<span lang="en" data-foreign>/, '<span class="cs-toolcard__name">$1<span>'))), ['tools'], /T1：\/de\/ 的 #tools/)
})

test('T1：外語首頁的介紹區塊排在卡片前面，比介紹、重點、按鈕、主圖與小裝飾圖', async () => {
  // 世界本身：/en/ 是 sound-effects、unit-converter 兩個介紹區塊，再來 lucky-draw 一張卡；/ 只有卡片
  let en = ''
  let home = ''
  assert.equal((await feature((d) => { en = d.get(EN); home = d.get(HOME) })).ok, true)
  assert.deepEqual(toolCardsIn(en).map((l) => [l.href, l.feature ? 'feature' : 'card']), [
    ['https://www.casper.tw/sound-effects/', 'feature'], ['https://www.casper.tw/unit-converter/en/', 'feature'], ['https://www.casper.tw/lucky-draw/en/', 'card'],
  ])
  assert.ok(toolCardsIn(home).every((l) => l.feature === null) && toolCardsIn(home).length === 3)
  const T1 = /T1：\/en\/ 的 #tools 跟 siteToolLinks\(index, \{ locale: 'en' \}\) 不同/
  // 介紹、重點、按鈕字
  assertFails(await feature(edit(EN, (h) => h.replace('Thousands of short sound effects', 'Hundreds of short sound effects'))), ['tools'], T1)
  assertFails(await feature(edit(EN, (h) => h.replace('<li>Free to use, no sign-up</li>', ''))), ['tools'], T1)
  assertFails(await feature(edit(EN, (h) => h.replace('>Browse sound effects</a>', '>Browse</a>'))), ['tools'], T1)
  // 按鈕連到別支工具：T1（按鈕的連結要同卡片）；連到站外：T1 加 T2
  assertFails(await feature(edit(EN, (h) => h.replace('class="b3d cs-toolfeature__cta" href="https://www.casper.tw/sound-effects/"', 'class="b3d cs-toolfeature__cta" href="https://www.casper.tw/lucky-draw/en/"'))), ['tools'], T1)
  assertFails(await feature(edit(EN, (h) => h.replace('class="b3d cs-toolfeature__cta" href="https://www.casper.tw/sound-effects/"', 'class="b3d cs-toolfeature__cta" href="https://example.com/sfx"'))), ['tools'], /T2：\/en\/ 的工具連結 「https:\/\/example\.com\/sfx」/)
  // 主圖是 images[0]，不是站徽；尺寸照資料
  assertFails(await feature(edit(EN, (h) => h.replace('src="https://img.casper.tw/sound-effects/sfx-feature-a.webp"', 'src="https://www.casper.tw/sound-effects/brand/card-340.webp"'))), ['tools'], /T1：\/en\/ 的 #tools .*card-340\.webp/)
  assertFails(await feature(edit(EN, (h) => h.replace('sfx-feature-a.webp" alt="" width="960" height="600"', 'sfx-feature-a.webp" alt="" width="960" height="720"'))), ['tools'], T1)
  // 沒有圖的工具，主圖退回小幽靈（toolCardArt）
  assertFails(await feature(edit(EN, (h) => h.replace('brand/ghost/s-spot1.webp', 'brand/ghost/s-spot2.webp'))), ['tools'], T1)
  // 小裝飾圖：少一張、換順序都不行
  assertFails(await feature(edit(EN, (h) => h.replace(/<img class="ghost ghost--small" src="https:\/\/img\.casper\.tw\/sound-effects\/sfx-cat-ambience\.webp"[^>]*>/, ''))), ['tools'], T1)
  // 有介紹的工具輸出成一般卡片、或沒介紹的工具包進介紹區塊：都不對
  assertFails(await feature(edit(EN, (h) => h.replace('<div class="cs-toolfeature"><a class="cs-toolcard cs-toolfeature__card" href="https://www.casper.tw/sound-effects/"', '<div class="cs-toolbox"><a class="cs-toolcard cs-toolfeature__card" href="https://www.casper.tw/sound-effects/"'))), ['tools'], T1)
  assertFails(await feature(edit(EN, (h) => h.replace(/<ul class="cs-toolcards"><li>(<a class="cs-toolcard"[\s\S]*?<\/a>)<\/li><\/ul>/, '<div class="cs-toolfeature">$1<p class="cs-toolfeature__intro">x</p></div>'))), ['tools'], T1)
  // 介紹區塊排在卡片後面：順序不對
  assertFails(await feature(edit(EN, (h) => {
    const cards = /<ul class="cs-toolcards">[\s\S]*?<\/ul>/.exec(h)[0]
    return h.replace(cards, '').replace('<div class="cs-toolfeature">', `${cards}<div class="cs-toolfeature">`)
  })), ['tools'], T1)
  // 繁中首頁 / 不輸出介紹區塊（HomeTools.vue 只有卡片）
  assertFails(await feature(edit(HOME, (h) => h.replace(/(<section id="tools"[^>]*>[\s\S]*?)(<ul class="cs-toolcards">[\s\S]*?<\/ul>)/, '$1<div class="cs-toolfeature">$2</div>'))), ['tools'], /T1：\/ 的 #tools/)
})

test('T1：#tools 卡片以外多出來的東西（/ 的介紹區塊、沒包卡片的介紹區塊、第二個按鈕、多的工具連結）', async () => {
  // 沒包卡片的介紹區塊：只有說明、重點與按鈕（卡片照舊在清單裡，toolCardsIn 看不到它）
  const looseBlock = (href, hreflang, text) => `<div class="cs-toolfeature"><div class="cs-toolfeature__body"><p class="cs-toolfeature__intro">${text}</p><ul class="cs-toolfeature__points"><li>${text}</li></ul><a class="b3d cs-toolfeature__cta" href="${href}" hreflang="${hreflang}">${text}</a></div></div>`
  const zhBlock = looseBlock('https://www.casper.tw/sound-effects/zh-tw/', 'zh-Hant', '看看所有音效')
  // / 的卡片清單後面、前面多一個介紹區塊
  assertFails(await feature(edit(HOME, (h) => h.replace(/(<section id="tools"[\s\S]*?<\/ul>)/, `$1${zhBlock}`))), ['tools'], /T1：\/ 的 #tools 有介紹區塊的元素 <div class="cs-toolfeature">/)
  assertFails(await feature(edit(HOME, (h) => h.replace(/(<section id="tools"[\s\S]*?)(<ul class="cs-toolcards">)/, `$1${zhBlock}$2`))), ['tools'], /T1：\/ 的 #tools 有介紹區塊的元素 <div class="cs-toolfeature">/)
  // / 的卡片裡多一個 cs-toolfeature 開頭的 class（介紹區塊的名稱樣式）也不行
  assertFails(await feature(edit(HOME, (h) => h.replace('<span class="cs-toolcard__name">', '<span class="cs-toolcard__name cs-toolfeature__name">'))), ['tools'], /T1：\/ 的 #tools 有介紹區塊的元素 <span class="cs-toolcard__name cs-toolfeature__name">/)
  // / 的 #tools 多一個不是卡片的工具連結
  assertFails(await feature(edit(HOME, (h) => h.replace(/(<section id="tools"[\s\S]*?<\/ul>)/, '$1<p><a href="https://www.casper.tw/lucky-draw/" hreflang="zh-Hant">全部工具</a></p>'))), ['tools'], /T1：\/ 的 #tools 多了連結 「https:\/\/www\.casper\.tw\/lucky-draw\/」（全部工具）/)
  // /en/ 多一個沒包卡片的介紹區塊（區塊數跟介紹卡片數不同，按鈕也成了多的連結）
  const enLoose = await feature(edit(EN, (h) => h.replace('<ul class="cs-toolcards">', `${looseBlock('https://www.casper.tw/sound-effects/', 'en', 'More sounds')}<ul class="cs-toolcards">`)))
  assertFails(enLoose, ['tools'], /T1：\/en\/ 的 #tools 有 3 個介紹區塊，在介紹區塊裡的卡片是 2 張/)
  assert.ok(check(enLoose, 'tools').failures.some((f) => /T1：\/en\/ 的 #tools 第 3 個介紹區塊要剛好 1 張 a\.cs-toolcard.*實際卡片 0/.test(f)))
  assert.ok(check(enLoose, 'tools').failures.some((f) => /T1：\/en\/ 的 #tools 多了連結 「https:\/\/www\.casper\.tw\/sound-effects\/」（More sounds）/.test(f)))
  // /en/ 的介紹區塊多第二個按鈕，連到別的語系（T1 的比對只看第一個按鈕，T2 只看網址形狀）
  assertFails(await feature(edit(EN, (h) => h.replace('>Browse sound effects</a>', '>Browse sound effects</a><a class="b3d cs-toolfeature__cta" href="https://www.casper.tw/sound-effects/ja/" hreflang="ja">Japanese</a>'))), ['tools'], /T1：\/en\/ 的 #tools 第 1 個介紹區塊要剛好 1 張 a\.cs-toolcard、1 個 __cta、1 個 __intro、1 個 __points，__strip 最多 1 個：實際卡片 1、__cta 2、__intro 1、__points 1、__strip 1/)
  // 第二段介紹、第二個重點清單、第二條小裝飾圖
  assertFails(await feature(edit(EN, (h) => h.replace('<ul class="cs-toolfeature__points">', '<p class="cs-toolfeature__intro">Again</p><ul class="cs-toolfeature__points">'))), ['tools'], /第 1 個介紹區塊要剛好.*__intro 2/)
  assertFails(await feature(edit(EN, (h) => h.replace('<a class="b3d cs-toolfeature__cta"', '<ul class="cs-toolfeature__points"><li>More</li></ul><a class="b3d cs-toolfeature__cta"'))), ['tools'], /第 1 個介紹區塊要剛好.*__points 2/)
  assertFails(await feature(edit(EN, (h) => h.replace('<div class="cs-toolfeature__strip">', '<div class="cs-toolfeature__strip"></div><div class="cs-toolfeature__strip">'))), ['tools'], /第 1 個介紹區塊要剛好.*__strip 2/)
  // /en/ #tools 開頭的說明裡多一個工具連結（連到繁中版）
  assertFails(await feature(edit(EN, (h) => h.replace(/(<section id="tools"[^>]*><h2[^>]*>[^<]*<\/h2><p>)/, '$1<a href="https://www.casper.tw/sound-effects/zh-tw/" hreflang="zh-Hant">Sound effects in Chinese</a> '))), ['tools'], /T1：\/en\/ 的 #tools 多了連結 「https:\/\/www\.casper\.tw\/sound-effects\/zh-tw\/」（Sound effects in Chinese）/)
})

test('toolsRegionProblems：每個 <a> 是卡片或包一張卡的區塊裡的按鈕；區塊要是 div、各部分的數量；/ 不能有 cs-toolfeature', () => {
  const card = (href) => `<a class="cs-toolcard" href="${href}"><span class="cs-toolcard__name"><span>X</span></span></a>`
  const body = (href, extra = '') => `<div class="cs-toolfeature__body"><p class="cs-toolfeature__intro">i</p><ul class="cs-toolfeature__points"><li>p</li></ul><a class="b3d cs-toolfeature__cta" href="${href}">go</a>${extra}</div>`
  const ok = `<h2>Tools</h2><p>lead</p><div class="cs-toolfeature">${card('/a/')}${body('/a/', '<div class="cs-toolfeature__strip"></div>')}</div><ul class="cs-toolcards"><li>${card('/b/')}</li></ul>`
  assert.deepEqual(toolsRegionProblems(ok, { features: true }), [])
  assert.deepEqual(toolsRegionProblems(`<ul class="cs-toolcards"><li>${card('/a/')}</li></ul>`, { features: false }), [])
  // / 不能有介紹區塊，即使結構完整
  assert.match(toolsRegionProblems(ok, { features: false })[0], /有介紹區塊的元素 <div class="cs-toolfeature">、<div class="cs-toolfeature__body">、<p class="cs-toolfeature__intro"> 等 6 個/)
  // 區塊是 section：要是 div
  const section = `<section class="cs-toolfeature">${card('/a/')}${body('/a/')}</section>`
  assert.deepEqual(toolsRegionProblems(section, { features: true }), ['第 1 個介紹區塊是 <section>，要是 div.cs-toolfeature'])
  // 一個區塊包兩張卡：卡片數不對，按鈕也不算在「剛好一張卡」的區塊裡
  const two = toolsRegionProblems(`<div class="cs-toolfeature">${card('/a/')}${card('/b/')}${body('/a/')}</div>`, { features: true })
  assert.ok(two.some((p) => /實際卡片 2/.test(p)) && two.some((p) => /有 1 個介紹區塊，在介紹區塊裡的卡片是 2 張/.test(p)) && two.some((p) => /多了連結 「\/a\/」（go）/.test(p)), two.join('\n'))
  // 巢狀的區塊：外層與內層都包到同一張卡，區塊數多一個
  const nested = toolsRegionProblems(`<div class="cs-toolfeature"><div class="cs-toolfeature">${card('/a/')}${body('/a/')}</div></div>`, { features: true })
  assert.ok(nested.some((p) => /有 2 個介紹區塊，在介紹區塊裡的卡片是 1 張/.test(p)), nested.join('\n'))
  // 區塊外的按鈕、沒有 href 的連結都是多的
  assert.deepEqual(toolsRegionProblems(`${card('/a/')}<a class="b3d cs-toolfeature__cta" href="/a/">go</a>`, { features: true }), ['多了連結 「/a/」（go）：#tools 裡只能有 a.cs-toolcard，以及介紹區塊（剛好包一張卡）裡的按鈕 a.cs-toolfeature__cta'])
  assert.match(toolsRegionProblems(`${card('/a/')}<a class="more"><img src="/x.webp"></a>`, { features: false })[0], /多了連結 （無）（沒有文字）/)
})

test('T1：名稱與說明的空白（U+3000、連續空白、NBSP、頭尾空白）兩邊一樣正規化，資料與 HTML 一致就通過', async () => {
  const [lucky, sfx, conv] = FEATURE_INDEX.tools
  const index = {
    ...FEATURE_INDEX,
    tools: [
      {
        ...lucky,
        locales: {
          'zh-tw': { ...lucky.locales['zh-tw'], name: '抽獎  大師', summary: '抽獎　轉盤　分組' },
          en: { ...lucky.locales.en, name: ' Lucky  Draw ', summary: 'Draw names,  spin a wheel and split teams ' },
        },
      },
      { ...sfx, locales: { ...sfx.locales, en: { ...sfx.locales.en, summary: 'Free  sound effects', intro: 'Thousands of  short sounds.', highlights: ['Play　first', ' Free '], cta: 'Browse  sounds' } } },
      conv,
    ],
  }
  const r = await featureWith(index)
  assert.equal(r.ok, true, formatReport(r))
  // 產物裡真的是原字串（Vue 照原樣輸出），不是測試世界先壓過空白
  let html = ''
  await featureWith(index, (d) => { html = d.get(HOME) })
  assert.ok(html.includes('抽獎　轉盤　分組') && html.includes('抽獎  大師'))
  // 空白以外的字不同還是失敗
  assertFails(await featureWith(index, edit(EN, (h) => h.replace('Free  sound effects', 'Free sound effect'))), ['tools'], /T1：\/en\/ 的 #tools 跟 siteToolLinks/)
  assertFails(await featureWith(index, edit(HOME, (h) => h.replace('抽獎　轉盤　分組', '抽獎　轉盤'))), ['tools'], /T1：\/ 的 #tools 跟 siteToolLinks/)
})

test('T2：工具連結是 https://www.casper.tw/<slug>/ 開頭、帶尾斜線', async () => {
  const bad = { ...I1_INDEX, tools: [{ ...I1_INDEX.tools[0], locales: { ...I1_INDEX.tools[0].locales, en: { ...I1_INDEX.tools[0].locales.en, url: 'https://www.casper.tw/lucky-draw/en' } } }] }
  assertFails(await i1(null, { toolsIndex: bad }), ['tools'], /T2：tools\.json 的 lucky-draw（en）網址/)
  assertFails(await i1(edit(EN, (h) => h.replaceAll('href="https://www.casper.tw/lucky-draw/en/"', 'href="https://lucky.example.com/en/"'))), ['tools'], /T2：\/en\/ 的工具連結 「https:\/\/lucky\.example\.com\/en\/」/)
})

test('T3：頁首、頁尾、#tools、外語首頁沒有 pocketool.app 的連結（文章內文不查）', async () => {
  assertFails(await i1(edit(POST, (h) => h.replace('</footer>', '<a href="https://pocketool.app/lucky/">口袋工具</a></footer>'))), ['tools'], /T3：.*pocketool\.app/)
  assertFails(await i1(edit(EN, (h) => h.replace('<section id="about"', '<p><a href="https://www.pocketool.app/">x</a></p><section id="about"'))), ['tools'], /T3：\/en\/ 有連到口袋工具的連結/)
  assert.equal((await i1(edit(POST, (h) => h.replace('</article>', '<p><a href="https://pocketool.app/">內文提到口袋工具</a></p></article>')))).ok, true)
})

test('T4：頁首「工具」連結存在若且唯若 tools.json 有工具', async () => {
  assertFails(await i1(edit(POST, (h) => h.replace('<a href="https://www.casper.tw/#tools">工具</a>', ''))), ['tools'], /T4：.*頁首沒有「工具」連結/)
  assertFails(await p1(edit(POST, (h) => h.replace('<a href="/categories/">文章</a></header>', '<a href="/#tools">工具</a><a href="/categories/">文章</a></header>'))), ['tools'], /T4：.*頁首有「工具」連結，但 tools\.json 沒有工具/)
})

test('checkFeeds：I1 的 sitemap 有 /en/ 才對；P1 多了 /en/ 就失敗；外語首頁沒有 lastmod，不進 atom 與 content.json', async () => {
  assert.equal(check(await i1(), 'feeds').ok, true)
  assertFails(await p1(edit('sitemap.xml', (x) => x.replace('</urlset>', '<url><loc>https://www.casper.tw/en/</loc></url>\n</urlset>'))), ['feeds'], /sitemap 多了 https:\/\/www\.casper\.tw\/en\//)
  assertFails(await i1(edit('sitemap.xml', (x) => x.replace('<url><loc>https://www.casper.tw/en/</loc></url>', '<url><loc>https://www.casper.tw/en/</loc><lastmod>2026-11-04</lastmod></url>'))), ['feeds'], /外語首頁 https:\/\/www\.casper\.tw\/en\/ 不該有 lastmod/)
  assertFails(await i1(edit('atom.xml', (x) => x.replace('</feed>', '<entry><id>https://www.casper.tw/en/</id></entry></feed>'))), ['feeds'], /atom\.xml 有外語首頁|atom\.xml 有/)
  assertFails(await i1(edit('content.json', (x) => JSON.stringify([...JSON.parse(x), { title: 'en', path: 'en/', categories: [], tags: [] }]))), ['feeds'], /content\.json 有外語首頁|content\.json 有/)
  const s2 = expectedSitemap(REAL.sitemap, { siteHomes: ['en', 'ja'] })
  assert.equal(s2.size, 471)
  assert.ok(s2.has('https://www.casper.tw/en/') && s2.has('https://www.casper.tw/ja/'))
})

test('checkSiteName、checkJsonLd、checkAds、checkLayout、checkCategories、checkChunks 的外語首頁規則', async () => {
  assertFails(await i1(edit(EN, (h) => h.replace(/og:site_name" content="[^"]*"/, 'og:site_name" content="卡斯伯 Blog - 前端，沒有極限"'))), ['site-name', 'locales'], /og:site_name：預期 「casper\.tw」（siteName\('en'\)）|L3/)
  assertFails(await i1(edit(EN, (h) => h.replace('"inLanguage":"en"', '"inLanguage":"zh-TW"'))), ['jsonld'], /WebPage inLanguage：預期 「en」/)
  assertFails(await i1(edit(EN, (h) => h.replace('"isPartOf":{"@id":"https://www.casper.tw/#website"}', '"isPartOf":{"@id":"https://www.casper.tw/"}'))), ['jsonld'], /WebPage isPartOf/)
  // 有外語首頁時 / 一定要有 isPartOf 指的 WebSite（P3 只改站名、沒加 WebSite 時擋下 I1）
  const noSite = (h) => h.replace(/<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"WebSite"[^<]*<\/script>\n?/, '')
  assert.notEqual(noSite(HOME_WEBSITE_LD + '\n'), HOME_WEBSITE_LD + '\n', 'noSite 要能拿掉 fixture 的 WebSite')
  assertFails(await i1(edit(HOME, noSite)), ['jsonld'], /\/（home）沒有 @id 是 https:\/\/www\.casper\.tw\/#website 的 WebSite：外語首頁 \/en\/ 的 WebPage isPartOf 指向它/)
  assertFails(await i1(edit(HOME, (h) => h.replace('"@id":"https://www.casper.tw/#website"', '"@id":"https://www.casper.tw/#site"'))), ['jsonld'], /沒有 @id 是 https:\/\/www\.casper\.tw\/#website 的 WebSite/)
  assertFails(await i1(edit(EN, (h) => h.replace('page-type-site-home"', 'page-type-legal"'))), ['layout', 'locales'], /要有 page-type-site-home|L3/)
  assertFails(await i1(edit(POST, (h) => h.replace('</footer>', '</footer><main></main>'))), ['layout'], /有 2 個 <main>，要剛好一個/)
  assertFails(await s(edit(POST, (h) => h.replace('<header class="cs-hdr">', '<header class="site-header">'))), ['layout'], /沒有共用頁首/)
  // 分類與標籤的路徑段不能是語系代碼
  assertFails(await p1((d) => d.set('tags/ja/index.html', d.get('tags/vue/index.html'))), ['categories', 'urls'], /tags\/ja\/ 的路徑段是語系代碼|未預期/)
  const r = await p1(null, { posts: (await import('./fixtures/world.mjs')).buildWorld().opts.posts.map((x, i) => (i ? x : { ...x, tags: [...x.tags, 'DE'] })) })
  assert.ok(check(r, 'categories').failures.some((f) => /分類或標籤「DE」是語系代碼/.test(f)), formatReport(r))
  // 沒上線語系的文案不能進 client chunk
  const ja = readHomeMessages('ja')
  assertFails(await i1(edit('assets/chunks/theme.Dx9.js', (x) => `${x}export const t=${JSON.stringify(ja.hero.lead)};\n`)), ['chunks'], /沒上線的 ja 文案（hero\.lead）/)
  assertFails(await p1(edit('assets/app.Bc12xY.js', (x) => `${x}const n=${JSON.stringify(readHomeMessages('en').menu.homeOnly)};\n`)), ['chunks'], /沒上線的 en 文案（menu\.homeOnly）/)
  // 已上線語系的文案不算外洩
  assert.equal((await i1(edit('assets/app.Bc12xY.js', (x) => `${x}const n=${JSON.stringify(readHomeMessages('en').menu.homeOnly)};\n`))).ok, true)
  const probes = unpublishedCopyProbes({ plan: I1_PLAN, readHome: readHomeMessages })
  assert.ok(!probes.some((p) => /沒上線的 en/.test(p.label)))
  assert.ok(probes.some((p) => p.text === readHomeMessages('ko').menu.homeOnly))
  assert.ok(unpublishedCopyProbes({ plan: P1_PLAN, readHome: readHomeMessages }).some((p) => /沒上線的 en/.test(p.label)))
})

test('expectedSiteHomeHead：D.2 的順序，x-default 在 hreflang 最後，og:image 四條在 JSON-LD 前', () => {
  const seq = expectedSiteHomeHead('en', { plan: I1_PLAN, readHome: readHomeMessages })
  assert.match(seq[0], /^title=/)
  assert.match(seq[1], /^description=/)
  assert.equal(seq[2], 'canonical=https://www.casper.tw/en/')
  const hl = seq.filter((x) => x.startsWith('hreflang:'))
  assert.equal(hl.at(-1), 'hreflang:x-default=https://www.casper.tw/en/')
  assert.ok(hl.includes('hreflang:zh=https://www.casper.tw/'))
  assert.equal(seq.at(-1), 'jsonld=WebPage')
  assert.deepEqual(seq.filter((x) => x.startsWith('og:locale')), ['og:locale=en_US', 'og:locale:alternate=zh_TW'])
})
