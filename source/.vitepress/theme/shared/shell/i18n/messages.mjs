// 多語訊息檔共用的檢查、蓋章與閘門純函式：工具的 src/i18n/messages/<page>/<code>.json、部落格的 i18n/home/<code>.json 都用。
// 從範本 templates/tool/scripts/i18n/{check,stamp,plan}.mjs 搬過來，參數從 config 改成明確的欄位（主站首頁規格 I.2）。
// 範本那三支改成薄包裝：從 config 取出欄位再呼叫這裡，對外的匯出名稱與訊息不變。
//
// 只有 Node 腳本能 import：用到 review.mjs（node:crypto）。client 程式不能 import（範本 J35 的原始碼掃描要列這支）。
//
// 訊息檔的形狀：{ $meta: { updatedAt, firstReviewedAt, factualKeys, review, rebases }, ...巢狀 key }；
// 葉是字串、字串陣列，或 { $plural: { one, other, … } }。審稿人的形狀：{ [code]: [{ id, native }] }（tool.config.mjs 的 reviewers、
// 部落格 site.config.mjs 的 home.reviewers）；外殼字串的登記表 reviewers.json 用 reviewersFromRegistry() 轉成同一個形狀。
import { SITE_NAME_EN } from '../site.mjs'
import { LOCALE, getLocale } from './locales.mjs'
import { pluralCategories } from './format.mjs'
import { placeholdersOf, SHELL_SOURCE } from './shell-strings.mjs'
import { checkScript } from './script-check.mjs'
import { hashOf, keyState, leafEntries } from './review.mjs'

export const PLURAL_FORMS = ['zero', 'one', 'two', 'few', 'many', 'other']
export const META_KEYS = ['updatedAt', 'firstReviewedAt', 'factualKeys', 'review', 'rebases']
export const MAX_WAIVER_DAYS = 30
/** 審稿人 id：小寫英數與連字號，不寫真名（0008 M.1 第 8 題） */
export const REVIEWER_ID = /^[a-z0-9][a-z0-9-]*$/
export const STAMP_REMINDER = '蓋章代表審稿人逐字看過這些字串。agent 不自己蓋章，只在審稿人當次明確指示時代為執行，--by 寫審稿人自己的 id。'
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** 今天的日期（UTC）：蓋章、豁免期限、plan 的 today 都用它，台灣早上 8 點前用本機日期會早一天 */
export const todayUtc = (now = new Date()) => now.toISOString().slice(0, 10)
/** YYYY-MM-DD 加 n 天 */
export const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10)

const isPluralLeaf = (v) => !!v && typeof v === 'object' && !Array.isArray(v) && '$plural' in v
const under = (key, prefix) => key === prefix || key.startsWith(`${prefix}.`)
/** 一個葉的所有字串（$plural 是每個形式） */
export const stringsOf = (v) => (isPluralLeaf(v) ? Object.values(v.$plural ?? {}) : [v]).filter((s) => typeof s === 'string')

// ── 審稿狀態 ────────────────────────────────────────────────────────────────

/**
 * 一個訊息檔逐 key 的狀態 { [key]: state }。source 是正本語系同一頁的檔案（code 是正本時不用）。
 * 正本沒有的 key，紀錄的 s 是 null，算 ok。
 */
export function fileKeyStates(file, source, code, sourceLocale) {
  if (!file) return {}
  const review = file.$meta?.review ?? {}
  const src = code === sourceLocale || !source ? new Map() : new Map(leafEntries(source))
  return Object.fromEntries(leafEntries(file).map(([key, value]) => [
    key, keyState(review[key], value, code === sourceLocale ? undefined : src.get(key)),
  ]))
}

// ── 檢查（範本 check.mjs 的 1 到 5） ─────────────────────────────────────────

