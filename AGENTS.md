# 卡斯伯 Blog（www.casper.tw）

先讀 workspace 的 `../../AGENTS.md`：跨專案規則、路由鐵則、文案規則都在那裡，這份只放這個 repo 自己的事。整體計畫在 workspace 的 `docs/architecture/site-architecture-v2.md`。

## 這是什麼

- GitHub Pages 使用者站 `Wcc723/wcc723.github.io`，網域 www.casper.tw，前面有 Cloudflare。
- 2026-11-03 起在 `main` 分支從 Hexo 搬到 VitePress 1.6.4（P1：只建置、不部署）。P2 切換後由 GitHub Actions 部署。
- 同一個主機名底下還有 53 個 GitHub Pages 專案站（`/<repo>/`），所以 www 一直留在 GitHub Pages，不改用 Worker。

## 分支

| 分支 | 內容 |
|---|---|
| `main` | VitePress 原始碼。P2 起 push `main` 觸發 Actions 部署 |
| `develop` | Hexo 原始碼，凍結。分支點 `461bb62fe2` |
| `master` | 最後一版 Hexo 產物，凍結，是回退用的分支 |

- `hexo d` 已退役：任何人都不再執行，`master` 不再更新。
- 這個 repo 不放任何 wrangler 設定檔（`wrangler.*`），audit 找到就失敗。`wrangler` 套件只給圖片上傳腳本用。

## 指令

```bash
npm run dev            # 本機預覽
npm run build          # vitepress build，接著自動跑 scripts/audit-build.mjs
npm run preview        # 預覽 build 結果
npm test               # 腳本與設定的單元測試
npm run migrate        # scripts/migrate-hexo.mjs：Hexo 內文轉換，可重跑，也可只跑指定檔案
npm run images:upload  # r2-uploads/ 上傳到 R2（img.casper.tw）
npm run build:preview  # 外語首頁草稿：CS_STAGE=preview，寫到 source/.vitepress/preview-dist/，不跑 audit
npm run preview:intl   # 本機開 preview-dist（VitePress 預設 http://localhost:4173），網址加 /en/ 這類；重跑 build:preview 之後要重開它，它只在啟動時讀檔案清單，新的資產檔會回 404，頁面被換成「這頁找不到」
npm run i18n:check     # 外語首頁文案的 G1 與各語系狀態（prebuild 也跑）
npm run i18n:report    # 每個語系、每個 key 的審稿狀態
npm run i18n:stamp     # 蓋章；rebase 用 node scripts/i18n.mjs rebase
npm run site:card      # 重新產生 site-card.json
```

Node 22 LTS，至少 22.12（package.json 的 engines）。`.nvmrc` 寫 `lts/jod`：`nvm install` 與 CI 的 setup-node 都拿最新的 22.x。

## 結構

| 路徑 | 內容 |
|---|---|
| `source/` | VitePress 的 srcDir |
| `source/_posts/` | 文章，檔名 `YYYY-MM-DD-<slug>.md`；網址由 rewrites 算出 `/<category>/<YYYY>/<MM>/<DD>/<slug>/` |
| `source/.vitepress/` | config、主題、建置用的程式 |
| `source/.vitepress/site.config.mjs` | 站台設定：外殼模式 `shell` 與外語首頁 `home`（見下面「外語首頁」） |
| `source/.vitepress/i18n/` | 外語首頁的文案 `home/<code>.json` 與 `glossary.json` |
| `source/[locale]/` | 外語首頁的動態路由，paths 回 `plan.pages`，P1 是空的 |
| `source/.vitepress/theme/shared/` | workspace `shared/` 的副本（含 `data/tools.json`、`data/categories.json`），由 workspace 的 `scripts/shell-sync.mjs --write` 寫入，不手改（`.sync.json` 記雜湊） |
| `site-card.json` | 對 workspace 的契約：`shell` 與已上線的外語首頁，`npm run site:card` 產生，不手改 |
| `source/public/` | 原封不動輸出的檔案：CNAME、ads.txt、robots.txt，以及凍結的 search.xml、css/style.css、img/ |
| `baseline/hexo-2026-11-03/` | Hexo 基準：網址清單與每頁 SEO 欄位，audit 拿它比對 |
| `scripts/` | audit、遷移、圖片上傳；`i18n.mjs`（外語首頁文案）、`site-card.mjs`、`dist-diff.mjs`（比對兩份 dist） |

## 舊網址一字不改

- 文章路徑、大小寫、點、尾斜線、canonical、og:url、FB 留言 data-href、標題 id 全部照舊。
- 日期一律從檔名取，以 Asia/Taipei 為準，不做時區轉換。
- 分類 `css` 輸出到 `/categories/CSS/`（大寫，分類裡唯一的例外）。
- 新標籤一律小寫。既有、只有一種寫法的大寫標籤照舊（`AI`、`Claude Code`、`Cloudflare`，網址是 `/tags/AI/` 這類舊網址），改成小寫會改掉舊網址。不能有只差大小寫的兩個標籤，audit 會擋下。
- 新增根路徑（新頁、新分類）前，先在 workspace 跑 `node scripts/scan-paths.mjs --path <name>`。

## 外語首頁（P1 做好、全部關著）

主站首頁有外語版 `/<code>/`，文章與其他頁只有繁中（workspace 的決策 `0009`，規格 `docs/research/2026-11-04-site-home-i18n/spec.md`）。開一個語系照 workspace 的 `docs/runbooks/open-a-site-locale.md`，一版只開一個。

