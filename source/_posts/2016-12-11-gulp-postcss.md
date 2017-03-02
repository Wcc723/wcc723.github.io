---
layout: post
title: 鐵人賽 11 - Gulp - 透過 PostCSS 加入 CSS Prefix
category: css
tagline:
tags: [css, gulp]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/11_gulp_header.jpg
published: true
---

說到 CSS prefix 相信大家都不是很清楚當下主流版本的 prefix 有哪些是必要？又有哪些是不必要的？

以往都是使用 Sass 的 Compass 來加入 prefix，這種增加方式就是無差別的加入，但其實現在的 CSS 有 9 成以上的 prefix 都沒有加入的必要，相信在短期內除了測試的 CSS 以外，都不需要再加入 prefix。

<!-- more -->

現在寫入 prefix 以後還要移除也是個大工程，這時候推薦使用 PostCSS 的 autoPrefixer。PostCSS 類似 Sass，但是他是直接編譯 `.css` 檔案，另外他的套件都是用插件的方式載入，並不是像 Sass 已經有固定的寫法。這邊特別推薦他的 autoPrefixer 套件，使用上也非常容易，對於往後的維護也是無痛更新。

## PostCSS

範例：
https://github.com/Wcc723/ironman-gulp-sass/tree/v0.2.postcss

延續前一篇的進度，這篇加入兩個新套件 `gulp-postcss`、`autoprefixer`，在 `package.json` 的檔案內可以找到這段：

```json
"dependencies": {
    "autoprefixer": "^6.5.3",
    "gulp": "^3.9.1",
    "gulp-postcss": "^6.2.0",
    "gulp-sass": "^2.3.2"
}
```

接下來修改 gulpfile.js 內的 sass task，直接將 PostCSS 加到原有的 Sass 流程上就能運行了。

```js
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');

gulp.task('sass', function () {
  var processors = [                                 // 定義 postCSS 所需要的元件
      autoprefixer({browsers: ['last 5 version']})   // 使用 autoprefixer，這邊定義最新的五個版本瀏覽器
  ];
  return gulp.src('./source/scss/**/*.scss')
    .pipe(sass(
      {outputStyle: 'expanded'}
    ).on('error', sass.logError))
    .pipe(postcss(processors))                       // 將 PostCSS 插入流程
    .pipe(gulp.dest('./public/stylesheets'));
});
```

autoPrefixer 的瀏覽器版本可以自行定義，文件可參考：https://github.com/postcss/autoprefixer

這個範例是選擇 `'last 5 version'` (最新的五個版本瀏覽器)，如果是調整 `'last 2 version'` 那需要加入 prefix 的還真的沒幾個，大家也可以修改看看這段與編譯結果的差異。

## 編譯

這時候的開發流程不會有太多的改變，一樣是在 `all.scss`。

```
// 編譯前
$primary-color: blue;

body {
  color: $primary-color;
  filter: blur(5px);
}
```

編譯後 (含 PostCSS)。

```
body {
  color: blue;
  -webkit-filter: blur(5px);
          filter: blur(5px);
}
```

原有的 `.scss` 我略作些微調整，補上了 `filter`，這時候執行 `gulp sass` 就能看到 filter 加上了 `-webkit-` 的 prefix，如果說你看到的結果沒有加入 prefix，想必這篇文章年代已久遠，如果你堅持要使用 autoprefixer，可以參考文件，將 autoprefixer 的版本拉到 ie 7 那個年代 @_@。
