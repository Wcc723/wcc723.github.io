---
layout: post
title: CSS Border 運用技巧（手繪框線、三角形、空間運用）
category: css
tagline:
tags: [css, border]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202002%2Fimg-border.png?alt=media&token=a2b06e55-8ca4-4e1a-a52d-f19aa0942437
published: true
---

CSS Border 大部份來說是用在裝飾上，卡片的邊線、hover 的視覺效果、物件之間的間隔等等，這些視覺效果除了 Border 以外亦有其它方式可以達到；雖然如此，Border 的使用率還是比較高，因為相對來說更為簡單方便，不過也別這樣小看它，透過一些小技巧時，Border 還有很多靈活運用的方式。

## 基本觀念介紹

先了解 Border 基本的觀念，有助於接下來的靈活運用。

#### Border 具有空間

這是很多新手常遇到的問題，border 本身是具有空間的，因此元素如果增加了 border 以後會導致整體元素空間增大。因此元素如果要維持原有的尺寸，則必須將 border 所增加的空間給扣除。

以下範例來說，左方的方框增加了額外 border 時，就導致元素尺寸大於右方的方框。

{% raw %}
<div class="demo d-flex">
  <div class="border-2 box bg-gray"></div>
  <div class="box bg-gray"></div>
</div>
<style>
.d-flex {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}
.box {
  height: 80px;
  width: 80px;
  margin: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.bg-gray {
  background-color: #ccc;
}
.border-2 {
  border: 2px solid #00cc99;
}
</style>
{% endraw %}

#### Border 可以搭配圓角

CSS 中的圓角 `border-radius` 是一個偉大的發明，他並不會使元素的邊緣被裁切，而是能夠產生滑順的圓角。除此之外，雖然名稱為 **border**-radius 但運用上並不只限於 border，在大部分的元素上都可以運用 border-radius，而 border-radius 運用上具有以下的技巧：

- 不需要所有角都使用等距空間，每個角可自訂獨立的數值（左二範例）
- 當圓角數值超過元素空間時，將會以 **較短的邊線距離產生正圓角**，這樣的特性下可以在元素的邊緣套用正圓形（左三範例）
- 當圓角數值採用百分比且超過 50% 時，將會以 **邊線距離的一半產生圓角**，此特性在非正方形的情況下可能會變成橢圓形。

大多數情況來說，我都會將圓角數值設為極大值，來產生更好看圓邊，避免會出現橢圓形的狀況。

{% raw %}
<div class="demo d-flex">
  <div class="border-4 box bg-gray radius"></div>
  <div class="border-4 box bg-gray radius-6-12-24-48"></div>
  <div class="border-4 box bg-gray radius-circle" style="width: 120px"></div>
  <div class="border-4 box bg-gray radius-oval" style="width: 120px"></div>
</div>
<style>
.radius {
  border-radius: 24px
}
.radius-6-12-24-48 {
  border-radius: 6px 12px 24px 48px;
}
.radius-circle {
  border-radius: 200px;
}
.radius-oval {
  border-radius: 50%;
}
</style>
{% endraw %}

#### 不同的樣式

大部分來說 border 運用都是以 `solid` 為大宗，其次為 `dashed` 及 `dotted`，以下列出所有的 border 樣式，除此之外 border 的樣式還可以混合使用喔。

{% raw %}
<div class="demo d-flex">
  <div class="border-4 border-dotted box bg-gray">dotted</div>
  <div class="border-4 border-dashed box bg-gray">dashed</div>
  <div class="border-4 border-solid box bg-gray">solid</div>
  <div class="border-4 border-double box bg-gray">double</div>
  <div class="border-4 border-groove box bg-gray">groove</div>
  <div class="border-4 border-ridge box bg-gray">ridge</div>
  <div class="border-4 border-inset box bg-gray">inset</div>
  <div class="border-4 border-outset box bg-gray">outset</div>
  <div class="border-4 border-mix box bg-gray">混合</div>
</div>
<style>
.border-4 {
  border: 4px solid #00cc99;
}
.border-dotted {border-style: dotted;}
.border-dashed {border-style: dashed;}
.border-solid {border-style: solid;}
.border-double {border-style: double;}
.border-groove {border-style: groove;}
.border-ridge {border-style: ridge;}
.border-inset {border-style: inset;}
.border-outset {border-style: outset;}
.border-mix {border-style: dotted dashed solid double;}
</style>
{% endraw %}


---

## 技巧

### 空間運用

Border 很常運用在選單的 hover 或 active 的視覺效果，但如果沒有注意到就可能因為 border 的空間讓選單產生位移，如以下範例來說，滑鼠移入選單時就會造成選單位移。

關鍵程式碼：
```css
a.demo-item:hover {
  border-bottom: 3px solid #00cc99;
}
```

{% raw %}
<div class="demo d-flex">
  <div class="demo-navbar d-flex">
    <a href="#" class="demo-item">選單 1</a>
    <a href="#" class="demo-item">選單 2</a>
  </div>
</div>
<style>
.demo-navbar {
  background-color: #fff;
  box-shadow: 0 3px 3px rgba(0, 0, 0, .16);
  padding: 0 30px;
  justify-content: center;
}
a.demo-item {
  display: block;
  padding: 10px 15px;
}
a.demo-item:hover {
  border-bottom: 3px solid #00cc99;
  text-decoration: none;
}
</style>
{% endraw %}

會造成這樣的原因在於「Border 本身是具有空間的」，因此直接在 hover 上新增 border 時就會發生此問題，其中一種解決方法則是預先加入 "透明的 border 空間"，在 hover 或其它的行為時再來切換 border 的色彩。

關鍵程式碼：
```css
.demo-navbar {
  /* 將部分的空間先扣除 */
  padding: 0 27px;
}
.demo-navbar .demo-item {
  /* 加入下方透明的 Border */
  border-bottom: 3px solid transparent;
}
```

{% raw %}
<div class="demo d-flex">
  <div class="demo-navbar demo-navbar-update d-flex">
    <a href="#" class="demo-item">選單 1</a>
    <a href="#" class="demo-item">選單 2</a>
  </div>
</div>
<style>
.demo-navbar-update {
  padding: 0 27px;
}
.demo-navbar-update .demo-item {
  border-bottom: 3px solid transparent;
}
</style>
{% endraw %}

由於 Border 本身是佔有空間的，所以也可以使用其它不含空間的視覺效果來達到此效果，以下範例則是使用 `box-shadow` 做到類似的效果。

關鍵程式碼：
```css
a.demo-item:hover {
  box-shadow: 0 -3px #00cc99 inset; 
}
```

{% raw %}
<div class="demo d-flex">
  <div class="demo-navbar demo-navbar-update2 d-flex">
    <a href="#" class="demo-item">選單 1</a>
    <a href="#" class="demo-item">選單 2</a>
  </div>
</div>
<style>
.demo-navbar-update2 a.demo-item:hover {
  border-bottom: 0;
  box-shadow: 0 -3px #00cc99 inset; 
}
</style>
{% endraw %}



### 三角形

接續一開始所提到 border 本身是佔有空間的，當有兩個邊線的 border 重疊的部分就會產生 "實體的交疊"，這個實體的交疊就會產生三角形的視覺效果。

下方的範例來說，上者是下邊、右邊的 border 產生，下者則是四邊的 border 產生。

{% raw %}
<div class="demo">
  <div class="left-border"></div>
  <div class="arrow"></div>
</div>
<style>
.left-border {
  width: 0;
  height: 0;
  margin: 0 auto;
  border-right: orange 20px solid;
  border-bottom: blue 20px solid;
}
.arrow {
  width: 0;
  height: 0;
  margin: 0 auto;
  border-top: red 20px solid;
  border-right: orange 20px solid;
  border-bottom: blue 20px solid;
  border-left: green 20px solid;
}
</style>
{% endraw %}

當四邊均為 border 時，就能產生四個三角形，當如果僅需要一個方向的三角時，就可以使用到前一個段落所提到的技巧 "透明 border"。

關鍵程式碼：
```css
.message-box:after {
  content: "";
  /* 四邊透明的 border */
  border: transparent 10px solid;
  /* 將其中一補上色彩 */
  border-top-color: #00cc99;
}
```

透過此方法就能做到類似訊息框的視覺效果。

{% raw %}
<div class="demo d-flex">
  <div class="message-box">歐拉歐拉歐拉歐拉歐拉！</div>
</div>
<style>
.message-box {
  background: #00cc99;
  color: white;
  padding: 10px;
  border-radius: 5px;
  position: relative;
}
.message-box:after {
  content: "";
  width: 0;
  height: 0;
  position: absolute;
  left: 10px;
  bottom: -20px;
  border: transparent 10px solid;
  border-top-color: #00cc99;
}
</style>
{% endraw %}

### 多層次

除了 Border 以外，有很多方法可以做到類似的視覺效果，而其中一個很常利用的就是 `box-shadow`，與 border 最大不同之處就是 `box-shadow` 不佔有任何空間。兩者在此也可以作為好朋友產生多層次的邊框效果。

```css
.border-multi {
  border: 5px solid red;
  box-shadow: 
    0 0 0 5px orange, 
    0 0 0 10px yellow,
    0 0 0 15px green,
    0 0 0 20px blue;
  margin: 25px  
}
```

{% raw %}
<div class="demo d-flex">
  <div class="border-multi box bg-gray"></div>
</div>
<style>
.border-multi {
  border: 5px solid red;
  box-shadow: 
    0 0 0 5px orange, 
    0 0 0 10px yellow,
    0 0 0 15px green,
    0 0 0 20px blue;
  margin: 25px  
}
</style>
{% endraw %}

### 手繪邊框

最後，展示比較特別的視覺風格 "手繪邊框"，前幾個範例都是圍繞在 border-radius 上，這個也不例外，最重要的關鍵點在於 border-radius 可以在同一個角設定兩個以上的參數。

如以兩個範例

- 範例一：設定左上的圓角，前者的數值是左上圓角**靠上方**邊線的圓半徑，後者的數值則是左上圓角**靠左方**邊線的圓半徑，原始碼 如下：
- 範例二：縮寫方法，可以一次設定四個圓角不同的形式。

```css
/* 範例一 */
.border-top-left-radius {
  border-top-left-radius: 10px 100px;
}
/* 範例二 */
.border-2-size {
  border-radius: 15px / 100px;
}
```

{% raw %}
<div class="demo d-flex">
  <div class="border-4 box bg-gray border-top-left-radius"></div>
  <div class="border-4 box bg-gray border-2-size"></div>
</div>
<style>
.border-top-left-radius {
  border-top-left-radius: 10px 100px;
}
.border-2-size {
  border-radius: 15px / 100px;
}
</style>
{% endraw %}

最後也補充此風格的技巧說明：
- border-width：可設定不同的粗細變化，做出手繪過程中的不同粗細變化
- transform：手繪過程中通常不會過於水平或垂直，所以外層都可以補上 transform 製作出傾斜的效果
  - 內層也同樣需要補上 transform 將文字內容給予補正
- border-style：也可試著加入不同樣式的邊線，做出不同的手繪視覺效果

關鍵程式碼：
```css
.ink-box {
  border-width: 2px 3px 2px 5px;
  border-radius: 90% 6% 93% 5% / 5% 94% 7% 95%;
  /* 做出傾斜的視覺感 */
  transform: rotate(2deg);
}
.ink-box-double {
  border: dashed black 2px;
}
.box-inner {
  /* 將傾斜的部分修正 */
  transform: rotate(-2deg);
}
```

{% raw %}
<div class="demo d-flex">
  <div class="ink-box">
    <div class="box-inner">Handwriting style</div>
  </div>
  <div class="ink-box ink-box-double">
    <div class="box-inner">Handwriting style</div>
  </div>
</div>
<style>
@import url('https://fonts.googleapis.com/css?family=Caveat&display=swap');
.ink-box {
  width: 150px;
  height: 150px;
  background:#fff;
  border: solid black 1px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 紙風格 */
  border-width: 2px 3px 2px 5px;
  border-radius: 90% 6% 93% 5% / 5% 94% 7% 95%;
  font-family: 'Caveat';
  transform: rotate(2deg);
}
.ink-box-double {
  border: dashed black 2px;
}
.box-inner {
  transform: rotate(-2deg);
}
</style>
{% endraw %}

參考文件：
- https://developer.mozilla.org/zh-CN/docs/Web/CSS/border-radius
- https://code.tutsplus.com/tutorials/css-refreshers-borders--net-24655
- https://freefrontend.com/css-border-examples/