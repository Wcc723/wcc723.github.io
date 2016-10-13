---
layout: post
title: 前端軟體-Prepos介紹
category: tools
tagline: 
tags: [tools]
cssdemo: 
thumbnail: 2013-12-27-01.png
---

#### 情境

當在進行前端設計的時候，如果想要分享Html給夥伴看看，有哪些方式呢？

1. 叫他過來看
2. 截圖之後，傳line給他看
3. 上傳到空間，丟網址給他看

今天介紹一個更快的方式，利用prepos免上傳，直接傳網址給他看。
<!-- more -->


## 本篇重點
Prepos的功能相當多，除了產生可以跨裝置的網址外，還可以編譯相當多語言，如LESS, Sass, SCSS, Stylus, Jade, Slim, Coffeescript, LiveScript, Haml and Markdown等等，另外還可以做圖檔優化。

這次就
介紹Prepos這套軟體，從安裝到執行，一次搞定。*注意：跨裝置限定區網*

*本篇範例使用prepos 4.0.1*

## 安裝

link: [http://alphapixels.com/prepros/](http://alphapixels.com/prepros/)

本篇是利用OSX做介紹，但是本套軟體在windows上也可以使用，操作基本上是接近的，所以不管是哪一個系統的使用者都可以快速上手。

![prepos](/images/2013-12-27-01.png)

在進入網站後，左方可以選擇下載的版本，大家就選擇要使用的版本下載吧(這次只會介紹他的免費版)。

![prepos](/images/2013-12-27-02.png)

下載後，只要就點兩下解壓縮

![prepos](/images/2013-12-27-03.png)

因為是網路上下載的，所以在prepos.app上按住`cmd` + `滑鼠左鍵` 選擇打開

![prepos](/images/2013-12-27-04.png)

接下來會出現提示視窗，直接按打開就可以了。

![prepos](/images/2013-12-27-05.png)

另外他還有提供[Install Chrome Extension](https://chrome.google.com/webstore/detail/prepros/bnlfjdjbjiabcgkkjaicjepbhhmeonlm?hl=en)的連結，可以安裝其Chrome擴充程式，但如果有安裝[livereload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei?hl=en)，就可以不安裝它提供的擴充程式。

******

## 使用

這套操作界面很直覺，如果有使用過fire.app等等軟體，相信很快就能上手。

![prepos](/images/2013-12-27-06.png)

這次就拿aShare的原始版型檔做範例吧，只要把資料夾整個拖曳到prepos裡就可以了。

![prepos](/images/2013-12-27-07.png)

丟進去後，他就會列出這個專案裡所有可以編譯檔案。

![prepos](/images/2013-12-27-08.png)

每一個檔案，還能單獨設定其編譯設定。另外在下方有一個地球的圖案(Live preview)，點擊後就會開啟瀏覽器，直接預覽網頁。

![prepos](/images/2013-12-27-8-5.png)

這邊就介紹我最喜歡的功能 跨裝置測試(Multi Device Testing)，點擊Prepos右上方功能列，類似手持裝置的符號。

![prepos](/images/2013-12-27-09.png)

接下來就可以獲得跨裝置的資訊，只要在其他裝置輸入以上網址，或者是利用qrcode就可以預覽這個專案。

![prepos](/images/2013-12-27-091.png)

輸入以上網址，就可以看到Prepos全部的專案

![prepos](/images/2013-12-27-092.png)

選擇專案就可以開始預覽，如果沒有錯誤，就把這個網址傳給夥伴吧～。*注意：跨裝置限定區網*

*****

## 跨裝置測試

這套軟體他的livereload和其他相似軟體不同之處，就是在跨裝置也可以livereload(免費版只能對於有編譯的檔案livereload)，以下就來直接做範例給大家看吧。

![prepos](/images/2013-12-27-15.png)

這個是手機版上所看到aShare版型

![prepos](/images/2013-12-27-12.png)

接下來把Sass中的色彩變數改成紅色

![prepos](/images/2013-12-27-16.png)

於是乎，手機上的色彩就會自動轉成編譯後的色彩

*****

## 結語

Prepos在概念上是很棒的一套軟體，在3.0.X版本的時候我就有接觸過，但是當時他經常性的編譯錯誤(有時候多按個save又編譯成功= =)，所以我在使用時，都是開fire.app，然後關閉prepos的auto compile，僅使用它的跨裝置功能。而最近他出4.0.1版，有空可以多拿來玩看看還有沒有類似的問題。


