// lib/site-shell.mjs 的測試（主站首頁規格 G.4）：fm.site 的欄位、siteHomes 等於 plan.published、
// sectionOf 跟 legacy 頁首（theme/utils/nav.mjs）那份結果相同、外語首頁的 H1 與連結、404 的多語提示、preview 的提示
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { notFoundIntl, previewData, sectionOf, siteFrontmatter, siteHomeView } from './site-shell.mjs'
import { sectionOf as legacySectionOf } from '../theme/utils/nav.mjs'
import { PREVIEW_NOTICE, PREVIEW_TOOLS_NOTE, buildSiteHomePlan } from './site-home.mjs'
import { AD_PAGE_TYPES } from '../theme/shared/shell/site.mjs'
import { ts } from '../theme/shared/shell/i18n/shell-strings.mjs'
import { siteName } from '../theme/shared/shell/i18n/seo.mjs'

const EMPTY = { schema: 1, blogShell: 'legacy', siteHomes: [], tools: [] }
const INDEX = {
  schema: 1, blogShell: 'shared', siteHomes: [],
  tools: [{
    slug: 'lucky-draw', rootLocale: 'zh-tw', xDefaultLocale: 'en', ghost: 'spot3', keywords: [],
    locales: {
      'zh-tw': { url: 'https://www.casper.tw/lucky-draw/', name: '抽獎大師', summary: '抽獎、轉盤、分組' },
      en: { url: 'https://www.casper.tw/lucky-draw/en/', name: 'Lucky Draw', summary: 'Draw names, spin a wheel, split teams' },
    },
  }],
}
// 手寫的計畫：en 上線、ja 是 preview（只用到 pages 與 published）
const PLAN = { stage: 'live', published: ['en'], pages: [{ code: 'en', url: 'https://www.casper.tw/en/', preview: false }], problems: [], warnings: [] }
const PREVIEW = buildSiteHomePlan({ config: { shell: 'legacy', home: { locales: [], roadmap: ['en', 'ja', 'ko', 'de', 'zh-cn', 'es'], sourceLocale: 'en', reviewers: {} } }, env: { CS_STAGE: 'preview' } })
const FIELDS = ['locale', 'kind', 'shell', 'tools', 'siteHomes', 'languages', 'section', 'canonical', 'home', 'preview', 'notFoundIntl']

test('sectionOf：每個頁型都跟 theme/utils/nav.mjs 的結果相同', () => {
  for (const type of Object.values(AD_PAGE_TYPES).flat()) assert.equal(sectionOf(type), legacySectionOf(type), type)
  assert.equal(sectionOf('post'), 'posts')
  assert.equal(sectionOf('about'), 'about')
  assert.equal(sectionOf('site-home'), '')
})

test('siteFrontmatter：繁中文章頁的欄位，siteHomes 是 plan.published', () => {
  const canonical = 'https://www.casper.tw/css/2013/09/29/css-target/'
  const fm = siteFrontmatter({ pageType: 'post', canonical, plan: PLAN, index: INDEX })
  assert.deepEqual(Object.keys(fm), FIELDS)
  assert.equal(fm.locale, 'zh-tw')
  assert.equal(fm.kind, 'page')
  assert.deepEqual(fm.siteHomes, ['en'])
  assert.notEqual(fm.siteHomes, PLAN.published)
  assert.equal(fm.section, 'posts')
  assert.equal(fm.canonical, canonical)
  assert.deepEqual(fm.languages.map((l) => [l.code, l.href, l.exact]), [['zh-tw', canonical, true], ['en', 'https://www.casper.tw/en/', false]])
  assert.deepEqual(fm.tools.map((t) => t.href), ['https://www.casper.tw/lucky-draw/'])
  assert.equal(fm.home, null)
  assert.equal(fm.preview, null)
  assert.deepEqual(fm.notFoundIntl, [])
  assert.equal(typeof fm.shell, 'object')
  assert.throws(() => siteFrontmatter({ pageType: 'post' }), /要傳 plan/)
})

test('siteFrontmatter：404 沒有語言選單、canonical 是空字串，多語提示是叢集的每個外語首頁', () => {
  const fm = siteFrontmatter({ pageType: 'not-found', canonical: 'https://www.casper.tw/404.html', plan: PLAN, index: EMPTY })
  assert.deepEqual(fm.languages, [])
  assert.equal(fm.canonical, '')
  assert.deepEqual(fm.tools, [])
  assert.deepEqual(fm.notFoundIntl, [{ code: 'en', htmlLang: 'en', hreflang: 'en', title: ts('en', 'notFound.title'), linkText: ts('en', 'notFound.siteHome'), href: 'https://www.casper.tw/en/' }])
  assert.deepEqual(notFoundIntl({ pages: [], published: [] }), [])
})

test('siteFrontmatter：外語首頁有 home，不在 plan.pages 的語系丟錯', () => {
  const fm = siteFrontmatter({ pageType: 'site-home', canonical: 'https://www.casper.tw/en/', locale: 'en', plan: PLAN, index: INDEX })
  assert.equal(fm.kind, 'site-home')
  assert.equal(fm.locale, 'en')
  assert.equal(fm.section, '')
  assert.equal(fm.preview, null)
  assert.deepEqual(fm.languages.map((l) => l.code), ['zh-tw', 'en'])
  assert.deepEqual(fm.tools.map((t) => [t.href, t.exact]), [['https://www.casper.tw/lucky-draw/en/', true]])
  assert.equal(fm.home.hero.toolsHref, 'https://www.casper.tw/en/#tools')
  assert.throws(() => siteFrontmatter({ pageType: 'site-home', locale: 'ja', plan: PLAN }), /site-home ja 不在這次建置的 plan\.pages/)
})

test('siteHomeView：H1 是站名，語言不同時帶 lang；連到繁中頁的連結加 hreflang zh-Hant', () => {
  const en = siteHomeView('en')
  assert.equal(en.h1.text, siteName('en'))
  const ja = siteHomeView('ja')
  assert.equal(ja.hero.toolsHref, 'https://www.casper.tw/ja/#tools')
  for (const key of ['latest', 'categories', 'about']) {
    assert.equal(ja.links[key].hreflang, 'zh-Hant', key)
    assert.match(ja.links[key].href, /^https:\/\/www\.casper\.tw\//)
  }
  assert.equal(ja.links.latest.href, 'https://www.casper.tw/')
  assert.equal(ja.links.categories.href, 'https://www.casper.tw/categories/')
  assert.throws(() => siteHomeView('es'), /沒有 i18n\/home\/es\.json/)
  assert.throws(() => siteHomeView('en', { readHome: () => null }), /site-home en：沒有/)
})

test('previewData：這個語系沒有工具時多一條 toolsNote；preview 計畫的頁都有 preview 欄', () => {
  assert.deepEqual(previewData('ja', EMPTY), { notice: PREVIEW_NOTICE, toolsNote: PREVIEW_TOOLS_NOTE })
  assert.deepEqual(previewData('en', INDEX), { notice: PREVIEW_NOTICE, toolsNote: null })
  const fm = siteFrontmatter({ pageType: 'site-home', canonical: 'https://www.casper.tw/ko/', locale: 'ko', plan: PREVIEW, index: EMPTY })
  assert.deepEqual(fm.preview, { notice: PREVIEW_NOTICE, toolsNote: PREVIEW_TOOLS_NOTE })
  assert.deepEqual(fm.siteHomes, [])
  assert.deepEqual(fm.languages.map((l) => [l.code, l.preview ?? false]), [['zh-tw', false], ['en', true], ['ja', true], ['ko', true], ['de', true]])
})
