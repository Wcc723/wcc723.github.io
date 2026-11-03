// 負責：markdown 模組（P1 workflow）。介面見 ../README.md。
//
// VitePress 1.6.4 的 markdown 設定（config.mts 的 markdown，scripts/check-compile.mjs 也讀同一份）：
// - breaks: true：跟 Hexo（hexo-renderer-marked 的 breaks: true）一樣，段落裡的換行輸出 <br>
// - typographer: false：內文不轉彎引號和破折號。Hexo 的 smartypants 把 --lts 轉成 en dash，這次修掉；
//   標題 id 另外模擬 smartypants，舊錨點才對得上
// - code_inline 一律輸出 <code v-pre>：inline code 裡的 {{ }} 不會被 Vue 當成運算式，之後的新文章也受保護
// - 標題 id 照 Hexo 的算法（hexo-slugify.mjs），同一篇重複的標題依序加 -1、-2，跟 Hexo 相同
// - 個別標題無法精確重現舊 id 時，在標題前補一個帶舊 id 的空 <span id>（清單見 ANCHOR_EXCEPTIONS）
// - 關掉 VitePress 內建的 emoji 轉換：Hexo 沒有這個功能，舊文的 :D、:( 線上照字面顯示，
//   開著的話會被換成 😄、😦，文字指紋對不上。新文章要放 emoji 直接打字元
// - 標題錨點 <a class="header-anchor"> 裡不放 &ZeroWidthSpace;，標題文字才跟 Hexo 相同（主題用 CSS 畫「#」）
// - 原始 HTML 的 <a> 裡面不再被 linkify 多包一層連結（VitePress 1.6.4 的 html_inline 漏了 linkLevel）
import path from 'node:path'
import { createHeadingCounter, hexoHeadingId, hexoSlugify } from './hexo-slugify.mjs'

// 無法精確重現的舊 id：文章檔名 → { 新 id: 舊 id }。
// 新 id 是這份設定實際輸出的 id，舊 id 是 Hexo 基準（baseline/hexo-2026-11-03/pages.json 的 headingIds）裡的值。
// 每一筆都要寫進 workspace 的 docs/projects/wcc723.github.io/anchor-exceptions.md，並說明原因。
export const ANCHOR_EXCEPTIONS = {}

// VitePress 的 env.realPath 是 rewrites 之前的原始檔案路徑；check-compile 只有 env.path。
function sourceFileName(env) {
  const file = env?.realPath || env?.path
  return file ? path.basename(file) : ''
}

// 在 markdown-it-anchor 之前替每個標題設好 id。
// 用標題的原始 Markdown（inline token 的 content）重跑 marked 的 inline 解析，
// 才分得出文字和 code span（兩者的 smartypants 與 & 跳脫規則不同），也不受 emoji、attrs 外掛改寫影響。
// markdown-it-anchor 看到已經有 id 的標題就沿用，只檢查同一頁不能重複。
export function hexoHeadingIdsPlugin(md, { exceptions = ANCHOR_EXCEPTIONS } = {}) {
  md.core.ruler.before('anchor', 'hexo_heading_ids', (state) => {
    const tokens = state.tokens
    const refs = state.env?.references
    const links = refs ? (label) => refs[md.utils.normalizeReference(label)] : undefined
    const legacy = exceptions[sourceFileName(state.env)] ?? null

    // 作者自己用 {#id} 指定的 id 照用，自動產生的 id 要避開它們
    const used = new Set()
    for (const t of tokens) {
      if (t.type === 'heading_open' && t.attrGet('id') != null) used.add(t.attrGet('id'))
    }

    const count = createHeadingCounter()
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i]
      if (t.type !== 'heading_open' || t.attrGet('id') != null) continue
      const content = tokens[i + 1]?.type === 'inline' ? tokens[i + 1].content : ''
      const setext = t.markup === '=' || t.markup === '-'
      let id = count(hexoHeadingId(content, { links, setext }))
      // 撞名（例如依序有「A」「A」「A-1」三個標題）：Hexo 會輸出兩個相同的 id，
      // markdown-it-anchor 遇到重複的 id 會中止建置，所以後到的那個再往後編號。
      // 瀏覽器的 #錨點 只認第一個，舊連結的落點不變。
      if (used.has(id)) {
        let n = 1
        while (used.has(`${id}-${n}`)) n++
        id = `${id}-${n}`
      }
      used.add(id)
      t.attrSet('id', id)

      const old = legacy && Object.hasOwn(legacy, id) ? legacy[id] : null
      if (old != null && old !== id) {
        const span = new state.Token('html_block', '', 0)
        span.content = `<span id="${md.utils.escapeHtml(old)}"></span>\n`
        span.block = true
        tokens.splice(i, 0, span)
        i++
      }
    }
  })
}

