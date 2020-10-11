---
layout: post
title: 手把手自訂你的 Bootstrap 樣式
category: development
tagline:
tags: [css, scss, bootstrap]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_23.jpg?alt=media&token=57512023-4c18-42df-a2b6-e1521dc8caa8
published: true
---

Bootstrap 在第四版以後在介紹文檔，說明自己是一個函式庫而不是框架。樣式的框架代表載入後都是基於此架構開發，無論是否喜歡特定的內容，都需要先全盤接受後再自行調整；而函式庫代表你可以選用自己喜歡的部份，並且調整成合適的樣式，相對於框架來說有更高的彈性。

本篇將會依據 Bootstrap 文檔及實戰的經驗，與大家分享開發中常用的客製化技巧，讓大家可以輕鬆的客製 Bootstrap 樣式。

對於客製化，你也可能會想問到：

Q: 為什麼要客製化？
客製化可以使 Bootstrap 更符合專案的風格樣式。

Q: 用覆蓋不行嗎？一定要客製化嗎？
就經驗上來說，覆蓋通常會缺少許多的狀態，如按鈕的 hover, active, focus 等等，並且容易使樣式缺少一致性。

Q: 編譯？Bootstrap 不是 CSS 嗎？
Bootstrap 的 `.css` 檔案是編譯後的結果，它原始檔案是屬於 `.scss` 的結構，本文只會針對其中的變數檔案進行介紹，不需要會 `.scss` 也可以進行調整喔。

Q: 客製化環境是不是很複雜，如果沒有 gulp、webpack 使用經驗是否就無法？
不會，本章節介紹的方式僅需要使用 VSCode 即可（有安裝 Node.js 更好，但不強制）。

## 建立環境
本範例會使用 VSCode 及其相關套件，相關連結可參考：

- [VSCode](https://code.visualstudio.com/)：主要的文字編輯器
- [LiveSass complier](https://marketplace.visualstudio.com/items?itemName=ritwickdey.live-sass)：這是用來編譯 Bootstrap scss 的工具
- [一分鐘，將你的 VSCode 官方中文化](https://wcc723.github.io/development/2019/12/01/vscode-chinese/)，英文版用不慣嗎？試試看這個方法 

確保已經安裝好 VSCode 及 LiveSass complier 就準備繼續往下進行囉，接下來依據以下步驟建立專案：

1. 創建專案資料夾於 VSCode 中（這會影響套件是否能正確編譯）
2. 建立以下檔案分別是 index.html 及 all.scss（建議在另一個資料夾內）

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_7_%E4%B8%8A%E5%8D%8810_17.png?alt=media&token=f6594db7-149e-49bc-a14f-35c9470d609c)

### 下載 Bootstrap 原始碼

在準備編譯以前，需要先將 Bootstrap 載入至電腦內，載入的方式有兩種：
1. 使用 npm 下載（推薦
2. 直接到 GitHub 下載

#### 方法一：使用 npm 下載

只要在 node.js 環境中輸入以下程式碼即可：

```
npm install bootstrap
```

接下來在專案內會增加 `node_modules/bootstrap` 的資料夾，並且內部包含 Bootstrap 的原始碼，其中的 `scss` 資料夾就是本次編譯會使用到的內容。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F9E224B11-6D10-4022-978B-E7BB7AD4E6E4.png?alt=media&token=3b8b89c2-06dd-40d2-9765-e3a91350ef35)

#### 方法二：直接下載

先進入 Bootstrap 官方的 Github [儲存庫](https://github.com/twbs/bootstrap/)，進入後先調整 tags 進入指定的版本，本範例是以 Bootstrap 4.5.x 為主（第四版以後差異不大），

![本範例選擇 4.5.2 版](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_7_%E4%B8%8A%E5%8D%8810_24.png?alt=media&token=2b19f186-4ba0-4c1d-a0e3-b2bfd8c71ade)

接下來下載原始檔案，並且將 scss 資料夾移至剛剛所建立的專案資料夾內。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_7_%E4%B8%8A%E5%8D%8810_26.png?alt=media&token=6786e5e1-31fb-4d10-8539-0753b48ad9e7)

## 開始準備編譯
接下來環境準備差不多，已經可以開始準備進行編譯，而本範例中的編譯會參考 [官方文件](https://getbootstrap.com/docs/4.5/getting-started/theming/) 及自己實戰上的經驗，為了讓客製化更為便利、快速，所以我將官方的方法略作調整，讓變數的查找上更為便利。

#### 步驟一：複製 `_variables.scss` 變數

在 `node_modules/bootstrap` 資料夾內可以找到 `scss` 資料夾（如果是自行下載也可依據置放的路徑進行尋找），該資料夾內可以找到 `_variables.scss` 的檔案：

1. 先找到 `_variables.scss` 的檔案
2. 將檔案複製到 `stylesheets` 資料夾內 

![我自己會習慣另外建立一個 `helpers` 資料夾，用來放所有的變數、mixins(本範例不會用到)。](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_7_%E4%B8%8A%E5%8D%8810_34.png?alt=media&token=1ee042f5-d050-4d1f-af52-523b75549543)

說明：這個步驟是避免直接調整外部原始資源，開發的檔案**總是會與外部資源分開管理**。

#### 步驟二：將變數、Bootstrap 資源引入

打開一開始建立的 `all.scss` 檔案，依序置入以下程式碼，其中 `/node_modules/bootstrap/` 的路徑請依據你的專案進行配置，如果是自行下載結構上可能略有不同。

```scss
// Required
@import "../node_modules/bootstrap/scss/functions"; // 必要的方法
@import "helpers/variables"; // 自行定義的變數路徑
@import "../node_modules/bootstrap/scss/mixins";

@import "../node_modules/bootstrap/scss/bootstrap"; // Bootstrap 完整原始碼
```

這段資源的載入順序是來自於官方文件，文件中是依序載入官方的資源後另外進行客製，本範例則是將**_variables.scss 的變數進行替換**。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FB75C6DFC-C67C-4672-9335-64DFDBD6AF16.png?alt=media&token=cd43d60a-6a8f-4542-b0e1-7b5b87664fea)

> 相對於逐一客製，直接調整 `_variables.scss` 是更為便捷的

#### 步驟三：開始編譯你的 Bootstrap

環境都準備完成以後就可以開始進行編譯，VSCode 下方有 [LiveSass complier](https://marketplace.visualstudio.com/items?itemName=ritwickdey.live-sass) 套件的編譯工具，在畫面的右下角可找到 `Watch Sass` 的字眼，按下後即可進行編譯。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_7_%E4%B8%8A%E5%8D%8810_42.png?alt=media&token=f0ab172f-6a36-451d-9d92-5cbe1bfec614)

編譯成功後可在 `stylesheets` 資料夾內找到 `all.css` 的檔案。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_7_%E4%B8%8A%E5%8D%8810_43.png?alt=media&token=6db73c5b-a677-4283-99a5-7678fab10f61)

打開 `all.css` 檔案，請先確保該檔案的上方可看到 Bootstrap 的字眼，其中也會包含所引入的版本號。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FEA03809A-56E3-44D5-ADE2-E6401A585842.png?alt=media&token=16b6e100-528d-4982-a919-4a7085bb9b79)

