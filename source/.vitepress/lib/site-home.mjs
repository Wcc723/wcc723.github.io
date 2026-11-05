// 外語首頁（/<code>/）的計畫、關卡、長度與唯一性、VitePress locales、語言選單目標（主站首頁規格 B.5、C、D.1、D.6、E.3）。
// 只在 Node 端執行（config.mts、[locale]/index.paths.mjs、lib/pagedata.mjs、scripts/），主題不 import。
// 同樣的輸入一定得到同樣的結果：讀檔的部分都可以注入（readHome、shellReview、index、today），測試不碰真的檔案。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import siteConfig from '../site.config.mjs'
import { HOME_DESCRIPTION, WEBSITE_ID, homeJsonLd } from './seo.mjs'
import { LOCALE, LOCALES, getLocale, sortLocaleCodes } from '../theme/shared/shell/i18n/locales.mjs'
import { siteHomeUrl } from '../theme/shared/shell/i18n/urls.mjs'
import { measure, siteName } from '../theme/shared/shell/i18n/seo.mjs'
import { formatShell, placeholdersOf, ts } from '../theme/shared/shell/i18n/shell-strings.mjs'
import { leafEntries, shellState, worstState } from '../theme/shared/shell/i18n/review.mjs'
import {
  REVIEWER_ID,
  factualGate,
  fileKeyStates,
  keyProblems,
  lintProblems,
  placeholderProblems,
  reviewProblems,
  reviewerConflicts,
  reviewerProblem,
  scriptProblems,
  siteNameProblem,
  stringsOf,
  todayUtc,
} from '../theme/shared/shell/i18n/messages.mjs'
import { LEGAL_DECISIONS, LEGAL_PAGES, legalGaps } from '../theme/shared/shell/i18n/legal.mjs'
import { siteToolLinks } from '../theme/shared/shell/tools.mjs'
import { SITE_NAME, SITE_NAME_EN, SITE_TITLE_LEGACY } from '../theme/shared/shell/site.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const SHARED_DIR = path.resolve(here, '../theme/shared')

/** 外語首頁文案檔的資料夾：i18n/home/<code>.json（I.1） */
export const HOME_DIR = path.resolve(here, '../i18n/home')
/** 固定譯法與禁語（I.1） */
export const GLOSSARY_FILE = path.resolve(here, '../i18n/glossary.json')
/** 訊息檔的 id：錯誤訊息的前綴（i18n/home/en.json）與 G9 豁免的 page 欄位 */
export const HOME_ID = 'home'
const FILE_ID = 'i18n/home'
export const SHELLS = ['legacy', 'shared']
/** 外語首頁的語系：登錄表裡 zh-tw 以外的每一個（zh-tw 的首頁就是 /，B.2） */
export const SITE_HOME_CODES = LOCALES.map((l) => l.code).filter((c) => c !== 'zh-tw')
/** 佔位符只能用這兩個，由 formatShell 代入（I.1） */
export const HOME_PLACEHOLDERS = ['author', 'site']
/** scope 'title' 的禁語只查這個 key（title 的後半段） */
export const HOME_TITLE_KEYS = ['meta.tagline']

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const readJsonIfExists = (file) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null)

/** theme/shared/shell/i18n/shell-review.json（外殼字串的審稿紀錄） */
export const SHELL_REVIEW = readJsonIfExists(path.join(SHARED_DIR, 'shell/i18n/shell-review.json')) ?? { review: {}, rebases: [] }
/** theme/shared/shell/i18n/reviewers.json（外殼字串的審稿人登記表） */
export const REVIEWER_REGISTRY = readJsonIfExists(path.join(SHARED_DIR, 'shell/i18n/reviewers.json')) ?? { reviewers: {} }
/** theme/shared/data/tools.json（F.5）；檔案不存在時當成沒有工具。部落格只用 tools，siteHomes 不讀（C.1） */
export const SITE_INDEX = readJsonIfExists(path.join(SHARED_DIR, 'data/tools.json')) ?? { siteHomes: [], tools: [] }

/** i18n/home/<code>.json 的內容；沒有檔案回 null */
export function readHomeMessages(code, { dir = HOME_DIR } = {}) {
  return readJsonIfExists(path.join(dir, `${code}.json`))
}

