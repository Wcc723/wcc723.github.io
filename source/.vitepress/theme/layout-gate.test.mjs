// 外語首頁的建置開關（主站首頁規格 B.6、E.7）：SiteHomePage.vue 只在 __CS_SITE_HOME__ 為 true 時由 Layout.vue 登記，
// 它 import 的兩支 CSS 跟著進出建置。P1、P2 是 false，產物（含全站一份的 CSS）因此不變（K.4 第 2 步的 dist-diff 驗）
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THEME = path.dirname(fileURLToPath(import.meta.url))
const read = (rel) => fs.readFileSync(path.join(THEME, rel), 'utf8')
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1').replace(/<!--[\s\S]*?-->/g, '')

/** 主題底下所有原始檔（不含測試、shared 副本照收） */
function themeFiles(dir = THEME) {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...themeFiles(p))
    else if (/\.(vue|ts|mjs|js|css)$/.test(e.name) && !/\.test\.mjs$/.test(e.name)) out.push(p)
  }
  return out
}

test('Layout.vue：site-home 的登記整段包在 __CS_SITE_HOME__ 裡，用動態 import', () => {
  const src = stripComments(read('Layout.vue'))
  const refs = [...src.matchAll(/SiteHomePage/g)]
  assert.equal(refs.length, 1)
  assert.match(src, /\.\.\.\(__CS_SITE_HOME__ \? \{ 'site-home': defineAsyncComponent\(\(\) => import\('\.\/pages\/SiteHomePage\.vue'\)\) \} : \{\}\)/)
  assert.ok(!/import\s+SiteHomePage\b/.test(src))
  // 模板裡不能用 __CS_SITE_HOME__（會變成 _ctx 的屬性，define 換不到）
  const template = src.slice(src.indexOf('<template>'))
  assert.ok(!template.includes('__CS_SITE_HOME__'))
})

test('SiteHomePage.vue 沒有 <style>，兩支 CSS 只由它 import；主題不 import lib/', () => {
  const page = stripComments(read('pages/SiteHomePage.vue'))
  assert.ok(!/<style\b/.test(page))
  assert.match(page, /import '\.\.\/shared\/shell\/i18n\/lang-scoped\.css'/)
  assert.match(page, /import '\.\.\/styles\/site-home\.css'/)
  for (const file of themeFiles()) {
    const rel = path.relative(THEME, file)
    const src = stripComments(fs.readFileSync(file, 'utf8'))
    if (rel !== path.join('pages', 'SiteHomePage.vue')) {
      assert.ok(!/site-home\.css|lang-scoped\.css/.test(src), `${rel} 不能 import site-home.css 或 lang-scoped.css`)
      if (rel !== 'Layout.vue') assert.ok(!src.includes('SiteHomePage'), `${rel} 不能引用 SiteHomePage`)
    }
    assert.ok(!/from\s+['"](\.\.\/)+lib\//.test(src) && !/import\(['"](\.\.\/)+lib\//.test(src), `${rel} 不能 import lib/`)
  }
})

test('config.mts：__CS_SITE_HOME__ 兩種情況都有定義；env.d.ts 有宣告', () => {
  const config = fs.readFileSync(path.join(THEME, '..', 'config.mts'), 'utf8')
  assert.match(config, /__CS_SITE_HOME__: 'true'/)
  assert.match(config, /__CS_SITE_HOME__: 'false'/)
  assert.match(read('env.d.ts'), /declare const __CS_SITE_HOME__: boolean/)
})
