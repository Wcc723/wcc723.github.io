# VitePress 設定與主題的分工

P1 的模組介面。每個檔案只有一個負責的模組，其他模組只讀不改；介面要改時先改這份文件。

## 建置流程

```
config.mts
  rewrites            ← lib/posts.mjs     _posts/<檔名>.md → <category>/<YYYY>/<MM>/<DD>/<slug>/index.md
  markdown            ← lib/markdown.mjs  breaks、code_inline v-pre、模擬 Hexo 的標題 id、關掉 emoji、headers、
                                          空的 header-anchor、原始 <a> 裡不再 linkify、複製鈕文字
  transformPageData   ← lib/pagedata.mjs  先跑：頁型、網址、麵包屑、卡片、上下篇（寫進 frontmatter）
                      ← lib/seo.mjs       後跑：title、description、canonical、og、JSON-LD、cssdemo（寫進 frontmatter.head）
  transformHtml       ← lib/seo.mjs       依 ADS_MODE 與頁型拿掉 AdSense loader；404 頁把 SSR 內容填回 #app，
                                          title 與 description 換成 theme/head.mjs 的中文
  head                ← lib/seo.mjs       全站 head：GA4、FB Pixel、AdSense meta 與 loader、atom
                      ← theme/head.mjs    主題的 head：favicon、深淺色防閃 script（字型由 styles/fonts.css 的 @font-face 載入）；
                                          另外匯出 404 頁的 title、description 文字（seo 與 NotFound.vue 共用）
  buildEnd            ← lib/feeds.mjs     atom.xml、content.json
  sitemap             ← lib/feeds.mjs     transformItems；lastmodDateOnly（lastmod 只輸出日期）
  ignoreDeadLinks     config.mts          只略過 http://localhost 的教學連結，其餘站內連結都要找得到
  vue                 config.mts          transformAssetUrls.includeAbsolute: false（舊文原始 HTML 的網址不轉成 import）
動態路由（paths loader） ← lib/pagedata.mjs 的資料 + lib/cards.mjs 的卡片 HTML（params 另外帶顯示名稱 name）
主題                   ← theme/          只讀 frontmatter 與 params，不 import lib/
```

`lib/` 只在 Node 端執行（config、paths loader），主題不能 import `lib/`，文章摘要才不會進主題 chunk。

凍結資料（從基準或 `origin/master` 抽出，重跑腳本才會變）：

- `lib/legacy-descriptions.json`：沒寫 description 的舊頁的 description，`scripts/freeze-descriptions.mjs` 產生，`lib/seo.mjs` 讀。
- `lib/legacy-cards.json`：舊文卡片的摘要與閱讀時間，`scripts/freeze-legacy-cards.mjs` 產生，`lib/cards.mjs` 讀。
- `lib/pagedata.mjs` 的 `LEGACY_TAG_ORDER`：8 篇照一般規則重現不了 Hexo 標籤順序的文章，照基準的順序凍結。

示範元件（`theme/components/demos/`）：只在瀏覽器執行、不輸出元素的元件，模板寫 `<span v-if="false" />`，不要留空的 `<template>`（SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 對不上）；`demos.test.mjs` 會檢查。

## 共用

- `theme/shared/`：從 workspace 的 `shared/tokens/`、`shared/shell/` 複製過來，不手改（`shell/site.mjs` 的 SITE_TITLE_LEGACY、ADS_MODE、shouldLoadAds、stripAdsLoader；`tokens/tokens.css` 的 v4 token）。`lib/` 也從這裡 import。
- `lib/posts.mjs`：文章索引 `loadPosts(srcDir)`，每篇有 `file`、`src`、`date`、`year`、`month`、`day`、`slug`、`category`、`title`、`description`、`tags`、`updated`、`thumbnail`、`photo`、`cssdemo`、`ads`、`url`、`content`；另有 `categoryDir()`（css → CSS）、`tagSlug()`、`toAbsolute()`、`SITE_URL`。
- `lib/pagetype.mjs`：`pageTypeOf(relativePath)`，頁型名稱跟 `theme/shared/shell/site.mjs` 的 AD_PAGE_TYPES 一致。

## 頁型

