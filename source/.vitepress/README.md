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
  router              config.mts          prefetchLinks: false：整頁載入，下一頁 hydrate 用 .lean.js，預抓的 .md.js 用不到
                                          （audit 的 layout 檢查會擋下重新打開）
動態路由（paths loader） ← lib/pagedata.mjs 的資料 + lib/cards.mjs 的卡片 HTML（params 另外帶顯示名稱 name）
主題                   ← theme/          只讀 frontmatter 與 params，不 import lib/
```

`lib/` 只在 Node 端執行（config、paths loader），主題不能 import `lib/`，文章摘要才不會進主題 chunk。

凍結資料（從基準或 `origin/master` 抽出，重跑腳本才會變）：

- `lib/legacy-descriptions.json`：沒寫 description 的舊頁的 description，`scripts/freeze-descriptions.mjs` 產生，`lib/seo.mjs` 讀。
- `lib/legacy-cards.json`：舊文卡片的摘要與閱讀時間，`scripts/freeze-legacy-cards.mjs` 產生，`lib/cards.mjs` 讀。
- `lib/pagedata.mjs` 的 `LEGACY_TAG_ORDER`：8 篇照一般規則重現不了 Hexo 標籤順序的文章，照基準的順序凍結。

示範元件（`theme/components/demos/`）：只在瀏覽器執行、不輸出元素的元件，模板寫 `<span v-if="false" />`，不要留空的 `<template>`（SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 對不上）；`demos.test.mjs` 會檢查。

示範元件按需載入：`theme/index.ts` 用不帶 eager 的 glob 加 `defineAsyncComponent` 註冊成全域元件，每支各自一個 chunk（`assets/chunks/<元件名>.*.js`），只有用到的文章才下載，不進主題 chunk。SSR 會等元件載入完，預先渲染的 HTML 一樣完整；瀏覽器端等 chunk 載入後才接手那一段。主題其他檔案不要靜態 import `demos/` 底下的檔案，否則那支元件會被打回主題 chunk，`demos.test.mjs` 會檢查。

chunk 載入失敗（部署後還開著舊頁、離線）：瀏覽器端的 loader 包了一層，失敗時只在 console 留一行「[demo] … 載入失敗」的 warning，元件停在等待，那一段維持 SSR 的靜態 HTML，不會被清掉，也沒有未處理的 Promise rejection（Vue 的 hydration 不會 catch loader 的錯誤）。SSR 不包，建置時載入失敗會直接失敗。`Embed.vue` 的外部 script 載入失敗也只留 warning，同一則訊息一頁只印一次（`warnOnce`）。

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
| `sidebar` | post | 文章側欄的資料 `{ related: [{ title, url, date }], tags: [{ name, url, count }] }`，規則見下面「文章側欄」。每頁約 1.6 KB（最多約 1.8 KB） |
| `fbHref` | post、about | FB 留言的 data-href，跟基準逐字相同 |
| `cards` | home | 10 張 `{ title, url, date, category, categoryUrl, excerpt, readingTime, cover }` |
| `pager` | home、blog-index、taxonomy-list | `{ current, total, prevUrl, nextUrl, base, pages: [{ number, url }] }` |
| `heading` | 全部 | 頁面 H1 文字，例「分類：css」「封存：2014 / 5」；文章、about、法務頁是標題，首頁是站名，404 是 NotFound 的標題 |
| `postCount` | home、blog-index、taxonomy-list、nav-index | 這一頁所屬集合的篇數（全站、分類、標籤、某年、某月） |
| `listHtml` | `/categories/`、`/tags/`、`/archives/` | 分類清單、標籤雲、封存清單的 HTML（`lib/cards.mjs`），主題用 v-html 輸出 |
| `ads` | 全部 | 是否載入 AdSense loader（seo 依 shouldLoadAds 算；作者在 front matter 寫 `ads: false` 的頁一律不載入） |

列表頁的卡片是 paths loader 輸出的 HTML（`lib/cards.mjs` 的 `renderCards()`），class 名稱：`post-card`、`post-card__title`、`post-card__meta`、`post-card__excerpt`、`post-card__cover`。主題負責樣式。

## 文章側欄

`theme/components/PostAside.vue`：只有 post 頁有，`<aside aria-label="文章側欄">` 放在 `<article>` 外面（文字指紋 `<div class="prose">` 到 post-foot 不含側欄），每塊各有一個 h2，不輸出任何 id。全部在 SSR 輸出，JS 只負責目錄的目前段落。不放廣告元素：廣告只用 AdSense Auto ads，Hexo 側欄的贊助與廣告版位不重現。

錨點文字只放名稱，直接從 HTML 抽文字也不會黏在一起：相關文章的日期放在 `<a>` 外面（連結的 `::after` 蓋住整行，日期那塊也能點）；熱門標籤的篇數寫在 `data-count`，由 CSS 的 `::before` 顯示在名稱後面，替代文字是空字串（錨點文字和螢幕閱讀器都只有標籤名，跟 Hexo 側欄相同）；社群的名稱與帳號中間留一個空白。底部「接著讀」與 `/tags/` 標籤雲還是舊寫法（日期、篇數在連結裡），要不要統一由站長決定。

順序是本文目錄、相關文章、關於作者、我的著作、熱門標籤、社群：

| 區塊 | 資料來源 | 規則 |
|---|---|---|
| 本文目錄 | `page.headers`，`theme/utils/toc.mjs` 的 `tocItems()`，元件 `PostToc.vue` | h2 至少 3 個才出現；列 h2 與 h3，合計超過 24 個只列 h2；連結指向既有的標題 id，不另外產生 id。目前段落用 IntersectionObserver（判定線在視窗上緣往下 30%），標 `aria-current="location"`；強制色彩模式（Windows 高對比）改用 Highlight 色的框線標示 |
| 相關文章 | `frontmatter.sidebar.related`（`lib/pagedata.mjs` 的 `sidebarRelatedOf()`） | 最多 5 篇。分數是跟本篇共有的標籤數；同分時同分類的先，再依日期新到舊，最後依檔名，跟讀檔順序無關。只收分數至少 1 或同分類的文章，寧可少於 5 篇；排除本篇、上一篇、下一篇、底部「接著讀」的 3 篇。一篇都沒有時不輸出這塊（目前 7 篇） |
| 關於作者、我的著作、社群 | `theme/utils/aside.mjs` 的 `AUTHOR`、`BOOK`、`SOCIAL` | 內容照 Hexo 側欄。圖片有 width、height、`loading="lazy"`；站外連結另開分頁，帶 `rel="noopener"` 與螢幕閱讀器用的「（另開分頁）」 |
| 熱門標籤 | `frontmatter.sidebar.tags`（`popularTags()`） | 文章數最多的 20 個（同數依名稱），網址是合併後的小寫寫法 |

版面（`theme/styles/pages.css` 的「文章側欄」）：

- 1120px 以上且支援 subgrid：兩欄，本文維持 720px，側欄 288px。`.post-layout` 五列（hero、封面、本文、post-foot、接著讀），側欄從封面那列開始。目錄在本文那列裡 sticky，捲過本文就停；其餘各塊從 post-foot 那列開始（沒有目錄時從最上面），FB 留言長高不會推動它們。1100px 時本文擠不下 720px，所以斷點是 1120px。
- 目錄比視窗高時自己捲動（`overflow-y: auto`），不設 `overscroll-behavior: contain`：Chrome 在滑鼠停在目錄上時整頁會捲不動，目錄沒有超出也一樣。
- 小於 1120px 或不支援 subgrid：側欄排在文章與「接著讀」下方，目錄不顯示（排在文末用不到），其餘各塊兩欄（`columns: 2 300px`），手機一欄。
- 點擊目標至少 44px（熱門標籤的 chip 用 `::after` 補足），顏色只用已在 `contrast.test.mjs` 驗過的組合。

`scripts/audit-build.mjs` 的 `sidebar` 檢查：每篇文章恰好一個側欄、有 aria-label、不在文字指紋範圍內；沒有 adsbygoogle、`<ins>`、「廣告版位」、h1；目錄連結找得到 id；站外連結是 https，另開分頁要有 noopener；站內連結都存在；相關文章最多 5 篇、不重複、都是文章頁、不連回本篇、不跟上下篇與「接著讀」重複。

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
