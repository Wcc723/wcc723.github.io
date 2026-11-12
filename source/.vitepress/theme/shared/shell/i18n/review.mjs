// 審稿狀態：逐 key 記雜湊，狀態不存在檔案裡，一律由 keyState() 從雜湊算出來。
// 只給 Node 腳本用（node:crypto）：同步到工具與部落格之後，client 程式不能 import 這個檔（範本的 J35 會掃）。
//
// 一筆紀錄 { by, at, s, c }：by 是審稿人 id（不寫真名），at 是 YYYY-MM-DD，
// c 是審稿當時譯文的雜湊，s 是審稿當時原文（正本語系同一個 key）的雜湊；正本自己的紀錄、原文沒有這個 key 的，s 是 null。
//   ok          有紀錄，c 等於目前譯文的雜湊，s 等於目前原文的雜湊（或 s 是 null）
//   outdated    c 相符，s 不符：審稿之後原文改了。照舊顯示、只警告
//   unreviewed  沒有紀錄，或 c 不符（譯文改過但沒重新蓋章）
import { createHash } from 'node:crypto'
import { SHELL_KEYS, SHELL_SOURCE, SHELL_STRINGS, shellKeysAnySource, shellKeysFor } from './shell-strings.mjs'

export const STATES = ['ok', 'outdated', 'unreviewed']

/** key 排序後 stringify（陣列保留順序）；undefined 的屬性略過，跟 JSON.stringify 一致 */
export function canonicalJson(value) {
  if (value === undefined) throw new Error('canonicalJson 不收 undefined')
  const norm = (v) => {
    if (Array.isArray(v)) return v.map((x) => (x === undefined ? null : norm(x)))
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.keys(v).sort().filter((k) => v[k] !== undefined).map((k) => [k, norm(v[k])]))
    }
    return v
  }
  return JSON.stringify(norm(value))
}

/** sha256(canonicalJson(value)) 的前 12 碼 */
export const hashOf = (value) => createHash('sha256').update(canonicalJson(value)).digest('hex').slice(0, 12)

const isPlural = (v) => v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 1 && v.$plural && typeof v.$plural === 'object'

/**
 * 葉節點 [[key, value], …]：字串葉用點號串起來，陣列用索引（'sections.how.body.0'）；
 * { $plural: {…} } 整個算一個葉；最上層的 $meta 略過。key 本身不能含點號。
 */
export function leafEntries(obj) {
  const out = []
  const walk = (v, path) => {
    if (isPlural(v) || v === null || typeof v !== 'object') { out.push([path, v]); return }
    const entries = Array.isArray(v) ? v.map((x, i) => [String(i), x]) : Object.entries(v)
    for (const [k, x] of entries) {
      if (k.includes('.')) throw new Error(`訊息 key 不能含點號：${path ? `${path}.` : ''}${k}`)
      if (!path && k === '$meta') continue
      walk(x, path ? `${path}.${k}` : k)
    }
  }
  walk(obj, '')
  return out
}

/** 葉 key 清單，例如 'meta.title'、'sections.how.body.0' */
export const leafKeys = (obj) => leafEntries(obj).map(([k]) => k)

/** 單一 key 的狀態：'ok' | 'outdated' | 'unreviewed' */
export function keyState(record, currentValue, sourceValue) {
  if (!record || currentValue === undefined) return 'unreviewed'
  if (record.c !== hashOf(currentValue) || record.s === undefined) return 'unreviewed' // 少了 s 欄位的紀錄不算數
  if (record.s === null) return 'ok'
  if (sourceValue !== undefined && record.s === hashOf(sourceValue)) return 'ok'
  return 'outdated'
}

/** 最差的狀態：unreviewed > outdated > ok；空陣列回 'ok' */
export function worstState(states) {
  let worst = 0
  for (const s of states) {
    const i = STATES.indexOf(s)
    if (i < 0) throw new Error(`未知的審稿狀態：${s}`)
    worst = Math.max(worst, i)
  }
  return STATES[worst]
}

// ── 外殼字串（shell-review.json）────────────────────────────────────────────
// 形狀：{ $comment, review: { [code]: { [key]: { by, at, s, c } } }, rebases: [{ key, by, at, reason }] }