/**
 * 1. key 對齊：葉 key 集合跟正本相同、沒有空字串、$plural 的形式等於該語系的複數類別。
 * rules 是依語系對齊的前綴：[{ prefix, keys: 完整 key 的陣列 }]（範本由 perLocaleKeys 算），前綴底下照 keys 對、不照正本
 */
export function keyProblems({ file, source, code, id, rules = [] }) {
  const out = []
  const where = `${id}/${code}.json`
  const ruled = (k) => rules.some((r) => under(k, r.prefix))
  const mine = leafEntries(file)
  const want = new Set([...leafEntries(source ?? file).map(([k]) => k).filter((k) => !ruled(k)), ...rules.flatMap((r) => r.keys)])
  const have = new Set(mine.map(([k]) => k))
  for (const k of want) if (!have.has(k)) out.push(`${where} 缺 key ${k}`)
  for (const k of have) if (!want.has(k)) out.push(`${where} 多了 key ${k}（正本沒有${ruled(k) ? '，也不在 perLocaleKeys 列的指標裡' : ''}）`)
  const cats = pluralCategories(code)
  for (const [k, v] of mine) {
    if (isPluralLeaf(v)) {
      const forms = Object.keys(v.$plural ?? {})
      const bad = forms.filter((f) => !PLURAL_FORMS.includes(f))
      if (bad.length) out.push(`${where} 的 ${k} 有不認得的複數形式 ${bad.join('、')}`)
      if (JSON.stringify([...forms].sort()) !== JSON.stringify([...cats].sort())) out.push(`${where} 的 ${k} 複數形式是 ${forms.join('、')}，${code} 要剛好是 ${cats.join('、')}`)
      for (const [f, s] of Object.entries(v.$plural ?? {})) if (typeof s !== 'string' || !s.trim()) out.push(`${where} 的 ${k}.$plural.${f} 是空的`)
    } else if (typeof v !== 'string') out.push(`${where} 的 ${k} 要是字串或 $plural（現在是 ${JSON.stringify(v)}）`)
    else if (!v.trim()) out.push(`${where} 的 ${k} 是空字串`)
  }
  return out
}

/** 2. 佔位符：每個字串的佔位符集合跟原文相同（$plural 用全部形式的聯集）；原文沒有的 key 跳過；source 是 null（正本自己）時不查 */
export function placeholderProblems({ file, source, code, id }) {
  if (!source) return []
  const out = []
  const src = new Map(leafEntries(source))
  const set = (v) => [...new Set(stringsOf(v).flatMap(placeholdersOf))].sort()
  for (const [k, v] of leafEntries(file)) {
    if (!src.has(k)) continue
    const a = set(v)
    const b = set(src.get(k))
    if (JSON.stringify(a) !== JSON.stringify(b)) out.push(`${id}/${code}.json 的 ${k} 佔位符是 {${a.join('}、{')}}，原文是 {${b.join('}、{')}}`)
  }
  return out
}

/**
 * glossary.json 對這個語系的禁語。形狀：
 * { terms: { <code>: { 概念: 固定譯法 } }, forbidden: [{ text, scope: 'title' | 'all', locales: '*' | [code], reason }] }
 * 回 [{ text, scope, reason }]
 */
export function forbiddenWords(glossary, code) {
  const list = Array.isArray(glossary?.forbidden) ? glossary.forbidden : []
  return list
    .filter((f) => typeof f?.text === 'string' && f.text && (f.locales === '*' || (Array.isArray(f.locales) && f.locales.includes(code))))
    .map((f) => ({ text: f.text, scope: f.scope === 'title' ? 'title' : 'all', reason: f.reason ?? '' }))
}

const LATIN = /\p{Script=Latin}/u

/**
 * 字串裡有沒有這個禁語：照原樣比對大小寫（德文的 Sie 與 sie 意思不同）；
 * 禁語開頭或結尾是拉丁字母時，那一側不能緊接別的拉丁字母（AI 不算到 MAIL 裡）。中日韓文直接找子字串
 */
