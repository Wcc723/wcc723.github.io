// scripts/dist-diff.mjs 的測試（主站首頁規格 K.4 第 2 步、第 6 步）：雜湊與 __VP_HASH_MAP__、hashmap.json 的正規化、
// 檔案集合、CSS 只放行 tokens.css 的新自訂屬性、禁用字、--mode shell 的頁首頁尾比對（只算展開的導覽，<details> 裡的不算地標）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  compareDists, cssDiff, declaredCustomProps, main, normalizeAssetPath, normalizeAssetRefs, normalizeContent,
  normalizeHashmapJson, normalizeVpHashMap, parseArgs, regionFacts, shellPageProblems, stripClosedDetails,
} from './dist-diff.mjs'

const hashMap = (m) => `<script>window.__VP_HASH_MAP__=JSON.parse(${JSON.stringify(JSON.stringify(m))});</script>`
const page = ({ hash = 'AbCd_-12', map = { 'index.md': 'Xy12Ab-_' }, body = '<p>hi</p>', header = '', footer = '' } = {}) =>
  `<!DOCTYPE html><html lang="zh-TW"><head><title>t</title><link rel="modulepreload" href="/assets/chunks/theme.${hash}.js"></head>` +
  `<body><div id="app"><div class="vp-raw site">${header}<main id="main">${body}</main>${footer}</div></div>${hashMap(map)}` +
  `<script type="module" src="/assets/app.${hash}.js"></script></body></html>`

function makeDist(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'casper-dist-'))
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true })
    fs.writeFileSync(path.join(dir, rel), content)
  }
  return dir
}
function withDists(a, b, fn) {
  const x = makeDist(a)
  const y = makeDist(b)
  const tokens = path.join(x, '..', `${path.basename(x)}-tokens.css`)
  fs.writeFileSync(tokens, ':root{--cs-new:1px;--cs-other:red}')
  try {
    return fn(x, y, tokens)
  } finally {
    for (const d of [x, y]) fs.rmSync(d, { recursive: true, force: true })
    fs.rmSync(tokens, { force: true })
  }
}
const CSS = '.a{color:red;--th-x:1px}.b{margin:0}'
const base = (over = {}) => ({
  'index.html': page(),
  'hashmap.json': JSON.stringify({ 'index.md': 'Xy12Ab-_' }),
  'assets/style.Q1w2E3r4.css': CSS,
  'assets/app.AbCd_-12.js': 'console.log(1)',
  'assets/chunks/theme.AbCd_-12.js': 'x',
  'img/a.png': Buffer.from([1, 2, 3]),
  'sitemap.xml': '<urlset></urlset>',
  ...over,
})

test('正規化：資產雜湊、__VP_HASH_MAP__ 的值、hashmap.json 的值', () => {
  assert.equal(normalizeAssetPath('assets/chunks/theme.CHunwxFA.js'), 'assets/chunks/theme.[hash].js')
  assert.equal(normalizeAssetPath('assets/x.md.Ab-_1234.lean.js'), 'assets/x.md.[hash].lean.js')
  assert.equal(normalizeAssetPath('img/logo.CHunwxFA.js'), 'img/logo.CHunwxFA.js')
  assert.equal(normalizeAssetRefs('<link href="/assets/style.Q1w2E3r4.css">'), '<link href="/assets/style.[hash].css">')
  const a = normalizeVpHashMap(hashMap({ 'b.md': '11111111', 'a.md': '22222222' }))
  const b = normalizeVpHashMap(hashMap({ 'a.md': '33333333', 'b.md': '44444444' }))
  assert.equal(a, b)
  assert.notEqual(a, normalizeVpHashMap(hashMap({ 'a.md': '33333333' })))
  assert.equal(normalizeVpHashMap(hashMap({ 'a.md': '1', '404.md': '2' }), { dropKeys: ['404.md'] }), normalizeVpHashMap(hashMap({ 'a.md': '3' })))
  assert.equal(normalizeHashmapJson('{"b":"1","a":"2"}'), '{"a":"[hash]","b":"[hash]"}')
  assert.equal(normalizeContent('hashmap.json', '{"a":"x"}'), '{"a":"[hash]"}')
  assert.equal(normalizeContent('index.html', page({ hash: '11111111', map: { 'index.md': 'aaaaaaaa' } })), normalizeContent('index.html', page({ hash: '22222222', map: { 'index.md': 'bbbbbbbb' } })))
})

