---
layout: post
title: CSS 失控的 Margin top
category: css
tagline:
tags: [css]
cssdemo:
jsdemo:
thumbnail: 2016/06/collapsing-margins-04.jpg
published: true
---

失控的 margin-top 是指在使用 margin 時常出現的問題，內元素的 margin 被外層所吸收，導致無法正確的顯示，這我們稱為 **Collapsing margins**，本篇來教大家怎麼應對這個問題。

<!-- more -->

## 情境

在製作 Banner 的時候，通常需要一個 Logo 在畫面的左上，於是乎我們就會準備一個 div 把美美的 logo 往裡面塞。

![](/images/2016/06/collapsing-margins-01.png)

如圖所示，我們的 Logo 還希望離上方有些為的距離，依邏輯來說物件離邊緣要有距離，我們就會幫他補上 `margin`，於是乎就會出現如下的問題。

<p data-height="265" data-theme-id="0" data-slug-hash="JKYNOp" data-default-tab="result" data-user="Wcc723" data-embed-version="2" class="codepen">See the Pen <a href="http://codepen.io/Wcc723/pen/JKYNOp/">Collapsing margins (for blog)</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

仔細看看上面所發生的問題，內元素的 margin 沒有起了作用，而是被外層所吸收。

![](/images/2016/06/collapsing-margins-03.png)

## 失控的 Margin top

![](http://i.imgur.com/Q3cUg29.gif)

在遇到這個問題時，如果不熟的情況下就會說：「Bug 啦！」，通常只能用各種~~拋開羞恥心~~其它的方式去解決這個問題，但只要拿抓住發生的原因，就能輕易的去克服它。

這個問題在 w3c 有提到這問題稱為「[Collapsing margins](https://www.w3.org/TR/CSS21/box.html#propdef-margin)」，我將這部分縮減為以下幾點：

1. 內外層均為 "塊狀" 元素。
2. 外層塊狀元素沒有 border、padding、overflow。
3. 內層第一個塊狀元素(空元素不算)，不包含 float、absolute。

所以如果要避開發生這個問題，就是避免存在以上這些問題，比如說不使用塊狀元素、外層加入padding、內層加入 float 等等，以下就列出一些解決方案。

<p data-height="265" data-theme-id="0" data-slug-hash="GqpYde" data-default-tab="result" data-user="Wcc723" data-embed-version="2" class="codepen">See the Pen <a href="http://codepen.io/Wcc723/pen/GqpYde/">Collapsing margins (resolve for blog)</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

這也是我們在與學員之間的問答中常遇到的，這次找個機會寫個文章跟大家分享分享。