/** i18n/glossary.json；沒有檔案回 { terms: {}, forbidden: [] } */
export function readGlossary(file = GLOSSARY_FILE) {
  return readJsonIfExists(file) ?? { terms: {}, forbidden: [] }
}

// ── 設定驗證（B.5） ─────────────────────────────────────────────────────────

/** site.config.mjs 的問題清單；shellReview、registry 是外殼字串的審稿紀錄與審稿人登記表 */
export function siteConfigProblems(config, { shellReview = SHELL_REVIEW, registry = REVIEWER_REGISTRY } = {}) {
  const out = []
  const where = 'site.config.mjs'
  if (!config || typeof config !== 'object') return [`${where} 要 export default 一個物件`]
  if (!SHELLS.includes(config.shell)) out.push(`${where} 的 shell 只能是 ${SHELLS.map((s) => `'${s}'`).join('、')}（現在是 ${JSON.stringify(config.shell)}）`)
  const home = config.home
  if (!home || typeof home !== 'object') return [...out, `${where} 缺 home`]
  const codeList = (name) => {
    const list = home[name]
    if (!Array.isArray(list)) {
      out.push(`${where} 的 home.${name} 要是陣列`)
      return []
    }
    const seen = new Set()
    for (const c of list) {
      if (!LOCALE[c]) out.push(`${where} 的 home.${name} 有登錄表以外的語系 ${JSON.stringify(c)}`)
      else if (c === 'zh-tw') out.push(`${where} 的 home.${name} 不能有 zh-tw：繁中首頁就是 /（B.2）`)
      if (seen.has(c)) out.push(`${where} 的 home.${name} 重複列了 ${c}`)
      seen.add(c)
    }
    return list
  }
  const roadmap = codeList('roadmap')
  const locales = codeList('locales')
  for (const c of locales) if (!roadmap.includes(c)) out.push(`${where} 的 home.locales 的 ${c} 不在 home.roadmap`)
  if (locales.length && !locales.includes('en')) out.push(`${where} 的 home.locales 不是空的時候一定要有 en：x-default 是 /en/`)
  if (locales.length && config.shell !== 'shared') out.push(`${where} 的 home.locales 不是空的時候 shell 一定是 'shared'：語言選單只做在共用頁首上，S 要在 I1 之前`)
  if (config.shell === 'shared') {
    const s = shellState('zh-tw', shellReview)
    if (s !== 'ok' && s !== 'outdated') out.push(`${where} 的 shell 是 'shared'，但外殼字串 zh-tw 是 ${s}：S 之前站長要蓋 zh-tw 的章（I.3）`)
  }
  if (!roadmap.includes(home.sourceLocale)) out.push(`${where} 的 home.sourceLocale ${JSON.stringify(home.sourceLocale)} 不在 home.roadmap`)
  const reviewers = home.reviewers ?? {}
  if (!reviewers || typeof reviewers !== 'object' || Array.isArray(reviewers)) out.push(`${where} 的 home.reviewers 要是 { <語系>: [{ id, native }] }`)
  else {
    for (const [code, list] of Object.entries(reviewers)) {
      if (!roadmap.includes(code)) out.push(`${where} 的 home.reviewers 有不在 home.roadmap 的語系 ${code}`)
      if (!Array.isArray(list)) {
        out.push(`${where} 的 home.reviewers['${code}'] 要是陣列`)
        continue
      }
      for (const r of list) {
        if (!r || typeof r !== 'object') out.push(`${where} 的 home.reviewers['${code}'] 每筆要是 { id, native }`)
        else {
          if (typeof r.id !== 'string' || !REVIEWER_ID.test(r.id)) out.push(`${where} 的 home.reviewers['${code}'] 的 id ${JSON.stringify(r.id)} 要是小寫英數與連字號（不寫真名）`)
          if (typeof r.native !== 'boolean') out.push(`${where} 的 home.reviewers['${code}'] 的 ${r.id} 要寫 native: true 或 false`)
          for (const k of Object.keys(r)) if (!['id', 'native'].includes(k)) out.push(`${where} 的 home.reviewers['${code}'] 的 ${r.id} 有不認得的欄位 ${k}`)
        }
      }
    }
    out.push(...reviewerConflicts(reviewers, registry, `${where} 的 home.reviewers`))
  }
  const waivers = home.waivers ?? []
  if (!Array.isArray(waivers)) out.push(`${where} 的 home.waivers 要是陣列`)
  else {
    for (const [i, w] of waivers.entries()) {
      const ok = w && w.page === HOME_ID && roadmap.includes(w.locale) && Array.isArray(w.keys) && w.keys.length
        && w.keys.every((k) => typeof k === 'string' && k) && typeof w.until === 'string' && DATE_RE.test(w.until)
      if (!ok) out.push(`${where} 的 home.waivers[${i}] 要是 { page: '${HOME_ID}', locale: <roadmap 裡的語系>, keys: [key…], until: 'YYYY-MM-DD' }`)
    }
  }
  return out
}

