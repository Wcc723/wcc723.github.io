---
layout: post
title: 效能更好的banner animation
category: css
tagline:
tags: [css, sass]
thumbnail: 2013-12-19-banner-01.png
---
之前有一篇介紹利用background-position製作動態的banner，不久後就接到效能不好的問題，所以我就重新用另一種方式製作，發現效能有明顯的提升，也很有成就感，本篇就介紹不同的動態banner作法。
<!-- more -->
## 本篇重點
利用css transform的方式，去改善動態banner的效能。(由於本篇主要是CSS3，所以會用sass作範例。)

#### Demo

[iframe 連結](http://codepen.io/Wcc723/full/wFrCn)

<iframe src="http://codepen.io/Wcc723/full/wFrCn" frameborder="0" height="320" width="100%"></iframe>

## 原理
這是利用transform配合animation來進行位移。

	+keyframes("banner-slider")
	//建立一個keyframe
		from
			+transform(translate3d(0, 0, 0))
			//起始點
		to
			+transform(translate3d(image-width("banner-01.png"), 0, 0))
			//位移x，值為圖片的寬度

而如果直接套用，則會有另一個問題，就是圖片是位移了，但是不夠大。如下圖，紅框假設是使用者所見到的位置，淺色的部分是目前的圖片，黑色是期望有出現，但並沒有的顯示的圖片；因為這個問題，所以需要另外再補上一張圖片。

![demo1](/images/2013-12-19-banner-01-2.png)

在這邊我是利用偽元素`:pseudo-element`來複製出所需要的圖片，目的就是要在目前的左方先補上一張相同的圖片。

![demo2](/images/2013-12-19-banner-01.png)


## 製作

由於製作方式不同，所以html的結構也有所改變，目前的html如下。

	<div class="banner">
	<div class="banner-wrap">
		<span></span>
	</div>
	</div>

1. class="banner" 主要是用來定位，以及裁切多餘的部分
2. class="banner-wrap" 主要用來做動畫
3. span 圖片的位置

### Sass
首先製作keyframe的部分

	//由於compass 目前沒有animation，所以可以自己做animation的功能
	=keyframes($name) //keyframes @mixin
		@-webkit-keyframes #{$name}
			@content
		@-moz-keyframes #{$name}
			@content
		@-ms-keyframes #{$name}
			@content
		@keyframes #{$name}
			@content

	=animation($content) //animation @mixin
		-webkit-animation: $content
		-moz-animation: $content
		-o-animation: $content
		animation: $content

	+keyframes("banner-slider")
	//建立一個keyframe
		from
			+transform(translate3d(0, 0, 0))
			//起始點
		to
			+transform(translate3d(image-width("banner-01.png"), 0, 0))
			//位移x，值為圖片的寬度

	//這部分我原本是用translate3d去做
	//後來改成2D效果及效能也是差不多的

class的樣式如下

	.banner
		position: relative
		min-height: $headerHeight
		width: 100%
		overflow: hidden //超出範圍的部分不顯示

		.banner-wrap
			+animation(banner-slider 180s infinite linear)
			//載入剛剛的動畫keyframe

		span,span:after //span以及其偽元素的樣式
			display: block
			min-height: $headerHeight
			width: 100%
			background: image-url("banner-01.png") top left repeat-x
			//top left的功能是要讓圖片從左邊開始

		span:after //補上偽元素所需要的屬性
			background-position: top right
			//偽元素從右邊開始，使其可以左右相接
			content: ""
			+transform(translate(-100%, 0))
			//將偽元素移到目前位置左方



## 效能

原本的background-position作法我在測試時都是用不太差的桌上型主機做測試，所以完全沒注意到效能的問題，但經過反映以後，利用chrome去測試，效能真的不好。

background-position的效能

![background-position](/images/2013-12-19_095400.png)

transform的效能(幾乎沒有感覺啊!!)

![transform](/images/2013-12-19_110135.png)


本篇是用sass做介紹，如果想了解所產生的css，可以參考[http://codepen.io/Wcc723/pen/wFrCn](http://codepen.io/Wcc723/pen/wFrCn)。
