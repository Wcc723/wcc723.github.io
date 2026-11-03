#!/usr/bin/env node
// Hexo 內文轉成 VitePress 編譯得過的 Markdown。P1 遷移的第一棒，只做機械性轉換；
// 原始 <script>、<style> 與示範程式留給下一棒。做法與理由見 workspace 計畫「遷移：Hexo 到 VitePress」。
//
// 用法：
//   node scripts/migrate-hexo.mjs                    轉換 source/_posts/ 全部文章與 source/about/*.md
//   node scripts/migrate-hexo.mjs <檔案...>           只轉換指定檔案（P2 同步閘門用），.html 會先改名成 .md
//   node scripts/migrate-hexo.mjs --check [檔案...]   只檢查不寫檔：還有要轉換的地方、或有錯誤就 exit 1
//
// 冪等：轉換過的檔案再跑一次不會再變。
//
// 轉換項目（照執行順序）：
//   1. 標籤：只差大小寫的 sass、bootstrap、vue 改成小寫，只動 front matter 的 tags 那幾行，不重排 YAML。
//      全部文章裡還有只差大小寫的標籤就報錯，之後的新文章也會被擋。
//   2. 個別修正（PATCHES）：舊文的 HTML 標籤錯誤、marked 與 CommonMark 的強調、清單、inline code 差異、
//      css-status 的 <a>、install-nvm 的 {{ version }}。
//   3. 刪掉 {% raw %}、{% endraw %} 整行。
//   4. 要原樣輸出的範圍：.html 舊文整篇（Hexo 對 .html 不跑 marked，只把它認得的 ``` 轉成程式碼）和 raw 的內容
//      （Hexo 不交給 marked）。markdown-it 遇到空行就結束 HTML 區塊，下一行不是 HTML 開頭就會變成段落或縮排
//      程式碼，所以拿掉這種空行；空行在 <pre>、<textarea> 裡時改成讓 <pre> 自成一個 HTML 區塊；以行內標籤開頭的
//      行把開始標籤獨立成一行；Hexo 認得的 ``` 前面補空行。用 VitePress 的 markdown-it 逐次檢查，顯示的文字跟 Hexo 版相同。
//   5. iframe：src 改成 https（含 // 開頭），補上 </iframe>，加 loading="lazy"。
//   6. <table> 底下直接放的 <tr> 補上瀏覽器本來就會補的 <tbody>，SSR 的 hydration 才對得上。
//   7. Markdown 連結指向站內文章網址卻少了尾斜線的，補上尾斜線（VitePress 的 dead link 檢查找得到頁面，線上也不用多一次 301）。
//   8. source/_posts/ 的 .html 改名成 .md（git mv 保留歷史）。
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'source')
const postsDir = path.join(srcDir, '_posts')

// ---------------------------------------------------------------------------
// raw、endraw

// 每個標籤各自獨佔一行（112 篇 311 對，about/hexschool-traning 1 對）；容許前後空白、CRLF 與 {%- -%}。
export const RAW_LINE_RE = /^[ \t]*\{%-?[ \t]*(end)?raw[ \t]*-?%\}[ \t]*\r?$/

const isBlank = (line) => line == null || /^[ \t]*\r?$/.test(line)

// 回傳 { lines, removed }。lines 的每一行是 { text, verbatim }，verbatim 表示在 raw 裡。
// 標籤的前後都不是空行時留一個空行（Hexo 在那裡也只剩一個空行）：raw 的內容才會自成 HTML 區塊，
// 不會被併進前面的段落（<video> 這類行內標籤會被插入 <br>），後面的 Markdown 也不會被併進 HTML 區塊。
export function removeRawTags(lines) {
  const out = []
  let removed = 0
  let inRaw = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = RAW_LINE_RE.exec(line.text)
    if (!m) {
      out.push({ ...line, verbatim: line.verbatim || inRaw })
      continue
    }
    removed++
    const prev = out[out.length - 1]
    if (prev && !isBlank(prev.text) && !isBlank(lines[i + 1]?.text)) out.push({ text: line.text.endsWith('\r') ? '\r' : '', verbatim: line.verbatim })
    inRaw = !m[1]
  }
  return { lines: out, removed }
}

// ---------------------------------------------------------------------------
// Hexo 認得的 ``` 程式碼區塊（hexo 8.1.2 的 before_post_render/backtick_code_block.js，原樣照抄）

const HEXO_BACKTICK_RE = /^((?:(?:[^\S\r\n]*>){0,3}|[-*+]|[0-9]+\.)[^\S\r\n]*)(`{3,}|~{3,})[^\S\r\n]*((?:.*?[^`\s])?)[^\S\r\n]*\n((?:[\s\S]*?\n)?)(?:(?:[^\S\r\n]*>){0,3}[^\S\r\n]*)\2[^\S\r\n]?(\n+|$)/gm

// 回傳 Hexo 會轉成程式碼的區塊開頭行號（0 起算）
export function hexoFenceStarts(text) {
  const starts = new Set()
  for (const m of text.matchAll(HEXO_BACKTICK_RE)) starts.add(text.slice(0, m.index).split('\n').length - 1)
  return starts
}

// ---------------------------------------------------------------------------
// 標籤

// 只差大小寫的三組，一律改成小寫（站長 2026-11-03 決定，sass 71、bootstrap 17、vue 4 篇）
export const LOWERCASE_TAGS = new Set(['sass', 'bootstrap', 'vue'])