/** 設定有錯就丟錯（config 載入時跑，錯了建置就失敗）；沒錯回 config */
export function validateSiteConfig(config = siteConfig, opts = {}) {
  const problems = siteConfigProblems(config, opts)
  if (problems.length) throw new Error(`site.config.mjs 設定有誤：\n${problems.join('\n')}`)
  return config
}

/**
 * CS_STAGE：沒設或空字串是 live；'preview' 是本機預覽；其他值丟錯。
 * CI 或 GITHUB_ACTIONS 是 'true' 時設 preview 也丟錯：部落格 push main 就上線，沒有預覽網址可以擋（C.1）
 */
export function resolveHomeStage(env = process.env) {
  const v = env?.CS_STAGE ?? ''
  if (v === '') return 'live'
  if (v !== 'preview') throw new Error(`CS_STAGE 只接受 preview（現在是 ${JSON.stringify(v)}）；沒設就是 live`)
  if (env.CI === 'true' || env.GITHUB_ACTIONS === 'true') {
    throw new Error('CI 上不准 preview 建置：部落格 push main 就上線，preview 的產物不能部署（主站首頁規格 C.1）')
  }
  return 'preview'
}

// ── 文案檔 ─────────────────────────────────────────────────────────────────

/** 文案檔的佔位符只能是 {site}、{author}（I.1） */
export function homePlaceholderProblems(file, code) {
  const out = []
  for (const [k, v] of leafEntries(file)) {
    for (const s of stringsOf(v)) {
      const bad = placeholdersOf(s).filter((p) => !HOME_PLACEHOLDERS.includes(p))
      if (bad.length) out.push(`${FILE_ID}/${code}.json 的 ${k} 用了不支援的佔位符 {${bad.join('}、{')}}：只能用 {site}、{author}`)
    }
  }
  return out
}

/**
 * G1 的內容檢查（檔案存在以外）：key、佔位符、lint、書寫系統、$meta 與審稿紀錄的格式。
 * source 是正本（code 就是正本時不用給）。審稿人是否登記、是不是母語者不在這裡，由 G4 擋
 */
export function homeFileProblems({ file, source, code, sourceLocale, glossary }) {
  const isSource = code === sourceLocale
  const src = isSource ? null : source
  const id = FILE_ID
  // 格式檢查用的審稿人：紀錄上出現的每個人都當成已登記的母語者，只留下格式問題
  const records = Object.values(file?.$meta?.review ?? {})
  const anyone = { [code]: records.filter((r) => typeof r?.by === 'string').map((r) => ({ id: r.by, native: true })) }
  return [
    ...keyProblems({ file, source: src, code, id }),
    ...placeholderProblems({ file, source: src, code, id }),
    ...homePlaceholderProblems(file, code),
    ...lintProblems({ file, code, id, glossary, titleKeys: HOME_TITLE_KEYS }),
    ...scriptProblems({ file, code, id }),
    ...reviewProblems({ file, code, id, reviewers: anyone, sourceLocale }),
  ]
}

/** 文案代入佔位符：巢狀物件照原樣、每個字串跑 formatShell(value, code)，$meta 拿掉 */
export function formatHomeCopy(file, code) {
  const walk = (v) => {
    if (typeof v === 'string') return formatShell(v, code)
    if (Array.isArray(v)) return v.map(walk)
    if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).filter(([k]) => k !== '$meta').map(([k, x]) => [k, walk(x)]))
    return v
  }
  return walk(file)
}

