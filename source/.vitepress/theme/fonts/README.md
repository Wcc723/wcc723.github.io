# 自架字型

主題自己帶的拉丁子集字型，跟著 Vite 打包成雜湊檔名，不載入外部字型 CSS。

| 檔案 | 字型 | 範圍 | 來源 |
|---|---|---|---|
| `nunito-latin.woff2` | Nunito，可變字重 700 到 900 | Google Fonts 的 latin 子集 | `fonts.gstatic.com/s/nunito/v32/`（2026-11-03 下載） |
| `jetbrains-mono-latin.woff2` | JetBrains Mono，可變字重 400 到 500 | Google Fonts 的 latin 子集 | `fonts.gstatic.com/s/jetbrainsmono/v24/`（2026-11-03 下載） |

- 兩個字型都是 SIL Open Font License 1.1，授權全文在 `OFL-Nunito.txt`、`OFL-JetBrainsMono.txt`。
- 中文不自架：Noto Sans TC 全字集太大，改用讀者電腦上的字（Noto Sans TC、蘋方、微軟正黑體）。
- `@font-face` 在 `../styles/fonts.css`，`unicode-range` 跟 Google Fonts 的 latin 子集相同，中文字不會觸發下載。
