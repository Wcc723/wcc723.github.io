---
layout: post
title: Sass 模組開發
category: sass
tagline: sass沒有極限
tags: [css, sass]
cssdemo: 2014-spring
thumbnail: 2014-02-14_152727.png
published: true
---

最近社群上有人分享了一個連結，是關於sass模組製作的教學，大致看了一下，發現和我的方式頗為接近，所以就在這介紹我的Sass模組開發方式。

[http://www.sitepoint.com/sass-component-10-minutes/](http://www.sitepoint.com/sass-component-10-minutes/)

<!-- more -->

## 本篇重點

以按鈕模組為例，示範Sass模組開發。

## 效果展示

{% raw %}
<div class="demo d0214">
	<a href="#" class="btn-default">btn-default</a>
</div>

<div class="demo d0214">
	<a href="#" class="demo-btn">demo-btn</a>
	<a href="#" class="demo-btn Validation">demo-btn Validation</a>
	<a href="#" class="demo-btn Error">demo-btn Error</a>
	<a href="#" class="demo-btn Warning">demo-btn Warning</a>
	<a href="#" class="demo-btn Information">demo-btn Information</a>
</div>
{% endraw %}

	<a href="#" class="demo-btn">demo-btn</a>
	<a href="#" class="demo-btn Validation">demo-btn Validation</a>
	<a href="#" class="demo-btn Error">demo-btn Error</a>
	<a href="#" class="demo-btn Warning">demo-btn Warning</a>
	<a href="#" class="demo-btn Information">demo-btn Information</a>

以上是分為兩組的範例，上面那一組是模組預設值，而下方這組是透過`變數`以及`@each`來快速產生，透過這個方式，可以有效的管理CSS程式碼，以及增加開發速度。

## 模組開發流程

首先，分為兩個部分，一個是共通的屬性，另一部份是可變動的屬性；共通部分就是基本的格式，也是模組最基礎的屬性，
可變動的可以如顏色、大小、對齊方式等等，而本篇則是用顏色。

### 建立@extend 及@mixin

`@extend`就是模組的共通屬性，如果不清楚的，可以和下方的`@mixin`一起參考。

	%buttonDemo
		color: #fff
		text-decoration: none
		padding: .3em 1em
		display: inline-block
		text-align: center
		vertical-align: middle
		cursor: pointer
		text-shadow: -1px -1px 0 rgba(00,00,00,0.3)
		+border-radius(3px)
		+box-sizing(border-box)
		+box-shadow(inset 0 .1em 0 rgba(255, 255, 255, .2), 0 1px 2px rgba(0, 0, 0, 0.05))
		+transition(box-shadow .2s)		
		&:hover
			+box-shadow(inset 0 .1em .3em rgba(0, 0, 0, .3),0 1px 2px rgba(0, 0, 0, 0.05))
			color: #fff
		&:focus,&:active,&.current
			+box-shadow(inset 0 .1em .6em rgba(0, 0, 0, .4),0 1px 2px rgba(0, 0, 0, 0.05))

`@mixin`就是一個基本的模組，將顏色屬性先挑選出來，再透過Sass的運算可以產生許多樣式，而`@extend`可以避免CSS檔產生過多不必要的程式碼。

	$defaultColor: #107FC9 //預設色彩

	@mixin buttonDemo($className: btn-default,$color: $defaultColor)
		$darkenColor:  saturate(darken($color, 10%),15%)
		$lightenColor: saturate($color, 2%)
		.#{$className}
			@extend %buttonDemo
			border: 1px solid $darkenColor
			background-color: $lightenColor
			margin: 1px
			&:hover,&.current
				background-color: $darkenColor


{% raw %}
<div class="demo d0214">
	<a href="#" class="btn-default">btn-default</a>
</div>
{% endraw %}

到這部分就有一個基本的按鈕樣式。

## 利用@each 大量製作

	+buttonDemo(.demo-btn.Validation, #5cb85c)
	+buttonDemo(.demo-btn.Error, #d9534f)
	+buttonDemo(.demo-btn.Warning, #f0ad4e)
	+buttonDemo(.demo-btn.Information, #5bc0de)

到了這部分，其實我們可以利用上面的方式來產生多樣模組，但其實`.Validation`以及後方的色彩`#5cb85c`都是可以重複使用的，如果我們利用`$each`，除了在這一個模組會更好管理外，還可以用來製作其他模組。


首先，先定義基本的class名稱及色彩。[參考](http://getbootstrap.com/css/#less-variables)

	$button-types: (Validation, #5cb85c) (Error, #d9534f) (Warning, #f0ad4e) (Information, #5bc0de)


製作一個新的`@mixin`，利用$each將每一個class名稱及色彩套用至`buttonDemo`這一個@mixin內。

	@mixin DemoButtons($prefix: demo-btn)
		+buttonDemo($prefix, $defaultColor) //載入預設的樣式
		@each $button-type in $button-types
			$thisClass: nth($button-type, 1)
			$thisColor: nth($button-type, 2)
			$thisallClass: $prefix+"."+$thisClass
			+buttonDemo($thisallClass, $thisColor)

	+DemoButtons()

{% raw %}
<div class="demo d0214">
	<a href="#" class="demo-btn">demo-btn</a>
	<a href="#" class="demo-btn Validation">demo-btn Validation</a>
	<a href="#" class="demo-btn Error">demo-btn Error</a>
	<a href="#" class="demo-btn Warning">demo-btn Warning</a>
	<a href="#" class="demo-btn Information">demo-btn Information</a>
</div>
{% endraw %}

用這方式就可以完成sass模組，且包含了許多樣式。而這模組的架構，是我目前在測試的，有興趣的可以參考就好，畢竟CSS寫法相當多樣，只有適合沒有完美的寫法，下方另外提供codepen範例。


<iframe src="http://codepen.io/Wcc723/full/EfpiA" frameborder="0" width="100%" height="300px"> </iframe>
