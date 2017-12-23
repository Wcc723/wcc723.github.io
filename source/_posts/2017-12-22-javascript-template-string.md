---
layout: post
title: 鐵人賽：JavaScript Template String 樣板字串
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_19.png?alt=media&token=ba14bb6d-cb7d-4409-83b7-7ad890cadb48
published: true
---

在過去我們撰寫字串的時候都是使用 `"` ，這種寫法會讓程式碼變得很攏長且難以閱讀，再多行的時候也必須插入反斜線來換行。

```js
const people = [
  {
    name: '小明',
    friends: 2
  },
  {
    name: '阿姨',
    friends: 999
  },
  {
    name: '杰倫',
    friends: 0
  }
]

let originString = '我叫做 ' + people[0].name; // 過去的寫法
let originUl = '<ul>\
  <li>我叫做 ' + people[0].name + '</li>\
  <li>我叫做 ' + people[1].name + '</li>\
  <li>我叫做 ' + people[2].name + '</li>\
</ul>'; // 多行的寫法 
```

ES6 借鏡了許多開發工具 (這種寫法真的很像 `CoffeeScript`，不過在這語言是使用 `"` + `#{}` 插入變數)，可以使用 反引號 來插入一段字串，並且可以使用 `${}` 來加入變數或函式，如以下範例可以直接輸入字串，並且使用 `${people[0].name}` 來插入變數，省去一堆 `+`來做串接。

```js
let string = `我叫做 ${people[0].name}` // ES6 String Template
// "我叫做 小明"
```

再多行的時候也是直接撰寫即可，不需要額外的符號。

```js
let ul = `
  <ul>
    <li>我叫做 ${people[0].name}</li>
    <li>我叫做 ${people[1].name}</li>
    <li>我叫做 ${people[2].name}</li>
  </ul>
`
// "
//   <ul>
//     <li>我叫做 小明</li>
//     <li>我叫做 阿姨</li>
//     <li>我叫做 杰倫</li>
//   </ul>
// "
```

甚至可以在 `${}` 內使用函式 (函式內可在使用 Template String)。不過這裡特別注意，單行的箭頭函式會自動 `return`，所以在這裡是省略了 `return`。
```js
let ul2 = `
  <ul>
    ${people.map(person => `<li>我叫做 ${person.name}</li>`).join('')}
  </ul>
`
```

也可以在函式內增添更多的判斷式。
```js
let ul2 = `
  <ul>
    ${people.map((person) => {
        if (person.friends) {
          return `<li>${person.name} 有 ${person.friends} 朋友</li>`
        } else {
          return `<li>${person.name} 邊緣人</li>`
        }
      }).join('')
    }
  </ul>
`
// "
//   <ul>
//     <li>小明 有 2 朋友</li><li>阿姨 有 999 朋友</li><li>杰倫 邊緣人</li>
//   </ul>
// "
```

## 巢狀 String Template

如同上述的方法 `${}` 內可以加入函式及其更內層的 Template String，所以也可以在 `${}` 插入另一組的函式的 Template String。

```js
const travelers = {
  leader: '老媽',
  partner: people
}

function renderList(people) {
  return `
    <div>上車名單</div>
    <ul>
      ${people.map(person => `<li>${person.name}</li>`).join('')}
    </ul>
  `
}

let template = `
  <div class="template">
  <h2>導遊：${travelers.leader}</h2>
  ${renderList(travelers.partner)}
  </div>
`

// "
//   <div class="template">
//   <h2>導遊：老媽</h2>
  
//     <div>上車名單</div>
//     <ul>
//       <li>小明</li><li>阿姨</li><li>杰倫</li>
//     </ul>
  
//   </div>
// "
```

## 跳脫字元

如果有需要插入特殊字元，一樣可以使用 `\` 反斜線來插入：

```js
console.log(`\\`);
```

如果要計算字元數，或是需要將字串做額外處理，跳脫字元是不佔字符數的：

```js
console.log(`\\`.length); // 1
```

要取得含特殊字元的字串可用 `String.raw()`：

```js
console.log(String.raw`\\`.length)
```

ES6 就是加入了這些好用的功能，讓 JavaScript 在撰寫時變得更容易、快速、易讀，使得用過的人都回不去了 T_T。