---
layout: post
title: 鐵人賽：JavaScript 建構式與原型
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c16_2.jpg?alt=media&token=13d99d56-3827-4b68-9a41-0c6181b1a853
published: true
---

還記得先前幾篇的原型鍊嗎？多個物件可以使用相同原型的那個章節，兩個不同的角色但是共用相同的原型，所以當原型增加新的功能，另一個角色一樣會獲得相同功能：

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c14_2.jpg?alt=media&token=d880e22d-0931-471c-a0cb-ccc587f8ea7e)

現在已經透過 JavaScript 建構式產生一個獨立的物件，我們接下來會使用原型鍊的概念來創造原型。

## 範例

目前已經使用建構式製作一個簡單手機樣板，但我們會發現作為一個手機似乎少了一個重要的功能 `打電話`，這個功能是所有手機都具備個功能，無論他是何種型號。因此，這裡要透過 **原型** 的概念將手機賦予 `打電話` 這個功能，無論是哪一種型號，都能直接繼承此功能。

以下這段和上一個章節的程式碼是相同的，這裡已經透過手機範本 (`PhoneTemplate`)建立了兩隻手機。

```js
function PhoneTemplate(brand, modal, withCamera) {
  this.brand = brand;
  this.modal = modal;
  this.withCamera = withCamera || false;
  this.takePhoto = function () {
    if (this.withCamera) {
      console.log(this.modal + ' 照相');
    } else {
      console.log(this.modal + ' 這台沒有照相功能');
    }
  }
}

var sonyPhone = new PhoneTemplate('Sony', 'Z100', true);
var nokiaPhone = new PhoneTemplate('Nokia', '3310', false);
```

接下來直接在 手機範本 上使用  `prototype` 的語法來加入撥打電話的功能 (`callSomeone`)，加入此功能後這兩隻手機都同時具有撥打電話的功能。

```js
// 加入 prototype
PhoneTemplate.prototype.callSomeone = function (someone) {
  console.log('打通電話給 ' + someone)
}

// 兩者同時共用相同的原型
sonyPhone.callSomeone('小明'); // 打通電話給 小明
nokiaPhone.callSomeone('小明'); // 打通電話給 小明
```

發生什麼事了？可以透過 console.log() 來看看兩隻手機內有什麼樣的變化，此段的 `__proto__` 是 `PhoneTemplate` 的原型，在 `__proto__` 內可以看到 `callSomeone()` 的方法，我們直接在手機範本上加入就會使透過此建構式生成的物件套用這段原型。

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2FE6BF06FD-6127-4D14-80EC-E02CEF30A3BC.png?alt=media&token=5bb695d4-f0f1-476f-83c5-6863a2fc3fc8)

此時我們如果查看另一支手機也會有相同的功能。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F8C94B350-05D3-4F65-8664-E35EDC06054E.png?alt=media&token=1577b749-9ca4-4dd6-a879-da08d52665c1)

在概念上，這段的原型會如下圖顯示，兩者的上層皆是 `phoneTemplate`，並且共用相同的方法，這也像魂結一樣兩個連向共用的物件，當此物件新增了任何功能，兩個物件也能一起繼承。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c16.jpg?alt=media&token=b1c47a22-b452-4ce8-88ba-56b57672f3b6)


## 記憶體概念

除了共用的概念外，我們每次新增一個物件時，物件內的屬性、函式都會需要佔用記憶體空間。也就是一個物件內有 10 個屬性，生成 10 個則會佔用 100 單位的記憶體空間，如果適當地將 5 個屬性轉至原型內，則只會佔用 `(5*10) + 5 = 55` 的記憶體空間。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c16_2.jpg?alt=media&token=13d99d56-3827-4b68-9a41-0c6181b1a853)

這點在開發 Node.js 應用程式時影響更大，由於伺服器端的記憶體不能像瀏覽器隨意關閉釋放，所以記憶體的控制更為重要。


## 原型觀念

如果你了解此段，很容易就能看到任何物件的根本，對於看懂 JavaScript 的文件也會更為容易，就如同以下是 "陣列" 的原型，所以所有陣列都與此原型產生魂結牽連，因此可以用以下的方法。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7_2017-12-19_%E4%B8%8A%E5%8D%889_48_52.png?alt=media&token=2a29ff7a-e28e-464e-8e1f-32e343d23f48)

而為什麼 DOM 方法取得的陣列為什麼不能用很多陣列方法，原因他是屬於 **array-like(類陣列)**，我們可以從原型中得知它與陣列不是共用的。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7%202017-12-19%20%E4%B8%8A%E5%8D%889.54.32.png?alt=media&token=dde5aae3-fe41-4dcf-a7f4-1d40ab7ebe41)