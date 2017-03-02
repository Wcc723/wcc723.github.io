---
layout: post
title: 鐵人賽 17 - Bootstrap 自定義樣式超簡單
category: css
tagline:
tags: [css, Bootstrap]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/17_bootstrap_header.jpg
published: true
---

在導入框架至網站時，還要考慮框架是否符合網站風格以及往後的維護性。Bootstrap 雖然設計上是要給開發者直接運用的，但實際上他所設計的彈性非常之高，也很適合做客製化，甚至 fork 作為公司團體的 Style Guide。

<!-- more -->

本篇範例：https://github.com/Wcc723/ironman-gulp-sass/tree/v.0.7.component

## 複製 Variables

Bootstrap 所有設定都是放在 `_variables.scss` 這隻檔案下，但要學會怎麼修改其實沒有那麼困難，最簡單的方式就是將以下路徑的 `_variables.scss` 複製到專案目錄下的 `./source/scss`，這邊我個人是更習慣放在 `helpers` 資料夾內，算是寫 Sass 的習慣。

```
bower_components/bootstrap-sass/assets/stylesheets/bootstrap/_variables.scss

// 複製到
/source/scss
```

接下來我們將 `./source/scss/all.scss` 打開後加入 `@import "helpers/variables";` 再次執行 gulp ，如果沒有跳任何錯誤代表正確。

```css
@import "helpers/variables";
@import "bootstrap";
```

## 修改 變數

打開 Bootstrap 變數稍微閱讀一下其實會發現非常好懂，以下色彩這段來說，分為灰色系列色與品牌系列色，而品牌系列色就是我們看到 Bootstrap 各個元件的主要配色。

```
//== Colors
//
//## Gray and brand colors for use across Bootstrap.

$gray-base:              #000 !default;
$gray-darker:            lighten($gray-base, 13.5%) !default; // #222
$gray-dark:              lighten($gray-base, 20%) !default;   // #333
$gray:                   lighten($gray-base, 33.5%) !default; // #555
$gray-light:             lighten($gray-base, 46.7%) !default; // #777
$gray-lighter:           lighten($gray-base, 93.5%) !default; // #eee

$brand-primary:         darken(#428bca, 6.5%) !default; // #337ab7
$brand-success:         #5cb85c !default;
$brand-info:            #5bc0de !default;
$brand-warning:         #f0ad4e !default;
$brand-danger:          #d9534f !default;
```

然後每一個變數的後方都會接上一個 `!default` 在後方做為預設，所以在修改變數時需要同時將 `!default` 移除，請參考以下範例：

```
$brand-primary:         #0275d8; //darken(#428bca, 6.5%) !default; // #337ab7
$brand-success:         #5cb85c !default;
$brand-info:            #5bc0de !default;
```

加入一個新色彩 `#0275d8` 並將原本色彩註解在後方，這時候在執行 `gulp` 就能看到結果。

原色彩

![](/images/2016_ironman/17_bootstrap_02.png)

經調整，類似於 Bootstrap 4 的色彩

![](/images/2016_ironman/17_bootstrap_01.png)


像這樣的配色就比較接近於 Bootstrap 4 的色彩，用這個方法就可以輕易地修改 Bootstrap 中各個元件中的樣式變數，修改就是這麼樣的容易，只要修改一些變數就能完成。
