---
layout: post
title: 閉包，原來這就是閉包啊！
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_11.jpg?alt=media&token=6f0bb2b6-7d3a-42d5-a785-291c15680546
published: true
---

閉包，是一個 JavaScript 很常聽到的觀念，雖然會在不知不覺應用到閉包的基本概念，進階的用法在實戰中不一定很常用到，但這卻是面試中非常常見的問題，主要原因是它牽扯到許多的觀念，如詞法作用域、記憶體等觀念。

## 原來這就是閉包：詞法作用域

許多閉包文章都會提到「詞法作用域」的觀念，此觀念主要是說明 JavaScript 的**作用域範圍由程式碼所定**，所以程式碼在撰寫完成的同時，就已經先確立了作用域，運行的過程中都不會改變其作用域，範例程式碼如下：

```js
function fn1() {
  console.log(a);
}
function fn2() {
  var a = 1;
  fn1();
}
fn2();
```

上方兩個函式的作用域完全獨立，不會因為運行的過程讓函式可存取領一個函式的變數。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FCE66B6E3-A1E4-4688-ABEE-3CC63148496C.png?alt=media&token=532c4d14-0eee-40c9-a67a-74e1ba7c4baa)

雖然變數的作用域是獨立的，但**函式內的函式**則可以取用外層作用域的變數。

如以下範例：`addString` 函式內並沒有 `name` 的變數，因此他會從外層尋找，在外層的 `sayHi` 函式則可以找到 `name` 變數。

```js
function sayHi() {
  var name = '小明';
  
  function addString() {         // 內部函式、閉包
    console.log(`${name} 你好`);  // 取用外層的變數
  }
  addString();
}
sayHi();
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F53D2F7AE-B05E-4908-88FA-149C0361784F.png?alt=media&token=db3725b4-e13a-4226-a78c-2deb62f6cb58)

在巢狀函式中，如果內層的函式沒有可以取用的特定變數則會向外查找，此時內部的函式就可以稱為閉包。

內層函式取用外層函式的變數，就這樣而已？當然不止，這個概念可以有非常多延伸的變化。

## 私有變數：把內層的函式丟出來

前幾篇文章有提到「記憶體釋放」的[觀念](https://wcc723.github.io/development/2020/09/23/js-object/)，當函式中的變數無法再被參考時，該變數所佔用的記憶體就會被釋放掉，而閉包的技巧正好可以維持記憶體的參考。

可參考以下範例，此範例中（可搭配下方的圖片一起參考）：
- `sayHi` 函式中傳入 name 的參數，此參數的作用域在 sayHi 函式中，當此變數無法再次被存取就會被釋放。
- 內層函式 `addString` 存取 `name` 變數，由於該函式內沒有此變數因此向外層查找到 sayHi 函式的 `name` 變數
- `addString` 沒有在 `sayHi` 函式內運行，而是透過 return 傳出到 mingSayHi 的變數上（小明說你好）。
- 當運行 `mingSayHi` 時：
	- 會運行內層的 `addString` 函式，並且嘗試存取 `name` 變數...
	- **重點：**`name` 變數因為還會持續維持參考，所以不會被釋放記憶體，因此成為了 `mingSayHi` 函式的私有變數（僅存與此函式中，無法透過其它方式調整）
```js
function sayHi(name) {

  function addString() {
    console.log(`${name} 你好`)
  }
  return addString;
}

var mingSayHi = sayHi('小明');
mingSayHi();
```

圖解概念：
- addString 函式可以存取 sayHi 函式的變數
- addString 沒有直接運行，而是將 addString 函式回傳並儲存於外部的變數 `mingSayHi` 上
- 外部變數 `mingSayHi` 是一個函式變數，當運行時可以存取 sayHi 的變數，此時的 `name` 變數為 `mingSayHi` 的私有變數。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F30093298-CD38-4184-BFE3-BE6F29DC4AB7.png?alt=media&token=6a26e9f8-f422-4c67-8083-945f9097fc88)

閉包是內部的函式可以取用外部作用域變數的概念，單就此概念來說僅是函式及詞法作用域的關係，但如果將內層的函式向外傳出，使其保留了原始函式結構中的作用域使其產生私有變數，更能凸顯閉包的價值。

#### 延伸說明

在這個結構中出現了兩層函式，第一次呼叫時會運行 `sayHi` 函式，第二次呼叫則會運行**內部回傳**的 `addString` 函式；除了上述介紹私有變數時將回傳函式儲存於 `mingSayHi` 外，也可直接使用兩個括號來執行內部的函式。

```js
sayHi('杰倫')(); // 杰倫 你好
```

呼叫流程如下
1. 第一個 `('杰倫')`：運行 `sayHi`，並傳入 '杰倫'
2. 第二個 `()`：運行 `addString`，直接回傳 '杰倫 你好'

#### 實戰案例

模擬事件：用戶有一個錢包存有 1000 元，這個錢包會因為不斷的購買品項而減少費用，每次所減少的費用都不大相同。

下方建立了包含閉包特性的函式：
- balance 中儲存了一個私有變數，這個私有變數不會與其它函式共用
- 每次呼叫此函式皆會扣除費用並且回傳出目前的金額

```js
function buyItem() {
  var myMoney = 1000;
  return function (price) {    // 這個閉包目前會被重複呼叫
    myMoney = myMoney - price;
    // myMoney 第一次由外部傳入，接下來在這個 function 內不斷更新
    return myMoney;
  }
}
var mingMoney = buyItem(); // 存取內部函式的變數
mingMoney(100); // 900
mingMoney(100); // 800
mingMoney(100); // 700
```

模擬事件更新：用戶不僅一名，會有另外一名共同使用此方法，但兩者的金錢不能混合計算。

在上方所建立包含**私有變數**的函式中就可以解決此問題，可使用另一個變數來建立一個新函式，兩個函式會擁有各自的私有變數。

```js
var jayMoney = buyItem(); // 存取內部函式的變數
jayMoney(50); // 950
jayMoney(100); // 850
jayMoney(500); // 350

mingMoney(100); // 600，mingMoney 與上方的 jayMoney 變數不會共用
```

除了單一的方法匯出以外，閉包另有私有方法（可參考 [MDN 文件](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Closures#%E4%BD%BF%E7%94%A8%E9%96%89%E5%8C%85%E6%A8%A1%E6%93%AC%E7%A7%81%E6%9C%89%E6%96%B9%E6%B3%95)）。

閉包，除了是面試常見的考題外，實戰中也有私有變數的優點（函式的作用域內，外部無法取得函式內的變數）。因此，無論匯出的是哪一種方法，閉包的優點是**變數僅存在於函式之中**，如果匯出的方法沒有提供原始值，將無法用任何方式取得原始變數，如果需要刻意隱藏變數值，避免用戶透過其他工具或方式取得，閉包也會是一個好方法。

