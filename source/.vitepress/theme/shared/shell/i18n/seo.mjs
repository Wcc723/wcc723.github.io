// head 用的純函式：hreflang、og:locale、站名與作者名、title 站名尾巴、長度量測、跳脫。
// 只用標準 JavaScript，Node、Vite、VitePress 都能 import；client 端用也沒問題（沒有 node: 模組）。
import { SITE_NAME, SITE_NAME_EN, SITE_URL, AUTHOR_NAME, AUTHOR_NAME_EN } from '../site.mjs'
import { byLocaleOrder, getLocale } from './locales.mjs'

// SITE_NAME_EN 還是空字串（P3 之前）時，brand 'en' 的語系退回網域。由 SITE_URL 算出，不寫死。
// 只允許出現在 skeleton 與 preview；live 由範本的 audit（J30）擋，audit 用這個常數找退回值。
export const SITE_NAME_FALLBACK = new URL(SITE_URL).hostname.replace(/^www\./, '')

/** 站名：brand 'zh' 用 SITE_NAME，其他用 SITE_NAME_EN；SITE_NAME_EN 為空時退回網域 */
export function siteName(code, { nameEn = SITE_NAME_EN } = {}) {
  return getLocale(code).brand === 'zh' ? SITE_NAME : (nameEn || SITE_NAME_FALLBACK)
}

/** 作者名：brand 'zh' 用 AUTHOR_NAME，其他用 AUTHOR_NAME_EN */
export function authorName(code) {
  return getLocale(code).brand === 'zh' ? AUTHOR_NAME : AUTHOR_NAME_EN
}

/** title 加站名尾巴：brand 'zh' 的語系一律加；其他語系只在 withBrand 為 true 時加（首頁、關於這類 brandInTitle 的頁） */
export function titleWithBrand(title, code, withBrand = false) {
  const l = getLocale(code)
  if (l.brand !== 'zh' && !withBrand) return title
  return `${title}${l.titleSeparator}${siteName(code)}`
}

// East Asian Width 是 F 或 W 的範圍（Unicode 15 的 EastAsianWidth.txt 摘要：CJK、假名、諺文、全形符號、
// 常見的寬版 emoji、補充表意文字平面）。不在表上的一律算 1，包含 A（模稜兩可）類，例如「·」。
const WIDE_RANGES = [
  [0x1100, 0x115F], [0x231A, 0x231B], [0x2329, 0x232A], [0x23E9, 0x23EC], [0x23F0, 0x23F0], [0x23F3, 0x23F3],
  [0x25FD, 0x25FE], [0x2614, 0x2615], [0x2648, 0x2653], [0x267F, 0x267F], [0x2693, 0x2693], [0x26A1, 0x26A1],
  [0x26AA, 0x26AB], [0x26BD, 0x26BE], [0x26C4, 0x26C5], [0x26CE, 0x26CE], [0x26D4, 0x26D4], [0x26EA, 0x26EA],
  [0x26F2, 0x26F3], [0x26F5, 0x26F5], [0x26FA, 0x26FA], [0x26FD, 0x26FD], [0x2705, 0x2705], [0x270A, 0x270B],
  [0x2728, 0x2728], [0x274C, 0x274C], [0x274E, 0x274E], [0x2753, 0x2755], [0x2757, 0x2757], [0x2795, 0x2797],
  [0x27B0, 0x27B0], [0x27BF, 0x27BF], [0x2B1B, 0x2B1C], [0x2B50, 0x2B50], [0x2B55, 0x2B55],
  [0x2E80, 0x303E], [0x3041, 0x33FF], [0x3400, 0x4DBF], [0x4E00, 0x9FFF], [0xA000, 0xA4CF], [0xA960, 0xA97F],
  [0xAC00, 0xD7A3], [0xF900, 0xFAFF], [0xFE10, 0xFE19], [0xFE30, 0xFE6F], [0xFF00, 0xFF60], [0xFFE0, 0xFFE6],
  [0x16FE0, 0x16FE4], [0x17000, 0x18CFF], [0x1AFF0, 0x1B2FF], [0x1F004, 0x1F004], [0x1F0CF, 0x1F0CF],
  [0x1F18E, 0x1F18E], [0x1F191, 0x1F19A], [0x1F200, 0x1F251], [0x1F260, 0x1F265], [0x1F300, 0x1F64F],
  [0x1F680, 0x1F6FF], [0x1F7E0, 0x1F7EB], [0x1F90C, 0x1F9FF], [0x1FA70, 0x1FAFF], [0x20000, 0x2FFFD], [0x30000, 0x3FFFD],
]
const isWide = (cp) => {
  let lo = 0
  let hi = WIDE_RANGES.length - 1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    const [a, b] = WIDE_RANGES[mid]
    if (cp < a) hi = mid - 1
    else if (cp > b) lo = mid + 1
    else return true
  }
  return false
}