test('compareDists：只差雜湊時相同；多一個檔、少一個檔、文字或位元組不同都失敗', () => {
  const changed = base({
    'index.html': page({ hash: 'ZZZZZZZZ', map: { 'index.md': 'YYYYYYYY' } }),
    'hashmap.json': JSON.stringify({ 'index.md': 'YYYYYYYY' }),
    'assets/style.ZZZZZZZZ.css': CSS,
    'assets/app.ZZZZZZZZ.js': 'console.log(2)',
    'assets/chunks/theme.ZZZZZZZZ.js': 'y',
  })
  for (const k of ['assets/style.Q1w2E3r4.css', 'assets/app.AbCd_-12.js', 'assets/chunks/theme.AbCd_-12.js']) delete changed[k]
  withDists(base(), changed, (x, y, tokens) => {
    const r = compareDists(x, y, { tokensFile: tokens })
    assert.equal(r.ok, true, JSON.stringify(r.problems))
    assert.equal(r.stats.js, 2)
  })
  withDists(base(), base({ 'assets/chunks/SiteHomePage.AbCd_-12.js': 'x', 'sitemap.xml': '<urlset><url/></urlset>', 'img/a.png': Buffer.from([1, 2, 4]) }), (x, y, tokens) => {
    const r = compareDists(x, y, { tokensFile: tokens })
    assert.equal(r.ok, false)
    assert.match(r.problems.files.join('\n'), /新 dist 多了 assets\/chunks\/SiteHomePage\.\[hash\]\.js（外語首頁的 chunk/)
    assert.match(r.problems.content.join('\n'), /sitemap\.xml 正規化之後不同/)
    assert.match(r.problems.content.join('\n'), /img\/a\.png 的位元組不同/)
  })
  const less = base()
  delete less['sitemap.xml']
  withDists(base(), less, (x, y, tokens) => assert.match(compareDists(x, y, { tokensFile: tokens }).problems.files.join('\n'), /新 dist 少了 sitemap\.xml/))
  assert.throws(() => compareDists('/nope', '/nope2'), /找不到 dist 資料夾/)
  assert.throws(() => withDists(base(), base(), (x, y) => compareDists(x, y, { mode: 'x' })), /不認得的 --mode/)
})

test('cssDiff：只放行 tokens.css 宣告、舊 CSS 沒有的自訂屬性；其他差異與禁用字都失敗', () => {
  const tokenProps = declaredCustomProps(':root{--cs-new:1px;--cs-other:red}')
  assert.deepEqual([...tokenProps], ['--cs-new', '--cs-other'])
  const ok = cssDiff(CSS, '.a{color:red;--th-x:1px;--cs-new:2px}.b{margin:0}', { tokenProps })
  assert.deepEqual(ok, { problems: [], allowed: ['--cs-new'] })
  assert.match(cssDiff(CSS, '.a{color:red;--th-x:1px;--cs-unknown:2px}.b{margin:0}', { tokenProps }).problems[0], /CSS 在第 5 個 token 不同：舊「}」/)
  assert.match(cssDiff(CSS, '.a{color:blue;--th-x:1px}.b{margin:0}', { tokenProps }).problems[0], /舊「color:red」，新「color:blue」/)
  // 舊 CSS 已經有的屬性改值不算放行
  assert.equal(cssDiff(CSS, '.a{color:red;--th-x:2px}.b{margin:0}', { tokenProps: new Set(['--th-x']) }).problems.length, 1)
  for (const f of ['.cs-shome{}', '.cs-toolcard{}', '.x.cs-preview{}', "@font-face{font-family:'Nunito Intl'}"]) {
    assert.match(cssDiff(CSS, CSS + f, { tokenProps }).problems[0], /新 CSS 有 /, f)
  }
})

test('compareDists：CSS 檔走 cssDiff', () => withDists(base(), base({ 'assets/style.Q1w2E3r4.css': '.a{color:red;--th-x:1px;--cs-new:2px}.b{margin:0}' }), (x, y, tokens) => {
  const r = compareDists(x, y, { tokensFile: tokens })
  assert.equal(r.ok, true)
  assert.deepEqual(r.stats.allowedCssProps, ['--cs-new'])
}))

const HDR = (nav) => `<header class="hdr"><nav aria-label="主選單">${nav}</nav></header>`
const FTR = '<footer><nav aria-label="頁尾"><a href="/privacy/">隱私權政策</a></nav></footer>'

test('stripClosedDetails 與 regionFacts：只算展開的導覽，<details> 裡的不算地標與連結；class 與包裝不算', () => {
  const menu = '<details class="cs-lang"><summary>語言</summary><nav aria-label="語言"><a href="/en/">English</a></nav></details>'
  assert.equal(stripClosedDetails(`<div>${menu}</div>`), '<div><summary>語言</summary></div>')
  const f = regionFacts(HDR(`<a href="/categories/" aria-current="true">文章</a>${menu}`))
  assert.deepEqual(f.landmarks, ['header', 'nav[主選單]'])
  assert.deepEqual(f.links.map((l) => [l.href, l.text, l.current]), [['https://www.casper.tw/categories/', '文章', 'true']])
  assert.equal(f.text, '文章語言')
  const g = regionFacts('<header class="other"><nav aria-label="主選單"><span class="w"><a class="x" href="https://www.casper.tw/categories/" aria-current="true">文章</a></span><details><summary>語言</summary><a href="/ja/">日本語</a></details></nav></header>')
  assert.deepEqual(g.landmarks, f.landmarks)
  assert.deepEqual(g.links, f.links)
  const btn = regionFacts('<header><button aria-label="搜尋" aria-keyshortcuts="Control+K">搜尋</button></header>')
  assert.deepEqual(btn.buttons, [{ label: '搜尋', title: null, keys: 'Control+K', text: '搜尋' }])
})

