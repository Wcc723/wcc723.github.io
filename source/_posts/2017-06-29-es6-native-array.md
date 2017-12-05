---
layout: post
title: JavaScript 陣列處理方法 [filter(), find(), forEach(), map(), every(), some(), reduce()]
category: javascript
tagline:
tags: [javascript]
cssdemo:
jsdemo:
thumbnail:
photo:    https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F20170629.png?alt=media&token=2db01bf7-e82a-4d54-bd43-7cb17a53592d
published: true
---

陣列處理技巧是 JavaScript 中非常重要的一塊，現在框架大亂鬥的時代，框架基本上對於 DOM 的處理都有屬於自己一套良好的方法。只要能夠對於陣列資料操作熟悉，配合框架就能夠將開發效率更上層樓。

本篇介紹到的方法有：

- [filter()](#Array-prototype-filter)
- [find()](#Array-prototype-find)
- [forEach()](#Array-prototype-forEach)
- [map()](#Array-prototype-map)
- [every()](#Array-prototype-every)
- [some()](#Array-prototype-some)
- [reduce()](#Array-prototype-reduce)

<!-- more -->

直接點上方連結就能跳到指定區域

## 初始資料

本篇都是使用同一份陣列資料，當然你也可以把相關的函式直接貼在 jsbin 或 codepen 上就能看到結果，因為篇幅已經很長了，所以就不在另外補上範例檔。

```js
// 相同的陣列
var people = [
  {
    name: 'Casper',
    like: '鍋燒意麵',
    age: 18
  },
  {
    name: 'Wang',
    like: '炒麵',
    age: 24
  },
  {
    name: 'Bobo',
    like: '蘿蔔泥',
    age: 1
  },
  {
    name: '滷蛋',
    like: '蘿蔔泥',
    age: 3
  }
];
```

## Array.prototype.filter()

filter() 會回傳一個陣列，其條件是 return 後方為 true 的物件，很適合用在搜尋符合條件的資料。

```js
var filterEmpty = people.filter(function(item, index, array){
});
console.log(filterEmpty);    // 沒有條件，會是一個空陣列

var filterAgeThan5 = people.filter(function(item, index, array){
  return item.age > 5;       // 取得大於五歲的
});
console.log(filterAgeThan5); // Casper, Wang 這兩個物件

var filterDouble = people.filter(function(item, index, array){
  return index % 2 === 1;    // 取得陣列中雙數的物件
});
console.log(filterDouble);   // Wang, 滷蛋 這兩個物件
```

## Array.prototype.find()

find() 與 filter() 很像，但 find() **只會回傳一次值**，且是第一次為 true 的值。

```js
var findEmpty = people.find(function(item, index, array){
});
console.log(findEmpty);          // 沒有條件，會是 undefined

var findAgeThan5 = people.find(function(item, index, array){
  return item.age > 5;           // 取得大於五歲的
});
console.log(findAgeThan5);       // 雖然答案有兩個，但只會回傳 Casper 這一個物件

var findLike = people.find(function(item, index, array){
  return item.like === '蘿蔔泥';  // 取得陣列 like === '蘿蔔泥'
});
console.log(findLike);           // 雖然答案有兩個，但只會回傳第一個 Bobo 物件
```

## Array.prototype.forEach()

forEach 是這幾個陣列函式最單純的一個，不會額外回傳值，只單純執行每個陣列內的物件或值。

```js
var forEachIt = people.forEach(function(item, index, array){
  console.log(item, index, array); // 物件, 索引, 全部陣列
  return item;                     // forEach 沒在 return 的，所以這邊寫了也沒用
});
console.log(forEachIt);            // undefined

people.forEach(function(item, index, array){
  item.age = item.age + 1;         // forEach 就如同 for，不過寫法更容易
});

console.log(people);               // 全部 age + 1
```

## Array.prototype.map()

使用 map() 時他需要回傳一個值，他會透過函式內所回傳的值組合成一個陣列。

- 如果不回傳則是 `undefined`
- 回傳數量等於原始陣列的長度

這很適合將原始的變數運算後重新組合一個新的陣列。

```js
var mapEmpty = people.map(function(item, index, array){
});
console.log(mapEmpty);    // [undefined, undefined, undefined, undefined]

var mapAgeThan5 = people.map(function(item, index, array){
  return item.age > 5;    // 比較大於五歲的
});
console.log(mapAgeThan5); // [true, true, false, false]

var mapAgeThan5_2 = people.map(function(item, index, array){
  // 錯誤示範
  if (item.age > 5) {
    return item;              // 回傳大於五歲的
  }
  return false;               // 別以為空的或是 false 就不會回傳
});

console.log(mapAgeThan5_2);   // [{name: 'Casper'...}, {name: 'Wang'...}, false, false]

var mapEat = people.map(function(item, index, array){
  if (item.like !== '蘿蔔泥') {
    return `${item.like} 好吃`;
  } else {
    return `${item.like} 不好吃`;
  }
});

console.log(mapEat);          // ["鍋燒意麵 好吃", "炒麵 好吃", "蘿蔔泥 不好吃", "蘿蔔泥 不好吃"]
```

## Array.prototype.every()

every() 可以檢查所有的陣列是否符合條件，這僅會回傳一個值 `true` or `false`，可以用來檢查陣列中的內容是否符合特定條件。

```js
var array = [
  {
    name: 'Casper',
    like: '鍋燒意麵',
    age: 18
  },
  {
    name: 'Wang',
    like: '炒麵',
    age: 24
  },
  {
    name: 'Bobo',
    like: '蘿蔔泥',
    age: 1
  },
  {
    name: '滷蛋',
    like: '蘿蔔泥',
    age: 3
  }
];

var ans = array.every(function(item, index, array){
  console.log(item, index, array); // 物件, 索引, 全部陣列
  return item.age > 10 // 當全部 age 大於 10 才能回傳 true
});
console.log(ans); // false: 只要有部分不符合，則為 false

var ans2 = array.every(function(item, index, array){
  return item.age < 25
});
console.log(ans2); // true: 全部 age 都小於 25  
```

## Array.prototype.some()

some() 與 every() 非常接近，都是回傳 true or false，差異僅在 every() 需完全符合，some() 僅需要部分符合。

```js
var ans = people.some(function(item, index, array){
  return item.age > 10 // 當全部 age 大於 10 才能回傳 true
});
console.log(ans);  // true: 只要有部分符合，則為 true

var ans2 = people.some(function(item, index, array){
  return item.age < 25
});
console.log(ans2); // true: 只要有部分符合，則為 true  

var ans2 = people.some(function(item, index, array){
  return item.age > 25
});
console.log(ans2); // false: 全部都不符合則為 false
```


## Array.prototype.reduce()

reduce() 和其他幾個差異就很大了，他可以與前一個回傳的值再次作運算，參數包含以下：

- accumulator: 前一個參數，如果是第一個陣列的話，值是以另外傳入或初始化的值
- currentValue: 當前變數
- currentIndex: 當前索引
- array: 全部陣列

```js
var reduceEmpty = people.reduce(function(accumulator, currentValue, currentIndex, array){
});
console.log(reduceEmpty);                 // 沒有條件，會是 undefined

var reducePlus = people.reduce(function(accumulator, currentValue, currentIndex, array){
  // 分別為前一個回傳值, 目前值, 當前索引值
  console.log(accumulator, currentValue, currentIndex);
  return accumulator + currentValue.age;  // 與前一個值相加
}, 0);                                    // 傳入初始化值為 0
console.log(reducePlus);                  // 總和為 46

var reducePlus = people.reduce(function(accumulator, currentValue, currentIndex, array){
  console.log('reduce', accumulator, currentValue, currentIndex)
  return Math.max( accumulator, currentValue.age ); // 與前一個值比較哪個大
}, 0);
console.log(reducePlus);                  // 最大值為 24
```

reduce() 的使用方法更為豐富，想認識更詳細可參考 [MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)。

### 其它

預設的陣列行為內的 this 是指向 window *(本篇中除了 reduce() 是傳入初始資料)*，如果要改，可以在 function 後傳入。

```js
// arr.forEach(function callback(currentValue, index, array) {
// your iterator
// }[, thisArg]);

var ans3 = people.forEach(function(item, index, array){
  console.log(this) // 這邊的 this 就會使用後方傳入的
  return item.age < 25
}, people);         // 傳入的物件，替代 this，如果無則是 window
```
