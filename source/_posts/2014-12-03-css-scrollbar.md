---
layout: post
title: Webkit 自定義Scroll Bar外觀
category: css
tagline:
tags: [css]
cssdemo: 2013-summer
jsdemo:
thumbnail: 2014-12-03-01.png
published: true
---

Webkit 可以利用CSS修改Scoll bar的外觀，有試過其他瀏覽器是不行的，而有時候在使用局部範圍的overflow: auto，會需要較為纖細的scroll bar，如果不在意webkit以外的瀏覽器，可以試試看這個方法。

<!-- more -->

來源：[http://cssdeck.com/labs/css3-webkit-vertical-scrollbars](http://cssdeck.com/labs/css3-webkit-vertical-scrollbars)

{% raw %}
<div class="d0901 demo">
	<div class="overflow" style="width: 150%"></div>
</div>
{% endraw %}

上面這是內建webkit的scroll bar，有些時候因為需要配合版面，這樣式並不合適，而Webkit的瀏覽器可以透過以下CSS來做調整。

```sass
&::-webkit-scrollbar
//"&"是必須與上一層同層級
//-webkit-scrollbar : 整體的scrollbar樣式

&::-webkit-scrollbar-thumb
//bar的樣式

&::-webkit-scrollbar-track
//軌道的樣式

::-webkit-scrollbar-thumb:window-inactive
//頁面是在被啟用的情況下(非必要)
```


## scrollbar範例

*注意本範例只有Webkit瀏覽器有效，Chrome or Safari*

{% raw %}
<div class="d0901 demo scrollbar1">
	<div class="overflow" style="width: 150%">style1</div>
</div>
<div class="d0901 demo scrollbar2">
	<div class="overflow" style="width: 150%">style2</div>
</div>
<div class="d0901 demo scrollbar3">
	<div class="overflow" style="width: 150%">style3</div>
</div>
<div class="d0901 demo scrollbar4">
	<div class="overflow" style="width: 150%">style4</div>
</div>
<div class="d0901 demo scrollbar5">
	<div class="overflow" style="width: 150%">style5</div>
</div>
<div class="d0901 demo scrollbar6">
	<div class="overflow" style="width: 150%">style6</div>
</div>
{% endraw %}

如果要跨瀏覽器的scrollbar，就建議使用javascript或是jquery了。
