---
layout: post
title: 鐵人賽：網頁設計 - 網頁設計規範 - 參考來源
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fholy%2021.png?alt=media&token=5d539b8f-22d2-437e-9c0e-838c626eb267
published: true
---

網頁設計許多概念是受到限制的，因為除了設計外也要同時重視可行性，因此預先定義規範不僅預先了解可執行的限制，對於工程師來說更方便預先建構元件。

但設計規範並不是一件容易的事情，同時必須在意可行性、延展性、穩定性。

* 可行性：確保規範是可以被執行的
* 延展性：未來的更新是有預先規劃的
* 穩定性：不可隨意進行破壞性更新（break change）

本篇提供一些概念給予參考，讓還沒有想法的設計師了解可以從何取得資源，並且慢慢著手加入設計規範。
## Bootstrap
Bootstrap 官網：https://getbootstrap.com/
繁中版：https://bootstrap.hexschool.com/

Bootstrap 是網頁使用的 CSS 函式庫，內建許多現成樣式可以直接運用，讓不熟 CSS 或設計的開發者都可以做出一定品質的網頁，是目前使用最為廣泛的 CSS 函式庫（沒有之一）。

雖然他預先定義的樣式不一定被設計師所喜歡，但卻是非常標準、符合網頁開發原則的。以下列的標題字來說尺寸的變化具有一定的級數變化，轉換為網站運用的尺寸也是固定的整數。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FC17E7C9F-4C9F-4E47-8D7A-F71BE115B96B.png?alt=media&token=2873b88b-f15f-4f16-8d40-8f540130f5b7)

先前所介紹的固定尺寸級數，也就是從 Bootstrap 所延伸而來，如果沒有預先定義所有標題級數，後期新增時會出現間距不明顯或間距過大等問題。
```
設計師用的尺寸：   工程師所用的尺寸
16px        :   1rem
20px        :   1.25rem
24px        :   1.5rem
28px        :   1.75rem
32px        :   2rem
40px        :   2.5rem
```

除了標準的文字、色彩的定義外，Bootstrap 在元件設計上也是用盡心力，如下方的 Navbar 為了定義出多種色彩的變化，它則是將文字的顏色設計成具有「透明度」，使他在不同色彩下都能夠自然的呈現，這樣的概念也可運用於設計之中（變化性不只案例中的三種，而是幾乎所有色彩）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2F703E8205-5108-490C-A1C7-B1DEADD311C1.png?alt=media&token=7aa08b3d-6576-4ba0-9f67-c82cefb72850)

## Adobe XD UI Kits
Adobe XD Resource: https://www.adobe.com/tw/products/xd/resources.html

Adobe XD 目前在拓展階段，為了整合更多資源提供了 plugins、App internrations、UI Kits、Icon sets 等，不乏與各大企業合作或者整合性的服務，其中的 UI Kits 就有一份完整的網頁設計 wireframe 可作為設計規範（此份規範還不斷再更新中）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2F1CB88347-A001-4808-BD24-9E268E1FC90E.png?alt=media&token=d8442fb7-3138-43a8-bb09-cfa9884ae694)

本份文件從基礎的色彩、文字、字體開始，並提供完整的按鈕、表單、卡片的常見網頁元件，還提供大範圍的區塊元素如：頁腳、價格表、結帳頁面、資訊陳列區塊。幾乎可以算是設計軟體版本的 Bootstrap，非常值得參考。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FBEEC2927-AB3E-4257-938E-38889D4437E8.png?alt=media&token=a40469b4-d146-455a-9cbd-939042c30d32)

雖然本分設計稿是以單色呈現，但是設想了許多情境非常值得參考，以下方到表單來說就包含未填寫、填寫中、離開 focus、錯誤提示等等，而這也是我們設計表單時經常會忽略的部分。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2F20F7ED75-A67B-4E1D-8AB4-56657F30328C.png?alt=media&token=0f513dab-d88e-4334-ba03-a9ccecfc04ce)

在這份設計文件中，同樣的目標會提供數種排列風格做變化，以價格表來說就提供了十種變化，下圖節選四種。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2F84279B6E-6F1B-4961-93A6-FF2AD367546C.png?alt=media&token=8fa2dc41-6698-4b44-94fd-4144255cf2ac)

## Material Design

當然，最完整的設計規範還是可以參考前方不斷提到的 Material Design，不僅在應用上有完整說明，還有包含完整的設計理念，有機會可以將整份閱讀一次，對於設計規範會有很多的靈感及想法。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2F783F238E-5E8B-4BB3-9593-8E6A56A84C3D.png?alt=media&token=f387b260-496b-4c58-a680-5f7457df1873)

## 結語
進入一個新領域時難以在短時間內就掌握所有細節，最好的方式是透過最佳範例來了解該如何運作，如 Bootstrap、Adobe XD UI Kits 都是很棒的案例，這些都具備了前人實作的經驗，並經歷上千、萬人的驗證。參考這些方式會比閉門造車有更好結果，並且增加設計規範的可行性、延展性及
穩定性。