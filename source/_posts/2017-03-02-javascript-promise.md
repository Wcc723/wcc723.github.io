---
layout: post
title: Javascript Promise 範例
category: javascript
tagline:
tags: [js, promise,es6 ]
cssdemo:
jsdemo:
thumbnail: 
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/blog%2F201703%2Fblog_cover_201603.png?alt=media&token=06845151-978c-4e96-8d35-56b7ad5fab42
published: true
---

Promise 現在已經被大部分瀏覽器所支援 (IE 以外)，在處理非同步的操作是一大助力，最近在寫 Node.js 也不需要再仰賴其它套件就能夠直接處理非同步問題，以下就提供一個範例來介紹簡單的 Promise 的操作過程。

<!-- more -->

{% raw %}
<p data-height="400" data-theme-id="0" data-slug-hash="qrbKNg" data-default-tab="js" data-user="Wcc723" data-embed-version="2" data-pen-title="ES6 Promise" class="codepen">See the Pen <a href="http://codepen.io/Wcc723/pen/qrbKNg/">ES6 Promise</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
{% endraw %}

```js
(function() {
  let epaAPI = "http://opendata.epa.gov.tw/ws/Data/UV/?$orderby=PublishAgency&$skip=0&$top=1000&format=json&callback=?";
  let errorUrl = "http://opendata.epa.gov.tw/ws/Data/UL/?$orderby=PublishAgency&$skip=0&$top=1000&format=json&callback=?";
  let _DefaultContry = '臺北市';
  
  var getData = (url)=> { // 傳入的 URL
    return new Promise((resolve, reject) => { // return promise
      $.getJSON( url, function(){
        format: "json"
      }).done(function(data) {
        if (data) {
          resolve(data); // 成功後透過 resolve 回傳值
        } else {
          reject('Error');
        }
      }).fail(function() {
        reject('Error');
      });
    });
  }
  
  getData(epaAPI) // 傳入的 url
    .then((data)=>{ // then 接受回傳的值
      console.log(data);
      $.each( data, function( i, item ) {
        console.log(item);
        let list = `<li>${item.SiteName} ${item.PublishTime} ${item.SiteName} ${item.UVI}</li>` 
        //利用item.值，把每一個值取出，並寫成一個html存在list的變數內
        $('.itemlist').append(list);
        //最後把剛剛的html放到表格內
      });
    });
  
  getData(errorUrl) // 傳入錯誤的 url
    .then((data)=>{ // then 接受回傳的值 (錯誤的狀況不會跑這段)
      console.log(data);
    })
    .catch((response)=> { // 錯誤狀態的回傳
      console.log('errorUrl:', response);
    });
  
})();
```

## 說明

### new Promise

`var getData()` 裡面包含非同步的 Ajax，如果直接套用 `getData()` 會無法確實取得資料後再執行其他 function，所以這時候在內部加上 `new Promise()` 確保 Ajax 完成後再回傳資料。
`getData(epaAPI)` 套用時可以傳入 url，在後方的 `.then` 表示任務完成第一段後取得 `resolve()` 內的值，接下來就如同 jQuery Ajax 回傳後得處理方式一樣，。

```js
let list = `<li>${item.SiteName} ${item.PublishTime} ${item.SiteName} ${item.UVI}</li>` 
```

題外話：這一段則是 ES6 中的字串處理方式，用 ` ` 符號框住整個字串，再透過類似 jQuery 的 selector (`${}`) 就能帶入字串中的變數，取代過去使用 `" " + variable + " "` 撰寫起來輕便許多。

### 錯誤回傳

```js
getData(errorUrl) // 傳入錯誤的 url
  .then((data)=>{ // then 接受回傳的值 (錯誤的狀況不會跑這段)
    console.log(data);
  })
  .catch((response)=> { // 錯誤狀態的回傳
    console.log('errorUrl:', response);
  });
```

後面包含另一個 `getData(errorUrl)` 刻意傳入錯誤的連結使其產生錯誤，這時候的 `.then` 沒有辦法接受到資料，後方的 `.catch` 則可以接到由 `reject()` 回傳的訊息。

參考文件：https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Promise/all

