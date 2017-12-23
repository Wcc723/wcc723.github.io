---
layout: post
title: 鐵人賽：JavaScript 建構式
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c15_1.jpg?alt=media&token=5837a3bd-a2a2-4a75-a265-3112a3f1a2e4
published: true
---

了解原型繼承後，可以開始思考這個概念可以用在哪個地方，其中一個就是建構式。我們先不介紹建構式有什麼優點，先了解一下該怎麼透過 JavaScript 來寫建構式，然後再用原型的概念來介紹他的特別之處。

> 小明到手機行決定挑選一支手機，手機款式很多但基本上都有相同的功能，僅有少部分的規格上有差異，過去那種資料連連看的方式一定會把資料搞得一團亂 (參考先前的 Javascript 物件 "傳參考" 特性)，於是他想到一個新方法，先寫好一個樣板，有需要的格式直接從該樣板取用即可。

手機的規格樣板：
- 品牌：
- 型號：
- 是否能照相：
- 照相：

## 一般物件寫法的問題

如果使用一般的物件製作手機規格的樣板，就會出現以下的問題，當物件賦予到另一個物件上時，兩者其實是使用相同的資料，當修改後者時前者也會跟著修改 (JavaScript 傳參考的特性)。

```js
var phoneTemplate = {
  brand: 'xxx',
  model: 'z1',
  withCamera: false,
  takePhoto: function () {
    if (this.withCamera) {
      console.log('照相');
    } else {
      console.log('這台沒有照相功能');
    }
  }
}

var sonyPhone = phoneTemplate;
sonyPhone.brand = 'Sony';
console.log(phoneTemplate.brand); // "Sony"，原始的 Template 已經被修改到了
```

雖然先前有介紹到如何將值一一的取出來，但此方法也會完全與樣板斷開關聯性。

## 建構式

使用 JavaScript 建構式寫法，可以先建立一個範本，接下來新增的物件都會依據此範本作為延伸。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c15_1.jpg?alt=media&token=5837a3bd-a2a2-4a75-a265-3112a3f1a2e4)

JavaScript 建構式中，我們會使用 function 來建立物件樣板 (只能使用 function，亦不能使用箭頭函式)。

這個結構與前方所使用的結構接近，不同的是：
- this 則是代表此物件的屬性
- 可以透過參數來傳入數值
- 使用 new 來套用此樣板，且最終一樣會產生物件

```js
function PhoneTemplate(brand, modal, withCamera) {
  this.brand = brand;
  this.modal = modal;
  this.withCamera = withCamera || false;
  this.takePhoto = function () {
    if (this.withCamera) {
      console.log(this.modal + ' 照相');
    } else {
      console.log(this.modal + ' 這台沒有照相功能');
    }
  }
}
```

使用建構式時，盡可能使用大寫開頭，讓合作的朋友也能知道他準備作為建構式之用。

而套用樣板會使用 `new` 這個方法，並且可以透過傳入參數的方法來改變預設值，接下來會出現兩台手機物件，包含相同的樣板套用上不同的值，但兩者並沒有任何關係。

```js
// 建立兩隻手機，分別傳入 品牌、型號、是否有相機
var sonyPhone = new PhoneTemplate('Sony', 'Z100', true);
var nokiaPhone = new PhoneTemplate('Nokia', '3310', false);

// 直接透過 console.log 來觀看其中的值
console.log(sonyPhone);
{
  brand: 'Sony',
  model: 'Z100',
  withCamera: true,
  takePhoto: function () {
    // ...
  }
}

console.log(sonyPhone == nokiaPhone); // false
```

兩者也可以獨立運行自己的方法：

```js
sonyPhone.takePhoto(); // Z100 照相
nokiaPhone.takePhoto(); // 3310 這台沒有照相功能
```

我們這裡可以得知是使用相同樣板，但產生兩者毫無關係的物件，並且可以針對其中一個物件新增修改方法。

```js
sonyPhone.call = function () {
  console.log(this.modal + ' 打電話');
}

sonyPhone.call(); // Z100 打電話
nokiaPhone.call(); // nokiaPhone.call is not a function
```

到這裡我們可以得知這種建構式可以透過 "同一個物件樣板"，不斷地產生 "不同"的物件，每個物件彼此都是獨立的(不會有參考的問題)，只不過共用相同的原型。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7%202017-12-18%20%E4%B8%8A%E5%8D%8810.06.58.png?alt=media&token=08026e73-684d-40ab-9340-1525e0a4b112)

其中一支手機可以看到 `__proto__` 是 PhoneTemplate，這就好像是使用同一個模具產生兩個獨立的物件，我們也可以更新這個模具讓產生的物件有更多的功能，接下來我們會再介紹 `原型繼承與記憶體` 的關係。

