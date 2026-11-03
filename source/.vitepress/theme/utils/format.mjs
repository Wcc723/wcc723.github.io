// 主題用的日期與閱讀時間格式。只用標準 JavaScript，Vue 元件和 node:test 都能 import。
// 日期一律取字串開頭的年月日，不做時區轉換（計畫的網址規則 17：日期從檔名取，以 Asia/Taipei 為準）。

const YMD_RE = /^(\d{4})-(\d{1,2})-(\d{1,2})/
const PATH_DATE_RE = /(?:^|\/)(\d{4})\/(\d{2})\/(\d{2})\//

const pad = (n) => String(n).padStart(2, '0')

/**
 * '2022-01-10'、'2022-1-10 15:28:32'、'2019-11-12T15:28:32.000Z' → { iso: '2022-01-10', text: '2022.01.10' }。
 * Date 物件用 Asia/Taipei 換算（YAML 的時間戳記會變成 Date）。認不得就回 null。
 */
export function formatDate(value) {
  if (value == null || value === '') return null
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(value)
    return formatDate(parts)
  }
  const m = YMD_RE.exec(String(value).trim())
  if (!m) return null
  const iso = `${m[1]}-${pad(m[2])}-${pad(m[3])}`
  return { iso, text: iso.replaceAll('-', '.') }
}

/** 文章網址裡的日期：'/development/2022/01/10/install-nvm/' → '2022-01-10'；沒有就回 '' */
export function dateFromPath(path) {
  const m = PATH_DATE_RE.exec(String(path ?? ''))
  return m ? `${m[1]}-${m[2]}-${m[3]}` : ''
}

/** 閱讀時間：5 → '5 分鐘閱讀'；已經是文字就照用；沒有或不合理就回 '' */
export function readingText(value) {
  if (value == null || value === '') return ''
  if (typeof value === 'string' && !/^\d+$/.test(value.trim())) return value.trim()
  const n = Math.round(Number(value))
  return Number.isFinite(n) && n > 0 ? `${n} 分鐘閱讀` : ''
}

/** 卡片上的日期，跟 Hexo 版和列表頁卡片相同：'2026-10-05' → '2026 年 10 月 05 日' */
export function longDate(value) {
  const d = formatDate(value)
  if (!d) return ''
  const [y, m, day] = d.iso.split('-')
  return `${y} 年 ${m} 月 ${day} 日`
}

/** 站內網址轉成 href：frontmatter 的網址沒有編碼，中文照 Hexo 的寫法 percent-encode；已經編碼過的不再編碼 */
export function toHref(url) {
  const u = String(url ?? '')
  if (!u || /%[0-9A-Fa-f]{2}/.test(u)) return u
  return encodeURI(u)
}
