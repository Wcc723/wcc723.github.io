---
layout: post
title: 做網頁如果缺Icons怎麼辦
category: css
tagline: 那就用Ico Moon吧
tags: [css, sass, icons]
cssdemo: iconmoon-2014
thumbnail: 2014-02-10_140244.png
published: true
---

最近很多人跟我討論到的網站上icon的問題，如果要畫icon要花多久時間、使用的方法等等。而以我來說，較傾向使用免費icons或者是付費的向量icon，不建議自己畫這些icon，因為要畫一個icon所花的時間成本，都可以買一套200枚的icons了= =。

而今天要推薦的是ico moon，這在之前就有推薦過，而這次的教學，要針對於要直接使用他的icons在網頁上。

[http://icomoon.io/](http://icomoon.io/)

<!-- more -->

## 本篇重點

使用Ico Moon web-font icons在網頁上，並且了解其特性。

## 效果展示

{% raw %}
<div class="demo">
	<span class="icon-phone" style="font-size: 3em"></span>
</div>
{% endraw %}

	<span class="icon-phone" style="font-size: 3em"></span>

上面理當來說，可以看到一隻電話，使用上和bootstrap的icon相當類似，但不同的是它用偽元素插入文字，透過web-font轉換成圖形，所以基本上是需要支援偽元素的瀏覽器才能使用，在不支援的瀏覽器(ex: ie7)，ico moon也有提供解決的方式，所以大可盡量使用。

由於是web-font，屬於字體的一種，所以可以把它當作文字的屬性，自由的調整它的顏色(color)及大小(font-size)。


## 使用Ico Moon

[http://icomoon.io/](http://icomoon.io/)

首先，請打開以上連結，Ico Moon有提供web-font icon的製作，以及大量的icon，另外也可以付費取得更進階的服務。

![](/images/2014-02-10_140341.png)

在進入網頁後，點選右上方的`Launch App`，開啟製作web-font的應用程式介面。

![](/images/2014-02-10_140515.png)

在應用程式內可以看到大量的icons，當然是可以把他們全部通通選起來，但要記得，選越多檔案越大...，其中我喜歡Entypo這組，我就把這群組的選起來。

![](/images/2014-02-10_140534.png)

選完後點下面的font。

![](/images/2014-02-10_140621.png)

如果不想下載下來，可以點quick used，而本篇會介紹下載到本機使用。

### 設定

在以上的步驟完後，其實就可以點選下載，其實還有提供許多設定值，如：ie7 support...。

在上一張圖的右上方，有Preferences的選項，裡面就有許多設定...。

![](/images/2014-02-10_140830.png)

這裡面有許多設定，參考如下：

1. Encode & Embed Font in CSS 字體內嵌入CSS檔(不需要外部字型檔)
2. Support IE 7 (and older) 支援萬惡IE7
3. Include Metadata in Fonts 不清楚..
4. Use Class Selector 不使用屬性選取器，改用自訂選取器(如果不清楚，就用內建的吧)
5. Font Metrics 字體規格

再都設定完後，請選擇下方的Download到本機，並且解壓縮後打開`demo.html`。


![](/images/2014-02-10_141039.png)

裡面會看到這一個範例檔，可以查詢到每一個icon所使用的Class以及範例。

## 使用在自己的網頁上

解壓縮後，有許多的檔案，其中請把以下三個資料夾或檔案複製到自己的專案上(如果沒有support ie7就不會有`ie7`資料夾)。

	style.css  
	/ie7/
	/fonts/

在專案內的html檔只要插入以下程式碼，即可開始使用(如果沒有support ie7，就僅需要以下第一行)。

	<link rel="stylesheet" href="style.css">

	<!--[if lt IE 8]><!-->
		<link rel="stylesheet" href="ie7/ie7.css">
	<!--<![endif]-->

### 範例

{% raw %}
<div class="demo">
	<span class="icon-feather" style="font-size: 3em"></span>
</div>
{% endraw %}

## ie7

IE 7的部分，由於新的大魔王IE 11出現，測試一直有問題，所以我用Aurora 瀏覽器模擬IE7進行測試，結果是可以的，如果有純正IE 7的使用者，不妨試試看...(不是在本站測試，本站並沒有載入ie7 fix)。

![](/images/2014-02-10_143144.png)
