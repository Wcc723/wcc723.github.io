// 全站工具清單的連結規則（主站首頁規格 F.6）。index 是 shared/data/tools.json 的內容（scripts/site-data.mjs 產生）。
// 前後端都能用：只 import i18n/locales.mjs、i18n/urls.mjs，不用 node: 模組。
// 頁尾工具組（SiteFooter.vue）、外語首頁與部落格首頁的 #tools、部落格 ⌘K 都用這一份，退路與語言標示只寫在這裡。
import { getLocale } from './i18n/locales.mjs'
import { LOCALE_MARK_KEYS, pickTarget } from './i18n/urls.mjs'

// 切語言標示用的哨兵：不會出現在外殼字串裡。text('inChinese', { label: MARK }) 的結果用它切成名稱前後兩段
export const MARK = '\u0000'

// 工具卡的圖（主站首頁規格 F.2）：tools.json 每支工具剛好有 ghost（小幽靈 spot1 到 spot4）或 mark（工具自己的站徽）其中一個。
// 站徽是工具自己網址底下的透明 WebP，固定 TOOL_MARK_SIZE × TOOL_MARK_SIZE，跟小幽靈 s-spot<N>.webp 同尺寸；
// site-data.mjs 驗網址、site-check.mjs 線上驗尺寸，部落格 ghost.mjs 的 toolCardArt() 照這個尺寸輸出 width、height
export const TOOL_MARK_SIZE = 340
// 站徽在工具網址底下的相對路徑：每段小寫英數字開頭，段內可有 . _ -（不能有 .. 段），結尾 .webp，不帶查詢字串。
// 卡片裡寫完整網址 https://www.casper.tw/<slug>/<路徑>；範本的 card.mark 寫相對於 public/ 的路徑
export const TOOL_MARK_PATH = /^[a-z0-9][a-z0-9_-]*(?:\.[a-z0-9_-]+)*(?:\/[a-z0-9][a-z0-9_-]*(?:\.[a-z0-9_-]+)*)*\.webp$/

// 工具的介紹區塊（主站首頁規格 F.2、F.6，站長 2026-11-05「音效工具也要有完整的介紹」），選填：
//   每個語系 locales[code] 的 intro（一段）、highlights（2 到 4 條重點）、cta（按鈕字），三個一起寫或都不寫；
//   工具層級的 images（1 到 5 張 WebP，images[0] 是主圖，其他是小裝飾圖），至少一個語系有 intro 才能寫。
// 上限由 site-data.mjs 的 cardProblems 驗；字數算 Unicode 字元（code point）
export const TOOL_FEATURE_LIMITS = Object.freeze({
  introMax: 400,
  highlightsMin: 2,
  highlightsMax: 4,
  highlightMax: 80,
  ctaMax: 40,
  imagesMin: 1,
  imagesMax: 5,
  imageSideMax: 2000,
})
// 每個語系的介紹欄位：三個一起寫或都不寫
export const TOOL_FEATURE_LOCALE_KEYS = ['intro', 'highlights', 'cta']

/**
 * @typedef {object} ToolFeatureImage
 * @property {string} src     絕對網址（https://www.casper.tw/<slug>/ 或 https://img.casper.tw/<slug>/ 底下的 .webp）
 * @property {number} width   宣告的寬（像素，site-data.mjs 線上驗過跟檔案相同）
 * @property {number} height  宣告的高
 *
 * @typedef {object} ToolFeature
 * @property {string} intro              一段介紹
 * @property {string[]} highlights       2 到 4 條重點
 * @property {string} cta                按鈕字
 * @property {ToolFeatureImage[]} images images[0] 是主圖，其他是小裝飾圖；工具沒有圖時是 []
 */

/**
 * tools.json 裡一支工具在某個語系的介紹區塊；那個語系沒有 intro 時回 null（不退回別的語言，跟 summary 相同）。
 * 回傳的陣列與物件都是複本，改了不影響 tools.json
 * @returns {ToolFeature|null}
 */
export function toolFeature(tool, code) {
  const loc = tool?.locales?.[code]
  if (!loc || typeof loc.intro !== 'string') return null
  return {
    intro: loc.intro,
    highlights: [...(loc.highlights ?? [])],
    cta: loc.cta,
    images: (Array.isArray(tool.images) ? tool.images : []).map(({ src, width, height }) => ({ src, width, height })),
  }
}

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
 * @property {ToolFeature|null} feature 介紹區塊（toolFeature()）：只有 exact、而且那個語系有 intro 時有；不退回別的語言
 * @property {string|null} ghost    工具卡的小幽靈 spot1 到 spot4；用自己的站徽時是 null
 * @property {string|null} mark     工具自己的站徽（絕對網址，TOOL_MARK_SIZE 見方）；用小幽靈時是 null
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
      feature: exact ? toolFeature(tool, target) : null,
      ghost: tool.ghost ?? null,
      mark: tool.mark ?? null,
      keywords: [...(tool.keywords ?? [])],
      exact,
      current: currentSlug !== null && tool.slug === currentSlug,
    }
  })
  return [...links.filter((l) => l.exact), ...links.filter((l) => !l.exact)]
}

/** tools.json 有沒有工具（部落格頁首的「工具」、頁尾工具組要不要出現） */
export const hasSiteTools = (index) => Array.isArray(index?.tools) && index.tools.length > 0
