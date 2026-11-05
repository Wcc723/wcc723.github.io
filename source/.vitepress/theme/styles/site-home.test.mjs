// styles/site-home.css 的規則（主站首頁規格 E.7）：VitePress 的 CSS 全站一份，I1 起這些規則會出現在每一頁，
// 所以選擇器只能以 .cs-shome 開頭，或用外語根元素的 :root:not(...) 限定（那一段只改變數）；工具卡 .cs-toolcard* 在 toolcards.css，
// .cs-preview 沒有任何樣式（toolcards.test.mjs 驗 site-home.css 裡沒有這兩個）；
// 字型另取字族名，繁中頁的 Nunito 不受影響
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'site-home.css')
const css = fs.readFileSync(FILE, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
const FOREIGN_ROOT = ':root:not(:is(:lang(zh-TW), :lang(zh-Hant)))'
const PREFIXES = ['.cs-shome']

/** 平鋪的規則清單：{ at, selector, body }。at 是外層的 @media 這類條件；@font-face 的 selector 是 '@font-face' */
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
    if (/^@(media|supports|container)\b/.test(head)) out.push(...rules(body, head))
    else out.push({ at, selector: head, body })
    i = j
  }
  return out
}
const declarations = (body) => body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => {
  const k = d.indexOf(':')
  return [d.slice(0, k).trim(), d.slice(k + 1).trim()]
})
/** 以逗號切選擇器，括號裡的逗號不切 */
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
const all = rules(css)

test('site-home.css：每個選擇器都以 .cs-shome 或外語根元素開頭', () => {
  assert.ok(all.length > 10)
  for (const r of all) {
    if (r.selector === '@font-face') continue
    assert.ok(!r.selector.startsWith('@'), `不認得的 at-rule：${r.selector}`)
    for (const s of splitSelectors(r.selector)) {
      assert.ok(s === FOREIGN_ROOT || PREFIXES.some((p) => s.startsWith(p)), `選擇器 ${s} 沒有限定在外語首頁`)
    }
  }
})

test('site-home.css：外語根元素那一段只改自訂屬性，不直接設 font-family 這類屬性', () => {
  const roots = all.filter((r) => r.selector === FOREIGN_ROOT)
  assert.equal(roots.length, 1)
  assert.equal(roots[0].at, '')
  const decls = declarations(roots[0].body)
  assert.ok(decls.length > 0)
  for (const [k] of decls) assert.ok(k.startsWith('--'), `${FOREIGN_ROOT} 只能改變數，${k} 不行`)
  assert.ok(decls.some(([k, v]) => k === '--cs-font-latn' && v.startsWith("'Nunito Intl'")))
})

test('site-home.css：@font-face 只有 Nunito Intl 與 Nunito Fallback，不重新宣告繁中頁用的 Nunito', () => {
  const faces = all.filter((r) => r.selector === '@font-face').map((r) => Object.fromEntries(declarations(r.body)))
  assert.deepEqual(faces.map((f) => f['font-family']).sort(), ["'Nunito Fallback'", "'Nunito Intl'"])
  const intl = faces.find((f) => f['font-family'] === "'Nunito Intl'")
  assert.match(intl.src, /nunito-latin\.woff2/)
  assert.equal(intl['font-display'], 'swap')
  // 繁中頁的字型變數不在這支檔案裡改（只在外語根元素那一段）
  const outside = all.filter((r) => r.selector !== FOREIGN_ROOT && r.selector !== '@font-face')
  for (const r of outside) for (const [k] of declarations(r.body)) assert.ok(!/^--th-font-|^--cs-font-/.test(k), `${r.selector} 改了字型變數 ${k}`)
})

test('site-home.css：介紹區塊 .cs-toolfeature* 限定在 .cs-shome 底下，顏色照 G.7，768px 以下改成一欄', () => {
  const feature = all.filter((r) => r.selector.includes('.cs-toolfeature'))
  assert.ok(feature.length >= 10)
  for (const r of feature) for (const s of splitSelectors(r.selector)) assert.ok(s.startsWith('.cs-shome .cs-toolfeature'), `介紹區塊的選擇器 ${s} 要以 .cs-shome .cs-toolfeature 開頭`)
  // 字色只用 --cs-text、--cs-text-2（滑過名稱時是連結色）；整支檔案不用 --cs-mute（淺藍、淺灰底上不到 4.5:1）
  const COLORS = new Set(['var(--cs-text)', 'var(--cs-text-2)', 'var(--cs-link)'])
  for (const r of feature) for (const [k, v] of declarations(r.body)) if (k === 'color') assert.ok(COLORS.has(v), `${r.selector} 的 color 是 ${v}`)
  assert.ok(!/--cs-mute/.test(css))
  const of = (selector, at = '') => Object.fromEntries(declarations(feature.find((r) => r.selector === selector && r.at === at)?.body ?? ''))
  const box = of('.cs-shome .cs-toolfeature')
  assert.equal(box.background, 'var(--cs-bg)')
  assert.equal(box['grid-template-columns'], 'minmax(0, 1fr) minmax(0, 1fr)')
  assert.equal(of('.cs-shome .cs-toolfeature__stage').background, 'var(--cs-soft)')
  const mobile = all.find((r) => r.selector === '.cs-shome .cs-toolfeature' && /max-width:\s*768px/.test(r.at))
  assert.ok(mobile, '要有 768px 以下的版面')
  assert.equal(Object.fromEntries(declarations(mobile.body))['grid-template-columns'], '1fr')
  // 勾勾用 CSS 畫：li::before 圓底、li::after 勾，不用圖檔
  assert.equal(of('.cs-shome .cs-toolfeature__points li::before').background, 'var(--th-chip-bg)')
  assert.match(of('.cs-shome .cs-toolfeature__points li::after').border, /var\(--th-chip-text\)/)
  assert.ok(!/url\(/.test(feature.map((r) => r.body).join('')))
})
