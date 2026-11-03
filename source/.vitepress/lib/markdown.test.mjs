// markdownOptions 的行為測試，以及全部文章的標題 id 跟 Hexo 基準逐一比對。
// 用 VitePress 自己的 createMarkdownRenderer（跟 vitepress build 同一套外掛與順序），不跑 build。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createMarkdownRenderer } from 'vitepress'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { ANCHOR_EXCEPTIONS, markdownOptions } from './markdown.mjs'
import { loadPosts } from './posts.mjs'

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const root = path.dirname(srcDir)
const BASELINE = path.join(root, 'baseline/hexo-2026-11-03/pages.json')

const md = await createMarkdownRenderer(srcDir, markdownOptions, '/')

// 跟 VitePress 的 markdownToVue 一樣的 env；realPath 是 rewrites 之前的檔案
function render(src, file = '9999-01-01-markdown-test.md', env = {}) {
  const full = path.join(srcDir, '_posts', file)
  return md.render(src, Object.assign(env, { path: full, realPath: full, relativePath: `_posts/${file}`, cleanUrls: true }))
}

// 跟基準的 headingIds 同一個取法：拿掉註解與 script、style、noscript、template 之後，h1 到 h6 有 id 的依序列出
const TAG_BODY = `(?:[^>"']|"[^"]*"|'[^']*')*`
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" }
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39);/g, (_, e) => ENTITIES[e])
function visible(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '').replace(/<(script|style|noscript|template)\b[\s\S]*?<\/\1\s*>/gi, '')
}
function attrId(attrs) {
  const m = /(?:^|\s)id\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i.exec(attrs)
  return m ? decode(m[1] ?? m[2] ?? m[3]) : null
}
function headingIds(html) {
  return [...visible(html).matchAll(new RegExp(`<h[1-6]\\b(${TAG_BODY})>`, 'gi'))]
    .map((m) => attrId(m[1]))
    .filter((id) => id !== null)
}
function allIds(html) {
  return new Set([...visible(html).matchAll(new RegExp(`<[a-zA-Z][\\w-]*\\b(${TAG_BODY})>`, 'g'))].map((m) => attrId(m[1])).filter((id) => id !== null))
}

test('breaks：段落裡的換行輸出 <br>（跟 Hexo 的 breaks: true 相同）', () => {
  assert.equal(render('第一行\n第二行'), '<p>第一行<br>\n第二行</p>\n')
})

test('typographer 關閉：內文的 --lts、引號、... 照字面輸出', () => {
  const html = render(`nvm install --lts，"雙引號" 'single' ... --- 結束`)
  assert.ok(html.includes('--lts'))
  assert.ok(html.includes('...'))
  assert.doesNotMatch(html, /[–—“”‘’…]/)
})

test('標題錨點是空的 <a>：標題文字不會多一個零寬字元，跟 Hexo 的 h1、h2 文字相同', () => {
  const html = render('# 工商服務 MOPCON\n\n## 第二層\n')
  assert.doesNotMatch(html, /&ZeroWidthSpace;|​/)
  assert.match(html, /<h1 id="工商服務-MOPCON" tabindex="-1">工商服務 MOPCON <a class="header-anchor" href="#工商服務-MOPCON" aria-label="[^"]+"><\/a><\/h1>/)
})

test('原始 HTML 的 <a> 裡寫網址：linkify 不會再包一層 <a>（Hexo 也只有一層）', () => {
  const html = render('六角學院網站：<a href="http://www.hexschool.com/" target="_blank">http://www.hexschool.com/</a>，還有 https://example.com/')
  assert.equal((html.match(/<a\b/g) ?? []).length, 2)
  assert.ok(html.includes('<a href="http://www.hexschool.com/" target="_blank">http://www.hexschool.com/</a>'))
  assert.match(html, /<a href="https:\/\/example\.com\/"[^>]*>https:\/\/example\.com\/<\/a>/)
})

