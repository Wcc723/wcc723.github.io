---
layout: post
title: Async function / Await 深度介紹
category: development
tagline:
tags: [js, async, await]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fawait.jpg?alt=media&token=a8539023-9aff-4118-b80f-7344f2d02548
published: true
---

非同步在前端的做法不斷的在進行優化調整，先前介紹過 [Promise](https://wcc723.github.io/development/2020/02/16/all-new-promise/) 可以解決非同步過度巢狀的問題，而本篇要介紹的 `async function`（非同步函式） 及 `await` 則可以將非同步的程式碼寫成類似同步的形式。 

## Promise 與 async, await
Promise 本篇不會詳細介紹，如果不熟悉可以先查看 [本篇](https://wcc723.github.io/development/2020/02/16/all-new-promise/) 文章，Promise 與非同步函式兩者是密不可分的，雖然 `async function` 易讀性優於 Promise，但請先確保對於 Promise 有一定理解再來使用非同步函式。

本篇先建立一個基於 Promise 的函式，以下的範例都會不斷呼叫此函式來進行撰寫。
```js
/**
 * 範例 Promise 函式
 * 
 * @param {Number} num 數值：作為判斷非同步成功與否的條件
 * @param {Number} [time=500] 數值：非同步所執行的時間長度
 * @returns 如果 num 為真則套用 resolve；失敗則套用 reject
 */
function promiseFn(num, time = 500) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      num ? resolve(`${num}, 成功`) : reject('失敗');
    }, time);
  });
}
```

`promise` 函式呼叫時可以使用 `then` 來接收 `resolve` 的結果，當要串接兩個 `promise` 函式時可以使用 `return` 來做 "鏈接"。 

```js
promiseFn(1)
  .then(res => {
    console.log(res); // 1, 成功
    return promiseFn(2); // 鏈接第二次的 Promise 方法
  })
  .then(res => {
    console.log(res); // 2, 成功
  });
```

基於 Promise 的方法相當單純，就是不斷的呼叫 Promise 函式以及使用 `then` 來進行鏈接，`Promise` 可以解決過巢及串接 `callback function` 語法不一致等問題，但它依然在 JS 的同步語言中插入了一段非同步的片段。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FEB9377A4-D477-4459-9CCE-9D095C1D1AB1.png?alt=media&token=470f44b6-c274-4572-bc2d-d0948ccc92b9)

### Async function 及 Await 

`async function` 可以用來定義一個非同步函式，讓這個函式本體是屬於非同步，但其內部以“**同步的方式運行非同步**”程式碼。

`await` 則是可以暫停非同步函式的運行（中止 `Promise` 的運行），直到非同步進入 `resolve` 或 `reject`，當接收完回傳值後繼續非同步函式的運行。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2Fimg-promise-pending.png?alt=media&token=f5a5607b-4436-44e6-ab1f-0d8dd4bf59b3)
> Promise 的回傳狀態，需要進入 `resolve` 或 `reject` 後，非同步函式才會繼續運行

上述以 `promise`、`then` 寫法的程式碼，以 `async` 函式改寫方式如下：
1. 定義非同步函式（`async function`）
2. 透過 `await` 暫停 `promiseFn`，直到回傳後再繼續向下

```js
async function getData() {
  const data1 = await promiseFn(1); // 因為 await，promise 函式被中止直到回傳
  const data2 = await promiseFn(2);
  console.log(data1, data2); // 1, 成功 2, 成功
}
getData();
```

以上這段程式碼的結果與使用 `then` 是一致的，但就結構上更加平整，在 `getData` 這個函式中都是以 "**同步**" 的方式運行，不會產生同步、非同步程式碼混合的狀況。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F3D5EF627-D878-49BD-A076-09B2471BFD9A.png?alt=media&token=a8a75d3b-ea33-4ac3-ac9b-308a4d944258)
> 無論是不是 Promise，大家都是同步程式碼逐行執行。

## Async / Await 語法解析
Async / Await 目的是讓程式碼的結構變得更加簡潔、易懂，所以運用上也如上述一樣單純（如果沒有 “錯誤”，它確實很單純），本段則額外補充說明這兩者新加入的語法是如何在 JS 中運作的。

#### `async function` 非同步函式

`async function` 的用法相當特別，用此語法所宣告的函式，可在其內以“**同步的方式運行非同步**”程式碼；但就名稱上 `async` 是稱為非同步，那麼它的 `非同步` 又存在哪呢？

```js
async function asyncFn() {
  return 'a';
}
console.log(asyncFn());
```

`非同步` 稱的就是 `async function` 所定義的函式本體，當使用 `console.log` 查看 `async function` 那麼將可以得到與 **Promise 結構相似的函式**，該函式是以非同步的方式運行，無法直接使用 `console.log` 取得其值。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FDB02D90A-660C-4EF6-A65E-2E150CBACEE5.png?alt=media&token=b563a7f4-5a05-470d-82ea-6d69eff4279f)

在 Promise 中，如果要取得 `resolve` 的結果會使用 `then`，而 `async function` 也是相同使用 `then()`。