export function hasForbidden(s, text) {
  let from = 0
  for (;;) {
    const i = s.indexOf(text, from)
    if (i < 0) return false
    const before = s.slice(0, i).at(-1) ?? ''
    const after = s[i + text.length] ?? ''
    const okBefore = !LATIN.test(text[0]) || !LATIN.test(before)
    const okAfter = !LATIN.test(text.at(-1)) || !LATIN.test(after)
    if (okBefore && okAfter) return true
    from = i + 1
  }
}

// 這幾條依登錄表判斷，不在這裡寫語系代碼：新增語系只要 locales.mjs 加一筆就照樣檢查
//   引號：登錄表的 quotes 沒有 ASCII 的 " 就不能用 "
//   中文的破折號類符號：script 是 Hant、Hans 的語系
//   倒問號、倒驚嘆號：西班牙文的正字法，看 htmlLang 的語言碼是 es（es-419 這類地區變體也算）
//   韓文助詞：看 htmlLang 的語言碼是 ko
const langOf = (code) => getLocale(code).htmlLang.split('-')[0].toLowerCase()
export const asciiQuoteBanned = (code) => !getLocale(code).quotes.includes('"')
export const isChineseScript = (code) => ['Hant', 'Hans'].includes(getLocale(code).script)
export const needsInvertedMarks = (code) => langOf(code) === 'es'
export const checksKoreanParticles = (code) => langOf(code) === 'ko'

// 會隨前一個字有沒有收尾音而變的助詞（가/이、는/은、를/을、와/과、로/으로）。不變的「의」不在這裡
export const KO_VARIABLE_PARTICLES = ['가', '는', '이', '은', '을', '를', '와', '과', '로', '으로']
const KO_PARTICLE_RE = new RegExp(`\\{(author|site)\\}(${[...KO_VARIABLE_PARTICLES].sort((a, b) => b.length - a.length).join('|')})`, 'gu')

/** 韓文：{author}、{site} 後面直接接會變形的助詞。站名、作者名改了，助詞就可能錯，所以一律不准。回 [{ placeholder, particle }] */
export function koreanParticleHits(s) {
  return [...String(s).matchAll(KO_PARTICLE_RE)].map((m) => ({ placeholder: m[1], particle: m[2] }))
}

/**
 * 3. 字串 lint：U+2014（中文另外 U+2015、U+2E3A）、登錄表 quotes 沒有 ASCII 引號的語系不用 "、西文的問句驚嘆句要有 ¿ ¡、
 * ko 的 {author}、{site} 後面不直接接會變形的助詞、glossary 禁語（scope 'title' 只查 titleKeys）
 */
export function lintProblems({ file, code, id, glossary, titleKeys = ['meta.title'] }) {
  const out = []
  const where = `${id}/${code}.json`
  const zh = isChineseScript(code)
  const bannedQuote = asciiQuoteBanned(code)
  const inverted = needsInvertedMarks(code)
  const ko = checksKoreanParticles(code)
  const words = forbiddenWords(glossary, code)
  for (const [k, v] of leafEntries(file)) {
    for (const s of stringsOf(v)) {
      if (s.includes('\u2014')) out.push(`${where} 的 ${k} 有破折號 U+2014`)
      if (zh && /[\u2015\u2E3A]/.test(s)) out.push(`${where} 的 ${k} 有 U+2015 或 U+2E3A（中文不用破折號）`)
      if (bannedQuote && s.includes('"')) out.push(`${where} 的 ${k} 用了 ASCII 引號 "，改用 ${getLocale(code).quotes.slice(0, 2).join('')}`)
      if (inverted) {
        const count = (re) => (s.match(re) ?? []).length
        if (count(/\?/g) > count(/¿/g)) out.push(`${where} 的 ${k} 的問句要有開頭的 ¿`)
        if (count(/!/g) > count(/¡/g)) out.push(`${where} 的 ${k} 的驚嘆句要有開頭的 ¡`)
      }
      if (ko) {
        for (const h of koreanParticleHits(s)) {
          out.push(`${where} 的 ${k} 在 {${h.placeholder}} 後面直接接助詞「${h.particle}」：助詞會隨收尾音變，改用「의」或把代入值放在名詞前`)
        }
      }
      for (const w of words) {
        if (w.scope === 'title' && !titleKeys.includes(k)) continue
        if (hasForbidden(s, w.text)) out.push(`${where} 的 ${k} 有禁語「${w.text}」（glossary.json${w.reason ? `：${w.reason}` : ''}）`)
      }
    }
  }
  return out
}

