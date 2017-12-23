---
layout: post
title: 鐵人賽：JavaScript 的原型繼承
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c14_2.jpg?alt=media&token=d880e22d-0931-471c-a0cb-ccc587f8ea7e
published: true
---

許多人在寫 JavaScript 應該多少都會聽過原型鍊、原型繼承...，這個觀念在寫 JavaScript 是否重要呢？實作中會不會常使用到這樣的技巧？這裡可以先回答 "會"，而且我們很常使用到原型，而且了解原型會有助於我們加速理解 JavaScript 的概念。

以下有一個物件，物件裡面只有一個 `name` 及一個 `function run()`，所以我們了解以下物件只能執行 `run()`，因為他沒有其他的函式可以使用。

```js
var person = {
  name: '小明',
  run: function () {
    return this.name + ' 跑向世界的另一端'
  }
}
person.run(); // "小明 跑向世界的另一端"
person.hasOwnProperty('run'); // true
person.hasOwnProperty('friend'); // false
```

但除此以外還有一些額外的方法可以使用，像是 `hasOwnProperty()`，但奇怪的事情是 `hasOwnProperty()` 這個方法，沒有在 person 這個物件下，為何還可以使用此 `hasOwnProperty()` 的方法，原因在於 "原型繼承"。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c14_1.jpg?alt=media&token=934dd4b5-494b-464c-9463-f45cc5f034bb)

上圖中 `person` 這個是我們剛剛宣告的物件，它的上層是則是他的原型物件(它是半透明的喔，所以我們平常會沒注意到)，當他在使用 `hasOwnProperty()` 時，就是在使用它原型物件的方法。

#### 透過錯誤範例了解原型

**錯誤範例**：這裡提供一個觀念上的錯誤範例，實際執行時我們不會用此方法來增加原型方法。JavaScript 中所有的物件、函式都有 `__proto__` 的原型屬性，這一個原形屬性會不斷的向上尋找他的上層原型。

```js
var ming = {
  name: '小明'
}
console.log(ming);
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2FCEE32FA8-B533-4189-8E50-B61D83FA709A.png?alt=media&token=91ceb969-30ac-4567-a3f8-623029c1eb4a)

我們在 `ming` 下的 `__proto__` 直接掛上 `run` 的方法，使其產生在 `__proto__` 下 **注意：請不要這樣做，只是為了方便理解**。 
```js
var ming = {
  name: '小明'
}
var run = function () {
  return this.name + ' 跑向世界的另一端'
}
ming.__proto__.run = run;
console.log(ming.name); // {name: "小明"}
console.log(ming.run()); // "小明 跑向世界的另一端"
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2FEC9D6B41-AAED-4697-AAB5-263FCC075BC5.png?alt=media&token=56953efd-7fbd-4ff4-bea3-1e143075c6b3)

雖然直接 `console.log(ming)` 並不會看到 `run()` 這個方法，但執行時他會不斷的向上尋找到原型內的 `run()` 方法來執行它。

## 共用原型

其中原型還有個特性，我們如果在物件原型下直接建立新的方法，就會造成以下的問題，兩個看似沒有關係的物件將會共用相同的原型方法 (因為兩者的原型都是物件)，這種情況會出現管理上的問題。

```js
var ming = {
  name: '小明'
}
var casper = {
  name: '卡斯伯'
}

var run = function () {
  return this.name + ' 跑向世界的另一端'
}
ming.__proto__.run = run;
console.log(ming.run()); // "小明 跑向世界的另一端"
console.log(casper.run()); // "卡斯伯 跑向世界的另一端"
```

這個範例中，我們強制將函式寫到了 `物件` 這個原型上，所以新增的物件都會 **共用** 此屬性。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c14_2.jpg?alt=media&token=d880e22d-0931-471c-a0cb-ccc587f8ea7e)

在後面的章節我們會介紹如何正確地使用原型繼承。

## 原型鍊的的頂端是物件

JavaScript 只有一個建構物："物件"，如果上述程式碼以下我們繼續往下增加：

```js
var mingFamily = ['ming', 'mom', '漂亮阿姨'];
var casperFamily = ['卡斯伯', '媽'];

// 嘗試呼叫先前物件下的原型
mingFamily.run();
"undefined 跑向世界的另一端" //雖然出現錯誤，但依然可以呼叫
```
這個範例中，我們新增一段陣列，並在陣列中使用先前的物件原型方法，雖然會出錯，但是是可以執行的。

```js
var getFirst = function () {
  return this[0];
}
// 對 陣列原型加入新的方法
mingFamily.__proto__.getFirst = getFirst;

mingFamily.getFirst();  // "ming"
casperFamily.getFirst(); // "卡斯伯"

ming.getFirst();
// ming.getFirst is not a function
```
在此段，我們對任一陣列原型加入新的函式，此時兩個陣列都可以套用此函式，但對於物件來說卻不能執行此方法，因為在原型鍊上物件屬於陣列的頂端。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c14_3.jpg?alt=media&token=9ab2ad7a-ad01-4fc4-85f6-5710f70492ca)

由於原型有不斷向上查找的特性，如果在上一層找不到可用的方法，他就會繼續往上找，這個也就稱為原型鍊，所以在 `mingFamily` 這個陣列才會取用到剛剛物件原型所增加的方法，本篇只是簡單介紹原型的概念，接下來幾篇則會開始讓大家了解這有什麼樣的用處。
