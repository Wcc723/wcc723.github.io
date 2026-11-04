// 書寫系統檢查：抓「日文頁其實是中文」「德文頁其實是英文」「繁中頁混進簡體字」這類錯誤。
// 範本的 audit（J15）對整頁 <main> 的文字用 scope 'page'；prebuild（I.3）對每個字串值用 scope 'string'，
// 只跑不受長度影響的規則（短字串的假名比例、字數門檻沒有意義）。
// 只用標準 JavaScript，規則依登錄表的 script 分組，新語系用既有的書寫系統就不必改這裡。
import { getLocale } from './locales.mjs'
import { HANS_ONLY, HANT_ONLY } from './script-chars.mjs'

const LETTER = /\p{L}/u
const HAN = /\p{Script=Han}/u
const KANA = /[\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}]/u
const HANGUL = /\p{Script=Hangul}/u
const LATIN = /\p{Script=Latin}/u

/** 字母統計：只數 \p{L}（數字、符號、標點不算）。長音「ー」這類共用字元依 Script_Extensions 算進假名 */
export function scriptStats(text) {
  const s = { latin: 0, han: 0, kana: 0, hangul: 0, otherLetters: 0, letters: 0 }
  for (const ch of String(text)) {
    if (!LETTER.test(ch)) continue
    s.letters++
    if (HAN.test(ch)) s.han++
    else if (KANA.test(ch)) s.kana++
    else if (HANGUL.test(ch)) s.hangul++
    else if (LATIN.test(ch)) s.latin++
    else s.otherLetters++
  }
  return s
}

// 三種 Latin 語言各 30 個常見虛詞，用來抓「本頁語言跟文字對不上」。刻意避開跨語言同形的字：
// en 不放 a、in、an、as；de 不放 es、in、an、so、was；es 不放 a。三張表彼此沒有重複的字（測試會驗）。
export const FUNCTION_WORDS = {
  en: ['the', 'and', 'of', 'to', 'is', 'it', 'you', 'that', 'for', 'on', 'with', 'are', 'this', 'be', 'or',
    'your', 'by', 'from', 'at', 'not', 'can', 'have', 'will', 'all', 'more', 'if', 'what', 'which', 'they', 'how'],
  de: ['der', 'die', 'das', 'und', 'ist', 'nicht', 'mit', 'den', 'von', 'zu', 'ein', 'eine', 'auf', 'für', 'sich',
    'dem', 'des', 'auch', 'im', 'sie', 'wird', 'bei', 'oder', 'wie', 'nur', 'aus', 'du', 'dein', 'kann', 'wenn'],
  es: ['el', 'la', 'los', 'las', 'de', 'que', 'y', 'en', 'un', 'una', 'es', 'por', 'con', 'para', 'del',
    'se', 'no', 'al', 'lo', 'su', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'este', 'tu', 'sin'],
}

/** 每種語言的虛詞命中數（同一個字出現幾次算幾次） */
export function functionWordHits(text) {
  const words = String(text).toLowerCase().match(/\p{L}+/gu) ?? []
  return Object.fromEntries(Object.entries(FUNCTION_WORDS).map(([lang, list]) => {
    const set = new Set(list)
    return [lang, words.filter((w) => set.has(w)).length]
  }))
}

const countIn = (text, table) => [...new Set([...String(text)].filter((ch) => table.includes(ch)))]
const ratio = (a, b) => (b === 0 ? 1 : a / b)
const fmt = (n) => Math.round(n * 1000) / 1000

/**
 * 檢查文字符不符合這個語系的書寫系統，回 [{ rule, detail }]，空陣列代表通過。
 * 佔位符 {name} 先拿掉再算。呼叫端可以依 rule 過濾掉已豁免的規則。
 *   opts.scope：'page'（預設，整頁 <main> 的文字）或 'string'（單一字串：不跑假名比例、假名字數、諺文比例這三條受長度影響的規則）
 *
 * 規則（rule 值）：
 *   Jpan  kana-ratio（假名 ÷（假名加漢字）至少 0.2，page）、kana-min（假名至少 10 個，page）、no-hangul
 *   Kore  hangul-ratio（諺文 ÷（諺文加漢字加假名）至少 0.9，page）、no-kana
 *   Hant  hans-only-chars、no-kana、no-hangul
 *   Hans  hant-only-chars、no-kana、no-hangul
 *   Latn  no-cjk、latin-ratio（Latin 佔字母至少 0.95）、function-words（本頁語言的虛詞命中數要最高）
 */
export function checkScript(code, text, opts = {}) {
  const { scope = 'page' } = opts
  if (scope !== 'page' && scope !== 'string') throw new Error(`未知的 scope：${scope}`)
  const page = scope === 'page'
  const l = getLocale(code)
  const clean = String(text).replace(/\{[a-zA-Z_][\w.]*\}/g, ' ')
  const s = scriptStats(clean)
  const out = []
  const fail = (rule, detail) => out.push({ rule, detail })

  if (l.script === 'Jpan') {
    const r = ratio(s.kana, s.kana + s.han)
    if (page && s.kana + s.han > 0 && r < 0.2) fail('kana-ratio', `假名比例 ${fmt(r)}，至少要 0.2（假名 ${s.kana}、漢字 ${s.han}）`)
    if (page && s.kana < 10) fail('kana-min', `假名只有 ${s.kana} 個，至少要 10 個`)
    if (s.hangul) fail('no-hangul', `日文不該有諺文（${s.hangul} 個）`)
  } else if (l.script === 'Kore') {
    const r = ratio(s.hangul, s.hangul + s.han + s.kana)
    if (page && r < 0.9) fail('hangul-ratio', `諺文比例 ${fmt(r)}，至少要 0.9（諺文 ${s.hangul}、漢字 ${s.han}、假名 ${s.kana}）`)
    if (s.kana) fail('no-kana', `韓文不該有假名（${s.kana} 個）`)
  } else if (l.script === 'Hant' || l.script === 'Hans') {
    const [rule, table, label] = l.script === 'Hant' ? ['hans-only-chars', HANS_ONLY, '簡體字'] : ['hant-only-chars', HANT_ONLY, '繁體字']
    const hits = countIn(clean, table)
    if (hits.length) fail(rule, `出現${label}：${hits.join('')}`)
    if (s.kana) fail('no-kana', `中文不該有假名（${s.kana} 個）`)
    if (s.hangul) fail('no-hangul', `中文不該有諺文（${s.hangul} 個）`)
  } else if (l.script === 'Latn') {
    const cjk = s.han + s.kana + s.hangul
    if (cjk) fail('no-cjk', `不該有漢字、假名、諺文（${cjk} 個）`)
    const r = ratio(s.latin, s.letters)
    if (s.letters && r < 0.95) fail('latin-ratio', `Latin 比例 ${fmt(r)}，至少要 0.95`)
    if (FUNCTION_WORDS[code]) {
      const hits = functionWordHits(clean)
      const own = hits[code]
      const [rival, rivalHits] = Object.entries(hits).filter(([k]) => k !== code).sort((a, b) => b[1] - a[1])[0]
      if (rivalHits > 0 && rivalHits >= own) fail('function-words', `${code} 的虛詞 ${own} 個，${rival} 的 ${rivalHits} 個，文字可能不是 ${code}`)
    }
  } else {
    throw new Error(`checkScript 還不支援書寫系統 ${l.script}（語系 ${code}）`)
  }
  return out
}
