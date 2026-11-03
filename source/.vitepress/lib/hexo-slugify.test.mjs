// hexo-slugify 的固定案例：Hexo 基準（baseline/hexo-2026-11-03/pages.json）裡實際出現的 id。
// 輸入是文章原始碼的標題文字（# 後面那一段），期望值是 Hexo 線上產物的 id。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  createHeadingCounter,
  escapeDiacritic,
  escapeHtml,
  hexoHeadingId,
  hexoSlugify,
  markedHeadingText,
  markedInline,
  slugize,
  smartypants,
  stripHTML
} from './hexo-slugify.mjs'

// 計畫「標題錨點 id」列的 16 個含 smartypants 字元的 id（9 篇）
const SMARTYPANTS_CASES = [
  ['2016-01-24-css-3d.md', '2016年的冬天...', '2016年的冬天…'],
  ['2016-12-08-framework-bootstrap.md', '_buttons.scss, _tables.scss, _utilities.scss ...', 'buttons-scss-tables-scss-utilities-scss-…'],
  ['2018-10-21-color.md', '講古中...', '講古中…'],
  ['2020-09-16-chrome-js-alert.md', "Uncaught SyntaxError: Unexpected token '}'", 'Uncaught-SyntaxError-Unexpected-token-‘-’'],
  ['2020-09-16-chrome-js-alert.md', "Uncaught SyntaxError: Identifier 'a' has already been declared", 'Uncaught-SyntaxError-Identifier-‘a’-has-already-been-declared'],
  ['2020-09-16-chrome-js-alert.md', "Uncaught TypeError: Cannot read property 'a' of undefined", 'Uncaught-TypeError-Cannot-read-property-‘a’-of-undefined'],
  ['2020-09-16-chrome-js-alert.md', 'Uncaught TypeError: console.log(...) is not a function', 'Uncaught-TypeError-console-log-…-is-not-a-function'],
  ['2020-10-16-async-await.md', '使用 try...catch 進行錯誤的處理', '使用-try…catch-進行錯誤的處理'],
  ['2021-09-11-css-selector.md', '包含特定 “屬性” 的選取', '包含特定-“屬性”-的選取'],
  ['2021-09-11-css-selector.md', '“屬性及值” 完全符合', '“屬性及值”-完全符合'],
  ['2021-09-11-css-selector.md', '屬性值 ”包含特定字串“', '屬性值-”包含特定字串“'],
  ['2021-09-11-css-selector.md', '“開頭值” 包含特定文字', '“開頭值”-包含特定文字'],
  ['2021-09-11-css-selector.md', '”結尾值“ 包含特定文字', '”結尾值“-包含特定文字'],
  ['2017-03-03-vscode-for-mac.md', 'Gulp、Webpack … 整合', 'Gulp、Webpack-…-整合'],
  ['2017-12-10-javascript-reference.md', 'for...in', 'for…in'],
  ['2017-12-15-javascript-use-strict.md', "'use strict' 及 this", '‘use-strict’-及-this']
]

// 計畫列的 7 個含 HTML 跳脫片段的 id（6 篇）
const ESCAPE_CASES = [
  ['2014-10-03-Ironman-30-days-04.md', 'Example sweep-flag & large-arc-flag', 'Example-sweep-flag-amp-large-arc-flag'],
  ['2020-09-18-js-expression-2.md', '邏輯運算子 `||`、`&&`', '邏輯運算子-、-amp-amp'],
  ['2020-10-02-about-ajax-3.md', '先打開 Chrome 開發者工具 > Network', '先打開-Chrome-開發者工具-gt-Network'],
  ['2013-12-14-ashare-technology.md', 'Git & Github & Github page', 'Git-amp-Github-amp-Github-page'],
  ['2013-12-14-ashare-technology.md', 'Sass & Compass & Susy', 'Sass-amp-Compass-amp-Susy'],
  ['2015-04-23-reactjs-environment.md', '安裝Node.js & Gulp', '安裝Node-js-amp-Gulp'],
  ['2015-01-08-2014-year-report.md', 'SASS & Compass', 'SASS-amp-Compass']
]

test('計畫列的 16 個 smartypants id 與 7 個跳脫 id 跟 Hexo 相同', () => {
  assert.equal(SMARTYPANTS_CASES.length, 16)
  assert.equal(ESCAPE_CASES.length, 7)
  for (const [file, heading, id] of [...SMARTYPANTS_CASES, ...ESCAPE_CASES]) {
    assert.equal(hexoHeadingId(heading), id, `${file}：${heading}`)
  }
})

