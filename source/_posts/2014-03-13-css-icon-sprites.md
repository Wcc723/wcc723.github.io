---
layout: post
title: Spriting with Compass
category: CSS
tagline:
tags: [css, sass]
cssdemo: 2014-spring
thumbnail: google_logo170_hr.png
published: true
---

因為最近剛轉換工作，所以一段時間沒寫文章，沒寫文章的時間雖然不至於會退步，但會感覺到進步遲緩...。

這次來介紹利用Compass製作sprites，sprites 就像是的Google icons，他把許多的icons集合在同一張的png，這樣可以減少用戶對於伺服器的請求數。而這次會有兩篇sprites文章，本篇是介紹基本的sprites，下次介紹retina版sprites。

Compass sprites來源：[http://compass-style.org/help/tutorials/spriting/](http://compass-style.org/help/tutorials/spriting/)

<!-- more -->
![/images/google_logo170_hr.png](/images/google_logo170_hr.png)

## 本篇重點

利用compass製作css sprites，而在下一篇會介紹如何製作retina版本css srpites。

## 準備工作

首先先準備些icons到自己的`images`資料夾內，而本篇的圖片是從[http://icomoon.io/](http://icomoon.io/)下載作為範例用，如下圖所示。

![準備icons](/images/2014-03-1301.png)

我在icons資料夾內放入了幾張不同size的圖檔，另外切記，製作sprites請存png。

![準備icons](/images/2014-03-1302.png)

## Sass

接下來開始Sass吧。

	@import "icons/*.png" //匯入圖檔
	@include all-icons-sprites //將圖檔轉成 sprites

接下來會在資料夾內看到以下的圖檔，這樣就成功一半了。

![sprites](/images/2014-03-1303.png)

在CSS檔內會看到這樣的結果，`icons`是資料夾名稱，`mobile`是檔名，兩個串在一起就是一個class，但這範例缺少一個重要的屬性...，就是寬跟高。

	.icons-mobile {
		background-position: 0 -134px;
	}

## Compass sprites 設定值

[http://compass-style.org/help/tutorials/spriting/customization-options/](http://compass-style.org/help/tutorials/spriting/customization-options/)

Compass sprites有提供許多的設定值，相關的參數如以上網址，我們以`$<map>-spacing`為例，這是可以讓產生的sprites每張縮圖產生間距，只要把`<map>`替換成資料夾名稱即可。

如以下sass，就可以讓每張縮圖額外有1px的間距，這樣的sprites icons也比較不會互相干擾。

	//$<map>-spacing
	$icons-spacing: 1px

而另一個設定是讓每一個class都會寫入當初匯入的png寬與高，`$<map>-sprite-dimensions`預設值為`false`，只要改為`true`就會將每個icon加上寬與高。

只要將這些設定值，寫在匯入的png前方，在匯入後就會依據這些設定做成sprites。

	$icons-spacing: 1px
	$icons-sprite-dimensions: true
	@import "icons/*.png"
	@include all-icons-sprites

這樣匯入的每張圖，都會被補上寬與高。

	.icons-mobile {
		background-position: 0 -137px;
		height: 49px;
		width: 30px;
	}

## 完成

在tag內直接填上對應的class名稱，就可以使用了。

	<div class="icons1-mobile"> </div>
	<div class="icons1-phone"> </div>
	<div class="icons1-nice"> </div>
	<div class="icons1-setting"> </div>

{% raw %}
<div class="demo d0311">

	<div class="icons1-mobile">  </div>
	<div class="icons1-phone"> </div>
	<div class="icons1-nice"> </div>
	<div class="icons1-setting"> </div>

</div>
{% endraw %}

這樣就可以省去一大半用css算sprites位置的時間囉～。
