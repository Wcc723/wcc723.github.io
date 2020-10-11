---
layout: post
title: 箭頭函式常見陷阱題
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_14.jpg?alt=media&token=ba6d6297-030d-4495-a510-459963174ca1
published: true
---

JavaScript ES6 以後加入了 ”箭頭函式“，就外觀看來它就像是一個縮寫，也因此許多新手會認為它是屬於傳統函式的縮寫形式；但其實不然，箭頭函式與傳統函式大不同，本篇僅列出最常見的 `this` 差異，並透過大量的範例題，並透過範例的方式讓新手避免踩到箭頭函式最常見的雷。

## 傳統函式的 this 問題

JS 中很常利用物件、方法的形式來建構組件，在物件中的方法也可透過 this 來取得物件中的其它屬性。

不過傳統函式中 this 的指向是隨著呼叫的方式不同而定，以下方的範例來說預期會一一列出 "XXX 是小明的朋友"，但因爲列出陣列是使用 `forEach` 方法，其中包含了一個 callback function，所以指向也因此有所變化。

```js
const Ming = {
  myName: '小明',
  friends: ['漂亮阿姨', '杰倫', '小美'],
  getFriends() {
    this.friends.forEach(function(friend) {
      console.log(`${friend} 是 ${this.myName} 的朋友`);
    });
  }
}
Ming.getFriends();
```

this 的指向因為外層的 `callback function` 而轉為 `全域`，所以最終的都列出 `undefined` 的結果。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F738B9A26-A52F-4D95-9D8E-C83492DA23B6.png?alt=media&token=241603b6-180d-4aac-b975-2df1dfb0431b)


```js
漂亮阿姨 是 undefined 的朋友
杰倫 是 undefined 的朋友
小美 是 undefined 的朋友
```

#### 箭頭函式的解決辦法

箭頭函式最大的特點就是沒有自己的 `this`，因此當箭頭函式中出現了 `this`，它則會指向外層的作用域所對應的 `this`。

以下範例來 `this.myName` 的值就能夠正確指向此物件，迴圈的值也會如預期產生。
```js
const Ming = {
  myName: '小明',
  friends: ['漂亮阿姨', '杰倫', '小美'],
  getFriends() {
    this.friends.forEach(friend => {
      console.log(`${friend} 是 ${this.myName} 的朋友`);
    });
  }
}
Ming.getFriends();
```

**重點**：因為箭頭函式沒有自己的 `this`，所以要找到箭頭函式的 `this` 指向時，可**直接參考其外層作用域的 `this` 指向**。關於 this 的指向可參考 [this 與物件的關係](https://wcc723.github.io/javascript/2019/03/18/JS-THIS/)。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F03840F0E-FD5A-40A8-9251-0C8F436066C4.png?alt=media&token=48122365-c128-412f-9266-b93b6a6d2351)


透過箭頭函式可不需要調整太多結構，就能使 `this` 的指向符合預期。
```js
漂亮阿姨 是 小明 的朋友
杰倫 是 小明 的朋友
小美 是 小明 的朋友
```

## 箭頭函式的相關測驗

只有看介紹，難以確定觀念是否正確，所以以下補上相關題目給大家練習練習。

首先，外層都會先宣告 `myName = '全域'`，所以以下題目需了解最終 `this` 是指向全域或區域的變數。
```js
var myName = '全域';
```

#### 題目 1

以下的結果為：
1. 小明
2. 全域
```js
var Ming = {
  myName: '小明',
  fn() {
    setTimeout(() => {
      console.log(this.myName);
    }, 0);
  }
};
Ming.fn();
```
.
.
.
.
.
.
.
.
這題結構與一開始所介紹的其實是相同的，請記得箭頭函式沒有自己的 `this`，請向外層作用域尋找，因此會找到 `fn()` 這個傳統函式，在對應到 `Ming.fn()`，所以 `this` 會指向 `Ming`，結果為  1. 小明。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FB786A949-221F-44C0-8597-AA8BC74644AA.png?alt=media&token=2ca71688-74b3-4451-892b-2e9bb8ccfd09)

#### 題目 2

以下的結果為：
1. 小明
2. 全域
```js
var Ming = {
  myName: '小明',
  fn:() => {
    console.log(this.myName);
  }
};
Ming.fn();
```
.
.
.
.
.
.
.
.
.
實戰中，如果物件內的方法會用到 `this`，都會避免將該方法使用箭頭函式來建立，因為此時的 `this` 指向是外層的作用域，相對來說外層的作用域將更難以確立。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FEF14357E-56A2-4951-A7A0-C0973884BF50.png?alt=media&token=77b8a6b9-0562-48f1-800c-efa4c54bb0f8)

在此外層的作用域是直接對應全域，所以此題的結果為 2. 全域。


#### 題目 3

以下的結果為：
1. 小明
2. 全域
```js
var Ming = {
  myName: '小明',
  family: {
    myName: '小明家',
    fn: ()=> {
      console.log(this.myName);
    }
  }
};
Ming.family.fn();
```
.
.
.
.
.
.
.
.
.
此題的概念與上一題相同，雖然物件有多個層級，但在此也是直接查找最外層的最用域 `this` 指向，因此答案依然為 2. 全域。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F2CD0BA86-0356-439F-8FD2-129C6658492C.png?alt=media&token=5174c287-f3f8-4293-8ef7-e6bf720e83ef)

#### 題目 4

以下的結果為：
1. 小明
2. 全域
3. 立即函式作用域
```js
(function () {
  var myName = '立即函式作用域';
  var Ming = {
    myName: '小明',
    fn:() => {
      console.log(this.myName);
    }
  };
  Ming.fn();
})();
```
.
.
.
.
.
.
.
.
.
.
這題是陷阱題，立即函式屬於 `simple call`，`this` 是指向全域。
```
(function () {
  console.log(this === window); // 立即函式的 this 與全域相同
})();
```

因此本題的答案依然為 2. 全域。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FA5F41EC5-2C94-475A-85DE-3D0974F6F5D4.png?alt=media&token=a7579b9d-df70-4882-8cd8-880a5e3e6354)

#### 題目 5

以下的結果為：
1. 小明
2. 全域
```js
var Ming = {
  myName: '小明',
  family: {
    myName: '小明家',
    fn: ()=> {
      (function() {
        console.log(this.myName);
      })();
    }
  }
};
Ming.family.fn();
```
.
.
.
.
.
.
.
.
.
如果這題會錯可能是題目做太多被搞混了，請仔細思考一下這題的 `this` 由誰而定。

本題的 `this` 是由立即函式決定，因此是指向 2. 全域。


## 結語
實戰中通常也不會那麼的複雜，只要清楚箭頭沒有自己的 `this`，外層的作用域 this 是什麼，它就是什麼。

為了避免箭頭函式在實戰中出錯，可以有以下幾個方法：
- 物件內的屬性方法避免使用箭頭函式定義
- 箭頭函式外層的函式越單純越好，避免過度巢狀
- 當使用箭頭函式，請先確認外層的 `this` 指向

只要搞懂箭頭函式的 `this`，也就盡情的使用箭頭函式，並嘗試使用其縮寫來大幅減少程式碼喔。
