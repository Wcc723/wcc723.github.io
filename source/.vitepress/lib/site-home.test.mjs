// lib/site-home.mjs 的測試（主站首頁規格 J.4）：設定驗證、CS_STAGE、G1 到 G9、preview 的頁與警告、
// VitePress locales、語言選單目標、長度與唯一性，以及附錄 A 的四個草稿檔過 G1。讀檔的部分一律注入，不碰真的設定。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import siteConfig from '../site.config.mjs'
import {
  HOME_PLACEHOLDERS,
  SITE_HOME_CODES,
  buildSiteHomePlan,
  clusterCodes,
  effectiveShell,
  formatHomeCopy,
  homeFileProblems,
  homeGateProblems,
  languageTargets,
  readGlossary,
  readHomeMessages,
  resolveHomeStage,
  siteConfigProblems,
  siteHomeSeoProblems,
  siteHomeTitle,
  validateSiteConfig,
  vitepressLocales,
} from './site-home.mjs'
import { WEBSITE_ID, homeJsonLd } from './seo.mjs'
import { stampFile } from '../theme/shared/shell/i18n/messages.mjs'
import { shellRecord } from '../theme/shared/shell/i18n/review.mjs'
import { shellKeysFor } from '../theme/shared/shell/i18n/shell-strings.mjs'
import { LEGAL_DECISIONS, LEGAL_PAGES, legalGaps } from '../theme/shared/shell/i18n/legal.mjs'

const AT = '2026-11-04'
const NAME_EN = "Casper's Sidekick"
const glossary = readGlossary()
const clone = (v) => JSON.parse(JSON.stringify(v))

/** 一份每個 key 都蓋過章的外殼字串審稿紀錄 */
function shellReviewFor(codes) {
  return { review: Object.fromEntries(codes.map((c) => [c, Object.fromEntries(shellKeysFor(c).map((k) => [k, shellRecord(c, k, { by: 'casper', at: AT })]))])), rebases: [] }
}
const SHELL_OK = shellReviewFor(['zh-tw', 'en', 'ja', 'de'])

/** 照 site.config.mjs 的形狀，覆寫一部分 */
function config(over = {}) {
  const base = clone(siteConfig)
  return { ...base, ...over, home: { ...base.home, ...(over.home ?? {}) } }
}

const REVIEWERS = { en: [{ id: 'casper', native: false }], ja: [{ id: 'yuki', native: true }], de: [{ id: 'lena', native: true }] }
const stamp = (code, file, source, by, reviewers = REVIEWERS) => stampFile(file, source, { code, by, at: AT, reviewers, sourceLocale: 'en' })
const EN = stamp('en', readHomeMessages('en'), null, 'casper')
const JA = stamp('ja', readHomeMessages('ja'), EN, 'yuki')
const DE = stamp('de', readHomeMessages('de'), EN, 'lena')
const FILES = { en: EN, ja: JA, de: DE }
const INDEX = {
  schema: 1, blogShell: 'shared', siteHomes: [],
  tools: [{
    slug: 'lucky-draw', rootLocale: 'zh-tw', xDefaultLocale: 'en', ghost: 'spot3', keywords: [],
    locales: {
      'zh-tw': { url: 'https://www.casper.tw/lucky-draw/', name: '抽獎大師', summary: '抽獎、轉盤、分組' },
      en: { url: 'https://www.casper.tw/lucky-draw/en/', name: 'Lucky Draw', summary: 'Draw names, spin a wheel, split teams' },
      ja: { url: 'https://www.casper.tw/lucky-draw/ja/', name: 'ラッキードロー', summary: '抽選、ルーレット、チーム分け' },
      de: { url: 'https://www.casper.tw/lucky-draw/de/', name: 'Glücksrad', summary: 'Namen ziehen, Glücksrad drehen, Teams bilden' },
    },
  }],
}
const LEGAL = {
  pages: {
    ...LEGAL_PAGES,
    privacy: { ...LEGAL_PAGES.privacy, en: 'https://www.casper.tw/site-policies/privacy/', ja: 'https://www.casper.tw/site-policies/ja/privacy/', de: 'https://www.casper.tw/site-policies/de/privacy/' },
    externalTransmission: { ja: 'https://www.casper.tw/site-policies/ja/privacy/#external' },
  },
  decisions: LEGAL_DECISIONS,
}
/** P3 在 / 加的 WebSite（G6 要它） */
const ROOT_LD = [{ '@context': 'https://schema.org', '@type': 'WebSite', '@id': WEBSITE_ID, url: 'https://www.casper.tw/', name: '卡斯伯工具' }]
/** 全部關卡都過的 live 計畫輸入：en、ja、de 上線 */
function liveInput(over = {}) {
  return {
    config: config({ shell: 'shared', home: { locales: ['en', 'ja', 'de'], reviewers: REVIEWERS } }),
    env: {},
    readHome: (c) => FILES[c] ?? null,
    shellReview: SHELL_OK,
    legal: LEGAL,
    siteNameEn: NAME_EN,
    index: INDEX,
    today: AT,
    glossary,
    rootJsonLd: ROOT_LD,
    ...over,
  }
}
const gateCtx = (over = {}) => {
  const i = liveInput(over)
  return { config: i.config, readHome: i.readHome, shellReview: i.shellReview, legal: i.legal, siteNameEn: i.siteNameEn, index: i.index, today: i.today, glossary: i.glossary, rootJsonLd: i.rootJsonLd }
}
// 已上線的外語首頁：一版加一個，跟 site.config.mjs 的 home.locales 一起改（en、ja、ko、de、es 2026-11-06）
const OPENED = ['en', 'ja', 'ko', 'de', 'es']

