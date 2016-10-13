---
layout: post
title: SVG 客製化 checkbox
category: tools
tagline:
tags: [tools]
cssdemo: 2015-summer
jsdemo:
thumbnail: 2015-10-19_01.png
published: true
---

先前有看到[酷炫的checkbox效果](http://tympanus.net/Development/AnimatedCheckboxes/)，一直想要做看看，最近在整理資料的時候發現還沒做(因為坑還很多)，這次就來介紹這樣的效果要怎麼完成。

<!-- more -->

在很久之前有寫一篇文章，是透過svg的stroke做動態描繪效果([CSS + SVG stroke動態描繪](http://wcc723.github.io/svg/2014/06/15/svg-css-stroke-animation/))，本篇也是利用類似的方法達成，另外還有參考一些文章。

#### 參考

- [http://tympanus.net/Development/AnimatedCheckboxes/](http://tympanus.net/Development/AnimatedCheckboxes/)
- [http://blogs.adobe.com/dreamweaver/2015/08/css-vs-svg-styling-checkboxes-and-radio-buttons.html](http://blogs.adobe.com/dreamweaver/2015/08/css-vs-svg-styling-checkboxes-and-radio-buttons.html)


## 先準備svg

![/images/2015-10-19_02.png](/images/2015-10-19_02.png)

這一個範例的重點還是在svg，最簡單的產生方式還是使用向量繪圖軟體繪製，在這個範例上是透過`sketch`繪製 `50px * 50px`的手繪風格路徑，在繪製的時候有些部分還是需要注意：

- 圖片大小與實際圖最好一樣大
- 盡量一個筆畫到底，如果兩個筆畫要做出先後效果，可以設定 `transition delay`
- 路徑的頭尾先後與繪製的先後順序有關

再轉成svg後僅需要原始碼，所以請用文字編輯器打開 `.svg`，接下可以參考以下的HTML結構，把 `.svg`的內容置入。

```html
<input type="checkbox" id="checkbox">
<label for="checkbox" class="label">
  Click me
  <svg width="50px" height="50px" viewBox="0 0 50 50" class="checkbox-draw">
  <!-- 剛剛轉出的svg請放這 -->
  </svg>
</label>
```

## CSS

CSS的重點一個部分是`checkbox`的選取器，透過 `:checked ~` 來控制後方的svg動畫是否啟用。

另一個重點就是 `stroke-dashoffset: 500;` 及 `stroke-dasharray: 500;` ，這就是效果繪製的重點，相關的細節可以參考[http://wcc723.github.io/svg/2014/06/15/svg-css-stroke-animation/](http://wcc723.github.io/svg/2014/06/15/svg-css-stroke-animation/)，只要將`stroke-dashoffset`的值修改為0，就會有描繪動畫的效果。

```css
#checkbox {
  opacity: 0;
  width: 50px;
  height: 50px;
}
.label {
  position: relative;
  display: inline-block;
  padding-left: 50px;
  cursor: pointer;
  font-size: 36px;
}
.checkbox-draw {
  width: 50px;
  height: 50px;
  position: absolute;
  left: -50px;
  top: 0;
  border: 2px solid white;
}
.checkbox-draw path{
  stroke-dashoffset: 500;
  stroke-dasharray: 500;
  transition: stroke-dashoffset .5s linear;
}
#checkbox:checked ~ label .checkbox-draw path {
  stroke-dashoffset: 0;
}
```

#### 完成效果

記得點一下看效果唷。

<iframe src="http://wcc723.github.io/WorkShop-gh-pages/stylingCheckbox/" frameborder="0" height="120px" width="100%"> </iframe>

[範例網址](http://wcc723.github.io/WorkShop-gh-pages/stylingCheckbox/)
