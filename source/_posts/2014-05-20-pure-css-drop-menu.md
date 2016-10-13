---
layout: post
title: 純CSS Drop Menu
category: css
tagline:
tags: [css,sass]
cssdemo: 2014-spring
thumbnail:
published: true
---

CSS 有很多技巧，都很值得去開發，最近發現了一個很簡單的技術，就是純CSS下拉式選單，這讓我避免使用Jquery去做slider的效果，重點是...超簡單！

<iframe src="http://codepen.io/Wcc723/full/yCpae/" frameborder="0" width="100%" height="300"> </iframe>

<!-- more -->

## 重點提示

這是利用`max-hegiht` + `transition`所達到的效果，好處是不用配合jquery的slider function，壞處就是...，drop-menu一定會包含`overflow`的屬性，如果設計不能有這屬性的話，就會被限制住。

## Html

HTML架構如下，而這篇是真的純CSS，所以會插入一個input去做切換的效果，實際製作的時候，可以直接用js來切換class，也能達到相同的效果。

	<div class="drop-menu">
		<label for="drop-menu">
			下拉式選單
		</label>
		<input type="checkbox" id="drop-menu">

		<ul class="menu-list">
			<li><a href="#">list-1</a></li>
			<li><a href="#">list-2</a></li>
			<li><a href="#">list-3</a></li>
			<li><a href="#">list-4</a></li>
		</ul>
	</div>

## sass

除了排版的樣式外，其餘的重點我都直接標示在sass code裡，而最重要的是用max-height來達到這樣的效果(height不可以喲)。

	.drop-menu
		max-width: 300px
		label
			display: block
			border: 1px solid #ccc
			padding: 6px
			cursor: pointer
		input
			display: none
		.menu-list
			background-color: #FFF
			+box-shadow(0 0 8px rgba(black, .6))
			overflow: hidden //重點
			max-height: 0 //重點
			+transition(max-height .3s) //重點
			a
				display: block
				padding: 4px
				border-bottom: 1px dashed #ccc

		input:checked + .menu-list
			max-height: 300px //重點

## Demo

{% raw %}
<div class="demo d0520">
	<div class="drop-menu">
	<label for="drop-menu"> 下拉式選單 </label>
	<input type="checkbox" id="drop-menu"/>
		<ul class="menu-list">
			<li><a href="#">list-1</a></li>
			<li><a href="#">list-2</a></li>
			<li><a href="#">list-3</a></li>
			<li><a href="#">list-4</a></li>
		</ul>
	</div>
</div>
{% endraw %}

很容易吧～
