// 文章側欄的固定內容：作者卡、我的著作、社群。文字照 Hexo 版側欄（origin/master 文章頁的 <aside class="sidebar">），
// 只是換成 v4 的外觀；Hexo 版的「贊助／廣告版位」不重現（廣告只用 AdSense Auto ads）。
// 只用標準 JavaScript，Vue 元件和 node:test 都能 import。

/** 作者卡。頭像原檔 256 × 256，顯示 64 × 64 */
export const AUTHOR = {
  name: 'Wang Casper',
  localName: '卡斯伯',
  bio: '前端工程師、教學者。在 Web 上寫筆記，自 2013 年至今，也在六角學院教授前端。',
  avatar: { src: '/img/casper-avatar.webp', width: 64, height: 64 },
  about: '/about/'
}

/** 我的著作。封面原檔 214 × 300，顯示寬 72，高度依比例算 */
export const BOOK = {
  title: 'JavaScript 面試力',
  description: '面試前的最後一哩路，補齊 JS 核心觀念。',
  href: 'https://hex.school/byKCb',
  action: '前往購買',
  cover: { src: '/img/js-interview-cover.webp', width: 72, height: Math.round((72 * 300) / 214) }
}

/** 社群與 RSS：name 是平台，handle 是右邊的小字 */
export const SOCIAL = [
  { name: 'Facebook', handle: '卡斯伯', href: 'https://www.facebook.com/WccCasper' },
  { name: 'GitHub', handle: 'wcc723', href: 'https://github.com/wcc723' },
  { name: 'YouTube', handle: '六角學院', href: 'https://www.youtube.com/channel/UC-b2nGm0xLzic38Byti0VjA' },
  { name: 'RSS', handle: '訂閱', href: '/atom.xml' }
]

/** 站外連結另開分頁（照 Hexo 版），一律加 rel="noopener" */
export const isExternalHref = (href) => /^https?:\/\//.test(String(href ?? ''))