// inline code 一律加 v-pre，Vue 不會解析裡面的 {{ }}。其餘輸出跟 markdown-it 預設的 code_inline 相同。
export function codeInlineVPrePlugin(md) {
  const { escapeHtml } = md.utils
  md.renderer.rules.code_inline = (tokens, idx, options, env, slf) => {
    const token = tokens[idx]
    return `<code v-pre${slf.renderAttrs(token)}>${escapeHtml(token.content)}</code>`
  }
}

// VitePress 的標題錨點 <a class="header-anchor"> 裡放的是 &ZeroWidthSpace;，會變成標題文字的一部分
// （H1、H2 的文字結尾多一個 U+200B，跟 Hexo 版不同）。主題用 CSS 的 ::before 畫「#」，連結本身靠 aria-label
// 提供名稱，所以把這個零寬字元拿掉，標題文字跟 Hexo 逐字相同（Hexo 的 headerlink 也是空的 <a>）。
export function emptyHeaderAnchorPlugin(md) {
  md.core.ruler.after('anchor', 'empty_header_anchor', (state) => {
    for (const t of state.tokens) {
      if (t.type !== 'inline' || !t.children) continue
      const kids = t.children
      for (let i = 0; i + 1 < kids.length; i++) {
        if (kids[i].type !== 'link_open' || !/(^|\s)header-anchor(\s|$)/.test(kids[i].attrGet('class') ?? '')) continue
        const sym = kids[i + 1]
        if (sym.type === 'html_inline' && sym.content === '&ZeroWidthSpace;') sym.content = ''
      }
    }
  })
}

// VitePress 1.6.4 的 componentPlugin 換掉了 markdown-it 的 html_inline，卻漏了 linkLevel 的計數：
// 原文寫 <a href="http://x/">http://x/</a> 時，linkify 會在 <a> 裡面再包一層 <a>，瀏覽器解析後的 DOM
// 跟 Vue 的虛擬 DOM 對不上（hydration 不一致）。Hexo 版只有一層連結。這裡把計數補回去，行為跟 markdown-it 原本的 html_inline 相同。
export function htmlInlineLinkLevelPlugin(md) {
  const rule = md.inline.ruler.__rules__.find((r) => r.name === 'html_inline')
  if (!rule) return
  const original = rule.fn
  md.inline.ruler.at('html_inline', (state, silent) => {
    const before = state.tokens.length
    const ok = original(state, silent)
    if (ok && !silent && state.tokens.length > before) {
      const content = state.tokens[state.tokens.length - 1].content
      if (/^<a[>\s]/i.test(content)) state.linkLevel++
      if (/^<\/a\s*>/i.test(content)) state.linkLevel--
    }
    return ok
  })
}

export const markdownOptions = {
  breaks: true,
  typographer: false,
  // 程式碼區塊複製鈕的 title（VitePress 預設是英文的 Copy Code）
  codeCopyButtonTitle: '複製程式碼',
  // 標題 id 由 hexoHeadingIdsPlugin 先設好；slugify 只在標題沒有 id 時才會用到，同樣照 Hexo 的規則。
  // headers 開啟後 pageData.headers 會列出 h2 到 h6（slug 就是標題 id），之後要做目錄可以直接用
  anchor: { slugify: hexoSlugify },
  headers: { slugify: hexoSlugify },
  config(md) {
    // VitePress 沒有關閉 emoji 的選項（defs 給空物件會把空字串換成 undefined），直接停用 core rule
    md.core.ruler.disable('emoji', true)
    md.use(hexoHeadingIdsPlugin)
    md.use(codeInlineVPrePlugin)
    md.use(emptyHeaderAnchorPlugin)
    md.use(htmlInlineLinkLevelPlugin)
  }
}
