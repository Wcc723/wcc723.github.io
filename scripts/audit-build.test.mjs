// node --test scripts/audit-build.test.mjs
// 現在還沒有可用的 VitePress dist，所以用 fixtures/world.mjs 的測試世界：真實的 Hexo 頁產生迷你基準，
// 再模擬新版產物。沒改壞的世界要全部通過；每個測試改壞一個地方，確認對應的檢查會失敗、訊息講得出原因。
// 另外對真實的基準（baseline/hexo-2026-11-03/）驗白名單與預期集合的數字。
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
  PROFILE_EXPECTED, PROFILE_LABEL, PROFILE_SEQUENCE_LABEL, THEME_CHUNK_MAX,
} from './audit-build.mjs'
import { buildWorld } from './fixtures/world.mjs'
import { SITE_TITLE_LEGACY } from '../source/.vitepress/theme/shared/shell/site.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REAL = loadBaseline(path.join(ROOT, 'baseline/hexo-2026-11-03'))

/** 建世界、跑 audit、清掉暫存，回傳報告 */
async function audit(mutate, extra = {}) {
  const w = buildWorld(mutate)
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

test('沒改壞的測試世界：17 項檢查全部通過', async () => {
  const r = await audit()
  assert.equal(r.ok, true, formatReport(r))
  assert.equal(r.checks.length, 17)
  assert.match(formatReport(r), /結果：全部 17 項通過/)
  assert.ok(r.expected.some((e) => e.target === '/_headers'))
  assert.ok(r.expected.some((e) => e.target === '/tags/vue/' && /大寫標籤/.test(e.reason)))
})

test('網址：少了基準頁、多了沒登記的網址、_headers 還在、只差大小寫', async () => {
  // 少一頁時，那一頁的固定錨點案例也會跟著失敗
  assertFails(await audit((d) => d.delete(POST)), ['urls', 'anchors'], /基準頁不在 dist：\/development\/2021\/09\/11\/css-selector\/|固定案例/)
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
  assertFails(cut, ['text', 'anchors', 'content'], /相似度|少了|數量/)
  assert.ok(check(cut, 'text').failures.some((f) => /相似度 0\.\d+，第 \d+ 字起/.test(f) || /相似度 低於/.test(f)))
  assertFails(await audit(edit(POST, (h) => h.replace('class="prose"', 'class="article-body"'))), ['text'], /找不到本文容器/)
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
  assertFails(await audit(edit(POST, (h) => h.replace('<div class="vp-raw"', '<div class="layout"'))), ['layout'], /沒有 vp-raw/)
  assert.equal(rootHasVpRaw('<div id="app"><!--[--><div data-v-1 class="a vp-raw">'), true)
  assert.equal(rootHasVpRaw('<div id="app"><main><div class="vp-raw">'), false)
  assert.equal(rootHasVpRaw('<body><div class="vp-raw">'), false)
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

test('scripts/data/categories.json 跟 workspace 的 config/reserved-paths.json 一致', { skip: !fs.existsSync(path.resolve(ROOT, '../../config/reserved-paths.json')) && '找不到 workspace' }, () => {
  const mine = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/data/categories.json'), 'utf8'))
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
