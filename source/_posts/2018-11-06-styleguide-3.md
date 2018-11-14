---
layout: post
title: 鐵人賽：網頁設計 - 網頁設計規範 - 定義不斷出現的網頁元素
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fholy%2021.png?alt=media&token=5d539b8f-22d2-437e-9c0e-838c626eb267
published: true
---

定義玩基本要素如文字、色彩、空間等等後，就可以開始定義常用的「元件」，而每一種應用程式、環境都具有固定會不斷出現的 UI 元件，如桌面系統的應用程式會有固定的導覽列、關閉縮小視窗的控制項及固定的外框，雖然這些也是能夠調整，但調整的同時也意味可能會影響操作體驗。

網頁設計、行動 APP 也是如此，本身都會具有固定的 UI，這些 UI 對於一般用戶來說是很容易理解使用的。

## 表單元件
預先設定元件的目的，不外乎是在設計前預先準備完成，限制後續設計的變化，但同時增加開發速度，因此預先定義的元件樣式盡可能可以符合所有情境。當然，最重要的是能夠符合網頁開發的標準。

### 表單結構

在 HTML 中的表單結構如下：
```
form
  div
	  label Email address
    input(type="email" placeholder="Enter email")
  div
    input(type="checkbox" placeholder="Enter email")
	  label checkbox
  button(type="submit")
```

最基本的會有一層 form 標籤，表示其內部是需要送出的表單內容（所以表單內容是被限制在 form 區域內），內部會有 label 及 input 對應，label 表示該 input 所需要輸入內容的說明，input 則是用戶實際輸入的內容，兩者會透過 id 互相對應（這屬於前端技術，在此不多介紹）。最後會再補上一個 button 作為最後送出的按鈕。

透過以上的結構可以得到以下的畫面，這也是大家所熟悉的網頁表單，以下我們就針對常被忽視的設計來與大家說明：

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fform-1.png?alt=media&token=18e3441d-c5d0-4d57-943f-620b281c1109)

#### 缺少 Label
雖然網頁中沒有 label 表單依然可以正確運作，但依據網站親和性的概念（[label](https://developer.mozilla.org/zh-TW/docs/Web/Accessibility/ARIA/forms/Basic_form_hints)），缺少 label 會難以讓裝置了解該欄位的名稱及用途。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fform-2.png?alt=media&token=e4142cf9-beb2-4fdd-b774-39c68641587c)

#### checkbox 及 radio
現在 Checkbox 及 Radio 的外觀都能夠客製化，但做這樣的調整時必須確保：
- 大部分瀏覽器看起來是一致的
- 不會影響到用戶的操作經驗
- 如果有搭配 JS，請確保在各種情境下都能運作

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fform-3.png?alt=media&token=bc86ef32-ade3-42fb-b870-feee9d760f14)

#### 不同類型的 input

`input` 的類型非常多元，正確地運用可以減少開發者的負擔，並且增加對於行動裝置的支援性。以 type="date" 來說，Chrome 瀏覽器就會跳出一個行事曆，在行動裝置上用戶就會跳出日期選擇器，而跳出的行事曆是固定外觀不能做樣式的調整。如果要追求符合品牌的外觀，請務必同時兼顧行動裝置的使用體驗。

除此之外，有部分的 input 類型是可以自定義外觀的，如：type="range"、type="file"（嚴格說起來 file 也不太修改，但還是有方法）。因此需要先認識所有類型的 input，並預先設計可能會使用到的類型。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fform-5.png?alt=media&token=66fb1a8c-6bf8-449a-bab5-47944411d961)

#### 提示文字

`input` 中還有一個 `placeholder` 的屬性可以作為用戶填入文字前的提示，這通常是利用填寫前的提示，另外也可以在 input 下方加上提示文字，這會偏向填寫時或填寫後的提示。

不管如何，請別忘了還有提示文字需要被設計。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fform-6.png?alt=media&token=3fcc100c-a615-4b07-8bf2-36a1e24cb657)

#### 與 Button 可以併排

設計時，也盡可能與 `button` 一同設計，因為會有不少情境是兩者併排出現的，如果不能併排還挺尷尬的。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fform-7.png?alt=media&token=aaa66948-421f-4a25-bc51-d96c977522cd)


#### 禁用、錯誤狀態
最後提醒，設計規範是預先定義所有會利用的情境，所以禁用、錯誤雖然設計中不一定會出現，但請確保工程師執行時能夠了解該外觀為何。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fform-8.png?alt=media&token=9d181296-a041-46ec-b69f-9665366609b5)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fform-9.png?alt=media&token=61690a93-a4b4-472e-b54f-2484398f831d)


## 結語
定義規範是相當辛苦的，必須熟悉網頁基本運作流程，還要預先思考可能會運用的情境，但有了固定規範後工程師能夠先以規範定義元件庫，設計師更能快速建構頁面所需的內容。