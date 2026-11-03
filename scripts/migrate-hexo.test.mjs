import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import {
  RAW_LINE_RE,
  removeRawTags,
  hexoFenceStarts,
  lowercaseTags,
  tagCaseCollisions,
  fixIframes,
  wrapTbody,
  fixPostLinkSlash,
  maskNonHtml,
  applyPatches,
  PATCHES,
  splitFrontMatter,
  migrateText,
  createMd,
  defaultFiles,
  LEGACY_HTML
} from './migrate-hexo.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const postsDir = path.join(root, 'source', '_posts')
const toLines = (s) => s.split('\n').map((text) => ({ text, verbatim: false }))
const texts = (lines) => lines.map((l) => l.text).join('\n')

describe('raw、endraw', () => {
  test('認得各種寫法，只認獨佔一行的', () => {
    for (const s of ['{% raw %}', '{% endraw %}', '{% raw %} ', '{% endraw%}', '{% raw %}\r', '  {%- raw -%}']) assert.ok(RAW_LINE_RE.test(s), s)
    for (const s of ['x {% raw %}', '`{% raw %}`', '{% rawx %}', '{{ raw }}']) assert.ok(!RAW_LINE_RE.test(s), s)
  })

  test('整行刪除，raw 裡的行標成要原樣輸出', () => {
    const r = removeRawTags(toLines('a\n\n{% raw %}\n<div>x</div>\n{% endraw %}\n\nb'))
    assert.equal(texts(r.lines), 'a\n\n<div>x</div>\n\nb')
    assert.equal(r.removed, 2)
    assert.deepEqual(r.lines.map((l) => l.verbatim), [false, false, true, false, false])
  })

  test('前後都不是空行時留一個空行，後面的 Markdown 不會被併進 HTML 區塊', () => {
    const r = removeRawTags(toLines('文字\n{% raw %}\n<video>\n</video>\n{% endraw %}\n> 說明'))
    assert.equal(texts(r.lines), '文字\n\n<video>\n</video>\n\n> 說明')
  })

  test('CRLF 的檔案留下的空行也是 CRLF', () => {
    const r = removeRawTags(toLines('a\r\n{% raw %}\r\n<p>x</p>\r\n{% endraw %}\r\nb\r\n'.replace(/\r\n/g, '\r\n')))
    assert.equal(texts(r.lines), 'a\r\n\r\n<p>x</p>\r\n\r\nb\r\n')
  })
})

describe('Hexo 認得的 ``` 程式碼區塊', () => {
  test('正常的區塊算，結尾寫成 ```sass 的不算（Hexo 會原樣輸出）', () => {
    const text = '<p>a</p>\n\n```sass\n$c: red\n```\n\n<h3>x</h3>\n\n```sass\nInvert($color)\n```sass\n\n<div>'
    assert.deepEqual([...hexoFenceStarts(text)], [2])
  })
})

describe('標籤', () => {
  const fm = (s) => `---\ntitle: T\n${s}\n---\n`
  test('只差大小寫的三組改成小寫，其他大寫標籤不動', () => {
    assert.equal(lowercaseTags(fm('tags: [css, Sass ]')).head, fm('tags: [css, sass ]'))
    assert.equal(lowercaseTags(fm('tags: [Vue, Cloudflare, side project]')).head, fm('tags: [vue, Cloudflare, side project]'))
    assert.equal(lowercaseTags(fm('tags: ["Bootstrap", css]')).head, fm('tags: ["bootstrap", css]'))
    assert.equal(lowercaseTags(fm('tags:\n  - SASS\n  - css')).head, fm('tags:\n  - sass\n  - css'))
    assert.equal(lowercaseTags(fm('tags: Vue')).head, fm('tags: vue'))
    for (const s of ['tags: [Claude Code, AI]', 'tags: #文章的tag', 'tags: [sass, vue]']) {
      const r = lowercaseTags(fm(s))
      assert.equal(r.head, fm(s))
      assert.equal(r.changed, 0)
    }
  })

  test('title、description、category 一字不動', () => {
    const head = '---\ntitle: Vue 與 Sass\ndescription: "Bootstrap: Vue"\ncategory: Vue\ntags: [Vue]\n---\n'
    const out = lowercaseTags(head).head
    assert.deepEqual(matter(out).data, { ...matter(head).data, tags: ['vue'] })
  })

  test('只差大小寫的標籤會被找出來', () => {
    assert.deepEqual(tagCaseCollisions([['css', 'Vue'], ['vue'], ['AI']]), [['Vue', 'vue']])
    assert.deepEqual(tagCaseCollisions([['css'], ['Claude Code']]), [])
  })
})

