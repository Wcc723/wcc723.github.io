---
layout: post
title: Compass 替代方案(3) - 加入 SVG Sprites
category: sass
tagline:
tags: [sass, compass, gulp]
cssdemo:
jsdemo:
thumbnail: 2016/01/screen_shot_2016-01-03_02.png
published: true
---

`Compass` 的 `CSS Sprites` 是非常好用的工具，在以前有介紹過 `compass` 的 Sprites 作法，只要把圖片丟一丟就可以完成，而且也可以做 for Retina 版本，但是使用SVG 製作 Sprites 就沒有辦法。一直以來我都是以向量工具做設計，如果不能轉 SVG 這樣高品質的圖檔，對我來說也是挺困擾的。

這篇就要介紹如何使用 Gulp 來製作 SVG Sprites，並且同時產生一般 png 版本來相容於舊版的瀏覽器。

*先前的 Sprites 介紹文章*

- [Spriting with Compass](http://wcc723.github.io/css/2014/03/13/css-icon-sprites/)
- [Sprites for Retina](http://wcc723.github.io/css/2014/03/24/css-icon-sprites/)

<!-- more -->

## CSS Sprites

製作 CSS Sprites 不外乎就是要減少 HTTP Request(請求數)，藉此來達到更好的網站瀏覽效能。但 CSS Sprites 在製作上有點兒麻煩，一般來說會有以下流程。

1. 製作許多小圖示
2. 將小圖示合併成一張大張的圖
3. 依據每張小圖示給予對應的 `class`
4. 計算每張小圖在大圖中的絕對位置

取得每張小圖在大圖的絕對位置本身就是一件麻煩事，更麻煩的是如果大圖中要插入新圖，有可能會造成其他小圖需要更新座標 =..=。當然在以前介紹的 Compass 就能達到這些功能，而這次介紹的工具除了 Compass 原有的能力以外，還包含新的功能。

- 將 SVG 製作成 SVG Sprites
- 同時提供 `.png` 版本供舊版瀏覽器使用
- 同時提供 SVG 對應 HTML 說明文件。
- 可自訂產生的 CSS 樣式表


## 使用 SVG Sprites

持續更新的範例：[https://github.com/Wcc723/gulp-node-sass](https://github.com/Wcc723/gulp-node-sass)

這次用的套件是 [gulp-svg-sprites](https://www.npmjs.com/package/gulp-svg-sprites)，這個套件有個缺點就是 **#NOTICE - NOT ACTIVELY MAINTAINED** ...。不過他滿足我所需的所有功能，所以本篇還是用這個套件。

```javascript
var gulp = require('gulp'),
  // svgSprite
  svgSprite = require("gulp-svg-sprites")

var paths = {
  'source': './source/',
  'bower' : './bower_components/',
  'sass': './source/stylesheets/',
  'img': './source/images/',
  'public': './public/',
  'tpls': './gulp-tpls/'
}

// SVG Sprite
gulp.task('svg-sprite', function() {
  gulp.src('./source/images/sprites/*.svg') // 來源路徑
    .pipe(plumber())
    .pipe(svgSprite({
      svg: {
        sprite: "images/sprites/sprite.svg"  // 輸出 svg 路徑
      },
      cssFile: 'stylesheets/sprite.css', //輸出 css 路徑
      selector: "icons-%f",  // 前綴詞
      templates: {
        css: require("fs").readFileSync(paths.tpls + 'svg-sprite.css', "utf-8") // css 樣板
      }
    }))
    .pipe(gulp.dest(paths.public))
    .pipe(filter("**/*.svg"))
    .pipe(svg2png())
    .pipe(gulp.dest(paths.public));
});
watch('./source/images/sprites/*.svg', function() {
  gulp.start('svg-sprite');
});

gulp.task('default', ['svg-sprite']);
```

這段程式碼僅是局部，在我的範例內產生的 CSS 會再由 PostCSS 合併。

接下來準備一些 SVG ，其中還加入一張包含漸層的 Skype 圖示 (如果是 icon fonts 就無法直接使用漸層色或是更豐富的色彩)。

![](/images/2016/01/screen_shot_2016-01-03_01.png)

輸入 `gulp` 編譯完會得到 `sprite.css`、`sprite.png`、`sprite.svg`以及`sprite.html`這些檔案，打開 sprite.html 會看到本次專案 sprites 的說明文件。

![](/images/2016/01/screen_shot_2016-01-03_02.png)

這個範例檔可以看到有哪些 Sprites 可以用運用，並且可以切換背景色以及 html code 的提示。

![](/images/2016/01/screen_shot_2016-01-03_04.png)

和 Compass 不同在於它是屬於另外產生的CSS，有時候和本身專案的 CSS 可能會有衝突，它也能透過 css template 客制屬於專案的範本。

```css
{#common}.{common} {
  font-size: {baseSize}px;
}

.{common}:before {
  content:' ';
  vertical-align:middle;
  display: inline-block;
  background-image: url("{svgPath}");
  background-repeat: no-repeat;
  background-size: {relWidth}em {relHeight}em;
}

.no-svg .{common}:before {
  background-image: url("{pngPath}");
}{/common}
{#svg}
{#common}.{common}{/common}.{name}:before {
  background-position: {relPositionX}em {relPositionY}em;
  width: {relWidth}em;
  height: {relHeight}em;
}
{/svg}
```

## 注意

在製作 SVG 時，建議使用 **Sketch** 或 **Affinity Designer** 軟體，**Adobe Illustrator** 在轉 SVG 有可能會產生錯誤的格式造成無法製作 Sprites 。

*Illustrator 會將漸層轉成 Base64 ，並非 SVG的漸層*

本篇介紹的是 SVG Sprites，適合用在有色彩的圖案上，如果說專案只需要單色的圖示，建議可以使用 icon fonts 就可以了，icon fonts 的文章可以參考 [將 Sketch icons 轉成 web icon fonts](http://wcc723.github.io/tools/2015/11/20/sketch-convert-to-web-icon-fonts/)。
