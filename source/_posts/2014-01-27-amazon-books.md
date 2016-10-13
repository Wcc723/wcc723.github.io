---
layout: post
title: Amazon book 書籍封面展示效果 (CSS 3D)
category: css
tagline:
tags: [css, sass]
cssdemo:
thumbnail: 2014-01-27_084528.png
published: true
---

自從學了CSS 3D後，就一直想嘗試使用在網頁上，但除了形象網頁外，使用CSS 3D的網站似乎不是很多，畢竟這不是必要的效果。而最近在Amazon Books的購物商城上，發現他們有用CSS 3D在展示書籍的正反面。

[Amazon books](http://www.amazon.com/gp/product/1936608367/ref=s9_simh_bw_p14_d2_i1?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=merchandised-search-4&pf_rd_r=0DRH0KAG65P45DCXEKPW&pf_rd_t=101&pf_rd_p=1401488422&pf_rd_i=283155)

<!-- more -->

## 本篇重點

試試看Amazon Books中的書籍展示效果，到底包含了些什麼CSS 語法。

## 效果展示

這效果我是做在codepen 上，裡面的封面圖片是直接連結台灣博客來書店，所以如果掉圖就是...被下架了。

<iframe src="http://codepen.io/Wcc723/full/DjGBi" frameborder="0" width="100%" height="600px"></iframe>

[codepen連結](http://codepen.io/Wcc723/full/DjGBi)

在滑鼠滑過書上方時，書本會呈現微開，這會讓使用者感覺書本可以點擊(在Amazon Books中，點擊書本就可以看書的簡介)；而在hover過下方的flip to back時，書會翻轉30度，如果點擊則會翻轉180度，這樣就可以看到書的背面。

## 語法結構

題外話，最近我正在學slim，所以codepen上的html是用slim寫的，這邊就先介紹一下html的結構吧。

### html結構

	<div class="wrap">
	<div class="imgWrap">
		<img src="#..." alt="" class="first-child">
		<img src="#..." alt="" class="second-child">
	</div>
	</div>

	<a href="#" class="fliptoBack">|flip to back</a>

- .wrap 用途是來定位整體的位置
- .imgWrap 書本的外圍架構，並且做翻轉書本的效果
- img .first-child 書的正面
- img .second-child 書的背面




### Js

在看CSS前，我想先說明js的部分，有些地方沒有辦法用css達成的，會用js去完成，避免等等css的誤解，先介紹一下我的script寫了什麼。

	先取得第一張封面的寬高定義為w,h
	w = $('.first-child').width();
	h = $('.first-child').height();

	//將外框及第二張圖設定成相同的寬高
	$('.imgWrap, .wrap, .second-child').width(w);
	$('.imgWrap, .wrap, .second-child').height(h);

	滑過下方文字時，將書本套用'.flip'的class
	$('.fliptoBack').hover(function() {
	  $('.imgWrap').toggleClass('flip');
	});

	點擊下方文字時，將書本套用'.flip180'的class
	$('.fliptoBack').click(function() {
	  $('.imgWrap').toggleClass('flip180');
	});


### CSS

依慣例，我是用sass寫...，另外就是有點長。

	$bookwidth: 60px //先定義書本的"厚度"

	.wrap
		+perspective(1200px) //3D的景深
		position: relative
		margin: 40px auto 20px auto

	.fliptoBack  //下方文字的位置
		display: block
		text-align: center

	.imgWrap
		+transform-style(preserve-3d) //先定義成transform3d的模式
		+transition(transform .5s ease) //針對transform進行動畫
		position: absolute
		&:before  //這一塊是要假裝成書的內頁
			content: ""
			position: absolute
			width: 100%
			height: 100%
			+border-right-radius(5px)
			background: black
		&:after  //這邊是書背
			content: ""
			position: absolute
			left: 0
			top: 0
			height: 100%
			width: $bookwidth
			background: black
			+transform3d(rotateY(90deg))
			+transform-origin(0)

		&.flip  //在滑鼠掠過下方文字時，套用的'.flip'
			+transform3d(rotateY(30deg)) //翻轉30度
		&.flip180  //點擊時套用的'.flip180'，用來翻轉180度
			+transform3d(rotateY(180deg) translateZ($bookwidth))
			//另外再翻轉180度後，必須調整書本的Z軸，讓他在視覺上位置不變

		img  //兩張圖片的設定
			position: absolute
			top: 0
			left: 0
			border: #ccc 1px solid
			+transition(transform .3s ease)
			+backface-visibility(hidden)  //不顯示背面
			+border-right-radius(3px)
			+box-sizing(border-box)    
		&.first-child  //定義第一張圖片，並且滑鼠滑過時旋轉30度
			+transform3d(rotateY(0deg))
			+transform-origin(0)
			z-index: 2      
			&:hover
				+transform3d(rotateY(-30deg))
		&.second-child  //讓封底一開始時就反轉到另一面
			+transform3d(rotateY(-180deg) translateZ($bookwidth))

CSS 3D很有趣，只是看起來code有點長，但是玩一段時間會很有成就感。  