| pageType | 網址 | 來源 |
|---|---|---|
| `home` | `/` | `index.md` |
| `blog-index` | `/page/N/`（2 到 37） | `page/[page]/index.md` |
| `post` | `/<category>/<YYYY>/<MM>/<DD>/<slug>/` | `_posts/*.md`（rewrites） |
| `taxonomy-list` | `/categories/<dir>/`、`/categories/<dir>/page/N/`、`/tags/<slug>/`、`/tags/<slug>/page/N/` | 動態路由 |
| `nav-index` | `/categories/`、`/tags/`、`/archives/`、`/archives/YYYY/`、`/archives/YYYY/MM/` | `categories/index.md`、`tags/index.md`、動態路由 |
| `about` | `/about/`、`/about/hexschool-traning`（輸出 `.html`，front matter `ads: false`） | `about/*.md` |
| `legal` | `/privacy/`、`/contact/`、`/terms/` | `privacy/index.md` 等 |
| `not-found` | `/404.html` | 主題的 NotFound |

## frontmatter 欄位（lib/pagedata.mjs 寫，seo 與主題讀）

| 欄位 | 頁型 | 內容 |
|---|---|---|
| `pageType` | 全部 | 上表 |
| `url` | 全部 | 網址路徑，未編碼，例 `/javascript/2019/03/18/JS-THIS/`、`/about/hexschool-traning`、`/categories/CSS/`。canonical = `toAbsolute(url)` |
| `breadcrumbs` | 首頁、404 以外 | `[{ name, url }]`，最後一層沒有 `url`。分類、標籤的第 N 頁（N ≥ 2）多一層「第 N 頁」，分類名或標籤名那層帶連結 |
| `post` | post | `{ date, category, categoryUrl, tags: [{ name, url }], readingTime, cover, updated }`；`tags` 的順序跟基準的 content.json 相同（`LEGACY_TAG_ORDER`） |
| `prev`、`next` | post | `{ title, url }` 或 `null`，方向和文字跟 Hexo 的 post-nav 相同：`prev` 是較新的一篇，`next` 是較舊的一篇 |
| `related` | post | 同分類 3 篇 `[{ title, url }]` |
| `fbHref` | post、about | FB 留言的 data-href，跟基準逐字相同 |
| `cards` | home | 10 張 `{ title, url, date, category, categoryUrl, excerpt, readingTime, cover }` |
| `pager` | home、blog-index、taxonomy-list | `{ current, total, prevUrl, nextUrl, base, pages: [{ number, url }] }` |
| `heading` | 全部 | 頁面 H1 文字，例「分類：css」「封存：2014 / 5」；文章、about、法務頁是標題，首頁是站名，404 是 NotFound 的標題 |
| `postCount` | home、blog-index、taxonomy-list、nav-index | 這一頁所屬集合的篇數（全站、分類、標籤、某年、某月） |
| `listHtml` | `/categories/`、`/tags/`、`/archives/` | 分類清單、標籤雲、封存清單的 HTML（`lib/cards.mjs`），主題用 v-html 輸出 |
| `ads` | 全部 | 是否載入 AdSense loader（seo 依 shouldLoadAds 算；作者在 front matter 寫 `ads: false` 的頁一律不載入） |

列表頁的卡片是 paths loader 輸出的 HTML（`lib/cards.mjs` 的 `renderCards()`），class 名稱：`post-card`、`post-card__title`、`post-card__meta`、`post-card__excerpt`、`post-card__cover`。主題負責樣式。

## 對等基準

`baseline/hexo-2026-11-03/`：`pages.json`（每頁 title、description、canonical、og、h1、標題 id、文字指紋）、`urls.txt`、`atom.xml`、`sitemap.xml`、`content.json`。差異都要能說出原因；已知的預期差異：

- `/categories/CSS/` 這 10 頁的 canonical、og:url、分頁連結改成大寫（站長 2026-11-03 決定）。
- `/tags/sass/`、`/tags/bootstrap/`、`/tags/vue/`：合併成小寫，title、h1、canonical 都是小寫版，分頁變多。有這些標籤的文章，keywords 與 article:tag 也用小寫的名稱，article:tag 依新名稱重新排序。
- `article:modified_time` 與 JSON-LD dateModified：front matter `updated`，沒有就用發布日。
- JSON-LD：BlogPosting 改成計畫的新格式（author、publisher 指向 Person 的 @id），加上 BreadcrumbList 等。
- 沒寫 description 的舊頁：description 與 og:description 用凍結的舊值（`lib/legacy-descriptions.json`，從基準產生），新文章一律自己寫 description。

照舊但容易改錯的地方（audit 都會比）：

- 文章的 keywords 照 Hexo 的標籤建立順序（等於基準 content.json 的順序）；article:tag 依名稱的字碼順序（基準 364 篇都是），兩者順序本來就不同。
- `/404.html` 是新頁，基準沒有。title 是「這頁找不到 | 站名」，description 是頁面上那句說明（`theme/head.mjs`），不用 VitePress 內建的「404」「Not Found」。
