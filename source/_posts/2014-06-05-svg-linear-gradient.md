---
layout: post
title: SVG 漸層沒想到是這樣的做法
category: svg
tagline:
tags: [svg]
cssdemo: 2014-spring
thumbnail:
published: true
---

最近在研究SVG，在做專案的時候就會想用一些相關的技術，當時想在`stroke`上使用漸層色，所以就研究了SVG的漸層做法。

SVG的漸層做法，和我想像有些落差，原本以為會是類似CSS的寫法，但結果卻...。

<!-- more -->

## SVG 漸層

SVG漸層，找到的做法是在HTML先定義漸層；而CSS的漸層是直接寫在樣式表內，這樣的做法對於主要使用CSS有很大的不便(哭)。或許有用CSS的做法，但我不是很清楚。

#### 定義漸層

在任何一`<svg>`標簽內，新增一個`<defs>`，`<defs>`標簽內在新增一個`<linearGradient>`標簽，這樣就可以開始定義漸層，而結構如下：

	<defs>
		<linearGradient id="myGradient"
                x1="0%" y1="0%"
                x2="0%" y2="100%"
                spreadMethod="pad">
	      <stop offset="0%"   stop-color="#E80C7A" stop-opacity="1"/>
	      <stop offset="50%" stop-color="#E83D9D" stop-opacity="1"/>
	      <stop offset="100%" stop-color="#fff" stop-opacity="1"/>
	    </linearGradient>
	</defs>

另外重要的是`linearGradient`需要一個id，因為他是id，所以一個page內一個`linearGradient`只能定義一次(不同的SVG可以共用相同的`linearGradient`)。


#### 使用

接下來隨意繪製一個圖形，圖形的許多屬性都能套用剛剛定義的漸層，如
在以下圓型的`fill`屬性值為`url(#myGradient)`，就可以將剛剛的漸層帶入。

	<svg width="164" height="164">
		<circle  cx="82" cy="82" r="79" style="fill: url(#myGradient)"/>
	</svg>

{% raw %}
<div class="demo ">
	<svg width="164" height="164">

		<defs>
			<linearGradient id="myGradient"
                    x1="0%" y1="0%"
                    x2="0%" y2="100%"
                    spreadMethod="pad">
		      <stop offset="0%"   stop-color="#E80C7A" stop-opacity="1"/>
		      <stop offset="70%" stop-color="#E88EB1" stop-opacity="1"/>
		      <stop offset="100%" stop-color="#fff" stop-opacity="1"/>
		    </linearGradient>
		</defs>

		<circle  cx="82" cy="82" r="79" style="fill: url(#myGradient)"/>

	</svg>
</div>
{% endraw %}

#### CSS

只要定義好後，CSS也能夠使用漸層色，一樣用`url(id)`，像是以下範例就用`stroke: url(#myGradient)`(再次提醒，漸層定義一次就能重複使用)。

	// sass code
	// 這範例還偷插了stroke-width以及animation。
	svg
		stroke-width: 1px
		stroke: url(#myGradient)
		fill: none
		+transition(stroke-width .5s)
		&:hover
			stroke-width: 4px
			+animation(infinite-rotate 1s infinite linear)

html的部份就不需要寫什麼了，就由CSS去定義。

	//html

	<svg width="164" height="164">
		<circle cx="82" cy="82" r="79" />
	</svg>


{% raw %}
<div class="demo d0605">
	<svg width="164" height="164">
		<circle class="circle" cx="82" cy="82" r="79" />
	</svg>
</div>
{% endraw %}

最後這也是我在實驗的效果，結合SVG`stroke`的粗細變化，以及`stroke`的漸層。
