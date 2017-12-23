---
layout: post
title: 鐵人賽：JavaScript 變數的宣告與他的作用域
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c2-01.jpg?alt=media&token=ebe1e4a2-c440-422d-b158-af7db0e62154
published: true
---

變數分為全域與區域變數，差異點在於宣告 (var) 的方式，就 MSDN 上的說明 `在函式定義之外宣告的變數就是全域變數，其值可在整個程式中存取和修改。` 所以我們可以使用函式來做兩個的分隔點，函式之內宣告的稱為區域，函式以外宣告的稱為全域。

## 全域性的變數
在函數外宣告的變數則是具有全域性(或是包含全域物件之內)，在瀏覽器下的全域物件是 `window`，有以下方式所產生的變數都會在 `window` 內。

```js
// 在函示外宣告
var mom = '老媽';

// 沒有使用 var
mom = '老媽';

(function () {
  // 或是在函式內，但沒有使用 var
  mom = '老媽';
})();
```
以上方式都可以在 `console.log(window);` 後找到 `mom 這個變數，這個變數也屬於 全域物件，因此所有函式也都能取用此變數。

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2FCB1DAB43-AC68-49BD-AD79-6F6CF4DEBBBA.png?alt=media&token=547987cf-fa8f-4bae-b558-f29a5ab7f6e6 )

另外，也可以直接產生在 `window` 物件下。
```js
window.mom = '老媽';
```

這幾種方式都會在 window 物件下產生 `mom`，並且所有函示都能取用，但還是有些差異 (後面會介紹)，但就實際使用來說，**建議無論如何都宣告你的變數**。

## 變數與他的作用域

每個變數在宣告時，都只會在執行環境內建立記憶體，這個就是他的作用域，單如果此作用域內沒有可用的變數時，他則會參照外圍的。

```js
function doMorningWork() {
  var mom = "老媽";

  function sayHi() {
	  var greeting = 'hi';
    return greeting + ' ' + mom;
  }
  console.log(sayHi());
}
doMorningWork();   // 執行
```

> 回到上一集的故事：
> 小明會將每一天的要做的事情寫在記事本內，並且記錄著許多工作內容。小明在  `doMorningWork()` 工作下建立了 `mom` 變數，這個 `mom` 就僅屬於 `doMorningWork()` 內，其它外部的函式都無法取用這個函式。 (旁白：小明出門後就可以不認這個媽媽了!?)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c2-01.jpg?alt=media&token=ebe1e4a2-c440-422d-b158-af7db0e62154)

- 外層  doMorningWork(); 具有 `mom`  的變數
	- 內層 sayHi(); 可以使用 `mom` 這個變數，讓小明可以跟媽媽說早安
- 另一個函式就無法取用 `mom` 這個變數。

其中內層沒有 `mom` 的變數，他就會向外層尋找，找到有相同名稱的就直接拿來使用。(旁白：小明啊，你應該把媽設為全域啊!?)

## 變數與記憶體關係

使用 var 宣告一個變數時，記憶體會先準備一個空間給予此變數，所以在實際運行前調用此變數並不會出現錯誤，只會出現 `undefined` (已經有記憶體空間，但沒有值)。

```js
console.log(mom); // undefined
var mom = '老媽';
```

> 故事：
> 小明本身記性就不好，他會採取先整個看一次的方式，將整個印象存在腦中 (開啟記憶體空間)，實際開始後再把實際把當天人、事、物整個記在腦內。

## 宣告與不宣告

MDN 文中提到 `其中差異在於, 已宣告的變數是全域物件裡的一個無法變更 (non-configurable) 的屬性, 而未宣告的變數則是可變更的 (configurable)` ，可以嘗試刪除產生的變數，觀察其差異。

案例：
```js
var mom1 = "老媽1";
mom2 = "老媽2"; 

(function () {
  mom3 = "老媽3"; 
})();

delete mom1;
delete mom2;
delete mom3;

console.log(window.mom1);  // 僅剩此有值
console.log(window.mom2);
console.log(window.mom3); 
```

#### 提醒

如果使用 var 則會先在記憶體準備一個空間給他，所以執行以前使用這個變數還不至於跳錯。

```js
console.log(mom); // undefined
var mom = '老媽';
```

但如果沒有使用 var，則會跳出錯誤。
```js
console.log(mom); // mom is not defined
mom = '老媽';
```

所以無論你的變數或函式是否要使用全域，都盡可能地去宣告它。至於 `Let`、`Const` 請容許我到後面 ES6 章節再來介紹它 :)。