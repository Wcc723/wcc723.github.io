---
layout: post
title: 開發總是沒問題，上線老是各種錯
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_04.jpg?alt=media&token=69f67bbb-c006-48cd-a2a2-b2f27424b280
published: true
---

不果是新手或老手都可能遇過這樣的狀況，程式碼在測試時運作上看起來都很正常，雖然有一些些地方還不是很熟悉，不過**打從心裡**認定它是正確的，但麻煩卻上線後才發現出錯，仔細檢查也看不出任何問題，殊不知是表達式的觀念錯誤。

程式碼的問題千萬種，本篇就持續在「表達式的觀念」挑出常見的問題，看看是否大家有遇到類似的狀況勒。

## 連續賦值這麼屌，為何文件都說這不好

連續賦值（chain variable assignments）的結構如下：
```js
var a = b = 1;
```

以上這段程式碼中最常見的問題為，`a` 的值是來自於？

1. 1 先賦予至 b，b 再將值賦予至 `a`
2. 1 同時賦予至 `a` 與 `b` （賦予兩次）
.
.
.
.
.
.
.
.
以上兩者皆錯， 正確來說 1 的值來自於 `b = 1` 的回傳值，這時候你一定會想這什麼鬼，什麼叫做 `b = 1` 的回傳值，請再次回想表達式的特點「會回傳一個值」，`=` 屬於運算子的其中一種，它除了會賦予值以外也會同時回傳一個值。

透過幾段程式碼來驗證這個觀念：

#### 1 先賦予至 b，b 再將值賦予至 `a`

這個邏輯的概念 b 會先取得 1 的值，並且 **b 的值會轉為 1 再傳給 a**，以下的範例程式碼用另一個邏輯呈現如下：

- **使 b 的值無法被賦予為 1**
- a 與 b 的值最終不相同

範例中會使用到 `defineProperty` 的方法，並且調整 `writable` 的屬性讓值無法寫入，透過此方法 `b` 的值會被固定為 `2` 無法再被寫入。

```js
Object.defineProperty(window, 'b', {
  value: 2,
  writable: false
});
b = 3;
console.log('b', b); // b 永遠為 2，無法再次被賦予值

var a = b = 1;
console.log('a', a); // 1
console.log('b', b); // 2
console.log(a === b); // false
```

程式碼執行結果如下：
- `b` 值始終為 2
- `a` 值被賦予為 1
- `a` 與 `b` 不相等

所以結論，`a` 的值並不是來自於 `b`。

#### 1 同時會賦予兩次

這個邏輯中 1 會將值賦予給 `a` 與 `b`，這個概念為**數字 1 會被取值兩次**，因此我們透過一個方法來記錄最右側的值被取得的次數。

在此我們會使用到 `get` 的方法來進行紀錄，當變數每次被取值時，會記錄次數乙次。

範例程式碼 1：驗證當每次被取值時 `num` 數值會增加 1，範例中被取值了兩次，因此結果為 2。
```js
var objWithGetter = {
  num: 0,
  get variable() {
    this.num = this.num + 1;
    return 'variable'
  }
}
var a = objWithGetter.variable;
var b = objWithGetter.variable;
console.log(objWithGetter.num); // 當變數被取得時， num 的值會增加 1，在此被取得兩次，所以結果為 2
```

範例程式碼 2：當連續賦值的時候，最終的結果也僅會有一次。
```js
var objWithGetter = {
  num: 0,
  get variable() {
    this.num = this.num + 1;
    return 'variable'
  }
}

var a = b = objWithGetter.variable;
console.log(objWithGetter.num); // 1
```

![實際連續賦值的運作](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F56E3F327-6DA0-49F6-8512-E0628F38B039.png?alt=media&token=9b7e2cf8-eb14-46df-9861-634c65cb63f9)

因此，在連續賦值的概念下中，兩個變數會被視為完全獨立的存在，在一些特殊情況時可能會有出乎意料的情況，就以 ESLint 的說明來說，最常見的即為在函式中使用連續賦值，導致**其中轉為全域變數**影響其它程式碼的運作。


