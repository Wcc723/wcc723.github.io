---
layout: post
title: 鐵人賽：網頁設計常用格線系統(上)
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2Fholy%2004.png?alt=media&token=544df737-1cf9-431b-8db8-1f76ec4dc686
published: true
---

學習設計的時候，一定會討論到網格系統，透過網格可將圖片、文字做有條理的編排，只要有了網格做支撐，就算是複雜的圖文都會有規矩的排列。相反的，如果平面設計缺乏網格系統，就算簡單的圖文要排列整齊也並非容易的事情。

本篇分別介紹幾個部分：
* 960gs
* 名詞解釋
* 格線設定 及  計算方法
* 實例
* 實際運用
* 格線與響應式的搭配

## 960gs

當然網頁設計也不例外，我們通常稱為 Grid System。在 RWD 盛行起來之前最著名的網格系統稱為 960 Grid System，主要是因為早期的電腦螢幕寬度約為 1024，扣除瀏覽器的捲軸及邊框，960 則是許多數值的最小公倍數，所以被廣泛的討論及使用，直到現在許多 CSS 框架也是有 960 的設定值在內。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F82395B90-ACDB-400F-A4A6-4E94F7F74EC8.png?alt=media&token=14620d08-3128-4d00-8550-10c7564b20d4)
https://960.gs/demo.html

960 Grid System 的概念是將 960 區分為 12 欄（也可設定為 16, 24，依據需求不同會有不同的欄位數），接下來網頁中的元素就依據欄位數來排列內容，在 [960gs](https://960.gs/) 的網頁中也有提供許多範例是依據這個概念所執行的。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F4EFFD87E-50A4-41FD-840D-11C939D83A8C-1.png?alt=media&token=015dfb7e-8f85-4fcf-afc1-d34a1fe7abf6)

雖然範例中的網頁都有些年代，在網格系統的引導下具有固定的欄寬及間隔，資訊的呈現依然整齊、清楚，並不會感受到雜亂難以閱讀。

## 名詞解釋
介紹 Grid System 名詞時，我喜歡使用 Sketch 的工具，它列出我們在使用 Grid System 的常用設定。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F77F14F49-3ED6-4E80-9EF2-C989D1433DEB.png?alt=media&token=edc61693-fbf6-4337-a5ba-678c0137a4c3)

Total Width: 總寬，網頁主要內容呈現的範圍
Offset: 推移，這是屬於 Sketch 畫布的設定可以無視
Number of Column: 總欄位數，12 是常用的數值，16、24 也是許多開發者使用，這些數值同時是許多數值的最小公倍數。
Gutter Width: 間隔寬度，欄與欄的間距。
Gutter on outside: 外部間距，設定的間隔寬度是否要加在外層。
Column: 單一欄的寬度，總欄位數、間隔寬度及單一欄的寬度數值會有連帶的關係。

實際的結果會如下，960 是一開始設定的總寬度，但如果有加上 Gutter on outside 就會將 (間隔寬度 / 2) 加到畫面的左右外層上，Gutter on outside 的用途是避免網頁主要內容過於貼近瀏覽器邊緣，所以會預先保留一些寬度，但直接保留一個 間隔寬度 會顯得過寬。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_9_26_%E4%B8%8B%E5%8D%884_01.png?alt=media&token=46544f7f-88a9-4ff6-aa30-84a0ec9b71a2)

一個欄的寬度是 60px，但兩個欄位數的寬度並非是 120px，會再加上兩者之間的欄位間隔，所以數值會是 60 + 60 + 20 = 140px。
欄位寬公式：欄寬 * 欄位數 + (欄位數 - 1)

除此之外每個欄寬的數值也是受到「總欄位數、間隔寬度」的影響，實際上會建議自行繪製看看，搭配公式來了解這些產生的原理。
單一欄寬公式：(總寬度 - Gutter on outside)  - 欄位寬度 * (欄數 - 1)) / 欄數
範例：((960 - 20) - 20 * 11)  / 12

以上都是觀念，如果了解的話其實透過工具產生即可，並不需要記憶這些公式。

接下來回到這個網頁上，相信你就能理解這些數值的設定分別包含哪些內容，試著思考：假設下方網頁為 960px、欄寬 60px、間距 20px，並且包含外部間距的情況下，請問四籃寬度的內容約佔多寬？

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F4EFFD87E-50A4-41FD-840D-11C939D83A8C.png?alt=media&token=8b64eb2b-34b9-4955-9aef-d9bd6bd0db00)

到這部分相信你對於基本網格系統有基本得了解，雖然在設計時不會一格一格去數多少寬度（通常是直接拉欄位數），不過在具備以上觀念後，我們再來介紹時暫時我們會如何的運用這些觀念。