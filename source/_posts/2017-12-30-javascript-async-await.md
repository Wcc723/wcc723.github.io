---
layout: post
title: 鐵人賽：JavaScript Await 與 Async
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_27.jpg?alt=media&token=018210e4-496a-4b6a-b549-718c10988541
published: true
---

不知道上一篇大家對於 Promise 概念如何，本篇介紹的內容與 Promise 依然有相關性，因為這兩者就是建構於 Promise 之上的，如果直接從原始碼看可能不是很好瞭解這語法怎麼使用，不過可以先直接用 Google 翻譯了解大概意思：

- await: 等待
- async: 非同步

## Await 等待

Promise 中完成會透過 then 來回傳，在 await 中他則是會等待這段函式完成後在往下繼續執行，這是一個卡住的概念。

以下這段是上一個章節建立的 Promise，在這個非同步的方法下他並不會影響其他函式的運行。
> 小明開始跑後，並不會影響其它運行。

```js
let runPromise = (someone, timer, success = true) => {
  console.log(`${someone} 開始跑開始`);
  return new Promise((resolve, reject) => {
    // 傳入 resolve 與 reject，表示資料成功與失敗
    if (success) {
      setTimeout(function () {
        // 3 秒時間後，透過 resolve 來表示完成
        resolve(`${someone} 跑 ${timer / 1000} 秒時間(fulfilled)`);
      }, timer);
    } else {
      // 回傳失敗
      reject(`${someone} 跌倒失敗(rejected)`)
    }
  });
}

// 此段函式並不會影響其它函示的執行
runPromise('小明', 3000).then(someone => {
  console.log('小明', someone)
});
// 以下這段 console 會在 promise 結束前就執行
console.log('這裡執行了一段 console');
```

Await 顧名思義就是等待，在這個 Promise 結束前後面的程式碼都無法被執行。所以以下結果會出現：
- 立即執行：小明 開始跑開始
- 兩秒後：跑完了: 小明 跑 2 秒時間(fulfilled)
- 立即接續執行：漂亮阿姨 開始跑開始
- 2.5 秒後：跑完了: 漂亮阿姨 跑 2.5 秒時間(fulfilled)

```js
// 此段函示會中斷其它函式的運行
let mingRun = await runPromise('小明', 2000)
console.log('跑完了:', mingRun);
let auntieRun = await runPromise('漂亮阿姨', 2500);
console.log('跑完了:', auntieRun);
```

以上範例並不是像 Promise 中的 `race()` 或 `all()` 的全部一起執行的方式，而是一段執行後才執行下一段。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_27.jpg?alt=media&token=018210e4-496a-4b6a-b549-718c10988541)

> 在 await 特性下，會等 promise 任務完成後才會讓程式繼續往下執行，所以小明沒有跑完以前，漂亮阿姨都會在原地等待。

### 同時進行

雖然 `await` 是逐一執行的概念，不過它也是能夠與 `Promise.all()` 同時使用。

```js
let allRun = await Promise.all([runPromise('小明', 3000), runPromise('漂亮阿姨', 2500)]);
console.log(allRun);
// ["小明 跑 3 秒時間(fulfilled)", "漂亮阿姨 跑 2.5 秒時間(fulfilled)"]
```

### 錯誤

出錯了會怎樣？

> 小明如果跌倒，漂亮阿姨會無法得知他完成，於是在原地苦苦的等待。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_27_1.jpg?alt=media&token=c29abc73-2520-4aac-a49f-8892534675fb)

```js
let mingRun = await runPromise('小明', 2000, false);
// 小明 開始跑開始
// 小明 跌倒失敗(rejected)
// 以下錯誤不執行
console.log('跑完了:', mingRun);
```

喔嗚，如果遇到錯誤就會造成停止讓後方程式碼不執行，這樣的話 await 還挺危險的 :(。但其實我們可以從許多文件發現 `await/async` 都是同時使用的，await 的錯誤會讓 async 拋出錯誤，而不會造成終止。

## Async

在解決上述問題之前，我們先來了解一下 `async`，它的結構非常類似 Promise，只不過他能夠將 await 包在裡面，被包在裡面的 await 就如同先前的結構一樣，他會依序地執行。

`async` 本身也是類似 Promise，在正確執行的情況下 return 會傳回 resolved 的狀態，也可以使用 then 來接收正確的資料。

```js
const asyncRun = async () => {
  let mingRun = await runPromise('小明', 2000);
  let auntieRun = await runPromise('漂亮阿姨', 2500);
  return `${mingRun}, ${auntieRun}`
}
asyncRun().then(string => {
  console.log(string)
}).catch(response => {
  console.log(string)
})
```

### 錯誤

當 `async` 被呼叫時他會回傳一個 `Promise`，如果正確的運行這個 Promise 會回傳一個 `resolved` (正確的運行)，**如果函式無法正確地完成，則會拋出錯誤的 `rejected`**。

```js
const asyncRunFail = async () => {
  let mingRun = await runPromise('小明', 2000, false);
  let auntieRun = await runPromise('漂亮阿姨', 2500);
  return `${mingRun}, ${auntieRun}`
}
asyncRunFail().then(string => {
  console.log(string);
}).catch(response => {
  console.log(response);
  // 小明 跌倒失敗(rejected)
})
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_27_2.jpg?alt=media&token=8187d38d-ad27-42e4-a31a-4a2a32d984cf)

這段錯誤就如同我們在使用 Promise 一樣，可以使用 `catch()` 得知小明跌倒了，且並不會影響到其他函式的運行，在這樣包裝下我們可以在 async 函式內做更多的 Promise 變化，並且程式碼更為精簡且容易閱讀。