test('shellPageProblems：頁首頁尾的事實相同、其他 HTML 只差 GA4 時通過；連結不同、內文不同都失敗；404 只比 head 與頁尾', () => {
  const ga = (cg) => `<script>if(x){gtag('config','G',{content_group:'${cg}'});s.src='https://www.googletagmanager.com/gtag/js?id=G'}</script>`
  const old = page({ header: HDR('<a href="/categories/">文章</a>'), footer: FTR }).replace('</head>', `${ga('blog')}</head>`)
  const same = page({ header: HDR('<span><a class="cs-hdr__link" href="https://www.casper.tw/categories/">文章</a></span>'), footer: FTR.replace('<footer>', '<footer class="cs-ftr">') }).replace('</head>', `${ga('blog2')}</head>`)
  assert.deepEqual(shellPageProblems('index.html', old, same, '/'), [])
  const moved = page({ header: HDR('<a href="/tags/">文章</a>'), footer: FTR })
  assert.match(shellPageProblems('index.html', old, moved, '/').join('\n'), /index\.html 的 <header> links 不同/)
  const body = page({ header: HDR('<a href="/categories/">文章</a>'), footer: FTR, body: '<p>changed</p>' })
  assert.match(shellPageProblems('index.html', old, body, '/').join('\n'), /index\.html 在頁首頁尾以外不同/)
  assert.match(shellPageProblems('index.html', old, page({ footer: FTR }), '/').join('\n'), /新的頁面沒有 <header>/)
  // 404：內文與頁首可以不同（S 起改成會 hydrate 的頁），head 去掉 modulepreload 與 module script 後要相同
  const nf = page({ header: HDR('<a href="/">首頁</a>'), footer: FTR, body: '<h1>找不到</h1>' })
  const nf2 = page({ hash: 'QQQQQQQQ', header: HDR('<a href="/x/">別的</a>'), footer: FTR, body: '<h1>不一樣</h1>' })
  assert.deepEqual(shellPageProblems('404.html', nf, nf2, '/404.html'), [])
  assert.match(shellPageProblems('404.html', nf, nf2.replace('<title>t</title>', '<title>u</title>'), '/404.html').join('\n'), /404\.html 的 <head> 除了 GA4/)
})

test('compareDists --mode shell：容許 404.md 的兩支 chunk 與雜湊表的 404.md；CSS 只查禁用字', () => {
  const a = base()
  const b = base({
    'assets/404.md.AbCd_-12.js': 'x', 'assets/404.md.AbCd_-12.lean.js': 'x',
    'hashmap.json': JSON.stringify({ 'index.md': 'Xy12Ab-_', '404.md': 'zzzzzzzz' }),
    'index.html': page({ map: { 'index.md': 'Xy12Ab-_', '404.md': 'zzzzzzzz' } }),
    'assets/style.Q1w2E3r4.css': `${CSS}.cs-hdr{x:y}`,
  })
  withDists(a, b, (x, y, tokens) => {
    assert.equal(compareDists(x, y, { mode: 'shell', tokensFile: tokens }).ok, true)
    const p1 = compareDists(x, y, { tokensFile: tokens })
    assert.equal(p1.ok, false)
    assert.match(p1.problems.files.join('\n'), /404\.md\.\[hash\]\.js/)
  })
})

test('parseArgs 與 main 的 exit code：相同 0、不同 1、參數錯 2', () => {
  assert.throws(() => parseArgs(['a']), /用法/)
  assert.throws(() => parseArgs(['a', 'b', '--mode', 'x']), /不認得的 --mode/)
  assert.throws(() => parseArgs(['a', 'b', '--zip']), /不認得的參數/)
  assert.equal(parseArgs(['a', 'b', '--mode', 'shell', '--max', '5']).max, 5)
  const log = () => {}
  assert.equal(main(['only-one'], { log }), 2)
  withDists(base(), base(), (x, y, tokens) => {
    assert.equal(main([x, y, '--tokens', tokens], { log }), 0)
  })
  withDists(base(), base({ 'sitemap.xml': 'x' }), (x, y, tokens) => {
    const out = []
    assert.equal(main([x, y, '--tokens', tokens], { log: (m) => out.push(m) }), 1)
    assert.match(out.join('\n'), /結果：不同/)
  })
})
