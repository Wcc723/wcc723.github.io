# Hexo 基準線（2026-11-03）

部落格要從 Hexo 搬到 VitePress 1.6.4（同一個 repo `Wcc723/wcc723.github.io`，新分支 main）。搬家前先把目前線上版本的每個網址、每頁的 SEO 欄位和本文指紋記下來，搬家後逐頁對照：網址不能少、大小寫不能變，title、description、canonical、og:url、FB 留言的 data-href、標題錨點 id 和本文內容都要對得上，對不上的要能說出原因。

- 來源：`projects/wcc723.github.io` 的 `origin/master`，commit `7ccb8db93d4cb1ac28a3c7178d0314a86c002236`（2026-10-05 11:29:24 +08:00，「Site updated: 2026-10-05 11:29:23」）。2026-11-03 用 `git ls-remote` 確認遠端 master 就是這個 commit。
- 讀法：只用 `git ls-tree -r -z` 和 `git show <commit>:<path>` 讀 git 物件，沒有 checkout，沒有讀本機的 `public/` 或 `.deploy_git`。
- 重現性檢查（從 develop 重新 build 能不能得到同樣的產物）另寫在 [`../../repro-2026-11-03.md`](../../repro-2026-11-03.md)。

## 檔案

| 檔案 | 內容 |
| --- | --- |
| `urls.txt` | 線上每個網址的路徑，一行一個，依位元組排序。`index.html` 寫成結尾斜線的資料夾形式，大小寫照舊，非 ASCII 用 percent-encoding（與 Hexo 的 canonical 寫法相同）。共 669 行：樹裡 668 個檔案各一個，加上 GitHub Pages 對 `about/hexschool-traning.html` 另外提供的無副檔名網址 `/about/hexschool-traning`（它才是 canonical、sitemap 和 FB data-href 用的形式）。`/_headers` 也列在裡面，但線上是 404，見下方。 |
| `pages.json` | 657 個 HTML 頁各一筆，依 url 排序，欄位見下表。 |
| `sitemap-extra-urls.txt` | sitemap.xml 裡有、但樹裡沒有對應檔案的 4 個網址，給線上檢查一起驗。 |
| `sitemap.xml`、`atom.xml`、`content.json`、`search.xml`、`robots.txt`、`ads.txt`、`CNAME` | 從 origin/master 原封不動複製（已用 `git hash-object` 比對，與 git blob 完全相同）。 |
| `live-2026-11-03.json` | 2026-11-03 對 https://www.casper.tw 逐一 GET 的結果，摘要在最下面。 |

## pages.json 的欄位

每一筆是一頁。單值欄位取頁面裡第一個出現的值，找不到是 `null`；同一個 head 標籤出現不只一次時，欄位名稱會列在 `dupes`。屬性值都已解開 HTML 實體（例如 `&#x2F;` 變成 `/`）。

| 欄位 | 來源 |
| --- | --- |
| `url` | 依 `urls.txt` 的規則從檔案路徑算出 |
| `file` | 樹裡的檔案路徑 |
| `type` | 依路徑分類：`post`、`home`、`home-page`（/page/N/）、`archive`、`category`、`tag`、`tags-index`、`about` |
| `alias` | GitHub Pages 的無副檔名別名，只有 `about/hexschool-traning.html` 有 |
| `lang` | `<html lang>` |
| `title` | head 裡的 `<title>`（空白壓成一格） |
| `description` | `<meta name="description">` |
| `canonical` | `<link rel="canonical">` |
| `ogUrl`、`ogTitle`、`ogSiteName`、`ogDescription`、`ogType`、`ogImage` | 對應的 `og:*` meta |
| `robots` | `<meta name="robots">`，目前全站都沒有，所以都是 `null` |
| `publishedTime`、`modifiedTime` | `article:published_time`、`article:modified_time`。注意 `modifiedTime` 大多是作者電腦上的檔案修改時間，不是真正的更新日，見重現性檢查文件 |
| `jsonLdTypes` | head 裡每個 JSON-LD 的 `@type`，解析失敗記 `INVALID_JSON` |
| `fbCommentsHref` | `<div class="fb-comments">` 的 `data-href`，沒有留言框是 `null` |
| `h1` | 整個 body 裡每個 h1 的文字（陣列，可以看出沒有 h1 或有好幾個 h1） |
| `headingIds` | `<main>` 裡有 id 的 h1 到 h6，照出現順序；站外連進來的 `#錨點` 靠這些 id，Hexo 的 id 保留大小寫 |
| `textChars`、`textSha256` | 本文指紋，規則見下一節 |
| `dupes` | 出現不只一次的 head 欄位名稱 |

