---
layout: post
title: JavaScript Console 運用技巧 - 8 招讓你除錯更高效
category: development
tagline:
description: "JavaScript console 運用技巧，精選 8 招讓你除錯更高效，除了 console.log 之外還有 console.table、group、time、assert 等實用語法，提升前端除錯效率。"
tags: [javascript, js]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fjs-console.jpg?alt=media&token=b1bcec59-79cd-4483-be9b-b29fde8f8add
published: true
---

寫 JavaScript 需要檢視運作是否正確時候，都會使用 `console.log`  來檢視輸出或運算的值，而 `console` 的運用技巧不僅僅只有將值呈現在開發的 Console 介面中。本篇就來介紹許多 `console` 語法的實戰運用方法吧！

首先，在此先準備一份等等會用到的物件及陣列作為以下範例使用：
```js
const Ming = {
  name: '小明',
  age: 15,
  favorite: '鍋燒意麵'
}
const Jay = {
  name: '杰倫',
  age: 16,
  favorite: '炒麵'
}
const Auntie = {
  name: '漂亮阿姨',
  age: 21,
  favorite: '蘿蔔糕'
}
const people = [Ming, Jay, Auntie];
```

## 為 console.log 的程式碼上色
有在 Facebook 頁面中開啟過開發者工具嗎？如果有，相信你對於以下這張圖並不陌生。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F6D8AF4B7-FF19-4BFD-89A2-D676B037B58A.png?alt=media&token=6e13d927-8a00-4cab-87a4-162ddc685f7d)

Console 中的文字並非只有固定的色彩，它與網頁中的文字一樣，都可以透過 CSS 的語法來調整其色彩，只要在 `log` 的文字前方先加入 `%c` 後，在 `,` 後方的參數就能夠傳入 CSS 語法做為參數，並且調整 Console 中呈現的文字樣式。

```js
console.log(`%c ${Ming.name} 有瑟瑟的顏色`, 'color: orange; font-size: 24px');
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FF2B60FC3-8DD8-437E-B26C-AD1C7E89051F.png?alt=media&token=dd412a3b-c7a4-4850-999a-118a90fd93a9)

## console.table()：使用表格的方式陳列陣列的資訊

當要呈現資料於 Console 介面中，做常見的方式就是使用 log 的方法：
```js
'😴 基本用法'
console.log(Ming);
console.log(Jay);
console.log(Auntie);

console.log(people);
```

當然，這樣的用法絕對沒有問題，透過此方法可以將值一一陳列出來，不過當這些數值是 “具有關聯性” 時，一般的 log 就無法比較兩者之間的關係。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FE2E0CFC5-492E-4ADD-AEFB-3269B58D445A.png?alt=media&token=ce87d1a9-6c38-4ee0-9753-66e749d71672)

`console.table()` 針對物件之間有相同的屬性名稱時，就能夠輕易的比較相同屬性之間的關係。
```js
console.table([Ming, Jay, Auntie]);
console.table(people);
```
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F3FCC79BD-FB26-44C2-8779-4B90727D4A9A.png?alt=media&token=11654b5b-927f-4511-ab6a-a3320dd8cd43)

除此之外，表格上方的標頭還可以點選作為排序使用，如果拿到一個 JSON 想比對其中的值，還要轉貼到 Excel 或是 `sort()` 語法安排，不如直接改用 `table()` 進行比較吧。

{% raw %}
<video width="100%" controls autoplay loop>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FSep-14-2021%2014-34-38.mp4?alt=media&token=93bc70be-ace0-4e4b-9e47-bb7f44d58845" type="video/mp4">
Your browser does not support the video tag.
</video>
{% endraw %}

## console.group()：群組化大量的 log 資訊

使用 `log()` 觀看迴圈值是合情合理的，不過當陣列的長度有上百筆時，Console 介面中的資料還真會滾到令人厭世。

```js
for (let index = 0; index < people.length; index++) {
  const element = people[index];
  console.log(element);
}
```

![在迴圈中使用 `console.log()` 會一一呈現資料，數量一多看起來就會顯的很吃力](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F5F812183-317D-4FB4-B26A-1E7963B1AD64.png?alt=media&token=630dd86e-ad87-46a3-bd2e-9399434bc974)
> 在迴圈中使用 `console.log()` 會一一呈現資料，數量一多看起來就會顯的很吃力

使用 `console.group()`、`console.groupEnd()` 設置群組的起訖，在 Console 的介面中就能方便的收合群組內容。

```js
console.group('迴圈群組');
for (let index = 0; index < people.length; index++) {
  const element = people[index];
  console.log(element);
}
console.groupEnd();
```

`console.group(/* 群組名稱 */)`可以傳入 “群組名稱” 做為參數，作為在 Console 介面中辨識群組的顯示名稱，在介面中的群組名稱也會以粗體名稱，並且可以點擊箭頭符號收合群組內容。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F3D7FBA6B-EA9E-480A-A8FF-4837FC1AAA23.png?alt=media&token=1ea045e1-f1a4-4b96-9894-fe1f7da5fc09)

## console.time()：開發者最愛斤斤計較那 1ms 的效能了
每當寫出神邏輯的時候，都會擔心電腦效能跟不上自己的思維，這時候就可以使用 `time()` 追蹤片段程式碼所處理的時間差，得知自己是不是該換台電腦解決問題。

```js
'🤩 時間追蹤';
console.time('迴圈處理時間');
for (let index = 0; index < people.length; index++) {
  const element = people[index];
  console.log(element);
}
console.timeEnd('迴圈處理時間');
```

在起訖中分別加入 `time()` 以及 `timeEnd()`，執行程式碼後就可以獲得處理的結果。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FD653C44C-A9D8-4C39-AF75-CE065F407C69.png?alt=media&token=f09c1870-465c-497f-af8f-c8f5f70aebeb)

## console.dir()：以物件的形式呈現資料

```js
// HTML <p>推薦的 Console 語法</p>
const p = document.querySelector('p');
console.log(p);
```

當使用 `console.log()` 查看 DOM 元素，並想了解其中可用的方法或屬性時...，它可能會出現如下帶點失望的標籤，並且心裡默罵：
- 要這個幹嘛啦
- 要知道的是物件屬性、屬性！

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FCCE9EDA4-971D-4271-8B45-11FEC5ED0755.png?alt=media&token=cf5f787f-42b9-493a-8b50-c20ba76e0551)

這時候需要的是 `console.dir()`，你會發現另一個新世界，原本的 DOM 元素被改為物件的形式呈現，你可以輕鬆展開此物件，並檢視裡面有哪些可用屬性。

```js
const p = document.querySelector('p');
console.dir(p);
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FA11E8437-85F7-49EB-8F96-04BF727A4308.png?alt=media&token=61e21623-8f2b-447a-b872-b1d9125d66dd)
> 展開的 P 元素，包含其中所有的屬性（這在操作 DOM 時極為好用）


