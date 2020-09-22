---
layout: post
title: JavaScript 開發中常見錯誤解決辦法
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_01.jpg?alt=media&token=3f3582ae-2f2f-44e2-8f8f-d1ca33a3a698
published: true
---

身為一個開發者，當然都會了解經驗越多，除錯上會更為容易，這種事情你我都清楚。但對於一個新手來就是缺少錯誤上的經驗，所以當遇到紅字時會不知如何著手。

這一系列的文章是專門給剛入門新手的前端開發者觀看的，盡可能用白話的方式，並且提供簡單的範例程式碼以供驗證。

## Chrome 開發者工具的常見錯誤排解
Chrome 開發者工具的 Console 相當好用，最常使用的不外乎是透過`console.log` 呈現出變數或運算的結果，如果符合預期則皆大歡喜。

但最討厭的則是出現紅色文字，看似**帶有威脅的語氣說「你出錯了！」**，對於新手來說不僅是一種挫折，紅字上的錯誤也不知如何著手排除的情況下，也只能反覆地檢視自己原始碼，看看是不是有奇怪的地方，但就算停在了錯誤地方也往往不知是什麼意思，也會因此花上許多時間在除錯上。

本篇就來介紹 Chrome 開發者工具的常見錯誤回饋及排除技巧，讓你下次不再需要為了滿滿的紅字感到挫折，更能從中學習如何快速搜尋錯誤程式碼。

> 注意：JavaScript 是屬於同步的程式語言，如果出現錯誤就會造成下方的程式碼導致無法運行，當**紅字沒有解決，都可能造成接下來的程式碼運行錯誤或是無法繼續運行**。


## 錯誤類型：SyntaxError

`SyntaxError` 這類型錯誤通常是**語法結構**錯誤，遇到這類型錯誤建議透過 “文字編輯器”除錯，以 VSCode 來說會直接跳出這類型的錯誤提示。

如下圖，VSCode 以紅字提示 family 物件有錯誤，當出現錯誤時會建議不要只檢查當行，錯誤可能會存在於前後文之中（有可能跨多行的錯誤），此範例中仔細檢查可以發現 '小明' 後方缺少了一個逗點。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FC710C627-CEF7-4DDC-84FE-EA9125EC9A9F.png?alt=media&token=d3066ce1-5977-4ae1-b0b0-eebf18989805)

> 除錯重點：使用主流的文字編輯器，如 "VSCode" 進行除錯

### Uncaught SyntaxError: Unexpected identifier

```js
var person = {
  name: '小明'
  family: {
    name: '小明家'
  }
}
```
![Uncaught SyntaxError: Unexpected identifier](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_16_%E4%B8%8A%E5%8D%8810_34.png?alt=media&token=a0ed1451-80c8-47d8-befe-dedc6a594636)

語法解析錯誤，因為在物件結構中缺少一個逗點，除了透過 VSCode 查看外，也可以直接透過 Chrome Console 連結至 Source 頁面查看錯誤行數，並請檢查此行的前後文是否有語法結構上的錯誤。


![點擊連結就可到該錯誤位置](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F912950B6-4757-4F09-BDD8-21E9DDBD3D6E.png?alt=media&token=7ab22f94-fd04-4589-b42c-0fb17d922a4b)



### Uncaught SyntaxError: Unexpected end of input

```js
function fn() {
  console.log('這是一段函式');
console.log(fn);
```

語法解析錯誤：未預期的結束，此範例中缺少結尾的 `}`，會建議在撰寫程式碼時盡可能維持正確的縮排，將程式排整齊後比較容易正確找到錯誤。

![Uncaught SyntaxError: Unexpected identifier](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_16_%E4%B8%8A%E5%8D%8810_36.png?alt=media&token=9a690dbd-af76-4dd8-b5e3-277b40111727)



### Uncaught SyntaxError: Unexpected token '}'

```
if (name)
  console.log('立即函式')
};
```

![Uncaught SyntaxError: Unexpected token '}'](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_16_%E4%B8%8A%E5%8D%8810_38.png?alt=media&token=1a4a6b05-fcae-4e40-897a-59dd55cf9ae2)

語法解析錯誤：未預期的符號 `}`，程式碼多了 `}` 結尾符號導致環境運行錯誤，此錯誤排除與上述相同，盡可能將程式碼排整齊且維持首尾符號的一致。

除此之外再推薦一個 VSCode 工具，為你的首尾標籤加上對應的色彩：https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer

範例：程式碼中的 `{}` 都會以一對的色彩呈現。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F4EDE3D9B-8111-4BB2-9794-63A72D6352B1.png?alt=media&token=b7af7db6-5bf6-4d18-b90a-bb266db94d48)

### Uncaught SyntaxError: Identifier 'a' has already been declared

```js
let a;
let a;
```

