---
layout: post
title: JavaScript 一級函式 （First Class Functions）
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_09.jpg?alt=media&token=354cf855-6cf6-4f73-82ce-65297eed1b40
published: true
---

本篇重點是要介紹參數與函式的關係（尤其是常令人搞混的 callback function），但這個觀念又會扯到另一個常見的專有名詞（一級函式），因此在本篇就統一介紹。

## 一級函式
一級函式並非是 JavaScript 專有的特性，只要該語言的「函式可被視為與其它變數一樣時」，就可以稱為該語言有一級函式的特性。
> functions in that language are treated like any other variable

這些 JavaScript 的函式就具有以下特性：
- 將函式指定到一個變數
- 函式可作為參數來傳遞
- 函式也可以被回傳（return）
- 函式也是物件的物件（傳參考特性、具有屬性）

範例：將函式指定到一個變數，這是函式表達式，建立匿名函式後指定到變數 `callSomeone` 上。
```js
var callSomeone = function(name) {
  console.log(`呼叫 ${name}`);
}
callSomeone('小明');
```

## 函式作為參數來傳遞 - 回呼函式 Callback function
因為一級函式的特性，函式可被視為變數一樣隨意使用，當然作為參數的傳遞也是沒有問題的。所以在呼叫變數時，也一樣可以將函式作為參數傳遞，而這也被稱為 callback function（函式傳入另一個函式後被呼叫）。

以下範例就是將函式作為參數傳遞入另一個函式，由於函式本身結構就比較複雜，加上傳遞的過程可以改變名稱，因此會讓新手常常在查看程式碼中感到混亂。
```js
function sayHi(fn) {
  fn('小明');
}
sayHi(function(name) { console.log(name + ' 您好'); });
```

接下來，我們透過圖片加上文字說明解釋這段問題：

1. 呼叫 `sayHi` 函式同時傳入一個函式（在此我們先稱它為 `函式Ｂ`）
2. `函式Ｂ` 參數傳入後名稱是由函式定義名稱，因此傳入的參數名稱改為 `fn`
3. 在 `sayHi` 函式內呼叫 `fn` 參數（原本的 `函式Ｂ`）
4. 呼叫 `fn` 參數時，傳入 '小明' 作為參數傳遞至 `函式Ｂ`

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F084B07D1-2BAE-40CA-AA26-EC9EFAC6044B.png?alt=media&token=4797bfc2-1332-475a-b883-251b027b7ee8)

如果你接觸 JavaScript 還不是很久，或者是常常被 callback function 搞混，試著用以下的方法：
- 從定義的函式開始找 callback 及參數名稱，callback 常用的名稱會如 `cb`、`callback`、`fn`。 -> 本範例中使用 `fn` 的名稱。
- 接下來請專注在傳入的參數結構上（像是上方範例中的 `函式Ｂ`），此函式是否有接收其它參數，如何運作等等。 -> 外部傳入的參數另有接收 `name` 的參數。
- 接下來思考兩個重點：
	- callback function 在函式中的哪裡被呼叫，並且傳入了哪些參數。 -> 第一行就被呼叫，並且傳入 `'小明'` 作為參數。
	- 外部傳入的函式接收了參數做哪些事。 -> 直接使用 `console.log()` 呈現值。

接下來，大家可以拆解看到的 callback function 或者用此觀念撰寫一個 callback function 將更能熟悉此觀念。

### 使用函式變數來傳遞

Callback function 除了直接在參數中撰寫一個函式外，也可以直接透過函式變數來傳遞（前面提到一級函式的特性，函式也可以指定到一個變數上）。

如以下範例：`callSomeone` 函式可以視為一個變數，並且透過參數的方式來進行傳遞。
```js
function callSomeone(name) {
  console.log(name + ' 您好');
}
function functionB(fn) {
  fn('小明');
}
functionB(callSomeone)
```

> 可試著用前面的拆解方式來了解此段是如何運作的


### Callback function 可以用來做什麼？

在 ES6 中的 `Promise` 語法還未能使用前，就很常使用 callback function 來接收非同步的資料（當資料取得後，繼續執行其它的函式）。

以下範例是使用 `setTimeout` 取代 Ajax，當一秒時間過去以後，才能繼續執行 callback 的程式碼內容。
```js
function callSomeone(callback) {
  setTimeout(() => {
    callback('非同步完成')
  }, 1000);
}
callSomeone(function(done) {
  console.log(done);
});
```



## 回傳一個函式 - 高階函式 Higher-Order Function
當函式可以回傳一個函式時，就可稱為高階函式（Higher-Order Function），JavaScript 中的函式因為沒有太多限制，就算作為變數回傳也是沒有問題的。

以下範例中的函式會在回傳另一個函式，因此在呼叫 `method` 時，此函式具有以下特性：
- 這是一個新的函式，同時保有 `method` 的作用域（可呼叫 method 的參數及變數）
- 可以建立多個新函式，並且賦予到不同的變數上
- 這些建立的新函式彼此並無關聯

在此就建立了 `num1`、`num2` 兩個新函式，兩者都可以再次被呼叫。
```js
function method(num) {
  return function() {
    return `這是來自於編號 ${num} 的方法`;
  }
}
var num1 = method(1);
console.log(num1()); // 這是來自於編號 1 的方法

var num2 = method(2);
console.log(num2()); // 這是來自於編號 2 的方法
```

除了將回傳函式賦予到一個變數上以外，還可以直接使用雙括號 `()()` 的方式直接運行，這種運行方式運行後將會直接釋放記憶體。

```js
console.log(method(3)());
```


因為 JavaScript 函式的隨性（？）造就了此語言更多的彈性，這些專有名詞看似很複雜，但別忘了專有名詞只是方便說明一個特性，實際運行還是要看大家所轉寫的程式，並不會因為了解這些專有名詞寫的程式就跑得更起勁。

另外，高階函式的觀念已經很接近 “閉包”，接下來整合這幾個篇章重新再介紹一次閉包給大家認識。
