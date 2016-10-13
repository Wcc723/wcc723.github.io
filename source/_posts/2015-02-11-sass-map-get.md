---
layout: post
title: Sass map get
category: sass
tagline:
tags: [css, sass]
cssdemo: 2015-spring
jsdemo:
thumbnail: 2015-02-11-sass-map.png
published: true
---

去年有介紹sass模組的開發方式[連結](/sass/2014/02/14/sass-component/)，sass 3.3 釋出以後有更好的方式去執行，這篇來介紹快速且好管理的模組製作方法。

<!-- more -->

## 注意

這篇要介紹的是`sass map`，所以請先確認自己的sass版本是3.3以上，如果要確認自己sass版本，可以在Terminal輸入 `sass -v`就可以看到目前系統內的版本。

	$ sass -v


## 結果

先來看預期的結果，按鈕是類似bootstrap，但是我簡化了很多部分的程式碼(縮短比較好閱讀)，重點是在scss內的`$btn-config`，透過這config可以快速調整按鈕的樣式，如果有增減，也只需要調整config即可。

{% raw %}
<p data-height="268" data-theme-id="0" data-slug-hash="EaovPd" data-default-tab="result" data-user="Wcc723" class='codepen'>See the Pen <a href='http://codepen.io/Wcc723/pen/EaovPd/'>EaovPd</a> by Wcc723 (<a href='http://codepen.io/Wcc723'>@Wcc723</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"> </script>
{% endraw %}


## 開始

html的部分就只有這三段代表不同的按鈕，不同的地方只有`btn-xxx`用來套用不同按鈕樣式。

```html
<a href="#" class="btn btn-default">Button default</a>
<a href="#" class="btn btn-primary">Button primary</a>
<a href="#" class="btn btn-danger">Button danger</a>
```

按鈕中還有包含基本的樣式，這不是本篇的重點，大概看過就好。

```css
.btn {
  display: inline-block;
  margin-bottom: 0;
  text-align: center;
  vertical-align: middle;
  padding: 6px 12px;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
  text-decoration: none;
}
```

## Scss 重點開始

我長期以來都是寫sass格式的，但因為sass map的關係，最近開始改寫scss...。

Sass map的格式有點類似json，只是把`{}`改成了`()`，以下代表了三組按鈕的樣式設定檔(default, primary, danger)，每一組還有包含他的`class name`、`color`、`background`、`border-color`，清楚的標示可以讓未來更容易閱讀程式碼。

```sass
// 定義按鈕的不同狀態設定，類似json格式
$btn-config:(
	default:(
		class: 'default',
		color: #333,
		bg: #fff,
		border-color: #ccc
	),
	primary:(
		class: 'primary',
		color: #fff,
		bg: $brand-primary,
		border-color: darken($brand-primary, 0)
	),
	danger:(
		class: 'danger',
		color: #fff,
		bg: $brand-danger,
		border-color: darken($brand-danger, 0)
	)
);
```

透過sass的`$each`把`$btn-config`每一組設定帶出來，這方法有點類似jquery的`$.each`。接下來的`map-get`是sass map新的[function](http://sass-lang.com/documentation/Sass/Script/Functions.html#map_get-instance_method)，取出值以後，就像平常寫scss一樣，把變數寫在樣式內就完成了。

```sass
// 用$each 帶入設定值
@each $name, $value in $btn-config {
  $class: map-get($value, class); // 用map-get取出各個設定值
  $color: map-get($value, color);
  $bg: map-get($value, bg);
  $border-color: map-get($value, border-color);

  // 接下來將變數加到class內就完成了
  .btn-#{$class}{
    color: $color;
    background-color: $bg;
    border-color: $border-color;
    &:hover{
      background-color: darken($bg, 5%);
      border-color: darken($border-color, 5%);
    }
  }
}
```


## 延伸

如果後來發現按鈕的樣式不夠，其實只要改`$btn-config`就可以了，如果有興趣，試著把下面這段加到範例裡的`$btn-config`吧～。

```sass
dark:(
	class: 'dark',
	color: #fff,
	bg: #333,
	border-color: darken(#333, 0)
)
```

如果在html內加入這段，有看到黑色的按鈕代表成功了。

```html
<a href="#" class="btn btn-dark">Button dark</a>
```


再看一次範例。

{% raw %}
<p data-height="268" data-theme-id="0" data-slug-hash="EaovPd" data-default-tab="result" data-user="Wcc723" class='codepen'>See the Pen <a href='http://codepen.io/Wcc723/pen/EaovPd/'>EaovPd</a> by Wcc723 (<a href='http://codepen.io/Wcc723'>@Wcc723</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"> </script>
{% endraw %}
