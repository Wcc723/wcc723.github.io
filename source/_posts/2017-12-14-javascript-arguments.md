---
layout: post
title: 鐵人賽：JavaScript 函式與參數
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c11-01.jpg?alt=media&token=9502b109-d43c-4d79-915a-d659e2c91b07
published: true
---

函式可以將參數傳入，使得函式的可用性提高許多，不過其中也有許多小技巧及方法可以運用，以下我們用 **悠遊卡的概念** 來說明此段。

> 小明的悠遊卡裡面有 1000 元，他要儲值一些零用錢進悠遊卡內 (真是優秀青年，這麼多錢還繼續儲)，好讓他可以繼續搭乘捷運。

## 傳入變數

以下是一個簡單的函式，用來更新悠遊卡的金額。小明將錢 `cash` 投入機器內後，按下執行按鈕 `updateEasyCard()` 就會回傳更新後的悠遊卡金額。

```js
var originCash = 1000; // 悠遊卡內原有的現金
function updateEasyCard (cash) { // 傳入儲值金進入悠遊卡
  var newCash = cash + originCash;
  console.log('我有 ' + newCash + ' 元');
}
updateEasyCard(1000); // 我有 2000 元
updateEasyCard(2000); // 我有 3000 元
```

但如果機器沒有設定好，小明還沒有投入任何金額就按下 `updateEasyCard()` 就會跳出 NaN (Not a Number) 的錯誤 。

```js
updateEasyCard(); // 我有 NaN 元
```

所以有些函式會透過 `||` 來加入預設值，在沒有輸入任何值的情況下會使用預設值代替，這邊就先將預設值設為 `100` (佛心機器，沒投錢也會給 100)。

```js
var originCash = 1000;
function updateEasyCard(cash) {
  var money = (cash || 100) + originCash;
  console.log('我有 ' + money + ' 元');
}

updateEasyCard(); // 我有 1100 元
```

這樣，至少不會出現錯誤了，但會出現另一個問題，假設函式中真的需要使用 `0`、`false` 這種值傳入時，他一樣會使用前者所套用的值。

```js
updateEasyCard(0); // 我有 1100 元
```
*0 會被強制轉型成 false，所以兩者都會被替代。*

### 複雜的判斷式

`||` 本身就是一個判斷式，如果簡單的判斷式沒辦法滿足需求，那麼就使用更複雜的判斷式來寫，以下範例：如果 cash 是 false，且 cash 不等於 0 的情況， cash = 100。

```js
var originCash = 1000;
function updateEasyCard(cash) {
	if (!cash && cash !== 0) {
	  cash = 100;
	}
  var money = cash + originCash;
  console.log('我有 ' + money + ' 元');
}

updateEasyCard(); // 我有 1100 元
updateEasyCard(0); // 我有 1000 元
```

當然，還有一種情況就是傳入的並非數值而是字串，這樣則會造成金額也自動轉換成字串。

```js
updateEasyCard('1000'); // 我有 10001000 元
```

那麼就需要先將文字轉成數值，避免原始的數值被轉換為字串。

```js
var originCash = 1000;
function updateEasyCard(cash) {
  cash = Number.parseInt(cash);
	if (!cash && cash !== 0) {
	  cash = 100;
	}
  var money = cash + originCash;
  console.log('我有 ' + money + ' 元');
}

updateEasyCard('100'); // 我有 1100 元
updateEasyCard('這不是錢'); // 我有 1000 元 (無法被轉換)
```

### ES6 預設函式變數

在 ES6 中提供更簡潔的方式來解決此問題，可以直接在傳入的參數賦予預設值，此預設值也不需要額外的帶入判斷式就能達到以上效果(但文字問題依然要自己修正喔)。

```js
var originCash = 1000;
function updateEasyCard(cash = 100) {
  var money = cash + originCash;
  console.log('我有 ' + money + ' 元');
}

updateEasyCard(); // 我有 1100 元
updateEasyCard(0); // 我有 1000 元
```

## arguments

> 假設小明零錢很多，他要一個一個投進去機器內儲值，這樣參數該如何設計？

除此之外，JavaScript 有預設的參數 `arguments` 可直接帶入，這種參數不須預先設定，所有函式都內建此參數，他會將呼叫函式所帶入的參數一並透過陣列的方式傳入。

```js
var originCash = 1000;
function updateEasyCard() {
  var cash = 0;
  console.log(arguments); // 這裡可以看到 arguments 的結構
  for (var i = 0; i < arguments.length; i++) {
    cash += arguments[i];
  }
  var money = cash + originCash;
  console.log('我有 ' + money + ' 元');
}

updateEasyCard(0); // 我有 1000 元
// arguments = [];

updateEasyCard(10, 50, 100, 50, 5, 1, 1, 1, 500); // 我有 1718 元
// arguments = [10, 50, 100, 50, 5, 1, 1, 1, 500];
```

不過 `arguments` 實際在使用時會有一些小問題，像是範例中為何是使用 for 迴圈，而不是使用 `forEach` (forEach 可以使用在陣列上)，主要原因是 `arguments` 並非真正的 `陣列`，它是 `類陣列(Array-like)` 的物件，因此無法使用許多陣列相關的方法。

相關文件可查閱：https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments

