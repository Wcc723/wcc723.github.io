// Vite define（config.mts）：這次建置要不要產生外語首頁（主站首頁規格 B.6、D.1）。
// false 時 Layout.vue 不登記 site-home，SiteHomePage.vue 與它 import 的 CSS 一起被拿掉，P1、P2 的產物不變
declare const __CS_SITE_HOME__: boolean
