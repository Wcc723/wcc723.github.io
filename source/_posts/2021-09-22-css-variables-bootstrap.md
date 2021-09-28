---
layout: post
title: CSS 變數必學知識 - 宣告、繼承及 Bootstrap 中的運用技巧
category: development
tagline:
tags: [css]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fcss_variables.png?alt=media&token=c73a7d92-ec73-4c63-a9e1-143bb06b7c41
published: true
---

在 Bootstrap 5 以後，大量導入 “CSS Variable” 的技巧，透過變數可以大幅增加 CSS 的可運用性，讓同一段程式碼透過修改變數的形式，大幅增加 CSS 的可用性，本篇將介紹 CSS 基本運用方式，以及在 Bootstrap 5 中如何運用此技巧來豐富性其用途。

## CSS 變數基礎運用方式
使用 CSS 變數時，一定會先定義其值，預設的情況下會在最外層的元素中定義變數以及值。

以下範例來說，就在根元素 `:root` 定義了 `--casper-color` 的變數，而後方的 `#00cc99` 將是他的值。

```css
:root {
  --casper-color: #00cc99;
}
```

在此也簡單說明定義變數的規則：
- 可以定義在任何元素上，而 `:root` 表示的是根元素
- 定義的變數會使用 `--` 在最前方，其後的名稱是自定義的
- `:` 後方則是變數值，值沒有特別的限制，大多都是與 CSS 值一致

當變數定義完以後，就可以呼叫此變數來運用它，以下範例就是直接取用剛剛所定義的色彩。 
```css
.box {
  background-color: var(--casper-color);
}
```

取值時的規則如下：
- 會使用 `var` 在變數的最前方
- 使用 `()` 包覆住變數
- 接下來就會套用變數所定義的值

接下來運行的結果如下，`.box` 元素套用了 `:root` 所定義的變數。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F98EC12D4-E550-413C-B62C-263469EC9B60.png?alt=media&token=3eaa61c2-be51-4129-83b4-e2cd6427293f)

接下來看看實際的範例，最外層定義了 `--casper-color` 變數，然後內層的 `.box` 取用其值套用在背景色上。

{% raw %}
<style>
:root {
  --casper-color: #00cc99;
}
.box {
  height: 100px;
  width: 100px;
  background-color: var(--casper-color);
}
</style>
<div class="demo">
  <div class="box"></div>
</div> 
{% endraw %}

## 變數的繼承特性
相對於 JavaScript 來說，CSS 運行時並不會改變其值，而既然它稱為 “變數” 但值不會改變該如何運用呢？

而 CSS 變數具有一個 “繼承特性”，換個簡單的說法就是它具有 “作用域的特性”。

以剛剛上述的程式碼來說，最外層定義了 `--casper-color` 變數，那麼內層所有元素都可以取用此變數的值。但如果在其 `:root` 的內層補上其它的同名變數，則會使用內層的變數值。

示意圖：內層取值時，會直接繼承最接近層級所定義的變數，當沒有任何可取用的值時，則使用根元素所定義的變數。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FBE4403D6-D2A3-4D5D-AF5B-6E05E8336A1F.png?alt=media&token=a333a090-f9a5-4df8-b7f0-1deeddd57ee1)

案例：如果在中間補一層 `.local`，那麼在其內部取值時，則會取用到 `.local` 的變數，而不是 `:root`。
```css
:root {
  --casper-color: #00cc99;
}

.local {
  --casper-color: orange;
}

.box {
  background-color: var(--casper-color);
}
```

運行結果：以下範例只有新增 `.local` 的變數，其餘程式碼與上段一樣，但在此的 `.box` 已被套用成橘色。

{% raw %}
<style>
.local {
  --casper-color: orange;
}
</style>
<div class="demo">
  <div class="local">
    <div class="box"></div>
  </div>
</div>
{% endraw %}

繼承規則與 CSS 權重概念一致，基本原則如下：
- 內層優於外層
- 當 Class 繼承變數為同層時，以權重高的為主

#### 使用不同的 class 定義不同的區域變數

透過區域變數的概念，取值的程式碼都可以不需要做調整，只要調整區域中的變數就可以不斷的改變內層的呈現。

以此範例來說，`.box` 的 CSS 與一開始所定義的無異，但卻能產生出多種變化的色彩。 
```css
.local-purple {
  --casper-color: purple;
}
.local-cyan {
  --casper-color: cyan;
}
```


