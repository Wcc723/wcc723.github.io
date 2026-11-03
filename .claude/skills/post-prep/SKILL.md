---
name: post-prep
description: >-
  收尾一篇部落格文章準備發布：把貼到 r2-uploads 的圖片上傳到 Cloudflare R2 並把參照改寫成 img.casper.tw 網址、
  需要時用 Codex 產封面圖並設為 thumbnail、檢查並補齊 front matter 欄位，最後條列回報做了哪些事。
  當使用者說「處理這篇文章 / 準備發文 / 這篇可以發了嗎 / 上傳文章圖片 / 幫這篇產封面 / 檢查 front matter」時使用。
  僅適用於本部落格（VitePress，www.casper.tw，圖片走 R2 img.casper.tw）。
---

# 文章處理（post-prep）

一篇文章發布前的收尾四步。全程用**繁體中文**回報。動手前先「確定目標文章」，做完務必「回報」（第 4 步）。

規則的正本：這個 repo 的 `AGENTS.md`（「舊網址一字不改」「寫文章」）與 workspace 的 `AGENTS.md`。這份只寫收尾的步驟，兩邊不一致時以 AGENTS.md 為準。

## 先確定目標文章

依序判斷要處理哪一篇，`<X>` 一律指文章檔名去副檔名（如 `2026-07-07-anthropic-loop-engineering`），它同時是 R2 路徑前綴 `posts/<X>/`：

1. 使用者指定了檔名或路徑：用它。
2. 否則看 `r2-uploads/posts/<X>/` 哪個資料夾有待上傳的圖，對應 `source/_posts/<X>.md`。
3. 仍不確定：用 `git status`、最近修改的 `source/_posts/*` 推斷，並跟使用者確認後再動手。

## 1. 上傳圖片

```bash
npm run images:upload
```

- 它會把 `r2-uploads/**` 同步到 R2（object key = 相對於 r2-uploads 的路徑），把文章裡對應的相對路徑（VS Code 內建貼圖插入的 `../../r2-uploads/…`）改寫成 `https://img.casper.tw/<key>`，成功後刪掉本機暫存。
- 後端自動偵測：有 `.env`（R2 API 金鑰）走 aws-sdk；沒有就用 wrangler OAuth（要先 `npx wrangler login`）。
- 記下輸出：**上傳幾張、改寫幾處**。有失敗就回報是哪張，該張本機檔會保留（可以重跑補傳）。
- `r2-uploads/` 是空的：沒有待上傳的圖，跳過這一步。
- 不覆蓋、不刪除 R2 上既有的物件（workspace 鐵則），不要用 `--force`。

## 2. 封面圖（thumbnail）

先看文章 front matter 的 `thumbnail:`：

- **已有值**：跳過（除非使用者要求重產）。
- **空的**：用 Codex 產一張。生圖機制與雷點（`$imagegen` prefix 必要、`-s workspace-write`、產出在 `~/.codex/generated_images/<uuid>/ig_*.png`、**用 mtime 找新檔不要 `ls -t | head`**）請照 **codex-cli-image** skill。

產圖時**套用本站編輯風，而且不要有文字**（prompt 的主題描述依該文內容自己寫）：

```
$imagegen <一句描述本文主題的封面畫面>. Flat modern editorial vector illustration,
warm palette: cream paper background hex f7f4ee, deep vermilion red hex b5332a as the
primary accent, charcoal ink details, subtle paper grain, generous negative space,
centered, wide 16:9 banner. Absolutely no text, no letters, no numbers, no words,
no watermark, no border.
```

接著：

1. Read 產出的 PNG，確認畫面合理（構圖、沒有文字、配色對）。
2. 複製到 `r2-uploads/posts/<X>/cover.png`，再跑一次 `npm run images:upload` 上傳。
3. 把 front matter 的 `thumbnail:` 設成 `https://img.casper.tw/posts/<X>/cover.png`。

## 3. 檢查並補齊 front matter

讀文章 front matter，依下表檢查。**能有把握從內文推斷的直接幫忙填**（填什麼要在回報寫出來），不確定或屬於個人選擇的**給建議**讓使用者決定；**絕不亂編 `title`**。

| 欄位 | 規則 |
| --- | --- |
| `title` | 必填。空的：回報請使用者提供，不要自己編。 |
| `category` | 必填，只能用白名單裡的分類（`scripts/data/categories.json`，audit 會擋）。依內文推斷，或沿用站上既有分類。新分類是新的根路徑，要站長核可並先在 workspace 跑 `scan-paths`。 |
| `tags` | 至少 1 個，寫成 `tags: [a, b]`。**新標籤一律小寫**；沿用既有標籤時照站上原本的寫法（例如 `AI`、`Cloudflare`）。不能跟既有標籤只差大小寫，audit 會擋。 |
| `description` | **必填**：SEO 的 meta description 與 og:description（`source/.vitepress/lib/seo.mjs` 讀這個）。新文章沒寫，build 會失敗。依內文寫 1 到 2 句摘要填上。 |
| `thumbnail` | 封面（見步驟 2）。空著時，列表卡片與 og:image 改用內文第一張圖。 |
| `published` | 不寫或 `true` 都會輸出；`false` 不輸出（不進 dist、sitemap、atom）。 |
| `updated` | 只有實質改寫內容時才加或改；補 description、改圖片路徑、改格式都不算。 |
| `date` | **不寫**。日期只從檔名的 `YYYY-MM-DD-` 取（`source/.vitepress/lib/posts.mjs`），寫了也沒作用；網址由檔名與分類算出，發布後不能再改檔名。 |

**注意**：

- `tagline` 是 Hexo 時代的舊欄位，現在沒有程式讀；要寫摘要請填 **`description`**。
- 填 `description`、圖片 alt 等**繁體中文內容一律用全形標點**（，。、（）：等），程式碼、網址、英數例外；不用破折號。

## 4. 回報（必做）

最後**條列具體做了什麼**，例如：

- 圖片：上傳 N 張到 R2、改寫 M 處參照為 `img.casper.tw`（有失敗要點名）。
- 封面：產了新封面（附 R2 網址）並設為 thumbnail，或沿用既有、跳過。
- front matter：填了哪些欄位（附實際填入的值）、哪些建議使用者自己補、哪些原本就 OK。
- 其他需注意的地方（例如 `npm run build` 的警告或 audit 失敗的項目）。

## 備註

- 圖片工作流見 AGENTS.md「寫文章」；上傳工具在 `scripts/`。
- R2 公開網域 `img.casper.tw`，object key 就是網址路徑（`posts/<X>/<檔名>`）。
- **別把圖片放在 `source/` 底下**：VitePress 會把它打包或原樣輸出進 dist；圖片一律 `r2-uploads/` 上傳到 R2。
- 本 skill 只做「單篇收尾」，不負責部署。部署只走 git：push `main` 後由 GitHub Actions 建置與部署（P2 起），而且只在站長要求時 push；不執行 `npm run deploy`、`wrangler deploy`、`hexo d`。
