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
```

Node 22.12 以上（`.nvmrc`）。

## 結構

| 路徑 | 內容 |
|---|---|
| `source/` | VitePress 的 srcDir |
| `source/_posts/` | 文章，檔名 `YYYY-MM-DD-<slug>.md`；網址由 rewrites 算出 `/<category>/<YYYY>/<MM>/<DD>/<slug>/` |
| `source/.vitepress/` | config、主題、建置用的程式 |
| `source/public/` | 原封不動輸出的檔案：CNAME、ads.txt、robots.txt，以及凍結的 search.xml、css/style.css、img/ |
| `baseline/hexo-2026-11-03/` | Hexo 基準：網址清單與每頁 SEO 欄位，audit 拿它比對 |
| `scripts/` | audit、遷移、圖片上傳 |

## 舊網址一字不改

- 文章路徑、大小寫、點、尾斜線、canonical、og:url、FB 留言 data-href、標題 id 全部照舊。
- 日期一律從檔名取，以 Asia/Taipei 為準，不做時區轉換。
- 分類 `css` 輸出到 `/categories/CSS/`（大寫，全站唯一的例外）。標籤一律小寫，不能有只差大小寫的兩個標籤。
- 新增根路徑（新頁、新分類）前，先在 workspace 跑 `node scripts/scan-paths.mjs --path <name>`。

## 寫文章

- front matter：`title`、`category`、`tags`、`description`；`published: false` 不輸出。
- `updated`：只有實質改寫內容時才加或改。補 description、改圖片路徑、改格式都不算。修改日期（JSON-LD、`article:modified_time`、sitemap lastmod）都用它，沒有就用發布日。
- 圖片放 R2：貼到 `r2-uploads/posts/<檔名>/`，`npm run images:upload` 上傳，內文寫 `https://img.casper.tw/posts/...`。

## 提交

- commit 和 push 只在站長要求時做。
- commit 訊息結尾加：`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`
