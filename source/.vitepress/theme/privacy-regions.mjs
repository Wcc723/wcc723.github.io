// 歐洲經濟區、英國、瑞士：GA4 consent 用的 CONSENT_REGIONS（workspace shared/shell/analytics.mjs），
// 加上 ISO 3166 另外編碼、屬於歐盟的海外領土。Meta 像素（lib/seo.mjs）不載、FB 留言（components/FbComments.vue）按了才載，兩邊共用這份。
// 國家讀 Cloudflare 的 /cdn-cgi/trace（loc=XX 是未知）。
import { CONSENT_REGIONS } from './shared/shell/analytics.mjs'

export const EEA_REGIONS = [...CONSENT_REGIONS, 'AX', 'GF', 'GP', 'MQ', 'RE', 'YT', 'MF']

/** /cdn-cgi/trace 的內文 → 兩碼國家代碼；讀不到或是 XX 回 null */
export function traceCountry(text) {
  const m = /^loc=([A-Z]{2})$/m.exec(String(text ?? ''))
  return m && m[1] !== 'XX' ? m[1] : null
}
