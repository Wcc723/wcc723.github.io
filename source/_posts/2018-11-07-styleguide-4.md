---
layout: post
title: 鐵人賽：網頁設計 - 網頁設計規範 - 通用視覺效果
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fholy%2021.png?alt=media&token=5d539b8f-22d2-437e-9c0e-838c626eb267
published: true
---

規範定義除了元件設計、空間、格線等等外，另外還有經常重複使用的樣式也能夠被預先定義，比要常見的視覺效果如下：

- 圓角
- 邊線粗細、邊線色彩
- 陰影
- 背景圖樣、裝飾

## 圓角
圓角就有點類似於明體、黑體之間的關係，黑體與明體會有兩者截然不同的個性，明體讓人感受具有人文、藝術氣息；黑體則讓人感受具有科技、現代感，圓角亦是如此，且可以隨著不同的圓角尺寸有著不同感受。如無圓角如同黑體，具有科技、現代感，但同時讓人感受較無情感，反之大圓角則讓人感覺更易於親近。

然而選擇哪一種都應該延續相同的視覺效果，並延伸到所有的視覺元件上。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fironman20%20%E2%80%93%201.png?alt=media&token=448608da-5e5c-43d4-ad74-00ec1fef9e5c)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fironman20%20%E2%80%93%202.png?alt=media&token=c59da3f1-5307-466c-84cf-6ea471ab376c)
下圖：這是不好的示範，圓角沒有固定的運用，無法維持一致性的視覺體驗。

## 陰影
陰影在 Material Design 中不斷提到，他是一個呈現「深度」的好技巧，具有相同深度的物件會讓人感受到相同的重要性。

前文所提到的深度：https://wcc723.github.io/design/2018/10/19/grid-system-2/

https://material.io/design/environment/light-shadows.html#shadows

因此，設計時也可以使用不同級距的陰影，表現出不同重要性的元件，當然這些依然要維持固定的級數。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fironman20%20%E2%80%93%204.png?alt=media&token=42931514-fb3f-4ed6-a15d-db7a558afb9c)

雖然些許差異的陰影變化是難以察覺的，但會增加開發上的許多困擾。


## 邊線
邊線是色彩、線條的延伸，套用在元件的邊緣，邊線運用上特別要注意元件與元件的接合性，因為邊線本身具有空間，所以當並排、小距離間隙邊線的呈現都要注意。究竟是要完全相合、色彩變化差異等等。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fironman20%20%E2%80%93%205.png?alt=media&token=f17afa9a-1c48-46f6-835b-58c641e3dcf6)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fironman20%20%E2%80%93%206.png?alt=media&token=57d29b98-4be8-4c6b-af3f-3d686995bdae)

## 結語

這些樣式經常會重複定義，且會應用在元件上或網站上的各個地方，就如同是字體一樣，這些通用視覺效果也應該需要被預先定義，避免每次運用只有些為落差，但卻沒有一致性的視覺效果。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201811%2Fironman20.png?alt=media&token=83f9c8e6-64e2-4415-ace2-ac7fe3049ead)

這些效果並非是獨立的元件，並沒有實際外觀，但這樣的預先定義有助於統一樣式，以一個卡片來說如果沒有共用的邊線粗細、色彩、陰影等等，視覺感落差就會很大，而這些視覺感受同樣會延伸到其他元件上。