/** 外語首頁的 title：siteName(code) + titleSeparator + meta.tagline（D.2） */
export function siteHomeTitle(code, copy, { siteNameEn = SITE_NAME_EN } = {}) {
  return `${siteName(code, { nameEn: siteNameEn })}${getLocale(code).titleSeparator}${copy.meta.tagline}`
}

// ── 關卡（C.2） ─────────────────────────────────────────────────────────────

/**
 * 一個語系的 G1 到 G9。ctx：{ config, readHome, shellReview, legal, siteNameEn, index, today, glossary, rootJsonLd }。
 * rootJsonLd 是 / 的 JSON-LD 節點（lib/seo.mjs 的 homeJsonLd()），G6 用它確認外語首頁 isPartOf 指的 WebSite 存在。
 * 回字串陣列，每條開頭是「site-home <code>：」
 */
export function homeGateProblems(code, ctx) {
  const { config, readHome, shellReview, legal, siteNameEn, index, today, glossary, rootJsonLd = [] } = ctx
  const home = config.home
  const src = home.sourceLocale
  const out = []
  const add = (gate, msg) => out.push(`site-home ${code}：${gate} ${msg}`)
  const file = readHome(code)
  const source = code === src ? file : readHome(src)

  // G1 文案檔
  if (!file) add('G1', `沒有文案檔 ${FILE_ID}/${code}.json`)
  else if (!source) add('G1', `沒有正本 ${FILE_ID}/${src}.json`)
  else for (const m of homeFileProblems({ file, source, code, sourceLocale: src, glossary })) add('G1', m)

  // G2 文案審稿
  const states = file ? fileKeyStates(file, source, code, src) : {}
  if (file) {
    const list = Object.values(states)
    const worst = list.length ? worstState(list) : 'unreviewed'
    if (worst !== 'ok' && worst !== 'outdated') {
      const n = list.filter((s) => s === 'unreviewed').length || 1
      add('G2', `文案還沒審完：${n} 個 key 是 unreviewed（審稿人逐字看過後用 npm run i18n:stamp 蓋章）`)
    }
  }

  // G3 外殼字串審稿
  const shell = shellState(code, shellReview)
  if (shell !== 'ok' && shell !== 'outdated') add('G3', `外殼字串是 ${shell}（審稿人蓋章：node shared/shell/i18n/build.mjs --stamp-shell ${code} --by <id>）`)

  // G4 審稿人：每一筆紀錄的 by 要登記在 home.reviewers[code]；登錄表 nativeReviewer 'required' 的語系要 native: true
  for (const [key, r] of Object.entries(file?.$meta?.review ?? {})) {
    const problem = reviewerProblem({ reviewers: home.reviewers ?? {}, label: 'site.config.mjs 的 home.reviewers' }, code, r?.by)
    if (problem) add('G4', `${key} 的章：${problem}`)
  }

  // G5 法務
  for (const g of legalGaps(code, legal)) add('G5', g.detail)

  // G6 站名，與 / 的 WebSite：外語首頁 WebPage 的 isPartOf 指它（D.4）。兩件都是 P3 做的，P3 只改站名、沒加 WebSite 也要擋
  const nameProblem = siteNameProblem(code, siteNameEn)
  if (nameProblem) add('G6', nameProblem)
  if (!rootJsonLd.some((x) => [x?.['@type']].flat().includes('WebSite') && x['@id'] === WEBSITE_ID)) {
    add('G6', `/ 的 JSON-LD 沒有 @id 是 ${WEBSITE_ID} 的 WebSite：外語首頁 WebPage 的 isPartOf 指向它，P3 在 / 加上之後才能上線（lib/seo.mjs 的 jsonLdFor 與 audit-build 的 JSONLD_TYPES.home，D.4）`)
  }

  // G7 x-default 先有
  if (code !== 'en' && !(home.locales ?? []).includes('en')) add('G7', 'en 不在 home.locales：x-default 是 /en/，en 要先上線')

  // G8 至少一支有這個語系的工具
  const text = (key, params) => ts(code, key, params)
  const exact = siteToolLinks(index, { locale: code, text }).filter((l) => l.exact).length
  if (!exact) add('G8', `tools.json 沒有任何工具有 ${code} 版：首頁的主角是工具，至少要有一支`)

  // G9 事實性文字
  if (file && source && code !== src) {
    for (const m of factualGate({
      files: [{ id: HOME_ID, code }],
      states: () => states,
      sourceOf: () => source,
      waivers: home.waivers ?? [],
      today,
      waiverLabel: 'site.config.mjs 的 home.waivers',
    })) add('G9', m)
  }
  return out
}

