# VitePress 設定與主題的分工

P1 的模組介面。每個檔案只有一個負責的模組，其他模組只讀不改；介面要改時先改這份文件。

## 建置流程

```
config.mts
  rewrites            ← lib/posts.mjs     _posts/<檔名>.md → <category>/<YYYY>/<MM>/<DD>/<slug>/index.md
  markdown            ← lib/markdown.mjs  breaks、code_inline v-pre、模擬 Hexo 的標題 id
  transformPageData   ← lib/pagedata.mjs  先跑：頁型、網址、麵包屑、卡片、上下篇（寫進 frontmatter）
                      ← lib/seo.mjs       後跑：title、description、canonical、og、JSON-LD、cssdemo（寫進 frontmatter.head）
  transformHtml       ← lib/seo.mjs       依 ADS_MODE 與頁型拿掉 AdSense loader
  head                ← lib/seo.mjs       全站 head：GA4、FB Pixel、AdSense meta 與 loader、atom
                      ← theme/head.mjs    主題的 head：字型、favicon、深淺色防閃 script
  buildEnd            ← lib/feeds.mjs     atom.xml、content.json
  sitemap             ← lib/feeds.mjs     transformItems
動態路由（paths loader） ← lib/pagedata.mjs 的資料 + lib/cards.mjs 的卡片 HTML
主題                   ← theme/          只讀 frontmatter 與 params，不 import lib/
```

`lib/` 只在 Node 端執行（config、paths loader），主題不能 import `lib/`，文章摘要才不會進主題 chunk。

## 共用

- `theme/shared/`：從 workspace 的 `shared/tokens/`、`shared/shell/` 複製過來，不手改（`site.mjs` 的 SITE_TITLE_LEGACY、ADS_MODE、shouldLoadAds、stripAdsLoader；`tokens.css` 的 v4 token）。`lib/` 也從這裡 import。
- `lib/posts.mjs`：文章索引 `loadPosts(srcDir)`，每篇有 `file`、`src`、`date`、`year`、`month`、`day`、`slug`、`category`、`title`、`description`、`tags`、`updated`、`thumbnail`、`photo`、`cssdemo`、`ads`、`url`、`content`；另有 `categoryDir()`（css → CSS）、`tagSlug()`、`toAbsolute()`、`SITE_URL`。
- `lib/pagetype.mjs`：`pageTypeOf(relativePath)`，頁型名稱跟 `site.mjs` 的 AD_PAGE_TYPES 一致。

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
| `breadcrumbs` | 首頁、404 以外 | `[{ name, url }]`，最後一層沒有 `url` |
| `post` | post | `{ date, category, categoryUrl, tags: [{ name, url }], readingTime, cover, updated }` |
| `prev`、`next` | post | `{ title, url }` 或 `null`，方向和文字跟 Hexo 的 post-nav 相同 |
| `related` | post | 同分類 3 篇 `[{ title, url }]` |
| `fbHref` | post、about | FB 留言的 data-href，跟基準逐字相同 |
| `cards` | home | 10 張 `{ title, url, date, category, categoryUrl, excerpt, readingTime, cover }` |
| `pager` | home、blog-index、taxonomy-list | `{ current, total, prevUrl, nextUrl, base }` |
| `heading` | 列表、索引頁 | 頁面 H1 文字，例「分類：css」「封存：2014 / 5」 |
| `ads` | 全部 | 是否載入 AdSense loader（seo 依 shouldLoadAds 算） |

列表頁的卡片是 paths loader 輸出的 HTML（`lib/cards.mjs` 的 `renderCards()`），class 名稱：`post-card`、`post-card__title`、`post-card__meta`、`post-card__excerpt`、`post-card__cover`。主題負責樣式。

## 對等基準

`baseline/hexo-2026-11-03/`：`pages.json`（每頁 title、description、canonical、og、h1、標題 id、文字指紋）、`urls.txt`、`atom.xml`、`sitemap.xml`、`content.json`。差異都要能說出原因；已知的預期差異：

- `/categories/CSS/` 這 10 頁的 canonical、og:url、分頁連結改成大寫（站長 2026-11-03 決定）。
- `/tags/sass/`、`/tags/bootstrap/`、`/tags/vue/`：合併成小寫，title、h1、canonical 都是小寫版，分頁變多。
- `article:modified_time` 與 JSON-LD dateModified：front matter `updated`，沒有就用發布日。
- JSON-LD：BlogPosting 改成計畫的新格式（author、publisher 指向 Person 的 @id），加上 BreadcrumbList 等。
- 沒寫 description 的舊頁：description 與 og:description 用凍結的舊值（`lib/legacy-descriptions.json`，從基準產生），新文章一律自己寫 description。
