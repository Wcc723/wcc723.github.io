---
name: post-prep
description: >-
  收尾一篇 Hexo 文章準備發布:把貼到 r2-uploads 的圖片上傳到 Cloudflare R2 並把參照改寫成 img.casper.tw 網址、
  需要時用 Codex 產封面圖並設為 thumbnail、檢查並補齊 front-matter 欄位,最後條列回報做了哪些事。
  當使用者說「處理這篇文章 / 準備發文 / 這篇可以發了嗎 / 上傳文章圖片 / 幫這篇產封面 / 檢查 front-matter」時使用。
  僅適用於本 Hexo 部落格(casper-2026 主題、圖片走 R2 img.casper.tw)。
---

# 文章處理(post-prep)

一篇 Hexo 文章發布前的收尾四步。全程用**繁體中文**回報。動手前先「確定目標文章」,做完務必「回報」(第 4 步)。

## 先確定目標文章

依序判斷要處理哪一篇,`<X>` 一律指文章檔名去副檔名(如 `2026-07-07-anthropic-loop-engineering`),它同時是 R2 路徑前綴 `posts/<X>/`:

1. 使用者指定了檔名/路徑 → 用它。
2. 否則看 `r2-uploads/posts/<X>/` 哪個資料夾有待上傳的圖 → 對應 `source/_posts/<X>.md`(或 `.html`)。
3. 仍不確定 → 用 `git status` / 最近修改的 `source/_posts/*` 推斷,並跟使用者確認後再動手。

## 1. 上傳圖片

```bash
node tools/images-upload.mjs
```

- 它會把 `r2-uploads/**` 同步到 R2(object key = 相對於 r2-uploads 的路徑)、把文章裡對應的相對路徑(VS Code 內建貼圖插入的 `../../r2-uploads/…`)改寫成 `https://img.casper.tw/<key>`,成功後刪掉本機暫存。
- 後端自動偵測:有 `.env`(R2 API 金鑰)走 aws-sdk;沒有則用 wrangler OAuth(需已 `wrangler login`)。
- 記下輸出:**上傳幾張、改寫幾處**。有失敗就回報是哪張、且該張本機檔會保留(可重跑補傳)。
- `r2-uploads/` 若為空 → 沒有待上傳的圖,跳過本步。

## 2. 封面圖(thumbnail)

先看文章 front-matter 的 `thumbnail:`:

- **已有值** → 跳過(除非使用者要求重產)。
- **空的** → 用 Codex 產一張。生圖機制與雷點(`$imagegen` prefix 必要、`-s workspace-write`、產出在 `~/.codex/generated_images/<uuid>/ig_*.png`、**用 mtime 找新檔不要 `ls -t | head`**)請照 **codex-cli-image** skill。

產圖時**套用本站編輯風、且不要有文字**(prompt 的主題描述依該文內容自己寫):

```
$imagegen <一句描述本文主題的封面畫面>. Flat modern editorial vector illustration,
warm palette: cream paper background hex f7f4ee, deep vermilion red hex b5332a as the
primary accent, charcoal ink details, subtle paper grain, generous negative space,
centered, wide 16:9 banner. Absolutely no text, no letters, no numbers, no words,
no watermark, no border.
```

接著:
1. Read 產出的 PNG 確認畫面合理(構圖、無文字、配色對)。
2. 複製到 `r2-uploads/posts/<X>/cover.png`,再跑一次 `node tools/images-upload.mjs` 上傳。
3. 把 front-matter `thumbnail:` 設成 `https://img.casper.tw/posts/<X>/cover.png`。

## 3. 檢查並補齊 front-matter

讀文章 front-matter,依下表檢查。**能有把握從內文推斷的直接幫忙填**(填什麼要在回報寫出來),不確定或屬個人選擇的**給建議**讓使用者定;**絕不亂編 `title`**。

| 欄位 | 規則 |
| --- | --- |
| `title` | 必填。空的 → 回報請使用者提供,不要自己編。 |
| `category` | 建議填。依內文推斷(如 `development`、`design`),或沿用站上既有分類。 |
| `tags` | 至少 1 個。依主題推斷候選(格式 `tags: [A, B]`),填上或建議。 |
| `description` | **SEO 用的 meta description(head.ejs 讀這個)。** 空的 → 依內文寫 1–2 句摘要填上。 |
| `thumbnail` | 封面(見步驟 2)。若仍空著,主題會 fallback 到內文第一張圖。 |
| `published` | 應為 `true`。 |
| `date` | 通常靠檔名日期前綴 `YYYY-MM-DD-` 解析;若 `npm run build` 產出的日期/路徑不對,再補 `date:` 欄位。 |

**注意**:
- `tagline` 是舊欄位、主題不讀;要寫摘要請填 **`description`**(不是 tagline)。
- 填 `description`、圖片 alt 等**繁體中文內容一律用全形標點**(，。、（）：等),程式碼／網址／英數例外。

## 4. 回報(必做)

最後**條列具體做了什麼**,例如:

- 圖片:上傳 N 張到 R2、改寫 M 處參照 → `img.casper.tw`(有失敗要點名)。
- 封面:產了新封面(附 R2 網址)並設為 thumbnail,或沿用既有 / 跳過。
- front-matter:填了哪些欄位(附實際填入的值)、哪些建議使用者自己補、哪些原本就 OK。
- 其他需注意的地方(如 build 警告)。

## 備註

- 完整圖片工作流見 CLAUDE.md「圖片與 R2」;上傳/遷移工具都在 `tools/`。
- R2 公開網域 `img.casper.tw`,object key === URL 路徑(`posts/<X>/<檔名>`)。
- **別把圖片留在 `source/` 內**(會被 Hexo 複製進 `public/`);圖片一律 `r2-uploads/` → R2。
- 本 skill 只做「單篇收尾」;不負責 build/deploy(那是 `npm run deploy`)。