### 本文指紋怎麼算

1. 取本文範圍：文章頁和 about 頁是 `<div class="prose">` 到 `<div class="post-foot">`（沒有 post-foot 就到 `</article>`），不含標題區、標籤、上下篇和留言框；其他頁面（首頁、列表、封存、標籤）是整個 `<main>`。
2. 拿掉 HTML 註解和 `script`、`style`、`noscript`、`template` 的整段內容。
3. 拿掉所有標籤，解開 HTML 實體。
4. 刪掉所有空白字元（含換行和 `&nbsp;`），再做 Unicode NFC 正規化。
5. `textChars` 是結果的字元數（以 code point 計），`textSha256` 是結果的 SHA-256。

刪掉所有空白是故意的：Hexo 的 marked 開了 `breaks: true`，VitePress 的 markdown-it 預設不換行，`<br>` 和換行的差別不該讓指紋不同；真正的文字差異（少一段、多一個字、引號被 smartypants 換成彎引號）仍然會讓指紋不同。搬家後用同一個函式（`scripts/blog-baseline.mjs` 匯出的 `extractPage`）處理 VitePress 的產物再比對即可。

## 怎麼重跑

```bash
node scripts/blog-baseline.mjs          # 重寫 urls.txt、pages.json、sitemap-extra-urls.txt、七個副本與下方 baseline 段落
node scripts/live-check.mjs \
  --urls docs/projects/wcc723.github.io/baseline/hexo-2026-11-03/urls.txt \
  --urls docs/projects/wcc723.github.io/baseline/hexo-2026-11-03/sitemap-extra-urls.txt \
  --out docs/projects/wcc723.github.io/baseline/hexo-2026-11-03/live-2026-11-03.json \
  --readme docs/projects/wcc723.github.io/baseline/hexo-2026-11-03/README.md
node --test scripts/blog-baseline.test.mjs scripts/live-check.test.mjs
```

兩支腳本都只用 Node 內建模組，Node 22 以上可跑。baseline 讀的是 `origin/master` 這個 ref，重跑前若有 fetch 過，commit 可能已經不同，請看下方段落記的 commit。

## 搬家時要特別注意的現況

以下都是從這份基準線直接查到的事實，不是推測：

- **`/categories/CSS/` 的大小寫（線上已確認壞掉）**：樹裡的資料夾是 `categories/CSS/`（2016-10-13 的 commit `1d90ebe79b` 加進來後一直沒改名），但這 10 頁的 canonical、og:url、sitemap 都寫 `/categories/css/`，這 10 頁裡的分頁連結也都指向 `/categories/css/...`。原始碼裡 97 篇都是小寫 `category: css`，從 develop 重新 build 出來的資料夾也是小寫。線上 `/categories/CSS/` 是 200，`/categories/css/` 是 404；另外單獨 GET 了 `/categories/css/page/2/` 到 `/page/10/` 共 9 個，全部 404（2026-11-03T03:42Z，沒有存進 live JSON）。也就是這個分類的 canonical、sitemap 項目和分頁連結都指到 404。
- **三組大小寫相撞的標籤（線上已確認壞掉）**：`/tags/sass/`、`/tags/bootstrap/`、`/tags/vue/` 這三頁線上是 200，但 canonical 指向 `/tags/Sass/`、`/tags/Bootstrap/`、`/tags/Vue/`，h1 也是大寫版（例如「標籤：Sass」），代表檔案內容是大寫標籤那一頁（在不分大小寫的 macOS 檔案系統上，後寫的蓋掉先寫的）。樹裡沒有大寫的資料夾，sitemap 卻兩種都列，線上三個大寫網址都是 404。
- **`about/hexschool-traning`**：檔案是 `.html`，canonical、sitemap、FB data-href 都用無副檔名形式。線上兩種網址都直接回 200（不轉址），搬家後兩種都要繼續能開。
- **`/CNAME`**：在樹裡，線上是 404（有 x-github-request-id，是 GitHub Pages 回的）。GitHub Pages 用它設定自訂網域，但不把它當檔案提供。
- **`/_headers`**：由主題的 `scripts/cf-headers.js` 每次 build 產生，是給 Cloudflare Workers 靜態資產用的標頭設定檔（blog repo 的 CLAUDE.md 說 Worker 已不再提供 HTML），在樹裡但線上是 404，屬已知現象。樹裡沒有 `.nojekyll`，GitHub Pages 會先跑 Jekyll，而 Jekyll 預設不輸出底線開頭的檔案。
- **h1 不只一個的文章**：4 篇（清單在下方段落），第二個 h1 都在本文裡：3 篇是 Markdown 的一級標題（有錨點 id），`/css/2013/10/25/css-flex-2/` 是示範用的原始 HTML `<h1>內容標題</h1>`。
- **文章之間標題重複**：2 組（`SVG 簡介` 兩篇、`在 Ubuntu 上加入 Docker 環境並部署 Node.js 專案` 兩篇），後者兩篇的 description 也一樣。
- **沒有 description 的頁面**：只有 `/tags/`。

