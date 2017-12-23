---
layout: post
title: 鐵人賽：JavaScript Function 與 Hoisting
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c13.jpg?alt=media&token=847e07cd-e0b5-4846-a580-a0d11de16652
published: true
---

Hoisting 在 JavaScript 僅是一個觀念，主要是在說明變數、函式在宣告期間就會先建立一個記憶體空間，等到實際運行時再將值放入到該記憶體空間內。不過為了確保程式的穩定性，我們不會在實作中使用這個方法，僅了解觀念即可。

> **故事說明**：小明的筆記本寫了每天要做的事情，但其實他並不是要做事情時，才會翻筆記本。在一早的醒來的時候小明會將全部的內容先看一次，讓腦中先有個印象。
> 這個概念與 JavaScript Hoiting 的概念接近，先在記憶體中準備一個空間，等到執行時再將值、函式置入。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c13.jpg?alt=media&token=847e07cd-e0b5-4846-a580-a0d11de16652)

> 先在腦中了解有多少事情，到時執行時才比較不會忘記的小明。

## 在變數上

如果我們對沒有宣告的變數執行 `console.log()`，會跳出一個錯誤表示它 "尚未" 被定義過。

```
console.log(phone); // phone is not defined
```

如果在 `var` 的變數前加入 `console.log()`，這個時候並不會出錯，則是會跳出 `undefined`，這表示這個變數在記憶體中已經有一個位置，只不過目前並沒有值。

```
console.log(phone); // undefined
var phone = 'myphone';
```

但如果是直接賦予在全域物件上的屬性，因為並不是使用 "宣告"，這已經屬於定義階段，所以在記憶體中他還沒有值。會在 `phone = 'myphone'` 這段直接將值寫在全域物件上。

```
console.log(phone); // phone is not defined
phone = 'myphone';
```

## 函式的 Hoisting

在函式概念中也是一樣的，如果在函式之前使用 `console.log()` 則會出現 `undefined`，當然這個函式也無法被使用。
這種函式宣告方法稱為：`function expression` 函式表達式(function 會由 `var` 定義)。

```
console.log(callSomeone); // undefined
callSomeone('杰倫哥'); // callSomeone is not a function
var callSomeone = function (name) {
  console.log('打給 ' + name)
}
```

比較不同的是在 `function declaration` 函式陳述式中(function 放在最前方的寫法)，整個函式都會被提升到最前方，所以在函式前方直接調用方法也可以運行。

```
callSomeone('杰倫哥'); // 只有 function 會被提升
function callSomeone(name) {
  console.log('打給 ' + name)
}
```

Hoisting 這個觀念主要是要了解 JavaScript 記憶體運作的觀念，實作上也會避免在 function 前方直接呼叫函式，這樣會降低對於程式碼的可維護性。