接下來，將 `index.html` 引入 `all.css` ，到此步驟環境就算是建立完成，你的頁面已經可以開始使用 Bootstrap 惹。

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="stylesheets/all.css">
</head>
```


#### 步驟四：客製化你的樣式

回到 `_variables.scss` 的檔案內，可以看到非常多的樣式變數，別看到這麼多的變數就感到緊張，如果你熟悉 Bootstrap ，會發現這些變數名稱與 Bootstrap 的元件名稱（或樣式）是一致的。

其中，可以找到 `$theme-colors` 的變數名稱，這是 Bootstrap 所有主題的色彩，你可以任意替換其中的顏色，甚至是增加色彩都是沒有問題的，以此範例中我們調整部分色彩以及加入一個色彩。
```scss
$theme-colors: map-merge(
  (
    "primary":    orange,     // 替換的色彩
    "secondary":  $secondary,
    "success":    $success,
    "info":       $info,
    "warning":    $warning,
    "danger":     $danger,
    "light":      $light,
    "dark":       $dark,
    "hex":        #69F0AE     // 新增的色彩，並使用 hex 這個變數
  ),
  $theme-colors
);
```

只要維持 `Watch Sass` 開啟的狀態，儲存檔案後 Live Sass 都會自動進行編譯。最後，在 HTML 檔案中可以測試所有的主體色就能看到替換後的結果，以此範例來說，按鈕的色彩就進行了替換及新增。
```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-hex">Hex Button</button>
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FF8052AFA-ACBC-4E79-A082-6C6C0AB8A97D.png?alt=media&token=6b01010e-3b0e-4c0b-9c21-0f2198791ff6)

## 結語
Bootstrap 是令人又愛又恨的樣式庫，透過它能夠快速的建立一個網站，因為這個優點，全球有近千萬的網站都使用 Bootstrap，許多網站都使用的情況下，此樣式更容易被人記住，也因此會產生「你的網站很 Bootstrap」、「這個樣式缺少變化」的感覺。

所以，會建議使用 Bootstrap 時多利用客製化的方式，讓你的網站不會顯得那麼 "Bootstrap"，讓這個函式庫不僅加速你的開發，更能增添許多豐富性。