<!-- baseline:start -->
產生時間：2026-11-03T03:45:58.455Z（由 `node scripts/blog-baseline.mjs` 產生，請勿手改這一段）

### 來源

- repo：`projects/wcc723.github.io`，ref：`origin/master`
- commit：`7ccb8db93d4cb1ac28a3c7178d0314a86c002236`，commit 時間 2026-10-05T11:29:24+08:00，訊息「Site updated: 2026-10-05 11:29:23」

### 數量

- 樹裡的檔案：668（HTML 657，其他 11）
- HTML 依類型：post 364、home 1、home-page 36、archive 81、category 53、tag 119、tags-index 1、about 2
- 其他檔案：`CNAME`、`_headers`、`ads.txt`、`atom.xml`、`content.json`、`css/style.css`、`img/casper-avatar.webp`、`img/js-interview-cover.webp`、`robots.txt`、`search.xml`、`sitemap.xml`
- urls.txt：669 行 = 668 個檔案網址 + 1 個 GitHub Pages 無副檔名別名（`/about/hexschool-traning`）

### SEO 現況（從 pages.json 算出）

- 沒有 `<title>`：0 頁；沒有 meta description：1 頁（`/tags/`）
- 沒有 canonical：0 頁；沒有 og:url：0 頁
- canonical 不等於「https://www.casper.tw + 檔案網址」：14 頁（`/about/hexschool-traning.html`、`/categories/CSS/`、`/categories/CSS/page/10/`、`/categories/CSS/page/2/`、`/categories/CSS/page/3/`、`/categories/CSS/page/4/`、`/categories/CSS/page/5/`、`/categories/CSS/page/6/`、`/categories/CSS/page/7/`、`/categories/CSS/page/8/`、`/categories/CSS/page/9/`、`/tags/bootstrap/`、`/tags/sass/`、`/tags/vue/`）
- canonical 與 og:url 不同：0 頁（無）
- 有 robots meta：0 頁
- 同一個 head 標籤出現兩次以上：0 頁
- h1：沒有 h1 0 頁（無），恰好一個 653 頁，兩個以上 4 頁（`/css/2013/10/25/css-flex-2/`、`/gulp/2014/09/22/gulp-install/`、`/jekyll/2014/01/14/jekyll-disqus/`、`/js/2015/04/20/learn-reactjs/`）
- 標題重複（全站）：19 組共 131 頁；description 重複（全站）：19 組共 210 頁（多半是分頁列表）
- 文章頁之間標題重複：2 組共 4 頁（`/d3js/2014/10/01/Ironman-30-days-02/`、`/svg/2014/04/21/SVG-intro/`、`/development/2023/10/07/docker-container/`、`/development/2023/10/08/ubuntu-docker/`）
- 文章頁之間 description 重複：1 組共 2 頁（`/development/2023/10/07/docker-container/`、`/development/2023/10/08/ubuntu-docker/`）
- 有 FB 留言框：366 頁，其中 data-href 與 canonical 不同 0 頁（無）
- JSON-LD 解析失敗：0 頁；有 JSON-LD 的頁面 364 頁

### sitemap 與 feed

