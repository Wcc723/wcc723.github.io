// 文字對比檢查：讀 tokens.css 和 vars.css，把 var() 展開成色碼，亮暗兩版的文字與背景組合都要至少 4.5:1。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const read = (rel) => fs.readFileSync(new URL(rel, import.meta.url), 'utf8')

/** 取出某個選擇器區塊裡的 --x: value; */
function declarations(css, selector) {
  const out = {}
  const re = new RegExp(`(^|\\n)\\s*${selector.replace('.', '\\.')}\\s*\\{([\\s\\S]*?)\\n\\}`, 'g')
  for (const m of css.matchAll(re)) {
    for (const d of m[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out[d[1]] = d[2].trim()
  }
  return out
}

const tokens = declarations(read('../shared/tokens/tokens.css'), ':root')
const vars = read('./vars.css')
const light = { ...tokens, ...declarations(vars, ':root') }
const dark = { ...light, ...declarations(vars, 'html.dark') }

function resolve(map, name, depth = 0) {
  const v = map[name]
  if (v === undefined) throw new Error(`沒有定義 ${name}`)
  const m = /^var\((--[\w-]+)\)$/.exec(v)
  if (m) {
    if (depth > 10) throw new Error(`${name} 循環參照`)
    return resolve(map, m[1], depth + 1)
  }
  return v
}

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
export const contrast = (a, b) => {
  const x = lum(a)
  const y = lum(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

// [文字, 背景]：版面上實際出現的組合
const TEXT_PAIRS = [
  ...['--cs-bg', '--cs-section', '--th-surface', '--cs-soft', '--th-header-bg', '--th-footer-bg', '--th-code-bg', '--th-code-inline-bg'].map((bg) => ['--cs-text', bg]),
  ...['--cs-bg', '--cs-section', '--th-surface', '--cs-soft', '--th-footer-bg'].map((bg) => ['--cs-text-2', bg]),
  ...['--cs-bg', '--cs-section', '--th-surface', '--cs-soft', '--th-footer-bg'].map((bg) => ['--cs-link', bg]),
  ['--cs-link-hover', '--cs-bg'],
  ['--cs-link-hover', '--th-surface'],
  ['--th-chip-text', '--th-chip-bg'],
  ['--th-btn-text', '--th-btn-face'],
  ['--th-btn-text', '--th-btn-hover'],
  ['--th-lite-text', '--th-lite-bg'],
  ['--th-lite-text', '--th-lite-hover'],
  ['--th-code-lang', '--th-code-bg'],
  ['--th-mark-text', '--th-mark-bg']
]

// --cs-mute 只用在白底（亮色）或深色底，不放在淺灰、淺藍上
const MUTE_PAIRS = [
  ['--cs-mute', '--cs-bg'],
  ['--cs-mute', '--th-surface']
]

for (const [mode, map] of [['亮色', light], ['深色', dark]]) {
  test(`${mode}：文字對比至少 4.5:1`, () => {
    const fails = []
    for (const [fg, bg] of [...TEXT_PAIRS, ...MUTE_PAIRS]) {
      const r = contrast(resolve(map, fg), resolve(map, bg))
      if (r < 4.5) fails.push(`${fg} ${resolve(map, fg)} / ${bg} ${resolve(map, bg)} = ${r.toFixed(2)}`)
    }
    assert.deepEqual(fails, [])
  })

  test(`${mode}：焦點框和主色對背景至少 3:1（非文字元件）`, () => {
    for (const bg of ['--cs-bg', '--th-surface', '--cs-soft']) {
      assert.ok(contrast(resolve(map, '--th-focus'), resolve(map, bg)) >= 3, bg)
      assert.ok(contrast(resolve(map, '--cs-primary'), resolve(map, bg)) >= 3, bg)
    }
  })
}

test('深色版覆寫了所有語意 token（沒有漏掉亮色的值）', () => {
  for (const k of ['--cs-text', '--cs-text-2', '--cs-mute', '--cs-line', '--cs-line-2', '--cs-bg', '--cs-section', '--cs-primary', '--cs-link', '--cs-link-hover', '--cs-soft', '--cs-subtle']) {
    assert.notEqual(dark[k], tokens[k], k)
  }
})
