---
layout: post
title: 鐵人賽 24 - 實戰心法 - 自幹 Grid System
category: css
tagline:
tags: [css, Bootstrap]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/24_heart_header.jpg
published: true
---

自己本身是不常自幹 Grid，但透過自幹會了解更細的運作原理，grid system 和其他元件不太一樣，他是屬於外容器型的元件，一層包覆著一層變化性相當高，如果不熟悉的情況下會容易造成跑版。

<!-- more -->

## Grid System 結構

以下的 Grid System 是類似 Bootstrap 3 以後的結構，這結構最難以理解的部分是網格之間的 $gutter 運作，它透過反覆的 margin、 padding 補回空間，讓此 grid 的彈性發揮到最高。

灰色部分是網格中欄的區域，以下面這範例來說佔了 4 欄，為了呈現 欄 與 欄 之間的間隔，欄會左右增加 padding 讓內容保留左右的間隔。

![](/images/2016_ironman/24_grid_1.png)

但是 欄 所增加的 padding ，最終會影響到最外層的 .row、.container 向外擴增，所以 .row 與 .container 一則使用負值的 margin，另一則用 padding 補回這段空間。

![](/images/2016_ironman/24_grid_2.png)

結構分為以下

* .container: 最外層的容器，作為限制最大寬度用，另外還有 padding 補回部分的寬度
* .row: 包覆 欄(.col) 的容器，除了提供負值的 margin 補回間隔空間外，還有清除 欄(.col) 的浮動之功用
* .col-{num}: 所有的欄位，可以從 1 ~ 12，透過 Sass 可以自訂所需的欄數。

## Sass 與 Grid

如果要快速產生 Grid System，建議使用 Sass 的運算，許多重複、迴圈的部分可以輕鬆很多。

技巧說明：
* 透過 `%grid-system-col` 及 `@extend %grid-system-col`; 可以將 col 重複的部分合併在一起
* `@for $i from 1 through 12` 這段可以直接運算出 col 從 1 到 12 (最終的數值可以另外修改)
* `@media (max-width: 767px)` 在小於 767 的裝置下版型會做改變

```css
$gird-end: 12;
$gutter: 30px;

%grid-system-col {
  position: relative;
     min-height: 1px;
     padding-left: $gutter / 2;
     padding-right: $gutter / 2;
     float: left;
}

* {
  box-sizing: border-box;
}
.container {
  padding-left: $gutter / 2;
  padding-right: $gutter / 2;
  margin: 0 auto;
  max-width: 960px;
  @media (max-width: 767px) {
    float: none;
    width: auto;
  }     
}
.row {
  margin-left: - ($gutter / 2);
  margin-right: - ($gutter / 2);
}
.row:after {
  content: "";
  display: table;
  clear: both;
}
@for $i from 1 through $gird-end {
  .col-#{$i} {
    @extend %grid-system-col;
    width: (100% *($i/$gird-end));
    @media (max-width: 767px) {
      float: none;
               width: auto;
    }     
  }
}

.box{
  height: 100px;
  background-color: #ccc;
}
```


原始碼範例: [http://codepen.io/Wcc723/pen/ENMEqY/](http://codepen.io/Wcc723/pen/ENMEqY/)

## 結語

在套用其他人開發的 grid system 之前，不妨先自己是寫看看，然候修改其中的程式碼這樣更能夠知道每個環節的用途。
