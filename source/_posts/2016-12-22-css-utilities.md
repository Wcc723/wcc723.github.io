---
layout: post
title: 鐵人賽 22 - 實戰心法 - 經常使用，但卻容易被忽視的 CSS
category: css
tagline:
tags: [css, Bootstrap]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/22_heart_header.jpg
published: true
---

Bootstrap 3 載入以後其實就有包含大部分的元件，原本的設計概念上是希望透過一套框架就能滿足大多的需求，但實際在專案運作時有許多客製化需要微調，而很多微調的項目如下：

* 左邊一點、右邊一點、間格大一點
* 文字色彩
* 背景色
* 對齊方法
* 垂直置中方法
* CSS 屬性：顯示屬性、背景屬性、Position ...

這些雜七雜八的，通常會運用在每個元件上，但每個元件都補上重複性又高，這一個部分我們通常會用另一個元件 `_utilities.scss` 來管理。

<!-- more -->

## Utilities

在 Bootstrap 第四版這一兩個月的改版也有這樣的設計，而且數量多到有細項分類；就算如此，還是建議了解有哪些項目建議可以自行設計，因為這使用率非常高，就算用了第四版還是有不足的可能。

![](/images/2016_ironman/22_mind_01.png)

以下我就來介紹一下常用的 Utilities 分類

#### Spacing

間格分為兩大類，一則是 margin，另一則是 padding，兩者的使用頻率都非常高，所以別想偷懶只做一種。另外依據 OOCSS 的概念，間格要避免直接使用數值命名，如：

```css
.mb-5 {
  margin-bottom: 5px;
}
```
所以這部分都會用 `s`、`m`、`l` 或是倍數型的 `1`、`2`、`3`，實作範例如下 (僅列出部分的範例...)。

```css
/* 實作範例 */
.mb0 {
  margin-bottom: 0 !important;
}

.mbs {
  margin-bottom: $gap-small;
}
.mbm {
  margin-bottom: $gap-base;
}

...
.pdm {
  padding: $gutter;
}
```

## 文字色彩 與 背景色

文字色彩也是經常使用的，除了品牌色 (Bootstrap 中有提到) 另外經常使用的色彩就是灰階、白色，這段的問題比較小，只是建議要使用 !important 來確保色彩覆蓋(僅列出部分的範例...)。

```css
.text-primary {
  color: $brand-primary !important;
}
.text-danger {
  color: $brand-danger !important;
}

.text-white {
  color: white !important;
}
```

背景色如同文字色彩，但是背景色有些會有更多延伸，如：

* 是否包含不同明暗度
* 是否要額外製作漸層

在製作漸層時，如果專案維護的人不多(或者只有自己)，很建議先寫需要使用的色彩即可，不用的色彩可先不寫，因為很多色彩真的不會去用...。

```css
.bg-primary {
  background-color: $brand-primary
}
.bg-primary-lighter {
  background-color: lighten($brand-primary, 12%)
}

.bg-primary-darken {
  background-color: darken($brand-primary, 12%)
}
```

## 對齊方法

這邊主要是文字的對齊，文字分為三種對齊置左、置中、置右，一般來說也是這三種即可，但是在 Bootstrap 4 之中還特別製作了不同的裝置尺寸的對齊方式。

垂直置中的部分在後面會有獨立章節介紹。

## CSS 屬性

CSS 很多屬性都是經常性的會運用到，這邊列出常用的：

* float
* background-size
    * cover
    * contain
* display
    * block
    * inline-block
    * none
* position
    * relative
    * absolute
    * fixed
* overflow
    * overflow-y
    * overflow-x

這些都屬於零碎的 CSS 屬性，使用頻率說高不高、說低不低，但是要用實在另外寫 CSS 也是挺麻煩的，所以我也會將它獨立出來。

```css
.bg-cover {
  background-size: cover
}
.bg-contain {
  background-size: contain
}

.p-relative {
  position: relative;
}
.p-absolute {
  position: absolute;
}
.p-fixed {
  position: fixed;
}
```


## 結語

除了垂直置中以外，其他常見的雜項我都已經在本篇列出，在製作第二次框架時，我就將大量的 Utilities 加入，導致我上班不太需要寫 CSS **@_@**，也很高興第四版 Bootstrap 加入了大量的 Utilities 讓我寫的 CSS 更少了...。
