// 本機預覽的站內連結（2026-11-05）：共用頁首頁尾與外語首頁的站內連結照規格寫完整網址 https://www.casper.tw/…
// （shared/shell/i18n/urls.mjs），正式站同網域沒問題；但在 localhost 的 preview 點語系選單會跳到線上站，看不到預覽。
// 只有 build:preview（plan.stage === 'preview'）在 head 加一小段腳本：不在 www.casper.tw 上時，
// 點 https://www.casper.tw/ 開頭的連結改開目前網域的同一路徑。HTML 本身不改，正式建置（dist/）完全沒有這段。
// 工具的網址不攔：/<slug>… 在線上由各工具的 Worker 提供（route www.casper.tw/<slug>*），preview 建置沒有這些頁，
// 改到 localhost 只會 404。slug 取自 tools.json，比對方式跟 route 一樣是前綴（/<slug> 開頭的路徑都算工具的）。
import { SITE_URL } from '../theme/shared/shell/site.mjs'
import { SITE_INDEX } from './site-home.mjs'

/**
 * 腳本開頭的固定記號：audit 用它在產物裡認出 preview 腳本，正式建置的產物不能出現。
 * VitePress 會用 esbuild 壓縮 head 裡的 <script>，一般註解會被拿掉；/*! 開頭的是授權註解，壓縮後照原樣留在開頭
 */
export const PREVIEW_LINKS_MARKER = '/*!cs-preview-links*/'

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/

/** tools.json 裡每支工具的 slug；格式不對就丟錯（空字串會讓每條路徑都被當成工具） */
export function toolSlugs(index = SITE_INDEX) {
  return (index?.tools ?? []).map((t) => {
    if (typeof t?.slug !== 'string' || !SLUG_RE.test(t.slug)) throw new Error(`tools.json 的工具 slug 格式不對：${JSON.stringify(t?.slug)}`)
    return t.slug
  })
}

export function previewLinkScript(siteUrl = SITE_URL, slugs = []) {
  for (const s of slugs) if (typeof s !== 'string' || !SLUG_RE.test(s)) throw new Error(`工具 slug 格式不對：${JSON.stringify(s)}`)
  const prefix = JSON.stringify(`${siteUrl}/`)
  const host = JSON.stringify(new URL(siteUrl).hostname)
  return (
    `${PREVIEW_LINKS_MARKER}(()=>{const P=${prefix},T=${JSON.stringify(slugs)};if(location.hostname===${host})return;` +
    `document.addEventListener('click',e=>{if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;` +
    `const a=e.target instanceof Element&&e.target.closest('a[href]');if(!a||a.target==='_blank')return;` +
    `const h=a.getAttribute('href');if(!h||!h.startsWith(P))return;` +
    `const p=h.slice(P.length-1);if(T.some(s=>p.startsWith('/'+s)))return;` +
    `e.preventDefault();e.stopImmediatePropagation();location.href=location.origin+p},true)})()`
  )
}

/** config.mts 的 head：preview 才有這段腳本，其他時候是空陣列（不讀 tools.json） */
export function previewHead(plan, index = SITE_INDEX) {
  return plan?.stage === 'preview' ? [['script', {}, previewLinkScript(SITE_URL, toolSlugs(index))]] : []
}
