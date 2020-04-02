---
layout: post
title: JavaScript Promise 全介紹
category: development
tagline:
tags: [javascript, promise, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2Fimg-promise-Saint-Seiya.png?alt=media&token=6efc3208-ad24-41f7-a20d-bc8ddabaeef9
published: true
---

最近直播介紹如何串接開源資料，也剛好許多朋友詢問到 Ajax、Promise 相關的問題，因此重新撰寫一篇文來介紹 Promise，這篇文章也與過去形勢不太一樣，試著先將常見的問題放在前頭，接下來才開始介紹 Promise。

另外本文的內容較多，Promise 想看簡易版可參考：[/javascript/2017/12/29/javascript-proimse/](/javascript/2017/12/29/javascript-proimse/)。

{% raw %}
<iframe width="100%" height="315" src="https://www.youtube.com/embed/7CXnNMVMXeo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
{% endraw%}
> 使用 Vuejs 結合 Open Street Map 製作口罩地圖

## 關於 Promise 常見問題
Q: Promise 跟 Ajax 有什麼關係？

關於 Ajax 可以先參考這份：https://zh.wikipedia.org/wiki/AJAX

以目前來說，Ajax 可以向伺服器傳送及取得資料，並且不需要重新整理瀏覽器畫面，這樣可以大幅提升使用者體驗並且減少伺服器負擔（僅處理資料，畫面由前端處理）。

Ajax 是屬於一個透過 JavaScript 技術名稱，用於取得遠端資料；而 Promise 則是一個語法，專門用來處理非同步行為，並不是專門用來處理 Ajax 使用，所以兩者是不同的。

Q: Promise 與 Async、Await 有什麼關係？

Promise 是用來優化非同步的語法，而 Async、Await 可以**基於 Promise** 讓非同步的語法的結構類似於 “同步語言”，更易讀且好管理。

Async、Await 參考：https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Statements/async_function

Q: 請問 Promise 很常用到嗎？是否一定要學呢？

使用頻率高，必學。

## 非同步的問題
Promise 本身是用來改善 JavaScript 非同步的語法結構。

在過去的文章中有提到，JavaScript 是屬於同步的程式語言，因此[一次僅能做一件事情](https://wcc723.github.io/javascript/2017/12/07/javascript-event-queue/)，但遇到非同步的事件時，就會將非同步的事件移動到程式碼的最後方，等到所有的原始碼運行完以後才會執行非同步的事件。

以下列的程式碼來說，在 console 中依序的會出現的順序為：
1. `開始`
2. `程式碼結束`
3. `非同步事件` <- 最後執行

```js
console.log('開始');

setTimeout(() => {
  console.log('非同步事件');
}, 0);

console.log('程式碼結束');
```

雖然在上段的原始碼中，setTimeout 所定義的時間為 0，但因為是屬於非同步事件，因此還是會在其他原始碼運行完以後才執行。

在 Ajax 的行為中也是一樣，當需要**確保擷取到遠端資料才繼續往下執行時**，如果程式碼是依序撰寫的方式，就會無法正確呈現資料，以下範例我們使用 Promise base 的 Ajax 函式庫 axios 進行一下錯誤的示範：

與上述的概念是相同的，Ajax 本身也是屬於非同步的行為。在一開始先定義了一個 data 物件，中間段落使用 axios 嘗試取得遠端資料，後面的緊接的 `console.log(data);` 呈現的依然是一開始定義的物件，並不會是 Ajax 取得的資料。

```js
let data = {}

console.log('開始');

axios.get('https://randomuser.me/api/').then(function(response) {
  data = response;
});

console.log(data);
```

在上述的範例中，data 正確的賦值位置在以下片段，如果預期在取得資料後進行其它的行為，了解整個 Promise 的運作將非常的重要。
```js
then(function(response) {
  data = response;
})
```


## Promise 的結構及狀態
### 結構
Promise 本身是一個建構**函式**，函式也是屬於物件的一種，因此可以附加其它屬性方法在上，透過 console 的結果可以看到 Promise 可以直接使用 all、race、resolve、reject 的方法，寫法如下（後面再介紹運用方式）：
- Promise.all
- Promise.race
- Promise.resolve
- Promise.reject

![Promise 建構函式展開後的結構](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2F8EDE3272-824E-4C1B-AE12-0B4913740853.png?alt=media&token=3bff6e31-60b0-4683-a4d9-b09d4d1a00b0)

Promise 建構函式 **new 出的物件**，則可以使用其中的原型方法（在 `prototype` 內），其中就包含 `then`、`catch`、`finally`，這些方法則必須在新產生的物件下才能呼叫。

透過 `new Promise()` 的方式建立 `p` 物件，此時 p 就能使用 Promise 的原型方法：
```js
const p = new Promise();

p.then();    // Promise 回傳正確
p.catch();   // Promise 回傳失敗
p.finally(); // 非同步執行完畢（無論是否正確完成）
```

除此之外，Promise 建構函式建立同時，必須傳入一個函式作為參數（executor function），此函式的參數包含 resolve, reject，這兩個方法分別代表成功與失敗的回傳結果，特別注意這兩個僅能回傳其中之一，回傳後表示此 Promise 事件結束。
```js
new Promise(function(resolve, reject) { 
	resolve(); // 正確完成的回傳方法
	reject();  // 失敗的回傳方法
});
```

`resolve` 及 `reject` 的名稱可以自定義，但在開發上大多數開發者習慣維持此名稱。

### 狀態

Promise 的關鍵在處理非同步的事件，而非同步的過程中也包含著不同的進度狀態，在 Promise 的執行過程中，可以看到以下狀態。
- pending：事件已經運行中，尚未取得結果
- resolved：事件已經執行完畢且成功操作，回傳 `resolve` 的結果（該承諾已經被實現 fulfilled）
- rejected：事件已經執行完畢但操作失敗，回傳 `rejected` 的結果

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2Fimg-promise-pending.png?alt=media&token=f5a5607b-4436-44e6-ab1f-0d8dd4bf59b3)

> 進入 fulfilled 或 rejected 就算完成後不會再改變，Promise 中會使用 resolve 或 reject 回傳結果，並在調用時使用 then 或 catch 取得值。

如果要判斷 Promise 是否完成，可依據 Promise 事件中的 `resolve` 及 `reject` 是否有被調用，以下範例來說在沒有調用兩個方法時，Promise 的結果則會停留在 pending。
```js
function promise() {
  return new Promise((resolve, reject) => {});
}

console.dir(promise());
```
	
在 Promise 的執行函式中，可以看到以下兩個屬性：
* *[[PromiseStatus]]*: `"pending"` -> 表示目前的進度狀態
- *[[PromiseValue]]*: `undefined`  -> 表示 `resolve` 或 `reject` 回傳的值

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2FA14E1FA8-23ED-4317-B421-F0555976FE69.png?alt=media&token=a5199945-3cc6-4f06-8050-218ab1eeee91)

