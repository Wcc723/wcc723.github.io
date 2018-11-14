---
layout: post
title: 鐵人賽：網頁設計 - 圖片格式的運用
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2Fholy%2014.png?alt=media&token=4fe9ce9e-e087-4356-a773-2007849a0ecd
published: true
---

隨著裝置解析度越來越高，如果是以 1:1 的尺寸輸出圖示時，都會明顯地看到圖示邊緣出現鋸齒，這樣的情況下無疑是降低設計的品質，為了避免這樣問題，實作中通常會使用兩種方式來解決：

1. 輸出更高解析度的圖片
2. 輸出向量圖片

更高解析度需要多高？對於網路速度是否有影響？向量圖的使用情境及限制為何？本篇將依據這些概念介紹。

## 格式選擇參考
網頁靜態圖片選擇主要有三種（還有另一種為 base64，這就不在我們討論範圍內）：

* jpg：是屬於破壞性的檔案壓縮方式，圖片可以大幅降低檔案尺寸，不過也會因此導致品質降低，壓縮的過程中可以依據需求調整壓縮比，藉此控制品質及檔案大小間的平衡。
* png：壓縮比較低的圖片格式，相對於 JPG 來說圖片檔案會大不少，但影像品質也相對較佳，除了有更好影像外還同時具有「透明」的特性。
* svg：向量的圖片格式，圖形定位皆是使用數學位置，且「沒有解析度」的限制，因此圖片無限放大都不會失真。另外 SVG 由於是一些文字標示而成，所以圖片尺寸普遍來說都很小。

### 使用情境

#### 圖示、商標


![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F49591BFC-18AD-4195-8D8C-E581DA967837.png?alt=media&token=d5f80c34-eb6b-4d12-a651-f73bb07d373b)
> SVG：可縮放向量圖形，圖片來源：[wiki](https://zh.wikipedia.org/wiki/%E5%8F%AF%E7%B8%AE%E6%94%BE%E5%90%91%E9%87%8F%E5%9C%96%E5%BD%A2)

由於商標會使用在許多情境，如網頁頁首、頁尾以及行動版等，在不同的尺寸變化下依然要維持高品質的清晰度來維持形象，過去大多都是使用 png 的縮放調整，但在目前的裝置解析度不斷提高的情況下，使用 svg 替代 png 是相對更好的解決方案。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F27DF021C-E955-4E8D-A4EB-16AF22CEC26C.png?alt=media&token=79e400b9-8c1c-414b-8047-c8b1f7b862ba)
> 範例網站：甜點電商的上方 Logo 就是使用 SVG 來呈現

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FD59CECDC-D8AD-416C-A20F-D490E2B853D9.png?alt=media&token=b27f8a04-7faa-4d6e-8674-767abb44309e)
> 目前大多網站均是使用 svg 作為商標顯示的格式。圖中為 [Sketch 網站](https://sketchapp.com/)

除了商標外，另一個很常使用 svg 格式則為圖示（icon），過去圖示也是同樣使用 png，但在高解析度的裝置下來說卻顯得不足。使用 svg 替代主要原因在於 icon：

* 圖形單純 - 不會混用真實圖案
* 高辨識性 - 需要高解析度
* 大量使用 - 檔案要小
* 需要可編輯性 - 依據情境重新賦予色彩

在 Github 的網站中就可以看到大部分圖示均是使用 svg，且可依據情境重新調整色彩。如下圖選擇的 “Code” 選項的 icon 接近黑色，旁邊的 “Issue” 則是顯示淡灰色。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F1270BD49-B266-44C7-B47B-4F2FF5054C95.png?alt=media&token=5a5040ce-3319-4d34-93eb-026d0bf8543f)

在 Github 中的網站是透過前端工具處理，讓 svg 圖形的引用更為容易，但實戰中 svg 圖形在管理上是有些門檻的，下一個章節會介紹使用 icon fonts 來處理 svg 在圖示上的應用方法。

