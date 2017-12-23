---
layout: post
title: 鐵人賽：JavaScript 的文法學
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c8-01.jpg?alt=media&token=9f7d7ddf-070b-4a6f-a850-701943dae095
published: true
---

大多數國家的語言都是由左到右、由上而下的閱讀方式，中文、拉丁語系就是屬於這類型，但也有部分國家是由右到左的，像是阿拉伯語系就是如此。而 JavaScript 是由左到右，還是由右到左呢？大多情況下我們會認為 JavaScript 是由左到右，但部份時候則會由右到左的喔。

## 運算子

用簡單的一點的方式說明， `+`、`=`、`==`  都是運算子，本身這也是屬於函式的一種，是用來將它本身 **前後方的值** 做計算，然後回傳一個新的值。

```
3 + 3; // 回傳 6
```

所以中間的 `+` 即是運算子，這些運算子都屬於一個函式，但他只要寫在兩個值的中間(或是前、後的其中一方)，不需要完整函式即可運作，所以稱為運算子。運算子可以用來賦予值、數學運算、比較等等，如果想知道有哪些運算子可看：[運算式與運算子 - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide/Expressions_and_Operators)

## 方向及優先性

我們在寫 JavaScript 時也是習慣由左到右撰寫，但其實 JavaScript 文法並不是只有由左到右，而是依據 `結合性` (Associativity) 決定它是由左至右，還是由右至左閱讀。

一個簡單的例子：

```js
a = b = 5;
console.log(a);
```
請問以上這段是從哪個方向開始閱讀!?

上述的例子，將 5 的數值賦予給 b ，再由 b 賦予給 a，所以 a 的值會得到 5。除此之外，JavaScript 還有一個優先性，高優先性 (Precedence) 的運算子會被優先執行，在看以下範例：

```js
3 + 3 * 3 // 得到 12，因為 * 的優先值高於 +
(3 + 3) * 3 // 得到 18，因為 () 內的優先計算
```

我們都了解先乘除後加減，所以乘號的優先值基本上是高於加的；而如果括號則是括號內的優先計算，所以很好理解。

所以下方兩個 a 分別會是什麼？哪一個運算子會先被執行？

```
a = 3 * 3
a = 9 === 3 * 0 || 3
```

所以這段只要了解優先性就可以知道答案，MDN 有提供完整的表可以參考：[運算子優先等級](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)，表中的 Precedence 數值越高代表優先度高，也會被優先執行，而 Associativity 則是文法閱讀的順序，大家也可以直接貼到 Chrome Console 看看以上答案。

第二個 a 的說明

```
9 === 3 * 0 // 得到 false
false || 3  // 由於前者是 false，所以用 3 取代
```

## 陷阱

因為綜合性 (閱讀順序)及優先性的關係，就會產生一些怪異的問題，以下兩個案例非常接近，但卻出現相反的結果，以正確來說以下兩者應該都出現 false，但卻出現一個 true，另一個 false 的結果 (正常專案盡可能不要做連續的判斷)。

```js
1 > 2 > 3  // false
3 < 2 < 1  // true
```

上面的後者來說，他會依據以下方式來執行：
1. 因為文法是由左至右，所以先執行 `3 < 2`  得到 `false`
2. 接下來會執行 `false < 1` 不過此時的 `false` 會被轉型成 0
3. `0 < 1` 所以是 `true`

---

這段因為太燒腦，所有小明沒有出場。

延伸問題，請問以下解答是什麼？

```js
1 > 2 == 0
```

