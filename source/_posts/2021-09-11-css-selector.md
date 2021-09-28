---
layout: post
title: CSS 選取器(基本篇) - CSS Selector
category: development
tagline:
tags: [css]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FCSS%20selector.jpg?alt=media&token=9345fc59-a36d-460b-a31e-df14caf9ec68
published: true
---

一個開發者對於畫面的掌控度高不高，完全都可以取決於「CSS 選取器」掌握度，無論是基本的 CSS 到 jQuery 甚至是原生的 JavaScript 都是使用 CSS 選取器。另外如果要寫道後端測試、爬蟲，也是持續使用這看似基礎的觀念，本篇將會循序漸進介紹各種選取器，讓大家從基礎開始學習此知識。

- [元素選取器](#元素選取器)
- [類別選取](#類別選取)
- [id 選取](#id-選取)
- [屬性選取](#屬性選取)

而選取器是選取 HTML 元素的語法，它並不會限制只運用在 CSS 上（雖然普遍稱為 CSS Selector）。

## 元素選取器

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F7118EFAC-F7D3-4595-B5B7-0D7C6A088ADA.png?alt=media&token=c6192f79-9dc6-4a22-94d4-9f324e1919f8)

最基本的 HTML 標籤選取，可以直接選取畫面上所有 “同類型的元素”，屬於比較廣泛的選取器。

以下範例來說就直接選取了 `a` 標籤，並將它改為了紅色。

{% raw %}
<div class="demo demo-1">
  <a href="https://www.apple.com/" target="_blank">這是 Apple 官網連結</a>
</div>
<style>
.demo-1 a {
  background-color: red;
}
</style>
{% endraw %}
```
<a href="https://www.apple.com/" target="_blank">這是 Apple 官網連結</a>
```
```css
a {
  background-color: red;
}
```

### 元素選取 - 實戰說明

因為它是屬於廣泛的選取器，雖然可一次選擇非常大量的元素；雖然這是優點但也同時是缺點，大量的選取可能會影響到其它不需要被選取的項目，為了避免影響後續維護或開發，此選取器大多都是利用在：
- 開頭的 CSS Reset，範例：[https://meyerweb.com/eric/tools/css/reset/](https://meyerweb.com/eric/tools/css/reset/)
- 限定範圍的標籤，例如：部落格主要文章中的段落 p 標籤

## 類別選取

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F3A36399C-C888-4B07-A092-B95A2DBE18F2.png?alt=media&token=70f0c3de-01a7-42a5-a23d-6cd1a1a41b4b)

類別選取是樣式套用 “最實用” 的選取器，它具有以下的特性：
- 可重複利用（套用在多個標籤上）
- 可重複套用（可多個類別套用在同一個標籤上）
- 適當的權重

以下建立了 `.a-link` 的類別，並套用在 a 標籤上使其背景色調整為黃色。

{% raw %}
<div class="demo demo-1">
  <a href="https://www.apple.com/"
  class="a-link" target="_blank">這是 Apple 官網連結</a>
</div>
<style>
.demo-1 .a-link {
  background-color: yellow;
}
</style>
{% endraw %}
```
<a href="https://www.apple.com/"
  class="a-link" target="_blank">這是 Apple 官網連結</a>
```
```css
.a-link {
  background-color: yellow;
}
```

### 類別選取 - 多個類別重複套用

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FEBF18CCF-5032-45C5-84FD-D5FF3794AF77.png?alt=media&token=76354e36-5297-4563-9be8-9de0d47c8819)

類別選取兩個特性：
- 可重複利用（套用在多個標籤上）
- 可重複套用（可多個類別套用在同一個標籤上）

其中的 **“可重複套用”** 是許多新手會忽略的用法，使用方式就是定義兩個樣式並套用在同一個元素上。

{% raw %}
<div class="demo demo-1">
  <a href="https://www.apple.com/"
  class="a-link a-link-color" target="_blank">這是 Apple 官網連結</a>
</div>
<style>
.demo-1 .a-link {
  background-color: yellow;
}
.demo-1  .a-link-color {
  color: black;
}
</style>
{% endraw %}
```
<a href="https://www.apple.com/"
  class="a-link a-link-color" target="_blank">這是 Apple 官網連結</a>
```
```css
.a-link {
  background-color: yellow;
}
.a-link-color {
  color: black;
}
```

### 類別選取 - 實戰說明

它具有非常多的優勢，讓許多框架、設計模式都是基於 class 為基礎進行設計，例如：
- OOCSS 的設計模式，[參考文](/css/2016/12/02/oocss-one/)
- [Bootstrap 最流行的前端開發工具](https://bootstrap5.hexschool.com/)
- [以 Utilities 為單位的 CSS 框架](https://tailwindcss.com/)

所以運用上請把握一個原則，這是 CSS 樣式表運用 “最為廣泛的選取器”（沒有之一），如果是作為樣式使用：
- 請使用 class 取代 id
- 如果可以套用 class 時，請不要直接使用元素或其它選取器

## ID 選取

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F5D7ACD60-0847-4D09-9BB3-7BC5A2D6AA88.png?alt=media&token=ae2346b0-c5d1-4818-b956-697eb2dea164)

在一個 HTML 頁面中原則上僅會有一個 id，如果出現兩個以上時，部分瀏覽器則會跳出錯誤的提示，建議調整頁面上重複定義 id 的元素。

Id 選取在應用上特性：
- 具有唯一性：畫面上僅會有一個該名稱 id
- 較高的樣式權重：如果與 class 的樣式有衝突時，會以 id 為主

以下範例就選取了 id `a-link`，要特別注意一個 id 在頁面中原則上只會有一個。

{% raw %}
<div class="demo">
  <a href="https://www.apple.com/"
  id="a-link" class="b-link" target="_blank">這是 Apple 官網連結</a>
</div>
<style>
#a-link {
  background-color: pink;
}
.b-link {
  background: blue;
}
</style>
{% endraw %}
```
<a href="https://www.apple.com/"
  id="a-link" class="b-link" target="_blank">這是 Apple 官網連結</a>
```
```css
#a-link {
  background-color: pink;
}
.b-link {
  background: blue;
}
```

### id 選取 - 實戰說明

它具有高權重、不可重複、頁面唯一的特性，讓樣式無法多次的運用，並且可能造成管理上的問題；因此，實戰開發中不會使用 “id 選取器” 作為樣式的選取（注意：千萬不要這麼做）。

不過這樣的特性卻很適合作為樣式以外的用途，例如：

- input 與 label 標籤的對應
- 頁面元素的絕對選取（頁面上只會有一個），在 JS、後端爬蟲、測試中相當好用


## 屬性選取

相對於以上的選取器來說，這是相對少見但也是更為靈活的選取器，無論在樣式或任何情境都相當好用，在受到限制的情境中常常會有意想不到的用途，例如：

- 標籤的屬性必須為特定屬性值，如：`<input type="checkbox">`
- HTML 的結構已經確立無法改變時，如：已經完成頁面，需要進行爬蟲或測試使用

屬性選取可運用的組合也相當多樣，基本上只要 HTML 元素中有任何一些不同，都可作為屬性選取器的選取方式。

以下將一一的介紹屬性選取的各種手法：
- 包含特定 “屬性” 的選取
- “屬性及值” 完全符合
- 屬性值 “包含特定字串”
- ”結尾值“ 包含特定文字
- 屬性選取 實戰操作

### 包含特定 “屬性” 的選取

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F809CDD6D-B836-4C33-B62F-9D094A5E2FC8.png?alt=media&token=b396eea0-c808-4db7-b7bb-68ca83bbfb62)

只要元素中包含特定「屬性」皆可選取，以下範例來說其中一個 `a` 標籤缺少了 href 屬性，因此將不會被套用紅色的樣式，所以此方法也可以過濾出標籤中是否有正確包含特定屬性。

{% raw %}
<div class="demo demo-2">
  <a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="https://www.google.com/"
    target="_blank">Google</a> <br>
  <a target="_blank">連結缺少 href</a>
</div>
<style>
.demo-2 [href] {
  color: red;
}
</style>
{% endraw %}
```
<a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a>
<a href="https://www.google.com/"
  target="_blank">Google</a>
<a target="_blank">連結缺少 href</a>
```
```css
[href] {
  color: red;
}
```

### “屬性及值” 完全符合

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F12911289-C59A-413D-A5C7-A9AD8222F617.png?alt=media&token=88127141-9559-4c45-b506-e1e4a9d9fdfb)

