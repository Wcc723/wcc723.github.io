---
layout: post
title: 鐵人賽：網頁設計 - 設計師與開發者的溝通工具
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fholy%2025.png?alt=media&token=9db583fd-1792-4a5f-8ebc-ec4548808117
published: true
---

溝通非常重要，不好的溝通不只沒有效率，也會造成不同領域間的嫌隙。如同設計師跟業者索取素材資源時，業者提供的是低解析度的 word 檔案，也很難解釋什麼叫做更高解析度的圖片！設計師對上工程師也是相同道理，如果給予的是 .ai、.psd 檔案，工程師會難以從中獲得執行所需要的資訊（需要另外學習如何操作）。

本篇就提供一些好用的工具，讓工程師與開發者可以了解設計師的規範，並且可以即時回饋讓設計師便於修改。

## Markman
http://www.getmarkman.com/

Markman 是中國廠商開發的 UI 標示工具，可以用於「輸出後」的圖片，只要透過簡單的拖曳就能標記出色彩、距離、輔助說明等，操作上簡單易用。由於是運用在輸出後的圖檔，所以無論是哪一種繪圖軟體都可以搭配運用（另外支持 PSD）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fmarkman-length.gif?alt=media&token=028344c5-ac61-4cda-a104-034011030cc6)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fmarkman-color.gif?alt=media&token=45db7847-0679-4a73-b1af-f93c3ec0d4da)


## Sketch Zeplin
https://zeplin.io/

Zeplin 最早是 Sketch 的擴充功能，目前還支援 Photoshop、Illustrator 等繪圖軟體，算是真正整合設計軟體、設計規範、工程師協作的工具，透過 Zeplin 設計師可以一鍵輸出所有的設計規範，且不需要另外標示尺寸、色彩等。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2F0AE8CF4A-599B-40D2-93E3-A7F9B4A3A94A.png?alt=media&token=9819d5f4-4e66-4e8b-88c1-aa473cf68b7c)

工程師可以透過該工具直接取得所需要的資訊，如尺寸、間距、色彩，這讓畫面不至於因為過多標示感到凌亂，也能得以呈現更多的資訊。不僅如此，開發者也可以依據所開發的平台（Web、iOS、Android）從中取得所需要的程式碼。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FF2802599-3411-41B7-856E-87AA30180A9F.png?alt=media&token=302f8f5e-7a9d-47cc-8cc5-d9f39b3134ca)

Zeplin 官網有詳細介紹：https://zeplin.io/why-zeplin
過去寫過的相關文章：https://wcc723.github.io/tools/2015/04/09/zeplin-intro/

## Adobe XD Spec
範例設計稿：https://lihi.cc/LAfsC
介紹說明：https://helpx.adobe.com/tw/xd/help/design-specs-for-developers.html

Sketch 並沒有屬於自己的規範工具（類似 Zeplin 那種），而 Adobe XD 則是有推出 Spec 工具，只要有付費 Adobe CC 都可以直接運用，目前雖然功能並非如 Zeplin 那樣的完整，但在 Web 開發上也是相當足夠使用。

基本的間距、尺寸、色彩資訊皆有呈現。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2F05CF299A-DA45-4971-B645-0FB58BC11246.png?alt=media&token=e9177d79-e457-43b3-8bf0-d0652fe486ca)

另外也有討論工具。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2FDCCC0131-87FE-4D40-9921-86C5BD2B6D81.png?alt=media&token=708dfd70-49c0-4fc7-b8ef-b4ebb69fa8f8)

## Slack
Slack: https://slack.com/
台灣聊天使用的是 LINE 工具，除了閒聊外還有完整的表情圖片可以運用，非常適合抒發情緒。但在開發上還是建議使用工作用的通訊工具，主要是對於開發有完整的支援性，另一方面也可暫時關閉閒聊用的通訊工具，確保工作上的專注力。

與一般通訊工具一樣，基本的留言、搜尋都沒有問題，除此之外也有重點字詞標示、子討論項目等功能，且可以與各大現有的服務做整合如：Github、Google Drive 等等，使資訊更新時 Slack 都能及時收到。

#### 整合 Adobe Creative Cloud
https://slack.com/apps/A7P35MCT0-adobe-creative-cloud

透過 Slack 不僅可以傳遞規範網址以及預覽，也可做到設計師更新規範時，Slack 會即時收到規範已更新的訊息。 

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2F0E53C9F4-9AE0-47B2-A943-0F0B5DFD9E12.png?alt=media&token=21d04614-ae12-4030-929b-98c1633cdb31)

## Dropbox Paper
為了不讓 Sketch 專美於前，Adobe XD 不僅有類似於 Sketch 的功能，且還與各大廠商合作（如前面所提到的 Slack 服務），Dorpbox Paper 則是整合文件與 Adobe XD Spec 的功能，使匯出的規範連結貼入 Dropbox Paper 時能夠直接預覽。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fxd-paper-demo_smaller.gif?alt=media&token=3e2d067a-fd71-46c5-9c13-73ece8f5f004)

詳細說明：https://blogs.dropbox.com/dropbox/2018/10/adobe-xd-dropbox-paper-integration/

## 結語
好的工具不僅可事半功倍，用在溝通上也可以增進感情，身為設計師不喜歡收到解析度不足的檔案，工程師也希望能夠收到標示明確的文件，本篇介紹的工具都不需要花費太多精力就可以使用（但可能需要花點＄），如果有更好用的工具也歡迎在下留言讓我知道。