- `site.config.mjs` 是唯一的開關：
  - `shell`：`'legacy'` 是這個 repo 自己的頁首頁尾（P1、P2）；`'shared'` 是 `theme/shared/shell` 的共用元件（S 版起），要先有 zh-tw 外殼字串的章。
  - `home.locales`：正式開放的語系，P1 是空陣列。列進來就要過全部開放關卡（G1 到 G9，`lib/site-home.mjs`），否則建置失敗；上線後不能拿掉。
  - `home.roadmap`：要準備的語系（en、ja、ko、de、zh-cn、es），只在 `npm run build:preview` 產生。`home.reviewers`：審稿人 id 與是否母語。`home.waivers`：事實性文字過期時的暫時豁免，只在站長當次指示時加。
- 頁型 `site-home`：`[locale]/index.md` 經 `pagetype.mjs` 判成 site-home，`pagedata.mjs` 寫 `fm.site`，版面是 `theme/pages/SiteHomePage.vue`（不寫 `<style>`，樣式在 `theme/styles/site-home.css`，選擇器限定在 `.cs-shome` 或外語根元素；工具卡 `.cs-toolcard*` 只放 `theme/styles/toolcards.css`，`/` 的工具清單 `HomeTools.vue` 也用它）。元件只顯示，文字與連結都在 `lib/site-home.mjs` 算好。外語首頁的工具有 `feature`（tools.json 的 intro、highlights、cta、images）時畫成介紹區塊 `.cs-toolfeature`，`/` 一律只畫卡片。
- `__CS_SHARED_SHELL__`：`lib/site-home.mjs` 的 `effectiveShell()` 決定，preview 一律是共用頁首頁尾（含語系選單），正式建置照 `site.config.mjs` 的 `shell`。是 false 時 `Layout.vue` 只畫舊頁首頁尾，P1 產物不變。
- `__CS_SITE_HOME__`：`config.mts` 依 plan 用 Vite `define` 設定。沒有外語首頁要產生時是 false，`Layout.vue` 不登記 `SiteHomePage`，P1 的 dist 因此不變。VitePress 的全站 CSS 只有一支，非同步 chunk 的樣式也會併進去，所以不要在別處 import `SiteHomePage.vue` 或 `site-home.css`。
- 文案：`i18n/home/<code>.json`，正本是 `en.json`，格式與逐 key 審稿跟工具範本相同（`theme/shared/shell/i18n/messages.mjs`）。佔位符只有 `{site}`、`{author}`；文案不寫對全部工具成立的保證，glossary 擋。**agent 不自己蓋章**，只在審稿人當次明確指示時代跑 `npm run i18n:stamp -- --locale <code> --by <審稿人 id>`。
- preview：`npm run build:preview` 寫到 `source/.vitepress/preview-dist/`（`.gitignore` 擋掉），外語首頁 noindex、根元素多 `cs-preview`；每一頁都用共用頁首頁尾，head 多一段本機預覽用的連結腳本（`lib/preview-links.mjs`，站內連結留在 localhost，工具網址除外）；2026-11-05 起沒有頂端提示條。關卡沒過只印警告；CI 或 `GITHUB_ACTIONS` 是 true 時直接失敗。`dist/` 永遠只有正式產物：outDir 與 head 腳本都只跟著 `plan.stage === 'preview'`，audit L7 另外擋 `cs-preview`、外語首頁的 robots meta 與那段腳本。
- `site-card.json`：`shell` 等於 `site.config.mjs`，`siteHomes` 等於 plan 的 `published`；`npm test` 與 audit 驗它沒過期。workspace 的 `scripts/site-data.mjs` 讀部署分支上的這份。
- 部落格自己的頁一律用 plan 的 `published` 當已上線的外語首頁，不讀 `theme/shared/data/tools.json` 的 `siteHomes`（那份會落後一版，只給工具用）。
- 語系代碼（en、ja、ko、de、es、zh-cn、zh-tw）不能當分類、標籤或文章 slug 的路徑段：VitePress 判斷語系時沒有錨定開頭，`posts.mjs`、`pagedata.mjs` 與 audit 遇到就失敗。
- 改 `theme/` 或 `lib/` 之後，用 `node scripts/dist-diff.mjs <改之前的 dist> source/.vitepress/dist` 確認 P1 產物沒變。

## 寫文章

- front matter：`title`、`category`、`tags`、`description`；`published: false` 不輸出。
- `updated`：只有實質改寫內容時才加或改。補 description、改圖片路徑、改格式都不算。修改日期（JSON-LD、`article:modified_time`、sitemap lastmod）都用它，沒有就用發布日。
- 圖片放 R2：貼到 `r2-uploads/posts/<檔名>/`，`npm run images:upload` 上傳，內文寫 `https://img.casper.tw/posts/...`。
- 發新文章不用改 audit（站長 2026-11-06）：Hexo 基準沒有的已發布文章，audit 自動當成新文章（`newPostsOf`）。舊頁照樣跟基準逐頁比；新文章只驗自己的 canonical、og:url、FB data-href、title、description、h1、發布時間。首頁、分類、標籤、封存的卡片扣掉新文章後，要跟基準的順序相同。atom、content.json、sitemap 照時間把新文章插進去。
- 對照基準的單元測試（`source/.vitepress/lib/*.test.mjs`）讀 `test-fixture.mjs` 的 `SOURCE_DIR`，它是不含新文章的基準視圖。新文章的日期一定要晚於基準日（2026-11-03），否則 `posts.test.mjs` 會失敗：不在基準裡又比基準早，代表舊文章的網址被改了。

## 提交

- commit 和 push 只在站長要求時做。
- commit 訊息結尾加：`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
