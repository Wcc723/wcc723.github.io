// 法務頁對照：全站層級，正本放 workspace，不放各工具。這裡只有網址、站長決定與閘門，不放任何法務文字
// （法務文字由站長決定，AGENTS.md「只有站長能做」）。
//
// 外語法務頁的位置照 M.1 第 3 題定案的 C 預留：全站的外語法務頁做成一支用多語範本建的工具（slug 例如 site-policies，
// 要先過 node scripts/scan-paths.mjs --slug site-policies、站長核可）。那支工具上線、頁面審過之後，才把網址加進下面的表：
//   privacy:   { en: 'https://www.casper.tw/<slug>/privacy/', ja: 'https://www.casper.tw/<slug>/ja/privacy/', … }
//   impressum: { de: 'https://www.casper.tw/<slug>/de/impressum/' }
//   externalTransmission: { ja: 'https://www.casper.tw/<slug>/ja/privacy/#…' }（日文隱私權說明的外部送信一節）
// 繁中版仍是部落格的 /privacy/ 等頁。頁面還不存在之前不要先填網址：legalGaps() 會誤判成已滿足，頁尾也會連到 404。
import { LOCALE, getLocale } from './locales.mjs'

// kind → { 語系代碼: 網址 }。網址一律 https 完整網址、帶尾斜線（片段 # 除外）
export const LEGAL_PAGES = {
  privacy: { 'zh-tw': 'https://www.casper.tw/privacy/' }, // 其他語系等外語法務頁做好、審過後再加
  terms: { 'zh-tw': 'https://www.casper.tw/terms/' },
  contact: { 'zh-tw': 'https://www.casper.tw/contact/' },
  about: { 'zh-tw': 'https://www.casper.tw/about/' },
  impressum: {}, // de 用
  externalTransmission: {}, // ja 用，指向日文隱私權說明的外部送信一節
}

// 站長的決定：{ locale, flag, decision: 'waived' | 'confirmed', decidedBy: 'casper', decidedAt: 'YYYY-MM-DD', note }
// waived：這個語系不提供該頁（隱私權頁會連到繁中版並標示）；confirmed：confirm 類旗標已確認（例如 ko 的 PIPA）。
// 只在站長當次明確指示時新增，agent 不自己寫。
export const LEGAL_DECISIONS = [
  // 站長 2026-11-04：德文只是全站多語功能的一部分，不專門經營德國市場，不提供 Impressum、不公開住家地址。
  // 德文仍要有同語言的隱私權說明（privacy 旗標照舊）。之後要專門拓展德國市場（德文關鍵字廣告、德國專屬頁面）前，先請熟悉德國網路法的律師確認，再改這一筆。
  { locale: 'de', flag: 'impressum', decision: 'waived', decidedBy: 'casper', decidedAt: '2026-11-04',
    note: '只提供德文翻譯，不專門經營德國市場；專門拓展德國市場前先請律師確認 DDG 第 5 條義務' },
]

export const LEGAL_LEVELS = ['required', 'disclose', 'confirm']
const FALLBACK = 'zh-tw'

const decisionOf = (code, flag, decisions) => decisions.find((d) => d.locale === code && d.flag === flag)

/**
 * 法務頁連結：回傳 { href, hreflang, lang, exact }。該語系沒有版本時退回 zh-tw，exact 為 false，呼叫端要套 inChinese 標示；
 * 連 zh-tw 也沒有（impressum、externalTransmission）時回 null，呼叫端不放這個連結。
 */
export function legalLink(kind, code, { pages = LEGAL_PAGES } = {}) {
  if (!(kind in pages)) throw new Error(`未知的法務頁：${kind}`)
  getLocale(code)
  const own = pages[kind][code]
  if (own) return { href: own, hreflang: LOCALE[code].hreflang, lang: LOCALE[code].htmlLang, exact: true }
  const zh = pages[kind][FALLBACK]
  if (!zh) return null
  return { href: zh, hreflang: LOCALE[FALLBACK].hreflang, lang: LOCALE[FALLBACK].htmlLang, exact: false }
}

/**
 * 這個語系還沒滿足的 legal 旗標，live 建置用（範本的 J29）。回 [{ flag, level, detail }]，空陣列代表都滿足。
 *   required、disclose：LEGAL_PAGES[flag][code] 有網址，或 LEGAL_DECISIONS 有 waived 紀錄
 *   confirm：LEGAL_DECISIONS 有 confirmed 紀錄
 */
export function legalGaps(code, { pages = LEGAL_PAGES, decisions = LEGAL_DECISIONS } = {}) {
  const gaps = []
  for (const [flag, level] of Object.entries(getLocale(code).legal)) {
    const d = decisionOf(code, flag, decisions)
    if (level === 'confirm') {
      if (d?.decision !== 'confirmed') gaps.push({ flag, level, detail: `${code} 的 ${flag} 要站長確認：LEGAL_DECISIONS 加一筆 decision: 'confirmed'` })
    } else if (level === 'required' || level === 'disclose') {
      if (!pages[flag]?.[code] && d?.decision !== 'waived') {
        gaps.push({ flag, level, detail: `${code} 的 ${flag} 要有同語言的網址（LEGAL_PAGES.${flag}['${code}']），或站長在 LEGAL_DECISIONS 寫 waived` })
      }
    } else {
      throw new Error(`未知的法務層級：${code}.${flag} = ${level}`)
    }
  }
  return gaps
}
