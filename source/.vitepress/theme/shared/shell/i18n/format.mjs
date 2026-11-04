// 日期、數字、複數的格式化。日期只在建置時呼叫，結果當字串交給元件：SSR 和 hydration 兩邊的 ICU 可能不同，
// 讓元件只顯示字串才不會不一致。程式一律明寫 timeZone，不依賴 process.env.TZ。
import { getLocale } from './locales.mjs'

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/

/** 'YYYY-MM-DD' 驗證並拆成 UTC 毫秒；不是合法日期就丟錯 */
function parseIsoDate(isoDate) {
  const m = ISO_DATE.exec(String(isoDate))
  if (!m) throw new Error(`日期要是 YYYY-MM-DD：${isoDate}`)
  const [y, mo, d] = m.slice(1).map(Number)
  const t = Date.UTC(y, mo - 1, d)
  const back = new Date(t)
  if (back.getUTCFullYear() !== y || back.getUTCMonth() !== mo - 1 || back.getUTCDate() !== d) throw new Error(`不存在的日期：${isoDate}`)
  return t
}

/** 署名列日期：dateStyle 'iso' 原樣輸出 YYYY-MM-DD；'medium' 用 Intl 的 medium，固定 timeZone: 'UTC' */
export function formatDate(isoDate, code) {
  const l = getLocale(code)
  const t = parseIsoDate(isoDate)
  if (l.dateStyle === 'iso') return isoDate
  if (l.dateStyle === 'medium') return new Intl.DateTimeFormat(l.intl, { dateStyle: 'medium', timeZone: 'UTC' }).format(t)
  throw new Error(`未知的 dateStyle：${code} = ${l.dateStyle}`)
}

/** 數字：Intl.NumberFormat(intl, opts)。es-ES 的四位數不分組（1234），五位數起才分（12.345） */
export function formatNumber(n, code, opts = {}) {
  return new Intl.NumberFormat(getLocale(code).intl, opts).format(n)
}

// 全形標點（CJK 符號與標點、全形 ASCII 變體）開頭的附註本身就帶間距，前面不再加半形空白：
// 「繁體中文（工具首頁）」「日本語（ツールのトップ）」對「English (tool home page)」「Deutsch (Startseite des Tools)」
const FULLWIDTH_START = /^[\u3000-\u303F\uFF00-\uFF60\uFFE0-\uFFEF]/
/** 名稱與括號附註之間的間隔：附註以全形標點開頭時是 ''，否則是一個半形空白；沒有附註是 '' */
export const noteSeparator = (note) => (!note || FULLWIDTH_START.test(note) ? '' : ' ')
/** 名稱接附註（語言選單的退路說明、404 的繁中提示共用） */
export const withNote = (label, note) => (note ? `${label}${noteSeparator(note)}${note}` : label)

const CATEGORY_ORDER = ['zero', 'one', 'two', 'few', 'many', 'other']
/** 這個語系的複數類別，照 zero、one、two、few、many、other 排序（ICU 版本不同時回傳順序可能不同，排序後才好比對） */
export function pluralCategories(code) {
  const cats = new Intl.PluralRules(getLocale(code).intl).resolvedOptions().pluralCategories
  return [...cats].sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))
}
