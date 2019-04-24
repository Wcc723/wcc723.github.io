---
layout: post
title: 鐵人賽：JavaScript 的 this 到底是誰？
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c9-01.jpg?alt=media&token=9dc270e8-68a3-4cb3-b732-ebdcaf14e0f7
published: true
---

This 的在 JS 使用上非常頻繁，但一個 this 每個 function 都各自表示，這裡就直接用範例說明 This 有哪些情境，不過請注意一點，影響 this 的是在於**函式的呼叫方法**，並非宣告的時機：

## 純粹的調用 (Simple call)

如果直接調用函式，此函式的 this 會指向 window，以下兩個範例都是直接調用含式，所以都是指向 window。

```js
window.auntie = '漂亮阿姨';
function callAuntie() {
  console.log('call:', this.auntie);
  // this == window
  // 所以此時的 this.auntie 一樣可以取得 window 下的 auntie
}

callAuntie();
```

這裡將 function 內在包覆著 function，但只要是直接呼叫，this 都是屬於全域。

```js
window.auntie = '漂亮阿姨';
function callAuntie () {
  console.log('call:', this.auntie);

  // function 內的 function
  function callAgainAuntie () {
    console.log('call again:', this.auntie);
  }
  callAgainAuntie();
}

callAuntie();
```

無論在哪一層，純粹的調用方式 `this` 都會指向 window。


## 物件的方法調用 (As an object method)

如果 function 是在物件下調用，那麼 this 則會指向此物件，無論 function 是在哪裡宣告。以下的範例中一個是純粹的調用，另一個則是使用物件的方法調用，物件的方法調用時 `this` 會指向調用的物件。

```js
function callName() {
  console.log(this.name);
}

var name = '全域阿婆';
var auntie = {
  name: '漂亮阿姨',
  callName: callName  
  // 這裡的 function 指向全域的 function，但不重要
}

callName()        // '全域阿婆'
auntie.callName() // '漂亮阿姨'，呼叫是在物件下調用，那麼 this 則是該物件
```

相同的道理，宣告的位置不重要，重要的是呼叫的方法。如果將物件內的`函式`賦予在一個純粹的變數上並調用它時，這個 `this` 將會指向全域。

```js
var name = '全域阿婆';
var auntie = {
  name: '漂亮阿姨',
  callName: function () {
    console.log(this.name);
  }
}

// 將 function 指向物件內的 function，不過不重要
callThisName = auntie.callName; 
callThisName()                  // '全域阿婆'
```

#### DOM 物件調用 (As a DOM event handler) 同此方法

DOM 搭配 addEventListener 時，此 this 所指向的則是該 DOM。以下這段程式碼可以貼在任何網頁下的 Console，接下來點擊畫面上任何一區域，該區域則會加上紅線。

```js
var elements = document.getElementsByTagName('div');
function changeDOM() {
  console.log(this); // 指向當前的 DOM
  this.style.border = '1px solid red'
}

for (var i = 0; i < elements.length; i++) {
  elements[i].addEventListener('click', changeDOM, false);
}
```

## 建構式的調用 (As a constructor)

在建構式下會 new 一個新物件，此時的 this 會指向新的物件。建構式在後續的章節會介紹，此部分只要了解建構式的 `this` 也是指像物件本身即可。

```js
function FamilyConstructor () {
  this.mom = '老媽'
}

var myFamily = new FamilyConstructor();
console.log(myFamily.mom);
```

這一個 this 不會是全域且可以在生成的物件上重新定義 (所以他指向的是該生成的物件)。

```js
var mom = '全域老媽';
function FamilyConstructor(newMom) {
  this.mom = newMom || '老媽';
}

var myFamily = new FamilyConstructor('希望是漂亮阿姨');
var realFamily = new FamilyConstructor();
console.log('我的', myFamily.mom);    // 我的 希望是漂亮阿姨
console.log('現實', realFamily.mom);  // 現實 老媽
```

## 使用 Call 來呼叫 function

`call` 調用的函式可以直接傳入新的物件，使其作為 this 所指向的物件。

```js
var name = '全域阿婆';
function callName() {
  console.log(this.name);
}

callName();                        // '全域阿婆'
callName.call({name: '漂亮阿姨'});  // '漂亮阿姨'
```

call, bind, apply 這三者均可，都可以傳入新的 `this` 給予函式使用，三者僅是使用方法不同，可參考：[Function.prototype.apply() - JavaScript | MDN](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Function/apply)。

## 重新指向 this

在實際運作時，立即函式 (IIFE) 或是非同步的事件 (setTimeout) 大多都會指向全域，如果需調用的則是物件本身的話，可以先用一個變數指向 `this`，等到調用後再重新使用它。

```js
function callName() {
  console.log('區域', this.name);
  var that = this;
  setTimeout(function () {
    console.log('全域', this.name);
    console.log('區域', that.name);
  }, 10);
}

var name = '全域阿婆';
var auntie = {
  name: '漂亮阿姨',
  callName: callName  
  // 這裡的 function 指向全域的 function，但不重要
}

auntie.callName();
```

這個變數名稱可以自己定義，常見有 `that`、`vm`、`self` 等等，可以使用自己或團隊習慣的為主即可。