接下來就是屬性選取慢慢進入進階的流程，當屬性內的值完全符合時，可以選取此元素。

{% raw %}
<div class="demo demo-3">
  <a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="https://www.google.com/"
    target="_blank">Google</a> <br>
</div>
<style>
.demo-3 [href="https://www.apple.com/"] {
  color: red;
}
</style>
{% endraw %}
```
<a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a>
<a href="https://www.google.com/"
  target="_blank">Google</a>
```
```css
[href="https://www.apple.com/"] {
  color: red;
}
```

### 屬性值 ”包含特定字串“

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FCD57EDCE-5210-4797-8B5A-A779BE652475.png?alt=media&token=c66fc8be-e9c0-4fd3-b088-7bddcd5a4e8d)

”包含特定字串“ 開始的運用變化就越來越多，以此範例就可以判斷標籤內的連結目標為何。

{% raw %}
<div class="demo demo-4">
  <a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="https://www.google.com/"
    target="_blank">Google</a> <br>
</div>
<style>
.demo-4 [href*="google"] {
  color: red;
}
</style>
{% endraw %}
```
<a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a>
<a href="https://www.google.com/"
  target="_blank">Google</a>
```
```css
[href*="google"] {
  color: red;
}
```

### “開頭值” 包含特定文字

除了判斷部分字詞以外，還可以從前到後、前後至前的選取形式。

