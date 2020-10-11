---
layout: post
title: Bootstrap 5 格線的運作原理
category: development
tagline:
tags: [css, scss, bootstrap]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Firon2020_25.jpg?alt=media&token=12703e8e-5550-4cee-938c-e735d0d060f0
published: true
---

{% raw %}
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.0-alpha2/css/bootstrap-grid.min.css">
<style>
.box {
  height: 100px;
  background-color: #69F0AE;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
{% endraw %}

Bootstrap 4 中我經常會建議學員不要自行調整水平間距，因為在不熟悉的情況下這可能會造成許多額外的問題，常見的情況有：

- 整體的格線風格不一致
- 格線左右無法對齊
- 可能會產生水平捲軸

這些錯誤容易被細心的使用者發現，對整體的網站造成不好的印象。而這個問題在 Bootstrap 5 獲得了改善，並且有大幅度的優化（僅產生少量的 CSS 就能達到數十種變化），如果熟悉自行編譯的方式，甚至可以自訂網站合適的間距，就讓我們來看看 BS5 的格線概念吧！

## 可自行調整的間距（gutters）

Bootstrap 4 中主要是透過 `.row`, `form-row` 以及加入 `no-gutters` 來控制格線的間距，在這幾個搭配下主要會產生三種間距的距離，分別是 `30px`、`10px`、`0px`，在大部分情境這幾種就已經足夠使用，但偏偏網站開發就是需要那些不足夠的部分。

Bootstrap 5 加入新的 Gutters 概念，是使用 `g*-*` 來設定格線的間距（文檔可[參考](https://v5.getbootstrap.com/docs/5.0/layout/gutters/#row-columns-gutters)），其中：

- 前者的 *：標示 x 軸或 y 軸的水平或垂直空間，也可以省略表示 "垂直及水平"。
- 後者的 *：標示 0 ~ 5 的數值表示距離，數值越大間距越大。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_10_9_%E4%B8%8B%E5%8D%882_50.png?alt=media&token=81fc250c-2b77-40ec-b947-1b2bea6f3018)

`g*-*` 只需要加入到格線中的 `.row` 層級，其內部的 `.col-*` 不需要另外的調整就可以運作；也因為新的 Gutters 概念，原有的 `.no-gutters` 及 `.form-row` 在第五版都被移除了，接下來就透過實際案例來介紹運用方法吧。

開始前，先定義一個方塊作為內容，高度 100px、寬度不限，接下來由格線決定的方塊的寬度、位置，方塊的原始碼及實際呈現如下。

```css
.box {
  height: 100px;
  background-color: #69F0AE;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

{% raw %}
<div class="demo">
  <div class="box"></div>
</div>
{% endraw %}
> 等等會一直看到這個方塊，此**方塊所代表的就是內容**。

過去，會定義 `.row > .col-*` 的格線結構，Bootstrap 5 中只需要將上述的 `g*-*` 加入到 `.row` 即可，以下範例中就加入了水平(`x`)的間距，分別是 5 以及 1 兩種不同尺寸。

```html
<div class="row gx-5">
  <div class="col">
    <div class="box"></div>
  </div>
  <div class="col">
    <div class="box"></div>
  </div>
</div>
<hr>
<div class="row gx-1">
  <div class="col">
    <div class="box"></div>
  </div>
  <div class="col">
    <div class="box"></div>
  </div>
</div>
```

使用 `gx-*` 所加入的間距不會像過去一樣影響格線的運作，並且能夠與不使用格線的物件左右對齊。

{% raw %}
<div class="demo">
<div class="box">沒有使用格線的物件</div>
<hr>
<div class="row gx-5">
  <div class="col">
    <div class="box">使用 gx-5 的區塊</div>
  </div>
  <div class="col">
    <div class="box"></div>
  </div>
</div>
<hr>
<div class="row gx-1">
  <div class="col">
    <div class="box">使用 gx-1 的區塊</div>
  </div>
  <div class="col">
    <div class="box"></div>
  </div>
</div>
</div> 
{% endraw %}

### Bootstrap 5 如何實作這個概念？

套用了 `g*-*` 概念以後，Bootstrap 會不會變得很肥大？

在原有的 CSS 概念中，如果要調整外層、內層的樣式時，就需要每個元素都設定樣式才可運作，在此同時操作了 `.row` 及 `.col-*`，尤其是 `.col-*` 又有數十種變化型，一一套用的情況下檔案不就肥死。

Bootstrap 5 在此巧妙了使用變數的技巧，透過變數的階層控制，就不需要一一覆蓋所有的樣式。

在此提供另一個範例程式碼來進行介紹：

- 外層由 `.casper`, `.ming` 來設定變數值。
- 內層直接使用 `var(--bg-color)` **取得外層的變數**。

```css
.casper {
  --bg-color: orange;
}
.ming {
  --bg-color: skyblue;
}
.custom-box .box {
  background-color: var(--bg-color);
}
```

這種方式內層就不需要一一定義，僅需要調整外層的變數值即可套用至內層，當需要調整的樣式較多時就可使用此技巧。

{% raw %}
<style>
.casper {
  --bg-color: orange;
}
.ming {
  --bg-color: skyblue;
}
.custom-box .box {
  background-color: var(--bg-color);
}
</style>
<div class="demo">
  <div class="box">原始的 .box</div>
  <hr>
  <div class="casper custom-box">
    <div class="box">外層為 .casper 的 box</div>
  </div>
  <div class="ming custom-box">
    <div class="box">外層為 .ming 的 box</div>
  </div>
</div>
{% endraw %}

## Gutters 更多的延伸運用

既然有了變數的加持，再多的間距也不用太擔心，因此 Bootstrap 5 所提供的預設間距變化型分別如下：

方向性的調整：
- `x`：水平空間
- `y`：垂直空間
- ` `：不填值的上右下左四個方向

距離的調整：
- 0：沒有間距
- 1 ~ 5：由小至大的不同距離

所以除了水平空間外，也可以統一為了所有元素加入垂直空間，參考如下：

```html
<div class="row gy-2">
  <div class="col-6">
    <div class="box"></div>
  </div>
  ...
</div>
```

透過此方式就不需要為內層的元素一一加上 `.my-2`（用過 Bootstrap 4 相信都能理解這是一件麻煩的事情）。

{% raw %}
<div class="demo">
  <div class="row gy-2">
    <div class="col-6">
      <div class="box"></div>
    </div>
    <div class="col-6">
      <div class="box"></div>
    </div>
    <div class="col-6">
      <div class="box"></div>
    </div>
    <div class="col-6">
      <div class="box"></div>
    </div>
  </div>
</div>
{% endraw %}

或者，可以直接為垂直、水平加入相同的間距。

```html
<div class="row g-2">
  <div class="col-6">
    <div class="box"></div>
  </div>
  ...
</div> 
```

在過去要達到垂直、水平間距相同是相對麻煩的事情，但現在版本就簡單許多囉。

{% raw %}
<div class="demo">
  <div class="row g-2">
    <div class="col-6">
      <div class="box"></div>
    </div>
    <div class="col-6">
      <div class="box"></div>
    </div>
    <div class="col-6">
      <div class="box"></div>
    </div>
    <div class="col-6">
      <div class="box"></div>
    </div>
  </div> 
</div>
{% endraw %}

如果只需要格線但不要間距，就可套用 `g-0` 移除所有的間距。

```html
<div class="row g-0 border">
  <div class="col-sm-6 col-md-8"></div>
  ...
</div>
```

在此版本也移除了 `no-gutters`，直接使用 `g-0` 這個神奇的 className 進行取代。

{% raw %}
<style>
.border .box {
  border: 1px solid #4bc187;
}
</style>
<div class="demo">
  <div class="row g-0 border">
    <div class="col-sm-6 col-md-8"><div class="box">1</div></div>
    <div class="col-6 col-md-4"><div class="box">2</div></div>
  </div>
</div>
{% endraw %}


### 如果想要更多的間距怎麼辦

Bootstrap 4 以後都很強調自己是可以被客製的，在官方的文檔中也有提供調整 `Gutters` 的[說明文件](https://v5.getbootstrap.com/docs/5.0/layout/gutters/#change-the-gutters)，如果覺得這些 Gutters 太多、太少、間距不夠大，都可以隨意地增減。

```scss
$grid-gutter-width: 1.5rem;
$gutters: (
  0: 0,
  1: $spacer * .25,
  2: $spacer * .5,
  3: $spacer,
  4: $spacer * 1.5,
  5: $spacer * 3,
);
```

如果對於客製化 Bootstrap 有興趣，也可以參考[本篇文章](https://wcc723.github.io/development/2020/10/08/custom-bootstrap-style/)。