const gates = (list) => [...new Set(list.map((m) => /：(G\d)/.exec(m)?.[1]).filter(Boolean))].sort()

test('site.config.mjs：S 版起 shell 是 shared、外語首頁照 OPENED，validateSiteConfig 通過', () => {
  assert.equal(siteConfig.shell, 'shared')
  assert.deepEqual(siteConfig.home.locales, OPENED)
  assert.equal(siteConfig.home.sourceLocale, 'en')
  assert.deepEqual(siteConfig.home.roadmap, ['en', 'ja', 'ko', 'de', 'zh-cn', 'es'])
  assert.equal(validateSiteConfig(), siteConfig)
  assert.deepEqual(HOME_PLACEHOLDERS, ['author', 'site'])
  assert.deepEqual(SITE_HOME_CODES, ['en', 'zh-cn', 'ja', 'ko', 'de', 'es', 'fr'])
})

test('validateSiteConfig：每條規則', () => {
  const bad = (over, re) => {
    const p = siteConfigProblems(over, { shellReview: { review: {}, rebases: [] } })
    assert.ok(p.some((m) => re.test(m)), `${re}：${p.join('\n')}`)
    assert.throws(() => validateSiteConfig(over, { shellReview: { review: {}, rebases: [] } }), /site\.config\.mjs 設定有誤/)
  }
  bad(null, /要 export default 一個物件/)
  bad(config({ shell: 'new' }), /shell 只能是/)
  bad({ shell: 'legacy' }, /缺 home/)
  bad(config({ home: { roadmap: 'en' } }), /home\.roadmap 要是陣列/)
  bad(config({ home: { roadmap: ['en', 'xx'] } }), /登錄表以外的語系/)
  bad(config({ home: { roadmap: ['en', 'zh-tw'] } }), /不能有 zh-tw/)
  bad(config({ home: { roadmap: ['en', 'en'] } }), /重複列了 en/)
  bad(config({ home: { locales: ['ja'] } }), /一定要有 en/)
  bad(config({ shell: 'legacy', home: { locales: ['en'] } }), /shell 一定是 'shared'/)
  bad(config({ home: { locales: ['it'] } }), /登錄表以外的語系/)
  bad(config({ home: { roadmap: ['en'], locales: ['en', 'ja'] } }), /ja 不在 home\.roadmap/)
  bad(config({ shell: 'shared' }), /外殼字串 zh-tw 是 unreviewed/)
  bad(config({ home: { sourceLocale: 'ja', roadmap: ['en'] } }), /sourceLocale "ja" 不在 home\.roadmap/)
  bad(config({ home: { reviewers: { en: [{ id: 'Casper', native: false }] } } }), /小寫英數與連字號/)
  bad(config({ home: { reviewers: { en: [{ id: 'casper' }] } } }), /native: true 或 false/)
  bad(config({ home: { reviewers: { en: [{ id: 'casper', native: false, name: 'x' }] } } }), /不認得的欄位 name/)
  bad(config({ home: { reviewers: { fr: [] } } }), /不在 home\.roadmap 的語系 fr/)
  bad(config({ home: { reviewers: { en: [{ id: 'casper', native: true }] } } }), /reviewers\.json 是 native: false/)
  bad(config({ home: { waivers: [{ page: 'home', locale: 'ja', keys: [], until: AT }] } }), /home\.waivers\[0\]/)
  // shell 'shared' 而 zh-tw 外殼字串審過：通過
  assert.deepEqual(siteConfigProblems(config({ shell: 'shared' }), { shellReview: SHELL_OK }), [])
})

