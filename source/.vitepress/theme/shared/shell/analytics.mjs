// GA4 片段（多語版型規格 C.9）。正本在 workspace 的 shared/shell/，由 scripts/shell-sync.mjs 複製進部落格與每支工具，不手改副本。
// 只用標準 JavaScript，不 import 任何套件，Node 腳本、Vite、VitePress config 都能直接 import。
//   - 整段（包含載入 gtag.js）只在 www.casper.tw 執行，本機與預覽環境不下載
//   - consent 的 default 一定寫在 config 之前，順序錯了 default 不會生效（M.1 第 11 題）
//   - content_group：部落格是 'blog'，工具是自己的 slug；多語工具與部落格的外語首頁另帶 page_locale（語系代碼，跟網址段一致）
//   - 事件不帶任何使用者輸入
export const GA4_ID = 'G-97433H4032'
export const GA4_HOST = 'www.casper.tw'
// EEA、英國、瑞士預設 denied（0008 M.1 第 11 題，站長 2026-11-04 確認）
export const CONSENT_REGIONS = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT',
  'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH']

const js = (v) => JSON.stringify(v).replace(/</g, '\\u003c')

/** GA4 的 <script> 片段；pageLocale 只有多語工具與部落格的外語首頁（/<code>/）才帶，單語工具與部落格的繁中頁給 null */
export function ga4HeadHtml({ contentGroup, pageLocale = null }) {
  if (typeof contentGroup !== 'string' || !contentGroup) throw new Error('ga4HeadHtml：contentGroup 要是非空字串')
  const cfg = pageLocale ? { content_group: contentGroup, page_locale: pageLocale } : { content_group: contentGroup }
  return [
    '<script>',
    `if (location.hostname === ${js(GA4_HOST)}) {`,
    '  window.dataLayer = window.dataLayer || []',
    '  window.gtag = function () { dataLayer.push(arguments) }',
    `  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500, region: ${js(CONSENT_REGIONS)} })`,
    "  gtag('js', new Date())",
    `  gtag('config', ${js(GA4_ID)}, ${js(cfg)})`,
    "  var s = document.createElement('script'); s.async = true",
    `  s.src = ${js(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`)}; document.head.appendChild(s)`,
    '}',
    '</script>',
  ].join('\n')
}
