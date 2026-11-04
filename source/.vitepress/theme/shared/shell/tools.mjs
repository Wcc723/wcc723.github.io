// 全站工具清單的連結規則（主站首頁規格 F.6）。index 是 shared/data/tools.json 的內容（scripts/site-data.mjs 產生）。
// 前後端都能用：只 import i18n/locales.mjs、i18n/urls.mjs，不用 node: 模組。
// 頁尾工具組（SiteFooter.vue）、外語首頁與部落格首頁的 #tools、部落格 ⌘K 都用這一份，退路與語言標示只寫在這裡。
import { getLocale } from './i18n/locales.mjs'
import { LOCALE_MARK_KEYS, pickTarget } from './i18n/urls.mjs'

// 切語言標示用的哨兵：不會出現在外殼字串裡。text('inChinese', { label: MARK }) 的結果用它切成名稱前後兩段
export const MARK = '\u0000'

/**
 * @typedef {object} SiteToolLink
 * @property {string} slug
 * @property {string} href          目的地網址（tools.json 的 url：絕對網址加尾斜線）
 * @property {string} hreflang      目的地語系的 hreflang
 * @property {string} label         工具名，目的地語言
 * @property {string|null} lang     目的地語言不是頁面語言時，是目的地的 htmlLang；否則 null
 * @property {string} before        語言標示在名稱前的字（同語言時是 ''）
 * @property {string} after         語言標示在名稱後的字，例如 ' (in Traditional Chinese)'
 * @property {string|null} summary  只有 exact 時有；不退回別的語言
 * @property {string} ghost
 * @property {string[]} keywords
 * @property {boolean} exact        有頁面語系的版本
 * @property {boolean} current      就是這支工具（頁尾標 aria-current="page"，不從清單拿掉）
 */

/** 外殼字串的標示切成名稱前後兩段；字串裡要剛好有一個 MARK */
function splitMark(s, key) {
  const parts = String(s).split(MARK)
  if (parts.length !== 2) throw new Error(`${key} 的字串要剛好有一個 {label}`)
  return { before: parts[0], after: parts[1] }
}

/**
 * 一頁的工具組。index 是 tools.json 的內容；null 或缺檔當成沒有工具。
 * text 是已綁定頁面語系的外殼字串函式 (key, params) => string，只會用到 inChinese、inEnglish；
 * 每支工具都有頁面語系的版本時用不到，可以不給（要用卻沒給就丟錯）。
 *   1. 目的地：pickTarget(locale, 已發布的語系, { xDefault: tool.xDefaultLocale, root: tool.rootLocale })
 *   2. 語言標示：目的地是 zh-tw 接 inChinese、en 接 inEnglish，其他語系丟錯（根語系與 x-default 只能是這兩個）
 *   3. 排序：exact 的在前，其他在後，各自維持 tools.json 的順序
 *   4. 不過濾：清單裡每支工具都列，currentSlug 那支標 current
 * @returns {SiteToolLink[]}
 */
export function siteToolLinks(index, { locale, currentSlug = null, text } = {}) {
  const page = getLocale(locale)
  const tools = Array.isArray(index?.tools) ? index.tools : []
  const links = tools.map((tool) => {
    const available = Object.keys(tool.locales ?? {})
    const { code: target, exact } = pickTarget(locale, available, { xDefault: tool.xDefaultLocale, root: tool.rootLocale })
    const dest = tool.locales[target]
    const t = getLocale(target)
    let before = ''
    let after = ''
    if (!exact) {
      const key = LOCALE_MARK_KEYS[target]
      if (!key) throw new Error(`${tool.slug} 退到 ${target}，但沒有連到 ${target} 的語言標示字串（只有 ${Object.keys(LOCALE_MARK_KEYS).join('、')}）`)
      if (typeof text !== 'function') throw new Error(`${tool.slug} 在 ${locale} 頁要接 ${key}，要給 text`)
      ;({ before, after } = splitMark(text(key, { label: MARK }), key))
    }
    return {
      slug: tool.slug,
      href: dest.url,
      hreflang: t.hreflang,
      label: dest.name,
      lang: target === page.code ? null : t.htmlLang,
      before,
      after,
      summary: exact ? (dest.summary ?? null) : null,
      ghost: tool.ghost,
      keywords: [...(tool.keywords ?? [])],
      exact,
      current: currentSlug !== null && tool.slug === currentSlug,
    }
  })
  return [...links.filter((l) => l.exact), ...links.filter((l) => !l.exact)]
}

/** tools.json 有沒有工具（部落格頁首的「工具」、頁尾工具組要不要出現） */
export const hasSiteTools = (index) => Array.isArray(index?.tools) && index.tools.length > 0