## 主要圖片
好的圖片能夠增加網站的豐富度，也同時能夠增加訊息傳的效益，現在鮮少有網站是不透過任何圖片來傳達訊息。舉凡是 頁首大圖、商品圖片、輪播、說明圖片等等，這些都是為了增加訊息傳達效益的圖片，會建議使用 png 來作為顯示的格式，主要是 png 具有以下的特性：

* 高品質 - 確保顯示的品質
* 點陣 - 增加畫面的真實性
* 透明特性 - 可採用堆疊的方式呈現

如下圖，為了確保圖片品質及精緻甜點的口感，png 是不錯的選擇。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F79389AC5-DF50-472E-B6BB-EB66043DED43.png?alt=media&token=7d10d305-1d5d-4ad5-a23b-e9483232ae33)

主要圖片除了有良好的呈現外，必要時還需要兼顧不同裝置的「顯示清晰度」，如一般的螢幕的 PPI 約落在 100 上下（[PPI 說明](https://zh.wikipedia.org/wiki/%E6%AF%8F%E8%8B%B1%E5%AF%B8%E5%83%8F%E7%B4%A0)），但到了部分裝置的 PPI 就會達到 320 甚至更高的 PPI（如 Apple 的 Retina Display），此時就會建議使用「雙倍」以上的尺寸做輸出。

以 Sketch 為例，當輸出一張長寬為 `1200 * 628` 圖片時，如果調整為 2 倍尺寸則會輸出一張 `2400 * 1256` 的圖片。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F5EFA0D4C-D135-434F-A469-B633500148D3.png?alt=media&token=b35e39f5-21b4-4f5a-9ac2-c531c5cfd200)

此時也要特別注意，圖片的檔案大小將可能**成長為四倍**，如一張 700kb 的圖片輸出成 2 倍尺寸大小時，檔案可能成長為 2.4mb。因此實際運用時會建議隨需求調整圖片輸出的大小，設計師部分可以規劃不同尺寸的輸出，而前端在此就需要依據需求調整運用的倍數。

使用 png 例外情況：
1. 圖片過多，需要兼顧網路速度時還是會建議轉用 jpg
2. 圖片是人工繪製，向量是更好的選項時會建議使用 svg


![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FE8715E4D-6EE5-4B3D-9055-7C287F7EBC7B.png?alt=media&token=90f4993b-f642-4789-a696-2de3aec64e28)
> 手繪向量圖片 svg 依然是好選擇：圖片來源 [Github](https://github.com/)


## 背景圖
另外，背景圖片的運用也是很重要的，相對於主要圖片來說背景圖片的重要性降低很多，如果畫面同時是使用真實景色的圖片，會更建議使用 jpg 來做呈現，藉此降低檔案的尺寸。

Yahoo 氣象的背景會使用當地的風景圖片，藉此來呈現符合情境的資訊，而這麼大張的圖片作為背景，如果使用 png 將會佔去不少流量，所以使用 jpg 將是一個好選項（原圖 1280 * 720，約 170kb）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FBCFE2854-5958-480E-9523-EC5E74D312DD.png?alt=media&token=c1bb9200-6ab3-4b81-a160-db7f2bfa2686)

大多數來說，真實圖片的背景會使用 jpg 來呈現，這裡也介紹一個圖案類型的背景網站給大家參考，由於這個網站是使用「四方連續」的背景手法，這類型的圖片僅需要小小一張就能不斷重複使用，所以就直接使用 png 來維持背景圖的品質，網址：https://www.toptal.com/designers/subtlepatterns/

此網站的背景風格非常多，下載可同時選用 2 倍尺寸的圖案，網站的圖案都是可以免費使用，但請注意 [使用條款及 FAQ](https://www.toptal.com/designers/subtlepatterns/faq/)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F738F3A7C-38E1-4FDC-A413-139F44C18A75.png?alt=media&token=2a065df3-0168-4a8d-98a8-bb69fce465b1)

## 結語

現在工具輸出圖片也越來越方便，只要一鍵就可以大量輸出，因此設計師更需要了解各種圖片格式的差異，並且輸出符合需求的格式以便於工程師作為開發使用。