{% raw %}
<div class="demo demo-5">
  <a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="http://www.google.com/"
    target="_blank">Google</a> <br>
</div>
<style>
.demo-5 [href^="https"] {
  color: red;
}
</style>
{% endraw %}
```
<a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a>
<a href="http://www.google.com/"
  target="_blank">Google</a>
```
```css
[href^="https"] {
  color: red;
}
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F53C089A7-B9F7-4C83-8107-D40AF1E847C8.png?alt=media&token=da563dce-51d4-42f2-9f4f-60504f694c84)

### ”結尾值“ 包含特定文字

此範例為結尾值的選取形式，就可以進行從後至前的選取。

{% raw %}
<div class="demo demo-6">
  <a href="https://www.apple.com/tw/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="http://www.google.com/"
    target="_blank">Google</a> <br>
</div>
<style>
.demo-6 [href$="/tw/"] {
  color: red;
}
</style>
{% endraw %}
```
<a href="https://www.apple.com/tw/"
  target="_blank">Apple 官網連結</a>
<a href="http://www.google.com/"
  target="_blank">Google</a>
```
```css
[href$="/tw/"] {
  color: red;
}
```

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FD49F67AA-F8FE-4699-8D4E-09E1D07EEA79.png?alt=media&token=8b3b9dad-4c75-4285-9523-096519a7b6de)

### 屬性選取 實戰操作

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F8542C4C0-1FA9-498E-B27F-FABD49AEC74B.png?alt=media&token=e7fec286-39d1-4a5c-abe7-2c8912597efc)

屬性選取在實戰中應用非常廣，最常見的案例之一就是判斷 input 的 type 類行為和，透過此方式避免選取到錯誤類型的 input（如果把 input 樣式套用在 checkbox 上就會顯得非常不適切）。

{% raw %}
<div class="demo demo-7">
  <input type="checkbox">
</div>
<style>
.demo-7 input[type="checkbox"] {
  appearance: none;
  border: 1px solid red;
  width: 1rem;
  height: 1rem;
}
.demo-7 input[type="checkbox"]:checked {
  background: red;
}
</style>
{% endraw %}
```
<input type="checkbox">
```
```css
input[type="checkbox"] {
  appearance: none;
  border: 1px solid red;
  width: 1rem;
  height: 1rem;
}
input[type="checkbox"]:checked {
  background: red;
}
```

除此之外，CSS 的選取方式不限制僅能使用 CSS，因此無論是 jQuery、JavaScript 都可以使用此方式進行選取，以上述範例中的連結選取，都可以改用 JS 來進行處理，在現實的開發中就可以用來：

- 當開發受到限制，不可調整 HTML 原始碼時，可使用 JS 置換內容
- Node.js 爬蟲開發
- Chrome 插件（擷取網頁內的資訊）

## CSS Selector 實戰練習

最後，提供一個練習題目讓大家動手試試看，透過下方的 input 輸入選取器語法，試著選擇以下卡片中的特定元素吧！（被選取的元素會以紅色外框呈現）

挑戰題目：

1. 選取 https 開頭的 a 標籤
2. 選取 /tw 結尾的 a 標籤
2. 選取左邊的圖片
3. 同時選取 input 及 textarea
4. 僅選取 checkbox
5. 選取 textarea 對應的 label

這些題目，你可以完成幾題呢？

{% raw %}
<div class="demo">
  <div class="mb-3">
    <label for="selectorPractice">輸入你認為正確的 Selector</label>
    <input type="input" id="selectorPractice" class="form-control"
    value=".list-group-item">
  </div>
  <pre id="preBlock">
  </pre>
  <div id="demo">
    <div class="card border">
      <div class="card-img-top overflow-hidden">
        <div class="row row-cols-2 gx-0">
          <div class="card-bg" style="background-image: url('https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8YXBwbGV8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=60')"></div>
          <div class="card-bg" style="background-image: url('https://images.unsplash.com/photo-1587883012610-e3df17d41270?ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8cGluZWFwcGxlfGVufDB8fDB8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60')"></div>
        </div>
      </div>
      <div class="list-group list-group-flush">
        <a href="http://www.facebook.com/" class="list-group-item list-group-item-action">Facebook</a>
        <a href="https://www.google.com/" class="list-group-item list-group-item-action">Google</a>
        <a href="https://www.apple.com/tw/" class="list-group-item list-group-item-action">Apple</a>
      </div>
      <div class="card-body">
        <div class="mb-3">
          <label for="exampleFormControlInput1" class="form-label">Email address</label>
          <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
        </div>
        <div class="mb-3">
          <label for="exampleFormControlTextarea1" class="form-label">Example textarea</label>
          <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="radio" value="" id="flexCheckDefault">
          <label class="form-check-label" for="flexCheckDefault">
            Checkbox
          </label>
        </div>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="" id="flexCheckChecked">
          <label class="form-check-label" for="flexCheckChecked">
            Radio
          </label>
        </div>
      </div>
    </div>
  </div>
</div>
<style>
  .outline {
    outline: solid red 2px;
  }
  .card-bg {
    height: 200px;
    background-position: center center;
    background-size: cover;
  }
</style>
<script>
  const selectorPractice = document.querySelector('#selectorPractice');
  const preBlock = document.querySelector('#preBlock');
  let preDom = [];
  selectorPractice.addEventListener('keyup', selectorFn);
  function selectorFn() {
    const value = selectorPractice.value;
    const selectDom = document.querySelectorAll(`#demo ${value}`);
    preBlock.textContent = `document.querySelectorAll(${value});`;
    if (selectDom) {
      if (preDom) {
        console.log(preDom);
        preDom.forEach(element => {
          element.classList.remove('outline');
        })
      }
      selectDom.forEach(element => {
        element.classList.add('outline');
      });
      preDom = selectDom;
    }
  }
  selectorFn();
</script>
{% endraw %}