describe('iframe', () => {
  test('src 改 https、補 loading="lazy"', () => {
    assert.equal(fixIframes('<iframe src="http://codepen.io/x" width="100%"></iframe>').text, '<iframe src="https://codepen.io/x" width="100%" loading="lazy"></iframe>')
    assert.equal(fixIframes('<iframe src="//www.youtube.com/embed/a" > </iframe>').text, '<iframe src="https://www.youtube.com/embed/a" loading="lazy"> </iframe>')
    assert.equal(fixIframes('<iframe allowfullscreen="" src="https://a.b/c" width="1"></iframe>').text, '<iframe allowfullscreen="" src="https://a.b/c" width="1" loading="lazy"></iframe>')
  })

  test('沒關閉、自我結束的補上 </iframe>；中間隔空行的算已關閉', () => {
    assert.equal(fixIframes('<iframe src="https://a.b"/>\n<p>x</p>').text, '<iframe src="https://a.b" loading="lazy"></iframe>\n<p>x</p>')
    assert.equal(fixIframes('<iframe src="https://a.b">\n<p>x</p>').text, '<iframe src="https://a.b" loading="lazy"></iframe>\n<p>x</p>')
    assert.equal(fixIframes('<iframe src="https://a.b">\n\n</iframe>').text, '<iframe src="https://a.b" loading="lazy">\n\n</iframe>')
  })

  test('程式碼區塊、inline code、<script> 裡的不動；重跑不變', () => {
    const text = '```html\n<iframe src="http://a.b"></iframe>\n```\n\n`<iframe src="http://a.b">`\n\n<script>document.write(\'<iframe src="http://a.b">\')</script>'
    assert.equal(fixIframes(text).text, text)
    const once = fixIframes('<iframe src="http://a.b"></iframe>').text
    assert.equal(fixIframes(once).text, once)
    assert.equal(fixIframes(once).changed, 0)
  })
})

describe('<tbody>', () => {
  test('照瀏覽器的規則補上 <tbody>', () => {
    assert.equal(wrapTbody('<table>\n<tr><td>1</td></tr>\n</table>').text, '<table>\n<tbody><tr><td>1</td></tr>\n</tbody></table>')
    assert.equal(
      wrapTbody('<table><thead><tr><th>a</th></tr></thead><tr><td>1</td></tr></table>').text,
      '<table><thead><tr><th>a</th></tr></thead><tbody><tr><td>1</td></tr></tbody></table>'
    )
    assert.equal(
      wrapTbody('<table><tr><td><table><tr><td>2</td></tr></table></td></tr></table>').text,
      '<table><tbody><tr><td><table><tbody><tr><td>2</td></tr></tbody></table></td></tr></tbody></table>'
    )
  })

  test('已經有 <tbody>、在 <script> 或程式碼區塊裡的不動；重跑不變', () => {
    for (const s of ['<table><tbody><tr><td>1</td></tr></tbody></table>', "<script>$('#a').append('<table><tr>')</script>", '```html\n<table><tr><td>1</td></tr></table>\n```']) {
      assert.equal(wrapTbody(s).text, s)
    }
    const once = wrapTbody('<table><tr><td>1</td></tr></table>').text
    assert.equal(wrapTbody(once).text, once)
  })

  test('遮罩不改變長度與位置', () => {
    const s = 'a `<b>` <!-- c -->\n<style>.x{}</style>'
    const m = maskNonHtml(s)
    assert.equal(m.length, s.length)
    assert.equal(m.split('\n')[1], '<style>    </style>')
  })
})