```js
(function() {
  var a = b = 1;
})();
console.log(b); // b 沒有被宣告，屬於全域屬性
// console.log(a); // 立即函式內的區域變數
```

ESLint 文件：https://eslint.org/docs/rules/no-multi-assign
> Chaining the assignment of variables can **lead to unexpected results** and be difficult to read.
> 連續賦值可能導致不可預期的結果，以及難以被閱讀

Airbnb ESLint 文件：https://github.com/airbnb/javascript#variables--no-chain-assignment
> Why? Chaining variable assignments **creates implicit global variables**.
> 為何不使用連續賦值？這會產生全域變數

## 不管輸入什麼，判斷式的結果總為 true

請檢視以下程式碼，請問其中的 `console.log` 是否會執行呢？
```js
var a = false;
if (a = true) {
  console.log('請問此段是否會執行');
}
```

.
.
.
.
.
.
.
答案：這段程式碼 “會” 執行。

這段程式碼是新手常見的錯誤，就是將 `if` 中的判斷式寫成了 `=` 賦值，再來回顧一下 if 判斷式的結構。

```js
if (condition)
   statement1
[else
   statement2]
```

其中的 `condition` 可以使用任何的表達式進行替代，而 `=` 不僅是 JS 中用來賦予值的語法，同時也是屬於運算子的其中一種，所以在此它**不僅會賦予值，同時還會回傳一個結果**，以此段程式碼來說，就發生了以下狀況：

- `a` 的值與原始不同，在此被賦予成 `false`
- `=` 表達式會賦予值，同時會回傳一個值，在此總是會回傳 `true`（無論是否有成功賦予）

![判斷結果為表達式的回傳](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F58B7B572-86B2-490D-BABC-186145A9B5A8.png?alt=media&token=fe793296-afcc-4b4d-9455-74fcf5213ea7)

所以當下次的判斷式不如預期，除了檢查來源值以外，也要同時檢查其中的判斷式（表達式）結構是否符合預期喔。


## ++1 還是 1++，兩個到底有什麼差

```js
var num = 1;
console.log(++num);
console.log(num++);
console.log(num);
```

請檢視以上程式碼，請問過程中的 num 的值分別為？
- 1, 2, 3
- 2, 2, 3
- 2, 2, 2
.
.
.
.
.
.
.
.
`++` 是屬於一元運算子，所以前後只需要一個運算元即可運行，兩者的結果都會使變數值增加，但其中的過程卻大不同。

```
運算元 運算子 num++
運算子 運算元 ++1
```

#### 觀念

變數也是屬於表達式，因此會**先回傳變數值**後再進行運算。所以過程會先回傳原始值，最終再將 `num` 值增加 1。
```
num++
```

運算子屬於表達式，因此 `++1` 會直接進行運算後回傳，因此會直接得到 2 的結果。
```
++num
``` 


所以執行上還是回到了表達式的概念，如果熟悉回傳的時機點將會更容易看出以下題目的結果，請問 a 值為？

- 1
- 2
```js
var b = 1;
var a = b++;
console.log(a);
```

回到初始的題目我們可以給予以下結論：
- 無論是哪一種結果是不變的
- 但過程會有很大的差異，如果過程中需要賦予值到其它變數，則會影響其它變數所接收的值。

```js
var num = 1;
console.log(++num); // 回傳先 ++ 後的結果
console.log(num++); // 先回傳 num，再進行 ++
console.log(num);
```

## 結論

JS 的知識分為應用及基礎兩大區塊，好的應用知識能夠增加開發效率，基礎知識則是能夠增加除錯的能量，兩者在實戰中缺一不可。再快的速度遇到錯誤無法排除，也是會耗去大量時間找問題；只有基礎知識缺乏應用技巧，技能也淪為紙上功夫。最好還是相輔相成，以對等的知識量進行成長，能夠獲得最有效的開發能力。