![Uncaught SyntaxError: Identifier 'a' has already been declared](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_16_%E4%B8%8A%E5%8D%8810_39.png?alt=media&token=a53cf16e-a7b9-4a18-bd64-15dd09b6e73f)

語法解析錯誤：識別符號（在此指的是變數）已經被宣告，請避免重複宣告同一個變數，ES6 中都禁止 let、const 重複宣告，直接排除即可。

## 錯誤類型：ReferenceError

`ReferenceError` 此類型錯誤通常是指「參考」找不到，當出現這類型錯誤時文字編輯器 “不一定” 出現錯誤（有裝 Linter 才會提示），所以時常會在執行階段才會看到這類型錯誤。

> 除錯重點：
> - 透過 Chrome 的提示修正
> - 在 JavaScript 撰寫環境中[安裝 ESLint](https://wcc723.github.io/javascript/2018/01/01/javascript-eslint/)

### ReferenceError: a is not defined

```
ReferenceError: a is not defined
```
![ReferenceError: a is not defined](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_16_%E4%B8%8A%E5%8D%8810_40.png?alt=media&token=9ca239f8-7700-438b-9697-87fbd26fbbf1)

語法參考錯誤：由於 a 變數未定義，所以在取用該變數時會出現未定義的提示，只要預先定義此變數即可。

不過還有另一種很常見的情況，當引用外部套件時出現「套件名稱 + `is not defined`」，這類型情況通常是外部資源沒有正確載入，請確保該資源有加入到此網站中。

以下範例來說，就是屬於 jQuery 沒有正確導入。
```
Uncaught ReferenceError: $ is not defined
```

## 錯誤類型：TypeError

`TypeError` 則是型別上的錯誤，文字編輯器一樣不會預先提示有錯，必須在執行環境時才會看到，這類型的錯誤通常是以下幾種：

- 在 undefined、null 嘗試取得其屬性（ex: undefined 中取得屬性值）
- 嘗試呼叫非函式變數或表達式（ex: `'text'()`）

> 除錯重點：在取得變數前方確認該變數當前的資料型別及結構

### Uncaught TypeError: Cannot read property 'a' of undefined

```js
var a;
console.log(a.a);
```
![Uncaught TypeError: Cannot read property 'a' of undefined](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_16_%E4%B8%8A%E5%8D%8810_42.png?alt=media&token=e4b19f41-82b5-4840-bdd1-040f357feb5c)

說明：該變數的值下無法找到特定的屬性，undefined、null 的值內無法在查找到其它的屬性，如果無法確認該變數是否為 `undefined`，可改寫其程式碼如下： 

```js
if (typeof a !== 'undefined') {
  console.log(a.a);
}
```

### Uncaught TypeError: console.log(...) is not a function

```js
console.log('a')
(function() {
  console.log('立即函式')
})()
```

![Uncaught TypeError: console.log(...) is not a function](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_16_%E4%B8%8A%E5%8D%8810_43.png?alt=media&token=86695046-7354-4c6c-bc54-d86397573b91)

說明：這段程式碼中看起來會是立即函式的錯誤，但卻出現了 `console.log(...) is not a function`。此錯誤主要是因為缺少了分號，因此將兩段程式碼合併為一行執行，運行的結果如下：

```
console.log('a')(function() { ... })()
```

當遇到此類型錯誤只要在兩者之間補上分號即可正常運作。

```js
console.log('a');
(function() {
  console.log('立即函式')
})()
```

## 錯誤類型 RangeError

這是建立了超過長度的陣列或過度的執行函式（產生過多執行堆疊）所造成的錯誤，這類型則需要重新檢視程式碼的邏輯，是否會造成過度的硬體資源消耗（記憶體或運算資源）。

> 除錯重點：需重新檢視邏輯，如果必要可先刪除部分程式碼，先找出錯誤的片段後再進行除錯。

### Uncaught RangeError: Maximum call stack size exceeded

```js
(function a() {
  a();
})();
```
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_9_16_%E4%B8%8A%E5%8D%8810_46.png?alt=media&token=e5ea5575-bbf9-40ba-85af-3edf6eb933e2)

說明：函式呼叫時會產生一個執行堆疊，如果堆疊的過程中超過最大數量則會產生錯誤（函式內呼叫自己）。

此類錯誤也很常見，但卻不容易找到為何出錯，主要原因是執行堆疊超過環境的限制（運用框架中也很常見），如果遇到此錯誤建議改寫目前呼叫函式的方式。

## 結語

當 Chrome Console 出現錯誤時請維持正確的心態，新手常常會看到錯誤而緊張不知所措（畢竟從小紅被用紅字提醒就會感到緊張，深怕這個錯誤自己無法解決而影響到其他人）。

錯誤在撰寫程式碼中常見的過程，資深開發者與新手的差異是**面對錯誤的經驗**，同一個錯誤前幾次不清楚沒關係，都是經驗的累積，只要往後再次遇到相同的錯誤自然而然就能輕鬆面對。