// 虛詞比對要有一定的樣本才有意義：「Characters (no spaces)」只有一個 no，會被誤判成西文。
// 短字串跳過 function-words 這條（script-check.mjs 說明呼叫端可以依 rule 過濾），整頁的檢查仍然照跑
export const FUNCTION_WORDS_MIN = 8
const wordCount = (s) => (String(s).match(/\p{L}+/gu) ?? []).length

/** 4. 書寫系統：每個字串值跑 checkScript（scope 'string'）；不到 FUNCTION_WORDS_MIN 個字的字串不看虛詞 */
export function scriptProblems({ file, code, id }) {
  const out = []
  for (const [k, v] of leafEntries(file)) {
    for (const s of stringsOf(v)) {
      for (const p of checkScript(code, s, { scope: 'string' })) {
        if (p.rule === 'function-words' && wordCount(s) < FUNCTION_WORDS_MIN) continue
        out.push(`${id}/${code}.json 的 ${k}：${p.detail}（${p.rule}）`)
      }
    }
  }
  return out
}

/** 5. 審稿紀錄與 $meta：by 在 reviewers[code]、母語規則、紀錄欄位、$meta 的欄位與日期格式、factualKeys 只寫在正本 */
export function reviewProblems({ file, code, id, reviewers, sourceLocale }) {
  const out = []
  const where = `${id}/${code}.json`
  const meta = file.$meta
  if (!meta || typeof meta !== 'object') return [`${where} 缺 $meta`]
  for (const k of Object.keys(meta)) if (!META_KEYS.includes(k)) out.push(`${where} 的 $meta 有不認得的欄位 ${k}`)
  for (const k of ['updatedAt', 'firstReviewedAt']) if (meta[k] != null && !DATE_RE.test(meta[k])) out.push(`${where} 的 $meta.${k} 要是 YYYY-MM-DD 或 null`)
  if (meta.factualKeys !== undefined && !Array.isArray(meta.factualKeys)) out.push(`${where} 的 $meta.factualKeys 要是陣列`)
  if (code !== sourceLocale && (meta.factualKeys ?? []).length) out.push(`${where}：factualKeys 只寫在正本 ${sourceLocale} 的檔案`)
  if (!Array.isArray(meta.rebases ?? [])) out.push(`${where} 的 $meta.rebases 要是陣列`)
  const list = reviewers?.[code] ?? []
  const required = getLocale(code).nativeReviewer === 'required'
  for (const [k, r] of Object.entries(meta.review ?? {})) {
    if (!r || typeof r.by !== 'string' || !DATE_RE.test(r.at ?? '') || typeof r.c !== 'string' || !(r.s === null || typeof r.s === 'string')) {
      out.push(`${where} 的審稿紀錄 ${k} 格式不對（要有 by、at、s、c）`)
      continue
    }
    const who = list.find((x) => x.id === r.by)
    if (!who) out.push(`${where} 的 ${k} 是 ${r.by} 蓋的章，但 ${r.by} 不在 reviewers['${code}']`)
    else if (required && !who.native) out.push(`${where}：${code} 要母語審稿人，${k} 是 ${r.by}（native: false）蓋的章`)
  }
  return out
}