## console.error()
寫程式有錯誤是難免的，但是如果是錯誤，卻沒有明確的提示導致沒有被發現問題，就失去提示的意義了，如果想讓 Console 的內容更加醒目，可以使用 `console.error()` 使訊息在 Console 介面中以錯誤的形式呈現。


```js
console.error(`${Ming.name} 你完蛋了`);
```

當運用在一般文字訊息上時，也可以展開訊息並說明錯誤來源自哪一段程式碼。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FD738C899-B567-4F8C-9A12-18CFA6E59056.png?alt=media&token=5b465333-ffbe-442d-9759-9fc3d12fedef)

在 AJAX 的未確認狀態中，也會使用 `console.error` 來呈現錯誤的回饋訊息，以下範例刻意將 API 路徑調整成錯誤的，並透過 `console.error()` 來將錯誤的資訊呈現在 Console 介面中

```js
'🤩 Error';
axios.get('https://randomuser.me/apis')
  .then((res) => console.log(res))
  .catch((error) => {
    console.error('待誌大條啦: ', error.response)
  })
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FFFA221BB-01DB-429D-AC26-9C8477D1610C.png?alt=media&token=64a50e79-5606-48c8-82db-44a62a39c35c)

## console.warn()
錯誤太突兀了嗎？如果是自行開發的函式庫，已經透過各種形式避免程式碼出錯，但還是想把有錯誤的訊息給予開發者知道，那麼則可以使用 `console.warn()`。

```js
'🤩 Warning';
/***
 * 超精美函式庫 💖
 * @param {number} num 純數值
 * @param {string} text 請傳入字串
 */
function superMagicLibrary(num, text) {
  if (typeof num !== 'number') {
    console.warn('尊重一下好嗎，請傳入純數值')
  }
}
superMagicLibrary('字串');
```

函式庫中大多會避免已知的錯誤，如果要友善的給予回饋，可以使用 `warn()` 代替 `error()` 提醒開發者更好的做法 :D。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FEB1B67D5-40A3-4B1B-BFF2-1BE505EEACC2.png?alt=media&token=984dbd55-0eaa-4645-aaed-73841e4fb4d3)

## console.clear()
如果覺得 Console 介面已經充滿了許多不必要的資訊，想要專注於當前開發的程式碼，那麼可以加入 `console.clear()`。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FABBCB95A-552B-43E7-8B7E-6EB30103C24C.png?alt=media&token=c6f81fec-ab28-4c2c-b1bf-ac4bf3aae174)
> 畫面中會出現 Console was cleared 的字眼

此語法亦可在 Console 介面中直接輸入，會直接清除當下的所有資訊內容。

{% raw %}
<video width="100%" controls autoplay loop>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FSep-14-2021%2015-19-27.mp4?alt=media&token=596fce33-240c-4064-87ac-0ddcf468c723 " type="video/mp4">
Your browser does not support the video tag.
</video>
{% endraw %}

不過請慎用此方法，如果隨意插入 `console.clear()` 在不同的檔案中，不知情的夥伴一定會在開發中卡很久，可能發生的情境有...：
- 奇怪，我寫的 Code 怎麼都沒顯示在 Console
- 編譯器壞了嗎？怎麼好像沒有運作
- 我的 Chrome 怪怪的

還有哪些方法你也常用，但沒有介紹到的呢？歡迎在底下留言區留言喔 :D