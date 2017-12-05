---
layout: post
title: CSS Grid 屬性介紹
category: css
tagline:
tags: [css, grid]
cssdemo:
jsdemo:
thumbnail: 
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fs_1E340AD7809EDC17E1CE05A890D5C5BC743073124AFCE711A7E632C8E15F1686_1489479687278_file.png?alt=media&token=b902a96f-d842-4148-9c7d-60a137e4c2e7
published: true
---

CSS gird 在最近 Chrome 更新已經慢慢開始支援 (就是還很久才會完全支援的意思)，開始之前還是來介紹一些語法。

與 CSS Flex 一樣，CSS Grid 用兩個部分來看比較快，一個是屬於外部容器的屬性，另一個是屬於內部容器的屬性；從外開始向內看可以加快理解的速度。

<!-- more -->

CSS Grid 可以做什麼呢？這邊提供一個簡單範例給大家看看，相同的 Grid System 如果使用 float 需要多很多層，還要注意清除浮動等等。在 CSS grid 的加持下每個 class 都僅需少量的屬性就可做到相同的效果。

{% raw %}
<p data-height="265" data-theme-id="0" data-slug-hash="gmedKW" data-default-tab="css,result" data-user="Wcc723" data-embed-version="2" data-pen-title="CSS Grid Layout" class="codepen">See the Pen <a href="http://codepen.io/Wcc723/pen/gmedKW/">CSS Grid Layout</a> by Wcc723 (<a href="http://codepen.io/Wcc723">@Wcc723</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="https://production-assets.codepen.io/assets/embed/ei.js"></script>
{% endraw %}


---

本篇內容有許多參考 https://css-tricks.com/snippets/css/complete-guide-grid/

## 外部容器

### dispaly

和 Flex 一樣，需要定義容器的顯示類型。

```css
.container {
  display: grid | inline-grid | subgrid;
}
```

### grid-template-columns, grid-template-rows

看完這個屬性，對於 CSS Grid 就會有基礎的了解。

Grid 和 flex 最大不同之處，透過 grid template 來定義版型的結構，分別由 column 及 row 定義出直排與橫列的格線，內容再依隔線作安排。

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fs_1E340AD7809EDC17E1CE05A890D5C5BC743073124AFCE711A7E632C8E15F1686_1489471771069_grid-start-end-a.png?alt=media&token=646e175a-0d08-4c45-b306-c067bccd9ac4 )


圖片來源：https://css-tricks.com/snippets/css/complete-guide-grid/


```
.container {
  grid-template-columns: <track-size> ... | <line-name> <track-size> ...;
  grid-template-rows: <track-size> ... | <line-name> <track-size> ...;
}
```

- track-size: 可使用彈性的長度、百分比或分數 (分數的部分需使用 fr 單位)
- line-name: 可自行命名的名稱 


![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fs_1E340AD7809EDC17E1CE05A890D5C5BC743073124AFCE711A7E632C8E15F1686_1489474448383_file.png?alt=media&token=9e749af7-2dfe-4e8a-8d2d-f8ed6b8dff65)


> 圖片：自己畫的

```css
.wrap {
  display: grid;
  grid-template-columns: 200px 50px auto 50px 200px;
  grid-template-rows: 25% 100px auto;
  height: 100vh;
  width: 940px;
  margin: 0 auto;
}
```

粉紅色的部分就是 grid-template-columns，黃色部份則是 grid-template-rows，**隔線排版就能靠上面一張圖了解**！grid-template-columns 定義水平方向的空間，grid-template-rows 定義垂直方向的空間，且可以使用大部分的單位數值。

```css
.wrap {
  grid-template-columns: repeat(2, 1fr 2fr) 100px;
  /* grid-template-columns: repeat({次數}, {格線...} | {格線...}) | {格線...}; */
}
```

這個地方在介紹兩個新東西，一個是 fr 這個單位，這個單位能夠將可用的 剩餘空間 做比例分割，以上面的 1fr 2fr 為例，空間將被分割成 1/3、2/3 兩個大小。
另一個是 repeat，可以重複隔線。

### grid-template-areas

透過 area 定義區塊在 template 上的位置，概念就是在畫面上登記屬於該元素的空間，此部分要內外元素一起看。