// ── 長度與唯一性（D.6） ─────────────────────────────────────────────────────

/**
 * 這次要產生的外語首頁之間、與 / 之間的 title、description 檢查。回 { errors, warnings }：
 * 長度超出預算是警告；title、description 重複與 tagline 含站名是錯誤。沒有文案檔的語系跳過（G1 會擋）
 */
export function siteHomeSeoProblems(plan, readHome = readHomeMessages, { rootTitle = SITE_TITLE_LEGACY, rootDescription = HOME_DESCRIPTION, siteNameEn = SITE_NAME_EN } = {}) {
  const errors = []
  const warnings = []
  const titles = new Map([[rootTitle, '/']])
  const descs = new Map([[rootDescription, '/']])
  for (const { code } of plan.pages) {
    const file = readHome(code)
    if (!file?.meta) continue
    const l = getLocale(code)
    let copy
    try {
      copy = formatHomeCopy(file, code)
    } catch (e) {
      errors.push(`site-home ${code}：文案代入佔位符失敗：${e.message}`)
      continue
    }
    const title = siteHomeTitle(code, copy, { siteNameEn })
    const description = String(copy.meta.description ?? '')
    const tLen = measure(title, l.titleBudget.unit)
    if (tLen > l.titleBudget.max) warnings.push(`site-home ${code}：title「${title}」長度 ${tLen}，超過 ${l.titleBudget.max}（${l.titleBudget.unit}）`)
    const dLen = measure(description, l.descBudget.unit)
    if (dLen < l.descBudget.min || dLen > l.descBudget.max) warnings.push(`site-home ${code}：description 長度 ${dLen}，預算是 ${l.descBudget.min} 到 ${l.descBudget.max}（${l.descBudget.unit}）`)
    if (titles.has(title)) errors.push(`site-home ${code}：title「${title}」跟 ${titles.get(title)} 重複`)
    else titles.set(title, `/${code}/`)
    if (descs.has(description)) errors.push(`site-home ${code}：description 跟 ${descs.get(description)} 重複`)
    else descs.set(description, `/${code}/`)
    const tagline = String(file.meta.tagline ?? '')
    for (const name of new Set([siteName(code, { nameEn: siteNameEn }), SITE_NAME, siteNameEn].filter(Boolean))) {
      if (formatShell(tagline, code).includes(name)) errors.push(`site-home ${code}：meta.tagline 含站名「${name}」，title 會出現兩次站名`)
    }
  }
  return { errors, warnings }
}

// ── 計畫（C.1） ─────────────────────────────────────────────────────────────

/**
 * 外語首頁這次建置要產生哪些頁。
 * @returns {{
 *   stage: 'live' | 'preview',
 *   published: string[],   // 正式開放的語系（= home.locales），照 LOCALES 排序
 *   pages: { code: string, url: string, preview: boolean }[],   // 這次要產生的頁；live 時就是 published
 *   problems: string[],    // live 時非空，config.mts 丟錯讓建置失敗
 *   warnings: string[],    // 長度預算、preview 時沒過的關卡
 * }}
 */
