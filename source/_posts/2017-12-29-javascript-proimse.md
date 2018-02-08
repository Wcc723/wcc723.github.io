---
layout: post
title: 鐵人賽：使用 Promise 處理非同步
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_26.jpg?alt=media&token=581d4746-f732-4aa6-a218-da1519d039dc
published: true
---

JavaScript 中有很多非同步的事件，而這些事件我們很常使用 callback，在一層包一層後就會出現知名的 callback 地獄，而 Promise 就是為了解決此問題而生的，因此每次介紹到 Promise 都會先下以下這張圖鎮鎮樓。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2FE555E697-1EA5-460A-86BF-C640B2E568CF.png?alt=media&token=ab652109-4e45-4862-9ab3-b424922db2c8)

上一篇所介紹到的 `Fetch()` 就是使用 Promise，資料接收後才會繼續跑 `then()` 的內容。而 `fetch()` 是已經包裝好的 Promise，本篇介紹如何自己運用 Promise 以及自行建立 Promise 實體。

## Promise 的狀態與流程

Promise 中主要有以下幾個狀態，從一進入 Promise 就進入 `pending` (等待事件完成)，接下來會依據事件的成功與否回傳成功或拒絕理由，通常我們會使用 `resolve`、`reject` 兩個變數來傳送成功與失敗的訊息。

- pending: 等待中的初始狀態
- fulfilled: 正確完成
- rejected: 已拒絕，操作失敗

以下圖來說，我們可以假想跑步的過程就是 pending 的狀態，如果成功到達目的地就是成功，也就是上方那條綠色線 (fulfilled)；過程中如果失敗也會說明失敗理由(rejected: 跌倒、累了、想找媽媽...)。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_26.jpg?alt=media&token=581d4746-f732-4aa6-a218-da1519d039dc)

回到程式碼架構如下，我們會建立 Promise 的事件，等待需要調用的時候呼叫它，而這類型的事件也有可能失敗或成功，因此會透過 resolve 及 reject 來帶入成功與否的訊息；與此相對應的會有 `then()` 及 `catch()`來接收。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_26_2.jpg?alt=media&token=eda1364e-545a-4867-a7ca-4338065ee221)


## 製作自己的 Promise 

> 很久沒出現的小明，今天與 `杰倫`、`漂亮阿姨` 相約一起來跑步，小明笨手笨腳常常在跑步過程中跌倒，不過如果路途順利他應該會在三秒內跑完。

在以下函式就建立了小明跑步的 Promise，如果他成功跑完就會回傳他跑了多久，失敗則會回傳他跌倒。

```js
let mingRunPromise = (someone) => {
  let ran = parseInt(Math.random() * 2); // 隨機成功或失敗
  console.log(`${someone} 開始跑開始`);
  return new Promise((resolve, reject) => {
    // 傳入 resolve 與 reject，表示資料成功與失敗
    if (ran) {
      setTimeout(function(){
        // 3 秒時間後，透過 resolve 來表示完成
        resolve(`${someone} 跑 3 秒時間(fulfilled)`);
      }, 3000);
    } else {
      // 回傳失敗
      reject(new Error(`${someone} 跌倒失敗(rejected)`))
    }
  });
}

mingRunPromise('小明').then((data)=> {
  // 成功訊息 (需要 3 秒)
  console.log(data);
}).catch((err)=> {
  // 失敗訊息 (立即)
  console.log(err)
});
```

### Race 與 All

> 接下來小明與漂亮阿姨一起跑，在這次的比賽中只會回傳第一個到達終點的人，而另一個成功與否倒不是很重要(哭哭)。

首先先建立一個可以多人一起跑的事件，可以傳入`人`、`時間`、`是否成功` 等參數。

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
      reject(new Error(`${someone} 跌倒失敗(rejected)`))
    }
  });
}
```

可以使用 Promise.race 傳入多個 promise 事件，這個方法僅會回傳第一個完成的事件。

```js
// Race
Promise.race([runPromise('小明', 3000), runPromise('漂亮阿姨', 2500)]).then((data) => {
  // 僅會回傳一個最快完成的 resolve 或 reject
  console.log('race', data); // 漂亮阿姨 跑 2.5 秒時間(fulfilled) <- 因為漂亮阿姨跑得快
}).catch(err => {
  // 失敗訊息 (立即)
  console.log(err)
});
```

> 當然，每次都跑輸的小明不希望每次都沒被記錄到，他希望就算最後一名也能一起紀錄

`Promise.all()` 會 `同時執行` 以下 Promise，在全部完成後統一回傳陣列，這個陣列的內容也是 promise 中 resolve 的內容。

```js
// All
Promise.all([runPromise('小明', 3000), runPromise('漂亮阿姨', 2500)]).then((data) => {
  // 僅會回傳一個最快完成的 resolve 或 reject
  console.log('race', data); // ["小明 跑 3 秒時間(fulfilled)", "漂亮阿姨 跑 2.5 秒時間(fulfilled)"]
}).catch(err => {
  // 失敗訊息 (立即)
  console.log(err)
});
```

不過如果 all() 其中有事件 reject，那麼此 promise 也均視為失敗 (`catch`)。

### Chain 鏈接方法

> 接下來他們三人想要依序跑，等一個人跑到定位後，下一位會接續著跑

在一開始有提到波動拳的概念，如果不斷的使用 callback 就會出現超級深的巢狀，那麼此時就可以善用 Promise 的 `then()`。

`then()` 所 turn 的資料內容會在下一個 then 接收，用此方法就可以減少 Callback 問題，也可以依序執行不同的 promise 事件。

```js
runPromise('小明', 3000).then(mingString => { 
  console.log(mingString); // 小明 跑 3 秒時間(fulfilled)
  return runPromise('漂亮阿姨', 2500);
}).then((autieString) => {
  console.log(autieString); // 漂亮阿姨 跑 2.5 秒時間(fulfilled)
  return runPromise('杰倫', 2000) ;
}).then((jayString) => {
  console.log(jayString); // 杰倫 跑 2 秒時間(fulfilled)
});
```

以上就是對於 `Promise` 的介紹，不過非同步的主題還沒結束，明天還有喔。
