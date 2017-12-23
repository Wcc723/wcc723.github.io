---
layout: post
title: 鐵人賽：另一種方式介紹 JavaScript 閉包
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c10-01.jpg?alt=media&token=a508d994-46b9-48dd-bda9-696ec6438e03
published: true
---

閉包解釋非常多，這裡先透過幾個方式說明一下閉包是什麼：

1. 運作原理：就是呼叫 Function 內的 Function
2. 這樣有什麼用：內層 Function 作用域變數只會存在內層
3. 然後勒：內層 Function 變數可以不被釋放，重複使用
4. 卡斯伯會常用此方法嗎：沒注意，好像會不經意的使出來
5. 那幹麻學：理解作用域

## 範例

這個範例用花錢的概念來說明，我們每次都會傳入不同的金額，並且把剩餘的金額存在內部作用域。

#### 直接呼叫內層函示

閉包就是存取內部的函式，所以直接使用 `buyItem()(100)` 兩個括號就是呼叫內部的函式。

```js
function buyItem() {
  var myMoney = 1000;
  return function (price) {   // 這裡就是一個閉包，不過目前只會使用一次
	  myMoney = myMoney - price;
    return myMoney;
  }
}
let balance = buyItem()(100);  // 存取內部函式的變數
console.log(balance);
```

幹麻要這樣？

1. 外層 `myMoney` 此時的變數可以被內層的 function 存取
2. 內層的 `myMoney` 後來是私有的變數，外層無法讀取
3. 運行 `buyItem()(100)` 時，等同於呼叫一次外層，在呼叫一次內層，最終將內層的值回傳給 `balance` 的變數。

這樣還沒完，目前只是一次性運作，來調整一下程式碼。

> 這個的行為是直接去操作內部的錢包，就像是直接花費一樣，接下來我們會用扣款的概念，不斷的使用錢包內部的金額。

#### 將外層函式賦予到另一個變數上

接下來不要直接呼叫，而是將函式賦予在另一個變數上，這樣的方式就會將 `myMoney` 這個變數存在內層的作用域，然後每次執行後不斷更新此值。

```js
function buyItem() {
  var myMoney = 1000;
  return function (price) {    // 這個閉包目前會被重複呼叫
    myMoney = myMoney - price;
    // myMoney 第一次由外部傳入，接下來在這個 function 內不斷更新
    return myMoney;
  }
}
var balance = buyItem(); // 存取內部函式的變數
balance(100); // 900
balance(100); // 800
balance(100); // 700
// 每次執行都是跑內層的函式，因此也只更新內層的函式變數
```

然後勒？
1. `buyItem()` 直接執行會出現 `function ...`，所以沒辦法直接使用。
2. balance 現在指向 `buyItem()` 使其可以不斷的反覆呼叫，且內層記憶體不會被釋放。
3. balance() 每次執行時，只會執行內層的函式，在內層記憶體沒有被釋放的情況下，`myMoney` 變數會不斷的被更新。

#### 多個具私有變數的函式

> 小明拜訪完漂亮阿姨以後，接著遇到 Rich 的朋友 "杰倫哥"，杰倫哥與小明去四處揮霍，小明也想趁此機會計算一下杰倫哥的花費狀況。透過閉包的方法，小明可以用同一個公式算出兩個人剩餘多少錢。

```js
// 使用閉包產生兩個作用域
// 這裡的 money 代表身上帶的錢
function buyItem(money) {
  var myMoney = money;
	console.log(this);          // 趁機偷問，此地的 this 指向誰？
  return function (price) {
    console.log(this);        // 趁機偷問，此地的 this 指向誰？
    // myMoney 第一次由外部傳入，接下來在這個 function 內不斷更新
    myMoney = myMoney - price;
    return myMoney;
  }
}
let MingCost = buyItem(1000); // 存取內部函式的變數，這個是小明錢包內的錢
let JayCost = buyItem(10000); // 杰哥拿出的小錢

// 小明的內層作用域變數，也就是小明剩的錢
console.log(MingCost(100)); // 900
console.log(MingCost(100)); // 800
console.log(MingCost(100)); // 700

// 杰哥的內層作用域變數，這裡是杰哥剩的錢
console.log(JayCost(1000)); // 9000
console.log(JayCost(1000)); // 8000
console.log(JayCost(1000)); // 7000
```

以上片段建議分段執行，更能理解其中的過程：
1. `let MingCost = buyItem(1000);` 此時 `buyItem` 已經執行過一次，並且 `myMoney` 的變數已經依傳入的變數做調整。
2. 每次執行 `MingCost(100)` 時，調整的則是傳至內層的 `myMoney` 變數。

要了解閉包，就要多了解函式的作用域，掌握 `變數` 的作用域及函式的運作原理，此篇章難度就不會很高。
