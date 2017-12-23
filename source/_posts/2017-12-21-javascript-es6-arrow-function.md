---
layout: post
title: 鐵人賽：箭頭函式 (Arrow functions)
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_18.png?alt=media&token=a4d8b729-9c90-40f4-98a0-b628219f213b
published: true
---

`Arrow function` 對於它也是又愛又恨的，看似簡約的外型卻有著全新的體驗，它有著更簡短的語法以及重新定義的 `this`，所以先前學的 `this` 在此也會有不同的情境。

## 簡短的語法

一般使用箭頭函式與 function 的用法大致一致，可以傳入參數、也有大括號包起來，除此之外箭頭函式也有更簡短的寫法如下：

```js
// 正常寫法
var callSomeone = (someone) => {
  return someone + '吃飯了'
}
console.log(callSomeone('小明'))

// 縮寫，單一行陳述不需要 {}
var callSomeone = (someone) => someone + '吃飯了'
console.log(callSomeone('小明'))

// 只有一個參數可以不加括號
var callSomeone = someone => someone + '吃飯了'
console.log(callSomeone('小明'))

// 沒有參數時，一定要有括號
var callSomeone = () => '小明' + '吃飯了'
console.log(callSomeone('小明'))
```

不過這個上述有個小地方也要注意一下，在大括號內的 `{}` 是需要自行加入 `return`，如果沒有傳入值則會出現 `undefined`。

```js
var callSomeone = (someone) => { someone + '吃飯了' }
console.log(callSomeone('小明')) // undefined
```

## 沒有 arguments 參數

在先前有一個小故事，小明要儲值悠遊卡，他投入不同的金額要加值，要使用 `arguments` 這個參數了解總共傳入了幾次並加總，但在箭頭函式內是沒有此變數的。

```js
let originCash = 1000;
const updateEasyCard = () => {
  let cash = 0;
  console.log(arguments); // arguments is not defined
}

updateEasyCard(10, 50, 100, 50, 5, 1, 1, 1, 500);
```

所以當需要使用 `arguments` 請維持使用 `function`。

## 綁定的 this 不同

- 傳統函式：依呼叫的方法而定
- 箭頭函式：綁定到其定義時所在的物件 (這個詞看似簡單，但又充滿了陷阱!?)

```js
var name = '全域阿婆'
var auntie = {
  name: '漂亮阿姨',
  callName: function () { 
    // 注意，這裡是 function，以此為基準產生一個作用域
    console.log('1', this.name); // 1 漂亮阿姨
    setTimeout(() => {
      console.log('2', this.name); // 2 漂亮阿姨
      console.log('3', this); // 3 auntie 這個物件
    }, 10);
  },
  callName2: () => { 
    // 注意，如果使用箭頭函式，this 依然指向 window
    console.log('4', this.name); // 4 全域阿婆
    setTimeout(() => {
      console.log('5', this.name); // 5 全域阿婆
      console.log('6', this); // 6 window 物件
    }, 10);
  }
}

auntie.callName();
auntie.callName2();
```

`綁定到其定義時所在的物件`，我們要了解一般函式在建立時是在 window 下，所以在 window 下使用箭頭函式自然會指向 window，要確實將箭頭函式宣告在物件內部，這樣 `this` 才會指向該物件。

```js
var func = function () {
  var func2 = function () {
    setTimeout(() => {
      console.log(this); 
    }, 10);
  };
  // 這裡才算真正的建立一個物件
  // 因此要在此物件下的箭頭函式才會以此作為基準
  var func3 = {
    func: func2,
    var4: 4
  }
  func2(); // this = window
  func3.func(); // func3 Object
}
func(); 
// 就算在這裡新增一個 function，也不會影響到內層的箭頭函式
```

這個範例稍作複雜些，但只是要解釋不同建立方式的差異，注意：如果 **不是** 建立在物件內的函式，並不會影響箭頭函示的 `this`：

- `func()` 是最外層的函式，他對於內層的箭頭不會有影響。
- `func2()` 是包覆在內層的函式，但由於箭頭函式不是在物件內，所以沒有影響。
- `func3()` 是呼叫在物件內的函式，因此箭頭函式會是使用它所在的物件。

#### 縮寫的函式

另外注意：物件縮寫形式的函式也是屬於 `function`，所以依然能夠產生作用域。

```js
// ==
var auntie = {
  name: '漂亮阿姨',
  callName () { 
    // 注意，縮寫形式的 function 屬於傳統 function
    setTimeout(() => {
      console.log(this); // auntie 這個物件
    }, 10);
  }
}
auntie.callName();
```

## 不可使用的情況

#### apply, call, bind

`this` 在 Arrow function 中是被綁定的，所以套用 `call` 的方法時是無法修改 `this`。

```js
let family = {
  ming: '小明'
}
const func = () => {
  console.log(this);
}
const func2 = function () {
  console.log(this);
}
func.call(family); // 箭頭函式的情況，this 依然是 window
func2.call(family); // 一般函示 this 則是傳入的物件
```

#### 不能用在建構式

由於 this 的是在物件下建立，所以箭頭函式不能像 function 一樣作為建構式的函式，如果嘗試使用此方法則會出現錯誤 (`... is not a constructor`)。

```js
const PhoneTemplate = (brand, modal, withCamera) => {
  this.brand = brand;
  this.modal = modal;
  // ...
}

const sonyPhone = new PhoneTemplate('Sony', 'Z100', true);
// 錯誤：PhoneTemplate is not a constructor
```

#### DOM 事件監聽

同先前說的， `this` 是指向所建立的物件上，如果是用在監聽 DOM 上一樣會指向 window，所以無法使用在此情境。

```js
var elements = document.getElementsByTagName('div');
var changeDOM = () => {
  console.log(this);                   // 指向 window Object
  this.style.border = '1px solid red'. // 錯誤
}

for (var i = 0; i < elements.length; i++) {
  elements[i].addEventListener('click', changeDOM, false);
}
```

#### Prototype 中使用 this

一樣是 this 的問題，如果原型上新增一個箭頭函式，並嘗試使用 this 的話會指向全域。

```js
function PhoneTemplate (brand, modal, withCamera) {
  this.brand = brand;
  this.modal = modal;
  // ...
}

PhoneTemplate.prototype.callSomeone = function (someone) {
  console.log(this.brand + ' 打通電話給 ' + someone)
}
PhoneTemplate.prototype.callSomeone2 = (someone) => {
  console.log(this.brand + ' 打通電話給 ' + someone)
}

const sonyPhone = new PhoneTemplate('Sony', 'Z100', true);
sonyPhone.callSomeone('小明'); // Sony 打通電話給 小明
sonyPhone.callSomeone2('杰哥'); // undefined 打通電話給 杰哥
```

## 善用的方式

過去我們在寫物件內的函式時，為了確保 this 能夠正確運作會先將它賦予在另一個變數上 (that, self, vm...)。

```js
var auntie = {
  name: '漂亮阿姨',
  callName () { 
    // 先使用另一個變數指向 this，讓內層函式可以正確使用
    var that = this;
    setTimeout(function () {
      console.log(that); // auntie 這個物件
    }, 10);
  }
}
auntie.callName();
```

箭頭函式本就會指向他所生成的物件上，所以可以不需要另外指向另一個物件。

```js
var auntie = {
  name: '漂亮阿姨',
  callName () { 
    setTimeout(() => {
		// 箭頭函式中會自動指向生成的物件上
      console.log(this); // auntie 這個物件
    }, 10);
  }
}
auntie.callName();
```
