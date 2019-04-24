---
layout: post
title: JavaScript This 系列文：this 為什麼指向 window
category: javascript
tagline:
tags: [javascript]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201903%2F7365504D-FC60-4AD2-8135-D870D42E75A2.png?alt=media&token=0a518715-f7c0-4b41-9d4c-ab4d908c7855
published: true
---

本篇是接續先前的：[鐵人賽：JavaScript 的 this 到底是誰？](/javascript/2017/12/12/javascript-this/)，會更深入的探討 JavaScript This 的運作及觀念，這一系列的文章順序上不會從基礎開始介紹，會建議先從先前文章開始閱讀。

## 純粹的調用 (Simple call)

直接呼叫函式的情況下，this 會指向全域，在以下範例中可以取到 name 的值，但一般來說很不推薦這樣的寫法，後面會提到這樣的寫法是怎麼造成的。
```js
var name = '小明';
function callSomeone() {
  console.log(this.name)
};
callSomeone(); // 小明
```

### IIFE、Callback、閉包也屬於此類別嗎？

上述的函式只有單一層級，為了加深大家的印象，我們透過各種改變 “函式” 作用域的方式看是否會改變 this 的結果。

#### IIFE

立即函式，這算是直接在函式內直接在呼叫另一個函式，而這個結果下一樣與純粹的呼叫結果相同。
```js
var name = '小明';
(function() {
  function callSomeone() {
    console.log(this.name)
  };
  callSomeone(); // 小明
})();
```

無論我們把函式宣告放在 IIFE 內與外結果都是一致的。
```js
var name = '小明';
function callSomeone() {
  console.log(this.name)
}
(function() {
  callSomeone(); // 小明
})();
```

#### Closure
這樣結果依然相同，並不會因為獨立的作用域改變造成 this 的不同。
```js
var name = '小明'
function easyCard(base = 100) {
  var money = base
  return function(update = 10) {
    money = money + update
    console.log(this.name, money)
  }
}

var MingEasyCard = easyCard(100)
MingEasyCard()
// '小明' 110
```


#### Callback function

callback function 也是一樣的結果，透過以上這些範例了解到，並不會因為作用域的改變導致 This 的不同，更重要的還是在於**函式是不是與物件有扯上關係**，至此為止我們實驗了各種函式呼叫方式，都可以知道函式再直接呼叫的情況下，this 都是指向 window。

```js
function myEasyCard(callback) {
  var money = 100
  return callback(money); // window
}

myEasyCard(function (money) {
  console.log(this, money); // window
})
```


而 callback function 會提到另一個常見的案例，就是陣列相關的處理方式，參考 MDN 的[說明](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach#%E8%AA%9E%E6%B3%95) forEach 的結構如下：

```js
arr.forEach(function callback(currentValue[, index[, array]]) {
    //your iterator
}[, thisArg]);
```

因此 forEach 中間的 callback 一樣是屬於直接呼叫，所以會 this 會指向 window 物件。

```js
var a = [1, 2, 3];
a.forEach(function(item) {
  console.log(this, item)
});
```

### 嚴謹模式

> 觀念說明開始，為什麼 this 會指向 window 物件

這個階段我們加上 `'use strict'` 則會進入嚴謹模式，接下來直接呼叫的內容都會變成 `undefined`的奇特景象，可以理解這是為了避免不必要的錯誤提示，在此也建議別透過一般函式呼叫的 this 取用 `window`。

直接套上嚴謹模式則會出現錯誤範例：
```js
'use strict'
var name = '小明';
function callSomeone() {
  console.log(this); // 這裡改成了 this，因為沒辦法找到 name
}
callSomeone(); // undefined
```

而 undefined 與 window 有什麼關係呢？我們可以先介紹另一個觀念 `call()`，`call` 是可將物件傳入並替代函式內的 this：

```js
var Ming = {
  name: '小明'
}
function callSomeone(num) {
  console.log(this.name, num);
}
callSomeone.call(Ming, 2); // 小明, 2
```

透過 `.call(Ming, 2)` 的方式，可將 Ming 傳入並取代 this，後面帶上一個參數 `2` 則是函式的參數。因此 `.call()` **前者為套用 this 的物件，後者以後都是函式的參數**。參考下圖：函式中的 `this` 為 call() 的第一個值，而函式參數為第二個(包含後續的值)。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201903%2FD776D6BE-46F9-433F-9D85-96291FD12F8A.png?alt=media&token=cfb5fc9c-dc8b-4fe5-bc28-5bd555042183)


接下來我們將 `Ming` 物件替換，直接定義一個 name 在全域之上，並且傳入 undefined 的值來替代 this，猜猜會發生什麼事!?
```js
var name = '全域魔王' 

function callSomeone(num) {
  console.log(this.name, num);
}
callSomeone.call(undefined, 2);
```
此時會發現運作上依然沒有問題，**傳入 undefined 進入後 this 會直接指向全域**。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201903%2FCEBA40C7-690E-4422-B09E-3541AF207C63.png?alt=media&token=aef490be-ecd9-4749-84f5-5bd4da8b2ce0)

這麼神奇的狀態也算是 JavaScript 的 Feature，發生的理由可以參考：[MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Function/call#%E5%8F%83%E6%95%B8) 的說明。

> MDN：若這個函數是在非嚴苛模式( [non-strict mode](https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/Strict_mode) ),null、undefined將會被置換成全域變數。

因此，上述程式碼在嚴謹模式下將無法正確運行，因為傳入 `undefined` 時將會正確以 `undefined` 作運行。同樣概念下，在一般全域環境套用 'use strict' `this` 作為一般調用時，將會直接套用 undefined 而不會是 window。

而上述程式碼於嚴謹模式下，將會正確的傳入 undefined。

```js
'use strict'
var name = '全域魔王' 

function callSomeone(num) {
  console.log(this, num);
}
callSomeone.call(undefined, 2);
```

接下來，可以將本文的上方的程式碼都加上 `'use strict'` 都會得到相同的結果，this 都會指向 undefined。

---

## 延伸閱讀：This 都是物件

前一篇介紹到 「this 大部分取決於 **它在哪個物件下被呼叫**」，所以其中改變 this 的方法之一則是透過物件下呼叫函式：

```js
function callName() {
  console.log(this.name);
}

var auntie = {
  name: '漂亮阿姨',
  callName: callName  
  // 這裡的 function 指向全域的 callName function
}

auntie.callName() // '漂亮阿姨'，呼叫是在物件下調用，那麼 this 則是該物件
```

除此之外，還可以透過本文所介紹的 call 來改變 this 的值，先前範例都是傳入「物件」，此部分我們傳入數值來看看其型別：

```js
function callSomeone(num) {
  console.log(typeof(this), typeof(num));
}
callSomeone.call(1, 2);
// object number
```

此部分的 this 我們使用數字 1，函式參數使用數字 2，結果會發生 this 的型別變成了 `object`!?

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201903%2FA398F871-CD13-48A1-9A9D-97B53B27196E.png?alt=media&token=4336cc32-d8e5-4228-bee0-e0b500556e29)

重新透過 console 查看 this 會得到以下的結果，這是透過建構式產生的數值(`new Number(1)`)，透過 call 所傳入的純值會被使用 new 建構式的方式產生，所以型別依然維持是「物件」（可參考：[MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Function/call#%E5%8F%83%E6%95%B8)），因此 this 終究為物件形式。

> MDN：原生型態的值將會被封裝