- sitemap.xml：468 個網址，其中 464 個在 urls.txt 裡，4 個不在（`/categories/css/`、`/tags/Bootstrap/`、`/tags/Sass/`、`/tags/Vue/`，另存 sitemap-extra-urls.txt）
- 不在 sitemap 的 HTML 頁：193 頁（home-page 36、archive 81、category 27、tag 49）
- sitemap 裡不是 https://www.casper.tw/ 開頭的網址：0 個
- atom.xml：20 個 entry；content.json：364 篇；search.xml：364 個 entry
- atom.xml 與 content.json 的文章網址不在 urls.txt 的數量：0
<!-- baseline:end -->

## 線上檢查

2026-11-03 跑了一次（下方自動產生的段落與 `live-2026-11-03.json`），清單是 `urls.txt` 669 個加 `sitemap-extra-urls.txt` 4 個，共 673 個。解讀：

- `urls.txt` 的 669 個：665 個 200、2 個 404（`/_headers` 已知，`/CNAME` 見上方）、2 個連線逾時（`UND_ERR_CONNECT_TIMEOUT`，重試一次仍失敗，是連線層的問題，不是網站回的狀態）。這 2 個（`/categories/canvas/`、`/development/2020/02/09/jest-async/`）在 2026-11-03T03:41Z 用同一支腳本單獨重查，都是 200 且有 x-github-request-id（重查結果沒有存進 live JSON）。所以樹裡的 668 個檔案加 1 個別名，實際能開的是 667 個，只有 `/_headers` 和 `/CNAME` 是 404。
- `sitemap-extra-urls.txt` 的 4 個（`/categories/css/`、`/tags/Bootstrap/`、`/tags/Sass/`、`/tags/Vue/`）全部 404，也就是 sitemap.xml 裡有 4 個 404 網址。
- 沒有任何 3xx。有回應的 671 個都帶 `server: cloudflare` 和 x-github-request-id（Cloudflare 在前、GitHub Pages 在後）；沒有 x-github-request-id 的 2 個就是上面連線逾時的那 2 個。
- atom.xml、sitemap.xml、search.xml、content.json 線上的位元組數與本資料夾的副本完全相同（18,512、67,013、3,111,894、145,678）。
- 這次網路偏慢：回應時間中位數約 1 秒，最長約 20 秒，673 個裡有 19 個要重試一次，整趟約 8 分鐘。

<!-- live:start -->
檢查時間：2026-11-03T03:32:42.682Z 到 2026-11-03T03:40:43.376Z（由 `node scripts/live-check.mjs` 產生，請勿手改這一段；原始資料 `live-2026-11-03.json`）

- 對象：https://www.casper.tw，GET、不跟隨轉址，並行 4、每件間隔 200 ms、逾時 20000 ms、Node v22.11.0
- 共 673 個網址：`urls.txt` 669 個（200 有 665 個）；`sitemap-extra-urls.txt` 4 個（200 有 0 個）
- 狀態碼：200 有 665 個、404 有 6 個、null 有 2 個；連線錯誤 2 個
- 沒有 x-github-request-id：2 個（`/categories/canvas/`、`/development/2020/02/09/jest-async/`）
- content-type：`text/html; charset=utf-8` 662 個、`text/plain; charset=utf-8` 2 個、`application/xml` 3 個、`null` 2 個、`application/json; charset=utf-8` 1 個、`text/css; charset=utf-8` 1 個、`image/webp` 2 個

非 200 的網址（8 個）：

| 路徑 | 清單 | 狀態 | location | 錯誤 |
| --- | --- | --- | --- | --- |
| `/CNAME` | urls.txt | 404 | 無 |  |
| `/_headers` | urls.txt | 404 | 無 |  |
| `/categories/canvas/` | urls.txt | 無 | 無 | UND_ERR_CONNECT_TIMEOUT |
| `/development/2020/02/09/jest-async/` | urls.txt | 無 | 無 | UND_ERR_CONNECT_TIMEOUT |
| `/categories/css/` | sitemap-extra-urls.txt | 404 | 無 |  |
| `/tags/Bootstrap/` | sitemap-extra-urls.txt | 404 | 無 |  |
| `/tags/Sass/` | sitemap-extra-urls.txt | 404 | 無 |  |
| `/tags/Vue/` | sitemap-extra-urls.txt | 404 | 無 |  |
<!-- live:end -->
