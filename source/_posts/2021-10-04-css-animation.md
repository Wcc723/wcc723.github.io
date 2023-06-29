---
layout: post
title: 一個工具，帶你完整認識 CSS Animation
category: development
tagline:
tags: [css]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fcss_animation.png?alt=media&token=06c5a4bb-c229-4b71-8aca-cb5916d000b7
published: true
---

網頁上看到許多 CSS Animation 套效想要參考使用，但卻不知道其中的屬性各自代表什麼意思嗎？本篇將介紹 CSS Animation 的各項屬性運用技巧，並提供一個模擬工具，讓大家可以快速的了解每個屬性的意義。

## 建立第一個動畫

在學習每一個屬性之前，首先先動手試試看讓一個元素套用動態的效果，在這之中我們需要先認識兩個語法 `animation` 及 `@keyframe`：

- `@keyframes`: 影格，就像是戲中每個角色在 **特定時間點需要呈現的狀態**
- `animation`: 動畫，**決定實際演出時的播放方式**，包含速率、正反轉都可以調整

#### 步驟一：建立 @keyframe

CSS Animation 看起來主角應該是 `animation` 屬性，但實際決定元素是如何運作的是 `@keyframes`，顧名思義是「影格」的意思，用來決定每個階段元素所套用的樣式。

而它的結構比較不一樣，看起來會比較像是 `@media query`，會包含以下的語法：

- 使用 `@keyframes` 定義，後面包含其自訂名稱
- 使用 `form...to`、`%` 等各種方式定義每個階段的影格變化
- 在 `{ ... }` 中定義元素在該影格所套用的樣式

撰寫結構如下：

