---
layout: post
title: VSCode JS 註解就是你的文件
category: development
tagline:
tags: [js, bootstrap]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_28.jpg?alt=media&token=6586b8c2-a8df-41a3-bb73-0ac0d344aee3
published: true
---

在使用文字編輯器時，你是否有以下狀況呢？

- 搞不懂，為什麼文字編輯器總是沒跳提示
- 函式庫沒有安裝插件就不知道如何輸入
- 同事或過去自己寫的函式不知道在寫什麼，都要花上許多時間去理解
- 想要為函式補充註解，但不知道如何著手

那麼你可以試著使用 VSCode，強大的 Intellisense 搞定所有函式提示！

## 函式的提示
使用 Sublime Text 或 Atom 時，當載入外部的套件需要加上文字提示時，就需要另外安裝相應的套件；而 VSCode 本身的 Intellisense 就有提供強大的提示功能，不安裝額外套件的情況下就能提供許多的提示。

以 jQuery 來說，只要外部資源載入的情況下，不需要另外安裝其它 jQuery 相關插件就能夠獲得程式碼的提示。

首先，先將 jQuery 載入到網頁內（需要完整版的 jQuery 才能有此功能）。
```html
<script src="https://code.jquery.com/jquery-3.5.1.js"></script>
```

輸入 `$.` 的情況就會列出 jQuery 的所有方法，開發者可以直接使用上下按鍵進行選擇，所有的方法也有提供相對應的說明（如文中是 jQuery 的 `get` 方法，作用是發出 GET 請求）。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_13_%E4%B8%8A%E5%8D%8810_30.png?alt=media&token=176a2ff6-5c30-4ba4-b8f4-8c3416c21986)

`$()` 選取器內，也會提示是需要帶入選取器的表達式。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F639BC304-4A40-4DEC-AB0A-8F6E8D70473A.png?alt=media&token=c2a0406c-5e50-4779-a949-7baf88b02b80)

鏈接的方法在運用上也是沒有問題的，以下選擇一個 DOM 元素後，加入 `.` 也會列出更多相應的方法。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F6AE3F229-595D-4869-A467-BC76FBD52184.png?alt=media&token=82894912-07ea-417f-8dc9-9c3d5bf5ff14)

## 自訂你的文件
既然 jQuery 的提示不安裝套件就能運作，那麼是否自訂的函式也有此功能呢？

當然有的，[官方文件](https://code.visualstudio.com/docs/languages/javascript#_jsdoc-support) 中對此也有完整的說明，介紹該如何自訂屬於自己的提示文件。以下我們就手把手來為函式加入說明文件吧。

以下是 JS 文件的範例，文件的規範可[參考](https://jsdoc.app/)，如果直接看範例可能會不知如何著手，而 VSCode 對此其實有很完整的支援，不需要自行建構這些文件格式。
```js
/**
 * 這是相加的功能
 * 
 * @param {Number} a 數值 1
 * @param {Number} b 數值 2
 * @returns {Number} 相加後的數值
 */
function add(a, b) {
  return a + b;
}
```

首先，需要一段範例程式碼，以下是簡單的相加函式。
```js
function add(a, b) {
  return a + b;
}
```


接下來在函式的前方連續輸入 `/**` 就會直接出現文件的樣板，文件的樣板會自動帶入該函式的參數、回傳欄位，接下來只要專注在文檔撰寫即可。
{% raw %}
<video width="60%" controls autoplay>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FOct-12-2020%2019-49-57.mp4?alt=media&token=353e4293-2eea-41f7-b6cd-dc55c2460fa3 " type="video/mp4">
  <source src="movie.ogg" type="video/ogg">
</video>
 
{% endraw %}

接下來就可在產生的模板中輸入相對應的說明文檔：
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FDDF4AFC6-B82F-4A6F-91D1-901339037897.png?alt=media&token=eb09b988-5b5b-4c1f-a729-db5c66356c32)

撰寫範例，撰寫中 VSCode 也會跳出提示（型別提示），也特別注意此段註解必須相鄰於函式才可運作。
```js
/**
 * 這是相加的功能
 * 
 * @param {Number} a 數值 1
 * @param {Number} b 數值 2
 * @returns 相加後的數值
 */
function add(a, b) {
  return a + b;
}
```

實際演示，在後方程式碼輸入 `add` 則會出現 Intellisense 的提示，提示內容就是剛剛所撰寫的文檔（相信自己寫一次以後，也更能看懂函式庫的文件說明）。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F4FE545B5-8A74-4927-8DE5-5B47EAE15719.png?alt=media&token=edd8fdd6-eec3-4da3-9da4-0c99ffdf0143)

`add()` 括號內也會分別帶出兩個參數的說明。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FBADC8489-D13B-413D-9677-50769E3BC6D1.png?alt=media&token=7017c721-d31a-4aac-ba4f-9003d854cbd3)

`add()` 第二個參數說明。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F57ADB2AF-EEAF-4C5A-9E0F-36F453843FA8.png?alt=media&token=c455a139-1440-436c-9c35-2e44a50e574d)


### import/export 的外部資源也能運作

Intellisense 可以直接偵測與本文件中有哪些相依的檔案，因此外部匯入的檔案依然可運作，以下將程式碼改用 `export default` 的方式進行匯出。
```js
export default {
  /**
   * 這是相加的功能
   *
   * @param {Number} a 數值 1
   * @param {Number} b 數值 2
   * @returns {Number} 相加後的數值
   */
  add(a, b) {
    return a + b;
  },
};
```

接下來在另一個檔案中匯入該檔案，圖片中可看到 Intellisense 的功能可以正常運作。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F27FFD22F-5004-43D2-9B10-B2B5C42E1D0F.png?alt=media&token=a08536d4-9006-4c60-a54d-a73b2bb62688)

## 結語
VSCode Intellisense 的效能優於許多文字編輯器，且不需要安裝套件就可直接載入函式庫的說明，函式庫的方法新增、調整也不用擔心，因為文檔是隨著載入的函式庫進行運作。

除此之外在多人協作時，也可透過註解的形式加入特定函式的說明文檔，讓其他協作的開發者能夠輕鬆上手。