// ── 蓋章與 rebase（範本 stamp.mjs） ─────────────────────────────────────────

/**
 * 誰能蓋這個語系的章：要列在 reviewers[code]；母語規則預設看登錄表 nativeReviewer 是不是 'required'。
 * label 是錯誤訊息裡登記處的名稱（範本傳 'tool.config.mjs 的 reviewers'）。可以蓋回 null，不行回原因
 */
export function reviewerProblem({ reviewers, nativeRequired, label = 'reviewers' }, code, by) {
  const who = (reviewers?.[code] ?? []).find((r) => r.id === by)
  if (!who) return `${by} 不在 ${label}['${code}']`
  const required = nativeRequired ?? getLocale(code).nativeReviewer === 'required'
  if (required && !who.native) return `${code} 要母語審稿人，${by} 是 native: false`
  return null
}

/** $meta 放最前面，其餘照原本的順序 */
const withMeta = (file, meta) => {
  const { $meta, ...rest } = file
  return { $meta: { updatedAt: null, firstReviewedAt: null, review: {}, rebases: [], ...$meta, ...meta }, ...rest }
}

/**
 * 蓋章：對指定（或全部）key 寫入目前的 c、s、by、at；所有 key 都 ok、還沒有 firstReviewedAt 時寫入它；updated 時寫 updatedAt。
 * 回新的檔案物件（不改原物件）。蓋不了的人、不認得的 key 丟錯
 */
export function stampFile(file, source, { code, by, at, keys = null, updated = false, reviewers, sourceLocale, label }) {
  const problem = reviewerProblem({ reviewers, label }, code, by)
  if (problem) throw new Error(problem)
  const isSource = code === sourceLocale
  const current = new Map(leafEntries(file))
  const src = isSource || !source ? new Map() : new Map(leafEntries(source))
  const targets = keys ?? [...current.keys()]
  const unknown = targets.filter((k) => !current.has(k))
  if (unknown.length) throw new Error(`沒有這些 key：${unknown.join('、')}`)
  // 檔案裡已經沒有的 key，舊紀錄一起清掉
  const review = Object.fromEntries(Object.entries(file.$meta?.review ?? {}).filter(([k]) => current.has(k)))
  for (const k of targets) {
    review[k] = { by, at, s: isSource || !src.has(k) ? null : hashOf(src.get(k)), c: hashOf(current.get(k)) }
  }
  let next = withMeta(file, { review })
  const states = Object.values(fileKeyStates(next, source, code, sourceLocale))
  const meta = {}
  if (!next.$meta.firstReviewedAt && states.length && states.every((s) => s === 'ok')) meta.firstReviewedAt = at
  if (updated) meta.updatedAt = at
  if (Object.keys(meta).length) next = withMeta(next, meta)
  return next
}

/**
 * rebase：正本的審稿人宣告「這次原文改動不影響意思」，把其他語系這個 key 的 s 換成新原文的雜湊（只換 c 仍相符的紀錄），
 * 每個改到的檔案在 $meta.rebases 留一筆 { key, by, at, reason }。files：Map<code, 檔案物件>（含正本也會略過）。
 * 回 Map<code, 新的檔案物件>，只含有改到的語系
 */
export function rebaseFiles(files, source, { key, by, at, reason, reviewers, sourceLocale, label }) {
  const problem = reviewerProblem({ reviewers, label }, sourceLocale, by)
  if (problem) throw new Error(`rebase 要由正本 ${sourceLocale} 的審稿人宣告：${problem}`)
  if (!reason) throw new Error('rebase 要寫 --reason（改了什麼、為什麼不影響意思）')
  const src = new Map(leafEntries(source))
  if (!src.has(key)) throw new Error(`正本沒有 key ${key}`)
  const out = new Map()
  for (const [code, file] of files) {
    if (code === sourceLocale) continue
    const rec = file.$meta?.review?.[key]
    const value = new Map(leafEntries(file)).get(key)
    // 譯文改過的不 rebase；已經對到新原文的（重跑 rebase）沒有要改的，也不多記一筆
    if (!rec || value === undefined || rec.c !== hashOf(value) || rec.s === hashOf(src.get(key))) continue
    const review = { ...file.$meta.review, [key]: { ...rec, s: hashOf(src.get(key)) } }
    const rebases = [...(file.$meta.rebases ?? []), { key, by, at, reason }]
    out.set(code, withMeta(file, { review, rebases }))
  }
  return out
}