```css
/* 使用 `@keyframes` 定義，後面包含其自訂名稱 */
@keyframes rotate-keyframe {
  /* 定義每個階段的影格變化  */
  from {
    /* 定義元素在該影格所套用的樣式 */
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

`from...to` 是只有頭尾的撰寫方式，如果要加入更多階段的影格樣式，可以使用 `%`，寫法概念如下：

```css
/* 使用 `@keyframes` 定義，後面包含其自訂名稱 */
@keyframes rotate-keyframe {
  /* 定義每個階段的影格變化  */
  0% {
    /* 定義元素在該影格所套用的樣式 */
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(180deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
```

#### 步驟二：套用 animation 並載入影格

實作中會建議先準備好 `@keyframes`，才能確保 animation 是可以運作的，套用時請注意：

- `animation` 需要對應一個 `@keyframes` 的名稱
- 至少要包含兩個屬性才能運作 - `animation-name`(@keyframes 名稱)、`animation-duration` (動畫持續時間)


```css
.box {
  height: 100px;
  width: 100px;
  display: inline-block;
  background-color: orange;
}
.rotate {
  animation-name: rotate-keyframe; /* 套用的 keyframe */
  animation-duration: 3s;          /* 動畫持續時間 */
  animation-iteration-count: infinite; /* 動畫播放次數 */
  animation-timing-function: linear;   /* 影片加速速率 */
}
@keyframes rotate-keyframe {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```
```
<div class="box rotate"></div>
```

透過以上的程式碼，就可以做出以下的旋轉方塊效果。

{% raw %}
<style>
.box {
  height: 100px;
  width: 100px;
  display: inline-block;
  background-color: orange;
}
.rotate {
  animation-name: rotate-keyframe;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
.move {
  animation-name: move-object;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
@keyframes rotate-keyframe {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes move-object {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(200%);
  }
}
</style>
<div class="demo">
  <div class="box rotate"></div>
</div>
{% endraw %}

## 認識每一個 animation 屬性

相信透過以上流程，就大致知道如何產生一個動畫效果，趁著有點熟悉的狀態下，持續學習完 Animation 的各項常用屬性吧。

#### animation-name：必要屬性

決定動畫所套用的 `@keyframes` 其值必定會是自訂的 keyframes 名稱，如果 CSS 中沒有 keyframes 將無法運作。

#### animation-duration：必要屬性

決定動畫演示一次的時間長短，撰寫時務必加入單位（`s` 秒、`ms` 毫秒...），寫法參考如下

```css
animation-duration: 3s;
animation-duration: 240ms;
```

#### animation-iteration-count ⭐⭐⭐

動畫播放次數，可以填入數值（整數，或是包含小數點均可），或者可以使用 `infinite` 表示無限次重複播放。

```css
animation-iteration-count: infinite;
animation-iteration-count: 1;
animation-iteration-count: 2.5;
```

#### animation-timing-function ⭐⭐⭐

動畫效果轉換的速率，如果善加運用可以讓元素動態更具有生命力，animation 的運用好壞將與此屬性有極大的關係。套用的值非常靈活，包含：

- 各種 Timing Function 例如：ease、ease-in、ease-in-out、linear...
- 使用階段的方式定義，如：`steps(8, end)`（套用八個階段完成影格
- 使用貝茲曲線定義動態轉換效果，如：`cubic-bezier(0.1, 0.7, 1.0, 0.1)`，會建議直接使用[工具](https://cubic-bezier.com/) 產生貝茲數值。

寫法參考如下：

```css
animation-timing-function: ease;
animation-timing-function: ease-in;
animation-timing-function: ease-out;
animation-timing-function: linear;        /* 線性的速率 */
animation-timing-function: steps(5, end); /* 階段性的轉換 */
animation-timing-function: cubic-bezier(.4,.94,.56,1.59); /* 自訂義貝茲轉換速率 */
```

{% raw %}
<div class="demo my-3">
  <div class="box move" style="animation-timing-function: cubic-bezier(.4,.94,.56,1.59) "></div>
</div>
{% endraw %}
> 套用 `cubic-bezier` 甚至可以讓元素會有反彈的感覺

#### animation-direction ⭐⭐

動畫播放正向或是反向播放，也可以設定為單數次正向播放、雙數次為反向的運行狀態。

```css
animation-direction: normal;             /* 正向播放 */
animation-direction: reverse;            /* 反向播放 */
animation-direction: alternate;          /* 單數次為正向播放，雙數次為反向播放 */
animation-direction: alternate-revers;   /* 與前者相反，雙數次為正向播放，單數次為反向播放 */
```

{% raw %}
<div class="demo my-3">
  <div class="box move" style="animation-direction: alternate"></div>
</div>
{% endraw %}
> alternate 簡單來說就是一次正向、一次反向的播放方式

#### animation-play-state ⭐

決定當前的動畫是否暫停，包含 `running`、`paused` 的屬性。

```css
animation-play-state: running;
animation-play-state: paused;
```

#### animation-fill-mode ⭐

定義動畫在播放完成的停留呈現狀態。

```css
animation-fill-mode: forwards;   /* 停留在結束的狀態 */
animation-fill-mode: backwards;  /* 停留在剛開始的狀態 */
animation-fill-mode: both;       /* 依據開始或結束決定呈現的狀態 */
```

#### animation-delay ⭐

第一次播放動畫時所延遲的時間

```css
animation-delay: 0;
animation-delay: 3s;
```

## 動手試試看 CSS Animation

看完本篇文章，相信對於 CSS Animation 有基本的認識，接下來就直接動手玩玩看，了解 CSS Animation 的魅力吧

{% raw %}
<script src="https://unpkg.com/vue@next"></script>
<div id="app">
  <div class="row row-cols-lg-2 gy-2 gx-3">
    <div class="col" v-for="(ani, key) in animationStyle" :key="key">
      <label :for="key">{{ ani.name.replace('animation-', '')}} <small>({{ ani.description }})</small></label>
      <select class="form-select" :id="key" v-model="selectProperties[ani.name]">
        <option value="">不設定</option>
        <option :value="item" v-for="(item) in ani.properties"
          :key="`${item}property`">
          {{ item }}
        </option>
      </select>
    </div>
  </div>
  <div class="demo my-3">
    <div class="box"
      :style="selectProperties"
    >
  </div>
  </div>

  <p>運作時所套用的 CSS 程式碼</p>
  <pre class="hljs"><code class="hljs">.animation {
<template  v-for="(item, key) in selectProperties" :key="key"><div v-if="item">  {{ key }}: {{ item }};</div></template>}
@keyframes rotate-keyframe {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes move-object {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(200%);
  }
}</code></pre>
</div>
<script>
const { reactive, ref } = Vue;
const app = Vue.createApp({
  setup() {
    const animationStyle = reactive({
      animationName: {
        name: 'animation-name',
        description: '*動畫所套用的 keyframe 名稱',
        properties: [
          'rotate-keyframe',
          'move-object',
        ]
      },
      animationDuration: {
        name: 'animation-duration',
        description: '*動畫持續時間',
        properties: [
          '1s',
          '3s',
          '500ms',
          'alternate-reverse',
        ]
      },
      animationIterationCount: {
        name: 'animation-iteration-count',
        description: '*動畫播放次數',
        properties: [
          '1',
          '3',
          '1.5',
          'infinite',
        ]
      },
      animationTimingFunction: {
        name: 'animation-timing-function',
        description: '動畫轉換時的加速曲線',
        properties: [
          'ease',
          'ease-in',
          'ease-out',
          'linear',
          'steps(5, end)',
          'cubic-bezier(.4,.94,.56,1.59)'
        ]
      },
      animationDirection: {
        name: 'animation-direction',
        description: '動畫向前，或是反轉播放',
        properties: [
          'normal',
          'reverse',
          'alternate',
          'alternate-reverse',
        ]
      },
      animationPlayState: {
        name: 'animation-play-state',
        description: '動畫播放的狀態',
        properties: [
          'running',
          'paused',
        ]
      },
      animationFillMode: {
        name: 'animation-fill-mode',
        description: '定義播放以外的時間的呈現狀態',
        properties: [
          'none',
          'forwards',
          'backwards',
          'both',
        ]
      },
      animationDelay: {
        name: 'animation-delay',
        description: '第一次播放動畫延遲時間',
        properties: [
          '0',
          '1s',
          '2s',
          'initial',
        ]
      },
    });
    const selectProperties = reactive({
      'animation-name': 'rotate-keyframe',
      'animation-duration': '3s',
      'animation-iteration-count': 'infinite',
      'animation-timing-function': 'linear',
    });
    return {
      animationStyle,
      selectProperties
    }
  }
}).mount('#app');
</script>
{% endraw %}

## 延伸閱讀

如果要在實戰中套用 Animation 的效果，非常推薦直接使用 「[Animate.css](https://animate.style/)」，包含相當多種動態轉場效果，就算是一般的網站宣傳頁面，都可以輕易地將動態套用至元素上喔

延伸資源：
- Animate.css：https://animate.style/