/** 一筆外殼字串審稿紀錄：目前的 c 與 s（正本語系 s 是 null） */
export function shellRecord(code, key, { by, at }) {
  const value = SHELL_STRINGS[code]?.[key]
  if (value === undefined) throw new Error(`外殼字串沒有 ${code}.${key}`)
  const source = SHELL_STRINGS[SHELL_SOURCE][key]
  return { by, at, s: code === SHELL_SOURCE || source === undefined ? null : hashOf(source), c: hashOf(value) }
}

const statesOf = (code, review, keys) => {
  const records = review?.review?.[code] ?? {}
  return Object.fromEntries(keys.map((key) => [
    key, keyState(records[key], SHELL_STRINGS[code]?.[key], code === SHELL_SOURCE ? undefined : SHELL_STRINGS[SHELL_SOURCE][key]),
  ]))
}

/**
 * 這個語系每個可用外殼 key 的狀態 { [key]: state }；review 是 shell-review.json 的內容。
 * ctx 是 shell-strings.mjs 的 { sourceLocale }：正本是 en 的工具傳 { sourceLocale: 'en' }，才會多算 footer.translatedFromEn 這類 key；
 * 沒給（部落格、全站首頁、site-invariants、還沒接線的工具）跟以前完全相同
 */
export const shellKeyStates = (code, review, ctx = {}) => statesOf(code, review, shellKeysFor(code, ctx))

/** 這個語系外殼字串的最差狀態，範本算「頁 × 語系」狀態時用；ctx 同 shellKeyStates */
export const shellState = (code, review, ctx = {}) => worstState(Object.values(shellKeyStates(code, review, ctx)))

/**
 * shell-review.json 的問題清單（workspace 的測試與 build.mjs --check 用），回 [{ code, key, problem }]：
 *   有紀錄卻是 unreviewed（譯文或正本改了但沒重新蓋章）、紀錄欄位不合格式、紀錄指向不存在的語系或 key。
 * 沒有紀錄的 key 是 unreviewed，不算問題：那是還沒審，由工具端依 stage 決定產不產生。
 */
export function shellReviewProblems(review, { locales = Object.keys(SHELL_STRINGS) } = {}) {
  const problems = []
  if (!review || typeof review !== 'object' || typeof review.review !== 'object' || !Array.isArray(review.rebases)) {
    return [{ code: null, key: null, problem: 'shell-review.json 要有 review 物件與 rebases 陣列' }]
  }
  for (const [code, records] of Object.entries(review.review)) {
    if (!locales.includes(code)) { problems.push({ code, key: null, problem: '不認得的語系' }); continue }
    // 任何一種 sourceLocale 會用到的 key 都查：footer.translatedFromEn 這類只給 en 正本工具的 key，蓋過章之後改了也要擋
    const states = statesOf(code, review, shellKeysAnySource(code))
    for (const [key, r] of Object.entries(records ?? {})) {
      if (!(key in SHELL_KEYS) || SHELL_STRINGS[code]?.[key] === undefined) { problems.push({ code, key, problem: '紀錄指向不存在的 key' }); continue }
      if (!r || typeof r.by !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(r.by)) problems.push({ code, key, problem: 'by 要是審稿人 id（小寫英數與連字號）' })
      if (!r || !/^\d{4}-\d{2}-\d{2}$/.test(r.at ?? '')) problems.push({ code, key, problem: 'at 要是 YYYY-MM-DD' })
      if (!r || !/^[0-9a-f]{12}$/.test(r.c ?? '')) problems.push({ code, key, problem: 'c 要是 12 碼雜湊' })
      if (!r || !(r.s === null || /^[0-9a-f]{12}$/.test(r.s ?? ''))) problems.push({ code, key, problem: 's 要是 12 碼雜湊或 null' })
      if (key in states && states[key] === 'unreviewed') problems.push({ code, key, problem: '有審稿紀錄但字串已改，要重新蓋章（或正本修錯字時用 --rebase-shell）' })
    }
  }
  for (const [i, r] of review.rebases.entries()) {
    if (!r || !(r.key in SHELL_KEYS) || typeof r.by !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.at ?? '') || !r.reason) {
      problems.push({ code: null, key: r?.key ?? null, problem: `rebases[${i}] 要有 key、by、at、reason` })
    }
  }
  return problems
}
