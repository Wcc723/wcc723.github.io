---
layout: post
title: CSS + html 冷知識
category: css
tagline:
tags: [css,sass]
cssdemo: 2014-spring
thumbnail:
published: true
---

CSS及HTML已經學了有段時間，但還有許多不清楚的點都會在(偶然)的情況下發現，而有些只是有趣，但有些發現，或許是以前忽略的，但在卻是那麼的實用...。

<!-- more -->

## label 不一定要配for

再用sublime text 時，如果輸入label + tab，就會出現`<label for=""></label>`，我也一直認為`<label>`裡面就是要有for，但`label`沒有for也可以call到指定的input。

<label> <input type="checkbox"/> This is a check box</label>

	<label> <input type="checkbox"> This is a check box</label>

*上方的checkbox，只要點擊文字，就可以讓checkbox轉換為checked。*

如上面的範例，label如果裡面有`input`，那麼點擊到input範圍，都可以focus到內部的input。

<label> <input type="checkbox"/> This is a check box <input type="checkbox"/> </label>

**注意，兩個input就只會一個有效...。**

## UTF-8 字符 也能作為class name

簡單來說，uff-8的小圖形也能作為class name。

{% raw %}
<div class="demo d0524">
	<div class="anti-☢">核能 ☢ !?</div>
	<div class="☯-power"> ☯ 神秘力量</div>
</div>
{% endraw %}

HTML code

	<div class="demo d0524">
		<div class="anti-☢">核能 ☢ !?</div>
		<div class="☯-power"> ☯ 神秘力量</div>
	</div>

Sass code

	//sass
	.anti-☢
		color: orange
	.☯-power
		color: white
		text-shadow: 0 0 3px black

## 利用:before 來做垂直置中

利用`inline-block`的特性來做到垂直置中，優點是支援before就可以，缺點是要置中的元素，也必須設定為`inline-block`。

{% raw %}
<div class="demo d0524 vertical">
	<div>這段字想要垂直至中</div>
</div>
{% endraw %}

Sass code

	.vertical
		height: 200px
		border: orange 1px solid
		&:before
			content: ""
			display: inline-block
			vertical-align: middle
			width: 1px
			height: 100%
		div
			display: inline-block