- 內元素 grid-area：定義空間的名稱
- 外元素 grid-template-areas：定義空間的位置，是透過幾組字串的組合，組合方式可以參考下圖及程式碼。

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fs_1E340AD7809EDC17E1CE05A890D5C5BC743073124AFCE711A7E632C8E15F1686_1489479687278_file.png?alt=media&token=b902a96f-d842-4148-9c7d-60a137e4c2e7 )


假設我們需要繪製如上的空間配置，上方出現 5 * 3 那麼會透過 grid-area 來命名小空間的名稱，再透過 grid-template-areas 來表示整體空間的配置，配置的方式是透過字串的方式組合。

```css
.wrap {
  display: grid;
  grid-template-columns: 200px 50px auto 50px 200px;
  grid-template-rows: 25% 100px auto;
  grid-template-areas:
    "header header header header header"
    "side  main main main main"
    "side footer footer footer footer";
  height: 100vh;
  width: 940px;
  margin: 0 auto;
}
.item-a {
  grid-area: header;
  background-color: purple;
}
.item-b {
  grid-area: main;
  background-color: orange;
}
.item-c {
  grid-area: side;
  background-color: green;
}
.item-d {
  grid-area: footer;
  background-color: gray;
}
```

注意：

- 空間不能分離且是唯一的，錯誤範例: `"side main side"`


### grid-auto-columns, grid-auto-rows

簡單版的 Grid，如果版型較為簡單，可以直接使用 grid-auto-{ cols or rows}。如果是簡易的 960 12欄 grid 設定如下即可。

```css
.row {
  display: grid;
  grid-auto-columns: 60px;
  grid-auto-flow: column;
  grid-gap: 20px;
  width: 940px;
  min-height: 100vh;
  margin: 0 auto;
}
```

### grid-auto-flow

Grid 的排列方式，以上面 12 欄排列 grid 來說，如果沒有設定 column，就會變成垂直排列。

```css
.row {
  grid-auto-flow: row | column | row dense | column dense
}
```

### grid-gap, grid-column-gap, grid-row-gap

格線的間隔包含垂直及水平，可參考如下。

```css
grid-column-gap: { grid-column-gap };
grid-row-gap: { grid-row-gap };
grid-gap: { grid-row-gap } { grid-column-gap };
```

### justify-items, justify-content, align-content

與 flex 的使用方法一樣，先跳過之後再補充

----------

## 內部容器

### grid-column-start, grid-column-end, grid-row-start, grid-row-end

物件所佔的空間位置，Column 及 Row 所到的起始點及終點

```css
.item {
  grid-column-start: <number> | <name> | span <number> | span <name> | auto
  grid-column-end: <number> | <name> | span <number> | span <name> | auto
  grid-row-start: <number> | <name> | span <number> | span <name> | auto
  grid-row-end: <number> | <name> | span <number> | span <name> | auto
}
```

- `<line>` - 用數字表示 物件 所在的線，可參考上一段的 template
- span `<number>` - 物件所佔用的欄位數
- span `<name>` - 物件所在的 grid 名稱
- auto - 自動的啦

```css
.item {
  grid-column-start: 2; /* 物件起始線 */
  grid-column-end: span 4; /* 終點線 = 物件所佔的空間數 */
  grid-row-start: 3; /* 物件起始線 */
  grid-row-end: auto; /* 不設定終點線 */
  background-color: red;
  z-index: 999; /* 欄位重疊可用 z-index 設定前後順序 */
}
```

### grid-column, grid-row

上面那段的縮寫，使用斜線 (/) 隔開屬性。

```css
.item {
  grid-column: 2 / span 4;
}
```

### grid-area

- `<name>`: 使用命名的方式，透過 `grid-template-areas` 來套用
- `<row-start>` / `<column-start>` / `<row-end>` / `<column-end>`:  指定 grid 線數或 grid 名稱來定位

```css
.item-a {
  grid-area: 2 / 2 / 4/ 4;
}
```

### justify-self, align-self

內容器的定位模式，與 flex 使用方式一樣。

---

Grid 目前想到的運用方面有：

- 滿版的排版，適合拿來做平面設計風格的排版
- 輕量的 grid system，或許下次 Bootstrap 就改用 Display grid 在排版了 ~_~。