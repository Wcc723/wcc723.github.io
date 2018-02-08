---
layout: post
title: 鐵人賽：JavaScript 展開與其餘
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_21.jpg?alt=media&token=dc0c2214-73bf-4ad6-be70-257e52f337e7
published: true
---

這兩個分別稱為 展開運算子(`spread operator`) 及 其餘運算子 (`rest operator`，也可稱為其餘參數)，這兩個運算符有個兩個特點，就是都與陣列有關係，除此之外他都是 `...`；第一次看到這樣的符號出現在 JavaScript 中，我還認為這是哪個預處理器的語法，不過在此他真的是 ES6 語法，以下內容一樣可以貼到 Chrome 運行。

> 預處理器：像是 CSS 的 Sass，在編譯前無法直接被讀取，需要透過編譯為 `.css` 或 `.js` 才能被瀏覽器使用，常見的 JavaScript 預處理器有 `CoffeeScript`、`TypeScript`。

## 展開

展開非常的好用，我們先來看一個簡單的範例，這裡有兩組的陣列，我們想把他合併到同一個變數上，那麼我們可以直接用以下方法接起來。

```js
let groupA = ['小明', '杰倫', '阿姨'];
let groupB = ['老媽', '老爸'];

const groupAll = [...groupA, ...groupB];
// ['小明', '杰倫', '阿姨', '老媽', '老爸'];
```

誒...，看到這裡是不是有似懂非懂的感覺，看似那麼容易卻不太容易理解，`...` 到底做了什麼事情!? 它其實一次又一次的 return 陣列中的值。

```js
console.log(...groupA); 
// 小明 
// 杰倫 
// 阿姨
```

順帶一提，以上的概念如果用傳統的寫法會像是這樣。

```js
let groupA = ['小明', '杰倫', '阿姨'];
let groupB = ['老媽', '老爸'];
const groupAll = groupA.concat(groupB);
// ['小明', '杰倫', '阿姨', '老媽', '老爸'];
```

### 淺層複製

另外陣列與物件相同都有著傳參考的特性，所以當把陣列賦予到另一個值上時，修改其中一個另一個也會跟著變動。

```js
// 由於傳參考的關係，所以將一個陣列傳到另一個上時
// 兩個的值其實是一樣的
let groupA = ['小明', '杰倫', '阿姨'];
let groupB = groupA;
groupB.push('阿明');
console.log(groupA); // ['小明', '杰倫', '阿姨', '阿明'];
```

由於 展開運算子 它是一個一個將值寫入，所以他也有淺層的複製(`shallow copy`) 。

```js
// 這個屬於淺拷貝，所以不會影響到另一個物件
let groupA = ['小明', '杰倫', '阿姨'];
let groupB = [...groupA];
groupB.push('阿明');
console.log(groupA); // ['小明', '杰倫', '阿姨'];
```

### 類陣列轉成純陣列

JavaScript 中有許多類陣列，這類陣列有著陣列的外皮，但卻不能使用陣列的方法，相信先前有參考過原型章節的文章有發現這點，這類陣列由於原型不同，所以 "不能" 使用許多的陣列方法，如： `map()`, `concat()` 等等。

其中一種很常見的就是 DOM 陣列，這也可以透過展開運算子轉為純陣列。

```js
// 可以將類陣列轉成陣列
let doms = document.querySelectorAll('p');
console.log(doms);
let spreadDom = [...doms];
console.log(spreadDom);
```

在先前小明儲值的故事中，悠遊卡的儲值是使用 `for...in`，原因也在於他不是真正的陣列，不過當他如果轉成真正的陣列後，就多了很多方法可以用了 (嘿嘿嘿)。
```js
// 同樣道理，arguments 不是真正的陣列，也可以透過 ... 來轉成純陣列
var originCash = 1000;
function updateEasyCard() {
  let arg = [...arguments]
  let sum = arg.reduce(function (accumulator, currentValue) {
    // 分別為前一個回傳值, 當前值
    return accumulator + currentValue;  // 與前一個值相加
  }, 0);
  // 如果使用 arguments 則會出現 `arguments.reduce is not a function`
  console.log('我有 ' + sum + ' 元');
}

updateEasyCard(0); // 我有 1000 元
// arguments = [];

updateEasyCard(10, 50, 100, 50, 5, 1, 1, 1, 500); // 我有 718 元
// arguments = [10, 50, 100, 50, 5, 1, 1, 1, 500];
```

## 其餘參數

其餘參數，顧名思義就是傳入的參數，用途類似 `arguments`，但不同的是：
- `arguments` 不是真的陣列，其餘參數則是
- `arguments` 不能混用自訂傳入的參數

以下就是使用其餘參數改寫以上範例。

```js
let mingCard = {
  name: '小明',
  value: 0
};

function updateEasyCard(mingCard, ...money) {
  console.log(money); // 其餘參數的陣列
  mingCard.value = money.reduce(function (accumulator, currentValue) {
    // 分別為前一個回傳值, 當前值
    return accumulator + currentValue;  // 與前一個值相加
  }, mingCard.value);
  console.log(`${mingCard.name} 的卡現在有 ${mingCard.value}`);
}
let money = [10, 50, 100, 50, 5, 1, 1, 1, 500]
updateEasyCard(mingCard, ...money); // 718

updateEasyCard(mingCard, 50, 100, 50, 70, 200); // 小明 的卡現在有 1188
```

透過其餘參數，我們還能混用其他的變數像是 `mingCard`，讓這個儲值函式彈性更高，而不受 `arguments` 依序傳入的限制。

看到目前為止，你會跟我一樣覺得 ES6 的程式碼看起來不像 JavaScript 嗎？
