---
layout: post
title: 鐵人賽：ES6 的縮寫概念
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_20.png?alt=media&token=a93a1475-6769-47fc-81d0-57dd63ba0d28
published: true
---

再參加過那麼多次鐵人賽，我自己習慣在週六寫比較簡短的文章，因此本篇也是屬於短文，還要介紹 ES6 偷懶的方法(O)，這讓撰寫 JavaScript 變得更簡化，熟悉這些語法也會讓閱讀性更高 (一開始會有點不習慣啦)，本篇要來介紹一些 ES6 中簡化的 JavaScript 語法。

## 物件縮寫

在過去相同名稱的物件如果要賦予在另一個屬性上，必須寫成 `屬性: 物件`，這個邏輯很直覺，不過在 ES6 中如果物件名稱與屬性名稱相同時，則不需要寫兩次，可以改成寫一次即可。

```js
let Frieza = '弗利沙'
const GinyuTeam = {
  Ginyu: '基紐',
  Jeice: '吉斯',
  burter: '巴特',
  // ...
}

// 原本寫法
const newTeam = {
  GinyuTeam: GinyuTeam,
  Frieza: Frieza
}

// 縮寫
const newTeam = {
  GinyuTeam,
	Frieza
}
```

這段也很常在 webpack, Node.js 引用外部套件時使用，如果有使用相關工具開發應該會常看到如以下：

```js
import Vue from 'vue'
import App from './App'
import router from './router'
// 將套件由 './App' 路徑載入，並使用 App 這個變數名稱

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
});
// 縮寫方式載入及使用
```

### 物件函式縮寫

`function` 這個詞彙如果使用在物件內，也可以省略 `:function`，省略後的語意是沒有變化的，並沒有轉而使用箭頭函式。

```js
const newTeam = {
  // ...
  showPosture: function () {
    console.log('我們是 基紐特戰隊')
  }
}

const newTeam = {
  // ...
  showPosture () {
    console.log('我們是 基紐特戰隊')
  }
}
```

在各大框架也推薦用此方法來撰寫物件函式，不僅可以少寫一些，也讓整體閱讀性更高，如以下是 Vue 的範例。

```js
const xxxComponent = {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
```

### 變數作為物件屬性

過去變數會使用 `xxx.` 來定義，而前者本身就是一個字串，無法再轉為變數使用，現在可以直接在宣告變數時使用 `[]`，在 `[]` 內則是變數，當然也可以搭配 Template String 使用。

```js
let prop = 'Ming';
let value = '小明';

let teamMember = {
  [prop]: value,
  [`${prop}_invert`]: value.split("").reverse().join("")
}
console.log(teamMember);
// { Ming: "小明", Ming_invert: "明小" }
```

### 搭配解構使用

解構 `...` 也是 ES6 的新方法，可以執行以下的 `const newTeam`(執行完一次必須重新整理，因為 `const` 不能重新宣告)，會看到兩者的物件結果不太一樣。

```js
const GinyuTeam = {
  Ginyu: {
    name: '基紐'
  },
  Jeice: {
    name: '吉斯'
  },
  burter: { 
    name: '巴特'
  },
  // ...
}

const newTeam = {
  GinyuTeam
}
const newTeam = {
  ...GinyuTeam
}
// newTeam = {
//   Ginyu: { name: "基紐" },
//   Jeice: { name: "吉斯" },
//   burter: { name: "巴特" }
// }
```

到目前介紹的 `let`、`const`、`template string` 及這次的縮寫，在 ES6 都屬於很好上手的部分，不妨找個時間開始試試看這些語法吧 :)。