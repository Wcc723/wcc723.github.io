---
layout: post
title: 視覺前端 - 按鈕的個性
category: design
tagline: 
tags: [design]
cssdemo: 
jsdemo: 
thumbnail: 2014button/2014-11-24-button_03.png
published: true
---

在參加完鐵人賽以後，會想要再精進UI設計的部分，所以想試著寫設計得文章，接下來會連續幾篇UI設計的文章，有些是在鐵人賽前就準備好的，最近在重新整理PO出來，希望大家會感興趣。

網路上有許多開源的Framework，通常我都會參考他們的按鈕以及表單設計，因為這是最能夠表達Framework特色的元件。按鈕與表單，按鈕更能表達一個Framework的個性，如圓角、顏色填充的方式、預設的色彩變化、單位計算方式(em or px)等等，當然表單也有，但許多為了實用性，表單會將設計簡化。

<!-- more -->

現在大多的HTML元件，在執行上大多會使用CSS語法，較少使用圖片，這樣可以提高元件可用性，在維護上也較為容易。而我在設計按鈕時，以時常會參考這些Framework的做法，再加以改變，這些Framework有許多CSS細節，非常有參考價值。

以下列出幾個常見的CSS Framework button。

## Bootstrap 2

[Bootstrap 2](http://getbootstrap.com/2.3.2/)

自從 2 開始就是Web frontend相當主流的CSS Framework，在 3 發行之後，2 的維護也中止，使用這套Framework的開發者也相對少很多，但是在網路上還是經常可以看到由Bootstrap 2所設計的網頁，Bootstrap 2依然是一款經典的CSS Framewrok。

![](/images/2014button/2014-11-24-button_02.png)

**Bootstrap 2 按鈕設計特色**

1. 明顯的漸層
2. 鮮豔的色彩
3. 些許的內陰影
4. 4px的圓角
5. 凸起的立體感

早期的按鈕，許多都是用圖片做的，因為圖片可以表現立體感、圓角等等的質感，以前的CSS沒有辦法達到這樣的效果。直到了CSS3，圓角、漸層、陰影都可以透過CSS運用在web上，此時也就流行了透過CSS達到圖片可以做的效果，如Bootstrap 2所表現的。

這當中我最愛他的primary預設藍色漸層色彩，不僅顏色抓得恰到好處，搭配著些許內陰影，充分表現出類似圖片所能呈現的質感，但又更為精緻。

## Bootstrap 3

[Bootstrap 3](http://getbootstrap.com/)

![](/images/2014button/2014-11-24-button_01.png)

- [扁平化設計](http://techorange.com/2013/07/19/5-dangers-of-flat-design/)
- [Metro UI](http://zh.wikipedia.org/wiki/Metro_UI)

在Window 8推出以後(Metro UI)，許多UI設計開始導入扁平化設計(Flat Design)的概念，而Web當然也不例外。扁平化就廣義來說，是相對於擬真的設計，去除了陰影、立體感，使用色塊來組成視覺的界面。

**Bootstrap 3 按鈕設計特色**

1. 單色、無漸層
2. 顏色較為沈穩 
3. 無陰影
4. 一樣4px的圓角
5. 無立體感

相對於Bootstrap 2的立體效果，Bootstrap導入了扁平化設計的概念，除了圓角外，其他立體效果都被移除。雖然沒有以往的立體感，但這樣的做法可以有效地減少使用者界面複雜度，更能凸顯按鈕的功能。

整個Framework在設計上相當的偏重於功能性，移除了大部分的漸層、陰影，在單一按鈕的設計上，雖沒有Bootstrap 2 那麼的豐富，但也因為如此，他更能配合各網頁原有的設計，不會過度的突出。

## Jquery Mobile 1.3

[Jquery Mobile 1.3](http://demos.jquerymobile.com/1.3.2/)

![](/images/2014button/2014-11-24-button_06.png)

![](/images/2014button/2014-11-24-button_07.png)

[Jquery Mobile](http://jquerymobile.com/demos/)

Jquery Mobile 是基於Jquery所開發的行動裝置Web Framework，不僅在樣式上，還有許多的在行動裝置可用的效果，而這款Framework也有屬於自己的CSS 樣式。

**Jquery Mobile 1.3 按鈕設計特色**

1. 淺漸層
2. 顏色較為暗沈
3. 有陰影
4. 1em的圓角
5. 明顯浮起的立體感

Jquery mobile像對於其他CSS framework來說，視覺感較為工程導向，和Bootstrap2 比較來說，顏色稱不上鮮豔，較為混濁。畢竟Jquery mobile是用在行動裝置上，所以在規劃上並不是只有美觀，它凸顯了按鈕的立體感並且增加按鈕的尺寸，以便於觸控。


## Jquery Mobile 1.4

[Jquery Mobile 1.4](http://demos.jquerymobile.com/1.4.5/)

![](/images/2014button/2014-11-24-button_05.png)

Jquery Mobile 1.4和以往的設計有很大的落差，最大的差別就是導入了扁平化設計，所以在預設的款式是沒有圓角、陰影、漸層等效果。

**Jquery Mobile 1.4 按鈕設計特色**

1. 無漸層
2. 預設僅有黑白兩色
3. 預設無陰影(可選擇)
4. 預設無圓角(可選擇)
5. 無立體感

就像上圖一樣，預設的按鈕相當的扁平，雖然他也提供圓角、陰影作為選擇，但沒有以往的強烈。另外在尺寸上有很重要變化，就是基本的按鈕高度為44px，44px是行動裝置上手指合適的觸控範圍尺寸。

而Jquery Mobile兩個不同版本也刻意一起放出來比較，兩個在設計上已有很大的落差，1.4去除了許多裝飾(大圓角、漸層)，也將小圖示從`png`圖片換成了`svg`，這在retina顯示器的表現更為精緻。整體設計來說，我偏愛1.4的扁平化，不知大家覺得如何？

## Pure

[Pure CSS](http://purecss.io/)

![](/images/2014button/2014-11-24-button_03.png)

![](/images/2014button/2014-11-24-button_04.png)

Pure CSS Framework的設計理念是為了讓CSS更為簡單化，所有的元件都分為核心以及擴充兩類別，核心通常定義元件的尺寸、瀏覽器相容性，擴充則是定義元件的色彩、更多尺寸、不同狀態等。

**Pure 按鈕設計特色**

1. 無漸層 (Hover有) 
2. 單色
3. 無陰影
4. 2px 圓角
5. 無立體感

Pure的按鈕，就視覺上是我喜歡的類型，有著簡單的外形、細膩的變化，用相當少量的程式碼達到跨瀏覽器的效果。另外Pure的按鈕有個很特別的特色，是其他Framework少見的效果，就是在hover的色彩，按鈕無論是哪一種顏色，都僅用半透明的漸層色覆蓋在上面，這樣可以有效地減少CSS程式碼，又能表現出hover的效果
，我想這是最符合Pure簡化的個性吧。

Pure整個Framework在設計概念上就是要不斷地縮短CSS code，所以和其他Framework都有些不同，但又同時保有細膩的設計，也是很值得參考的framework。

## 結論

以上列出了幾款不同framework的按鈕，不論他的架構，透過不同的設計，自然而然就會產生不同的個性，而這些個性，也會依據觀者的不同，會有不同的解讀方式；有人會喜歡Bootstrap 2的鮮豔漸層變化，也會有著許多人喜歡Bootstrap 3的純粹色彩，當然顏色深淺、鮮豔程度也都有不同的觀感。

在製作時，**參考合適的Framework風格(設計)，並挑選合適的執行方式(CSS)，在初學上可以減少錯誤**，提升專案的可執行性。

這篇看到了相當多的按鈕，接下來可能會出現一個問題，**目前畫面適合放什麼按鈕**，所以下一篇要介紹的是按鈕在畫面上的佈局規劃，如何透過簡單的方式，清楚了解目前畫面上合適的按鈕樣式。