describe('站內文章連結補尾斜線', () => {
  test('Markdown 連結指向文章網址卻少了尾斜線的補上，#錨點保留；程式碼與其他網址不動；重跑不變', async () => {
    const md = await createMd()
    const src = [
      '- [SVG 簡介](/d3js/2014/10/01/Ironman-30-days-02)',
      '- [多行',
      '](/gulp/2014/09/22/gulp-install)',
      '- [錨點](/css/2016/01/24/css-3d#2016年的冬天…)',
      '- [已經有斜線](/css/2016/01/24/css-3d/)、[分類](/categories/css)、[外站](https://a.com/x/2014/10/01/y)',
      '',
      '```md',
      '[程式碼裡的](/d3js/2014/10/01/Ironman-30-days-02)',
      '```',
      '',
      '`[inline](/d3js/2014/10/01/Ironman-30-days-02)`'
    ].join('\n')
    const r = fixPostLinkSlash(src, md)
    assert.equal(r.changed, 3)
    assert.ok(r.text.includes('](/d3js/2014/10/01/Ironman-30-days-02/)'))
    assert.ok(r.text.includes('](/gulp/2014/09/22/gulp-install/)'))
    assert.ok(r.text.includes('](/css/2016/01/24/css-3d/#2016年的冬天…)'))
    assert.ok(r.text.includes('[程式碼裡的](/d3js/2014/10/01/Ironman-30-days-02)\n'))
    assert.equal(fixPostLinkSlash(r.text, md).changed, 0)
  })
})

describe('個別修正', () => {
  test('套過的不會再套', () => {
    const body = '最常見的就是 <a> 連結，'
    const once = applyPatches('2016-12-06-css-status', body)
    assert.equal(once.body, '最常見的就是 `<a>` 連結，')
    assert.deepEqual(applyPatches('2016-12-06-css-status', once.body).applied, [])
  })

  test('新字串都不包含原字串（否則重跑會重複套用）', () => {
    for (const [stem, list] of Object.entries(PATCHES)) {
      for (const [why, from, to] of list) assert.ok(!to.includes(from), `${stem}：${why}`)
    }
  })

  test('front matter 用文字切開，CRLF 也可以', () => {
    assert.deepEqual(splitFrontMatter('---\r\ntitle: a\r\n---\r\nbody'), { head: '---\r\ntitle: a\r\n---\r\n', body: 'body' })
    assert.deepEqual(splitFrontMatter('no front matter'), { head: '', body: 'no front matter' })
  })
})

describe('要原樣輸出的範圍（用 VitePress 的 markdown-it）', () => {
  let md
  before(async () => {
    md = await createMd()
  })
  const blockTypes = (text) =>
    md
      .parse(splitFrontMatter(text).body, {})
      .filter((t) => t.level === 0 && t.nesting !== -1)
      .map((t) => t.type)

  test('舊文：拿掉讓 HTML 區塊結束的空行，<pre> 裡的空行保留，Hexo 的 ``` 照樣是程式碼', () => {
    const src = [
      '---',
      'title: t',
      '---',
      '<div class="demo">',
      '',
      '    <p>縮排四格</p>',
      '',
      '一般文字 <code>x</code>',
      '</div>',
      '<div><pre>',
      'a',
      '',
      'b',
      '</pre></div>',
      '',
      '```sass',
      '$c: red',
      '```',
      '',
      '<h3>x</h3>',
      '',
      '```sass',
      'Invert($color)',
      '```sass',
      '',
      '<p>end</p>'
    ].join('\n')
    const { text, report } = migrateText(src, { stem: 't', legacy: true, md })
    assert.deepEqual(report.issues, [])
    assert.ok(blockTypes(text).every((t) => t === 'html_block' || t === 'fence'), blockTypes(text).join(','))
    assert.equal(blockTypes(text).filter((t) => t === 'fence').length, 1)
    assert.match(text, /<pre>\na\n\nb\n<\/pre>/)
    assert.match(text, /\n```sass\nInvert\(\$color\)\n```sass\n/)
    assert.equal(migrateText(text, { stem: 't', legacy: true, md }).text, text)
  })

  test('raw：內容整段是 HTML 區塊，前後的 Markdown 照常解析', () => {
    const src = '---\ntitle: t\n---\n說明\n{% raw %}\n<div class="demo">\n\n<span>a</span>\n</div>\n{% endraw %}\n> 註解 **粗體**\n'
    const { text, report } = migrateText(src, { stem: 't', md })
    assert.equal(report.rawTags, 2)
    assert.equal(splitFrontMatter(text).body, '說明\n\n<div class="demo">\n<span>a</span>\n</div>\n\n> 註解 **粗體**\n')
    assert.deepEqual(blockTypes(text), ['paragraph_open', 'html_block', 'blockquote_open'])
  })

  test('raw 的內容以行內標籤開頭：開始標籤獨立成一行', () => {
    const src = '---\ntitle: t\n---\n小 Demo\n\n{% raw %}\n<a class="jsbin-embed" href="https://jsbin.com/x">JS Bin</a>\n{% endraw %}\n'
    const { text } = migrateText(src, { stem: 't', md })
    assert.equal(splitFrontMatter(text).body, '小 Demo\n\n<a class="jsbin-embed" href="https://jsbin.com/x">\nJS Bin</a>\n')
    assert.deepEqual(blockTypes(text), ['paragraph_open', 'html_block'])
  })
})

