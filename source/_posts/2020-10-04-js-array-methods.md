---
layout: post
title: JS 常見陣列方法 [push(), unshift(), pop(), shift(), splice(), reverse(), concat(), include(), indexOf(), join()]
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_19.jpg?alt=media&token=8d6a40c4-0b89-4e5c-b7cd-d512cc400264
published: true
---

本篇陣列方法是延伸過去寫的 [JavaScript 陣列處理方法](https://wcc723.github.io/javascript/2017/06/29/es6-native-array/)，目前的框架主流觀念都是「關注點分離」，框架主要都是負責畫面上的渲染；資料面完全交由給原生的 JS 處理，因此，對於資料處理的語法就需要有更高的掌握度。

熟悉陣列的方法，自然對於處理資料上會更得心應手，而先前的「陣列處理方法」是著重在迴圈的運用，而本篇則是介紹其餘常用的部分，本篇所會介紹的方法包含：

- [push()](#Array-prototype-push)
- [unshift()](#Array-prototype-unshift)
- [pop()](#Array-prototype-pop)
- [shift()](#Array-prototype-shift)
- [splice()](#Array-prototype-splice)
- [reverse()](#Array-prototype-reverse)
- [concat()](#Array-prototype-concat)
- [include()](#Array-prototype-include)
- [indexOf()](#Array-prototype-indexOf)
- [join()](#Array-prototype-join)

## 初始資料
本篇的篇幅較長，因此就不會將初始得陣列附在每個段落上，而所有範例都可以在 `Chrome Console` 上運行，如果遇到錯誤可先確認變數是否有宣告成陣列。
```
var array = ['小明', '杰倫', '漂亮阿姨', '小美']
```


## Array.prototype.push()
當需要在陣列的尾端新增一個值，你可以使用 `push()`。

```js
array.push('老媽');
console.log(array); // ["小明", "杰倫", "漂亮阿姨", "小美", "老媽"]
```

> 額外說明：`.push()` 運行時也會回傳值，回傳結果為 “陣列長度”。

## Array.prototype.unshift()

相反的，如果需要加入在第一個則可以使用 `unshift()`。

```js
array.unshift('老媽');
console.log(array); // ["老媽", "小明", "杰倫", "漂亮阿姨", "小美"]
```

> 額外說明： `unshift()`一樣會回傳 “陣列長度”，概念上與 `push()` 是相同的。

## Array.prototype.shift()

`shift()` 則可以移除第一個陣列值。
```js
array.shift();
console.log(array); // ["杰倫", "漂亮阿姨", "小美"]
```

呼叫此方法不僅會移除陣列值，同時會將移除得陣列值進行回傳。
```js
console.log(array.shift()); // 小明
```

## Array.prototype.pop()

`pop()` 則是移除最後一個陣列值。
```js
array.pop();
console.log(array); // ["小明", "杰倫", "漂亮阿姨"]
```

與 `shift()` 相同，`pop()` 也會回傳被移除的值。
```js
console.log(array.shift()); // 小明
```


## Array.prototype.splice()
`splice()` 可以移除指定位置、指定數量的陣列值，語法參考如下：
```js
splice(索引位置, 數量)
```

以下範例來說就刪除了索引位置為 `1`（`'杰倫'`），並且刪除數量 1 的陣列值，因此結果就只有刪除 `'杰倫'`。
```js
array.splice(1, 1);
console.log(array); // ["小明", "漂亮阿姨", "小美"]
```

以下範例則是刪除索引位置為 `2`（`'漂亮阿姨'`），並且刪除數量 2 的陣列值，因此結果就刪除了 `'漂亮阿姨'` 及 `'小美'`
```js
array.splice(2, 2);
console.log(array); // ["小明", "杰倫"]
```

> 額外說明：`splice` 也會回傳值，回傳結果為陣列的本身。

## Array.prototype.reverse()
就如同字面上的意思，`reverse()` 會反轉陣列的本身。

```js
array.reverse();
console.log(array); // ["小美", "漂亮阿姨", "杰倫", "小明"]
```

> 額外說明：回傳結果一樣為陣列的本身。

## Array.prototype.concat()
`concat` 與上述的不同，呼叫此語法時並不會直接操作原有的陣列。

`concat` 是用於串接兩個陣列，串接的結果會透過回傳值取得，並不會套用至原有的陣列。

```js
var newArray = array.concat(['老爸', '老媽']);
console.log(newArray); // ["小明", "杰倫", "漂亮阿姨", "小美", "老爸", "老媽"]
```
> `array` 依然是 `["小明", "杰倫", "漂亮阿姨", "小美"]`

## Array.prototype.include()
`include` 可以用來檢查陣列中是否包含特定值，結果會透過回傳的方式取得。

```js
console.log(array.includes('漂亮阿姨')); // true
console.log(array.includes('阿明'));    // false
```


## Array.prototype.indexOf()
與 `include()` 運作上相當類似，僅不過 `include()` 是回傳 `true`、`false`，而 `indexOf` 則是回傳該值的索引位置。

```js
console.log(array.indexOf('漂亮阿姨')); // 2
console.log(array.indexOf('阿明'));    // -1
```

> 額外說明：當值如果不存在於陣列中，則會回傳 `-1`

## Array.prototype.join()
可以將陣列中的值轉變為字串，並且加入特定字元作為值相間的符號。

```js
console.log(array.join(', ')); // 小明, 杰倫, 漂亮阿姨, 小美
```

簡單的語法，但是搭配 ES6 中的 Template literal 可以用極短的程式碼組合出複雜的字串結構。

```js
var newHTML = `<ul>${ array.map((item)=> `
  <li>${item}</li>`).join(' ')}
</ul>`;
console.log(newHTML);
```

輸出的 HTML 結構：
```html
<ul>
  <li>小明</li> 
  <li>杰倫</li> 
  <li>漂亮阿姨</li> 
  <li>小美</li>
</ul>
```

## 結語

JS 的語法非常多，但不必要求記住這些語法，只需要有概括的理解，待需要用時直接查詢即可。
