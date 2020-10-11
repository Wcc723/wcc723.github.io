---
layout: post
title: JS - for 迴圈與 forEach 有什麼不同
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_20.jpg?alt=media&token=fac330e3-b516-421d-b072-1ed4f70cab8a
published: true
---

過去，當有一個陣列的內容需要依序取值時，都會使用 `for...` 迴圈(for loop)的形式將值一一取出，原始碼的結構如下：
```js
var array = ['小明', '杰倫', '漂亮阿姨', '小美']
for (var i = 0; i < array.length; i++) {
  const item = array[i];
  console.log(i, item);
}
```

現在，陣列執行迴圈不像過去那麼麻煩，陣列的原型中增加了許多方法可以直接運用（陣列方法可[參考](https://wcc723.github.io/javascript/2017/06/29/es6-native-array/)），其中的 `forEach` 基本上可以達到 `for...` 迴圈的所有需求（基本上用了 `forEach` 不太會再去使用 for loop）。

相同的結果，使用 `forEach` 後更容易被閱讀、理解。 
```js
array.forEach(function(item, i) {
  console.log(i, item)
});
```


不過實際上這兩者還是略有差異，本篇就來介紹 for 迴圈與 forEach 的那些小差別。

## for loop 可能會產生全域變數

因為 JS 作用域是屬於函式作用域，而 for loop 在執行時使用 `var` 所建立的變數是屬於在區塊 `{}` 內，因此 for loop 運行時所定義的變數很常會是建立在 **全域** 的環境下。

以下範例來說，下列變數 `i` 就屬於全域的變數。
```js
for (var i = 0; i < array.length; i++) {
  const item = array[i];
  console.log(i, item);
}
console.log(i); // 4
```

相對來說 `forEach` 使用 `callback function` 就不容易踩到這個雷，不過 for loop 依然可以使用 ES6 的 `let, const` 來解決作用域的問題。

目前主流的文字編輯器，輸入 `for` 後預設都會使用 `let` 來定義索引 `i` 的變數。
```js
for (let i = 0; i < array.length; i++) {
  const item = array[i];
  console.log(i, item);
}
console.log(i) // 無法取得 i
```

## for 可以被中斷

雖然 for loop 目前的使用率較不如 `forEach`，不過它可中斷運行的方式在 `forEach` 中是沒有的，如果迴圈中有必要停止運行，就可以使用 for loop 搭配 `break`。

```js
for (let i = 0; i < array.length; i++) {
  const item = array[i];
  if (i === 2) { // 執行到索引 2 就會被中斷
    break;
  }
  console.log(i, item);
}
```

執行到索引 2 就會被中斷，中斷後的迴圈將不會繼續運行。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FA00A7474-3448-46FA-B958-1163C0181871.png?alt=media&token=f9a93963-2ffd-4421-b6b6-3dbd8db8e89a)


## 並非所有陣列都能使用 forEach

JavaScript 中的陣列依據原型的不同，也有另一種分支稱為類陣列（array-like），類陣列中的原型方法與一般定義的陣列就有所不同，其中的方法就可能不包含 `forEach`。

函式中的 `arguments` 就屬於類陣列，它的方法就不包含 `forEach` 的方法，因此它無法直接運行 `forEach`。
```js
function fn() {
  console.log(arguments);
  // for loop 可以正常運行
  for (let i = 0; i < arguments.length; i++) {
    const item = arguments[i];
    console.log(i, item);
  }

  // 錯誤：Uncaught TypeError: arguments.forEach is not a function
  arguments.forEach(item => {
    console.log(item);
  });
}

fn('小明', '杰倫', '漂亮阿姨', '小美');
```

純陣列的原型中可以找到 `forEach` 的方法。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_2_%E4%B8%8B%E5%8D%882_54.png?alt=media&token=aefbe6f9-4d1e-4de1-856c-2ebf0bf4b1a8)

`arguments`  類陣列中不包含 `forEach` 或任何的陣列方法。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F60E5A62F-0197-42B0-AF2C-6CD44D5C7F90.png?alt=media&token=5d9fcbef-21de-4a02-ac87-0c1192e1be5e)

類陣列可以直接使用 for loop 來運行它，如果要使用 `forEach` 的陣列方法也是可行，只要將類陣列透過 ES6 的 “展開” 語法轉換為純陣列即可（`[...]`）。

如以下程式碼中就透過展開將 `arguments` 轉變為純陣列 `arg`，那麼 `arg` 變數就可以使用 `forEach` 的陣列方法。
```js
function fn() {
  const arg = [...arguments];
  arg.forEach(item => console.log(item))
}

fn('小明', '杰倫', '漂亮阿姨', '小美');
```

你是屬於 `forEach` 還是 `for...loop` 派呢？歡迎留言討論看看喔。