```js
asyncFn().then(r => {
  console.log(r)
});
```

> 雖說如此，實戰中不太會這麼做，回到目的性來說：「`async function` 是讓函式內的語法同步執行」。也因為 `async function` 與一般函式定義的不同，所以請避免將所有的 `function` 前方都補上 `async`，這會產生運行及概念上不同的函式。

#### Await 運算子

`await` 是屬於一元運算子，它會直接回傳後方表達式的值；但如果是 **Promise 時則會 “等待” resovle 的結果並回傳**。

雖然是運算子，但是在原始碼中直接運行 `await` 則會出現錯誤，它只能在 `async function` 中運行，所以  `async/await` 基本上是一體的，不會單獨出現。
```js
await 1;
// Uncaught SyntaxError: await is only valid in async function
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FC7D8B9EC-6C5E-4E88-B459-649F11018B74.png?alt=media&token=d027262a-0008-4b45-b9bb-5d8339bb2255)
> 比較神奇的是 `await expression` 卻可以直接在 Chrome console 中運行。

`await` 可以直接回傳後方的表達式，或者將非同步函式中的 Promise 暫停，如以下範例的 `await promiseFn(2)` 會 **“等待”** `resolve` 結果回傳後，在賦予至 `data2` 才會回傳。 
```js
async function getData() {
  const data1 = await 1;
  const data2 = await promiseFn(2);
  console.log(data1, data2); // 1 "2, 成功"
}
getData();
```

## 使用 try...catch 進行錯誤的處理

前面幾段都僅有提到 `resolve` 的結果，但實際上程式碼的運行不會都只有成功，在 Promise 定義也就包含了 `resolve` 及 `reject` 的回傳，而調用 Promise 的方法時也就可以使用 `then` 及 `catch` 來接收成功及失敗的結果。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2Fimg-promise-resovle_reject.png?alt=media&token=88067e09-92d4-4c67-9455-d13e4c5f22cc)

`then`、`catch` 範例程式碼，如果運行正確則會繼續往下運行，當遭遇失敗則會跳到 catch 的流程。
```js
promiseFn(1)
  .then(res => {
    console.log(res);
    return promiseFn(0);
  })
  .then(res => {
    console.log(res)
  })
  .catch(err => {
    console.log(err)
  });
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FEAE3E326-8008-421B-BB94-9B36DE206EAF.png?alt=media&token=f449a84c-1919-4de9-86a9-045a768bb48d)
> 相對來說 Promise 的成功、失敗流程的混合撰寫，容易在維護上難以除錯。

**重要：**當使用 `async/await` 時，因為該片段程式碼已轉為同步的形式，如果遇到錯誤沒有進行例外處理，則會造成後續的程式碼無法繼續運行。

```js
async function getData2() {
  const data1 = await promiseFn(1);
  const data2 = await promiseFn(0);
  // Uncaught (in promise) 失敗
  console.log(data1, data2);
}
getData2();
```
> 此段程式碼會直接中止，不會出現 `console.log` 的結果。

`async/await` 錯誤流程可以使用 `try...catch` 陳述式管理流程，將原有的程式碼直接置入於 `try` 流程內，當遇到例外的錯誤時則撰寫在 `catch` 區塊內。

以下範例來說 `try` 內的程式碼與原本介紹的一般流程是相同的，僅不過加入了 `catch` 來處理 `reject` 的錯誤流程。這樣的結構下，就可以將程式碼區分為成功、錯誤兩個流程，閱讀上也會更加容易。
```js
async function getData2() {
  try { // 專注在成功
    const data1 = await promiseFn(1);
    const data2 = await promiseFn(0);
    console.log(data1, data2);
  }
  catch (err) { // 專注在錯誤
    console.log('catch', err);
  }
}
getData2();
```

圖解概念：正常流程與錯誤流程分離，且一般流程中還可維持同步執行的特色，避免巢狀的程式碼。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FD43D3597-5DAC-4F8F-BD32-18F6C4E2F7D6.png?alt=media&token=843ce9a4-580b-4b3a-9f5d-7dba9ff39aa6)

## 執行順序的技巧
Promise 是透過鏈接及 Promise 的方法（Promise.all, Promise.race）來達到不同的執行順序方法。`async/await` 則讓非同步有了同步的寫法，因此許多原有的 JS 語法都可以一起搭配做使用，如迴圈、判斷式都是可利用的技巧，在了解這段以前，需要先知道非同步主要有兩個時間點：

1. 送出 “請求” 的時間
2. 取得 “回應” 的時間

依據這段概念，又可以區分成：
- 請求依序發出：一個一個往下執行
- 請求平行發出：全部的請求一起發出
- 回應依序列出：依據請求發出的順序，依序列出資源
- 回應統一列出：不管什麼時候取得都統一列出

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F5890C266-A6E5-47AF-9A9C-05D3D829BD4B.png?alt=media&token=89e34972-25eb-4624-8120-09f3f6b7ecaa)
> 請求依序發出時：下一個請求必須等待前一個取得回應後才能繼續動作

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F71FA7BB4-7A1C-484B-B15F-0FEB3EAA05FE.png?alt=media&token=01687f8a-6efc-4949-b91e-6c70727990dd)
> 請求為平行發出時：無論先後順序都將同時發出請求。

