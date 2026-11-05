// 兩個建置開關（主站首頁規格 B.6、E.7、G.5）：
//   __CS_SITE_HOME__：SiteHomePage.vue 只在 true 時由 Layout.vue 登記，它 import 的 CSS 跟著進出建置
//   __CS_SHARED_SHELL__：共用頁首頁尾的接線元件（SharedHeader、SharedFooter）與繁中首頁的工具區（HomeTools）只在 true 時載入
// P1、P2 的正式建置兩個都是 false，產物（含全站一份的 CSS）因此不變（K.4 第 2 步的 dist-diff 驗）
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
  assert.match(page, /import '\.\.\/styles\/toolcards\.css'/)
  // preview 不在頁面上放提示條與工具區的提示（站長 2026-11-05）
  assert.ok(!/cs-preview|preview\.notice|toolsNote/.test(page))
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

test('config.mts：兩個開關都一律有定義（true 或 false）；共用外殼看 effectiveShell()；env.d.ts 有宣告', () => {
  const config = stripComments(fs.readFileSync(path.join(THEME, '..', 'config.mts'), 'utf8'))
  assert.match(config, /__CS_SITE_HOME__: hasSiteHome \? 'true' : 'false'/)
  assert.match(config, /__CS_SHARED_SHELL__: sharedShell \? 'true' : 'false'/)
  assert.match(config, /const sharedShell = effectiveShell\(homePlan\) === 'shared'/)
  // define 放在 locales 的條件外面：兩種情況都要有值，否則 SSR 丟 ReferenceError
  assert.equal([...config.matchAll(/define:/g)].length, 1)
  assert.match(read('env.d.ts'), /declare const __CS_SITE_HOME__: boolean/)
  assert.match(read('env.d.ts'), /declare const __CS_SHARED_SHELL__: boolean/)
})

test('Layout.vue：共用頁首頁尾包在 __CS_SHARED_SHELL__ 裡，用動態 import；v-if / v-else 跟舊的頁首頁尾二選一', () => {
  const src = stripComments(read('Layout.vue'))
  assert.match(src, /const SharedHeader = __CS_SHARED_SHELL__ \? defineAsyncComponent\(\(\) => import\('\.\/components\/SharedHeader\.vue'\)\) : null/)
  assert.match(src, /const SharedFooter = __CS_SHARED_SHELL__ \? defineAsyncComponent\(\(\) => import\('\.\/components\/SharedFooter\.vue'\)\) : null/)
  assert.match(src, /const sharedShell = computed\(\(\) => __CS_SHARED_SHELL__ && !!frontmatter\.value\.site\)/)
  const template = src.slice(src.indexOf('<template>'))
  assert.ok(!template.includes('__CS_SHARED_SHELL__'))
  // false 時只輸出舊的頁首頁尾：v-if 的下一個元素就是 v-else，不多一個註解節點
  assert.match(template, /<component :is="SharedHeader" v-if="sharedShell" \/>\s*<SiteHeader v-else /)
  assert.match(template, /<component :is="SharedFooter" v-if="sharedShell" \/>\s*<SiteFooter v-else \/>/)
  // 跳到主內容：共用外殼時用外殼字串，否則是原本的字
  assert.match(src, /'跳到主要內容'/)
  assert.match(template, /<a class="skip-link" href="#main">\{\{ skipText \}\}<\/a>/)
})

test('共用外殼的元件與 CSS 只從開關後面進來：沒有靜態 import 能把它們帶進 P1 的建置', () => {
  const importers = (pattern) => themeFiles().filter((f) => pattern.test(stripComments(fs.readFileSync(f, 'utf8')))).map((f) => path.relative(THEME, f)).sort()
  // 共用元件只由接線元件 import
  assert.deepEqual(importers(/from '\.\.\/shared\/shell\/SiteHeader\.vue'/), [path.join('components', 'SharedHeader.vue')])
  assert.deepEqual(importers(/from '\.\.\/shared\/shell\/SiteFooter\.vue'/), [path.join('components', 'SharedFooter.vue')])
  // 接線元件與 HomeTools 只出現在開關後面的動態 import
  assert.deepEqual(importers(/SharedHeader\.vue|SharedFooter\.vue/), ['Layout.vue'])
  assert.deepEqual(importers(/HomeTools\.vue/), [path.join('pages', 'HomePage.vue')])
  const home = stripComments(read('pages/HomePage.vue'))
  assert.match(home, /const HomeTools = __CS_SHARED_SHELL__ \? defineAsyncComponent\(\(\) => import\('\.\.\/components\/HomeTools\.vue'\)\) : null/)
  assert.ok(!home.slice(home.indexOf('<template>')).includes('__CS_SHARED_SHELL__'))
  // CSS：shared-shell.css 只由兩支接線元件 import，toolcards.css 只由 SiteHomePage 與 HomeTools import
  assert.deepEqual(importers(/shared-shell\.css/), [path.join('components', 'SharedFooter.vue'), path.join('components', 'SharedHeader.vue')])
  assert.deepEqual(importers(/toolcards\.css/), [path.join('components', 'HomeTools.vue'), path.join('pages', 'SiteHomePage.vue')])
})

test('HomePage.vue：工具區在文章與分頁下面、關於條上面；沒有工具時只輸出關於條（v-else），P1 的 HTML 不變', () => {
  const tpl = stripComments(read('pages/HomePage.vue'))
  const t = tpl.slice(tpl.indexOf('<template>'))
  const pager = t.indexOf('<Pager ')
  const tools = t.indexOf('<component :is="HomeTools"')
  assert.ok(pager > 0 && tools > pager, '工具區要在分頁後面')
  assert.match(t, /<template v-if="siteTools\.length">\s*<component :is="HomeTools" :tools="siteTools" \/>\s*<AboutStrip :with-tools="true" \/>\s*<\/template>\s*<AboutStrip v-else :with-tools="hasTools" \/>/)
  // HomeTools 的卡片跟外語首頁同一個契約（audit T1）：區塊 id="tools"、a.cs-toolcard、名稱與說明的 class、圖用 toolCardArt()
  const ht = stripComments(read('components/HomeTools.vue'))
  for (const s of ['id="tools"', 'class="cs-toolcards"', 'class="cs-toolcard"', 'class="cs-toolcard__name"', 'class="cs-toolcard__sum"', 'toolCardArt(t)']) assert.ok(ht.includes(s), s)
  // 區塊裡只能有工具卡的連結（T1 用 toolLinksIn() 收區塊裡每一個 <a>）
  assert.equal([...ht.matchAll(/<a\b/g)].length, 1)
})
