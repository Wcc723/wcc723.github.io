---
layout: post
title: 鐵人賽：文件、規範參考 - Material Design
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2Fholy%2006.png?alt=media&token=e342628f-addd-4015-a5ba-17a21560cf45
published: true
---

程式領域裡面非常重視文件，當然 UI 中也是如此，為了確保設計可以被執行，大型應用程式、系統都會推出屬於自己的規範，如：

* iOS 的 [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
* Google 的 [Material Design](https://material.io/design/)

而除了上述的作業系統 / 應用程式外，網頁開發也是有相關的概念，在 [Styleguide](http://styleguides.io/) 這個網站中就可以查詢到許多相關的範例。

## 規範可以帶給我們什麼？

簡單來說就是限制設計師的風格，一般來說設計師都會有屬於個人的個性及風格，而網站開發都並非少數人即可完成，就有可能出現同一個顏色各自表述的情況，可能會發生的狀況有：

* 色彩不統一：我的紅與你的紅不同
* 間距不同：有些設計師偏好雙數的間距，也有設計師喜歡 5 的倍數
* 字體、字級、字重不同：就算是相同字體、字級，設計師也可能選擇不同字重
* 插畫風格不同：每個設計師的手繪能力也不同，所以也會造成插畫風格上的差異
* 格線定義不同：這個在上一章也有提過，設計稿如果格線不同也就難以對齊
* 動態轉換不同：雖然在網頁中比較少演示這一段，但轉換速率、漸變函式 （ [transition timing function](https://developer.mozilla.org/zh-TW/docs/Web/CSS/CSS_Transitions/Using_CSS_transitions) ）不同，使用者體驗也會有不一致的問題。

就以 Material Design 來說，建立網站色表時也可以同時產生 主色、次要色、延伸色、背景色、錯誤、文字應用色等等，那麼接下來做延伸設計時也可運用相同觀念。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F18132362-3A8E-46C0-856E-FCFB4F556C59.png?alt=media&token=917f0bec-c1f8-412d-bfc2-63165d29e349)

色彩選定後 Material Design 也會提供許多案例供設計師了解這配色該如何運用，以下圖來說錯誤訊息應使用 Secondary Color，而不是使用帶有緊告意味的色彩或是其它品牌色作為強調色

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FECD0AC44-9ACC-47D7-8923-468B6FB3299E.png?alt=media&token=b07eb9ef-2376-4f80-9f91-df6afb263b19)



## Material Design 的優點
除了 iOS、Material 這兩大系統的規範外，製作網頁其實也有很多規範可以參考（[Styleguide](http://styleguides.io/) ），此時可能會思考為何要閱讀 Material 這樣的規範呢？

除了有固定的樣式外， Material Design 提供了許多優良概念值得去思考，這部分列出一些我認爲很棒的概念給大家參考：

### 「紙」的風格
https://material.io/design/iconography/product-icons.html#design-principles
相對於目前主流的設計風格，大多強調簡潔、色塊，而 Material Design 卻在此基礎之上帶入「紙與墨」的概念，本段就以圖示來介紹是如何呈現紙的風格在內。

為了呈現出紙的風格，所以繪製 icon 時會直接製作出實體，並且觀察實體的光影變化（根本就是在畫素描水彩），透過實際觀察了解紙的切面、陰影、反光等視覺特性。

透過手工製作的 icon，這也是我們熟悉的 Gmail 雛形

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FEBB511FA-08EA-4250-BD6F-CAF7BA2BE85C.png?alt=media&token=5ad2c87b-b2fe-4432-b272-989ed10b1375)

打光，我們可以看到陰影的變化，除此之外也可以關注切面所產生的反光，這會讓紙的呈現包含厚度。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FF03A6E3F-05DE-45D2-8D96-B74662E4BD02.png?alt=media&token=e52766dc-d9f9-4060-a429-565694540466)

實際繪製及上色。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FF03A6E3F-05DE-45D2-8D96-B74662E4BD02.png?alt=media&token=e52766dc-d9f9-4060-a429-565694540466)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F4969401F-56EA-418C-812C-7B7BC0C7D7BA.png?alt=media&token=f4cbb5cf-4141-47d3-9f45-99b7c2bfdb82)

透過這樣的案例，對於圖示也定義了繪製的規範，使所產生的圖示具有一致性。如卡片的邊緣就使用如下的規範定義：

上邊緣：
* 高：1dp
* 透明度：20%
* 色彩：White (#FFFFFF)

下邊緣：
* 高：1dp
* 透明度：20%
* 色彩：參考相關色調及陰影

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F650A8615-57D3-4C68-9385-5485B93BC050.png?alt=media&token=66f20d11-d27d-4c55-824b-5fc4fc33c9f8)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F7593D9AE-E573-4BA3-A865-63EDF3D6223F.png?alt=media&token=edba474a-9a1d-4899-b05d-41f7835b43db)

### 陰影所代表的 「深度」

網頁是平面的，但內容在城線上還是會有前後的順序，如「操作中的物件」為了讓用戶了解他是正被操作的，可以使其更明顯些；而除了外框、修改色彩的方式，深度也是凸顯物件的好技法。

下圖中，拖曳的物件所產生的陰影，會讓物件感覺比較前面。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F44A9F8AF-4836-4078-8706-9F9DE0E038FE.png?alt=media&token=beecaa34-2bf0-4c57-b15f-5db11c9e355a)

實際演示的動畫

{% raw %}
<video aria-describedby="shadows-figure-caption-3" class="video-player__video animatable js-video-player js-video-load anim-appear" loop="" muted="" preload="metadata" controls autoplay tabindex="0">
<source data-src="https://storage.googleapis.com/spec-host-backup/mio-design%2Fassets%2F1lUqfq3Tt1qRQxZAn9gkROKMysc7G9Mhc%2Fshadowprinciples-list.mp4" src="https://storage.googleapis.com/spec-host-backup/mio-design%2Fassets%2F1lUqfq3Tt1qRQxZAn9gkROKMysc7G9Mhc%2Fshadowprinciples-list.mp4" type="video/mp4"> </video>
{% endraw %}

下圖兩個物件有著不同陰影，因此會感覺深度不同。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F1CBDBF23-CF88-46E0-9733-4AF82DBEF99C.png?alt=media&token=a198080f-031d-411e-9b2e-2950be262393)

深度的概念：下圖中 A 與 B 視覺上會感覺具有相同深度，從正面來看因為 A 具有 8dp 的陰影深度，B 與 C 各有 4dp 的深度，總合上與 A 相同，就會讓用戶感受到兩者的高度（重要性）是接近的。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F7CB5DEC5-C632-4F87-BB6C-8E2C8F4B3869.png?alt=media&token=e242b3d5-f42b-45c6-b30a-dfa309a46253)


## 結語

本篇僅是概述設計規範所帶來的觀念，在此非常建議可以親自閱讀這些觀念，身為設計師會不斷的追求「創造力」及「獨特性」，Material Design 說明如何將一個實體的概念轉化為規範，其中的過程更能激發設計師的思考，除了學習符合開發的需求外，更從中了解如何創新。