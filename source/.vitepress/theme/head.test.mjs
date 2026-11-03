import { test } from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { themeHead, THEME_SCRIPT, THEME_STORAGE_KEY } from './head.mjs'

const repo = fileURLToPath(new URL('../../../', import.meta.url))

/** 在假的 window 裡跑防閃 script，回傳 <html> 上的 class */
function run(stored, { throws = false } = {}) {
  const classes = new Set()
  const ctx = {
    localStorage: {
      getItem(k) {
        if (throws) throw new Error('SecurityError')
        return k === THEME_STORAGE_KEY ? stored : null
      }
    },
    document: { documentElement: { classList: { add: (c) => classes.add(c) } } }
  }
  vm.runInNewContext(THEME_SCRIPT, ctx)
  return [...classes]
}

test('防閃 script：存 dark 才加 .dark，預設亮色', () => {
  assert.deepEqual(run('dark'), ['dark'])
  assert.deepEqual(run('light'), [])
  assert.deepEqual(run(null), [])
  assert.deepEqual(run('xyz'), [])
  assert.deepEqual(run('dark', { throws: true }), [], 'storage 讀不到時不能丟錯')
})

test('防閃 script 是 themeHead 的第一個項目，key 是 casper-theme', () => {
  assert.equal(THEME_STORAGE_KEY, 'casper-theme')
  assert.deepEqual(themeHead[0], ['script', {}, THEME_SCRIPT])
  assert.ok(THEME_SCRIPT.includes("'casper-theme'"))
})

test('跟 Hexo 版 head.ejs 開頭那段的邏輯相同（default_mode: light）', (t) => {
  let ejs
  try {
    ejs = execFileSync('git', ['-C', repo, 'show', 'develop:themes/casper-2026/layout/common/head.ejs'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch {
    t.skip('讀不到 develop 分支')
    return
  }
  const line = ejs.split('\n').find((l) => l.includes("localStorage.getItem('casper-theme')"))
  const hexo = line.replace(/^<script>/, '').replace(/<\/script>$/, '').replace(`<%= theme.default_mode || "light" %>`, 'light')
  assert.equal(THEME_SCRIPT, hexo)
})

test('themeHead 沒有外部字型 CSS，也沒有會擋渲染的外部 stylesheet', () => {
  for (const [tag, attrs] of themeHead) {
    if (tag === 'link') assert.notEqual(attrs.rel, 'stylesheet')
    assert.ok(!JSON.stringify(attrs).includes('fonts.googleapis.com'))
  }
})
