---
layout: post
title: 透過練習題，摸熟 This 的運作
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_13.jpg?alt=media&token=604172f5-9369-4dda-838b-98004eac855f
published: true
---

JavaScript 的 this 會隨著調用的方式不同影響其指向的不同（ES6 的箭頭函式定義也會影響指向），網路上已經提供相當多的資源介紹 `this` 指向的觀念，本篇只著重在**最常運用**的物件方法調用做介紹，並且透過練習題的方式，帶大家一步一步認識 this 的指向。

關於「物件方法調用」可以查看本文章：https://wcc723.github.io/javascript/2019/03/18/JS-THIS/

## 物件的方法調用（As an object method）
當函式是使用傳統的定義方式時（`function` 而不是 `()=>`），並且只有在物件下調用時，請謹記以下這張圖的概念：如果是在物件下調用方法，`this` 會**指向前一個物件**；如果不是，大多情況會指向 `window`，指向 window 的 `this` 實戰中也不太會去用它，所以請避免調用指向 window 的 `this`。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201903%2F57A365E4-97F6-447F-81FD-64F14313628F.png?alt=media&token=2a9e436b-3096-4f40-a337-7f37ce30a4e4)

一開始，先使用傳統函式定義 `getName` 的函式，以及定義一個 `myName` 的全域變數，等等我們會不斷地使用此函式及變數。

等等的題目都會詢問 `console.log(this.myName)` 的結果為何：
- 如果是全域，結果會顯示 "全域"
- 如果是物件，則會是物件定義的 myName

```js
function getName() {
  console.log(this.myName);
}

var myName = '全域';
```

好的，讓我們開始練習吧。

#### 題目 1：

請問，以下的 getName 執行結果為：
1. `'全域'`
2. `'小明'`
```js
function getName() {
  console.log(this.myName);
}
var myName = '全域';

// 主要程式碼
var Ming = {
  myName: '小明',
  getName: getName
};

Ming.getName();
```
.
.
.
.
.
.
.
本題答案為 2. `'小明'`，請謹記一個概念，傳統函式如何定義不會影響 this 的指向，會影響指向的只有調用方式，在此是在 `Ming` 下調用 `getName` 的方法，因此 this 會指向 `Ming`。

#### 題目 2：

請問，以下的 getName 執行結果為：
1. `'全域'`
2. `'小明'`
```js
var Ming = {
  myName: '小明',
  getName: function() {
    console.log(this.myName);
  }
};
Ming.getName();
```
.
.
.
.
.
.
.
這題將 `getName` 函式直接定義在 `Ming` 的物件下，概念也與先前相同，不管如何定義，直接看是如何調用，所以本題結果依然是 2. `'小明'`。


#### 題目 3：

請問，以下的 getName 執行結果為：
1. `'全域'`
2. `'小明'`
```js
function getName() {
  console.log(this.myName);
}

var myName = '全域';

// 主要程式碼
var Ming = {
  myName: '小明',
  fn: function() {
    getName();
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
這題在外層調用 `fn()` 方法，內部再 “**直接呼叫 getName 函式**”，所以 函式的 `this` 是直接由 `getName();` 這個調用方式而定（請注意，在此調用的前方沒有任何的物件），這種調用方式會稱為 "simple call"（簡易呼叫），`this` 的指向為 window，結果會是 1. `'全域'`。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F73669559-911A-496E-8530-20202227BCE0.png?alt=media&token=afd9c08f-7fee-40b2-bc02-f9beccd11c4a)


#### 題目 4：


請問，以下的 getName 執行結果為：
1. `'全域'`
2. `'小明'`
3. `'小明家'`
```js
function getName() {
  console.log(this.myName);
}

var myName = '全域';

// 主要程式碼
var Ming = {
  myName: '小明',
  family: {
    myName: '小明家',
    getName: getName
  }
  
};
Ming.family.getName();
```
.
.
.
.
.
.
.
本題又回到 “物件的方法調用”，只要檢視 `getName` 調用時前方的物件為何就可確認 `this` 的指向（`family 物件`），因此 this 指向為 family 結果為 3. `'小明家'`。

#### 題目 5：

請問，以下的執行結果為：
1. `'全域'`
2. `'小明'`
```js
var myName = '全域';

// 主要程式碼
var Ming = {
  myName: '小明',
  fn: function() {
    setTimeout(function() {
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
本題的結果為：1. `'全域'`
這題算是許多新手會遇到的錯誤，在物件內呼叫時如果出現立即函式、回呼函式（callback function）結果會有什麼變化？絕大數的情況下這類型都會指向 window，所以不建議在此類型下直接調用 `this`。

###### 延伸說明：callback function 指向不是全域的情況

大多情況下 `callback function` 的 `this` 都會指向全域，但如果回呼函式的調用是在物件下，也會同樣會改變 this 的指向。不過這種情況相當少見，還是會建議避免在回呼函式中使用 `this`。
```js
var myName = '全域';
function fn(cb) {
  var obj = {
    myName: 'fn 內的物件',
    cb
  }
  obj.cb();
}

fn(function() {
  console.log(this.myName);
});
```


#### 題目 6：延伸題目，箭頭函式的指向

請問，以下的執行結果為：
1. `'全域'`
2. `'小明'`
3. `'小明家'`
```js
var myName = '全域';

// 主要程式碼
var Ming = {
  myName: '小明',
  family: {
    myName: '小明家',
    fn: function() {
      setTimeout(() => {
        console.log(this.myName);
      }, 0);
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

本題結果為：3. `'小明家'`
當遇到箭頭函式時，我會跟大家記住一句話：「箭頭函式沒有自己的 `this`」，因此其指向會是對應外層作用域的 `this`。

本題的箭頭函式外層為 `fn` 函式，該函式的 `this` 指向 `family`，所以箭頭函式的 `this` 也同樣指向 `family`。而接下來我們也會繼續介紹關於「箭頭函式」的 `this` 喔。
