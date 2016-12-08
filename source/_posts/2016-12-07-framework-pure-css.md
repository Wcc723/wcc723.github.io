---
layout: post
title: 鐵人賽 7 - CSS 框架架構參考 PURE CSS
category: css
tagline:
tags: [css, oocss]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/07_framework_purecss.png
published: true
---

在瞭解完 OOCSS 後，可以看看主流框架是不是有帶入其中之概念，接下來會介紹兩篇 PureCSS 與 Bootstrap，這兩者的簡單架構概念讓大家參考參考。

Pure CSS 算是很老牌的 CSS 框架，到目前使用者已少了許多，但架構到現在都很是非常直得學習，不需倚靠太多的工具，就能夠將 CSS 可用性發揮到最高，如果有朋友說要參考 CSS 的架構，相當值得學習的就是 PureCSS 及 Bootstrap。

<!-- more -->

## 架構簡介

Pure CSS 分為以下模組，每個模組都是獨立的 CSS 檔案，並沒有透過 Sass 或 Less 進行編譯，所以可以依據自己需求載入需要的模組。

* Base  
* Buttons
* Forms (Responsive)
* Forms (Non-Responsive)
* Grids (Responsive)
* Menus (Responsive)
* Menus (Non-Responsive)
* Tables

除此之外，他只有透過 grunt 這個工具將檔案串接在一起，並沒有做額外的編譯；如果需要做修改，由於沒有太複雜的編譯流程，對不熟悉編譯工具的開發者來說也是相當容易的。

另外還有 COMBO 版本，是已經合併以上全部的模組，官方有提供兩種 COMBO，分為有 RWD 、無 RWD 兩個版本。

## 樣式架構

Pure CSS 的樣式架構是我最喜歡的部份，他用相當精簡的 CSS Code 來呈現一個模組，到底有多神就使用 Button 模組來做介紹。

Button 原始碼連結：
https://unpkg.com/purecss@0.6.0/build/buttons.css

這是非壓縮版的原始碼，全部的按鈕行數不到 100 行(不壓縮，且包含註解)，在這些行數下也包含了不同的狀態。

一般載入的狀態：
{% raw %}
<p data-height="300" data-theme-id="0" data-slug-hash="MbGmdm" data-default-tab="html,result" data-user="Wcc723" data-embed-version="2" data-pen-title="Pure CSS Button" class="codepen">See the Pen <a href="http://codepen.io/Wcc723/pen/MbGmdm/">Pure CSS Button</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
{% endraw %}

範例中，我們在載入 CSS 後，只要參考文件就能夠將樣式呈現出來，所以就以上的兩個按鈕，只要各一行 HTML 就能解決了。

```html
<a class="pure-button" href="#">A Pure Button</a>
<a class="pure-button pure-button-primary" href="#">A Primary Button</a>
```

Pure CSS 自訂樣式 - Pure CSS 巧妙地使用 `透明度` 在處理元件的樣式，就以按鈕來說可以用以下方法來調整：

1. 複寫原有的樣式
2. 設定元件色彩，透過原有的透明度樣式來呈現按鈕狀態

{% raw %}
<p data-height="300" data-theme-id="0" data-slug-hash="LbmLGM" data-default-tab="html,result" data-user="Wcc723" data-embed-version="2" data-pen-title="Pure CSS Button" class="codepen">See the Pen <a href="http://codepen.io/Wcc723/pen/LbmLGM/">Pure CSS Button</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
{% endraw %}

Pure CSS 修改樣式、新增樣式的範例如上，每個樣式都僅需一個 CSS selector 就能搞定，而且不需要編譯。

```css
/* 複寫樣式 */
.pure-button {
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.16);
}

/* 設定元件色彩來自定義樣式 */
.pure-button-accent {
  color: white;
  background: #FF5E45;
}
```

這種透過透明度的方法在切換樣式能將 CSS 所需的程式碼降低非常多，而這也是 `結構與樣式` 分離的最佳案例。
在最新版的 Bootstrap v4 中的 Navbar 也有用相同的技巧在切換色彩，有興趣的朋友可以參考以下連結。

Bootstrap Navbar color theme: http://v4-alpha.getbootstrap.com/components/navbar/#color-schemes

## 結語

在現在 Sass、PostCSS 盛行的情況下，在製作多種樣式時都是透過工具去做運算，Pure CSS 僅提供 CSS 並運用 CSS 的特性讓其他開發者也能輕易自訂樣式，這也是我喜歡 Pure CSS 的部分。
