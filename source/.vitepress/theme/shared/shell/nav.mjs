// 頁首與頁尾的連結結構（shared/shell/README.md 計畫中的 nav 資料檔）。這裡只放結構與 href，
// 顯示文字一律從 i18n/shell-strings.mjs 的外殼字串取（key 欄位），同一個字只寫一處。
// 寫成 .mjs 而不是 .json：Node 腳本 import JSON 要加 import attributes，工具的 vue-tsc 也要另開 resolveJsonModule。
// 法務與關於、聯絡頁的網址不寫在這裡，一律用 i18n/legal.mjs 的 legalLink()（legal 欄位是 LEGAL_PAGES 的 kind）。
import { SITE_URL } from './site.mjs'

// 站徽：灰藍小幽靈頭像（shared/brand/ghost/s-logo.webp，144 × 144），頁首 36px、頁尾 28px
export const SHELL_LOGO = { src: 'https://img.casper.tw/brand/ghost/s-logo.webp', width: 144, height: 144 }

// 全站首頁與文章入口
export const SITE_HOME = `${SITE_URL}/`
export const ARTICLES_URL = `${SITE_URL}/categories/`

// 頁首的全站導覽：只有 BLOG_LOCALES（zh-tw）的頁有（多語版型規格 G 節）。
// nav.tools 連首頁的工具區，至少一支工具上線才輸出（docs/architecture/site-architecture-v2.md「導覽」）。
// section 對到部落格的 sectionOf()（頁型屬於哪一區），在那一區時 aria-current="true"（shell-model.mjs 的 headerModel）
export const HEADER_SITE_NAV = [
  { key: 'nav.tools', href: `${SITE_URL}/#tools`, needsLiveTools: true, section: 'tools' },
  { key: 'nav.articles', href: ARTICLES_URL, section: 'posts' },
  { key: 'nav.about', legal: 'about', section: 'about' },
]

// 繁中頁（BLOG_LOCALES）的頁尾四組；工具組由 shell-model.mjs 依 tools.json 產生，放在最前面。
// 連結與順序照 ARCH「導覽」的頁尾，跟 P2 的部落格頁尾逐條相同（主站首頁規格 G.1）。
// external：站外連結，元件只加一個 aria-hidden 的外連圖示，不加 rel、不開新分頁（跟部落格現在的頁尾相同）
export const FOOTER_BLOG_GROUPS = [
  { key: 'footer.group.posts', links: [
    { key: 'footer.posts.latest', href: `${SITE_URL}/` },
    { key: 'footer.posts.categories', href: `${SITE_URL}/categories/` },
    { key: 'footer.posts.tags', href: `${SITE_URL}/tags/` },
    { key: 'footer.posts.archives', href: `${SITE_URL}/archives/` },
    { key: 'footer.posts.rss', href: `${SITE_URL}/atom.xml` },
  ] },
  { key: 'footer.group.topics', links: [
    { key: 'footer.topic.css', href: `${SITE_URL}/categories/CSS/` },
    { key: 'footer.topic.javascript', href: `${SITE_URL}/categories/javascript/` },
    { key: 'footer.topic.development', href: `${SITE_URL}/categories/development/` },
    { key: 'footer.topic.design', href: `${SITE_URL}/categories/design/` },
  ] },
  { key: 'footer.group.site', links: [
    { key: 'footer.about', legal: 'about' },
    { key: 'footer.contact', legal: 'contact' },
    { key: 'footer.privacy', legal: 'privacy' },
    { key: 'footer.terms', legal: 'terms' },
  ] },
  { key: 'footer.group.elsewhere', links: [
    { key: 'footer.elsewhere.games', href: 'https://games.casper.tw/', external: true },
    { key: 'footer.elsewhere.book', href: 'https://hex.school/byKCb', external: true },
    { key: 'footer.elsewhere.facebook', href: 'https://www.facebook.com/WccCasper', external: true },
    { key: 'footer.elsewhere.github', href: 'https://github.com/wcc723', external: true },
  ] },
]

// 外語頁（BLOG_LOCALES 以外）的全站連結，連結字用頁面語言，連到別的語言時接語言標示（shell-model.mjs 的 footerModel）：
//   siteHome：footer.home 的目的地執行時才決定（siteHomeLink：該語系的全站首頁已上線就連 /<code>/，否則退 /en/ 或 /）
//   siteHomeHash：該語系的全站首頁已上線時改連 /<code>/#<hash>（同語言的簡介），否則照 legal 連關於頁
// 工具組由 shell-model.mjs 依 tools.json 產生。
export const FOOTER_SITE_NAV = {
  other: [
    { key: 'footer.home', siteHome: true },
    { key: 'footer.blog', href: ARTICLES_URL },
    { key: 'footer.about', legal: 'about', siteHomeHash: 'about' },
    { key: 'footer.contact', legal: 'contact' },
  ],
}

// 頁尾的法務連結：隱私權、使用條款每個語系都有；Impressum、外部送信只給登錄表有該旗標、而且 LEGAL_PAGES 有網址的語系
export const FOOTER_LEGAL_NAV = [
  { key: 'footer.privacy', legal: 'privacy' },
  { key: 'footer.terms', legal: 'terms' },
  { key: 'footer.legalNotice', legal: 'impressum', flag: 'impressum' },
  { key: 'footer.thirdParty', legal: 'externalTransmission', flag: 'externalTransmission' },
]
