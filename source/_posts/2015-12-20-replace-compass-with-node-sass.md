---
layout: post
title: Compass 替代方案(1) - 更快速的 Sass
category: sass
tagline:
tags: [sass, compass, gulp]
cssdemo:
jsdemo:
thumbnail: 2015/12/screen_shot_2015-12-20-01.png
published: true
---

[Compass](https://github.com/Compass/compass/) 是一套非常優秀的 Sass 擴充套件，從剛開始學 Sass 就一直用到現在，許多優點是一般 CSS 或 Sass 較難達到的，如：

1. CSS Sprites：可以將圖片轉成Sprite，並提供 CSS class。
2. CSS3 mixin：prefix 啊～
3. Vertical Rhythm：CSS 文字排版的救星。
4. image-url, image-size：圖片路徑的取代以及取得圖片的尺寸。

但現在有些問題讓我考慮放棄使用 Compass 如：

1. 很久沒更新，距離上次更新已將近一年
2. 基於ruby sass，效能較差，編譯速度慢
3. 因為久沒更新，很多 `css3 @mixin` 已不符合現在規範
4. CSS Sprites 沒有 SVG 版本

接下來會連續幾篇開始介紹透過 Node sass 取代 Compass 的相關技術研究，當然 Compass 不會馬上被取代，但也要準備好替代方案，畢竟工具只是要增加產能使用，並非一定要追最新的才行。

*如果還在使用Compass的使用者可以當作參考就好，工具還是要用得上手比較重要～*

<!-- more -->

## Compass 可以被取代的部分

Compass 功能那麼多，說實在要取代全部還真的不容易，另一方面就算取代了全部功能，也不一定容易上手，所以打算先從經常使用的功能去改變，並且適應看看。

1. CSS Sprites：這部分我從 gulp 中找到 svg sprites，稍微改寫一下就足以替代。
2. CSS3 mixin：這是Compass的一大特色，但也是令人詬病的地方，因為久沒更新許多 prefix 早已有改變，這部分我從 post-css 找到了解決方案。
3. Vertical Rhythm：還未解決。
4. image-url, image-size：通常取用image-url是用來做icon、背景圖，這部分如果可以用svg-sprites就可以解決，但如果是為了達到一些視覺效果必須使用 image-size 那就還沒有辦法了...。
5. clearfix, inline-block 等現成的mixin：還未解決，靠 Sass 的架構去處理。

目前這些解決方案都還在研究中，也會分幾篇介紹這些方法的優缺點，這篇會先介紹 `node-sass`。

## node-sass

持續更新的範例：[https://github.com/Wcc723/gulp-node-sass](https://github.com/Wcc723/gulp-node-sass)

在Bootstrap 3的時候，開發團隊選擇 `Less` 作為開發環境，其中一個原因是 `Sass` 編譯速度太慢了，後來 sass 提供了 [lib-sass](http://sass-lang.com/libsass)，讓不同的環境都可以運行sass，其中也包含了 `node-sass` ，因此現在 **Bootstrap 4** 也改為 `sass` 開發。

> **Moved from Less to Sass.** Bootstrap now compiles faster than ever thanks to Libsass, and we join an increasingly large community of Sass developers.
> *[http://blog.getbootstrap.com/2015/08/19/bootstrap-4-alpha/](http://blog.getbootstrap.com/2015/08/19/bootstrap-4-alpha/)*

如果說不使用 Compass， `node-sass` 將是一個不錯的選擇，我也嘗試使用 `node-sass` 編譯與 `ruby-sass` 編譯做比較，是相當有感的...(有些較具規模的compass專案會到達10秒以上的編譯時間)。

{% raw %}
<video width="986" height="400" controls autoplay>
  <source src="/images/2015/12/node-sass-vs-ruby-sass.webm" type="video/webm">
  <source src="/images/2015/12/node-sass-vs-ruby-sass.m4v" type="video/mp4">
Your browser does not support the video tag.
</video>
{% endraw %}

*影片中同時編譯 Bootstrap sass 版本，左邊是 `node-sass`，右方是 `ruby-sass`，都有包含sourcemaps，由於是同一個資料夾，所以是同時開始編譯。*

就編譯時間來看，大概都是 2 ~ 4，不過單位不同...，`node-sass`是 **毫秒**，`ruby-sass`是 **秒**。

使用 `node-sass` 可以參考 [gulp-sass](https://www.npmjs.com/package/gulp-sass)，另外在監控可以使用 [gulp-watch](https://www.npmjs.com/package/gulp-watch)，讓新增刪除檔案時也會被監控到。

```javascript
var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  sass = require('gulp-sass'),
  watch = require('gulp-watch');

// Paths
var paths = {
  'source': './source/',
  'bower' : './bower_components/',
  'sass': './source/stylesheets/',
  'img': './source/images/',
  'public': './public/',
  'tpls': './gulp-tpls/'
}

// Sass
gulp.task('sass', function() {
  gulp.src([paths.sass + '**/**.scss'])
    .pipe(plumber())
    .pipe(sass({outputStyle: 'nested'})
    .on('error', sass.logError))
      .pipe(gulp.dest(paths.public + './stylesheets'))
});

watch([paths.sass + '**/**.scss'], function() {
  gulp.start('sass', 'scss-lint');
});

gulp.task('default', ['sass']);
```

持續更新的範例：[https://github.com/Wcc723/gulp-node-sass](https://github.com/Wcc723/gulp-node-sass)

接下來還會介紹 `sass-lint`、`gulp-svg-sprites`、`gulp-postcss`，對於以上有其他建議也歡迎一起在下方留言。

另外...`Webm`真是好物，中間的那個短片就是`webm`，不到1mb的影片甚至比`gif`還小。
