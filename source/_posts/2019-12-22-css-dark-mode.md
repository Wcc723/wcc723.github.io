---
layout: post
title: CSS 技巧：精簡語法操作暗色主題 - CSS Dark Mode
category: css
tagline:
tags: [css, develop]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201912%2Fcss-dark-mode.png?alt=media&token=21ebdd56-5e42-4e4f-ab8d-c63e35d29637
published: true
---

Mac 暗色主題推出後，就讓黑色控非常喜愛，而且這樣的暗色佈景使用起來更不傷眼。以我來說是比較喜歡在亮色的佈景下工作的，但暗主題的對於長期需要在電腦面前工作來說，真的相對輕鬆很多。雖然如此，也並非所有的介面都是有提供暗主題，以網頁來說就需要開發者另外定義暗主題才會進行切換（不使用任何瀏覽器插件的情況下）。

好在，暗色主題的語法相當容易，以下介紹如何作切換，並且會提供一個小技巧，只要透過短短的幾行就能操控整個網站所有元件的主題色彩。

## 支援度

先附上大家所在意的支援度，但其實暗色主題本身就是由 Apple 先提出的，所以 Mac OS、iOS 的支援度會比較高，其它的瀏覽器也正在持續跟進中。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201912%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2019_12_22_%E4%B8%8A%E5%8D%8811_50.png?alt=media&token=3090bbfe-cf0d-4a7a-8b97-23243cdd106a)


## 語法

MDN 上的介紹：https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme

暗色主題的 CSS 是透過 @media 取得裝置的主題模式，就如同取得裝置的形式一樣（尺寸、橫向或垂直、是否為螢幕等等...），相信對於撰寫過響應式的開發者都不陌生。

語法上使用 prefers-color-scheme 來監測是亮色或暗色的主題，相對應的值也就是 `dark` or `light`。
```css
@media (prefers-color-scheme: ${dark or light}) {
  // ...
}
```

實際演示範例範例：
```html
<style>
.mode {
  background-color: #eee;
  color: #333;
}
.text-mode:after {
  content: "light";
}

@media (prefers-color-scheme: dark) {
  .mode {
    background-color: #333;
    color: #eee;
  }
  .text-mode:after {
    content: "dark";
  }
}
</style>
<div class="demo mode">
  <p>本區塊會隨著暗色與亮色主題切換</p>
  <p>您目前的是 <span class="text-mode"></span> 主題</p>
</div>
```

請透過切換你的暗色、亮色主題來改變下方的範例（暗色主題為深色背景，亮色則反之）。

{% raw %}
<style>
.mode {
  background-color: #eee;
  color: #333;
}
.text-mode:after {
  content: "light";
}

@media (prefers-color-scheme: dark) {
  .mode {
    background-color: #333;
    color: #eee;
  }
  .text-mode:after {
    content: "dark";
  }
}
</style>
<div class="demo mode">
  <p>本區塊會隨著暗色與亮色主題切換</p>
  <p>您目前的是 <span class="text-mode"></span> 主題</p>
</div>
{% endraw %}


## 使用變數快速切換網頁的主題色

暗色系與亮色中的色彩並不是黑白兩色互相切換，以 Material Design 來說，如果亮色的主色色彩為 `#6222ee`，在暗色系並不會使用相同色，而是會改變為 `#bb85fc` 藉此來增加辨識度，而整個網頁中所需要套用色彩的區塊非常多，從按鈕到元件都會不斷地引用，如果透過一個個的 @media 設定將會增加開發及管理的困難度。

![](https://storage.googleapis.com/spec-host/mio-staging%2Fmio-design%2F1576174064000%2Fassets%2F11xwGmImm24QEBIRv6a0NzhW-wTc9rFh6%2Fdarktheme-darktheme-usage-availability-toggle.png)

> Material Design 中的暗色、亮色切換範例，兩者的主色（紫色）在不同的主題下色彩也會改變。

因此，在開發時可以將暗色、亮色的佈景主題色彩以 CSS 變數的方式作定義，避免直接將色彩寫入 CSS 元素上，接下來在 @media 中僅需要改變 CSS 的變數就能夠完整切換所有元件的主題色彩。


```css
.card {
  --theme-primary: #6222ee;
  --theme-background: #eee;
}

.card {
  /* ... */
  background-color: var(--theme-background);
  color: var(--theme-primary);
}

@media (prefers-color-scheme: dark) {
  .card {
    --theme-primary: #bb85fc;
    --theme-background: #111;
  }
}
```

{% raw %}
<style>
.card {
  --theme-primary: #6222ee;
  --theme-background: #eee;
}

.card {
  margin: 0 auto;
  padding: 15px;
  text-align: center;
  max-width: 320px;
  border-radius: 3px;
  border: 1px solid #777;
  background-color: var(--theme-background);
  color: var(--theme-primary);
}

@media (prefers-color-scheme: dark) {
  .card {
    --theme-primary: #bb85fc;
    --theme-background: #111;
  }
}
</style>
<div class="demo mode">
  <div class="card">
    <p>本卡片會隨著暗色與亮色主題切換</p>
  </div>
</div>
{% endraw %}

本文中還有利用到 CSS Variables，有興趣可參閱本篇文「[原生 CSS 變數運用技巧（CSS Variables）](https://w3c.hexschool.com/blog/21985acb)」。


#### 設計規範

目前在 Apple 及 Material Design 中也都有針對亮色、暗色的佈景主題提供規範，在完整投入之前，也不妨先參考看看。

Material Design
- Material Design：https://design.google/library/material-design-dark-theme/

Apple
- Mac：https://developer.apple.com/design/human-interface-guidelines/macos/visual-design/dark-mode/
- iOS：https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/dark-mode/