### Promise.all 平行執行，統一列出回應資訊

`Promise.all()` 是 Promise 物件下的方法，此方法可傳入一個陣列，陣列包含多個 promise，`Promise.all()`可以統一發出所有陣列內的請求，並取得所有回應時統一回傳，`async/await` 可搭配此語法得到一次性的所有回應。
```js
async function promiseAll() {
  const data = await Promise.all([promiseFn(1, 3000), promiseFn(2)]);
  console.log(data)
}
promiseAll(); // ["1, 成功", "2, 成功"]
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F05A2971C-1B03-42A1-8418-55857DE8224B.png?alt=media&token=157839c4-992c-491a-88d5-a19b8047beb6)
> 取得結果與送出的陣列順序相同。

### 依序發出請求的方式

`for...loop` 是可以被中斷的迴圈形式（使用 `break` 中斷），所以其實可以理解他是屬於依序執行的陳述式，當 `for` 內包含 `await` 時就必須等待 `await` 取得回應後才能執行下一個迴圈。

本範例中先建立一個陣列 `arrayData`，其中包含數值及執行時間。
```js
const arrayData = [{num: 1, time: 500},
  {num: 2, time: 3000},
  {num: 3, time: 1500},
  {num: 4, time: 1000}
];
```

透過 `for...loop` 的迴圈形式依序執行 `promiseFn` 並帶入陣列內的資訊，待前一個執行完畢後才會進入下一個迴圈，待陣列內容執行完畢後則會列出所有的回應結果。
```js
async function seriesFn() {
  const data = [];

  // 依序執行
  for (let i = 0; i < arrayData.length; i++) {
    const item = arrayData[i];
    data.push(await promiseFn(item.num, item.time));
    console.log(item.num, '執行完畢')
  }
  console.log(data); // ["1, 成功", "2, 成功", "3, 成功", "4, 成功"]
}
seriesFn();
```

{% raw %}
<video width="100%" muted autoplay controls>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FOct-06-2020%2015-11-29.mp4?alt=media&token=b1d6125e-adbc-4f99-9eca-cebdbb30f7bd" type="video/mp4">
</video>
{% endraw %}

> 執行順序影片

### 平行執行、依序列出

相對於 `for...loop` 來說 `forEach` 無法被中斷，並且會幾乎同時運行所有的迴圈內容。

本範例是使用 `map` 取代 `forEach` 的方法（兩者概念是接近的）。雖然請求幾乎在同一個時間執行，但執行的時間順序是不確定的，還是會等待執行完成後才統一列出。
```js
async function parallelFn() {
  const data = arrayData.map(async item => {
    const res = await promiseFn(item.num, item.time); // 此行的 await 不會暫停函式運行
    return res;
  })
  console.log(data);

  for (const res of data) {
    console.log(await res);
  }
}
parallelFn();
```
`map` 會在執行時就取得結果，此時 `data` 內的 promise 是尚未 `resolve` 的狀態，因此需要在後續使用 `for...of` 等待回應的內容。

{% raw %}
<video width="100%" muted autoplay controls>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FOct-06-2020%2015-48-26.mp4?alt=media&token=792294e5-5f8e-4363-912d-5560964d505e" type="video/mp4">
</video>
{% endraw %}
> 時間順序上分別為 500, 3000, 1500, 1000，其中第二個所花的時間較長，因此在第二個執行完成後，剩下以後也會統一列出。

## async/await 搭配 fetch

`fetch` 也是基於 Promise 的 Web API，因此它也同樣能夠使用 `async/await` 來進行改寫，`fetch` 與一般 AJAX 套件比較不同之處是在 JSON 回傳後，必須在使用 `json()` 的方法將資料輸出成 JSON 格式（相關介紹可以參考：[MDN Fetch](https://developer.mozilla.org/zh-TW/docs/Web/API/Fetch_API/Using_Fetch)）。

當使用 Promise `then` 時，則會使用 return 來呼叫 json() 方法（箭頭函式縮寫，所以省略了 `return`），

```js
fetch('https://jsonplaceholder.typicode.com/todos/1')
  // 取得遠端資源，並透過 return 方式回傳鏈接
  .then(response => response.json())
  // 接收 `response.json()` 轉換的結果
  .then(json => console.log(json));
```

透過 `async` 改寫範例如下，結構上更為平整易於閱讀。
```js
(async ()=> {
  // 取得遠端資源
  const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  // 使用 response.json() 將資源轉為 JSON 格式
  const json = await res.json();
  console.log(json);
})();
```

參考資源：

- Google 開發者文件：https://developers.google.com/web/fundamentals/primers/async-functions
- MDN Async/Await：https://developer.mozilla.org/zh-CN/docs/learn/JavaScript/%E5%BC%82%E6%AD%A5/Async_await
