---
layout: post
title: 鐵人賽：ES6 原生 Fetch 遠端資料方法
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F18_ironman_cover_25.jpg?alt=media&token=ade86e74-35c4-480e-a684-79e7c9b16e9a
published: true
---

如果不透過框架，要如何寫出一個 GET 請求呢？在 JavaScript 中可以使用 `XMLHttpRequest` 的方法，但其實我平常也不太會這樣寫，主要原因也是難以閱讀及撰寫，我們大多都會使用框架來處理這段，如 jQuery, Axios...，以下略為介紹如何製作一個原生的 GET 請求：

本篇使用的是 `https://randomuser.me/` 隨機用戶產生器，這很適合用來作為 AJAX Get 的範例。 

```js
function reqOnload () {
  const data = JSON.parse(this.responseText);
  console.log(data)
}

function reqError (err) {
  console.log('錯誤', err)
}

// 宣告一個 XHR 的物件
var Req = new XMLHttpRequest(); 
// 定義連線方式
Req.open('get', 'https://randomuser.me/api/', true);
// 送出請求
Req.send();
// 如果成功就執行 reqOnload()
Req.onload = reqOnload; 
// 失敗就 reqError()
Req.onerror = reqError;
```

當然，在框架的時代我們已經習慣透過框架包裝以上的行為，讓程式碼的更為容易使用及閱讀，以 `randomuser` 網站所提供的範例來說，以上的行為可以寫成以下 (錯誤方法可參考 jQuery 文件)，不需要在另外自己包裝發送的物件。

```js
$.ajax({
  url: 'https://randomuser.me/api/',
  dataType: 'json',
  success: function(data) {
    console.log(data);
    // 取得的遠端資料
  }
});
```

`XMLHttpRequest` 在製作時每次都要新建一個請求的實體，而 AJAX 的網站，通常也不會只做一次請求而已，為了讓程式碼更容易維護及開發，大多開發者都會使用框架來包裝這類行為。

## Fetch

Fetch 在使用時看似與 jQuery `$.ajax` 挺相近的，所以在使用上也相對容易上手，不過兩者亦有不同概念之處(可[參考](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch))。

這裡提供一個簡單的範例來取得遠端的資料，這裡與 $.ajax 不同點在於：

- fetch 會使用 ES6 的 Promise 作回應
	- then 作為下一步
	- catch 作為錯誤回應 (404, 500...)
- 回傳的為 `ReadableStream` 物件，需要使用不同資料類型使用對應方法，才能正確取得資料物件。

```js
fetch('https://randomuser.me/api/', {})
  .then((response) => {
    // 這裡會得到一個 ReadableStream 的物件
    console.log(response);
    // 可以透過 blob(), json(), text() 轉成可用的資訊
    return response.json(); 
  }).then((jsonData) => {
    console.log(jsonData);
  }).catch((err) => {
    console.log('錯誤:', err);
});
```

`fetch` 後方會接 `then()`，這是 Promise 的特性，資料取得後可在 then 裡面接收。`return response.json(); ` 的資料則會傳到下一個 `then()`，至於詳細的 Promise 方法我們會留下一個章節介紹。

這裡如果刻意將網址打錯，會出現以下錯誤訊息。

```js
fetch('https://randomuserkkk.me/api/', {})
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F25102432-129A-45C6-B96D-BECE11E3499B.png?alt=media&token=f75552cf-4cee-4b95-9804-05e5f7a0177f)

### ReadableStream

Fetch API 的 Response 物件中的 body 屬性提供了一個 ReadableStream 的實體，這個階段我們無法直接讀取資料內容，而 ReadableStream 物件中可用以下對應的方法來取得資料 (https://developer.mozilla.org/zh-TW/docs/Web/API/Body)：
- arrayBuffer()
- blob()
- formData()
- json()
- text()

#### text()

像是以上的範例，我們可以將 `response.json()` 改為 `response.text()`，那麼取得的資料格式將會是純字串。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201712%2F390506CF-1E4F-4D86-9D82-C1E76CE997EA.png?alt=media&token=d0200785-8dc3-463c-bb04-79249d565e37)

#### blob()

也可以將資料轉為 `blob` 物件，像是圖片就可以做這樣的轉換 (這裡的圖片並非指圖片路徑，而是圖片檔案本身)。

```js
// unsplash 上的圖片
let url = 'https://images.unsplash.com/photo-1513313778780-9ae4807465f0?auto=format&fit=crop&w=634&q=80'
fetch(url)
  .then((response) => {
    return response.blob();
  })
  .then((imageBlob) => {
    let img = document.createElement('IMG')
    document.querySelector('.newImg').appendChild(img);
    // 將 blog 物件轉為 url
    img.src = URL.createObjectURL(imageBlob);
  })
```
> URL 也是新的 API，可以將 blob 物件轉為網址

{% raw %}
<script>
// unsplash 上的圖片
let url = 'https://images.unsplash.com/photo-1513313778780-9ae4807465f0?auto=format&fit=crop&w=634&q=80'
fetch(url)
  .then((response) => {
    return response.blob();
  })
  .then((imageBlob) => {
    let img = document.createElement('IMG')
    document.querySelector('.newImg').appendChild(img);
    // 將 blog 物件轉為 url
    img.src = URL.createObjectURL(imageBlob);
  })
</script>
<div class="newImg"></div>
{% endraw %}
> 範例圖片，從 Unsplash 上所截取的圖片實體 ~~小明眼中的漂亮阿姨~~

### POST 方法

六角的課程中有提供一個 `POST` 方法的練習(因為想不到哪裡可以測試 POST)，下方的程式碼就可以對測試的機器發送 `POST`，然後接受不同的結果 (這段 `POST` 並不會真的儲存帳密，只會將資料存在伺服器的記憶體，不久後會自動釋放)。

使用 `fetch()` 做  `POST`時，由於它並沒有向一些框架一樣包那麼徹底，所以有些地方還是需要做調整，其中 `body` 所送出的資料必須先轉純字串後才能送出，以下範例就是一個簡單的 `POST`行為。

```js
let url = 'https://hexschool-tutorial.herokuapp.com/api/signup';
fetch(url, {
  method: 'POST',
  // headers 加入 json 格式
  headers: {
    'Content-Type': 'application/json'
  },
  // body 將 json 轉字串送出
  body: JSON.stringify({
    email: 'lovef1232e@hexschool.com',
    password: '12345678'
  })
}).then((response) => {
    return response.json(); 
  }).then((jsonData) => {
    console.log(jsonData);
  }).catch((err) => {
    console.log('錯誤:', err);
})
```

所以這是第 25 篇了(表示庫存已用完)。