---
layout: post
title: 大陸面試題 如何反轉元素內容
category: css
tagline: 
tags: [css, sass]
cssdemo: 2014-spring
thumbnail: 2014-02-26-1513.png
published: true
---



最近大陸網路上有篇問題文，問題：*看到一道面試題：`ul`有10000 個`li`子元素，如何將這10000 個`li`顛倒順序*。而其中有一個神回復，真的是活用CSS3的特色，所以在這邊分享給大家看看(本篇以150個為例)。

來源：[http://v2ex.com/t/100982](http://v2ex.com/t/100982)

<!-- more -->
## 神回復

在本篇的五樓已經有對此文做了神回復。

> ul {transform: rotate(180deg)} li {transform: rotate(180deg)} 搞定

簡單來說，就是反轉一次外圈，在反轉一次個別的元素，來達到這個效果。

	ul
		+transform(rotate(180deg))
		li
			+transform(rotate(180deg))

## 我的提案

其實他的已經是神回復了，要超越它實在是太難了，所以我提出另一個方式，就是使用`display: flex`，利用`flex-direction`來反向排列其內容。

	ul
		display: flex
		flex-direction: column-reverse

兩個結果如下，最左方的是原始題目，中間是`神回復`，最右方是利用`display: flex`。

<iframe src="http://codepen.io/Wcc723/full/GFgtm" frameborder="0" width="100%" height="400"> </iframe>

codepen :[http://codepen.io/Wcc723/pen/GFgtm](http://codepen.io/Wcc723/pen/GFgtm)

以上是針對此題目的兩個CSS解法，還有人想到其他解決方案嗎？
