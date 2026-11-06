// styles/toolcards.css 與 styles/shared-shell.css 的規則（主站首頁規格 E.7、G.5）。VitePress 的 CSS 全站一份，兩支進建置之後每一頁都有，所以：
//   - toolcards.css 的選擇器只能以 .cs-toolcard 開頭（ul.cs-toolcards 與卡片），不碰其他元素
//   - shared-shell.css 只能作用在共用頁首頁尾（.cs-hdr、.cs-ftr）裡面，而且只有三組規則：連結 color 退回圖層（revert-layer）、
//     768px 到 900px 收起 ⌘K 的字、深色版站徽的描邊
// 兩支都不在 site-home.css 裡：繁中首頁的工具區（HomeTools.vue）也要卡片樣式，S 版之後不一定有外語首頁
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const read = (name) => fs.readFileSync(path.join(DIR, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')

/** 平鋪的規則清單 { at, selector, body }，@media 這類條件裡的規則也收，at 是外層的條件 */
function rules(text, at = '') {
  const out = []
  let i = 0
  while (i < text.length) {
    const open = text.indexOf('{', i)
    if (open < 0) break
    const head = text.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (depth && j < text.length) {
      if (text[j] === '{') depth++
      else if (text[j] === '}') depth--
      j++
    }
    const body = text.slice(open + 1, j - 1)
    if (head.startsWith('@')) out.push(...rules(body, head))
    else out.push({ at, selector: head, body })
    i = j
  }
  return out
}
/** 逗號切選擇器，括號裡的逗號不切 */
function splitSelectors(sel) {
  const out = []
  let depth = 0
  let cur = ''
  for (const ch of sel) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && !depth) {
      out.push(cur.trim())
      cur = ''
    } else cur += ch
  }
  out.push(cur.trim())
  return out.filter(Boolean)
}
const declarations = (body) => body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()])

test('toolcards.css：每個選擇器都以 .cs-toolcard 開頭，卡片的顏色照 G.7', () => {
  const all = rules(read('toolcards.css'))
  assert.ok(all.length >= 5)
  for (const r of all) for (const s of splitSelectors(r.selector)) assert.ok(s.startsWith('.cs-toolcard'), `選擇器 ${s} 沒有限定在工具卡`)
  const card = all.find((r) => r.selector === '.cs-toolcard')
  assert.ok(card)
  const decl = Object.fromEntries(declarations(card.body))
  assert.equal(decl.background, 'var(--cs-bg)')
  assert.equal(decl.color, 'var(--cs-text)')
  assert.equal(decl['min-height'], 'var(--cs-size-tap)')
  assert.equal(Object.fromEntries(declarations(all.find((r) => r.selector === '.cs-toolcard__sum').body)).color, 'var(--cs-text-2)')
  // 卡片樣式只在這一支：site-home.css 不再有 .cs-toolcard 的規則
  assert.ok(!/\.cs-toolcard/.test(read('site-home.css')))
})

test('site-home.css：preview 的提示條與工具區提示的樣式已拿掉，cs-preview 也不加 padding', () => {
  const css = read('site-home.css')
  assert.ok(!/\.cs-preview/.test(css))
})

const norm = (v) => v.split(/\s+/).join(' ').trim()

test('shared-shell.css：只有兩組規則（三條），每個選擇器都限定在 .cs-hdr 或 .cs-ftr 裡面', () => {
  const all = rules(read('shared-shell.css'))
  assert.equal(all.length, 3)
  for (const r of all) for (const s of splitSelectors(r.selector)) assert.match(s, /\.cs-(?:hdr|ftr)(?:__[a-z-]+)?(?![\w-])/, `選擇器 ${s} 沒有限定在共用頁首頁尾`)
  assert.deepEqual([...new Set(all.map((r) => r.at))], ['@media (min-width: 768px) and (max-width: 900px)', ''])
})

