---
layout: post
title: AJAX 完整解說系列：基礎觀念
category: development
tagline:
tags: [javascript, js]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_15.jpg?alt=media&token=a02b7412-0768-436f-980f-31baf786a23a
published: true
---

AJAX 全名是「Asynchronous JavaScript and XML」，在網頁上的功能主要是用於網頁前端與後端伺服器溝通的技術，也如同名稱一樣是透過 JavaScript 的非同步技術，在前端工程師中算是一個挑戰門檻，如果沒有此技能則難與不同領域開發者溝通，也因此在前端求職市場中趨近於**基本必備技能**。

相對於其它觀念來說，AJAX 因為需要與後端伺服器介接，許多開發者因為沒有此資源，也找尋不到合適的練習資源，所以難以透過網路文章、自行練習習得此技能，本篇則透過網路免費資源、六角課程資源與大家分享 AJAX 的實戰觀念。

本系列會分成三篇：
- 基礎觀念
- AJAX 到底夾帶了哪些資料
- 實戰除錯

## AJAX 圖解說明
AJAX 網路上的文章非常多，本系列不會過多著墨在程式碼上的說明，主要原因是大多教學都是以 XHR 開始進行教學，對於基礎觀念來說非常不錯，但實戰中基本上不會看到 XHR 的字眼，也不會利用這個語法進行串接，而是依據不同的工具、框架選用合適的 AJAX 非同步套件進行運用。

首先必須知道 AJAX 整體是由哪幾個部分組成的，這幾個角色中絕少不了前端網頁、後端伺服器以及不一定出場的資料庫。在這之中網頁僅需要與伺服器溝通，資料庫會由伺服器搞定，網頁前端可以佔不需要理會資料庫。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FFD0071B6-02B6-4655-8411-318E9D0EB079.png?alt=media&token=dc001ccf-3682-400e-820c-2f3d8f15454d)

除了前後端的實體以外，在進行 AJAX 之前再來認識幾個專有名詞，分別是 API、請求、回應。

#### API 接口：

所有的 AJAX 都會有對應的 API 接口，API 的接口就是一段網址，不同的網址也對應不同的「HTTP 請求方法」（請求方法會在後面的段落進行介紹），**請求方法必須與網址**完全對應才可運作。

> API 接口就如同點餐的櫃檯，依據用戶想要點的品項、餐點選擇不同的櫃檯。

#### 網頁端請求

AJAX 會統一由網頁端發出請求（無論是為了新增資源或取得資源都一律由網頁端發起），依據不同的接口、請求方法進行請求，而伺服器會依據請求的方法、內容來進行回應。

> 請求就如同點餐的顧客，會先說明想要什麼樣的餐點、客製化需求、詢問品項細節等抖。

#### 伺服器回應

當收到請求後，伺服器會依據請求的方法、內容與資料庫取得資源並統整過濾後進行回應。

> 回應是櫃台服務員對於顧客端的回應，如：點餐內容可被接受則加入購物車，如果點餐錯誤則給予顧客適當的回報。

所有的 AJAX 行為都是由網頁端先發出，透過 API 的接口對後端進行請求，而後端會針對請求的內容進行回應，運作上可參考下圖：

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FF28A52EE-54A6-4976-880E-B1141029419B.png?alt=media&token=abcf266f-71fa-4381-8ac9-6a9bf70ee6b1)

## 關於 HTTP 請求方法
所有的 API 都有對應的 HTTP 請求方法（request methods），方法與 API 完全一致時，後端才能依據請求回應資源；反之，方法與 API 無法對應時就會出現錯誤（404 找不到路徑）。

常見的請求方法如下：
- GET：請求特定的資源，不會提交任何資源，伺服器僅會依據條件進行回應。
- POST：提交特定的資源，通常會用來新增資源或是用以改變狀態使用（登入、註冊等等）。 -> 伺服器會回應新增或改變狀態的結果。
- PUT：取代指定的資源，通常用於完整更新。 -> 伺服器會回應更新的結果。
- PATCH：更新指定資源，通常用於部分資源更新。 -> 伺服器會回應更新的結果。
- DELETE：刪除特定的資源。 -> 伺服器會回應刪除的結果。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FDA26DC22-A234-48AC-BDE7-AF2B84BCC5B9.png?alt=media&token=35324e0e-82bb-4c4b-a9a8-97063a27943d)

HTTP 的方法雖然很多，每個方法功能也略有不同，但在此不需要熟記，API 的文件中大多都會詳述可用的方法，僅需要從字面概略了解其用途即可。

## 實際來發送一個請求試試看吧
如同本文一開始所述，AJAX 雖然教學資源很多，但實際可用於練習的環境並不多，而本文章是使用 [jsonplaceholder](https://jsonplaceholder.typicode.com/) 服務進行介紹，此服務有以下特點：

- 具有公開 API 說明文件：https://jsonplaceholder.typicode.com/guide/
- 包含所有常見的 API 及 HTTP 方法（新增、修改、刪除皆有）
- 提供範例程式碼

雖然看似非常完整，但最**美中不足：實際資料無法被更動**（新增、修改、刪除無法作用，僅會回傳成功），所以在練習上會難以體驗到自己資料被寫入資料庫的成就 :(

但就練習上來說，此 API 已經可作為基礎 AJAX 練習使用。

接下來，我們會使用 [axios](https://github.com/axios/axios) 以 Promise 為基礎的 AJAX 套件，因為 AJAX 屬於非同步行為，在 ES6 以後都會建議以 Promise 的語法進行串接，如果對於 Promise 有興趣可參考此 [文章](https://wcc723.github.io/development/2020/02/16/all-new-promise/)。

接下來我們就準備好要發出請求的資源：
- API 來源：https://jsonplaceholder.typicode.com
- axios cdn：`https://cdnjs.cloudflare.com/ajax/libs/axios/0.20.0/axios.min.js`

那麼，就開始著手來發出請求吧。
```js
axios.get('https://jsonplaceholder.typicode.com/posts/1')
  .then((res) => {
    console.log(res);
});
```

寫完惹。

雖然本系列文章很長，但其實 AJAX 複雜的並非是程式碼本身，而是其背後運作的原理，在上述的程式碼中就完整包含了：
- HTTP 請求方法：`get`
- API 路徑：`https://jsonplaceholder.typicode.com/posts/1`
- 伺服器回應：`.then((res) => { /* ... */ })`

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F5E1504B8-B7D0-47BF-8497-9FFDCDE5D65A.png?alt=media&token=9e4fdbd8-1184-4723-8e71-afebb37b540e)

範例程式碼：
https://codepen.io/Wcc723/pen/YzqMpNR?editors=1010

接下來於 Chrome Console 中就能看到回傳的結果，結果展開的內容大致如下：

```
Object >
  config: {url: "https://jsonplaceholder.typicode.com/posts/1", method: "get", headers: {…}, transformRequest: Array(1), transformResponse: Array(1), …}
  data: {userId: 1, id: 1, title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit", body: "quia et suscipit↵suscipit recusandae consequuntur …strum rerum est autem sunt rem eveniet architecto"}
  headers: {cache-control: "max-age=43200", content-type: "application/json; charset=utf-8", expires: "-1", pragma: "no-cache"}
  request: XMLHttpRequest {readyState: 4, timeout: 0, withCredentials: false, upload: XMLHttpRequestUpload, onreadystatechange: ƒ, …}
  status: 200
  statusText: ""
  __proto__: Object
```

已經有了基礎觀念後，接下來要繼續了解更深入 AJAX 觀念，讓我們繼續往下吧～
