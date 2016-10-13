---
layout: post
title: Zeplin, 跨越工程師與設計師的鴻溝
category: tools
tagline: 
tags: [tools, zeplin]
cssdemo: 
jsdemo: 
thumbnail: zeplin/2015_04_09_zeplin_00.png
published: true
---

從去年開始，做網頁設計時都開始使用Sketch，一方面是對於Web來說，Sketch相當的合適，另一方面則是Sketch有相當多的擴增工具，讓在執行上可以方便不少。

這次就來介紹Sketch的擴增工具**Zeplin**，設計師可以透過這套工具，快速的傳達設計的內容，包含顏色、間距、字型等等，而工程師不會因為色弱，老是用錯顏色，且工程師不需要安裝Sketch就可以使用，Zeplin甚至提供Web版來快速上手。

<!-- more -->

![](/images/zeplin/2015_04_09_zeplin_00.png)

Zeplin: [https://zeplin.io/](https://zeplin.io/)

## 申請帳號

如果有興趣的朋友，要先申請帳號，我在很久之前就有申請了，所以有點忘記流程，所以有興趣下載的朋友，請先提出申請吧～。

*收到邀請後，也可以拿到測試版的軟體*

## 軟體介紹

注意：Sketch is Mac only.

*Zeplin目前我還沒有在多人環境測試*

安裝完後，他會先要求登入，然後再建立檔案同時上傳到伺服器，這樣可以和其他合作夥伴同步討論。

![](/images/zeplin/2015_04_09_zeplin_01.png)

在建立專案時，可以開Androi, iOS, Web，而這些都可以匯出不同的資料，就以Web來說，他可以將色票匯出成Sass的變數。這邊我就先選Web來建立。

![](/images/zeplin/2015_04_09_zeplin_02.png)

開好專案後會提示在Sketch內按下`cmd + E`，這樣就能夠將設計稿匯入。

![](/images/zeplin/2015_04_09_zeplin_03.png)

打開Sketch，手邊剛好有一份Bootstrap的Sketch template，就按下`cmd + E`。

![](/images/zeplin/2015_04_09_zeplin_04.png)

可以看到專案的列表，就把圖片匯入剛剛開的專案上吧。

![](/images/zeplin/2015_04_09_zeplin_05.png)

接下來回到Zeplin，可以找到剛剛Bootstrap的Sketch template，隨便點個地方，可以看到尺標都標好了，並且將顏色標出。

*如果點的是內文，則可以複製內文*

![](/images/zeplin/2015_04_09_zeplin_06.png)

右方的色票旁邊有個水滴圖案，如果點了就會標示顏色的"色名" (*色弱救星*)，並且將他加到常用的色彩列表。

*Border and fill設計師都不需要另外標顏色了~*

![](/images/zeplin/2015_04_09_zeplin_07.png)

Guildeline頁面可以看到剛剛選擇的顏色、畫面上所用到的字型以及輸出CSS。如果點Generate CSS，可以產出如下的Sass變數(色名是Zeplin取的)。

	$limed-oak: #58b957;

![](/images/zeplin/2015_04_09_zeplin_08.png)

除此之外，也可以按住`cmd`點選畫面上的物件，這樣就可以在物件上寫一些註解，如果多人的話也可以透過這來討論。

![](/images/zeplin/2015_04_09_zeplin_09.png)

你相信嗎？這是Web版的頁面，就算是工程師也能透過Web版來進行討論，只要先有一個帳號就可以了。

![](/images/zeplin/2015_04_09_zeplin_11.png)

如果撇除Mac有點貴之外，Sketch是相當值得入手的軟體，加上現在對Sketch的支援越來越多(Zeplin，或者是Google Material Design也支援Sketch範本)，有興趣的不仿來試試看。