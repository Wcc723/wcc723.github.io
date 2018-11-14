---
layout: post
title: 鐵人賽：網頁設計 - 網頁設計規範 - 一致性的距離（計算方法、水平、垂直）
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fholy%2021.png?alt=media&token=5d539b8f-22d2-437e-9c0e-838c626eb267
published: true
---

一開始的文章有介紹到格線系統，主要是針對水平欄位空間的介紹，而其實垂直空間也是需要有固定的間距，當然一方面是有一致的美感，另一方面則是讓開發者設定全網站可用間距時可以統一帶入。

本篇主要會針對兩個部分做介紹，一是如何定義間距，另一則是針對運用上的介紹。

- 定義間距（5 的倍數、以文字大小）
- 統一的運用（文字段落、小元件空間、大區塊的間隔）

## 定義間距
雖說間距需要定義固定的數值，但至於如何定義其實沒有完全固定的規範，如果定義出 2, 4, 6, 8, 10, 12... 等所有雙數數值也算定義，但這麼細的數值再運用上其實非常不便，在此列出常見的定義方式給大家參考。

#### 整數的倍數
大多設計師會有個習慣，就是會將色碼、字級等數字抓成整數，如過去使用 CMYK 時，就會習慣 5, 10, 15 的數字依序做色彩定義，字級也會使用雙數 2, 4, 6, 8, 10 等等...。

這個概念也依然可以運用在網頁設計上，可以預先定義一套固定級數的間距作為使用，如：
```
5px
10px
15px
20px
30px
45px
60px
```

接下來所有的網站也都會用這些數值來設計，並且避免使用到 3, 6, 7, 8 這些未定義的數值。

#### 文字的級數
另一種常見的定義方式則是搭配 rem，在 Bootstrap 中就是依據這種級數來做定義，且目前的網頁文字大小大多都以 16px 做為預設，因此延伸的級數則會有以下定義：
```
0.25rem  -> 4px
0.5rem   -> 8px
1rem     -> 16px
1.5rem   -> 24px
2rem     -> 32px
3rem     -> 48px
```

這種定義方式對於設計師來說沒那麼好理解，但對於工程師來說卻能夠有延伸的運用，假設網站類性不需要 16px 大的文字，他可以調整成 14px，那麼整體的間距也會跟著調整成如下：

```
0.25rem  -> 3.5px
0.5rem   -> 7px
1rem     -> 14px
1.5rem   -> 21px
2rem     -> 28px
3rem     -> 42px
```

以上兩種開發中都是很常見的，而設計師僅需選擇其中一種，並與開發者協調好即可（設計圖目前還沒有辦法透過統一設定調整畫面間距）。

## 統一的運用
定義好的間距會視設計需求來調整，但基本上還是會維持小空間使用小間距、大空間維持大間距的概念，如按鈕與按鈕之間就會避免使用 3rem 這種尺寸，而兩個大 section 之間當然也不會只使用 1rem 來做區隔，以下就依據一些常見情境作為範例：

### 元件之間
元件之間盡可能用小數值的間距做設定，透過此方式能夠維持相關內容依然視為一個群組；反之，過大的空間會使群組的觀念被打散。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fironman19.png?alt=media&token=50782861-f19c-4e24-bf22-6a8c76d2b9f1)


### 元件與外層區塊
元件與外層區塊雖為同一個群組，但外層區塊大多是背景或單色，不具有訊息內容，因此有些距離更能保持美感。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fironman19%20%E2%80%93%201.png?alt=media&token=7f872a96-0fb5-4210-a0cf-a94b172e76ef)


### 區塊與區塊
區塊與區塊之間就是明確的不同訊息內容，因此要使用更大的空間將群組隔離，避免造成不同的訊息混淆。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fironman19%20%E2%80%93%202.png?alt=media&token=1834e679-06f9-4158-8d3c-073e3e2a8569)


如 Evernote 網站就透過垂直空間、背景色彩、排版的差異，將不同訊息的群組明確分離開。

Evernote: https://evernote.com/intl/zh-tw
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2F35BA5E57-3D31-4EFD-8F55-C349285DA8DD.png?alt=media&token=cc284ab8-6d1c-472a-8640-35be3f034bce)

## 結語

好的空間定義，具有以下特點：

- 一致性：就算內容改變，全站依然維持相同的空間邏輯
- 視覺群組：適當的空間區分內容
- 可被開發運用：具有固定的數值，且是明確具有邏輯，使之便於開發合作

因此，建議設計師會預先定義好所需運用的間隔尺寸，接下來再設計時也便於方便取用，避免開發好幾頁後才發現空間間隔不一致。