## Bootstrap 5 的變數運用概念
在 Bootstrap 5 中的 `:root` 就有定義了許多可用的情境色彩（[文件連結](https://bootstrap5.hexschool.com/docs/5.0/customize/css-variables/)），當我們利用 Bootstrap 時，需要撰寫額外的元件時就可以直接取用這些變數的色彩。

除此之外，許多的元件、功能性模組都有額外定義的變數，例如格線系統中的 `.row` 就定義了 `--bs-gutter-x` 作為格線系統中的間隔值。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F2BC0F6B4-0DEE-46C2-8BAB-12B21A305489.png?alt=media&token=a84b4a50-c04f-40db-accc-ad012a9bcb1c)

當要調整格線之間的間隔時，可以在外層 `.row` 加上 `gx-1` ，而此 class 僅只有調整 `--bs-gutter-x` 的變數值，並沒有其它的樣式在內。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F22332055-E18C-4090-8253-38BAD360F36A.png?alt=media&token=85729206-6125-4e9e-b673-8f74de6892d3)

雖然沒有賦予其它的樣式，但是在內層的 `col-*` 就會繼承新覆蓋的值，透過這樣的方式，僅需要短短 3 行變數調整程式碼，就可以產生出不同間距的格線系統。

{% raw %}
<div class="demo">
  <div class="row">
    <div class="col-6">
      <div class="box w-auto"></div>
    </div>
    <div class="col-6">
      <div class="box w-auto"></div>
    </div>
  </div>
  <hr class="w-100">
  <div class="row gx-1">
    <div class="col-6">
      <div class="box w-auto"></div>
    </div>
    <div class="col-6">
      <div class="box w-auto"></div>
    </div>
  </div>
</div> 
{% endraw %}

原始碼如下：

```
<div class="row">
  <div class="col-6">
    <div class="box w-auto"></div>
  </div>
  <div class="col-6">
    <div class="box w-auto"></div>
  </div>
</div>
<div class="row gx-1">
  <div class="col-6">
    <div class="box w-auto"></div>
  </div>
  <div class="col-6">
    <div class="box w-auto"></div>
  </div>
</div>
```


#### 其它範例

除了格線系統以外，Bootstrap 亦將變數用在許多地方，在 Helpers 內的 Ratios(比例) 中，也是透過變數的技巧來調整不同的比例。

其中的 `ratio-16x9` 就是修改 `--bs-aspect-ratio`，其內層的元素套用此比例完成比例挑整樣式。 

{% raw %} 
<div class="ratio ratio-16x9">
  <iframe src="https://www.youtube.com/embed/XAdIuuU_90g?rel=0" title="YouTube video" allowfullscreen></iframe>
</div>
{% endraw %}

原始碼如下：

```
<div class="ratio ratio-16x9">
  <iframe src="https://www.youtube.com/embed/XAdIuuU_90g?rel=0" title="YouTube video" allowfullscreen></iframe>
</div>
```

除此之外，還可以直接使寫入其它變數值於 `style` 內，讓 CSS 的變數可用性大幅上升，以下範例來說就將 `--bs-aspect-ratio` 改為 `100%`，就可以將內嵌的影片比例給改為 1:1。

{% raw %} 
<div class="ratio" style="--bs-aspect-ratio: 100%;">
  <iframe src="https://www.youtube.com/embed/XAdIuuU_90g?rel=0" title="YouTube video" allowfullscreen></iframe>
</div>
{% endraw %}

套用方式，將變數改為 100%。
```
style="--bs-aspect-ratio: 100%;"
```

## 結語

相對於 Bootstrap 4 來說，我認為 v5 真正發揮特色的地方在於 “變數”。

雖然 Sass 可以透過簡短的語法產生大量的 CSS 程式碼，但這也意味著 CSS 檔案會不斷地擴增。因此許多設計概念在 v4 都受到了限制，例如：不同間距的 gutter（v4 只有三種，而這三種已經讓 Bootstrap 額外佔用許多容量）。

到了 v5 以後，除了原有的 Sass 之外，更靈活運用原生的 CSS 變數技巧，這些用法甚至會讓人感覺到「哇～原來變數可以這樣玩」。以格線系統來說，每次新增一種新的 gutter 僅需要增加 3 行 CSS（沒錯，包含 ClassName 就三行；至多不需要超過 5 行）

傳統的 CSS，至少要 60 行以上才能達到此效果，而 CSS 變數的 3 行影響到：
- 12 欄
- 5 種中斷點的欄線
- 外層 .row 的設計

當然，變數實際運用不僅如此，如果是搭配 JavaScript 更能做出許多變化，而除了本篇所介紹的方法外，你還有看過哪些方法呢？
