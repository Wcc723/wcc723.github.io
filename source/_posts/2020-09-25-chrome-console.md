---
layout: post
title: Chrome Console 中的 undefined 到底是哪來的？
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_10.jpg?alt=media&token=3c49f0d8-38a0-4581-8d63-d6c286226ac1
published: true
---

教學的過程中，有許多學員會盡可能的搞懂程式碼運行過程中的各種結果，其中一個比較特別的案例就是想搞懂為什麼 Chrome Console 下方的 `<·` 會回傳 undefined。

範例程式碼：
```js
var a = 1
```
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_11_%E4%B8%8B%E5%8D%881_47.png?alt=media&token=1c75bce2-a6be-46e6-82c6-a91451c57978)

本篇屬於不知道也不會怎樣的冷知識，但如果了解，你則會更清楚 JS 中的表達式觀念。

說明：本篇所介紹的環境都是在 Chrome Console 的直接輸入直接運行，並非透過原始碼運行的結果。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FE6201004-CF02-4B5B-8B85-6FC908D58B36.png?alt=media&token=8849d2ba-959b-4ff4-b643-769dd32e547a)

## Console 回傳的結果與表達式有關
如果要清楚的預測 Chrome Console 中所出現的值，就一定要搞清楚「表達式」的概念，前幾篇的文章有提到表達式的特徵就是 “**一定會回傳值**”，Chrome Console 中輸入程式碼後的下一行呈現的正是回傳結果。

如果想多認識表達式，可參考本文：https://wcc723.github.io/development/2020/09/17/js-expression/

#### 純值

任何的純值都可以視為 「表達式」，因此輸入純值運行後的下一行回傳的結果就是該值。

```js
1 // 這行就只有數字 1
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_11_%E4%B8%8B%E5%8D%881_51.png?alt=media&token=7eae7232-8e95-4d4e-a752-c32728df00f6)

#### 陳述式

與表達式不同的「陳述式」最大的特徵是 “**不會回傳值**”，因此陳述式輸入在 Chrome Console 後會帶出的是 `undefined` 的結果。

`var` 屬於宣告陳述式，因此不會回傳任何的結果。

```js
var a = 1;
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F23D51B14-7756-42E5-832A-010E22D9F08B.png?alt=media&token=e0ddc3d4-b494-45db-a170-973af5e63d59)

一樣的概念，`if` 是屬於陳述式，因此執行結果為 `undefined`。 

```js
if (a === 1) { }
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FE051247B-972A-4C40-8555-3A5C5385BB30.png?alt=media&token=6164588a-1bbd-4b64-8c22-f17fc1ed8a1b)


`=` 是屬於運算子，運算子同樣屬於表達式，因此會回傳一個值，結果會不同於上方的 `var` 的宣告陳述式。

```js
a = 1;
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FB1FDCE20-6152-4512-A64A-2B3F06F1BCD5.png?alt=media&token=7cd9a826-7b06-403a-8665-e596766a0d8f)


#### 多行程式碼

當 Chrome Console 中輸入多行的程式碼時，回傳的值會是以程式碼中「排列最後方的表達式」為主，因此：
- 當有多個表達式，會回傳最後一個表達式
- 如果最後一個是陳述式，則會跳過僅回傳表達式

```js
a === 1;
a = 2; // 回傳此表達式結果
var a = 1; // 此為陳述式，因此跳過
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F03CAF7FC-BA6B-45AD-BF5C-BEC729CA000D.png?alt=media&token=a2bc6ed6-60ea-4d8b-9f4c-59ba4091762e)

#### 函式

函式運行是屬於表達式的一種，因此 `<·` 會帶出函式中 return 的值。

```js
function fn() {
  return 'function';
}
fn();
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_11_%E4%B8%8B%E5%8D%882_09.png?alt=media&token=b4e3cd23-829e-4cb3-8c30-576fa4623cd1)

如果函式中沒有 `return` 一個指定的結果，函式運行依然是屬於表達式，它則會帶入 `undefined`（未定義）的值。

```js
function fn1() {
}
fn1(); // 沒有指定回傳值，則會回傳 undefined
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F83B96A90-53A2-4F33-85CA-6405632ED5EA.png?alt=media&token=c30ccce8-23f1-4085-bd4e-cd80f006c5a9)

#### console
`console.log` 語法會直接在 Chrome Console 中印出指定表達式的結果，與直接輸入在 Chrome Console 中的回傳不同，在呈現的結果前方不會有  `<·` 符號，僅會以空白的方式呈現。

```
console.log(1)
```

要特別注意的是 `console.log()` 是運行一個函式，運行函式也會回傳一個結果，只不過 `console.log`運行時並沒有帶入回傳值，因此在下圖中最後一行  `<·` 的後方會回傳 `undefined`。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F33882037-2CEF-4725-97C7-A1EAD8D7AEFD.png?alt=media&token=8e65e144-cf51-4f70-aa37-831e02647f27)


問：下圖中的 `function1`、`"function2"` 兩行文字分別是什麼原因出現的呢？

```js
function fn2() {
  console.log('function1')
  return 'function2'
}
fn2()
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FDBBCDB60-EDEA-446A-B13B-8A44D38E846C.png?alt=media&token=272332b8-53b3-4222-9a18-b82e2d643a76)


.
.
.
.
.
.
.
.
.
- function1: console.log() 執行呈現的結果
- function2: 運行 fn2() 所回傳的結果