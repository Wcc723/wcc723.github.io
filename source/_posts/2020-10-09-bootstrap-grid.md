---
layout: post
title: 怎樣也不會失手的 Bootstrap 格線運用技巧
category: development
tagline:
tags: [css, scss, bootstrap]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_24.jpg?alt=media&token=eff1db4b-9fc3-4683-9e84-7794b0c8a58a
published: true
---

{% raw %}
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-4-grid@3.4.0/css/grid.min.css">
<style>
.box {
  height: 100px;
  background-color: #69F0AE;
}
.form-row>.col, .form-row>[class*=col-] {
  padding-right: 5px;
  padding-left: 5px;
}
.form-row {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  margin-right: -5px;
  margin-left: -5px;
}
</style>
{% endraw %}

Bootstrap 令人稱羨的其中之一就是它的格線系統，不僅易用且符合網頁視覺設計概念。雖說如此，在[官網文件](https://getbootstrap.com/docs/4.5/layout/grid/) 落落長的文件還是令許多開發者不知如何快速上手，本篇介紹幾個核心小撇步，讓開發者僅需要記得一個口訣，就能輕鬆上手 Bootstrap 的格線系統。


## Bootstrap 格線設計概念

Bootstrap 設計上都是遵循 OOCSS 的概念（關於 OOCSS 可[參考](https://wcc723.github.io/css/2016/12/02/oocss-one/)），格線在此是套用其中的 **容器與內容** 的概念。格線表示為容器，而網頁所呈現的資訊就稱為內容。

在這個概念下，格線所代表的容器將會決定定位、寬度大小，內容不會有自己的寬度，都是由容器決定

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_8_%E4%B8%8B%E5%8D%881_26.png?alt=media&token=34f514a5-e908-421a-932e-52b57a1f5235)

因此我們先定義一個方塊作為內容，高度 100px、寬度不限，接下來由格線決定的方塊的寬度、位置。

```css
.box {
  height: 100px;
  background-color: #69F0AE;
}
```

{% raw %}
<div class="demo">
  <div class="box"></div>
</div>
{% endraw %}
> 等等會一直看到這個方塊，此**方塊所代表的就是內容**。


## 簡單的口訣

許多開發者再運用 Bootstrap 時會犯了許多錯誤，如：

- 格線內物件與非格線內容無法正確對齊
- 格線的間距不一致
- 產生額外的水平捲軸

引起這些錯誤的問題非常多，一一舉例說明將會佔去許多篇幅，因此請先謹記兩個要點即可：

- .row 的內層必定為 .col
- .col 的外層必定為 .row

#### .row 的內層必定為 .col

Bootstrap 使用 `.row` 作為水平列的定義，它會包覆著不同數量的欄線 `.col`，作為水平列的 `.row` 有包含許多樣式（如：`flex`、負值的 `margin`），這些樣式必須搭配 `.container` 及 `.col` 進行修正。因此，如果在 .row 內置入非 .col 的物件就可能會出錯。

所以第一點，請先記得：**.row 的內層必定為 .col**

###### 正確範例：

`.row` 的內層僅會使用 .col，不會有其它的。
```html
<div class="row">
  <div class="col-6"><div class="box">格線內的 .box </div></div>
  <div class="col-6"><div class="box">格線內的 .box </div></div>
</div>
```

正確的套用情況下，不管有無使用格線，左右邊線的對齊都是一致的。
{% raw %}
<div class="demo">
  <div class="box">沒有套用任何格線的 .box</div>
  <hr>
  <div class="row">
    <div class="col-6"><div class="box">格線內的 .box </div></div>
    <div class="col-6"><div class="box">格線內的 .box </div></div>
  </div>
</div> 
{% endraw %}

###### 錯誤範例

當 `.row` 的內層套用了其它元素，有無套用格線系統的元素左右將無法正確對齊。
```html
<div class="row">
  <div class="box" style="width: 100%">其它的元素會超出格線範圍，並且預設必須加入寬度才能顯示</div>
</div>
```

不正確的套用情況下，`.row` 內的元素無法與外部元素左右邊線對齊。
{% raw %}
<div class="demo">
  <div class="box">沒有套用任何格線的 .box</div>
  <hr>
  <div class="row">
    <div class="box" style="width: 100%">其它的元素會超出格線範圍，並且預設必須加入寬度才能顯示</div>
  </div>
</div> 
{% endraw %}

#### .col 的外層必定為 .row

由於 `.col` 會修正 `.row` 的部分樣式，因此 `.col` 獨立出現時，為了修正 `.row` 的額外 `padding` 就會使得物件無法對齊。

###### 正確範例：

`.col-*` 的外層必定會有 `.row`。
```html
<div class="row">
  <div class="col-12"><div class="box">格線內的 .box </div></div>
</div>
```

無論多少數量的 `.col-*`，只要外層具有 `.row` 就會正確對齊。
{% raw %}
<div class="demo">
  <div class="box">沒有套用任何格線的 .box</div>
  <hr>
  <div class="row">
    <div class="col-12"><div class="box">格線內的 .box </div></div>
  </div>
</div> 
{% endraw %}

###### 錯誤範例：

`.col-*` 必定在 `.row` 的內側，不可獨立出現 
```html
<div class="box">格線內的 .box </div>
<div class="col-12"><div class="box">格線內的 .box </div></div>
```

獨立出現的 `.col-*` 無法與其它元素正確對齊，它會加入額外的 `padding`。
{% raw %}
<div class="demo">
  <div class="box">沒有套用任何格線的 .box</div>
  <hr>
  <div class="col-12"><div class="box">格線內的 .box </div></div>
</div> 
{% endraw %}


## 相同口訣、延伸運用

這兩句話看起來有很多的限制，但其實又具有很高的彈性，像是 `.row` 的內層必定為 `.col`，但只要內層是 `.col` 即可，沒有數量上的限制，並且 .col 的內層並沒有任何的限制。因此本段提供許多不同的變化型給大家做參考。

- .row 的內層必定為 .col
- .col 的外層必定為 .row


##### .row, .form-row

Bootstrap 4 另外有推出 `.form-row` 的選項（[參考文件](https://getbootstrap.com/docs/4.5/components/forms/#form-row)），這會產生間距較小的格線，雖然預設規劃是給予表單使用，但它也同樣很適合用在僅需要小間距的排版。

`.form-row` 一樣可以把它當作是 `.row` 的孿生兄弟，它僅是有較小的間距，其餘的概念都是與 `.row` 完全相同，因此他一樣符合相同的概念，內部僅能有 `.col-*` 的元素。

```html
<div class="demo">
  <div class="row">
    <div class="col-6"><div class="box"></div></div>
    <div class="col-6"><div class="box"></div></div>
  </div>
  <hr>
  <div class="form-row">
    <div class="col-6"><div class="box"></div></div>
    <div class="col-6"><div class="box"></div></div>
  </div>
</div>
```

正確的套用下，左右邊線也是可以完全對齊的。

{% raw %}
<div class="demo">
  <div class="row">
    <div class="col-6"><div class="box"></div></div>
    <div class="col-6"><div class="box"></div></div>
  </div>
  <hr>
  <div class="form-row">
    <div class="col-6"><div class="box"></div></div>
    <div class="col-6"><div class="box"></div></div>
  </div>
</div>
{% endraw %}

##### 巢狀

`.col` 的內部依然可以有 `.row`，並且有獨立的欄線，它會用內層有限的空間持續進行格線分割。

```html
<div class="row">
  <div class="col-6"><div class="box"></div></div>
  <div class="col-6">
    <div class="row">
      <div class="col-6"><div class="box"></div></div>
      <div class="col-6"><div class="box"></div></div>
    </div>
  </div>
</div>
```

就算使用多層分割，間距、對齊都會是一致的，如果使用另一個類似概念的單層結構也是能夠完全對齊。

{% raw %}
<div class="demo">
  <div class="row">
    <div class="col-6"><div class="box">使用巢狀</div></div>
    <div class="col-6">
      <div class="row">
        <div class="col-6"><div class="box"></div></div>
        <div class="col-6"><div class="box"></div></div>
      </div>
    </div>
  </div>
  <hr>
  <div class="row">
    <div class="col-6"><div class="box">單層格線</div></div>
    <div class="col-3">
      <div class="box"></div>
    </div>
    <div class="col-3">
      <div class="box"></div>
    </div>
  </div>
</div>
{% endraw %}

## 最後，請別忘了 container

前面有提到 `.row` 會產生額外的**負值 margin**，當如果 .row 是直接置於最外層時會讓網頁產生水平捲軸，請避免網頁產生不必要的水平捲軸，這會使開發者看起來就像新手一樣。

如果要避免此問題，請維持一個 .container 或 container-fluid 在外層（無論你有多少個 .row，都僅需要一個在最外層）

```html
<div class="container"><!-- 請維持一個 container 在最外層 -->
  <div class="row">
    <div class="col-8">
      <div class="row">
        <div class="col-4"></div>
        <div class="col-4"></div>
      </div>
    </div>
  </div>
</div>
```

如果網頁有多個區塊，則可以在每個區塊都有獨立的 .container，不一定只用一個 container 包覆全網站。如以下範例有多個區塊時，也可以有各自的 container 或 container-fluid，讓每個區塊的容器有更多的變化。

```html
<section class="container">
  ...
</section>
<section class="container-fluid">
  ...
</section>
<section class="container">
  ...
</section>
```

## 結語

Bootstrap 格線是很棒的格線工具，無論是在切版或網頁設計得格線教學，我都很推薦使用 Bootstrap 的概念，它是目前可行性優及泛用性廣的格線系統，但也為了達到此概念，其中加入了許多 “HACK” 讓這個格線能夠具有許多特性（如：負值的 margin 是為了多列呈現，在 Bootstrap 2 時的格線就不能換列）。

也因為這些 “HACK” 我們在使用 Bootstrap 格線需要更加小心，如果沒有正確對齊會造成畫面無法對齊，開發者也會花上許多時間為了修正這些沒對齊的項目，並產生許多不必要的樣式。