以下範例來說，執行完函式直接 `reject('失敗')`，最終也能取得 rejected 的狀態及值。
```js
function promise() {
  return new Promise((resolve, reject) => {reject('失敗');});
}

console.dir(promise());
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2FFC09AAC0-B91B-41FA-862C-0966731A2B18.png?alt=media&token=552d26ae-9e63-4d1b-8d07-4e9c3a05e53a)

## 建立自己的 Promise
如果要熟悉 Promise，最好的方式莫過於自己撰寫一次 Promise。

Promise 預設會帶入 resolve, reject 的參數（可自訂名稱，但大家習慣 resolve 及 reject），resolve 代表成功；reject 代表失敗，而兩者必定只能回傳其中之一，且必定只能回傳一次。

函式陳述式建立以後，直接透過 `return new Promise` 回傳並建立一個 Promise 物件，並且在內部加入一個執行函式且帶上 `resolve, reject` 的參數，到這個階段就是常見的 Promise 結構，接下來在依據執行的結果來透過 `resolve, reject` 回傳值即可（以下範例會隨機調用 resovle 及 reject）。
```js
function promise() {
  return new Promise((resolve, reject) => {
    // 隨機取得 0 or 1
    const num = Math.random() > 0.5 ? 1 : 0;

    // 1 則執行 resolve，否則執行 reject
    if (num) { 
      resolve('成功');
    }
    reject('失敗')
  });
}
```

在呼叫前 Promise 前回顧一下 Promise 會有三個狀態：
- Pending -> 尚未得到結果
- Resolved：事件已經執行完畢且成功操作，回傳 `resolve` 的結果
- Rejected：事件已經執行完畢但操作失敗，回傳 `rejected` 的結果

上列的三種狀態每次執行必定會經過 Pending，接下來進入 Fulfilled 或 Rejected 的其中之一，並且可以使用 `then()` 及 `catch()` 取得成功或失敗的結果。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2Fimg-promise-resovle_reject.png?alt=media&token=88067e09-92d4-4c67-9455-d13e4c5f22cc)

在 `.then(onFulfilled, onRejected)`中可帶入兩個回呼函式，兩者分別又可以帶入各自的參數：
- `onFulfilled`：執行成功的函式，所帶入參數表示 Promise 函式中 `resolve` 所帶入的值。
- `onRejected`：執行失敗的函式，帶入參數表示 Promise 函式中 `reject` 所帶入的值。

```js
// promise.then(onFulfilled, onRejected);
// 前者為 resolve callback，後者則為 reject
promise()
  .then((success) => {
    console.log(success);
  }, (fail) => {
    console.log(fail);
  })
