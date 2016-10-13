---
layout: post
title: 動手玩 CSS Blend Mode - 根本 Photoshop 的圖層效果
category: css
tagline:
tags: [css]
cssdemo:
jsdemo:
thumbnail: 2016/01/screen_shot2016-01-10_01.png
published: true
---

現在的 CSS 變化比過去還多，原本的 CSS 主要用於排版，在 CSS3 除了排版還會包含許多效果，本篇介紹的 `Blend Mode` 就是混合模式的效果，讓 CSS 像 Photoshop 一樣有圖層混合。

<!-- more -->

## background-blend-mode, mix-blend-mode

範例中會包含這兩種 CSS 樣式，先做簡單的介紹。

#### background-blend-mode

`background-blend-mode` 這一個 CSS 屬性是針對 **背景圖片** 的混合模式，所以並不會影響畫面中其他物件色彩。

#### mix-blend-mode

`mix-blend-mode` 這種混合模式就如同 Photoshop 中的 **圖層混合模式** 較為接近，會有下層圖層的色彩進行混合。

![](/images/2016/01/screen_shot2016-01-10_02.png)

## 範例

<iframe src="http://wcc723.github.io/WorkShop-gh-pages/cssBlendMode/" width="100%" height="620" border="0"> </iframe>

範例連結網址：[http://wcc723.github.io/WorkShop-gh-pages/cssBlendMode/](http://wcc723.github.io/WorkShop-gh-pages/cssBlendMode/)

### 範例介紹

- Background Blend Mode：背景的混合模式
- Background Color：\*背景色彩
- Text：中央文字
- Text Color：\*文字色彩
- Text Mix Blend Mode：中央文字的圖層混合模式
- Background URL：背景網址 (預設是超辣的朝天椒)

\* 如果你的瀏覽器不支援 HTML5 input 選色的，可以直接輸入色碼或是色名，如(`#FF0000` or `red`)

### CSS 值

`background-blend-mode` 及 `mix-blend-mode` 這兩種混合模式的值是相同的，這些值是不是似曾相識呢!?這些與繪圖軟體的混合模式工具是相同的唷～。

- normal
- multiply
- screen
- overlay
- darken
- lighten
- color-dodge
- color-burn
- hard-light
- soft-light
- difference
- exclusion
- hue
- saturation
- color
- luminosity

## 結語

透過直接的範例，減少用文字的說明，可以較快速的了解 CSS 的特性，畢竟 CSS 主要是用來處理視覺上的效果。
