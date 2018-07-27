---
layout: post
title: 鐵人賽：ES6 陣列方法
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_23.jpg?alt=media&token=9b3510d2-0327-44e4-be39-420760891ae0
published: true
---

在過去處理陣列的方法不外乎就是使用 `for` 迴圈，或是使用配合框架的 `forEach` 像是 jQuery, angular.js 這些過去的框架都會提供 `forEach`；但到了 ES6 後，許多框架都不再提供 `forEach` 的語法，主要原因也是因為 ES6 就已經包含許多實用的陣列方法。

## 過去使用 forEach 的方式

過去 JavaScript 並沒有 forEach 這樣的方法，如果是用原生的方式大多會使用 `for...`，這樣的寫法並不直覺，所以大多開發者會使用 jQuery、underscore 的框架處理 forEach 的方法。

`for...` 是看陣列數量有多少，就跑幾次的迴圈，程式邏輯很好理解，但在程式碼的呈現並不直覺。

```js
let people = [
  {
    name: '小明',
    money: 500
  },
  {
    name: '漂亮阿姨',
    money: 3000
  },
  {
    name: '杰倫',
    money: 60000
  }
];

for (let i = 0; i < people.length; i++) {
  let person = people[i];
  console.log(`${person.name} 有 ${person.money} 元`);
}
// 小明 有 500 元
// 漂亮阿姨 有 3000 元
// 杰倫 有 60000 元
```

幾年前 jQuery 幾乎是每個 Web 頁面必備的框架，除了很好的 DOM 操作外，裡面已經包含了許多好用的 JavaScript 方法，其中之一當然就是 `$.each`。

```js
$.each(people, (i, person) => {
  console.log(`${person.name} 有 ${person.money} 元`);
});
// 結果同上
```

不僅 jQuery 會提供這樣的方法，同時期的框架也大多會提供，但到了現在的主流框架(React, Vue, Angular 2+)大多會搭配 ES6 編譯工具，所以就不會另外提供陣列的 Each 方法。

```js
// 過去 angular 1 也有類似方法，不過參數的位置與 jQuery 有點不同
angular.forEach(people, (person, i) => {
  console.log(`${person.name} 有 ${person.money} 元`);
});
// 結果同上
```

除了以上兩個框架外，另外也有一個專門處理物件、陣列的框架 [underscore](http://underscorejs.org/)，不管前後端都非常適合使用。

```js
_.forEach(people, (person, i) => {
  console.log(`${person.name} 有 ${person.money} 元`);
});
// 結果同上
```

## ES6 一行解決

ES6 開始提供了不同的 JavaScript 方法，並且搭配 `箭頭函式`、`Template String` 讓程式碼變得更簡短。

```js
people.forEach(person => console.log(`${person.name} 有 ${person.money} 元`));
// 結果同上
```

`forEach` 傳入的參數有三，大多會只使用前兩者 `單一物件` 及 `物件索引`，而最後一個則是完整的陣列本體。

```js
people.forEach((person, i, array) => {
  console.log(person, i, array);
  // person: 單一個陣列的值
  // i: 陣列的索引值 0, 1, 2, ...
  // array: 傳入的陣列本體
})
```

另外 `forEach` 這類型的方法無法中斷，如果想要中斷迴圈的執行會建議使用傳統的 `for...loop`。

```js
for (let i = 0; i < people.length; i++) {
  let person = people[i]
  if (person.money > 500) {
    break; // 可中斷
  }
  console.log(person);
}
people.forEach(function (person) {
  if (person.money > 500 ) {
    break; // 會跳錯
  }
  console.log(person);
})
```

## 無法使用的陣列

先前提過物件原型的概念，有很多類陣列有著陣列的外觀，但其實並不是真正的陣列(如：`arguments`)，這些就無法直接使用 `forEach`。

```js
const callAll = function() {
  console.log(arguments)
  // arguments.forEach is not a function
  arguments.forEach((arg) => {
    console.log(arg)
  });
}
callAll(people[0], people[1], people[2])
```

不過可以使用前文介紹的展開語法 `...` 將 `array-like` 轉成 `array`。

```js
const callAll = function() {
  console.log(arguments);
  let thisPeople = [...arguments];
  // arguments.forEach is not a function
  thisPeople.forEach((arg) => {
    console.log(arg)
  });
}
callAll(people[0], people[1], people[2]);
```

但也有部分的類陣列是可以使用 `forEach`，DOM 的就是屬於其中一種。

```js
let doms = document.querySelectorAll('p');
// 不會跳錯
doms.forEach((ele) => {
  console.log(ele);
});
```

至於類陣列這麼多，怎知道哪些可以哪些不行，其實可以從原型中查找，像是上述的 dom 陣列，我們就可以從 `console.log()` 查看 `__proto__` 找到 `forEach` 的方法。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2017_12_22_%E4%B8%8A%E5%8D%8810_37.png?alt=media&token=40ad30c1-11e2-4ec9-aa35-9fc96e249fc3)