```

在大部分情況下，開發者習慣僅使用 `.then()` 來取得成功的結果，失敗的部分交由 `catch(onRejected)` 來處理，這兩種寫法差異很小。

```js
// promise.then(onFulfilled);
// promise.catch(onRejected)
promise()
  .then(success => {
    console.log(success);
  })
	// 失敗的行為一律交給了 catch
  .catch(fail => {
    console.log(fail);
  });
```

### 鏈接

為了確保非同步完成後才執行另一個方法，過去都只能不斷的透過 callback 的方式來確保下一個方法正確執行，網路上如果搜尋 callback hell 也可以看到相關的文章及程式碼波動拳的圖片。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2FE555E697-1EA5-460A-86BF-C640B2E568CF.png?alt=media&token=06affb69-e3bb-4733-b783-537779c0a741)

Promise 另一個特點在於 `then`、`catch` 都可以使用鏈接的方式不斷的進行下一個任務，在此範例中我們修改 Promise 的結果，改成傳入 `0` 則會調用 `reject`，其它數值則會調用 `resolve`。 
```js
function promise(num) {
  return new Promise((resolve, reject) => {
    num ? resolve(`${num}, 成功`) : reject('失敗');
  });
}
```


接下來，當我們要進行確保 Promise 任務結束後在進行下一個任務時，就可以使用 `return` 的方式進入下一個 then，此 return 也有以下特點：
- 方法不限於 promise 函式，任何表達式（expression）都可進行回傳
- 如果是 promise 函式，則會繼續遵循 then 及 catch 的運作
- 如果不是  promise 函式，在下一個 then 則可以取得結果
```js
promise(1)
  .then(success => {
    console.log(success);
    return promise(2);
  })
  .then(success => {
    console.log(success);
    return promise(0); // 這個階段會進入 catch
  })
  .then(success => {   // 由於上一個階段結果是 reject，所以此段不執行
    console.log(success);
    return promise(3);
  })
  .catch(fail => {
    console.log(fail);
  })
```

### Then VS Catch 的失敗回呼差異

`then`、`catch` 都可以透過進行鏈接，上述也有提到 `then` 同時也能接收失敗的結果，在此用圖示表示兩者在執行上不同的結果。

不使用 `then` 接收失敗：無論在哪一個階段遇到 reject 時，接下來會直接跳到 `catch`，在其後的 `then` 都不會執行。另外提一下：`catch` 依然可以使用 `return` 繼續串接（實戰中很少這樣寫）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2F3484D2DC-3CF9-4292-B019-C7D76C448F13.png?alt=media&token=3e68ed68-cbc0-4be2-88ca-c24d31c5e07e)

使用 `then` 接收失敗：`then` 中的兩個函式必定執行其中一個（onFulfilled, onRejected），可以用此方式確保所有的鏈接都能夠被執行。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2FE4D3FA80-B070-4B23-9E3C-A58CE60C3C8C.png?alt=media&token=ba0ccc0b-13ba-4425-a878-eeaeddc30ed9)

### Finally 完成

最後方可以使用 finally 來確認工作結束，`finally` 不帶有任何參數。這個方法適合用來作為 Ajax 已經讀取完成，透過 `finally` 來關閉讀取的效果。

```js
promise(1)
  .then(success => {
    console.log(success);
  }).finally(() => {
    console.log('done');
  })
```


## 使用 Promise 改寫 XMLHttpRequest

Promise 很大一部份是用來處理 Ajax 行為，此段透過改寫的形式了解使用 Promise 及傳統的寫法有哪些差異。

傳統上，需透過 `XMLHttpRequest` 建構式來產生可進行遠端請求的物件，並且依序定義方法(`GET`)及狀態(`onload`)並送出請求(`send`)，取得結果後的其它行為則需要撰寫在 `onload` 內，程式碼結構如下：
```js
var url = 'https://jsonplaceholder.typicode.com/todos/1';

