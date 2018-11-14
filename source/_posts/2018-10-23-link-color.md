---
layout: post
title: 鐵人賽：色彩運用(2) - 連結的配色
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2Fholy%2009.png?alt=media&token=9c753bac-be7d-4ea9-b477-0453344de08d
published: true
---

除了親和性的配色外，訊息的傳遞也是很重要的，與平面設計不同的是訊息並非只有圖文的傳遞，還包含了狀態、互動、提示等等訊息，訊息也同時可以用許多不同色彩表示，增加訊息所能表示的情感、急迫性、引導性等等。

## 連結色彩（包含不同狀態）
網頁設計中的 `<a>` 除了本身的預設樣式外，另外還包含以下幾種 “狀態”

* a:link - 未拜訪過的連結。
* a:visited - 已拜訪過的連結。
* a:hover - 滑鼠回入的連結。
* a:active - 按下狀態的連結。
* a:focus - 鍵盤專注的狀態。

a:link - 未拜訪過的連結及 a:visited 已拜訪過的連結，這兩種並非在所有網站都有這樣的需求，通常會運用在「需要紀錄已讀取」的網頁上，像是搜尋引擎就是很好的例子（但現在很多都改用 JavaScript 來設計）。

設計：可視專案需求來決定是否加入這個樣式。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F2F65522E-E61F-474D-811C-B27EDC9394B3.png?alt=media&token=06b61eb9-7c5c-4651-b03b-c153c0b4e2c0)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FA27070D7-1AB7-40D2-951C-CD10E1EBFC88.png?alt=media&token=1e7771cc-04c4-4479-acdc-2f243268d976)

a:hover - 滑鼠回入的連結，這個樣式普遍都會製作，主要讓用戶滑鼠滑入時了解「這是一個可互動的按鈕」，如果少了這個樣式用戶可能會誤以為沒有連結。但要特別注意，這個樣是在行動版無法正確的呈現（因為手機沒有滑鼠 hover 的事件）。

設計：在文本中的設計中大多會使用略深的主色或次要色，然後加上下底線作為呈現。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F6C26DA61-6A01-4CF7-8E6D-EE7689E6B1C5.png?alt=media&token=8a867d9a-b5ae-49e8-bfa0-123de1742980)

如果以按鈕呈現，也會使用略深為按鈕原色的設計

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F79200816-D5F7-4FC3-9884-7FC466A7EEF4.png?alt=media&token=e92b71ad-1640-4171-8773-237cc1273b1b)

a:active - 按下狀態的連結，這是滑鼠按下的樣式，通常會與 .active 一起製作，而 .active 可以透過後端或 JavaScript 直接套用在按鈕之上，表示目前啟用中的按鍵。

設計：通常會使用略深於普通狀態的色彩，設計時可以與 .active（啟用樣式）一起設計（文本有時不會設計，或同 hover 樣式）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F64EB9303-2FC9-4186-BE41-93CDD10A34E3.png?alt=media&token=0a88aba5-6d4f-4993-b9a1-d4f1b68d09a3)

a:focus - 鍵盤專注的狀態，許多用戶會使用鍵盤搭配 tab 來瀏覽網頁（也有一部分是屬於視覺障礙者），這個專注狀態可以讓用戶了解目前「專注」的按鈕，如果用戶需要按下此按鈕，則可以按下 Enter 鍵。

設計：文本中會使用瀏覽器預設的外框，主要是因為文本中不一定能調整高度，視覺上可能會干擾到其他文字的閱讀，因此不一定會另外設計。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F6C26DA61-6A01-4CF7-8E6D-EE7689E6B1C5.png?alt=media&token=8a867d9a-b5ae-49e8-bfa0-123de1742980)

按鈕會在原本按鈕外增加一圈類似色彩，如果沒有另外設計則會套用瀏覽器預設的樣式。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F89012DDC-D2EF-497F-A3C9-4D1B004E38CD.png?alt=media&token=125d35a2-c792-4e0f-9098-591e0e7a12a8)

瀏覽器預設的 focus，每個瀏覽器略有不同（下圖為 Chrome 的樣式），預設樣式不會隨著網站設計改變，大多會使用藍色外框，因此會建議自行設計。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FFA50D4EE-5F03-4F2B-AD39-AEE3A86ECECC.png?alt=media&token=737e94be-7be4-429a-b120-58401c24d56c)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F2029E89B-E96E-47D7-9954-3074680AB1B4.png?alt=media&token=0ee1bfda-d570-43ab-aadd-0fdb85deeaba)

部分網頁設計師由於沒有程式開發的經驗，所以會忽略許多行為上的樣式狀態，除了 link, visited 外，其餘都是設計時必備的項目，一開始就必須加入喔。

## 結語

按鈕互動對於使用者回饋相當重要，如果缺乏足夠回饋，用戶時常會以為該連結是否無法運作。而設計師為了追求畫面上的完美，有時會疏忽掉用戶操作的回饋，執行上則會建議一開始預先定義相關元素的互動狀態、錯誤行為等等，避免後續開發上的疏忽。