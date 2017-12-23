---
layout: post
title: 鐵人賽：JavaScript 物件的連連看!? 兩個物件的值居然會一樣
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c7-2.jpg?alt=media&token=c21e14c5-a0b5-48ee-b445-a4c5a69d5245
published: true
---

> 承上集，小明現在在漂亮阿姨 (陳小美) 家裡，漂亮阿姨還有一個雙胞胎姐姐 - 陳美美，陳美美的各方面與雙胞胎妹妹都很接近，除了名字以外。因此，偷懶的小明決定將兩個人的名字畫線連再一起，然後改個名字就好了。

```js
var auntie = { 
  name: '陳小美', 
  ages: 22,
	bwh: {
	  strength: 34,
	  agility: 25,
    intelligence: 96
  },
  single: true
};

var auntie2 = auntie;   // 將漂亮阿姨得值 連到姊姊上
```

接下來，調整一下姊姊的名字

```js
auntie2.name = '陳美美'
console.log(auntie.name); // 請問這裡會輸出什麼？
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c7-1.jpg?alt=media&token=9bebf516-8c1c-47da-9ab4-0e752a9200ef)

小明將兩個人的名字，對應到相同的資料結構上，阿姨與她的姊姊都是同一份資料。因此，小明將阿姨姊姊的名字寫到阿姨的名字上了 (明天醒來就會搞不清楚是誰了!?)。

## 傳值與傳參考

一般而言，我們在傳遞變數的時候，如果是單一的值賦予到另一個變數後，兩者是毫無關係的。

```js
var a = 'a';
var b = a;
b = 'c';

console.log(a); // a 依然是 'a'，不受影響
```

但就上面小明故事來說，會發現兩者的物件好像是綁定再一起的，改動其中一個，另一個物件也會跟著更動，這個因為在 JavaScript 中的物件是 "傳參考(by Reference)"，其結果就像是小明筆記本所發生的狀況。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c7-2.jpg?alt=media&token=c21e14c5-a0b5-48ee-b445-a4c5a69d5245)

如果使用資料表的概念在思考，可以想像資料表的 Address 就是變數，Value 就是值，一個 Address 只能對應一個值，那麼物件在組成的時候就會產生另一個表，然後透過 address 來做傳遞，所以才會兩個變數共用同一個資料表。

這樣的結果有好處也有壞處，好處是我們在操作物件時，可以輕易地用更短的變數來操作，以下面範例來說，我們可以將 DOM 物件賦予在一個更精簡名稱的變數上，然後修改其中的值。

```js
var input = document.getElementById('sb_ifc0');
input.style.backgroundColor = "red";
// 在 Google 首頁的 Console 套用此段程式碼，可以將 input 背景改成紅色
```

壞處可以參考小明所遭遇到的問題，操作資料格式時將兩份資料給搞混了，所以在處理資料時，如果他實際並非 "同一份"，而僅是相似時就要特別注意此問題。

## 複製物件不含參考

我們來介紹不同方式來複製物件且不含參考，而以下是基礎的資料格式。

```js
var auntie = { 
  name: '陳小美', 
  ages: 22,
	bwh: {
	  strength: 34,
	  agility: 25,
    intelligence: 96
  },
  single: true
};
```

另外複製也會有區分 深度 (Deep Copy)及淺度 (Shallow Copy)，差異在於一層傳值，還是所有層級皆傳值，在 `bwh` 這一層就可以做此測試。

### 手動賦值

這是很直接的觀念，把物件的參考賦予方式改用值的方式來傳遞，此時手動傳值的部分將會完全獨立。不過注意，在內層物件還是依據參考的方式傳遞 (`bwh` 的物件)。

```js
auntie2 = {
  name: auntie.name, 
  ages: auntie.ages,
  bwh: auntie.bwh,
  single: auntie.single
}
```

### for...in

和手動賦值的方式接近，不過是使用 `for...in` 的語法將原本的物件屬性，傳到新的物件上，這種方式同上也是屬於淺層賦值。

```js
var auntie3 = {};
for (var prop in auntie) {
  auntie3[prop] = auntie[prop];
}
```


### 轉字串

將物件轉換為一個不相干的字串，再將字串轉回物件，這種方式就會使兩個物件毫無關聯，屬於完全複製沒有深度限制。

```js
var str = JSON.stringify(auntie);
var auntie4 = JSON.parse(str);
```

### 使用套件

jQuery 套件中的 extend 可以複製物件，他也可以將加入參數使用深度複製 (deep copy)，不虧是萬年 jQuery，各種好用工具都在其中。

```js
var auntie5 = jQuery.extend({}, auntie);       // 淺複製
var auntie6 = jQuery.extend(true, {}, auntie); // 深度複製
```

jQuery extend 詳細文件: [jQuery.extend() | jQuery API Documentation](https://api.jquery.com/jquery.extend/)

### ES6

原生 ES6 中也有提供類似 jQuery 的複製方法，但此方法僅適用於淺複製，並沒有提供深度複製。

```js
const auntie6 = Object.assign({}, auntie);
```

By Reference, By Value 在 JavaScript Object 中一值屬於很常見的問題，不管新手老手都曾經錯在其中 T_T。
