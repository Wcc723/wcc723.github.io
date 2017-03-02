---
layout: post
title: 鐵人賽 26 - 實戰心法 - 應避免的 Sass @extend
category: css
tagline:
tags: [css, Sass ]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/26_heart_header.jpg
published: true
---

Sass 的 `@extend` 可以將相同的樣式整理再一起，在其他語言來說是非常帥氣的技法，但在 CSS 中請警慎使用。

就如同本篇鐵人賽一開始所介紹到的 OOCSS 概念，在撰寫 CSS 時要盡可能符合兩個原則，結構與樣式分離、容器與內容分離，所以到這邊為止還是要貫徹這個概念，當使用 `@extend` 時如果會造成這個缺陷時，請避免使用。

<!-- more -->

## 帥氣的 `@extend`

`@extend` 能夠將重複的樣式整理再一起，以下面的範例來說，我就將 `.clearfix` 與 `.row` 中所需要的清除浮動做整理。

編譯前：

```
%clearfix {
  &:after {
    content: " ";
    display: table;
    clear: both;
  }
}

.clearfix {
  @extend %clearfix;
}

.row {
  @extend %clearfix;
}
```

編譯後：
```
.clearfix:after, .row:after {
  content: " ";
  display: table;
  clear: both;
}
```

{% raw %}
<p data-height="265" data-theme-id="0" data-slug-hash="qqGKYP" data-default-tab="css" data-user="Wcc723" data-embed-version="2" data-pen-title="clearfix sass extend" class="codepen">See the Pen <a href="http://codepen.io/Wcc723/pen/qqGKYP/">clearfix sass extend</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
{% endraw %}

這手法可以有效減少散落在各處的樣式，無論他在第幾行，都會被往前統一整理。

## 錯誤的案例

本篇繼續上一篇的範例，上一篇中我們是將 `.btn` 作為獨立的 Class，且此 Class 身負作為按鈕結構的重任。

在 Sass 中，我們會先新增一個 `%btn` 來作為 `placeholder selectors`，而後再 Class 的部分透過 `@extend` 將 `%btn` 合併，那麼結構的部分也會合併到每一個按鈕內。

```
%btn {
  // 結構
  display: inline-block;
  padding: 6px 12px;
  margin-bottom: 0;
  font-size: 14px;
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  background-image: none;
  border: 1px solid transparent;
  border-radius: 4px;
  &:hover, &:focus {
    color: #333;
    background-color: #e6e6e6;
  }
}

@each $name, $value in $btn-config {
  $class: map-get($value, class);
  $color: map-get($value, color);
  $bg: map-get($value, bg);
  $border-color: map-get($value, border-color);

  .btn-#{$class}{
    @extend %btn;
    @include button-variant($color, $bg, $border-color);
  }
}
```

此作法 HTML 會看起來相當簡潔。

```html
<div class="section">
  <button class="btn-default">這是一個按鈕</button>
  <button class="btn-primary">這是一個按鈕</button>
  <button class="btn-accent">這是一個按鈕</button>
</div>
```

{% raw %}
<p data-height="265" data-theme-id="0" data-slug-hash="JbqZOJ" data-default-tab="css,result" data-user="Wcc723" data-embed-version="2" data-pen-title="應該避開的 @extend" class="codepen">See the Pen <a href="http://codepen.io/Wcc723/pen/JbqZOJ/">應該避開的 @extend</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
{% endraw %}

雖然說，這樣的在寫的時候看似非常簡潔，但其實所產出的 CSS 檔案非常之肥大，所有樣式結構的 Class 會被拉到前面在寫再一起，無形之中會重複大量的 Class name，如以下所產出的 `disabled` 的樣式。

```css
.btn-primary.disabled, .btn-primary.disabled:hover, .btn-primary.disabled:focus, .btn-primary.disabled.focus, .btn-primary.disabled:active, .btn-primary.disabled.active, .btn-primary[disabled], .btn-primary[disabled]:hover, .btn-primary[disabled]:focus, .btn-primary[disabled].focus, .btn-primary[disabled]:active, .btn-primary[disabled].active, fieldset[disabled] .btn-primary, fieldset[disabled] .btn-primary:hover, fieldset[disabled] .btn-primary:focus, fieldset[disabled] .btn-primary.focus, fieldset[disabled] .btn-primary:active, fieldset[disabled] .btn-primary.active {
  background-color: #009AFF;
  border-color: #009AFF;
}
```

## 結語

其實學到現在，要安全點其實是避開 `@extend` 不使用，就連 Bootstrap 的原始碼中也不怎麼使用 `@extend` 這手法，但為什麼本篇會特別提出呢...!?因為我以前就是敗在這上的啊 Q_Q。