test('resolveHomeStage：沒設是 live，只接受 preview，CI 上不准 preview', () => {
  assert.equal(resolveHomeStage({}), 'live')
  assert.equal(resolveHomeStage({ CS_STAGE: '' }), 'live')
  assert.equal(resolveHomeStage({ CS_STAGE: 'preview' }), 'preview')
  assert.throws(() => resolveHomeStage({ CS_STAGE: 'live' }), /只接受 preview/)
  assert.throws(() => resolveHomeStage({ CS_STAGE: 'preview', CI: 'true' }), /CI 上不准 preview/)
  assert.throws(() => resolveHomeStage({ CS_STAGE: 'preview', GITHUB_ACTIONS: 'true' }), /CI 上不准 preview/)
  assert.equal(resolveHomeStage({ CI: 'true' }), 'live')
})

test('附錄 A 的四個草稿檔過 G1（key、佔位符、lint、書寫系統、$meta 格式）', () => {
  const en = readHomeMessages('en')
  for (const code of ['en', 'ja', 'ko', 'de', 'es']) {
    const file = readHomeMessages(code)
    assert.ok(file, code)
    assert.deepEqual(homeFileProblems({ file, source: en, code, sourceLocale: 'en', glossary }), [], code)
  }
  assert.equal(readHomeMessages('zh-cn'), null)
})

test('全部關卡都過的 live 計畫：en、ja、de 上線', () => {
  const plan = buildSiteHomePlan(liveInput())
  assert.deepEqual(plan.problems, [])
  assert.equal(plan.stage, 'live')
  assert.deepEqual(plan.published, ['en', 'ja', 'de'])
  assert.deepEqual(plan.pages, ['en', 'ja', 'de'].map((code) => ({ code, url: `https://www.casper.tw/${code}/`, preview: false })))
  assert.deepEqual(clusterCodes(plan), ['en', 'ja', 'de'])
})

