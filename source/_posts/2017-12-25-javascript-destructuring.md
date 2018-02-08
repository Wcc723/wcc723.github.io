---
layout: post
title: 鐵人賽：ES6 解構賦值
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_22.jpg?alt=media&token=47b8a9d0-f8fb-4de7-b114-32f96e53e478
published: true
---

解構賦值這是在 MDN 文件上的翻譯名詞，如果簡單來說他是個語法糖，讓我們在寫 物件、陣列 的時候可以使用縮寫來達到相同的效果，了解其中的規則再運用上最會很便利，且可以有效增加閱讀性 (程式碼短非常多)。

解構賦值可以想像是鏡子的概念，將右方的資料往左邊送，然後會一個位置對一個值 (但沒有像鏡子左右顛倒)。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_22.jpg?alt=media&token=47b8a9d0-f8fb-4de7-b114-32f96e53e478)

## 陣列

解構賦值就像是鏡子一樣，將值從右邊鏡射到左邊，所以左邊的陣列基本上就是從右方一個一個對映。因此右方的的五個值(字串)直接對應左方陣列的五個變數。

```js
let family = ['小明', '杰倫', '阿姨', '老媽', '老爸'];
let ming = family[0];
let jay = family[1];
let auntie = family[2];
// ... 略

let [ming, jay, auntie, mom, papa] = family;
```

如果遇到空的變數，這些值也會跳過。

```js
let family = ['小明', '杰倫', '阿姨', '老媽', '老爸'];
let [ming, , , mom, papa] = family;
// ming: 小明
// mom: 老媽
// papa: 老爸
```

如果左方多於右方，左方的變數會出現 `undefined`。

```js
let family = ['小明', '杰倫', '阿姨', '老媽', '老爸'];
let [, , , , , who] = family;
// who: undefined
```

至於傳值是否有順序性，在這個範例中直接將右邊的變數交換到左邊，可以看到是**同時**交換變數，所以在互換變數值時是非常方便的。

```js
let Goku = '悟空';
let Ginyu = '基紐';
[Goku, Ginyu] = [Ginyu, Goku];
// Goku: '基紐'
// Ginyu: '悟空'
```

遇到字串則會將字串拆解成一個一個字元，賦予到左方的變數上。

```js
let str = '基紐特攻隊';
[a, b, c, d, e] = str;
```

## 物件解構

物件解構也是和陣列解構有著相同的概念，只不過陣列是使用順序的索引值對應，但物件則是使用物件的屬性名稱來做對應(因此沒有順序性)。在以下範例則是快速將物件值解構在變數上。

```js
let family = {
  ming: '小明',
  jay: '杰倫',
};

// 一般會這樣寫
let ming = family.ming
let jay = family.jay

// 縮寫版
let { ming, jay } = family
// ming: 小明
// jay: 杰倫
```

而物件的解構方法，還能重新賦予變數的名稱，如以下 `Ginyu` 在取得值後，將變數名稱改為 `Goku`，因此 `Goku === '基紐'`。

```js
let GinyuTeam = {
  Ginyu: '基紐',
  Jeice: '吉斯',
  burter: '巴特',
  // ...
}
let { Ginyu: Goku } = GinyuTeam;
// Goku: '基紐'
```

### 混合使用

相同的觀念，只要了解以上的觀念，這題也能了解到最終會產生怎樣的變數。
```js
let { ming: Goku, family: [, mom] } = { ming: '小明', family: ['阿姨', '老媽', '老爸'] }
console.log(Goku, mom); // 請問答案是什麼？
```

說明：
- `ming` 取得右方的 '小明' 後，將變數名稱改為 `Goku`
- `family` 取得家庭陣列後，再將第二個值套用在 `mom` (第二個變數上。)

### 預設值

除了使用鏡射的概念外，為了避免值沒有賦予造成 `undefined`，可以使用預設值避免此問題。如以下左方的陣列都先賦予的預設值，當右方的陣列只有一個值時，左方的陣列剩餘內容將會採用預設值。

```js
let [ming = '小明', jay = '杰倫'] = ['阿明'] 
// 第一個會被賦值，第二個會用預設
// ming: "阿明"
// jay: "杰倫"
```

物件的預設值也是相同的概念。

```js
let { family: ming = '小明' } = {}
// ming: '小明'
```

## 函式

除了以上的方法外，解構也能使用在函式的參數，使用方式如同將傳入的物件對應到函式參數上。這樣參數一樣能夠能夠自訂變數名稱、順序、預設值等。

```js
function callSomeone ({person = '小明', person2}) {
  console.log(`${person} 呼叫 ${person2}`)
}
callSomeone({ person: '杰倫', person2: '阿姨' }); // 杰倫 呼叫 阿姨
callSomeone('杰倫', '阿姨'); // 小明 呼叫 undefined
callSomeone({ person2: '阿姨' }); // 小明 呼叫 阿姨
callSomeone({ person2: '杰倫', person: '啊罵' }); // 啊罵 呼叫 杰倫
callSomeone({}); // 小明 呼叫 undefined
```

