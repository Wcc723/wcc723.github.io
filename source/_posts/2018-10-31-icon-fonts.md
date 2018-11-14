---
layout: post
title: 鐵人賽：網頁設計 - Icon fonts 的常見資源
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2Fholy%2017.png?alt=media&token=dd4999e1-ed06-4720-91d3-6c710d52adf8
published: true
---

網站開發加入一些圖示點綴，除了可以增加網頁的豐富度外，同時可以讓用戶從圖示中了解當下的行為為何。過去圖示大多使用 png 來呈現，具有豐富的色彩及尺寸，但隨著設計的概念不斷調整，現在流行單色系的小圖示，以及為了增加圖示可運用性目前大多使用向量的方式呈現。

接續前文所介紹，SVG 是可縮放的向量圖形，作為圖示運用有一定的優勢，本篇會介紹如何取用向量圖示資源，以及 icon fonts 的運用方法。

## 什麼是 icon fonts
Icon 是圖示，fonts 是字體，兩者混在一起就是圖示字體（被揍

簡單來說，我們平常使用的字體會有外觀上的不同，而 icon fonts 就是使用圖示修改掉特定的字體符號，讓他顯示成不同的圖形。如下圖所示，icon fonts 本質就是字體，也能夠像其它字體一樣安裝於系統中。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FF6A8B31C-7EFD-4CEE-B050-DDC3687B1739.png?alt=media&token=d2511796-1fa7-4680-993c-8e09b6b88192)

實際運用在網頁上時，除了圖形顯示外也同時具備文字的特性，如：可縮放、可改變色彩、可套用文字陰影，且只要載入 CSS 即可運作。技術上來說，大多是透過 **修改字體** 並從偽元素插入特定的 Unicode 的編碼文字來套用圖示，但也有部分的 Web fonts 是採用其它的渲染技巧。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2018_10_18_%E4%B8%8B%E5%8D%884_48.png?alt=media&token=673d06d0-5735-4060-af93-304a0c71b043)

接下來就能如圖中一樣的顯示這個 icon，並且這個 icon 依然具有文字的特性，可參考：https://fontawesome.com/v4.7.0/icon/address-book

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FD077F7D7-057A-4828-B92D-A5188AB54609.png?alt=media&token=3c7b1539-cd73-409d-9cd0-23efa3df47d8)

## Fontawesome

Fontawesome 是目前使用相當廣泛的 icon fonts，目前版本為 5.4.x 版，而除了 icon fonts 以外，現在更有 SVG 動態插入的方式。

5.x 版本：https://fontawesome.com/
4.x 版本：https://fontawesome.com/v4.7.0/

如果要使用 Fontawesome 的圖示做設計，可以直接點選 For the Desktop 下載圖示，下載後就包含大量的圖示 SVG 可以直接運用。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F09084698-A999-47B7-B5F9-3B7FD9431C03.png?alt=media&token=ae082dfb-b63c-4067-92fb-fb28c39ca783)

因為有數千組圖示可以運用，下載後難以從字面上直接了解圖示外觀，建議使用時可以搭配官方的 [圖示列表](https://fontawesome.com/icons) 來快速搜尋，開發者也能夠從中快速了解設計師所用的 icon 為何。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F4099AE55-4E4B-44C8-8876-B727CE2C29B8.png?alt=media&token=ac4f6a4b-a097-4291-99ac-476e6264d23e)

Fontawesome 的圖示也有分為免費與付費版，所能套用的 Web fonts 也有所不同，設計師使用時要特別注意，不過也不得不說，雖然付費版僅是粗細上的不同，但付費版的 icon 還是好看許多 :D。

### 給予開發者的說明
雖然 fontawesome 提供兩種方式運用在 icon 上，一則是本文重點 icon fonts，另一種則是透過 js 來插入 SVG。
如果你需要使用 fontawesome 做開發建議使用 icon fonts 的方式載入，如果想改用 SVG 的方式，可能會有動態切換上的問題，建議先讀過官方文件是否有合適的解決方案，並且實際測試後沒有問題再使用。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F4A403E89-2D56-4A2D-BFF9-42F3E31E538E.png?alt=media&token=9b58922f-2aeb-437a-a231-2003171a81aa)


## Google Fonts
https://material.io/tools/icons/

Material Design Icon 也是一種字體 icon，也與 Fontawesome 一樣具有大量的 icon 及搜尋功能，並且是完全免費，但比較特別的是使用「連字方法」來做 icon 的呈現。

> 連字方法(uses a typographic feature called ligatures)：https://google.github.io/material-design-icons/#using-the-icons-in-html

連字方法的特色在於 Icon 本身依然具有「詞彙意義」，它是透過一個單詞的判別轉為一個圖形，如下圖 icon 除了呈現一個臉以外還具有「face」的辭意，並且可以透過搜尋方式找到這個圖形。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F7D77B951-194F-4EAA-9A5B-E0A48BB165A6.png?alt=media&token=c6781772-3d7d-49ef-910e-929ff521f792)

## 自製 Web fonts
雖然上述服務已經提供大量的 icon，但設計中有時還是有不夠用的時候，自行開發 icon 也是個選項，以下我有撰寫過 svg 轉 web fonts icon 的方法，給大家參考看看：

自行開發的方法：https://wcc723.github.io/css/2016/12/13/gulp-dev-env/

## 結語
Web icon fonts 現在網頁開發已很常見的手法，主要原因是只要一個 className 就能輕鬆運用，當然現在也有 svg icon 的運用方法，但相對於 web icon fonts 來說還沒那麼流行。