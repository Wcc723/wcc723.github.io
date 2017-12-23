---
layout: post
title: 鐵人賽：JavaScript 就是一堆物件的概念
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c6-01.jpg?alt=media&token=f4e6e42e-02ab-4a93-a42c-fd87bf514089
published: true
---

在 JavaScript 中，除了上一篇所介紹到的原始型別以外的都是物件，包含陣列、函式...甚至全域本身都是物件，物件本身可以一層包著一層，其內層可以是字串、數值、陣列、物件，甚至是函式。

## 故事說明

> 小明的記事本都是用物件的概念在做紀錄，他會將要做的事情、筆記分門別類的做巢狀紀錄，這樣的好處可以讓他在尋找資料時比較好處理，並且可以自由地新增屬性及值。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_c6-01.jpg?alt=media&token=f4e6e42e-02ab-4a93-a42c-fd87bf514089)

那麼小明筆記本資料如果使用 JavaScript 寫的話會如下，可以發現其實大家做筆記的方式也是這樣的巢狀概念：

```js
var note = {
  '聯絡人資料': {
    '阿姨': {
      name: '陳小美',
      ages: 22,
      bwh: {              // 三圍
        strength: 34,
        agility: 25,
        intelligence: 96
      },
      single: true
    },
    '杰倫': {
      name: '陳小美',
      ages: 19,
      bwh: {              // 三圍
        strength: 87,
        agility: 87,
        intelligence: 87
      },
      single: false
    }
  }
}
```

我們簡化一下資料內容，紀錄單人資料時也是用巢狀的方式在記錄，如果要尋找一個人的特定屬性時也會比較快。(ex: 漂亮阿姨的力量值在 auntie -> bwh -> strength 可以找到)。

```js
var auntie = { 
  name: '陳小美', 
  ages: 22,
	bwh: {              // 三圍
	  strength: 34,
	  agility: 25,
    intelligence: 96
  },
  single: true
};
```

## 如何存取物件
物件本身的組成是由一個 `{屬性(property) / 值(value)}` 組成的，可以透過 JavaScript 的規則定義一個物件的名稱，舉例來說上述的阿姨可以用以下方式定義：

```js
var auntie = {};

auntie.name = '陳小美';
auntie.ages = 22;
auntie.single = true;
```

相同的概念，我們能夠使用一樣的方式取出物件的值，但如果是未定義的屬性則會出現 `undefined`，嘗試取出未定義屬性的子屬性則會出錯：

```js
console.log(auntie.name); // '陳小美'
console.log(auntie.name); // 22

// 假設以下值位定義
console.log(auntie.bwh);  // undefined
console.log(auntie.bwh.strength);  // 錯誤
```

另外也可以使用中括號來取用變數的值：

```js
var str = 'name'

auntie['name'];      // 使用純字串
auntie[str];         // 使用變數
auntie[0];           // 使用數字，就如同存取陣列一樣 (如果有此值)
auntie['some-name']; // 使用字串，就算此名稱不符合 JS 的變數命名規則 (如果有此值)
```

## 列舉物件

有時候，我們無法預設了解物件內有什麼屬性，此時我們可以使用列舉 `(for ... in)` 來取出物件內的屬性及值。

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
for (prop in auntie) {
  console.log(auntie[prop]);  // 陳小美, 22, {bwh},true
}
```

## 除了原始型別以外都是物件

JavaScript 本身可以運行在瀏覽器、伺服器端，以瀏覽器來說全域本身就是一個大物件 (window)，裡面包含許多瀏覽器的 API、開發者定義變數、DOM 物件... 、方法等，只要在開發者工具下輸入 console.log(window) 就可以看到。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2FE5865D7B-361A-467A-B46F-E32D51DD6966.png?alt=media&token=e7c52737-cd79-4b3e-b931-4020e4f7cc61)

上圖可以看到剛剛宣告的物件也存在於 window 的物件下。

接下來可能會思考到為何陣列、函式都是物件？如果說陣列本身是物件可能也許好理解，他的存取方式與物件是非常相似的 (下方範例)：

```js
var auntie = ['陳小美', 22, {
  strength: 34,
  agility: 25,
  intelligence: 96
}, true];

auntie[0];  // '陳小美'
```

但偏偏他還多了許多陣列方法 (像是：`push`, `shift`, `unshift`)，為何還會說是陣列呢？

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2017_12_9_%E4%B8%8A%E5%8D%8810_51.png?alt=media&token=ec593d80-640b-4968-8217-035ea1dc72df)

這段都與原型繼承有關，我們在更後續的章節再來介紹這一段。