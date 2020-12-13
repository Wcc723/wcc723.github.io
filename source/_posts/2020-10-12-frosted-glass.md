---
layout: post
title: 純 CSS 毛玻璃特效 - backdrop-filter 屬性介紹
category: development
tagline:
tags: [css, scss, bootstrap]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_27.jpg?alt=media&token=1249e1f4-1fb9-48e7-a4b5-c450022a46dc
published: true
---


幾年前的 iOS、MacOS 更新以後，毛玻璃視覺效果越來越受到許多人喜愛，在使用毛玻璃以前，背景與主要的畫面區塊的風格整合是一件麻煩的事情，除了畫面的協調性外，還要維持資訊的傳達性。而毛玻璃可以讓背景的畫面霧化，凸顯上層的主要資訊，並讓背景與整體不致於產生衝突感。

網頁在套用毛玻璃的特效流程近年有大幅的簡化，過去在線上有介紹過 [純 CSS 的毛玻璃](https://www.youtube.com/watch?v=SmFxwLRSulM)的技法，是透過多層的偽元素搭配 `filter` 的模糊效果完成，開發的程式碼繁雜，運作上也有許多的限制。不過在 2019 推出了新的 CSS 語法，毛玻璃的特效僅需要一個短短屬性就可達成，讓我們一起來看看怎麼做吧。

{% raw %}
<style>
.demo {
  padding: 30px
}
.box {
  height: 400px !important;
  width: 100% !important;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  border: 1px solid rgba(255, 255, 255, .15);
}
.object-cover {
  object-fit: cover;
}
.background-cover {
  background-position: center center;
  background-size: cover;
}
.object-bottom {
  object-position: right bottom;
}
</style>
{% endraw %}

這是本文會使用到的圖片，圖片來自於 Unsplash，如果失連歡迎與我聯絡。

{% raw %}
<img no-lazy src="https://images.unsplash.com/photo-1602251627070-6a9bab4e420e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80" alt=""> 
{% endraw %}

## 偽元素 + Filter 的做法

在新的語法推出以前，純 CSS 製作毛玻璃特效僅有此方法，原理：

1. 將上層區塊中加入一個與背景相同的圖片
2. 上層區塊內的圖片尺寸需超過該區塊
3. 將區塊內的圖片轉為模糊

原始碼及說明：
```css
.filter.box {
  position: relative;
  /* 裁切多餘區域 */
  overflow: hidden;
  /* 加入 z-index，區塊內的文字才能正確顯示 */
  z-index: 1;
}
.filter.box:after{
  content: "";
  background-position: center center;
  background-size: cover;
  position: absolute;
  /* 圖片需超過外層的區塊 */
  top: -30px;
  bottom: -30px;
  left: -30px;
  right: -30px;
  background-image: url(https://images.unsplash.com/photo-1602251627070-6a9bab4e420e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80);
  /* 加入模糊 */
  filter: blur(5px);
  z-index: -1;
}
```

{% raw %}
<style>
.filter.box {
  position: relative;
  overflow: hidden;
  z-index: 1;
}
.filter.box:after{
  content: "";
  background-position: center center;
  background-size: cover;
  position: absolute;
  top: -30px;
  bottom: -30px;
  left: -30px;
  right: -30px;
  background-image: url(https://images.unsplash.com/photo-1602251627070-6a9bab4e420e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80);
  filter: blur(5px);
  z-index: -1;
}
</style>

實際運作範例：

<div class="demo background-cover" style="background-image: url(https://images.unsplash.com/photo-1602251627070-6a9bab4e420e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80)">
  <div class="box filter">
    毛玻璃特效 by filter
  </div>
</div>
{% endraw %}

這個手法兩層的圖片必須完全相同，所以作為背景的區塊無法有任何的其它元素。

## backdrop-filter，一行就能搞定

在 Chrome 76 版加入的新屬性 `backdrop-filter`，此屬性能夠將區塊內的背景統一加入特效，此語法就不需要用到偽元素，僅需要短短的一行即可搞定。

範例程式碼（就這樣而已）：
```css
.backdrop-blur {
  backdrop-filter: blur(5px);
}
```

實際範例，不管背景圖如何，區塊內的 `backdrop-filter` 都能夠將背景加入特效。
{% raw %}
<style>
.backdrop-blur {
  backdrop-filter: blur(5px);
}
</style> 

<div class="demo background-cover" style="background-image: url(https://images.unsplash.com/photo-1602251627070-6a9bab4e420e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80)">
  <div class="box backdrop-blur">
    毛玻璃特效 by backdrop-filter
  </div>
</div>
{% endraw %}

`backdrop-filter` 具有許多特點，除了能夠將圖片加上特效外，更嚴格來說它是將**整個區塊的下層**加上特效，只要在套用的區塊下都能運作。以下範例來說，於底部加上了一段文字，在 `hover` 後的視覺效果也能套用 `backdrop-filter` 的特效（在此使用 `invert`）。

```css
<style>
.backdrop-invert {
  transition: 1s all;
}
.backdrop-invert:hover {
  background-color: rgba(0, 0, 0, .25);
  backdrop-filter: invert(80%);
}
```

{% raw %}
<style>
.absolute {
  position: absolute;
  color: white;
  text-align: center;
  left: 0;
  right: 0;
}
.backdrop-invert {
  transition: 1s all;
}
.backdrop-invert:hover {
  background-color: rgba(0, 0, 0, .25);
  backdrop-filter: invert(80%);
}
</style> 

<div class="demo background-cover" style="background-image: url(https://images.unsplash.com/photo-1602251627070-6a9bab4e420e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80)">
  <div class="absolute">
  <h2>底層有其它的文字</h2>
  </div>
  <div class="box backdrop-invert">
    請用滑鼠 Hover 過此區塊 
  </div>
</div>
{% endraw %}

## 更多 backdrop-filter

`backdrop-filter` 除了毛玻璃以外，亦有包含非常多的特效（就如同 Photoshop 一樣），語法列表如下：

- blur: 模糊（毛玻璃就是你～）
- brightness: 明度
- contrast: 對比度
- drop-shadow: 陰影
- grayscale: 灰階
- hue-rotate: 色相
- invert: 反轉
- opacity: 透明度
- sepia: 棕褐色
- saturate: 飽和度

這裡也提供簡單的工具，便於大家瀏覽所有的特效效果。

{% raw %}
<label for="backdrop-filter">特效選單：</label>
<select name="" id="backdrop-filter">
  <option value="" disabled selected>-- 請選擇特效 --</option>
  <option value="blur(5px)">模糊 blur</option>
  <option value="brightness(60%)">明度 brightness</option>
  <option value="contrast(80%)">對比度 contrast</option>
  <option value="drop-shadow(4px 4px 10px black)">陰影 drop-shadow</option>
  <option value="grayscale(50%)">灰階 grayscale</option>
  <option value="hue-rotate(120deg)">色相 hue-rotate</option>
  <option value="invert(70%)">反轉 invert</option>
  <option value="opacity(60%)">透明度 opacity</option>
  <option value="sepia(80%)">棕褐色 sepia</option>
  <option value="saturate(80%)">飽和度 saturate</option>
</select>
<div class="demo background-cover" style="background-image: url(https://images.unsplash.com/photo-1602251627070-6a9bab4e420e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1355&q=80)">
  <div class="absolute">
  <h2>底層有其它的文字</h2>
  </div>
  <div class="box" style="background-color: rgba(0, 0, 0, .3)" id="custom-backdrop">
    目前套用的效果為：<span id="backdrop-text">無</span>
  </div>
</div>
<script>
const customBackdrop = document.querySelector('#custom-backdrop');
const backdropSelect = document.querySelector('#backdrop-filter');
const backdropText = document.querySelector('#backdrop-text')
let backdrop = '';
backdropSelect.addEventListener('change', function() {
  const style = this.value;
  console.log(style);
  customBackdrop.style.backdropFilter = style;
  backdropText.innerText = style;
});
</script>
{% endraw %}