test('一般標題：保留大小寫、中文標點，空白與符號變成單一連字號', () => {
  assert.equal(hexoHeadingId('安裝 NVM 環境'), '安裝-NVM-環境')
  assert.equal(hexoHeadingId('用 `.nvmrc` 讓專案自動指定版本'), '用-nvmrc-讓專案自動指定版本')
  assert.equal(hexoHeadingId('☝️ zsh（建議）'), '☝️-zsh（建議）')
  assert.equal(hexoHeadingId('2020 完課學員心得：'), '2020-完課學員心得：')
  assert.equal(hexoHeadingId('Vue 3 作品實戰班'), 'Vue-3-作品實戰班')
  assert.equal(hexoHeadingId('**不會**自動加入分號的規則'), '不會自動加入分號的規則')
  assert.equal(hexoHeadingId('設定 `_config.yml`'), '設定-config-yml')
  assert.equal(hexoHeadingId('現場參與照片!?'), '現場參與照片')
})

test('smartypants 只套在文字，code span 不套；& 在 code span 一律跳脫、在文字裡已是實體就不再跳脫', () => {
  assert.equal(hexoHeadingId('npm --lts'), 'npm-–lts')
  assert.equal(hexoHeadingId('npm `--lts`'), 'npm-lts')
  // marked 的文字 token 從 code span 後面重新開始，開頭的 ' 被當成左單引號
  assert.equal(hexoHeadingId("`a`'s"), 'a‘s')
  assert.equal(hexoHeadingId('&amp; 與 `&amp;`'), 'amp-與-amp-amp')
  assert.equal(smartypants(`"a" 'b' -- --- ...`), '“a” ‘b’ – — …')
  assert.equal(escapeHtml(`&amp; & < > " '`), '&amp; &amp; &lt; &gt; &quot; &#39;')
  assert.equal(escapeHtml('&amp;', true), '&amp;amp;')
})

test('marked 的 inline 解析：連結只留文字、圖片整個拿掉、HTML 標籤拿掉、反斜線跳脫', () => {
  assert.equal(hexoHeadingId('[Vue](https://vuejs.org "官網") 入門'), 'Vue-入門')
  assert.equal(hexoHeadingId('![logo](a.png) 標題'), '標題')
  assert.equal(hexoHeadingId('<span class="red">紅</span>色'), '紅色')
  assert.equal(hexoHeadingId('\\*不是強調\\*'), '不是強調')
  assert.equal(hexoHeadingId('參考 [定義][r] 與 [沒有定義]', { links: { r: { href: '/x' } } }), '參考-定義-與-沒有定義')
  assert.equal(markedInline('a *b* __c__ ~~d~~ `e`'), 'a <em>b</em> <strong>c</strong> <del>d</del> <code>e</code>')
  assert.equal(markedInline('http://example.com/a--b'), '<a href="http://example.com/a--b">http://example.com/a--b</a>')
})

test('ATX 標題結尾的 # 照 marked 的規則拿掉；setext 標題只取最後一行', () => {
  assert.equal(markedHeadingText('C#'), 'C')
  assert.equal(markedHeadingText('標題 ##'), '標題')
  assert.equal(markedHeadingText('C# 入門'), 'C# 入門')
  assert.equal(markedHeadingText('第一行\n第二行', { setext: true }), '第二行')
  assert.equal(hexoHeadingId('第一行\n第二行', { setext: true }), '第二行')
  assert.equal(markedHeadingText('tab\there\u00a0nbsp'), 'tab    here nbsp')
})

test('slugize 與 escapeDiacritic 照 hexo-util 0.6.3', () => {
  assert.equal(slugize('  Hello -- World!! '), 'Hello-World')
  assert.equal(slugize('Hello World', { transform: 1 }), 'hello-world')
  assert.equal(slugize('Hello World', { separator: '_' }), 'Hello_World')
  assert.equal(slugize('a\u0001b'), 'ab')
  assert.equal(escapeDiacritic('Café naïve ＡＢＣ'), 'Cafe naive ABC')
  assert.equal(slugize('😀 emoji'), '😀-emoji')
  assert.throws(() => slugize(null), TypeError)
})

test('stripHTML 照 striptags 2.2.1：拿掉標籤與註解，屬性裡的 > 不會提早結束', () => {
  assert.equal(stripHTML('<a href="x>y">連結</a>文字'), '連結文字')
  assert.equal(stripHTML('前<!-- 註解 -->後'), '前後')
  assert.equal(stripHTML('a < b'), 'a < b')
  assert.equal(stripHTML('&lt;div&gt;'), '&lt;div&gt;')
})

test('重複標題的編號跟 hexo-renderer-marked 相同（含原版不檢查撞名的行為）', () => {
  const count = createHeadingCounter()
  assert.deepEqual(['結語', '結語', '結語', 'A', 'A-1', 'A'].map(count), ['結語', '結語-1', '結語-2', 'A', 'A-1', 'A-1'])
})

test('hexoSlugify：純文字輸入（anchor、headers 外掛的備援）', () => {
  assert.equal(hexoSlugify('SASS & Compass'), 'SASS-amp-Compass')
  assert.equal(hexoSlugify("'use strict' 及 this"), '‘use-strict’-及-this')
  assert.equal(hexoSlugify('*不是強調*'), '不是強調')
})