export function buildSiteHomePlan({
  config = siteConfig,
  env = process.env,
  readHome = readHomeMessages,
  shellReview = SHELL_REVIEW,
  legal = { pages: LEGAL_PAGES, decisions: LEGAL_DECISIONS },
  siteNameEn = SITE_NAME_EN,
  index = SITE_INDEX,
  today = todayUtc(),
  glossary = readGlossary(),
  registry = REVIEWER_REGISTRY,
  rootJsonLd = homeJsonLd(),
} = {}) {
  validateSiteConfig(config, { shellReview, registry })
  const stage = resolveHomeStage(env)
  const cache = new Map()
  const read = (code) => {
    if (!cache.has(code)) cache.set(code, readHome(code) ?? null)
    return cache.get(code)
  }
  const published = sortLocaleCodes(config.home.locales)
  const ctx = { config, readHome: read, shellReview, legal, siteNameEn, index, today, glossary, rootJsonLd }
  const problems = []
  const warnings = []
  let pages
  if (stage === 'live') {
    pages = published.map((code) => ({ code, url: siteHomeUrl(code), preview: false }))
    for (const code of published) problems.push(...homeGateProblems(code, ctx))
  } else {
    pages = []
    for (const code of sortLocaleCodes(config.home.roadmap)) {
      if (!read(code)) {
        warnings.push(`site-home ${code}：沒有 ${FILE_ID}/${code}.json，preview 不產生這頁`)
        continue
      }
      pages.push({ code, url: siteHomeUrl(code), preview: !published.includes(code) })
      for (const m of homeGateProblems(code, ctx)) warnings.push(`preview：${m}`)
    }
  }
  const seo = siteHomeSeoProblems({ pages }, read, { siteNameEn })
  if (stage === 'live') problems.push(...seo.errors)
  else warnings.push(...seo.errors.map((m) => `preview：${m}`))
  warnings.push(...seo.warnings)
  return { stage, published, pages, problems, warnings }
}

/** 這次建置的首頁叢集（hreflang、語言選單、og:locale:alternate 用）：plan.pages 的語系。live 時等於 published（C.3） */
export const clusterCodes = (plan) => (plan?.pages ?? []).map((p) => p.code)

/**
 * 這次建置實際用的頁首頁尾（C.3、G.5）：preview 一律 'shared'，其他照 site.config.mjs 的 shell。
 * 外語首頁只能配共用頁首頁尾上線（siteConfigProblems 擋），語言選單也只做在共用頁首上，所以 preview 要看的就是 S 版之後的樣子。
 * 用到的地方都呼叫這一支：lib/pagedata.mjs 決定每頁寫不寫 fm.site，config.mts 決定 __CS_SHARED_SHELL__
 */
export function effectiveShell(plan, config = siteConfig) {
  return plan?.stage === 'preview' ? 'shared' : config.shell
}

// ── VitePress 與語言選單 ───────────────────────────────────────────────────

/** VitePress 的 locales：只給 label 與 lang（D.1）。root 跟 config.mts 的 lang 相同，/ 底下的頁 <html lang> 不變 */
export function vitepressLocales(plan) {
  return {
    root: { label: getLocale('zh-tw').autonym, lang: 'zh-TW' },
    ...Object.fromEntries(plan.pages.map(({ code }) => [code, { label: getLocale(code).autonym, lang: getLocale(code).htmlLang }])),
  }
}

/**
 * LanguageMenu.vue 的 targets（E.3）：{ code, href, exact, autonym, htmlLang, hreflang, preview?, homeOnly? }，照 LOCALES 排序。
 *   home（/）與 site-home：繁中 / 加叢集裡每個外語首頁，全部 exact
 *   其他繁中頁：繁中（自己，href 是 canonical）exact；外語首頁不是 exact，homeOnly 用目標語系文案檔的 menu.homeOnly（缺就丟錯）
 *   not-found：[]（404 用多語提示代替語言選單）
 */
export function languageTargets({ pageType, canonical = '', plan, readHome = readHomeMessages }) {
  if (pageType === 'not-found') return []
  const codes = clusterCodes(plan)
  const previewOf = new Map((plan?.pages ?? []).map((p) => [p.code, p.preview]))
  const cluster = pageType === 'home' || pageType === 'site-home'
  const item = (code, href, exact) => {
    const l = getLocale(code)
    const t = { code, href, exact, autonym: l.autonym, htmlLang: l.htmlLang, hreflang: l.hreflang }
    if (previewOf.get(code)) t.preview = true
    return t
  }
  const out = [item('zh-tw', cluster ? siteHomeUrl('zh-tw') : canonical, true)]
  for (const code of sortLocaleCodes(codes)) {
    if (cluster) {
      out.push(item(code, siteHomeUrl(code), true))
      continue
    }
    const homeOnly = readHome(code)?.menu?.homeOnly
    if (typeof homeOnly !== 'string' || !homeOnly) throw new Error(`languageTargets：${FILE_ID}/${code}.json 沒有 menu.homeOnly（繁中頁語言選單的退路說明）`)
    out.push({ ...item(code, siteHomeUrl(code), false), homeOnly: formatShell(homeOnly, code) })
  }
  return out
}
