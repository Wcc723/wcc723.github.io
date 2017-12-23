---
layout: post
title: 鐵人賽：JavaScript 的嚴格模式 "use strict"
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c12.jpg?alt=media&token=7471b24d-b970-4ed8-831d-5112ffa359d9 
published: true
---

JavaScript 不斷的演進下，許多不嚴謹的寫法都應該逐漸被修正，但哪些是需要修正的字詞呢!? `'use strict'` 則是新加入的標準，目的是為了讓編寫「具穩定性的 JavaScript 更容易」，在不穩定的語法或妨礙最佳化的語意都會跳出警告，讓開發者避開這些寫法。

而在傳統的瀏覽器下 `'use strict'` 僅會被視為沒有用處的字串，所以不會對舊有的瀏覽器產生影響。

## 使用方法

`'use strict'` 直接加入在程式碼的前方就可以開始運作，特別值得注意的是它也可以單獨使用在 function 下，如果要靠 `'use strict'` 來修正目前語法上的問題，可以先針對部分的 function 來做調整。

簡單示範一個錯誤 (未定義的變數不能直接賦予值)：
```js
'use strict';
auntie = '漂亮阿姨';
// Uncaught ReferenceError: auntie is not defined
```

嚴謹模式也能僅用在函式內，這樣將只有此函式套用。

```js
(function () {
  'use strict';
  auntie = '漂亮阿姨';
  // Uncaught ReferenceError: auntie is not defined
})();
```

如果使用在函式的開頭，那將只會在此函式套用 "嚴謹模式"，函式的外部將不受影響。

```js
(function () {
  'use strict';
})();

mom = '老媽管不到';
// 不會跳錯
```

#### 注意

只有將 `'use strict'` 放在函式開頭才會有作用。
```js
(function () {
  var aa;
  'use strict';  // 無效
  auntie = '漂亮阿姨';
})();
```

## 常見錯誤

基本錯誤如下：

- 不宣告直接賦予變數
- 刪除已經宣告的錯誤
- 物件內有重複屬性
- 數值使用 8 進位語法
- 不能使用 'with' 語法
- arguments、eval 不能作為變數名稱
- 新增的保留字也不能被作為變數名稱 implements, interface, let, package, private, protected, public, static, yield，這些是為了 ES6 做得準備。

如果嘗試修改 getter 則不會默默地沒改，而是直接地跳出錯誤：

```js
(function () {
  'use strict';
  var family = {
    get mom() { return '老媽' }
  }
  console.log(family.mom); // 老媽
  family.mom = '老爸'; // 跳錯
})();
```

不可以嘗試刪除一個不可刪除的屬性(此為原型，在後面的章節會介紹到)：

```js
(function () {
  'use strict';
  delete Object.prototype;
})();
```

## 'use strict' 及 this

在先前介紹 this 的時有介紹到不同的呼叫方法，在 'use strict' 的環境下的 `純粹的調用 (Simple call)` 的 this 不在是全域變數。

```js
window.auntie = '漂亮阿姨';
function callAuntie() {
  'use strict';
  console.log('call:', this.auntie);
}

callAuntie.call({ auntie: '叫阿姨' }); // Ok
callAuntie(); // 錯誤，此呼叫會導致 this 為全域
```

但 this 依然可作為 window 的方式傳入。

```js
window.auntie = '漂亮阿姨';
function callAuntie() {
  'use strict';
  console.log('call:', this.auntie);
}

callAuntie.call(this); // Ok，call: 漂亮阿姨
```

現在會建議寫 JavaScript 的時候加入 `'use strict'`，這可以改正一些編寫時的不良習慣，但也有可以因此導致專案無法運作，此時可以考慮將 `'use strict'` 加在函式內，避免影響過去的程式碼及相關套件。