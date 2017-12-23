---
layout: post
title: 鐵人賽：一次只能做一件事情的 JavaScript
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c3-01.jpg?alt=media&token=33d7975b-42e9-4e59-b878-c1a578a382d1
published: true
---

在 JavaScript 中，一次只會執行一段程式碼，相信看到這段大家心中都會有所疑惑，我們實作中可以大量發出許多事件，並重複執行不同的函式，這樣為何還是單執行緒 (single threaded) 的程式語言呢？

這段如果用純文字解釋較為困難，所以本篇會加入動畫讓大家更容易了解原理。

## 故事說明

小明故事：
小明在完成早上的事情後，他會準備做以下事情：

- 打電話給漂亮阿姨
	- 等待漂亮阿姨回覆
- 清理碗盤...

接下來他會有以下動作
1. 打電話給漂亮阿姨
2. 心中掛念著 **漂亮阿姨** 回電  (Event Queue)
3. 去清理碗盤
4. 接到阿姨的回電

小明並沒有再打給阿姨後就守在電話旁，而是先去做其他事情等待，並且把漂亮阿姨回電這件事情先放在心中，等待回電後再去接聽。

```js
function doWork() {
  var auntie = "漂亮阿姨";
  
  (function () {
    console.log('打給阿姨')
    setTimeout(function () {
      console.log(auntie + '回電')
    }, 3000)
  })();
  
  (function () {
    console.log('洗碗');
  })();
}

doWork();   // 執行

// 打給阿姨
// 洗碗
//
// 漂亮阿姨回電
```

## Event queue (事件佇列)

像小明先把事情擱置在心中，等待條件觸發在 JavaScript 稱為 Event queue。像是 setTimeout, addEventListener, XMLHttpRequest 等等，這些方法在執行時會先將事件放到這地方，並將所有的事件堆疊**完成後**，才會開始讓 `event queue` 內的事件被觸發。

我們透過以下的短影片來了解一下 `event queue` 是怎麼樣概念 (影片下方是時間軸，用來解釋事件堆疊)。

<video width="100%" controls autoplay loop>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2Fevent_queue.mp4?alt=media&token=77b9bb26-d3dc-4c1e-af5f-3233e7e4c11c" type="video/mp4">
Your browser does not support the video tag.
</video>

影片中我們可以看到
- 事件堆疊會逐一執行
- 等到執行到不會立即執行的行為，就會放到 `event queue`，`event queue` 的事件在 **所有事件完成前** 不會被執行。
- 等到所有事件堆疊完成後 `event queue` 內的事件才能被觸發。

這裡將 setTimeout 修改成 0 試試看，確認是不是所有事件堆疊都完成後，才會執行 `event queue` 的事件。

```js
function doWork() {
  var auntie = "漂亮阿姨";
  
  (function () {
    console.log('打給阿姨')
    setTimeout(function () {
      console.log(auntie + '回電')
    }, 0) // 修改成 0 秒
  })();
  
  // ...
  console.log('洗碗');
	return '完成事件堆疊';
}

doWork();   // 執行
```

他一樣會將所有事件完成後，再讓 setTimeout 完成，以上這段程式碼也可以貼在 Chrome  開發者工具內試試看。

```
打給阿姨
洗碗
// "完成事件堆疊"
漂亮阿姨回電
```

在所有非同步事件如 `click`、`setTimeout`、`ajax`...，都不會立即執行這些行為，而是將這些行為放到 `event queue` 中，等待事件觸發後再回來執行。