/** 顯示寬度：East Asian Width 為 F、W 的字算 2，其他算 1；以碼位計，astral 字元算一個字 */
export function textWidth(str) {
  let n = 0
  for (const ch of String(str)) n += isWide(ch.codePointAt(0)) ? 2 : 1
  return n
}

/** 依登錄表的 titleBudget、descBudget 單位量長度：'width' 用 textWidth，'chars' 用碼位數 */
export function measure(str, unit) {
  if (unit === 'width') return textWidth(str)
  if (unit === 'chars') return [...String(str)].length
  throw new Error(`未知的長度單位：${unit}`)
}

const ATTR = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
/** 屬性值跳脫：& < > " 全部換掉 */
export const escapeAttr = (str) => String(str).replace(/[&<>"]/g, (c) => ATTR[c])

/** JSON-LD 跳脫：把 < 換成 <，避免 </script> 與 <!-- 提早結束 script。傳物件時先 JSON.stringify */
export function escapeJsonLd(json) {
  const text = typeof json === 'string' ? json : JSON.stringify(json)
  return text.replace(/</g, '\\u003c')
}

/**
 * head 項目序列化成 HTML：[tag, attrs] 照屬性順序寫成 <tag k="v">，值一律 escapeAttr。
 * 只處理沒有內容的單標籤（link、meta），VitePress 的 head 形狀 [tag, attrs, content] 有內容時丟錯
 */
export function headHtml(head) {
  return (head ?? []).map(([tag, attrs, content]) => {
    if (content !== undefined) throw new Error(`headHtml 只處理單標籤，${tag} 有內容`)
    const parts = Object.entries(attrs ?? {}).map(([k, v]) => ` ${k}="${escapeAttr(v)}"`)
    return `<${tag}${parts.join('')}>`
  })
}

/**
 * hreflang 的 VitePress head 版：[['link', { rel: 'alternate', hreflang, href }], …]。alternates 是 urls.mjs alternatesFor()
 * 或 siteHomeAlternates() 的結果（[{ code, hreflang, href }]，已照 LOCALES 排序），最後一條是 x-default。
 * alternates 為空（單語工具、永遠不收錄的頁、還沒有外語首頁的 /）時回 []
 */
export function hreflangHead(alternates, xDefaultHref) {
  if (!alternates?.length) return []
  const head = alternates.map((a) => ['link', { rel: 'alternate', hreflang: a.hreflang, href: a.href }])
  if (xDefaultHref) head.push(['link', { rel: 'alternate', hreflang: 'x-default', href: xDefaultHref }])
  return head
}

/** hreflang 的 <link>：hreflangHead() 序列化，一行一條；alternates 為空時回 '' */
export function hreflangHtml(alternates, xDefaultHref) {
  return headHtml(hreflangHead(alternates, xDefaultHref)).join('\n')
}

/**
 * og:locale 加 og:locale:alternate 的 VitePress head 版。alternateCodes 是這頁實際存在的語系（可含自己，會被略過），
 * 照 LOCALES 排序、去重。og:locale:alternate 有好幾條、第一個屬性相同，VitePress 的 mergeHead 不會合併 frontmatter 自己的多條
 */
export function ogLocaleHead(code, alternateCodes = []) {
  const self = getLocale(code)
  const others = [...new Set(alternateCodes ?? [])].filter((c) => c !== code)
  others.forEach(getLocale)
  others.sort(byLocaleOrder)
  return [
    ['meta', { property: 'og:locale', content: self.ogLocale }],
    ...others.map((c) => ['meta', { property: 'og:locale:alternate', content: getLocale(c).ogLocale }]),
  ]
}

/** og:locale 的 <meta>：ogLocaleHead() 序列化，一行一條 */
export function ogLocaleHtml(code, alternateCodes = []) {
  return headHtml(ogLocaleHead(code, alternateCodes)).join('\n')
}
