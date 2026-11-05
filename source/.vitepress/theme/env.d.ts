// Vite define（config.mts）：這次建置要不要產生外語首頁（主站首頁規格 B.6、D.1）。
// false 時 Layout.vue 不登記 site-home，SiteHomePage.vue 與它 import 的 CSS 一起被拿掉，P1、P2 的產物不變
declare const __CS_SITE_HOME__: boolean
// Vite define（config.mts）：這次建置用不用共用頁首頁尾（主站首頁規格 G.5；lib/site-home.mjs 的 effectiveShell()，preview 一律 true）。
// false 時 Layout.vue 不載入 components/SharedHeader.vue、SharedFooter.vue，HomePage.vue 不載入 HomeTools.vue，它們與 import 的 CSS 一起被拿掉
declare const __CS_SHARED_SHELL__: boolean
