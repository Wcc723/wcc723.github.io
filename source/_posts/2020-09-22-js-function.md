---
layout: post
title: 呼叫函式時，到底有多少個參數 / 變數可供使用？
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_07.jpg?alt=media&token=d6da2623-6897-4016-bb83-4a85638c9df3
published: true
---

建立一個函式並呼叫時我們可以傳入一些參數，或者在這個參數中引用全域的變數，不過一個被呼叫的函式中究竟有多少可取用的變數或參數呢？

## 函式中的可用變數
本篇會著重在參數的介紹，但一個函式中到底有哪些參數及變數呢？

以下透過一段範例程式碼來檢驗呼叫函式會有哪些變數 / 參數，在此可以透過「無痕模式」直接運行此段程式碼（無痕模式較能避免瀏覽器插件影響運行）。

> 注意：此段是針對傳統函式的說明，箭頭函式的運行變數與傳統函式不同，在此不討論。
```js
var globalVariable = '全域變數';
var obj = {
  aFunction: function (para) {
    var localVariables = '區域變數';
    console.log(para, localVariables, arguments, this, globalVariable);
    // 包含傳入的參數
  }
}
obj.aFunction('一段描述', 2, 3);
```

運行時，可切換到「Source」分頁，並使用 Chrome 的 JavaScript 除錯模式來進行驗證（除錯模式的[教學](https://developers.google.com/web/tools/chrome-devtools/javascript/reference)）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_1_%E4%B8%8B%E5%8D%883_29.png?alt=media&token=f7433765-ce8c-46f6-92b4-7347a5551b90)

接下來進入到 aFunction 的函式中時，可以切換到 `console.log(...)` 這行停下來，畫面結果如下：
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_1_%E4%B8%8B%E5%8D%883_28.png?alt=media&token=d2fa9700-d67d-4b08-a3a0-2b575ca591d8)

接下來會看到 Scope 表示目前**函式的作用域**，此作用域可呼叫的變數也會依序列出，在此可以看到的變數 / 參數會包含：

- **para**: 呼叫時傳入的參數。
- **arguments**: 傳統函式預設會帶入的外部參數，此參數來自於外部所傳入的參數，就算函式本身未帶入在此也可以取值，本文後方會有更詳細的介紹。
- this: 函式運行時帶入的變數，如何呼叫函式將會影響它的指向，之後會有獨立篇章進行介紹。
- localVariables: 區域變數，僅有在此函式內的作用域可進行呼叫。
- Global: 全域變數

上述五個變數中，前面兩者就屬於呼叫時傳入的變數，本篇也會著重在這兩點的特點進行介紹。

## 參數的特性
參數是由呼叫函式時所傳入的變數，相對於其它程式語言來說 JS 傳遞參數限制更少，任何的值都可以作為參數使用，也因為如此新手或從其它程式語言轉過來的會有許多不熟悉的地方，以下列出常見的問題：

### 參數的名稱於函式內定義

這段是在授課中常見的問題，剛接觸程式語言的新手常常會被參數的名稱搞混，**誤以為呼叫時的名稱就是函式內運作的名稱**，如以下範例來說請問值為？

1. `'a', 'b', 'c', undefined`
2. `'d', 'c', 'b', 'a'`

```js
function callMore(d, c, b, a) {
  console.log(d, c, b, a);
}
var a = 'a';
var b = 'b';
var c = 'c';
callMore(a, b, c);
```

正確來說，函式參數的名稱是在定義函式就已經確定了，如下圖：參數取值是依序帶入，並「**不會受到呼叫名稱的影響**」。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_6_%E4%B8%8A%E5%8D%889_16.png?alt=media&token=2f07b706-0d03-42e5-8180-7cda532dad0a)

簡單的結論：
- 參數名稱不會受到呼叫名稱影響
- 如果遇到有宣告但**沒有傳入**值則會是 `undefined`
- 如果未定義，但有**更多的傳入**則需要使用其它方式取值

#### ES6 的參數預設值

如果已經定義了參數，但卻沒有傳入則會以 `undefined` 呈現，遇到這樣的情況程式碼就必須加入許多的除錯機制，避免 `undefined` 造成了語法錯誤，使函式沒有辦法依預期的狀況執行。

ES6 中新增了「參數預設值」可預先給予特定參數預設值，除了避免 `undefined` 所造成的錯誤外，更可以增加函式運用的彈性。

以下範例透過簡單的語法就可加上「參數預設值」，當外部沒有傳入值時則會使用預設值；反之，如果有傳入值則使用外部的傳入的值。
```js
function getMoney(money = 1000) {
  console.log(`我有 ${ money }`); // 我有 1000
}
getMoney(); // 不需要傳入參數
```

### arguments

如果無法確認傳入的參數數量該怎麼辦呢？

這是專案開發比較少見的情況，但在製作框架、函式庫卻非常的常見，就如同前段所提「如果未定義，但有**更多的傳入**則需要使用其它方式取值」，會用到的就是本段所介紹的 `arguments` 參數（ES6 有更棒的方法）。

```js
function callMore(d, c, b, a) {
  // 注意：在此並沒有使用到定義的 d, c, b, a 參數
  console.log(arguments);
}
var a = 'a';
var b = 'b';
var c = 'c';
callMore(a, b, c);
```

任何的傳統函式都有 `arguments` 參數（注意：箭頭函式沒有此參數），不需要另外定義即可直接呼叫，且作用域僅限於本函式中。

`arguments` 結構上是屬於類陣列，其中會包含呼叫**所傳入的所有值**，在未確認傳入的參數數量時，是一個不錯的作法。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FD122FB8A-99CE-429C-B962-23D69981DC2F.png?alt=media&token=a343a045-d3fc-4e00-aea1-1985dc781be5)

#### ES6 的其餘參數

因為 `arguments` 有些許的缺點，如：
- 結構屬於類陣列，無法直接使用大部分的陣列方法
- 與已經定義的參數內容重疊，無法僅運用額外傳入的參數

因此在 ES6 後新增了「其餘參數」的語法，可在定義參數時**直接傳入剩餘未定的變數內容**，語法範例如下：

```js
const callMore = (a, ...args) => {
  console.log(args);
}
var a = 'a';
var b = 'b';
var c = 'c';
callMore(a, b, c);
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F21D87990-BBED-4C71-9DFC-5BC4F15CE3F9.png?alt=media&token=0d19fafb-4b58-4151-8519-8926d570637a)

結果類似以上範例，但會是純陣列的方式呈現，並且僅會取得未定義的參數內容（`a` 會被跳過）。另外，箭頭函式是可以使用其餘參數的。

### 函式也可作為參數

最後則是新手的夢魘，函式除了可以傳入純值、陣列、物件以外，還可以傳入「物件」作為參數，讓函式運作上更加豐富且...複雜（新手常常會不知道傳來傳去是傳到哪裡去）。

如以下範例來說，呼叫了 `functionB` 時，還可以傳入另一個函式作為參數，此手法我們則稱為 `callback function`。
```js
function functionB(fn) {
  fn('小明');
}
functionB(function(name) {
  console.log(name + ' 您好');
});
```
> 可以試著看看其中的參數是如何傳遞的

由於 JavaScript 是非常具有彈性的，因此可將「函式」作為參數作為參數傳遞，這樣的特性也稱為「一級函式」（First-class Function），在後續的文章也會更深入的介紹。