// front matter 文字裡的 tags 改成小寫；只動 tags，不重排 YAML。回傳 { head, changed }
export function lowercaseTags(head) {
  const lines = head.split('\n')
  let changed = 0
  // 一個值（可能有引號、前後空白）
  const fixItem = (item) =>
    item.replace(/^(\s*)(['"]?)(.*?)\2(\s*)$/, (all, a, q, name, b) => {
      if (!LOWERCASE_TAGS.has(name.toLowerCase()) || name === name.toLowerCase()) return all
      changed++
      return a + q + name.toLowerCase() + q + b
    })
  // 行內寫法：[a, b] 或單一值；後面的 # 註解不動
  const fix = (value) => {
    const m = /^(\s*\[)([^\]]*)(\][\s\S]*)$/.exec(value)
    if (m) return m[1] + m[2].split(',').map(fixItem).join(',') + m[3]
    const c = /^([^#]*?)(\s+#.*)?$/.exec(value)
    return fixItem(c[1]) + (c[2] ?? '')
  }
  for (let i = 0; i < lines.length; i++) {
    const m = /^tags:(.*)$/.exec(lines[i])
    if (!m) continue
    if (m[1].trim() && !m[1].trim().startsWith('#')) {
      lines[i] = 'tags:' + fix(m[1])
    } else {
      // 區塊清單：- tag
      for (let j = i + 1; j < lines.length && /^\s*-\s/.test(lines[j]); j++) {
        lines[j] = lines[j].replace(/^(\s*-\s+)(.*?)(\s*\r?)$/, (all, a, v, b) => a + fix(v) + b)
      }
    }
  }
  return { head: lines.join('\n'), changed }
}

// 所有文章的標籤 → 只差大小寫的組合，例 [['Vue', 'vue']]。之後的新文章也靠這個擋。
export function tagCaseCollisions(tagLists) {
  const forms = new Map()
  for (const tags of tagLists) {
    for (const t of tags) {
      const k = String(t).toLowerCase()
      if (!forms.has(k)) forms.set(k, new Set())
      forms.get(k).add(String(t))
    }
  }
  return [...forms.values()].filter((s) => s.size > 1).map((s) => [...s].sort())
}

// ---------------------------------------------------------------------------
// iframe 與表格：只改 HTML，程式碼區塊、inline code、<script>、<style>、註解裡的是教學內容或程式，不動

// 只留下 HTML 的部分，其他換成等長的空白（位置不變）。有 md 時用 markdown-it 找出 ``` 與縮排程式碼區塊。
export function maskNonHtml(text, md) {
  const lines = text.split('\n')
  const kind = lines.map(() => 'md')
  if (md) {
    for (const t of md.parse(text, {})) {
      if (!t.map || t.level !== 0) continue
      const k = t.type === 'fence' || t.type === 'code_block' ? 'code' : t.type === 'html_block' ? 'html' : null
      if (k) for (let i = t.map[0]; i < t.map[1]; i++) kind[i] = k
    }
  } else {
    let fence = null
    lines.forEach((line, i) => {
      const f = /^ {0,3}(`{3,}|~{3,})/.exec(line)
      if (fence) {
        kind[i] = 'code'
        if (f && f[1][0] === fence[0] && f[1].length >= fence.length && /^ {0,3}(`{3,}|~{3,})\s*\r?$/.test(line)) fence = null
      } else if (f) {
        kind[i] = 'code'
        fence = f[1]
      }
    })
  }
  const blank = (s) => s.replace(/[^\n]/g, ' ')
  const masked = lines
    .map((line, i) => (kind[i] === 'code' ? blank(line) : kind[i] === 'md' ? line.replace(/(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g, blank) : line))
    .join('\n')
  return masked
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/(<(script|style|textarea)\b(?:[^>"']|"[^"]*"|'[^']*')*>)([\s\S]*?)(?=<\/\2\s*>)/gi, (all, open, name, body) => open + blank(body))
}

// src 改成 https（含 // 開頭）、補上 </iframe>、加 loading="lazy"
export function fixIframes(text, md) {
  let changed = 0
  const masked = maskNonHtml(text, md)
  let out = ''
  let last = 0
  const re = /<iframe\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi
  let m
  while ((m = re.exec(masked))) {
    const start = m.index
    const end = re.lastIndex
    let attrs = text.slice(start + 7, end - 1)
    const before = attrs
    let selfClosing = false
    if (/\/\s*$/.test(attrs)) {
      selfClosing = true
      attrs = attrs.replace(/\s*\/\s*$/, '')
    }
    attrs = attrs.replace(/(\ssrc\s*=\s*)(["']?)(?:http:)?\/\/(?=[^\s"'>])/i, (all, a, q) => `${a}${q}https://`)
    if (!/\sloading\s*=/i.test(attrs)) attrs = attrs.replace(/\s*$/, '') + ' loading="lazy"'
    // 下一個 <iframe> 之前有 </iframe> 才算有關閉；<iframe /> 在 HTML 裡不算關閉
    const closed = !selfClosing && closesBeforeNextIframe(masked.slice(end))
    let tag = `<iframe${attrs}>`
    if (!closed) tag += '</iframe>'
    if (attrs !== before || !closed) changed++
    out += text.slice(last, start) + tag
    last = end
  }
  out += text.slice(last)
  return { text: out, changed }
}

// 站內文章連結少了尾斜線（例：](/gulp/2014/09/22/gulp-install)）：GitHub Pages 要先 301 補斜線（還會先跳到 http://），
// VitePress 的 dead link 檢查也找不到頁面而讓 build 失敗。只改 Markdown 連結裡文章網址形狀的路徑；
// 程式碼區塊、inline code、註解、<script> 裡的不動（用 maskNonHtml 遮掉，位置不變）。
const POST_LINK_RE = /(\]\(\s*)(\/[^/\s()]+\/\d{4}\/\d{2}\/\d{2}\/[^/\s()#?"]+)(?=(?:#[^\s)]*)?\))/g
export function fixPostLinkSlash(text, md) {
  const masked = maskNonHtml(text, md)
  const at = []
  for (const m of masked.matchAll(POST_LINK_RE)) at.push(m.index + m[1].length + m[2].length)
  let out = text
  for (const i of at.reverse()) out = out.slice(0, i) + '/' + out.slice(i)
  return { text: out, changed: at.length }
}

function closesBeforeNextIframe(rest) {
  const close = rest.search(/<\/iframe\s*>/i)
  if (close === -1) return false
  const next = rest.search(/<iframe\b/i)
  return next === -1 || close < next
}

// <table> 底下直接放 <tr>：瀏覽器解析時會自己補 <tbody>，Vue 的 SSR 輸出卻沒有，hydration 會對不上。
// 照瀏覽器的規則把 <tbody> 寫出來，畫面與 DOM 都跟原本相同。
export function wrapTbody(text, md) {
  const masked = maskNonHtml(text, md)
  const inserts = []
  const re = /<(\/?)(table|thead|tbody|tfoot|tr)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi
  const stack = [] // 每層 table 的狀態：{ section, implied }
  let m
  while ((m = re.exec(masked))) {
    const close = m[1] === '/'
    const name = m[2].toLowerCase()
    const top = stack[stack.length - 1]
    if (name === 'table') {
      if (!close) stack.push({ section: null, implied: false })
      else if (top) {
        if (top.implied) inserts.push([m.index, '</tbody>'])
        stack.pop()
      }
      continue
    }
    if (!top) continue
    if (name === 'tr') {
      if (!close && !top.section) {
        inserts.push([m.index, '<tbody>'])
        top.section = 'tbody'
        top.implied = true
      }
      continue
    }
    // thead、tbody、tfoot
    if (!close) {
      if (top.implied) inserts.push([m.index, '</tbody>'])
      top.section = name
      top.implied = false
    } else if (top.section === name) {
      top.section = null
    }
  }
  let out = text
  for (const [at, s] of inserts.sort((a, b) => b[0] - a[0])) out = out.slice(0, at) + s + out.slice(at)
  return { text: out, changed: inserts.filter(([, s]) => s === '<tbody>').length }
}

// ---------------------------------------------------------------------------
// 要原樣輸出的範圍：拿掉讓 HTML 區塊提早結束的空行

const PRE_OPEN_RE = /<(pre|textarea)(?=[\s>])/gi
const PRE_CLOSE_RE = /<\/(pre|textarea)\s*>/gi

// 第 k 行開頭時，是否在還沒關閉的 <pre> 或 <textarea> 裡；回傳那個開始標籤的位置 { line, col } 或 null
function openPreAt(lines, from, k) {
  const stack = []
  for (let i = from; i < k; i++) {
    const t = lines[i].text
    const events = []
    for (const m of t.matchAll(PRE_OPEN_RE)) events.push({ col: m.index, open: true })
    for (const m of t.matchAll(PRE_CLOSE_RE)) events.push({ col: m.index, open: false })
    events.sort((a, b) => a.col - b.col)
    for (const e of events) {
      if (e.open) stack.push({ line: i, col: e.col })
      else stack.pop()
    }
  }
  return stack.length ? stack[0] : null
}

// md 是 VitePress 的 markdown-it。lines 裡 verbatim 的行要全部落在 html_block（或 Hexo 認得的程式碼區塊）裡。
// 一次修一個地方、重新解析，直到沒有可以修的問題。修不了的：只多一層 <p>、內容一字不變的單行段落記在 notes，
// 其他記在 issues（要手動處理）。
export function fixVerbatim(md, lines, { maxRounds = 2000 } = {}) {
  const stats = { blankRemoved: 0, blankAdded: 0, preSplit: 0, tagSplit: 0 }
  const issues = []
  const notes = []
  const skip = new Set()
  const giveUp = (problem, note) => {
    const { line: k, type, end } = problem
    skip.add(lines[k])
    const src = lines.slice(k, end).map((l) => l.text.trim())
    const item = { line: k, type, text: lines[k].text.slice(0, 80) }
    if (type === 'paragraph_open' && src.length === 1 && md.renderInline(src[0]) === src[0]) notes.push({ ...item, note: '多一層 <p>，內容不變' })
    else issues.push(note ? { ...item, note } : item)
  }
  for (let round = 0; ; round++) {
    const problem = findVerbatimProblem(md, lines, skip)
    if (!problem) break
    if (round === maxRounds) {
      issues.push({ line: problem.line, type: problem.type, text: lines[problem.line].text.slice(0, 80), note: `修了 ${maxRounds} 次仍未收斂` })
      break
    }
    const { line: k, type, prev } = problem
    if (type === 'missing-fence') {
      // Hexo 轉成程式碼的 ``` 被併進前面的 HTML 區塊：前面補空行
      lines.splice(k, 0, { text: '', verbatim: true })
      stats.blankAdded++
      continue
    }
    const regionStart = regionStartOf(lines, k)
    const p = prevNonBlank(lines, k)
    const atBlockStart = p < k - 1 || (prev?.type === 'html_block' && prev.end === k) || prev?.type === 'fence'
    if (p < regionStart || p === k - 1) {
      // 緊接在 <pre>、<script>、<style> 這種自成一塊的 HTML 後面：把那一塊併進更前面的 HTML 區塊
      if (p === k - 1 && prev?.type === 'html_block' && prev.end === k && canMerge(lines, prev, regionStart)) {
        const q = prevNonBlank(lines, prev.start)
        const n = prev.start - q - 1
        lines.splice(q + 1, n)
        stats.blankRemoved += n
        continue
      }
      // 這一行以行內標籤開頭（<a>、<label>、<video>…）：開始標籤自己一行，就成了 HTML 區塊
      if (atBlockStart && type === 'paragraph_open' && splitLeadingTag(lines, k)) {
        stats.tagSplit++
        continue
      }
      giveUp(problem)
      continue
    }
    const pre = openPreAt(lines, regionStart, k)
    if (pre) {
      // 空行在 <pre> 裡：讓 <pre> 從行首開始一個新的 HTML 區塊，空行保留
      const text = lines[pre.line].text
      if (/^ {0,3}$/.test(text.slice(0, pre.col))) {
        if (pre.line > 0 && !isBlank(lines[pre.line - 1].text)) {
          lines.splice(pre.line, 0, { text: '', verbatim: true })
          stats.blankAdded++
          continue
        }
      } else {
        lines.splice(pre.line, 1, { ...lines[pre.line], text: text.slice(0, pre.col) }, { text: '', verbatim: true }, { ...lines[pre.line], text: text.slice(pre.col) })
        stats.preSplit++
        continue
      }
      giveUp(problem, '<pre> 已在區塊開頭仍無法保留空行')
      continue
    }
    const n = k - p - 1
    lines.splice(p + 1, n)
    stats.blankRemoved += n
  }
  return { lines, stats, issues, notes }
}

// CommonMark 的開始標籤（markdown-it 的 HTML 區塊第 7 種：一行只有一個完整的開始或結束標籤）
const OPEN_TAG_RE = /^( {0,3}<([A-Za-z][A-Za-z0-9-]*)(?:\s+[a-zA-Z_:][a-zA-Z0-9_.:-]*(?:\s*=\s*(?:[^"'=<>`\x00-\x20]+|'[^']*'|"[^"]*"))?)*\s*\/?>)(.+)$/

function splitLeadingTag(lines, k) {
  const m = OPEN_TAG_RE.exec(lines[k].text)
  if (!m || /^(script|style|pre|textarea)$/i.test(m[2]) || !m[3].trim()) return false
  lines.splice(k, 1, { ...lines[k], text: m[1] }, { ...lines[k], text: m[3], hexoFence: false })
  return true
}

function prevNonBlank(lines, k) {
  let p = k - 1
  while (p >= 0 && isBlank(lines[p].text)) p--
  return p
}

// 自成一塊的 HTML（<pre>、<script>、<style>、<textarea>、註解）能不能併進前面的 HTML 區塊：
// 前面隔著空行是一般的 HTML 區塊（遇空行才結束的那種），而且這一塊不是裡面有空行的 <pre>、<textarea>。
function canMerge(lines, block, regionStart) {
  const first = lines[block.start].text
  if (!/^ {0,3}<(pre|script|style|textarea|!--)/i.test(first)) return false
  const body = lines.slice(block.start, block.end)
  if (/^ {0,3}<(pre|textarea)/i.test(first) && body.some((l) => isBlank(l.text))) return false
  const q = prevNonBlank(lines, block.start)
  if (q < regionStart || q === block.start - 1) return false
  const before = blockContaining(lines, q)
  return before != null && !/^ {0,3}<(pre|script|style|textarea|!--|\?|![A-Za-z]|!\[CDATA\[)/i.test(lines[before].text)
}

// 第 q 行所屬 HTML 區塊的第一行（往上找到空行為止）；不是 HTML 開頭就回傳 null
function blockContaining(lines, q) {
  let i = q
  while (i > 0 && !isBlank(lines[i - 1].text)) i--
  return /^ {0,3}<[/A-Za-z!?]/.test(lines[i].text) ? i : null
}

function regionStartOf(lines, k) {
  let i = k
  while (i > 0 && lines[i - 1].verbatim) i--
  return i
}

// 找第一個落在 verbatim 範圍、卻不是 html_block 的區塊 token。prev 是它前面那一個區塊 { type, start, end }。
function findVerbatimProblem(md, lines, skip) {
  const text = lines.map((l) => l.text).join('\n')
  const tokens = md.parse(text, {})
  const fenceOk = new Set()
  for (let i = 0; i < lines.length; i++) if (lines[i].hexoFence) fenceOk.add(i)
  const seenFence = new Set()
  let prev = null
  for (const t of tokens) {
    if (!t.map || t.level !== 0 || t.nesting === -1) continue
    const [s, e] = t.map
    if (t.type === 'fence') seenFence.add(s)
    const ok = !lines[s]?.verbatim || t.type === 'html_block' || (t.type === 'fence' && fenceOk.has(s)) || skip.has(lines[s])
    if (!ok) return { line: s, end: e, type: t.type, prev }
    prev = { type: t.type, start: s, end: e }
  }
  for (const s of fenceOk) {
    if (!seenFence.has(s) && lines[s].verbatim && !skip.has(lines[s])) {
      if (s > 0 && !isBlank(lines[s - 1].text)) return { line: s, type: 'missing-fence' }
      skip.add(lines[s])
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// 個別修正：key 是檔名去掉副檔名。每項 [說明, 原字串, 新字串]，原字串找不到就略過（已經修過）。

export const PATCHES = {
  // 舊文的 HTML 標籤錯誤。原則：瀏覽器解析後的畫面與文字跟 Hexo 版相同，Vue 才編譯得過、hydration 才對得上。
  '2013-08-21-jpg-and-svg': [
    ['<svg> 裡的 <path>、<image> 沒有結束（照原意改成自我結束）', '<path d="M5 1v14l9-7">\n    <image src="/next.png">\n</svg>', '<path d="M5 1v14l9-7"/>\n    <image src="/next.png"/>\n</svg>'],
    // <svg> 裡出現 <img>：瀏覽器會先結束 <svg>，<img> 變成 <svg> 後面的兄弟元素，多出來的 </svg> 被忽略
    ['<svg> 裡的 <img> 照瀏覽器的解析結果移到 </svg> 後面', '\t<img xlink:href="https://img.casper.tw/images/20130821.svg" src="https://img.casper.tw/images/20130821.png" width="75" height="75"/></svg>', '\t</svg><img xlink:href="https://img.casper.tw/images/20130821.svg" src="https://img.casper.tw/images/20130821.png" width="75" height="75"/>']
  ],
  '2013-08-23-web-font': [
    ['表格第一列的 <tr> 寫在 </thead> 前面，移到 <tbody> 後面', '      </tr>\n<tr>\n</thead>\n<tbody>\n<td>Basic support</td>', '      </tr>\n</thead>\n<tbody>\n<tr>\n<td>Basic support</td>']
  ],
  '2013-08-26-sass-hsl-funtion': [
    ['最後一個 <div class="d0826 demo"> 補上 </div>', '<div class="invert">complement($color)= #0f698e</div>\n', '<div class="invert">complement($color)= #0f698e</div></div>\n']
  ],
  '2013-11-05-js-json3': [
    // <pre> 裡沒有跳脫的 <tr><td> 會被瀏覽器丟掉（線上看不到），Vue 卻會建出元素，hydration 對不上；
    // 跟 css-status 的 <a> 同樣處理：跳脫成文字，讓程式碼照原意顯示
    // 只改 <pre> 裡那一行（後面接著註解）；<script> 裡同樣的一行是真的程式，不動
    ["<pre> 裡的 '<tr><td>' 跳脫成文字", "list = '<tr><td>'+ item.SiteName+'</td><td>'+ item.PublishTime+'</td><td>'+ item.TWD97Lon+'</td><td>'+ item.UVI+'</td></tr>';\n\t\t\t//利用item.值", "list = '&lt;tr&gt;&lt;td&gt;'+ item.SiteName+'&lt;/td&gt;&lt;td&gt;'+ item.PublishTime+'&lt;/td&gt;&lt;td&gt;'+ item.TWD97Lon+'&lt;/td&gt;&lt;td&gt;'+ item.UVI+'&lt;/td&gt;&lt;/tr&gt;';\n\t\t\t//利用item.值"]
  ],
  '2014-10-02-Ironman-30-days-03': [
    ['Polygon 範例多一個 </svg>（瀏覽器本來就忽略）', '\t<polygon points="240,0 260,60 200,60 240,0" style="fill:none; stroke:red; stroke-width:2"/>\n</svg>\n</svg>\n', '\t<polygon points="240,0 260,60 200,60 240,0" style="fill:none; stroke:red; stroke-width:2"/>\n</svg>\n']
  ],
  // Hexo 線上就壞掉的站內連結（VitePress 的 dead link 檢查會讓 build 失敗）。目標都很明確，改成正確的站內網址，連結文字不動
  '2014-10-27-Ironman-30-days-28': [
    ['連結少了開頭的 /，還多了 casper/，線上是 404', '](casper/d3js/2014/10/26/Ironman-30-days-27/)', '](/d3js/2014/10/26/Ironman-30-days-27/)']
  ],
  '2018-11-13-ironman-final': [
    ['系列目錄的「網路字體運用」沒填網址，線上是 404', '[網路字體運用](網路字體運用)', '[網路字體運用](/design/2018/10/26/web-fonts/)'],
    ['系列目錄的「圖片格式的運用」沒填網址，線上是 404', '[圖片格式的運用](圖片格式的運用)', '[圖片格式的運用](/design/2018/10/28/image-format/)']
  ],
  '2023-10-15-ironman-collection': [
    ['補充文件連到作者電腦上的 Hexo 預覽（localhost:4000），改成同一篇的正式網址', '](http://localhost:4000/development/2023/09/29/fireabase-storage/)', '](/development/2023/09/29/fireabase-storage/)']
  ],
  '2017-12-08-javascript-typeof': [
    // Hexo 輸出 <a href="[雙精度浮點數…](https://…">浮點數</a>)：href 是站內的亂碼網址（線上 404），後面多一個 )；
    // markdown-it 則把整段照字面顯示成 [浮點數](…)。改成原意的維基百科連結，連結文字不動
    ['「浮點數」的連結網址裡又包了一層 Markdown 連結，線上是 404', '[浮點數]([雙精度浮點數 - 維基百科，自由的百科全書](https://zh.wikipedia.org/wiki/%E9%9B%99%E7%B2%BE%E5%BA%A6%E6%B5%AE%E9%BB%9E%E6%95%B8))', '[浮點數](https://zh.wikipedia.org/wiki/%E9%9B%99%E7%B2%BE%E5%BA%A6%E6%B5%AE%E9%BB%9E%E6%95%B8)']
  ],
  // marked 與 markdown-it（CommonMark）的強調語法差異：同一段 Markdown，Hexo 線上是粗體或斜體，markdown-it 卻照字面顯示 * 或 _。
  // 照 Hexo 線上的結果改寫成 HTML 的 <strong>、<em>，讀者看到的跟原本一樣（audit 的 content 檢查比的就是這個）。
  '2013-12-24-css-transform': [
    ['圖說的結尾 * 前面有空白，CommonMark 不算斜體（Hexo 是 <em>）', '*圖片來源：英雄聯盟 *', '<em>圖片來源：英雄聯盟 </em>']
  ],
  '2016-01-16-I-love-css': [
    ['「 * . * 」CommonMark 不算斜體，Hexo 線上是斜體的「 . 」', '的作品 * . * ，', '的作品 <em> . </em> ，']
  ],
  '2020-09-22-javascript-training-1st': [
    ['粗體裡有一個照字面的 *，markdown-it 的解析跟 Hexo 不同（Hexo 是整段粗體、* 照字面）', '「**只要人數更多，就越能達到 *N 的吸收效果**」', '「<strong>只要人數更多，就越能達到 *N 的吸收效果</strong>」']
  ],
  '2020-10-08-custom-bootstrap-style': [
    ['** 緊接在中文字後面又接 _，CommonMark 不算粗體（Hexo 是 <strong>）', '將**_variables.scss 的變數進行替換**。', '將<strong>_variables.scss 的變數進行替換</strong>。']
  ],
  '2020-10-16-async-await': [
    ['結尾 ** 緊貼全形冒號後面又接中文字，CommonMark 不算粗體（Hexo 是 <strong>）', '**重要：**當使用', '<strong>重要：</strong>當使用']
  ],
  // 清單：marked 把縮排 2 格的子清單當成巢狀，CommonMark 要對齊上一層的內容欄（「5. 」是 3 格），不然巢狀會被攤平；
  // 兩段清單中間只隔空行時，CommonMark 會合成一個寬鬆清單（每個 li 多包一層 <p>）。照 Hexo 線上的結構改寫，文字不動
  '2023-10-04-nodejs-github-action': [
    ['步驟 5 的子清單縮排 2 格，CommonMark 攤平成外層的 6、7，後面的「6. 設置權限」變成 8（Hexo 是 5 底下的 1、2）', '5. 接下來將公鑰加入至 Server 中\n  1. `cat ~/.ssh/id_rsa.pub`', '5. 接下來將公鑰加入至 Server 中\n   1. `cat ~/.ssh/id_rsa.pub`'],
    ['同上，子清單第 2 項', '查看公鑰並複製\n  2. 執行指令', '查看公鑰並複製\n   2. 執行指令']
  ],
  '2020-03-08-flex-size': [
    ['「3. 重新分配：」底下的項目符號縮排 2 格，CommonMark 變成清單外另一個 ul（Hexo 是 3 底下的子清單）', '3. 重新分配：\n  - 右方元素', '3. 重新分配：\n   - 右方元素'],
    ['同上，子清單第 2 項', '= 200px\n  - 中間元素(basis', '= 200px\n   - 中間元素(basis']
  ],
  'hexschool-traning': [
    ['兩段學員心得清單中間只隔兩個空行，CommonMark 合成一個寬鬆清單；加一個 HTML 註解分開（Hexo 是兩個緊湊清單）', '螢幕推薦(?)等。\n\n\n- [Iven Liu]', '螢幕推薦(?)等。\n\n<!-- 兩段清單分開（CommonMark 的空行不會結束清單） -->\n\n- [Iven Liu]']
  ],
  // inline code 裡有反引號：marked 輸出 <code>Ctrl + \`</code>，CommonMark 的 code span 不認反斜線跳脫，
  // 單一反引號找不到結尾，整段照字面顯示成「`Ctrl + ``」。改用雙反引號包住，顯示原意的 Ctrl + `（快捷鍵本身沒有反斜線）
  '2017-03-03-vscode-for-mac': [
    ['「Ctrl + `」的 inline code 改用雙反引號，CommonMark 才認得', '按下 `Ctrl + \\`` 後', '按下 `` Ctrl + ` `` 後']
  ],
  '2015-11-25-better-jekyll-markdown-editor': [
    ['圖片網址裡有空白，markdown-it 不認這張圖（Hexo 照樣輸出 <img>），網址改用 <> 包起來', '![](https://img.casper.tw/images/2015/11/screen_shot 2015-11-25_0.png)', '![](<https://img.casper.tw/images/2015/11/screen_shot 2015-11-25_0.png>)']
  ],
  // 計畫「遷移」的個別修正
  '2016-12-06-css-status': [['內文的 <a> 加反引號（Hexo 版被當成標籤吃掉）', '最常見的就是 <a> 連結', '最常見的就是 `<a>` 連結']],
  '2022-01-10-install-nvm': [
    // Hexo 的 Nunjucks 把 {{ version }} 吃掉了（線上顯示「nvm install ：」），包 v-pre 讓佔位字重新顯示
    ['{{ version }} 包 v-pre（nvm install）', '- nvm install {{ version }}：', '- nvm install <span v-pre>{{ version }}</span>：'],
    ['{{ version }} 包 v-pre（nvm use）', '- nvm use {{ version }}：', '- nvm use <span v-pre>{{ version }}</span>：'],
    ['{{ version }} 包 v-pre（nvm alias default）', '- nvm alias default {{ version }}：', '- nvm alias default <span v-pre>{{ version }}</span>：'],
    ['{{ version }} 包 v-pre（nvm uninstall）', '- nvm uninstall {{ version }}：', '- nvm uninstall <span v-pre>{{ version }}</span>：']
  ]
}

export function applyPatches(stem, body) {
  const list = PATCHES[stem] ?? []
  const applied = []
  for (const [why, from, to] of list) {
    if (to.includes(from)) throw new Error(`PATCHES ${stem}：新字串包含原字串，重跑會重複套用（${why}）`)
    if (!body.includes(from)) continue
    body = body.split(from).join(to)
    applied.push(why)
  }
  return { body, applied }
}

// ---------------------------------------------------------------------------
// 整篇

// 53 篇 .html 舊文（2013-08-20 到 2014-03-01），改名成 .md 以後仍照舊文規則處理，重跑才會冪等。
export const LEGACY_HTML = new Set([
  '2013-08-20-text-shadow-demo', '2013-08-21-jpg-and-svg', '2013-08-22-html-meta', '2013-08-23-web-font',
  '2013-08-24-css-transtion-speed', '2013-08-26-sass-hsl-funtion', '2013-08-30-why-sass', '2013-08-31-why-sass',
  '2013-09-02-start-ruby', '2013-09-03-start-fire-app', '2013-09-04-css-arrow', '2013-09-06-cubic-font',
  '2013-09-15-web-skill', '2013-09-17-css-change', '2013-09-18-css-web', '2013-09-19-compass-1',
  '2013-09-20-compass-2', '2013-09-21-css-color', '2013-09-22-css-pseudo-element', '2013-09-23-css-text-shadow',
  '2013-09-24-css-background', '2013-09-25-background-att', '2013-09-26-css-calc', '2013-09-27-new-size-unit',
  '2013-09-28-css-selection', '2013-09-29-css-target', '2013-10-01-sass-long-shadow', '2013-10-02-transition',
  '2013-10-04-web-fonts', '2013-10-05-web-fonts-2', '2013-10-06-css-fliter', '2013-10-07-css-chechbox',
  '2013-10-08-css-transform', '2013-10-09-css-transform-mistake', '2013-10-10-css-transform-origin', '2013-10-11-css-perspective',
  '2013-10-12-css-album-list', '2013-10-14-css-collection', '2013-10-15-css-ironman', '2013-10-17-css-animation-keyframe',
  '2013-10-18-css-animation-setting', '2013-10-20-Vertical-write', '2013-10-24-css-flex-1', '2013-10-25-css-flex-2',
  '2013-10-26-css-flex-3', '2013-10-29-solar-system', '2013-10-31-css3-180-flip', '2013-11-01-js-json',
  '2013-11-04-js-json2', '2013-11-05-js-json3', '2013-11-06-js-json4', '2013-11-09-jqm-and-google-map',
  '2014-03-01-jquery-repeat-click'
])

// front matter 只用文字切開，不重新序列化，title、description、category 一個字都不會動。
export function splitFrontMatter(text) {
  const m = /^(---\r?\n[\s\S]*?\r?\n---[ \t]*(?:\r?\n|$))/.exec(text)
  return m ? { head: m[1], body: text.slice(m[1].length) } : { head: '', body: text }
}

// 一篇的轉換（純函式，md 是 VitePress 的 markdown-it）。回傳 { text, report }
export function migrateText(text, { stem, legacy = false, md }) {
  const report = { rawTags: 0, tags: 0, iframes: 0, tbody: 0, postLinks: 0, patches: [], blankRemoved: 0, blankAdded: 0, preSplit: 0, tagSplit: 0, issues: [], notes: [] }
  let { head, body } = splitFrontMatter(text)

  const t = lowercaseTags(head)
  head = t.head
  report.tags = t.changed

  const p = applyPatches(stem, body)
  body = p.body
  report.patches = p.applied

  let lines = body.split('\n').map((text) => ({ text, verbatim: legacy }))
  const r = removeRawTags(lines)
  lines = r.lines
  report.rawTags = r.removed

  if (lines.some((l) => l.verbatim)) {
    if (!md) throw new Error('migrateText：要原樣輸出的範圍需要 md（VitePress 的 markdown-it）')
    if (legacy) for (const s of hexoFenceStarts(lines.map((l) => l.text).join('\n'))) lines[s].hexoFence = true
    const v = fixVerbatim(md, lines)
    lines = v.lines
    Object.assign(report, v.stats)
    const offset = head.split('\n').length - 1
    report.issues = v.issues.map((i) => ({ ...i, line: i.line + offset + 1 }))
    report.notes = v.notes.map((i) => ({ ...i, line: i.line + offset + 1 }))
  }
  body = lines.map((l) => l.text).join('\n')

  // 以下只改行內的內容，不增減行，不影響上面排好的區塊
  const f = fixIframes(body, md)
  body = f.text
  report.iframes = f.changed
  const tb = wrapTbody(body, md)
  body = tb.text
  report.tbody = tb.changed
  const pl = fixPostLinkSlash(body, md)
  body = pl.text
  report.postLinks = pl.changed

  return { text: head + body, report }
}

// 用跟建置相同的設定建 markdown-it（lib/markdown.mjs 的 markdownOptions）
export async function createMd() {
  const { createMarkdownRenderer } = await import('vitepress')
  let options = { breaks: true }
  try {
    const mod = await import(pathToFileURL(path.join(srcDir, '.vitepress', 'lib', 'markdown.mjs')).href)
    options = mod.markdownOptions ?? options
  } catch (e) {
    console.warn(`讀不到 lib/markdown.mjs，改用 { breaks: true }：${e.message}`)
  }
  return createMarkdownRenderer(srcDir, options, '/')
}

// ---------------------------------------------------------------------------
// 檔案

export function defaultFiles() {
  const posts = fs.readdirSync(postsDir).filter((f) => /\.(md|html)$/.test(f)).map((f) => path.join(postsDir, f))
  const about = fs.readdirSync(path.join(srcDir, 'about')).filter((f) => f.endsWith('.md')).map((f) => path.join(srcDir, 'about', f))
  return [...posts, ...about].sort()
}

function git(args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
}

function isTracked(file) {
  try {
    git(['ls-files', '--error-unmatch', '--', path.relative(root, file)])
    return true
  } catch {
    return false
  }
}

// .html → .md。已有同名 .md（P2 同步閘門從 develop 帶回改過的舊文）時以 .html 的內容為準。
function renameHtml(file) {
  const target = file.replace(/\.html$/, '.md')
  const rel = (f) => path.relative(root, f)
  if (fs.existsSync(target)) {
    fs.renameSync(file, target)
    return target
  }
  if (isTracked(file)) git(['mv', '--', rel(file), rel(target)])
  else fs.renameSync(file, target)
  return target
}

function stemOf(file) {
  return path.basename(file).replace(/\.(md|html)$/, '')
}

function allPostTags() {
  const lists = []
  for (const f of fs.readdirSync(postsDir)) {
    if (!/\.(md|html)$/.test(f)) continue
    const { data } = matter(fs.readFileSync(path.join(postsDir, f), 'utf8'))
    const tags = data.tags == null ? [] : Array.isArray(data.tags) ? data.tags : [data.tags]
    lists.push(tags.map(String))
  }
  return lists
}

async function main(argv) {
  const check = argv.includes('--check')
  const args = argv.filter((a) => !a.startsWith('--'))
  const files = args.length ? args.map((f) => path.resolve(f)) : defaultFiles()
  const md = await createMd()
  const totals = { files: files.length, changed: 0, renamed: 0, rawTags: 0, tags: 0, iframes: 0, tbody: 0, postLinks: 0, patches: 0, blankRemoved: 0, blankAdded: 0, preSplit: 0, tagSplit: 0 }
  const problems = []
  const notes = []
  const pending = []

  for (let file of files) {
    if (!fs.existsSync(file)) {
      problems.push(`${file}：找不到檔案`)
      continue
    }
    const isHtml = file.endsWith('.html')
    if (isHtml && path.dirname(file) !== postsDir) {
      problems.push(`${path.relative(root, file)}：只有 source/_posts/ 的 .html 會轉換`)
      continue
    }
    const stem = stemOf(file)
    const legacy = isHtml || LEGACY_HTML.has(stem)
    const before = fs.readFileSync(file, 'utf8')
    const { text, report } = migrateText(before, { stem, legacy, md })
    const rel = path.relative(root, file)
    for (const i of report.issues) problems.push(`${rel}:${i.line}：原樣輸出的範圍出現 ${i.type}，要手動處理：${i.text}${i.note ? `（${i.note}）` : ''}`)
    for (const i of report.notes) notes.push(`${rel}:${i.line}：${i.note}：${i.text}`)
    const changed = text !== before || isHtml
    if (!changed) continue
    totals.changed++
    if (isHtml) totals.renamed++
    for (const k of ['rawTags', 'tags', 'iframes', 'tbody', 'postLinks', 'blankRemoved', 'blankAdded', 'preSplit', 'tagSplit']) totals[k] += report[k]
    totals.patches += report.patches.length
    if (check) {
      pending.push(rel)
      continue
    }
    if (isHtml) file = renameHtml(file)
    fs.writeFileSync(file, text)
    const what = [
      isHtml && '改名 .md',
      report.rawTags && `raw 標籤 ${report.rawTags} 行`,
      report.tags && `標籤小寫 ${report.tags}`,
      report.iframes && `iframe ${report.iframes}`,
      report.tbody && `補 <tbody> ${report.tbody}`,
      report.postLinks && `文章連結補尾斜線 ${report.postLinks}`,
      report.blankRemoved && `拿掉空行 ${report.blankRemoved}`,
      report.blankAdded && `補空行 ${report.blankAdded}`,
      report.preSplit && `<pre> 換行 ${report.preSplit}`,
      report.tagSplit && `開頭標籤換行 ${report.tagSplit}`,
      ...report.patches
    ].filter(Boolean)
    console.log(`${path.relative(root, file)}：${what.join('、')}`)
  }

  for (const group of tagCaseCollisions(allPostTags())) problems.push(`標籤只差大小寫：${group.join('、')}（一律用小寫，或在 LOWERCASE_TAGS 登記）`)

  if (check && pending.length) problems.push(...pending.map((f) => `${f}：還沒轉換，請跑 node scripts/migrate-hexo.mjs ${f}`))
  const sum = `${totals.files} 個檔案，${check ? '需要轉換' : '轉換'} ${totals.changed} 個：改名 ${totals.renamed}、raw 標籤 ${totals.rawTags} 行、標籤小寫 ${totals.tags}、iframe ${totals.iframes}、補 <tbody> ${totals.tbody}、文章連結補尾斜線 ${totals.postLinks}、拿掉空行 ${totals.blankRemoved}、補空行 ${totals.blankAdded}、<pre> 換行 ${totals.preSplit}、開頭標籤換行 ${totals.tagSplit}、個別修正 ${totals.patches}`
  console.log(sum)
  if (notes.length) console.log(`已知差異（不擋）：\n  ${notes.join('\n  ')}`)
  for (const p of problems) console.error(p)
  return problems.length ? 1 : 0
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = await main(process.argv.slice(2))
}
