---
layout: post
title: 鐵人賽：色彩運用(1) - 你的網頁文字是否足夠清楚呢？
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2Fholy%2008.png?alt=media&token=aa26b49e-bb7a-4b2c-b2e2-4a8790234223
published: true
---

上一篇介紹了整體色彩選擇，按造該概念完成一個網頁相信不是什麼問題，不過色彩到底怎麼選？運用上有什麼需要注意的？本篇就來介紹一下吧。

Accessibility：這個單字翻譯有很多意思，如：「無障礙」、「親和性」、「可訪問性」，其中我最喜歡的是親和性的翻譯，因此把它作為此篇文章的標題，而在 Google 的相關文件中翻譯為「可訪問性」，在本文中看到「親和性」、「可訪問性」都是指此單字喔。

## 網頁可訪問性分數
網頁配色時除了要好看之外，色彩所造成的訊息傳遞功能依然不可降低，如黑底白字、白底黑字是普遍來說閱讀性佳的色彩組合，但這個組合並不一定適合所有的品牌配色，如果品牌顏色為綠色（#509955）那麼這樣的顏色作為文字色彩閱讀性是否足夠呢？

網站內容親和性規範 [The Web Content Accessibility Guidelines (WCAG 2.0)](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html) 將文字與背景對比度區分為不同等級，在主要的內文排版中至少要有 4.5:1 的對比度（AA 級），除了一些情境之外可以不需要達到這樣的標準：
* 較大的文字：超過 18px 或 14px 的粗體文字對比度可降為 3:1
* 附屬的文字：裝飾或者圖片一部分的文字可以不遵循此標準
* 品牌文字：如果文字為品牌一部分，也可不遵循此標準

Google 的 Web Fundamentals 有完整一篇文章說明該如何實踐這個概念（[可訪問的樣式](https://developers.google.com/web/fundamentals/accessibility/accessible-styles)），下圖也演示了不同對比度的視覺關係，4.5:1 則是大部分可輕鬆閱讀的對比度，如果您的網站需要給予老年人或視力不佳的人閱讀，建議可以將標準提高到 7:1。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F058BBAA0-AB20-46BC-966F-94FC1454B407.png?alt=media&token=18d7d423-76db-4768-b829-c7c2e354d90e)

回到前文所說：「如果品牌顏色為綠色（#509955）那麼這樣的顏色作為文字色彩閱讀性是否足夠呢？」，以下簡單介紹該如何檢視此段文字是否符合標準。

這次透過該色彩所展示的一段文字，無論現在肉眼看起來是否足夠清晰，我們來透過工具說明是否符合標準。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F65E8C8C9-C4B6-446F-9AAF-2915F46C5E25.png?alt=media&token=411f818a-69e2-4194-b361-af4e588579d2)

接下來透過開發者工具，點選該文字 -> 右鍵 -> 檢查 可以看到如下的介面，然後再點選色彩就能看到以下資訊。（如果不知道如何使用開發者工具，可以參考我們的免費課程：https://www.udemy.com/chrome-devtools/）

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_10_8_%E4%B8%8B%E5%8D%883_04.png?alt=media&token=c50fa8b0-1a52-475f-8aeb-e965f51b6113)

接下來，點選 Contrast ratio 右方的箭頭 icon，展開看更多細節，接下來可以直接透過上方的色版調整色彩，色版中也給予建議的標準線，只要超過標準線就至少通過 AA 級，下方也有標示是否符合 AAA 級的對比度。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_10_8_%E4%B8%8B%E5%8D%883_09.png?alt=media&token=36b78c11-6d42-4b19-a454-e9cd44763d8c)

接下來我選擇一個 #458449 的色彩至少符合 AA 級（4.54:1）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_10_8_%E4%B8%8B%E5%8D%883_14.png?alt=media&token=21ed8d1a-f6b1-4473-82d8-b30823764574)

再重新查看此文字是否符合網站的標準色，我們也可以用此方法作品牌色的延伸，套用至所有的網站文字之中。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F9B8B266D-5176-43A1-B830-EB70F7026E14.png?alt=media&token=492ea152-14b5-4ac5-9cbf-4671a9a3aa8f)

另外，這個工具也可針對不同色彩的背景做調整，如下圖我選擇另一個藍綠色作為背景色，

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FA0C4AA78-6264-4623-AF98-A9B3D87F76C2.png?alt=media&token=d772d46d-5780-484d-8511-51cbe78c2994)

此時對比度也會顯示不足夠。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FC0BD0C4B-E71E-469B-9780-99C9FDD59DB3.png?alt=media&token=7b5bac58-0c0e-48a4-bb0f-4cc227cb21e0)

## 結語

色彩的親合度使用上也必須注意不同的背景色變化，以及互動連結、按鈕等等的搭配，甚至還有針對目標群眾調整更高對比（年邁、視力不佳者），符合品牌的同時，我們還有很多的細節可以處理喔 :D。
