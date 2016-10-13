---
layout: post
title: CSS設定中英文不同的字體
category: sass
tagline: CSS3 unicode-range
tags: [css, sass]
cssdemo: 2014-spring
thumbnail:
published: true
---



Just font中的字型學文章都相當有意思，而有一篇是關於[中英文字搭配](http://blog.justfont.com/2013/12/popular-typography)的問題；這篇雖然是以windows word為例，但裡面的概念在網頁上也是很有幫助，而其中一段"*以 Windows 內建的三種字型為例，表現最好的是微軟正黑體，英文部分採用了微軟的 Segoe UI，粗細與中文較一致*"，在目前web中當然也可以有這樣的設定，只要用CSS3的`unicode-range`，就能夠在中文字中套用"微軟正黑體"，英文套用"Segoe UI"。

<!-- more -->
#### 本篇參考

1. [利用 CSS 分別設定中文字、英數、注音、假名的字體：使用 CSS3 @font-face](http://blog.yorkxin.org/posts/2012/06/17/assign-fonts-for-specific-characters)
2. [大眾字型學(3)：Word 預設中英搭配有什麼問題？](http://blogorg.justfont.com/2013/12/popular-typography/)
3. [Uni-code 字符百科](http://unicode-table.com/cn/)

## 本篇重點

了解`unicode-range`的使用方法。

## 效果展示

`unicode-range`部分效果在Mac OS上測試有問題，不管是Chrome、Safari、Firefox都有點問題...。

{% raw %}
<div class="demo d0218">
	<div class="custom-Iam">
		這一句話只有"我"會被換成黑體
	</div>
</div>
{% endraw %}

![](/images/2014-02-23_180951.png)

以上面這一段文字為例，在windows內，"我"這一個文字會被替換成微軟正黑體，而其他文字沒有變化。

[https://developer.mozilla.org/en-US/docs/Web/CSS/unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/unicode-range)

如果參考Mozilla 的MDN可以了解到，

	unicode-range: U+26               /* 單一字符 */
	unicode-range: U+0025-00FF        /* 範圍字符 */
	unicode-range: U+4??              /* 萬用字符 */
	unicode-range: U+0025-00FF, U+4?? /* 利用','，多選取字符 */

[http://unicode-table.com/cn/](http://unicode-table.com/cn/)

再參考uni code的表，可以查詢各文字的unicode。


用這樣的方式就能夠選取特定的文字，或是語系等等。

	@font-face
		font-family: custom-Iam
		src: local("Heiti TC"), local("微軟正黑體"), local("Microsoft JhengHei")
		unicode-range: U+6211

	.custom-Iam
		font-family: custom-Iam

## 針對指定語系設定

在一般來說，通常換字體沒有針對語系，就像下方這一個範例，我將字體換成了'Mac OS 黑體-繁'、'Windows 微軟正黑體'，但在中英文排版中，用同一種字體不一定合適(請看just font)。

{% raw %}
<div class="demo d0218">
	<div class="custom-Heiti">
		This is 一個中文English交雜的sentence
	</div>
</div>
{% endraw %}

![](/images/2014-02-23_182250.png)

中文的語系的unicode-range為`U+4E00-9FFF`，英語系為`U+00-024F`，將這個值加入到@font-face內，就能為特定語系換字體。如下範例中文還是'Mac OS 黑體-繁'、'Windows 微軟正黑體'，但英文的部份已經替換成'Helvetica'、'Segoe UI'，範例如下。

{% raw %}
<div class="demo d0218">
	<div class="custom-sans-serif">
		This is 一個中文English交雜的sentence
	</div>
</div>
{% endraw %}

![](/images/2014-02-23_182302.png)

在css內只要將兩者的font-family皆設定相同名稱，但指向不同的`unicode-range`，就可以達到這樣的效果。

	@font-face
		font-family: custom-sans-serif
		src: local("Heiti TC"), local("微軟正黑體"), local("Microsoft JhengHei")
		unicode-range: U+4E00-9FFF

	@font-face
		font-family: custom-sans-serif
		src: local(Helvetica), local(Segoe UI)
		unicode-range: U+00-024F

	.custom-sans-serif
		font-family: custom-sans-serif

## 其他範例

不只在黑體能夠這樣做，明體當然也可以。

{% raw %}
<div class="demo d0218">
	<div class="custom-serif">
		This is 一個中文English交雜的sentence
	</div>
</div>
{% endraw %}

	@font-face
		font-family: custom-serif
		src: local("LiSong Pro"), local("新細明體"), local("PMingLiU")
		unicode-range: U+4E00-9FFF

	@font-face
		font-family: custom-serif
		src: local(Times), local(Times New Roman)
		unicode-range: U+00-024F

	.custom-serif
		font-family: custom-serif

## 延伸發現

在[字符百科](http://unicode-table.com/cn/)中，不僅可以查詢的文字的unicode 編號，其實還可以查到許多符號性的文字，這些文字其實可以直接當作web font使用，還免載入外部的字型檔，就像下方的幾個不同雪花一樣。

{% raw %}
<div class="demo d0218">
	❄❅❆
</div>
{% endraw %}
