---
layout: post
title: 鐵人賽 16 - 將 Bootstrap 導入自動化流程
category: css
tagline:
tags: [css, Bootstrap]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/16_bootstrap_header.jpg
published: true
---

先前的流程我們將 Gulp 的基礎流程已經建立起來了，現在我們要將 Bootstrap 導入自動化流程，讓接下來的客製化更為容易。

<!-- more -->

## Bower

本範例是使用大家所習慣的 Bootstrap 3，如果想用 4 的朋友可以自行修改，手法是幾乎一致的。

範例：https://github.com/Wcc723/ironman-gulp-sass/tree/v0.6.bootstrap

Bower 是前端的套件管理工具，也有許多開發者會使用 NPM 來一起管理，但我個人除了使用 Webpack 以外還是習慣用 Bower 在管理前端套件。

Bower: https://bower.io/

使用 Bower 以前要先安裝 Bower 的工具，而它分為兩個部分，全域的 Bower 指令與專案的 `bower.json`：

首先，先在電腦內安裝 bower (需使用先前的 npm 環境)：
npm install -g bower

接下來打開本篇範例，本篇範例已經準備好了 `bower.json`，這時候只要下 bower install 就能夠開始安裝 `bower.json` 內的套件檔案。

```
bower install
```

![](/images/2016_ironman/16_bootstrap_01.png)

接下來專案內會新增對應的檔案，Bootstrap 的套件需要使用到 jQuery ，此時也會一並出現。

![](/images/2016_ironman/16_bootstrap_02.png)

## Gulp

這時候已經將 Bootstrap 下載到本地端的資料夾，當然我們也可以用 HTML 直接 `<LINK>` CSS，不過這樣就無法自定義樣式，先打開 gulpfile.js 看看修改了什麼吧

```js
var path = {
  source: './source/',
  public: './public/',
  bower: './bower_components/'    // 新增 Bower 的路徑
}

gulp.task('sass', function () {
  var processors = [
      autoprefixer({browsers: ['last 5 version']})
  ];
  return gulp.src(path.source + 'scss/**/*.scss')
    .pipe(plumber())
    .pipe(sass(
      {outputStyle: 'expanded',
      includePaths: [path.bower + 'bootstrap-sass/assets/stylesheets']} // 新增 includePaths 將 Bootstrap 載入
    ).on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest(path.public + 'stylesheets'));
});
```

`includePaths` 是 Sass 的功能，他可以載入其他路徑的 `.sass` 作為擴充載入，這部分就是將 Bower 中的 Bootstrap 載入。

### 完成

打開 `all.scss` 做以下的調整，直接用 `@import "bootstrap";` 就可以將 Bootstrap 載入。

```css
$primary-color: blue;

body {
  color: $primary-color;
}

@import "bootstrap";
```

![](/images/2016_ironman/16_bootstrap_03.png)

最後的結果如上，一開始的 color: blue 是我們自己定義的，而後方開始就是完整的 Bootstrap，接下來我們再來了解如何去調整 Bootstrap 的樣式。
