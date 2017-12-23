---
layout: post
title: 鐵人賽：動態型別的 JavaScript
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c5-01.jpg?alt=media&token=e784ba7d-8255-49e8-aa51-c1739a7bbf61
published: true
---

JavaScript 是屬於動態型別，它定義了七種資料型別，分別為六種原始型別 (ES6 新增一種原始型別)及 Object 型別。在開始之前先用小明來說明一下型別是怎樣的東西。

## 故事說明：

> 承先前故事，小明每天早上醒來都會忘記所有事物，但會在睡覺前把要做的事情先記錄下來，筆記本上會分門別類寫出要做的事情。

小明有時會將要詢問的事情留空白，等到知道結果後再填上數值，像是某一個商品的價格如果再詢問前無法得知，就會先定義變數，等到有值後寫入：

```js
var porkPrice;    // Undefined
```
```js
porkPrice = 200;  // Number
```

小明也不是嚴謹的人，常常在筆記本上塗抹修改的地方，像是亂加漂亮阿姨的姓名、年齡等。

```js
var auntie = "漂亮阿姨";                // String
auntie = { name: '陳小美', ages: 22 };  // Object
```

以上僅是說明動態型別，請不要學小明這樣做。

如果要查看型別，可以使用 `typeof auntie` 來驗證型別，**可以透過 `typeof` 看看以下變數分別屬於哪些型別**，其中會發現有趣的事情。

```js
var family = {
  mom: '老媽',
  me: '小明',
  sister: '小橙'
};

var money = 100;
var isEdge = true;
var attributes = '邊緣';
var variable;
var nullVariable = null; // 猜猜這個是什麼型別
```

## 六種原始型別

原始型別分別為以下六種：

- Boolean：僅有 true, false 兩個值
- Null：僅有 null 的值
- Undefined：沒有被定義的變數
- String：字串型別
- Number：下述說明
- Symbol（於 ECMAScript 6 新定義，以後再說明）

除此之外還有一個 `物件型別`。

### Undefined 與 Null

這兩個就翻譯上會有點接近，但實際上會有一些差異，首先建議："不要將變數手動設為 `undefined`，這可能會造成未預期的結果。

- Undefined 是在定義了一個變數，但是沒有給值
- Null 則是在一個變數上給予了 "空值"
- **JavaScript 本身不會自動給予值 Null，這是讓開發者來設定變數沒有值的**。
- 強制轉型 Number(undefined) -> NaN、Number(null)  -> 0
- typeof(undefined) -> undefined、typeof(null) -> Object
- null 是有效的 JSON 值，undefined 不是

> 為什麼 null 是 Object，自從有 JavaScript 開始就是這樣了，而這個錯誤不能修正，他會導致不可預期的錯誤 (來源：[The history of “typeof null”](http://2ality.com/2013/10/typeof-null.html))。
> 
> 另外原本也預期在未來會給予 `typeof null === 'null'` 的正確結果，但後來也被拒絕。

### Number

數字型別是一種 [浮點數]([雙精度浮點數 - 維基百科，自由的百科全書](https://zh.wikipedia.org/wiki/%E9%9B%99%E7%B2%BE%E5%BA%A6%E6%B5%AE%E9%BB%9E%E6%95%B8))，這種數值在極大值時會有精準度的問題，範例：

```
10000000000000000 - 1;  // 一樣是 10000000000000000
```

所以有些文章會提到不要用 JavaScript 來算錢，可是也要先有這麼多錢再說啊 QQQQ。另外還有以下三種都屬於此 Number 型別。

- +Infinity
- -Infinity
- NaN  (not a number，但屬於數字型別，強制轉型有時會出現此錯誤)

## 物件型別

除了上述的六種原始型別，其餘都是物件型別，包含很常使用的 "陣列"、"函式" 都屬於物件型別。

下一個章節會開始來介紹 JavaScript 的物件，了解物件的概念有助於了解整個 JavaScript 的架構及運作喔 :)