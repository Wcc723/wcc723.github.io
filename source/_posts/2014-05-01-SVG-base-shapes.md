---
layout: post
title: SVG 矩形、圓形、橢圓
category: svg
tagline:
tags: [svg]
cssdemo: 2014-spring
thumbnail:
published: true
---

SVG是屬於向量的圖形，所以他有許多的繪圖概念與Illustrator，所以這次就來了解他的一些常用的基本圖形。

{% raw %}
<svg width="100%" height="100">
	<rect x="0" y="0" width="100" height="100" style="stroke: gray; fill: 336699;"/>
		<circle cx="180" cy="50" r="50" style="stroke: gray; fill: 339966;"/>
</svg>
{% endraw %}


<!-- more -->

## 矩形

在定義一個矩形形狀時，通常會定義以下屬性，形狀、位置、尺寸以及樣式。

	"shapes" "x" "y" "width" "height" "style"

{% raw %}
<svg width="100%" height="100">
	<rect x="0" y="0" width="100" height="100" style="stroke: gray; fill: 336699;"/>
	<rect x="120" y="0" width="200" height="100" style="stroke: gray; fill: 339966;"/>
</svg>
{% endraw %}

	<svg width="100%" height="200">
		<rect x="0" y="0" width="100" height="100" style="stroke: gray; fill: 336699;"/>
		<rect x="120" y="0" width="200" height="100" style="stroke: gray; fill: 339966;"/>
	</svg>

而矩形除了一般的方形、長方形以外，也可以增加圓角的屬性`rx`、`ry`，但這就沒有像css的`border-radius`那麼的自由了，只能四個角設定相同的值；`rx`、`ry`也僅僅是設定其圓角垂直以及水平的半徑而已。

{% raw %}
<svg width="100%" height="100">
	<rect x="0" y="0" width="100" height="100" rx="10"  style="stroke: gray; fill: 336699;"/>
	<rect x="120" y="0" width="200" height="100" rx="40" ry="10" style="stroke: gray; fill: 339966;"/>
</svg>
{% endraw %}

	<svg width="100%" height="100">
		<rect x="0" y="0" width="100" height="100" rx="10"  style="stroke: gray; fill: 336699;"/>
		<rect x="120" y="0" width="200" height="100" rx="40" ry="10" style="stroke: gray; fill: 339966;"/>
	</svg>

## 圓形

圓形相當的容易，所以本篇才會將這些圖形合併在同一篇

圓形中有一點要特別注意，圓形的`cx,cy`所代表的是 **圓心(r)** 的位置，所以在定義圓形的位置，如果不想跑到圖框外，務必`cx`、`cy`要大於`r`的值。

{% raw %}
<svg width="100%" height="100">
	<circle cx="100" cy="50" r="50" style="stroke: gray; fill: 339966;"/>
</svg>
{% endraw %}

	<svg width="100%" height="100">
		<circle cx="100" cy="50" r="50" style="stroke: gray; fill: 339966;"/>
	</svg>

## 橢圓形

橢圓形概念和圓形也相當類似，只是將半徑`r`的值改成垂直及水平半徑`rx`、`ry`。

{% raw %}
<svg width="100%" height="100">
	<ellipse cx="100" cy="50" rx="80" ry="30" style="stroke: gray; fill: 990000;"/>
</svg>
{% endraw %}

	<svg width="100%" height="100">
		<ellipse cx="100" cy="50" rx="80" ry="30" style="stroke: gray; fill: 990000;"/>
	</svg>

#### 小結

咦...到目前為止是不是太容易點...。
