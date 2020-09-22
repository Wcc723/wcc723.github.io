---
layout: post
title: JavaScript 利用表達式優化你的程式碼
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_03.jpg?alt=media&token=bccf04b2-d14b-4578-89dc-200f838a40cd
published: true
---

上一節介紹了表達式的基本概念「回傳結果」，那麼接下來你一定會想了解有哪些地方可以用到表達式，本篇就列出 JS 語法與常見框架的表達式運用，熟悉以後將會大幅增加 JS 語法的變化性。

## 運算子 
運算子依據運算元數量，可分為一元、二元甚至是三元運算子，而運算元本身也是屬於表達式，以我們常見的 `===` 來說就屬於二元運算子。

```
運算元1 運算子 運算元2
```

此範例中的前後 `1` 皆是運算元，運算元本身也是屬於表達式，並且此運算子最終會回傳一個 `true` 的結果，請記住這個概念，我們延伸介紹幾個不同的運算子運用。
```js
1 === 1;
```

### 邏輯運算子 `||`、`&&`

邏輯運算子包含 `&&`、`||`、`!`，在語法的概念上稱為 and、or、not，常見情境是用來作為判斷語句使用（condition），不過在文件中的描述卻不僅於此，以 `&&` 來說，文件上的敘述為：

> **假如 運算式1 可以被轉換成 false的話，回傳 運算式1；否則，回傳 運算式2**。 因此，&&只有在 兩個運算元都是True 時才會回傳 True，否則回傳 false。

```js
expr1 && expr2
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_8_14_%E4%B8%8A%E5%8D%8810_51.png?alt=media&token=32908e54-5b97-44aa-960a-4830246af1e4)

常見的情況下，我們預期兩者都為 “真” 時，取得 "true" 的結果。

```js
console.log(false && true); // 只要其一為假值，就會回傳假值
```

不過運算元也是表達式，因此我們可以替換成任何表達式也可運行，以此範例來說我們取得的值並非為 `true`，而是後者 `'杰倫'`。
```js
console.log('小明' && '杰倫');
```

#### 然後勒？哪邊可以用到這個概念

與 `&&` 相對應的是 `||`，在文件上的說明為：

> **假如 運算式1 可以被轉換成 true 的話，回傳 運算式1； 否則，回傳 運算式2**。 因此，||在 兩個運算元有任一個是True 時就會回傳 True，否則回傳 false。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_8_14_%E4%B8%8A%E5%8D%8810_59.png?alt=media&token=fb6a35b7-defd-4249-930c-4898e659a895)

假定情境，我跟老媽去餐廳用餐，我和老媽都搶著付錢，但其中一人其實沒有錢，在此就可使用 `||` 來判斷有錢者的值為何。
```js
var myPay = 0;
var momPay = 1000;
console.log(myPay || momPay); // 1000
```

實戰中更常見 “傳入值不確定是否為真值” ，有可能為 `undefined`、`null`、`0`...，不過在執行上為了避免出錯，我們強制需付予一個值時，可使用以下方法：

```js
var unconfirmed = undefined; // 變數 a 無法確認來源值
var defaultValue = unconfirmed || 1000;
// 來源值為假值則賦予 1000，如果是真值則套用來源值
console.log(defaultValue); // 1000
```

## 三元運算子 / 條件運算子
三元運算子的介紹：https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Operators/Conditional_Operator

「三元運算子 / 條件運算子」是唯一用到三個運算元的運算子，它的結構如下：
```js
condition ? exprIfTrue : exprIfFalse
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_8_14_%E4%B8%8A%E5%8D%8811_10.png?alt=media&token=1d42fac0-8b82-4b83-94a8-a88b32cd344c)

範例如下，當年齡大於 18 則會取得 '成年' 的結果，如果否定則回傳 '未成年'。
```js
var myAge = 22;
console.log(myAge >= 18 ? '成年' : '未成年');
```

而運算元本身就是屬於表達式，我們可以在這判斷式、前後運算元替換任何的表達式來運行它，也因為如此三元運算子還經常作為 `if () { ... }` 的縮寫。

`if () { ... }` 是很易讀的判斷式，但如果僅做簡單判斷時，則會顯得過於攏長。
```js
// 宣告函式1, 2
function fn1() {
  return '函式1'
}
function fn2() {
  return '函式2'
}
var variable = false;

// 當變數為真值時，執行 fn1，如果為假值則執行 fn2
if (variable) {
  console.log(fn1()); // 不執行
} else {
  console.log(fn2()); // '函式2'
}
```

如果改為三元運算子則可改寫成如下，當變數為真時執行並回傳 `fn1()`，如果為假時執行並回傳 `fn2()` ：
```js
console.log(variable ? fn1() : fn2());
```

透過此方式可以將多行的 `if () { ... }` 判斷式縮減成一行，除了行數減少外，還可以同時回傳值（運算子最終也會回傳值），因此許多進階的開發者都會使用三元運算子取代單純的 `if () { ... }` 判斷式。

## 框架運用
目前的主流框架都是屬於畫面與 JS 邏輯分離（關注點分離），而在邏輯資料傳回畫面時的片段程式碼，大多都可利用表達式的方式撰寫，以 Vue 來說就明確說明可多利用表達式的特性，[參考文件](https://vuejs.org/v2/guide/syntax.html#Using-JavaScript-Expressions)。

可利用的表達式範例：
```html
{{ number + 1 }}

{{ ok ? 'YES' : 'NO' }}

{{ message.split('').reverse().join('') }}

<div v-bind:id="'list-' + id"></div>
```

但如果使用的是陳述式則會無情地對你噴出錯誤：
```html
<!-- this is a statement, not an expression: -->
{{ var a = 1 }}

<!-- flow control won't work either, use ternary expressions -->
{{ if (ok) { return message } }}
```

可開啟以下連結，並使用 Chrome Console 除錯：https://codepen.io/Wcc723/pen/RwarveQ

程式碼如下：

```html
<div id="app">
  {{ num === 1}} <br>
  {{ num === 1 ? '數字 1': '不是數字 1'}} <br> 
            
  <!-- `=` 也屬於運算子，這樣寫也是通的 -->
  {{ num2 = 1 }}          
  
  <!-- 但下面這行是陳述式，所以會噴錯 -->
  <!-- {{ var num2 = 1 }} -->
</div>
```

本篇介紹表達式的常用情境，以及程式碼可以怎麼拆以及如何運用，下一篇則會繼續介紹表達式中常會引發的額外錯誤。