---
layout: post
title: 鐵人賽 4 - OOCSS 容器與內容分離 (最佳實踐)
category: css
tagline:
tags: [css, oocss]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/04_oocss_header.png
published: true
---

結構與樣式分離，對於網頁的樣式設計是一種解放，所有元件的樣式組合搭配及擴增變得更自由。

這篇要介紹的是容器與內容分離，簡單來說我們可以把元件分為兩大類型：

- 容器型元件：如 `grid`、`card`、`form`
- 內容型元件：如 `button`、`input`、`progress-bar`

而不同類型的元件設計上應當分離，避免混寫限制元件的搭配。

<!-- more -->

容器：白話文來說是盛裝物品的器具，在這邊我們可以思考成可以裝其它元素的外元件。
內容：這裡解釋在容器內的元素。

以下圖來說，我們就區分為三個模組
1. 容器 A 與 元件 A：這兩者是一體的，元件 A 無法獨自在 容器 A 以外的環境單獨出現，他是 容器 A 的繼承。
2. 容器 B：這是一個單獨的容器，沒有額外的設定
3. 元件 B：這是一個單獨的元件(內容)，可以在任何容器下。

![](/images/2016_ironman/04_oocss_01.jpg)

在這個範例下，我們可以了解到 元件 B 不受到任何限制，可以自由的組裝在其他容器下，這也是 OOCSS 提到的元件就像是樂高一樣，可以依據任何需求做組裝，元件 B 正好符合這個概念。

## Bootstrap 的容器與內容

Bootstrap 是相當好的案例可以來說明容器與內容。以下圖來說按鈕與頁籤都是屬於 內容，而卡片是屬於容器，在 Bootstrap 的設計中都是屬於個別的元件，這些元件不會互相干擾，而且可以依據需求去組合。

![](/images/2016_ironman/04_oocss_02.jpg)

接下來這張範例圖就是將按鈕、頁籤放到卡片這個容器內。

![](/images/2016_ironman/04_oocss_03.jpg)

所以在設計元素的時候，如果是用以下的方式繼承就會限定元件的可用性，就以 OOCSS 的概念是需要避免這樣的設計，盡可能不要讓元件被限制在特定的容器下。

```css
/* 盡量不要這麼做 */
.card {
  …
}
.card .btn {
  …
}

/* 好的作法 */
.card {
  …
}
.btn {
  …
}
```

## 案例
上一回我們用結構與樣式分離的概念製作出一組按鈕，接下來在製作另一組模組 `card` ，按鈕模組除了可以獨立使用外，在 Card 內也是可正常運用。

{% raw %}
<p data-height="300" data-theme-id="0" data-slug-hash="EKwQEJ" data-default-tab="css,result" data-user="Wcc723" data-embed-version="2" data-pen-title="OOCSS (Demo 1)" class="codepen">See the Pen <a href="http://codepen.io/Wcc723/pen/EKwQEJ/">OOCSS (Demo 1)</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
{% endraw %}

```css
/* card */
.card {
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 2px;
  box-shadow: 3px 3px 3px rgba(black, .16);
  .card-head {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  .card-body ul {
    margin-left: 1em;
    margin-right: 1em;
    list-style: disc;
  }
  .card-body img {
    max-width: 100%;
  }
  .card-footer {
    margin-top: 15px;
    text-align: right;
  }
}
```

不過其中 `.card-body  ul` 這個 ul 就被限制住了，只有卡片內才能這樣顯示，此時就要思考是不是只有卡片內才需要這樣的 ul 顯示？或者將它拉出來更好？

就當下這個設計，我們其實可以略作調整，將 `ul` 及 `img` 拉出來製作，然元件的容器與內容分離。

這樣就學會了兩大 OOCSS 的觀念，而這兩個觀念下還有些細節可以注意，等到看完這幾天的介紹，就能掌握整個 CSS 模組的核心概念。
