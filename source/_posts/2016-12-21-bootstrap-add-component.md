---
layout: post
title: 鐵人賽 21 - Bootstrap 透過 Sass 新增自定義元件
category: css
tagline:
tags: [css, Bootstrap]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/21_bootstrap_header.jpg
published: true
---

許多人在使用 Bootstrap 時，如果有需要新增、調整，都是寫在 CSS 的後方或是另開一個新檔透過 "覆蓋" 的特性來新增、調整。先前的文章已經介紹了如何調整 Bootstrap 的 CSS，透過變數的方式，我們可以調整整體的樣式設定，而 "新增" 我們也應該用相同的方法來製作，這樣的方法更有一致性，且能夠調用 Bootstrap 原有的變數及 @mixin。

<!-- more -->

## 新增一個元件

範例連結
https://github.com/Wcc723/ironman-gulp-sass/tree/v.0.7.component

先前的文章介紹到 Sass 的架構，所以我們的專案結構會做些許的調整，目前已經有了 `all.scss` 以及 `helpers/_variables.scss` 這兩隻 .scss 檔案，接下來新增 `components` 資料夾，預計新增的元件就會放在這裡。

```
scss/
|- all.scss
|
|– helpers/
|   |– _variables.scss   # Sass Variables
|
|– components/
|   |– _card.scss        # 預計新增的模組
```

元件來源：https://github.com/doabit/semantic-ui-sass/blob/master/app/assets/stylesheets/semantic-ui/views/_card.scss

我在 Sematic UI 上找到了一個現成的 Card 模組，這個模組所使用的變數不多，刪除後面的段落後，就可以直接加入 `components/_card.scss` 內。

參考加入內容：https://github.com/Wcc723/ironman-gulp-sass/blob/v.0.7.component/source/scss/components/_card.scss

```css
/*--------------
      Card
---------------*/

.ui.cards > .card,
.ui.card {
  max-width: 100%;
  position: relative;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -webkit-flex-direction: column;
      -ms-flex-direction: column;
          flex-direction: column;
  width: 290px;
  min-height: 0px;
  background: #FFFFFF;
  padding: 0em;
  border: none;
  border-radius: 0.28571429rem;
  box-shadow: 0px 1px 3px 0px #D4D4D5, 0px 0px 0px 1px #D4D4D5;
  -webkit-transition: box-shadow 0.1s ease, -webkit-transform 0.1s ease;
  transition: box-shadow 0.1s ease, -webkit-transform 0.1s ease;
  transition: box-shadow 0.1s ease, transform 0.1s ease;
  transition: box-shadow 0.1s ease, transform 0.1s ease, -webkit-transform 0.1s ease;
  z-index: '';
}

/* 略 .. */
```

新增元件的心法在前面幾個章節有詳細的描述，本篇就直接運用半成品來說明，在 `_card.scss` 加入後，如果直接運行 `gulp` 是不會看到 card 加入至你的 CSS 內，所以必須要在 `all.scss` 補上以下內容確認載入才行。

```css
@import "helpers/variables";
@import "bootstrap";

@import "components/card";
```

此時，執行 `gulp` 沒有出錯的情況下就會看到 Card 模組已經載入了。以下範例為調整後的按鈕色彩及卡片模組。


![](/images/2016_ironman/21_bootstrap_01.png)

## 結語

透過這一段的教學，大家能夠更靈活的使用 Bootstrap，其實這段流程並沒有那麼複雜，只要稍作練習，就能夠彈性的運用這些技能，且能有效地增加工作效率。