// ── 閘門（範本 plan.mjs） ───────────────────────────────────────────────────

/** factualKeys 的前綴比對：'sections.privacy' 涵蓋 'sections.privacy.body.0' */
export const isFactual = (key, prefixes = []) => prefixes.some((p) => key === p || key.startsWith(`${p}.`))

/**
 * 這個 key 有沒有未過期的豁免：until 不早於今天、不晚於今天加 MAX_WAIVER_DAYS 天。
 * waivers：[{ page, locale, keys, until }]（範本的 i18nWaivers；page 是訊息檔的 id）
 */
export function isWaived(waivers, id, code, key, today) {
  return (waivers ?? []).some((w) => w.page === id && w.locale === code && isFactual(key, w.keys)
    && w.until >= today && w.until <= addDays(today, MAX_WAIVER_DAYS))
}

/**
 * 事實性文字：正本 $meta.factualKeys 底下的 key 變 outdated，要有 rebase（rebase 後就回到 ok）或未過期的豁免。
 *   files：要查的訊息檔 [{ id, code, ...其他欄位 }]，照這個順序出訊息（同一個檔案列兩次就出兩次，不去重）
 *   states(id, code, file)：那個檔案逐 key 的狀態（fileKeyStates 的結果）；第三個參數是 files 的那一筆，
 *     呼叫端可以在 files 裡多帶欄位（範本帶 plan 的那一列狀態）
 *   sourceOf(id)：正本語系那個檔案的內容
 *   waivers：isWaived 的豁免清單；waiverLabel 是訊息裡豁免清單的名稱
 * 回錯誤訊息陣列
 */
export function factualGate({ files, states, sourceOf, waivers = [], today, waiverLabel = 'i18nWaivers' }) {
  const out = []
  for (const f of files ?? []) {
    const { id, code } = f
    const factual = sourceOf(id)?.$meta?.factualKeys ?? []
    for (const [key, s] of Object.entries(states(id, code, f) ?? {})) {
      if (s === 'outdated' && isFactual(key, factual) && !isWaived(waivers, id, code, key, today)) {
        out.push(`${id} × ${code} 的事實性文字 ${key} 原文已改：請審稿人重審蓋章、正本審稿人 rebase，或寫有期限的 ${waiverLabel}`)
      }
    }
  }
  return out
}

/** 站名：這個語系用英文站名（登錄表 brand 'en'）而 SITE_NAME_EN 還是空字串時回原因（P3 前不能上線），否則 null */
export function siteNameProblem(code, siteNameEn = SITE_NAME_EN) {
  return getLocale(code).brand === 'en' && !siteNameEn
    ? `${code} 用英文站名，但 site.mjs 的 SITE_NAME_EN 還是空字串（P3 前不能上線）`
    : null
}

// ── 外殼字串的審稿人登記表（reviewers.json） ────────────────────────────────

/**
 * reviewers.json 的格式問題：{ $comment?, reviewers: { <id>: { <code>: { native: boolean } } } }。
 * id 符合 REVIEWER_ID、語系在登錄表、native 是布林、沒有別的欄位。回錯誤訊息陣列
 */