test('S 版：base.css 整份包進 @layer cs.base，shared-shell.css 不再有連結色的 revert-layer', () => {
  // 共用頁首頁尾的連結色在 @layer cs.components；base.css 的 :where(.site) a 進了 cs.base，就不會再蓋掉它（主站首頁規格 E.7、G.5 第 1 點）
  assert.ok(!rules(read('shared-shell.css')).some((r) => r.selector.includes(' a')))
  assert.ok(!/revert-layer/.test(read('shared-shell.css').replace(/\/\*[\s\S]*?\*\//g, '')))
  const base = read('base.css').replace(/\/\*[\s\S]*?\*\//g, '').trim()
  assert.ok(base.startsWith('@layer cs.base {'), 'base.css 的第一條規則要是 @layer cs.base {')
  assert.ok(base.endsWith('}'))
  assert.match(base, /:where\(\.site\) a \{/)
  // 圖層順序：layers.css 是 theme/index.ts 的第一個 import
  const index = fs.readFileSync(new URL('../index.ts', import.meta.url), 'utf8')
  const firstImport = /^import '([^']+)'/m.exec(index.replace(/\/\/.*$/gm, ''))
  assert.equal(firstImport?.[1], './styles/layers.css')
  assert.match(read('layers.css'), /@layer cs\.base, cs\.components, cs\.utilities;/)
})

test('shared-shell.css：768px 到 900px 頁首的 ⌘K 只剩放大鏡，跟 layout.css 760px 以下的樣子相同', () => {
  const at = '@media (min-width: 768px) and (max-width: 900px)'
  const inMedia = rules(read('shared-shell.css')).filter((r) => r.at === at)
  assert.deepEqual(inMedia.map((r) => splitSelectors(r.selector)), [['.cs-hdr .search-btn'], ['.cs-hdr .search-btn__label', '.cs-hdr .search-btn kbd']])
  const ours = Object.fromEntries(declarations(inMedia[0].body))
  assert.deepEqual(declarations(inMedia[1].body), [['display', 'none']])
  // 跟 layout.css 760px 以下的 .search-btn 同一組值
  const layout = rules(read('layout.css'))
  const mobile = layout.find((r) => r.selector === '.search-btn' && /max-width:\s*760px/.test(r.at))
  assert.ok(mobile, 'layout.css 要有 760px 以下的 .search-btn')
  assert.deepEqual(ours, Object.fromEntries(declarations(mobile.body)))
  // 下限 768px 是共用頁首導覽攤開的斷點（theme/shared/shell/SiteHeader.vue）
  const header = fs.readFileSync(path.join(DIR, '../shared/shell/SiteHeader.vue'), 'utf8')
  assert.match(header, /@media \(min-width: 768px\) \{\s*\.cs-hdr:not\(\.cs-hdr--compact\) \.cs-hdr__nav \{ display: flex; \}/)
  // 寬版的 ⌘K 是 layout.css 的 min-width: 200px，這條規則要贏它：多一個 .cs-hdr
  const wide = Object.fromEntries(declarations(layout.find((r) => r.selector === '.search-btn' && r.at === '').body))
  assert.equal(wide['min-width'], '200px')
})

test('shared-shell.css：深色版共用頁首頁尾的站徽有淺色描邊，值跟 base.css 的 .ghost--small 相同', () => {
  const dark = rules(read('shared-shell.css')).filter((r) => r.at === '' && r.selector.startsWith('html.dark'))
  assert.equal(dark.length, 1)
  assert.equal(dark[0].selector, 'html.dark :is(.cs-hdr__logo, .cs-ftr__logo)')
  const decl = declarations(dark[0].body)
  assert.deepEqual(decl.map(([k]) => k), ['filter'])
  const small = /html\.dark \.ghost--small \{([^}]*)\}/.exec(read('base.css'))
  assert.ok(small, 'base.css 要有 html.dark .ghost--small')
  const baseFilter = Object.fromEntries(declarations(small[1])).filter
  assert.match(baseFilter, /drop-shadow/)
  assert.equal(norm(decl[0][1]), norm(baseFilter))
  // 元件裡的站徽 class 名稱沒變
  const shell = (f) => fs.readFileSync(path.join(DIR, '../shared/shell', f), 'utf8')
  assert.match(shell('SiteHeader.vue'), /<img class="cs-hdr__logo"/)
  assert.match(shell('SiteFooter.vue'), /<img class="cs-ftr__logo"/)
})