test('G1 到 G9：各一個不過的案例', () => {
  assert.deepEqual(homeGateProblems('ja', gateCtx()), [])
  // G1：沒有文案檔、key 跟 en 不同、佔位符不在 {site} {author}
  assert.deepEqual(gates(homeGateProblems('ja', gateCtx({ readHome: (c) => (c === 'ja' ? null : FILES[c]) }))), ['G1'])
  const extra = { ...JA, hero: { ...JA.hero, extra: 'もう一つ' } }
  assert.ok(gates(homeGateProblems('ja', gateCtx({ readHome: (c) => (c === 'ja' ? extra : FILES[c]) }))).includes('G1'))
  const ph = { ...EN, hero: { ...EN.hero, lead: 'Tools by {name}.' } }
  assert.ok(homeGateProblems('en', gateCtx({ readHome: (c) => (c === 'en' ? ph : FILES[c]) })).some((m) => /G1 .*不支援的佔位符 \{name\}/.test(m)))
  // G2：沒蓋章（真實的 de 檔 2026-11-06 已蓋章，這裡拿掉章再驗）
  const deRaw = readHomeMessages('de')
  const deUnstamped = { ...deRaw, $meta: { ...deRaw.$meta, review: {} } }
  assert.deepEqual(gates(homeGateProblems('de', gateCtx({ readHome: (c) => (c === 'de' ? deUnstamped : FILES[c]) }))), ['G2'])
  // G3：外殼字串沒審
  assert.deepEqual(gates(homeGateProblems('ja', gateCtx({ shellReview: shellReviewFor(['zh-tw', 'en']) }))), ['G3'])
  // G4：審稿人的 native 照登錄表 nativeReviewer
  const cfg = config({ shell: 'shared', home: { locales: ['en', 'ja'], reviewers: { ...REVIEWERS, ja: [{ id: 'yuki', native: false }] } } })
  // 0010（2026-11-06）起 ja 是 ai-cross：native: false 的章也過 G4；要母語審稿人的只剩 zh-cn
  assert.ok(!homeGateProblems('ja', gateCtx({ config: cfg })).some((m) => /G4/.test(m)))
  const cfgCn = config({ shell: 'shared', home: { locales: ['en', 'zh-cn'], reviewers: { ...REVIEWERS, 'zh-cn': [{ id: 'yuki', native: false }] } } })
  const readCn = (c) => (c === 'zh-cn' ? FILES.ja : FILES[c])
  assert.ok(homeGateProblems('zh-cn', gateCtx({ config: cfgCn, readHome: readCn })).some((m) => /G4 .*zh-cn 要母語審稿人，yuki 是 native: false/.test(m)))
  // G5：沒有同語言的隱私權頁；ja 的外部送信沒有網址也沒有豁免
  const noEnPrivacy = { ...LEGAL_PAGES, privacy: { 'zh-tw': LEGAL_PAGES.privacy['zh-tw'] } }
  assert.deepEqual(gates(homeGateProblems('en', gateCtx({ legal: { pages: noEnPrivacy, decisions: LEGAL_DECISIONS } }))), ['G5'])
  // 2026-11-06 起 en 有 site-policies 的隱私權頁：真實的 LEGAL_PAGES 讓 en 的 G5 過
  assert.ok(!homeGateProblems('en', gateCtx({ legal: { pages: LEGAL_PAGES, decisions: LEGAL_DECISIONS } })).some((m) => /G5/.test(m)))
  const noExt = { pages: { ...LEGAL.pages, externalTransmission: {} }, decisions: LEGAL_DECISIONS }
  assert.deepEqual(gates(homeGateProblems('ja', gateCtx({ legal: noExt }))), ['G5'])
  // de 的 Impressum 是站長豁免：G5 過
  assert.ok(!homeGateProblems('de', gateCtx()).some((m) => /G5/.test(m)))
  // G6：SITE_NAME_EN 還是空字串；/ 沒有 WebSite（P2 以前 homeJsonLd() 是空的）、或 @id 不對。P3 起 homeJsonLd() 有 WebSite，G6 過
  assert.deepEqual(gates(homeGateProblems('ja', gateCtx({ siteNameEn: '' }))), ['G6'])
  assert.ok(homeJsonLd().some((x) => x['@type'] === 'WebSite' && x['@id'] === WEBSITE_ID))
  assert.ok(!homeGateProblems('ja', gateCtx({ rootJsonLd: homeJsonLd() })).some((m) => /G6/.test(m)))
  assert.ok(homeGateProblems('ja', gateCtx({ rootJsonLd: [] })).some((m) => /G6 \/ 的 JSON-LD 沒有 @id 是 https:\/\/www\.casper\.tw\/#website 的 WebSite/.test(m)))
  assert.deepEqual(gates(homeGateProblems('ja', gateCtx({ rootJsonLd: [{ ...ROOT_LD[0], '@id': 'https://www.casper.tw/#site' }] }))), ['G6'])
  // G7：en 還沒上線
  const noEn = config({ shell: 'shared', home: { locales: ['ja'], reviewers: REVIEWERS } })
  assert.deepEqual(gates(homeGateProblems('ja', gateCtx({ config: noEn }))), ['G7'])
  // G8：沒有工具有這個語系
  assert.deepEqual(gates(homeGateProblems('ja', gateCtx({ index: { ...INDEX, tools: [] } }))), ['G8'])
  // G9：正本改了事實性文字（about.body），ja 的譯文過期；豁免在期限內就放行
  const en2 = stamp('en', { ...EN, about: { ...EN.about, body: `${EN.about.body} Updated.` } }, null, 'casper')
  const read9 = (c) => (c === 'en' ? en2 : FILES[c])
  assert.ok(homeGateProblems('ja', gateCtx({ readHome: read9 })).some((m) => /G9 .*about\.body 原文已改/.test(m)))
  const waived = config({ shell: 'shared', home: { locales: ['en', 'ja', 'de'], reviewers: REVIEWERS, waivers: [{ page: 'home', locale: 'ja', keys: ['about.body'], until: '2026-11-20' }] } })
  assert.deepEqual(homeGateProblems('ja', gateCtx({ readHome: read9, config: waived })), [])
  // live 時關卡沒過的語系讓 problems 非空（config.mts 會丟錯）
  const plan = buildSiteHomePlan(liveInput({ siteNameEn: '' }))
  assert.ok(plan.problems.some((m) => /^site-home en：G6/.test(m)))
})

test('preview：roadmap 裡有文案檔的每個語系都產生頁，關卡只記警告', () => {
  const plan = buildSiteHomePlan({ config: siteConfig, env: { CS_STAGE: 'preview' }, today: AT })
  assert.equal(plan.stage, 'preview')
  assert.deepEqual(plan.published, OPENED)
  assert.deepEqual(plan.pages.map((p) => [p.code, p.preview]), ['en', 'ja', 'ko', 'de', 'es'].map((c) => [c, !OPENED.includes(c)]))
  assert.deepEqual(plan.problems, [])
  assert.ok(plan.warnings.some((m) => /site-home zh-cn：沒有 i18n\/home\/zh-cn\.json，preview 不產生這頁/.test(m)))
  // en 的文案與外殼字串 2026-11-05 審過；ja、ko、de、es 2026-11-06 照 0010 蓋章：都沒有 G2、G3
  for (const code of ['en', 'ja', 'ko', 'de', 'es']) assert.ok(!plan.warnings.some((m) => new RegExp(`^preview：site-home ${code}：G[23]`).test(m)), code)
  // G5 照 legal.mjs：有同語言隱私權頁（site-policies，一語一版加）的語系不警告，還沒有的才警告
  for (const code of ['en', 'ja', 'ko', 'de', 'es']) {
    assert.equal(plan.warnings.some((m) => new RegExp(`^preview：site-home ${code}：G5`).test(m)), legalGaps(code).length > 0, code)
  }
  // preview 一律用共用頁首頁尾（effectiveShell），shell 是 legacy 不再另外警告
  assert.ok(!plan.warnings.some((m) => /shell 是 'legacy'/.test(m)))
  // live：只有 OPENED 的頁、沒有問題
  const live = buildSiteHomePlan({ config: siteConfig, env: {}, today: AT })
  assert.deepEqual([live.published, live.pages.map((p) => p.code), live.problems], [OPENED, OPENED, []])
})

test('effectiveShell：preview 一律 shared，其他照 site.config.mjs 的 shell', () => {
  const legacy = { ...siteConfig, shell: 'legacy' }
  const shared = { ...siteConfig, shell: 'shared' }
  assert.equal(effectiveShell({ stage: 'preview' }, legacy), 'shared')
  assert.equal(effectiveShell({ stage: 'preview' }, shared), 'shared')
  assert.equal(effectiveShell({ stage: 'live' }, legacy), 'legacy')
  assert.equal(effectiveShell({ stage: 'live' }, shared), 'shared')
  assert.equal(effectiveShell(null, legacy), 'legacy')
  // 預設讀 site.config.mjs（P1、P2 是 legacy）
  assert.equal(effectiveShell({ stage: 'live' }), siteConfig.shell)
  const preview = buildSiteHomePlan({ config: siteConfig, env: { CS_STAGE: 'preview' }, today: AT })
  assert.equal(effectiveShell(preview), 'shared')
})

test('vitepressLocales：root 是 zh-TW，其他只給 label 與 lang', () => {
  assert.deepEqual(vitepressLocales({ pages: [] }), { root: { label: '繁體中文', lang: 'zh-TW' } })
  assert.deepEqual(vitepressLocales({ pages: [{ code: 'en' }, { code: 'ja' }] }), {
    root: { label: '繁體中文', lang: 'zh-TW' },
    en: { label: 'English', lang: 'en' },
    ja: { label: '日本語', lang: 'ja' },
  })
})

test('languageTargets：首頁、外語首頁、其他繁中頁、404；缺 menu.homeOnly 丟錯', () => {
  const plan = { pages: [{ code: 'en', preview: false }, { code: 'ja', preview: true }] }
  const home = languageTargets({ pageType: 'home', plan })
  assert.deepEqual(home.map((t) => [t.code, t.href, t.exact]), [['zh-tw', 'https://www.casper.tw/', true], ['en', 'https://www.casper.tw/en/', true], ['ja', 'https://www.casper.tw/ja/', true]])
  assert.equal(home[2].preview, true)
  assert.equal(home[1].preview, undefined)
  assert.deepEqual(languageTargets({ pageType: 'site-home', plan }).map((t) => t.code), ['zh-tw', 'en', 'ja'])
  const post = languageTargets({ pageType: 'post', canonical: 'https://www.casper.tw/css/2013/09/29/css-target/', plan })
  assert.deepEqual(post[0], { code: 'zh-tw', href: 'https://www.casper.tw/css/2013/09/29/css-target/', exact: true, autonym: '繁體中文', htmlLang: 'zh-Hant-TW', hreflang: 'zh-Hant' })
  assert.deepEqual(post.slice(1).map((t) => [t.code, t.exact, t.homeOnly]), [['en', false, '(home page)'], ['ja', false, '（トップページ）']])
  assert.deepEqual(languageTargets({ pageType: 'not-found', plan }), [])
  assert.deepEqual(languageTargets({ pageType: 'post', canonical: 'x', plan: { pages: [] } }).length, 1)
  const noMenu = (c) => ({ ...readHomeMessages(c), menu: {} })
  assert.throws(() => languageTargets({ pageType: 'post', canonical: 'x', plan, readHome: noMenu }), /沒有 menu\.homeOnly/)
})

test('siteHomeSeoProblems：長度是警告，title、description 重複與 tagline 含站名是錯誤', () => {
  const plan = { pages: [{ code: 'en' }, { code: 'ja' }] }
  const ok = siteHomeSeoProblems(plan, (c) => FILES[c], { siteNameEn: NAME_EN })
  assert.deepEqual(ok.errors, [])
  const same = siteHomeSeoProblems(plan, (c) => (c === 'ja' ? { ...JA, meta: { ...JA.meta, description: EN.meta.description } } : FILES[c]), { siteNameEn: NAME_EN })
  assert.ok(same.errors.some((m) => /site-home ja：description 跟 \/en\/ 重複/.test(m)))
  const dupTitle = siteHomeSeoProblems({ pages: [{ code: 'en' }] }, () => EN, { rootTitle: siteHomeTitle('en', formatHomeCopy(EN, 'en'), { siteNameEn: NAME_EN }), siteNameEn: NAME_EN })
  assert.ok(dupTitle.errors.some((m) => /title「.*」跟 \/ 重複/.test(m)))
  const named = siteHomeSeoProblems({ pages: [{ code: 'en' }] }, () => ({ ...EN, meta: { ...EN.meta, tagline: `${NAME_EN} tools` } }), { siteNameEn: NAME_EN })
  assert.ok(named.errors.some((m) => /meta\.tagline 含站名/.test(m)))
  const long = siteHomeSeoProblems({ pages: [{ code: 'en' }] }, () => ({ ...EN, meta: { ...EN.meta, description: 'Short.' } }), { siteNameEn: NAME_EN })
  assert.deepEqual(long.errors, [])
  assert.ok(long.warnings.some((m) => /description 長度 6/.test(m)))
})

test('siteHomeTitle：站名加 titleSeparator 加 tagline；SITE_NAME_EN 是空字串時站名退成 casper.tw', () => {
  const copy = formatHomeCopy(EN, 'en')
  assert.equal(siteHomeTitle('en', copy, { siteNameEn: NAME_EN }), `${NAME_EN} | ${copy.meta.tagline}`)
  assert.equal(siteHomeTitle('en', copy, { siteNameEn: '' }), `casper.tw | ${copy.meta.tagline}`)
  assert.equal(siteHomeTitle('ja', formatHomeCopy(JA, 'ja'), { siteNameEn: NAME_EN }), `${NAME_EN}｜${formatHomeCopy(JA, 'ja').meta.tagline}`)
})
