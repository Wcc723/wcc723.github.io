---
layout: post
title: Sprites for Retina
category: css
tagline:
tags: [css, sass]
cssdemo: 2014-spring
thumbnail:
published: true
---

上禮拜教召，讓這篇已經準備好的文章又拖了一個禮拜...，然後現在打開卻有點忘記怎麼做...。



Compass sprites for retina來源：[https://speakerdeck.com/hlb/maintainable-css-with-sass-and-compass](https://speakerdeck.com/hlb/maintainable-css-with-sass-and-compass)

Hlb的簡報有介紹，本篇也是參考此簡報做的。

<!-- more -->

## 本篇重點

延續上一篇，利用compass製作sprites for retina，讓png icons在行動裝置以及有更高解析度的螢幕有更好的表現。

## 準備工作

和上篇一樣，圖片是從[http://icomoon.io/](http://icomoon.io/)下載作為範例用，但這次是要有兩種size(其實上次就有做好了)。

![準備icons](/images/2014-03-1301.png)

而兩個資料夾對應的圖片檔名也要相同，但記得尺寸寬及高是各兩倍。

![準備icons](/images/2014-03-1302.png)

## Sass

首先先到[https://gist.github.com/estahn/3837343](https://gist.github.com/estahn/3837343)下載`_compass-retina-sprites.scss`這隻檔案，這一個mixin中有一段`device-pixel-ratio`，這可以判斷目前裝置的像數比(相關文章[http://rettamkrad.blogspot.tw/2013/04/retina-device-and-web-develop.html](http://rettamkrad.blogspot.tw/2013/04/retina-device-and-web-develop.html))。

如果不是很清楚，建議可以先看那篇文章，接下來就開始sass實做了。

	@import compass-retina-sprites.scss

	//匯入普通版的icons
	$icons-spacing: 1px
	$icons-sprite-dimensions: true
	@import "icons/*.png"
	@include all-icons-sprites

	//匯入2x size的icons
	$icons2x-spacing: 1px
	$icons2x-sprite-dimensions: true
	@import "icons2x/*.png"
	@include all-icons2x-sprites

	//製作成retina款式
	@include all-retina-sprites($icons-sprites, $icons2x-sprites)

接下來會產生兩種size的png sprites。

#### 普通size

![sprites](/images/icons1-s85e9ac7815.png)

#### 2x size

![sprites](/images/icons2x-s14e8587cd4.png)


## 使用

其實用法和上一篇一模一樣，透過css media會判斷裝置是要用哪種icons sprites，以下有兩個demo，有retina裝置的使用者不妨看看兩者之間的差異吧~(一般螢幕兩者看到的會一樣)。

	<div class="icons-mobile"> </div>
	<div class="icons-phone"> </div>
	<div class="icons-nice"> </div>
	<div class="icons-setting"> </div>

#### 一般 Sprites

{% raw %}
<div class="demo d0311">

	<div class="icons1-mobile">  </div>
	<div class="icons1-phone"> </div>
	<div class="icons1-nice"> </div>
	<div class="icons1-setting"> </div>

</div>
{% endraw %}

#### Retina Sprites

{% raw %}
<div class="demo d0311">

	<div class="icons-mobile">  </div>
	<div class="icons-phone"> </div>
	<div class="icons-nice"> </div>
	<div class="icons-setting"> </div>

</div>
{% endraw %}

### 比較圖

這邊另外附上比較圖。

![比較圖](/images/screen_shot_2014-03-24.png)

現在許多網站的icons sprites也有做for retina，像是facebook新版的網站，當然還有非常多，不妨四處觀察看看吧。

![隨時會不見的圖](https://fbstatic-a.akamaihd.net/rsrc.php/v2/y2/r/DycYx0ssBHq.png)