test('emoji 轉換關閉：:D、:(、:smile: 照字面輸出（Hexo 沒有這個功能）', () => {
  assert.equal(render('好 :D 不好 :( 還有 :smile:'), '<p>好 :D 不好 :( 還有 :smile:</p>\n')
})

test('code_inline 一律輸出 <code v-pre>，Vue 不會解析裡面的 {{ }}', async () => {
  const html = render('執行 `nvm install {{ version }}` 與 `<div>`')
  assert.equal(html, '<p>執行 <code v-pre>nvm install {{ version }}</code> 與 <code v-pre>&lt;div&gt;</code></p>\n')
  const ssr = await renderToString(createSSRApp({ template: `<div>${html}</div>` }))
  assert.ok(ssr.includes('<code>nvm install {{ version }}</code>'), ssr)
  // 標題裡的 inline code 也一樣
  assert.match(render('## 用 `{{ x }}` 取值'), /<code v-pre>\{\{ x \}\}<\/code>/)
  // 圍起來的程式碼區塊不受影響（VitePress 本來就加 v-pre）
  assert.match(render('```js\nconst a = `${b}`\n```'), /<pre class="shiki[^>]*\sv-pre/)
})

test('標題 id 照 Hexo：保留大小寫、smartypants、跳脫片段，重複時加 -1、-2', () => {
  const html = render(
    ['## 結語', '## 結語', '### 結語', '## SASS & Compass', "## 'use strict' 及 this", '#### 邏輯運算子 `||`、`&&`', '# H1 也有 id'].join('\n\n')
  )
  assert.deepEqual(headingIds(html), [
    '結語',
    '結語-1',
    '結語-2',
    'SASS-amp-Compass',
    '‘use-strict’-及-this',
    '邏輯運算子-、-amp-amp',
    'H1-也有-id'
  ])
  // VitePress 預設的 header-anchor 保留，href 指向同一個 id
  assert.match(html, /<h2 id="結語-1" tabindex="-1">結語 <a class="header-anchor" href="#結語-1"/)
})

test('撞名（A、A、A-1）不會讓建置中止，後到的再往後編號', () => {
  assert.deepEqual(headingIds(render('## A\n\n## A\n\n## A-1')), ['A', 'A-1', 'A-1-1'])
})

test('作者用 {#id} 指定的 id 照用，自動產生的 id 避開它', () => {
  assert.deepEqual(headingIds(render('## 標題 {#custom}\n\n## custom')), ['custom', 'custom-1'])
})

test('setext 標題跟 Hexo 一樣只用底線上面那一行算 id', () => {
  assert.deepEqual(headingIds(render('第一行\n第二行\n---')), ['第二行'])
  assert.deepEqual(headingIds(render('大標題\n===')), ['大標題'])
})

test('blockquote、清單裡的標題也有 id，跟 Hexo 共用同一組重複編號', () => {
  assert.deepEqual(headingIds(render('## 注意\n\n> ## 注意\n\n- ## 注意')), ['注意', '注意-1', '注意-2'])
})

test('headers 外掛的 slug 跟標題 id 相同', () => {
  const env = {}
  render('## A & B\n\n### C...\n\n## A & B', undefined, env)
  assert.deepEqual(
    env.headers.map((h) => [h.slug, h.children.map((c) => c.slug)]),
    [
      ['A-amp-B', ['C…']],
      ['A-amp-B-1', []]
    ]
  )
})

test('例外清單：在標題前補一個帶舊 id 的空 <span id>', () => {
  const file = '9999-01-01-anchor-exception.md'
  ANCHOR_EXCEPTIONS[file] = { 新標題: '舊標題' }
  try {
    const html = render('## 新標題\n\n內文', file)
    assert.match(html, /^<span id="舊標題"><\/span>\n<h2 id="新標題" tabindex="-1">新標題 <a class="header-anchor" href="#新標題"/)
    // 別篇不受影響
    assert.doesNotMatch(render('## 新標題'), /<span id=/)
  } finally {
    delete ANCHOR_EXCEPTIONS[file]
  }
})

// ---------------------------------------------------------------------------
// 全量比對：source/_posts/*.md 每篇的 h1 到 h6 id，跟基準 pages.json 的 headingIds 依網址逐一比對。
// 只比已經是 .md 的文章（.html 舊文由內容遷移轉檔，Hexo 沒替它們加 id，轉完後基準是空陣列，也一起比）。

const baseline = new Map(JSON.parse(fs.readFileSync(BASELINE, 'utf8')).pages.map((p) => [decodeURI(p.url), p]))

function pagesToCompare() {
  const pages = []
  for (const p of loadPosts(srcDir, { includeUnpublished: true })) {
    const b = baseline.get(p.url)
    if (b) pages.push({ file: p.file, src: path.join(srcDir, p.src), url: p.url, want: b.headingIds })
  }
  for (const [rel, url] of [
    ['about/index.md', '/about/'],
    ['about/hexschool-traning.md', '/about/hexschool-traning.html']
  ]) {
    const src = path.join(srcDir, rel)
    if (fs.existsSync(src) && baseline.has(url)) pages.push({ file: path.basename(rel), src, url, want: baseline.get(url).headingIds })
  }
  return pages
}

function renderFile(page) {
  return md.render(fs.readFileSync(page.src, 'utf8'), { path: page.src, realPath: page.src, relativePath: path.relative(srcDir, page.src), cleanUrls: true })
}

// 計畫列的 23 個特殊 id，要在全量比對的實際頁面裡出現
const SPECIAL_IDS = [
  ['2016-01-24-css-3d.md', '2016年的冬天…'],
  ['2016-12-08-framework-bootstrap.md', 'buttons-scss-tables-scss-utilities-scss-…'],
  ['2018-10-21-color.md', '講古中…'],
  ['2020-09-16-chrome-js-alert.md', 'Uncaught-SyntaxError-Unexpected-token-‘-’'],
  ['2020-09-16-chrome-js-alert.md', 'Uncaught-SyntaxError-Identifier-‘a’-has-already-been-declared'],
  ['2020-09-16-chrome-js-alert.md', 'Uncaught-TypeError-Cannot-read-property-‘a’-of-undefined'],
  ['2020-09-16-chrome-js-alert.md', 'Uncaught-TypeError-console-log-…-is-not-a-function'],
  ['2020-10-16-async-await.md', '使用-try…catch-進行錯誤的處理'],
  ['2021-09-11-css-selector.md', '包含特定-“屬性”-的選取'],
  ['2021-09-11-css-selector.md', '“屬性及值”-完全符合'],
  ['2021-09-11-css-selector.md', '屬性值-”包含特定字串“'],
  ['2021-09-11-css-selector.md', '“開頭值”-包含特定文字'],
  ['2021-09-11-css-selector.md', '”結尾值“-包含特定文字'],
  ['2017-03-03-vscode-for-mac.md', 'Gulp、Webpack-…-整合'],
  ['2017-12-10-javascript-reference.md', 'for…in'],
  ['2017-12-15-javascript-use-strict.md', '‘use-strict’-及-this'],
  ['2014-10-03-Ironman-30-days-04.md', 'Example-sweep-flag-amp-large-arc-flag'],
  ['2020-09-18-js-expression-2.md', '邏輯運算子-、-amp-amp'],
  ['2020-10-02-about-ajax-3.md', '先打開-Chrome-開發者工具-gt-Network'],
  ['2013-12-14-ashare-technology.md', 'Git-amp-Github-amp-Github-page'],
  ['2013-12-14-ashare-technology.md', 'Sass-amp-Compass-amp-Susy'],
  ['2015-04-23-reactjs-environment.md', '安裝Node-js-amp-Gulp'],
  ['2015-01-08-2014-year-report.md', 'SASS-amp-Compass']
]

// Hexo 線上就已經找不到目標的站內 # 連結（基準裡沒有這個 id），不算這次的問題
const KNOWN_BROKEN_HASH_LINKS = [
  // 連結寫小寫 id，標題是「ID 選取」，Hexo 的 id 保留大小寫是 ID-選取
  ['2021-09-11-css-selector.md', 'id-選取'],
  // 示範 Hexo 標題輸出的 HTML 片段，故意沒有對應的 id
  ['2019-11-23-ten-mins-learn-markdown.md', '這是標題'],
  // 舊 .html 文章的 CSS :target 示範，連到不存在的 id 來「關掉」效果（Hexo 產物同樣沒有這個 id）
  ['2013-09-29-css-target.md', '2013-09-29'],
  // 舊 .html 文章表格的註腳連結，原文就沒有寫 id="1"、id="2"
  ['2013-09-21-css-color.md', '1'],
  ['2013-09-21-css-color.md', '2']
]

test('全部文章的標題 id 跟 Hexo 基準逐一相同', (t) => {
  const pages = pagesToCompare()
  const rendered = new Map()
  let ids = 0
  let same = 0
  const problems = []
  for (const page of pages) {
    const html = renderFile(page)
    rendered.set(page.file, html)
    const legacy = ANCHOR_EXCEPTIONS[page.file] ?? {}
    const got = headingIds(html).map((id) => legacy[id] ?? id)
    for (const [id, old] of Object.entries(legacy)) {
      if (!html.includes(`<span id="${old}"></span>`)) problems.push(`${page.file}：例外 ${id} → ${old} 沒有輸出舊 id 的 span`)
    }
    ids += page.want.length
    page.want.forEach((id, i) => {
      if (got[i] === id) same++
    })
    if (JSON.stringify(got) !== JSON.stringify(page.want)) {
      const n = Math.max(got.length, page.want.length)
      const diff = []
      for (let i = 0; i < n; i++) if (got[i] !== page.want[i]) diff.push(`[${i}] 現在 ${JSON.stringify(got[i])}，基準 ${JSON.stringify(page.want[i])}`)
      problems.push(`${page.file}（${page.url}）\n    ${diff.join('\n    ')}`)
    }
  }
  t.diagnostic(`比對 ${pages.length} 頁、基準 ${ids} 個 id，位置與內容都相同 ${same} 個，有差異 ${problems.length} 頁`)
  assert.ok(pages.length > 300, `只找到 ${pages.length} 頁可以比對`)
  assert.deepEqual(problems, [])

  for (const [file, id] of SPECIAL_IDS) {
    assert.ok(rendered.has(file), `${file} 不在比對清單`)
    assert.ok(headingIds(rendered.get(file)).includes(id), `${file} 少了 ${id}`)
  }

  // 站內 # 連結（不含 header-anchor 和空的 #）都要找得到目標
  const known = new Set(KNOWN_BROKEN_HASH_LINKS.map(([f, id]) => `${f}#${id}`))
  let links = 0
  const broken = []
  for (const [file, html] of rendered) {
    const targets = allIds(html)
    for (const m of visible(html).matchAll(new RegExp(`<a\\b(${TAG_BODY})>`, 'gi'))) {
      if (/class="header-anchor"/.test(m[1])) continue
      const href = /(?:^|\s)href="#([^"]+)"/.exec(m[1])?.[1]
      if (!href) continue
      links++
      let id = decode(href)
      try {
        id = decodeURIComponent(id)
      } catch {}
      if (!targets.has(id) && !known.has(`${file}#${id}`)) broken.push(`${file}#${id}`)
    }
  }
  t.diagnostic(`站內 # 連結 ${links} 個，Hexo 時代就壞掉的 ${KNOWN_BROKEN_HASH_LINKS.length} 個列在 KNOWN_BROKEN_HASH_LINKS`)
  assert.deepEqual(broken, [])
})
