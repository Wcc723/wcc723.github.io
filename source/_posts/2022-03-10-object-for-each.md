---
layout: post
title: JS 中的物件迴圈手法
category: development
tagline:
tags: [javascript]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fjs_object_to_array.png?alt=media&token=7e288673-74ee-44cc-afc6-25544cd384e8
published: true
---

陣列本身具有非常多好用的迴圈方法，如：`forEach`、`map`、`reduce`、`find`...，這些方法有助於處理各種陣列的資料。

但實戰中，不一定所有的資料格式都會是使用陣列，尤其是從後端 API 串接的資料或是各種第三方資源，就有可能是使用物件的方式提供，此時就無法使用上述的各種陣列手法。

以下方的資料為例，如果直接使用 forEach 等各種陣列手法則會出現錯誤。
```js
const people = {
  '001': {
    name: 'Casper',
    like: '鍋燒意麵',
    age: 18,
  },
  '002': {
    name: 'Wang',
    like: '炒麵',
    age: 24,
  },
  '004': {
    name: '滷蛋',
    like: '蘿蔔泥',
    age: 3,
  },
};
```

物件本身並不具有 forEach 的方法，所以會出現錯誤。
```js
// TypeError: people.forEach is not a function
people.forEach(item => {
  console.log(item);
});
```

## 直接將物件轉為陣列格式
過去，通常會使用 `for...in` 的方式列舉物件內所有的資料，但此手法不僅寫法複雜且可能會出現額外的錯誤，必須額外加上更多判斷才能解決問題，最常見的就是加入（[`hasOwnProperty()`](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty#%E9%81%8D%E6%AD%B7%E7%89%A9%E4%BB%B6%E7%9A%84%E5%B1%AC%E6%80%A7)）避免列舉到不必要的值。

因此，要對物件使用陣列方法，更快的方式是將物件轉為陣列，在 ES6 的語法中就提供了三種物件轉陣列的形式：

- Object.values
- Object.keys
- Object.entries

### 最快的手法 Object.values

` Object.values()` 可以直接傳入一個物件，並**將傳入的物件直接轉為陣列的形式**。

以此範例來說，`Object.values(people)` 會把 `people` 物件轉為純陣列，因此會得到以下的結果。
![`Object.values(people)` 會把 `people` 物件轉為純陣列](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F1F8A943F-237B-4F47-8690-C6869DA340B5.png?alt=media&token=dfe8939a-5931-450b-a2e7-7d9331d8bea9)

```js
//  Object.values(people)

[{
  name: 'Casper',
  like: '鍋燒意麵',
  age: 18,
}, {...}, {...}, {...}]
```

轉為陣列以後，自然可以搭配各種陣列語法來進行運作。寫起來的語法如下，看起來就像純陣列的迴圈一樣，只不過前方增加了 `Object.values`。
```js
Object.values(people).forEach((item) => {
  console.log(item); // { name: 'Casper', ... }
});
```

![Object.values(...).forEach 的陣列手法](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F293D8102-CCBE-4526-9A67-CCA8C9CB7515.png?alt=media&token=6b1e9cf0-903d-4d8f-8146-5f7b3bd08641)

而此語法的缺點在於：無法取得物件 `key` 值，在範例中的 `001`、`002` 等 key 值就無法被取得，當需要取得 key 值時你可以參考以下兩種語法。

#### Object.keys

`Object.keys()` 可以直接傳入一個物件，並將其 key 值以陣列的方式呈現。

![`Object.keys()` 可以直接傳入一個物件，並將其 key 值以陣列的方式呈現](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FC43702E0-09B6-486F-B1E2-3582F1A48CF5.png?alt=media&token=6a8331f4-c5b9-41ca-b4bc-d597fa7fba03)

概念與 values 相近，不過也顧名思義是取得 key 值所用，因此所產生的陣列也僅會有 key 值，搭配 `forEach` 等迴圈手法時也僅會有 key 值，範例如下：

```js
Object.keys(people).forEach((key) => {
  console.log(key); // 001, 002, 003
  console.log(people[key]); // { name: 'Casper', ... }
});
```

不過雖說僅有取出 key 值，但在 JavaScript 中有 key 後再取得 value 也不是困難事，可以直接使用 `object[key]` 的方式直接取回物件內的 value。

#### Object.entries

`Object.entries()` 可以直接傳入一個物件，並將 key 與 value 以陣列的方式呈現。

算是前兩種的混合版，產生的新陣列中同時會包含 key 以及 value，結構為 `[key, value]`，以此範例搭配 `Object.entries(people)` 結果如下：

![`Object.entries()` 可以直接傳入一個物件，並將 key 與 value 以陣列的方式呈現。](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F386AC993-FC3B-4B8B-BBC6-2B1C0E526FD1.png?alt=media&token=af93bc65-cf6b-4365-806d-ffdd2439d4fe)

這個方式同時取得了 key 與 value，但因為產生的新結構會另外用一層陣列組成，所以語法相較前面的來說會更複雜一些。
```js
Object.entries(people).forEach((obj) => {
  console.log(obj); // ['001', {...}]
  console.log(obj[0], obj[1]); // '001', {...}
});
```

## 結語
這幾個在實戰中都是非常好用的語法，用過以後也不會想再回去寫 `for...in` 的結構，三個語法實戰中也僅需要記得兩種即可，使用的判斷如下：

- 不需要取得 key，僅需要 value 的迴圈：那麼請使用 `Object.values` 精簡又方便。
- 需要 key 以及 value 的迴圈：那麼可以使用 `Object.keys`、`Object.entries` 兩者擇其一，都可以符合需求。

而我在實戰中會比較偏向使用 `Object.values` 以及  `Object.keys`，對我來說語法較為單純、好運用。