export function registryProblems(registry) {
  const out = []
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) return ['reviewers.json 要是物件']
  for (const k of Object.keys(registry)) if (!['$comment', 'reviewers'].includes(k)) out.push(`reviewers.json 有不認得的欄位 ${k}`)
  const people = registry.reviewers
  if (!people || typeof people !== 'object' || Array.isArray(people)) return [...out, 'reviewers.json 的 reviewers 要是物件']
  for (const [id, langs] of Object.entries(people)) {
    if (!REVIEWER_ID.test(id)) out.push(`reviewers.json 的 id ${id} 要是小寫英數與連字號（不寫真名）`)
    if (!langs || typeof langs !== 'object' || Array.isArray(langs) || !Object.keys(langs).length) {
      out.push(`reviewers.json 的 ${id} 要是 { <語系>: { native } }，至少一個語系`)
      continue
    }
    for (const [code, v] of Object.entries(langs)) {
      if (!LOCALE[code]) out.push(`reviewers.json 的 ${id} 有登錄表以外的語系 ${code}`)
      if (!v || typeof v !== 'object' || typeof v.native !== 'boolean') out.push(`reviewers.json 的 ${id}.${code} 要是 { native: true | false }`)
      else for (const f of Object.keys(v)) if (f !== 'native') out.push(`reviewers.json 的 ${id}.${code} 有不認得的欄位 ${f}`)
    }
  }
  return out
}

/** reviewers.json 轉成 { [code]: [{ id, native }] }（跟 tool.config.mjs 的 reviewers 同形狀），語系照登錄表排序 */
export function reviewersFromRegistry(registry) {
  const out = {}
  for (const [id, langs] of Object.entries(registry?.reviewers ?? {})) {
    for (const [code, v] of Object.entries(langs ?? {})) (out[code] ??= []).push({ id, native: v?.native === true })
  }
  return Object.fromEntries(Object.keys(LOCALE).filter((c) => out[c]).map((c) => [c, out[c]]))
}

/**
 * shell-review.json 每一筆紀錄的 by 都登記在 reviewers.json 的那個語系，nativeReviewer 'required' 的語系要 native: true；
 * rebases 的 by 要是正本（SHELL_SOURCE）的審稿人。回 [{ code, key, problem }]（I.3 的不變量與 build.mjs --check 用）
 */
export function shellReviewerProblems(review, registry) {
  const reviewers = reviewersFromRegistry(registry)
  const out = []
  for (const [code, records] of Object.entries(review?.review ?? {})) {
    if (!LOCALE[code]) continue // 登錄表以外的語系由 review.mjs 的 shellReviewProblems 報
    for (const [key, r] of Object.entries(records ?? {})) {
      const problem = reviewerProblem({ reviewers, label: 'reviewers.json' }, code, r?.by)
      if (problem) out.push({ code, key, problem })
    }
  }
  for (const [i, r] of (review?.rebases ?? []).entries()) {
    const problem = reviewerProblem({ reviewers, nativeRequired: false, label: 'reviewers.json' }, SHELL_SOURCE, r?.by)
    if (problem) out.push({ code: null, key: r?.key ?? null, problem: `rebases[${i}] 要由正本 ${SHELL_SOURCE} 的審稿人宣告：${problem}` })
  }
  return out
}

/**
 * 同一個 id 在別處（部落格 home.reviewers、工具 reviewers）也登記了同一個語系時，native 要跟 reviewers.json 相同（I.4）。
 * local：{ [code]: [{ id, native }] }；where 是訊息裡別處的名稱。回錯誤訊息陣列
 */
export function reviewerConflicts(local, registry, where = 'reviewers') {
  const shared = reviewersFromRegistry(registry)
  const out = []
  for (const [code, list] of Object.entries(local ?? {})) {
    for (const r of list ?? []) {
      const other = (shared[code] ?? []).find((x) => x.id === r?.id)
      if (other && other.native !== (r.native === true)) {
        out.push(`${where}['${code}'] 的 ${r.id} 是 native: ${r.native === true}，reviewers.json 是 native: ${other.native}，兩處要相同`)
      }
    }
  }
  return out
}
