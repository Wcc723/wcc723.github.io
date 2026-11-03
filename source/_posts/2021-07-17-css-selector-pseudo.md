---
layout: post
title: CSS 選取器 - CSS Selector
category: development
tagline:
tags: [css]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FVue3-SummerCamp-Cover.png?alt=media&token=89a5f930-8ff8-471f-a200-228c4c9d26a9
published: false
---

## 元素選取器

<div class="demo">
  <a href="https://www.apple.com/" target="_blank">這是 Apple 官網連結</a>
</div>

```
<a href="https://www.apple.com/" target="_blank">這是 Apple 官網連結</a>
```
```css
a {
  background-color: red;
}
```

## 類別選取 .class


<div class="demo">
  <a href="https://www.apple.com/"
  class="a-link" target="_blank">這是 Apple 官網連結</a>
</div>

```
<a href="https://www.apple.com/"
  class="a-link" target="_blank">這是 Apple 官網連結</a>
```
```css
.a-link {
  background-color: red;
}
```

## id 選取

<div class="demo">
  <a href="https://www.apple.com/"
  id="a-link" class="b-link" target="_blank">這是 Apple 官網連結</a>
</div>

```
<a href="https://www.apple.com/"
  id="a-link" class="b-link" target="_blank">這是 Apple 官網連結</a>
```
```css
#a-link {
  background-color: yellow;
}
.b-link {
  background: blue;
}
```

## 屬性選取

### 包含特定 “屬性” 的選取

<div class="demo demo-2">
  <a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="https://www.google.com/"
    target="_blank">Google 官網連結</a> <br>
  <a target="_blank">連結缺少 href</a>
</div>

```
<a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a>
<a href="https://www.google.com/"
  target="_blank">Google 官網連結</a>
<a target="_blank">連結缺少 href</a>
```
```css
[href] {
  color: red;
}
```

### “屬性及值” 完全符合

<div class="demo demo-3">
  <a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="https://www.google.com/"
    target="_blank">Google 官網連結</a> <br>
</div>

```
<a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a>
<a href="https://www.google.com/"
  target="_blank">Google 官網連結</a>
```
```css
[href="https://www.apple.com/"] {
  color: red;
}
```

### 屬性值 ”包含特定字串“

<div class="demo demo-4">
  <a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="https://www.google.com/"
    target="_blank">Google 官網連結</a> <br>
</div>

```
<a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a>
<a href="https://www.google.com/"
  target="_blank">Google 官網連結</a>
```
```css
[href*="google"] {
  color: red;
}
```

### “開頭值” 包含特定文字

<div class="demo demo-5">
  <a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="http://www.google.com/"
    target="_blank">Google 官網連結</a> <br>
</div>

```
<a href="https://www.apple.com/"
  target="_blank">Apple 官網連結</a>
<a href="http://www.google.com/"
  target="_blank">Google 官網連結</a>
```
```css
[href^="https"] {
  color: red;
}
```

### ”結尾值“ 包含特定文字

<div class="demo demo-6">
  <a href="https://www.apple.com/tw/"
  target="_blank">Apple 官網連結</a> <br>
  <a href="http://www.google.com/"
    target="_blank">Google 官網連結</a> <br>
</div>

```
<a href="https://www.apple.com/tw/"
  target="_blank">Apple 官網連結</a>
<a href="http://www.google.com/"
  target="_blank">Google 官網連結</a>
```
```css
[href$="/tw/"] {
  color: red;
}
```

### 屬性選取 實戰操作

<div class="demo demo-7">
  <input type="checkbox">
</div>

```
<input type="checkbox">
```
```css
input[type="checkbox"] {
  appearance: none;
  border: 1px solid red;
  width: 1rem;
  height: 1rem;
}
input[type="checkbox"]:checked {
  background: red;
}
```

## 狀態選取器（偽類、虛擬類別）

常見狀態
連結、錨點使用
- active
- :focus
- invalid
- link


表單
- checked
- disabled
- indeterminate

不分類：
- empty
- not

偽類：
:first (en-US)
:first-child
:first-of-type
:fullscreen (en-US)
 (en-US)
:hover (en-US)
:indeterminate (en-US)
:in-range (en-US)
:invalid (en-US)
:lang()
:last-child (en-US)
:last-of-type (en-US)



複合選取器
- 鄰接 a + b
- 同層 a ~ b
- 直屬 a > b
- 後代 a b

<style scoped>
/* 本篇示範用的樣式：原本寫在內文的 <style>，合併到這裡並加上 scoped 與 :deep()，只作用在這篇文章 */
:deep(.demo-1 a) {
  background-color: red;
}
:deep(.a-link) {
  background-color: red;
}
:deep(#a-link) {
  background-color: yellow;
}
:deep(.b-link) {
  background: blue;
}
:deep(.demo-2 [href]) {
  color: red;
}
:deep(.demo-3 [href="https://www.apple.com/"]) {
  color: red;
}
:deep(.demo-4 [href*="google"]) {
  color: red;
}
:deep(.demo-5 [href^="https"]) {
  color: red;
}
:deep(.demo-6 [href$="/tw/"]) {
  color: red;
}
:deep(.demo-7 input[type="checkbox"]) {
  appearance: none;
  border: 1px solid red;
  width: 1rem;
  height: 1rem;
}
:deep(.demo-7 input[type="checkbox"]:checked) {
  background: red;
}
</style>