// 以下檢查 repo 裡的文章已經轉換過（P2 同步閘門帶回新文章後，沒跑 migrate 會在這裡失敗）
describe('source/ 的現況', () => {
  const files = defaultFiles()
  const read = (f) => fs.readFileSync(f, 'utf8')

  test('沒有 .html 文章，53 篇舊文都是 .md', () => {
    assert.deepEqual(fs.readdirSync(postsDir).filter((f) => f.endsWith('.html')), [])
    assert.equal(LEGACY_HTML.size, 53)
    for (const stem of LEGACY_HTML) assert.ok(fs.existsSync(path.join(postsDir, `${stem}.md`)), stem)
  })

  test('沒有 raw、endraw', () => {
    const left = files.filter((f) => read(f).split('\n').some((l) => RAW_LINE_RE.test(l)))
    assert.deepEqual(left, [])
  })

  test('沒有只差大小寫的標籤，sass、bootstrap、vue 都是小寫', () => {
    const lists = files.filter((f) => f.startsWith(postsDir)).map((f) => {
      const t = matter(read(f)).data.tags
      return (t == null ? [] : [t].flat()).map(String)
    })
    assert.deepEqual(tagCaseCollisions(lists), [])
    assert.ok(!lists.flat().some((t) => ['Sass', 'Bootstrap', 'Vue'].includes(t)))
  })

  test('iframe 都是 https、有 loading="lazy"、有關閉', () => {
    const bad = []
    for (const f of files) {
      const text = read(f)
      const masked = maskNonHtml(text)
      for (const m of masked.matchAll(/<iframe\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi)) {
        const tag = text.slice(m.index, m.index + m[0].length)
        const rest = masked.slice(m.index + m[0].length)
        const close = rest.search(/<\/iframe\s*>/i)
        const next = rest.search(/<iframe\b/i)
        const closed = close !== -1 && (next === -1 || close < next)
        if (!/\ssrc="https:\/\//.test(tag) || !/\sloading="lazy"/.test(tag) || !closed) bad.push(`${path.basename(f)}：${tag}`)
      }
    }
    assert.deepEqual(bad, [])
  })

  describe('需要 markdown-it 的檢查', () => {
    let md
    before(async () => {
      md = await createMd()
    })

    test('每一篇都已經轉換過（再跑一次不會變）', () => {
      const pending = []
      for (const f of files) {
        const stem = path.basename(f).replace(/\.(md|html)$/, '')
        const before = read(f)
        if (migrateText(before, { stem, legacy: LEGACY_HTML.has(stem), md }).text !== before) pending.push(path.relative(root, f))
      }
      assert.deepEqual(pending, [])
    })

    test('舊文整篇都在 HTML 區塊或 Hexo 認得的程式碼區塊裡', () => {
      const bad = []
      for (const stem of LEGACY_HTML) {
        const { body } = splitFrontMatter(read(path.join(postsDir, `${stem}.md`)))
        const fences = hexoFenceStarts(body)
        for (const t of md.parse(body, {})) {
          if (t.level !== 0 || t.nesting === -1 || t.type === 'html_block') continue
          if (t.type === 'fence' && fences.has(t.map[0])) continue
          bad.push(`${stem}:${t.map?.[0]} ${t.type}`)
        }
      }
      assert.deepEqual(bad, [])
    })
  })
})