// 定義 Http request
var req = new XMLHttpRequest();

// 定義方法
req.open('GET', url);

// 當請求完成，則進行函式的結果
req.onload = function() {
  if (req.status == 200) {
    // 成功直接列出結果
    console.log(req.response);
  } else {
    // 失敗的部分
  }
};

// 送出請求
req.send();
```

接下來將以上的行為封裝至 `get` 函式內，此函式包含 Promise 及上述的 `XMLHttpRequest` 行為，運用時只要直接使用 `get(url)...`，接下來的運用方式則是符合 Promise 的結構，重複運用的情況下程式碼可以大幅提高易讀性。

```js
function get(url) {
  return new Promise((resolve, reject)=> {
    // 定義 Http request
    var req = new XMLHttpRequest();
    req.open('GET', url);
    req.onload = function() {
      if (req.status == 200) {
        // 使用 resolve 回傳成功的結果，也可以在此直接轉換成 JSON 格式
        resolve(JSON.parse(req.response));
      } else {
        // 使用 reject 自訂失敗的結果
        reject(new Error(req))
      }
    };
    req.send();
  });
}

// 往後的 HTTP 直接就能透過 get 函式取得
get('https://jsonplaceholder.typicode.com/todos/1')
  .then((res) => {
    console.log(res);
  })
  .catch((res) => {
    console.error(res)
  })
```


## Promise 方法
最後，介紹 Promise 中其它的方法，就 Promise 的物件下，展開後可以看到以下方法：

- Promise API
	- all -> 多個 Promise 行為同時執行，全部完成後統一回傳。
	- race -> 多個 Promise 同時執行，但僅回傳第一個完成的。
	- Promise.reject, Promise.resolve -> 定義 Fulfilled 或 Rejected 的 Promise 物件。

此段用下方定義的 promise 函式做說明，可以傳入兩個參數：
- num: 此 Promise 執行成功與否
- time: 此 Promise 所執行的時間長度
```js
function promise(num, time = 500) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      num ? resolve(`${num}, 成功`) : reject('失敗');
    }, time);
  });
}
```

### Promise.all

透過陣列的形式傳入多個 promise 函式，在全部執行完成後回傳**陣列結果**，陣列的結果順序與一開始傳入的一致。

```js
Promise.all([promise(1), promise(2), promise(3, 3000)])
  .then(res => {
    console.log(res);
  });
```

這個方法很適合用在多支 API 要一起執行，並確保全部完成後才進行其他工作時。

### Promise.race

透過陣列的形式傳入多個 promise 函式，在全部執行完成後回傳**單一結果**，結果為第一個運行完成的，以下範例來說就會回傳 `promise(1)` 的結果。

```js
Promise.race([promise(1), promise(2), promise(3, 3000)]).then(res => {
  console.log(res);
});
```

這個方法可以用在站點不穩定，同時發送多支同行為 API 確保可行性使用，但實作中使用率並不高。

### Promise.reject, Promise.resolve 

這兩個方法是直接定義 Promise 物件已經完成的狀態（resolve, reject），與 new Promise 一樣會產生一個新的 Promise 物件，但其結果是已經確定的，以下提供範例說明：

使用 `Promise.resolve` 產生一個新的 Promise 物件，此物件可以使用 then 取得 resolve 的結果。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2FF06BCD1A-091F-401C-98F5-EAA6AD629530.png?alt=media&token=284edbcc-4466-42bc-960d-ffd91c73bee0)

```js
var result = Promise.resolve('result');
result.then(res => {
  console.log('resolved', res); // 成功部分可以正確接收結果
}, res => {
  console.log('rejected', res); // 失敗部分不會取得結果
});
```

改為 `Promise.reject` 產生 Promise 物件，此物件必定呈現 rejected 的結果。
```js
var result = Promise.reject('result');
result.then(res => {
  console.log(res);
}, res => {
  console.log(res); // 只有此段會出現結果
});
// rejected result
```

注意：`Promise.reject`、`Promise.resolve` 是直接定義結果，無論傳入的是否為 Promise 物件。



參考文章：
- Google 開發者文件：https://developers.google.com/web/fundamentals/primers/promises
- MDN Promise：https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise