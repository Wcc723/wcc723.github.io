---
layout: post
title: 鐵人賽：ES6 開始的新生活 let, const
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_17.png?alt=media&token=c2f9dfdc-35cc-4657-9ba7-b45388e126ff 
published: true
---

接下來本篇開始會介紹 ES6 語法，在很久之前聽到 ES6 這個名詞時我都是保持觀望的態度，裡面有許多語法讓我感覺的不是很真實，像是 `...`、`=>`、`class` 等等，這些看起來與現有的 JavaScript 很不搭嘎 :(。

ES6 許多語法與現有的觀念有很大的關係，其中也很大一部分是為了改進現有的語法，就以本篇要介紹的 `let`、`const` 來說也是如此。這些語法改進目前很多問題，最大的感受在於 `Promise()`，他可以把非同步的語法處理得更漂亮。

至於該不該了解(或學習) ES6？當然要，這已經是可以用在伺服器端(Node.js)及瀏覽器(Chrome)，就如同 CSS 中的 Flex 是非常好用的語法，在各大主流網站都可以看到他的蹤影，與其不斷的觀望，不如實際體驗一次才能了解。

> 注意：目前還不是所有語法支援，詳細可參考 MDN 或 [Can I use](https://caniuse.com/#feat=promises)

## ES6 的變數：let

ES6 出現以後，為了潮，我自己也是想先從最容易改變的`變數`開始，如果不了解看文件大致可以了解：

- `let` 與 `var` 差不多
- `const` 是宣告常數，不能再作修改

雖然還是有差異，但直接使用上確實感受不明顯，我們可以將先前的範例使用 `let` 來試試看：

```js
// 原本的範例
var mom = '老媽';

// 這是一個立即函式
(function () {
  console.log(mom);
})();
```

將以上的 `var` 修改成 `let`。

```js
// 將 var 改成 let
let mom = '老媽';

(function () {
  console.log(mom);
})();
```

和先前沒什麼不同，這個 `console.log` 的結果是 `老媽`，如果不去探究原理，其實還真的沒什麼感覺，不過現在在實戰上已經推薦多用 `let` 少用 `var`，接下來我們來看看差在哪裡。

### `let` 與 `var`

先前提到 `var` 的重要觀念，在於變數的範圍在 `function`，而 `let` 的作用域在 `block`，block 意指 `{}` 這個符號(許多文件稱它為花括號，我自己則喜歡稱它大括號)，除了 `function` 以外 `if`、`for` 的 `{}` 都屬於 `let` 的作用域。

下面的範例可以看到，小明這個變數在兩者的結尾是不同的，因為 `{}` 所定義的空間並不同。

```js
function varMing () {
  var ming = '小明';
  if (true) {
    var ming = '杰哥';  
    // 這裡的 ming 依然是外層的小明，所以小明即將被取代
  }
  console.log(ming);  // '杰哥'
}

function letMing () {
  let ming = '小明';
  if (true) {
    let ming = '杰哥';  
    // 這裡的 ming 是不同的，只有在這個 if block 才有作用
  }
  console.log(ming);  // '小明'
}
varMing(); letMing();
```

### let 與 for loop

但我們知道，大多時候我們並不會這樣寫，常見的習慣中我們會將變數宣告放在 function 的前方，那麼我們再來看另一個情境：

```js
for (var i = 0; i < 10; i++) {
  console.log(i);
  setTimeout(function () {
    console.log('這執行第' + i + '次');
  }, 10);
}
```

如果先不講結果，你會認為以上出現什麼樣的結果呢？

1. 這執行第 0 次, 這執行第 1 次, 這執行第 2 次... (延續 10 次)
2. 這執行第 10 次... (延續 10 次)

我先前跟大家一樣都會猜 `1`，因為 for 幾次不就是幾次嗎 :D。但實際執行時會發現答案其實會是 `這執行第 10 次...` (延續 10 次)，因為 `var` 會直接將 `i` 宣告成全域變數，不斷透過 `for` 迴圈累加，在 `setTimeout` 實際執行時只會拿到 10 這個數字。

所以此段要正確地執行，可以使用 `let` 宣告 `i` 這個變數，`i`會被緊緊的鎖在 for... 後方的 `{}` 內。

```js
for (let i = 0; i < 10; i++) {
  console.log(i);
  setTimeout(function () {
    console.log('這執行第' + i + '次');
  }, 10);
}
```

用此種方法，就會正確的出現，因為 let 是屬於 `block` 變數。

```
這執行第0次
這執行第1次
這執行第2次
這執行第3次
...
```

除此之外，在先前有介紹過，var 在全域下的變數會直接再 `window` 上，可以在這裡使用 `console.log()` 看看兩者之間的差異：

```js
// 這段宣告擇一執行
var mom = "老媽";
let mom = "老媽";
console.log(window.mom);
// var 會出現 "老媽"
// let 會出現 undefined
```

這也是 let 的一大特性，他並不會讓整個 `window` 物件掛上在全域環境所宣告的變數，對於愛乾淨不喜歡污染全域的開發者會是一大福音。

## const

`const` 是宣告一個常數，簡單來說就是不可以再做修改的變數(常數)，以下面這個範例來說，小明如果使用 `const` 做宣告，那麼就無法再使用 `let`、`const` 做調整了。 

```js
const ming = '鐵錚錚男子漢';
let ming = '弱雞';
// 錯誤：Identifier 'ming' has already been declared

const ming = '弱雞';
// 錯誤：Identifier 'ming' has already been declared
```

### const 必須一定要有值

過去可以先宣告變數 (還記得吧，宣告變數未賦予值會是 undefined)，但 `const` 在宣告時一定要賦予值。

```js
const ming;
// 錯誤：Missing initializer in const declaration
```

### 物件依然是參考

使用 `const` 宣告的物件，其內層屬性依然可以做調整，因為物件是傳參考，所以在此依然可以修改屬性。(一家人的成員依然可以更動)
```js
const family = {
  mom: '老媽',
  me: '小明',
  sister: '小橙'
};
family.father = '爸爸';
```

承上，已經被明確宣告的物件，沒有辦法再調整其參考的物件(一家人的成員並不會被另一家取代)。

```js
let jayFamily = {
  mom: '杰哥媽',
  me: '杰哥'
};

family = jayFamily // 錯誤
```

## var 的額外問題

相信上述對於 `let`、`const`都有了基本的了解，那麼不管你有沒有開始寫 ES6，請問一下下述問題如何修正：

沒有使用 `let` 的情況下要如何修正成可以依序執行？

```js
for (var i = 0; i < 10; i++) {
  console.log(i);
  setTimeout(function () {
    console.log('這執行第' + i + '次');
  }, 10);
}
```

答案在下方

---
```js
// for (var i = 0; i < 10; i++) {
//   (function (j) {
//     setTimeout(function () {
//       console.log('這執行第' + j + '次');
//     }, 10);
//   })(i);
// }
```

成功了嗎!?或許你能想到更棒的解法喔～