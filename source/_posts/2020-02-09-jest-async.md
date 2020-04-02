---
layout: post
title: 單元測試 - 非同步及 Ajax
category: development
tagline:
tags: [test, jest]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2Fimg-jest-async.png?alt=media&token=93d54d69-2808-4f8a-91df-c84dd2f9629a
published: true
---

本篇延續上一篇：[十分鐘上手前端單元測試 - 使用 Jest](/development/2020/02/02/jest-intro/)

JavaScript 是屬於同步，單執行緒的程式語言，因此當有非同步的事件時就會被往放到事件佇列，直到所有程式碼運行過後才會執行事件佇列內的程式，如果不熟悉這段觀念就會使程式的運行不符合預期，相關概念可以看此文章[一次只能做一件事情的 JavaScript](https://wcc723.github.io/javascript/2017/12/07/javascript-event-queue/)。

另外，現在的非同步大多都使用 Promise 來撰寫，包含 ES6 的 Fetch 及許多遠端請求的套件亦是使用 Promise 作為基礎。因此在撰寫 Jest 撰寫非同步測試時也會使用到相關的概念，至於 Promise 可參考 [使用 Promise 處理非同步](https://wcc723.github.io/javascript/2017/12/29/javascript-proimse/)

## 範例函式
這次的測試目標是使用 Ajax Get 取得遠端資料，並且確保遠端的資料是符合預期的。[JSONPlaceholder](https://jsonplaceholder.typicode.com/) 此服務可以供前端模擬 Ajax 行為，包含 GET、POST、PUT、DELETE 都可以練習，同時也可以使用 id 的方式取得固定的資料內容。

使用的遠端資料 API 路徑（最後一個數字則是 id，可確保取得固定資料）：
https://jsonplaceholder.typicode.com/todos/1

該路徑取得的格式及值如下，本次將會驗證 `title` 的值是否為 "delectus aut autem"：
```json
{
  userId: 1,
  id: 1,
  title: "delectus aut autem",
  completed: false
}
```

除此之外，我們還會使用 axios 此套件來取得遠端資料，這是一個基於 Promise 開發的 HTTP 請求工具，可運用於瀏覽器或 Node.js 上（[axios](https://github.com/axios/axios)），使用以下指令安裝 axios：
```
npm install axios
```

接下來在範例專案引入 axios，並且取得遠端資料。
```js
const axios = require('axios');

const fns = {
  fetchData: (num = 1) => {
    return axios
      .get(`https://jsonplaceholder.typicode.com/todos/${num}`)
      .then(res => res.data)
      .catch(err => 'error');
  }
}
```

如果透過 `console.log()` 檢視此段函式，可以發現他所回傳的是 Promise 函式，並非遠端的值。
```js
console.log(fns.fetchData())
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2F11509BFB-F255-4C09-8A79-F12EDB14D609.png?alt=media&token=0c0b0157-1e19-4e20-b5ff-ab25a86309e7)

如果要正確取得遠端值，則必需使用 `then` 這個方法。
```js
fn.fetchData(1).then(res => {
  console.log(res);
});
```



## 錯誤範例
JavaScript 特性是同步的，它會依序執行所有的程式碼，但遇到「非同步的事件」則會將事件移動到事件佇列內最後執行。因此，測試的預期結果如果是直接放到非同步的後方，則會無法正確取得資料。

以下範例來說：
1. `fn.fetchData(1)` 是屬於非同步事件，因此**會最後才執行**。
2. 因為 fn.fetchData(1)  是最後執行，所以 `expect(data.title)` 中的 data 是一開始定義的 `{}`
3. 所以結果必定為 `failed`（`fn.fetchData(1)` 不可能先執行完）。
```js
test('should 返回值必定為 "delectus aut autem"（沒有正確套用 Promise）', () => {
  // 非同步必定需要加上 return，才能正確驗證結果
  let data = {};
  
  fn.fetchData(1).then(res => {
    data = res;
  });

	// expect 無法正確取得值
  expect(data.title).toEqual('delectus aut autem');
});

```


## 非同步
Promise 是常見的非同步的方法，基於 Promise 上還可以使用 Async、Await，這兩種寫法在 Node.js 中都可以運行，因此也都可以導入 Jest 中撰寫。

### 使用 Promise

由於上述提到 `fn.fetchData` 會直接回傳 Promise 函式，Promise 執行完後回傳的值則必須使用 then 來取出，測試的期望及匹配也就必須寫在 then 之內，確保 Promise 已經執行完成。

所以只要將先前範例中的 `expect()` 移動到 `then` 內部基本上就能運作。
```js
// 非同步：Promise 寫法
test('should 返回值必定為 "delectus aut autem"', () => {
  // 斷言，確保非同步有正確取得資料
  expect.assertions(1);

  // 當有使用 assertions 則必需加上 return，才能正確驗證結果
  // The assertion for a promise must be returned.
  return fn.fetchData(1).then(data => {
    expect(data.title).toEqual('delectus aut autem');
  })
});
```

### 斷言

在前面的範例中，如果移除 `expect.assertions` 還是可以正確運作，而 `assertions` 的目的是確保有完整取得 Promise 資料，可以將程式碼改為如下將得到不同結果：
```js
// 此段範例中，Promise 直接進入 Catch 則會通過驗證
// 因為 catch 回傳的 'error' 與期望值一致
test('assertions 驗證', () => {
  return fn.fetchData(1).catch(e => expect(e).toMatch('error'));
});
```

如果要確保程式碼正確取得 Promise Resolve 的結果，就可以使用 `expect.assertions(num)`（num 表示斷言的數量）。

當補上 `expect.assertions(1)` 就必須使用 resolve 的結果才能通過驗證，`expect.assertions` 在 async 的寫法上也會更顯得重要。 
```js
test('assertions 驗證', () => {
  expect.assertions(1);

  return fn.fetchData(1).catch(e => expect(e).toMatch('error'));
});
```

### 使用 ES6 Async, Await

JavaScript 特性是同步的，它會依序執行所有的程式碼。但在 ES6 中，只要將函式轉為 Async 函式，就可以使用 `await` 來接受 Promise 回傳的結果，相對於 Promise 來說，await 不需要另外使用 then 或函式的巢狀結構，並且會**依序執行** Promise 的事件，也因為這個特性使非同步原始碼不需要寫得很 “巢”。

```js
test('should 回傳值必定為 "delectus aut autem"（async）', async () => {
  expect.assertions(1);

  // async 函式下，await 會確保取得遠端資料後才繼續往下運行
  const data = await fn.fetchData(1);
  expect(data.title).toEqual('delectus aut autem');
});
```

### 驗證特定屬性是否存在

除此之外，遠端資料相對於本地端是更不可預期的，因為蝴蝶效應的關係，後端改了程式碼可能沒有知會前端，導致前端程式碼發生不可預期的錯誤（但開發者可能找不到原因），測試中也可以導入特定欄位是否存在的驗證。

```js
test('驗證非同步 特定屬性是否已被定義', async () => {
  expect.assertions(1);

  const data = await fn.fetchData(1);
  expect(data.title1).toBeDefined();
});
```

參考資料：
參考：
- 官方文件：https://jestjs.io/en/
- 影片：https://www.youtube.com/watch?v=7r4xVDI2vho
