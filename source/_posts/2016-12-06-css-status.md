---
layout: post
title: 鐵人賽 6 - CSS 的元件狀態
category: css
tagline:
tags: [css, oocss]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/06_oocss_header.png
published: true
---

CSS 元件狀態重點可以分為兩部分，一個是原生的 CSS 偽類(Pseudo-classes)，另一則是配合 Javascript 所提供的 Class，在這部分相當在元件的初始時，就同時完成兩個部分。

<!-- more -->

## 元件狀態的套用方式

狀態再套用時，有兩種常見的手法，一則是使用 CSS 偽類(Pseudo-classes)，另一則是提供 Class 供 javascript 作切換。

一般在撰寫 CSS 時，就會將偽類規劃進去，最常見的就是 <a> 連結，其常用的偽類有：
* `:active` 滑鼠按下的樣式
* `:focus` 鍵盤聚焦的樣式
* `:hover` 滑鼠滑過的樣式
* `:link` 還沒被訪問的樣式
* `:visited` 被訪問過的樣式

假設是 `a:hover` 有製作以下的狀態，那麼用戶在滑鼠滑過後就能改變色彩。

```css
a:hover {
  color: blue;
}
```

但有時在呈現狀態時，並不是需要與用戶互動，而是回饋一個狀態讓用戶理解目前發生了什麼事。

如按鈕要表達已經被按下了，用戶不需要再按下一次，那麼我們可以用 `.active` 來說明這個狀態。或者用戶並沒有滿足按下按鈕的條件，我們可以用 `.disabled` 來呈現。

```css
.btn:active, .btn.active {
  color: blue;
}
.btn:disabled, .disabled {
  cursor: not-allowed;
}
```

## 一次做足元件狀態

元件狀態是初學網頁設計師經常忽略的內容，就以 input 來說就有以下常見的狀態
* 一般狀態
* focus
    * 用戶選取的狀態
* disabled
    * 無法選取的狀態
* feedback
    * 輸入錯誤或正確的回饋狀態


如果在設計時，僅有提供 input 的一般狀態及 Focus 的狀態，那麼在開發時就會因為元素狀態不足，需要不斷的增加，如果增加時又沒有依據原有邏輯新增，就容易讓程式碼變得難以維護。

```css
/* 125 行 */
.input {
  /* input style*/
}
.input:focus {
  border-color: blue;
}


/* 800 行 */
.input:disabled, .input.disabled{
  cursor: not-allowed;
}
```


所以建議在一開始時，就將常見的狀態先一次補足：

```css
/* 125 行 */
.input {
  /* input style*/
}
.input:focus {
  border-color: blue;
}
.input:disabled, .input.disabled {
  cursor: not-allowed;
}

/* success feedback */
.input.success {
  border-color: green;
}
/* error feedback */
.input.success {
  border-color: red;
}
```

## 結論

* 在寫偽類的時候別浪費，順便補上 `.class` 的樣式
* 在一開始寫的時候請順便規劃各種狀態
