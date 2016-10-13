---
layout: post
title: Compass 替代方案(2) - 透過 PostCSS，停止加入不必要的 prefix
category: sass
tagline:
tags: [sass, compass, gulp]
cssdemo:
jsdemo:
thumbnail: 2015/12/screen_shot_2015-12-25-00.png
published: true
---

承上篇，因為 `compass` 很久沒維護，所以在找替代方案。而這篇是要介紹很火紅的 `post-css`，主要是要解決 css3 prefix 的問題，`post-css`和 sass 不同的是，在 prefix 的方法不需要先定義成 `@mixin` ，可以在事後再決定是否加入 prefix，這讓不斷在更新改變的 prefix 流程簡化很多，並且可以有效減少 css 的檔案大小 (prefix 是很肥大的)。

Prefix 的減少速度也是相當快速，像是 `box-shadow` 的 Prefix 可能消失超過一年， `transform` 也大約一年左右不需要 Prefix，如果不想要明年慢慢的移除自己所種的 Prefix，或許可以參考看看 `post-css`的 autoprefixer 工具。

*如果還在使用Compass的使用者可以當作參考就好，工具還是要用得上手比較重要～*

<!-- more -->

## 什麼是 PostCSS

Sass、Less、Stylus 這些工具稱為預處理器，意指本身無法被直接使用，需要再編譯的語言，編譯後就能夠被瀏覽器渲染，副檔名也會從 `.sass` 改為 `.css`；而 `post-css` 本身就是 `.css`，只是透過工具去優化目前的 CSS。

目前 post-css 的社群就已經相當龐大，有許多插件也廣泛地被使用，如：

- autoprefixer: 可以加入 css3 prefix，甚至自訂 prefix 時代版本，或者是特定瀏覽器
- lost: grid system 工具，直接在 CSS 內寫類似 susy 的 grid
- cssnext: css 界的 ES6，讓你可以寫下一代的 CSS (可參考：[http://cssnext.io/features/](http://cssnext.io/features/))
- precss: 讓你可以在 css 內寫類似 sass 的語法 (例如：巢狀)

相關的插件是非常非常多的，這篇只會介紹 prefix ，如果有興趣的可以看 [PostCSS Plugins](https://github.com/postcss/postcss/blob/master/docs/plugins.md)。仔細看他的插件...，其實說他是另一種 sass 也不為過了...。

## 使用 postcss autoprefixer

持續更新的範例：[https://github.com/Wcc723/gulp-node-sass](https://github.com/Wcc723/gulp-node-sass)

會選擇引入 `autoprefixer` 主要是因為 `compass` 很久沒更新，許多 prefix 已經沒在使用，如果要自己一個一個設定也需要花很多時間。像是 `Bootstrap 3` sass 版本，也是由開發團隊寫 prefix @mixin，這都面臨相同的問題 **“專案的 CSS Prefix 到底是哪個時代啊!?”** 。

*最近為了客制 Bootstrap 3 刪 Prefix 也是刪的很累啊...*

```javascript
var gulp = require('gulp'),
  // PostCSS
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'); // postCSS 的套件原則上都是要一個一個載入

var paths = {
  'source': './source/',
  'bower' : './bower_components/',
  'sass': './source/stylesheets/',
  'img': './source/images/',
  'public': './public/',
  'tpls': './gulp-tpls/'
}

// postCSS
gulp.task('css', function () {
  // 在 processors 內定義需要用哪些套件，這邊只有使用 autoprefixer
  var processors = [
    autoprefixer({browsers: ['last 1 version']})
  ];
  watch(paths.public + 'stylesheets/**/**.css', function(){
    gulp.src(paths.public + 'stylesheets/**/**.css')
      .pipe(plumber())
      .pipe(concat('all.css'))
      .pipe(postcss(processors))
      .pipe(gulp.dest(paths.public + './css'));
  });
});

gulp.task('default', ['css']);
```

這段程式碼僅是局部，在我的範例內是由 `node-sass` 編譯完再由 `post-css` 處理。

就已最新版的瀏覽器設定來說，其實大部分 `prefix` 其實都已經不用加入了，如：`flex`、`transform`、`backgroud`等，就下面的範例來說，只有 `filter` 需要 prefix。

![](/images/2015/12/screen_shot_2015-12-25-00.png)

如果說，產品的使用者客群略微廣些，只要大於一個百分比的使用者都需要重視，可以修改插件的設定檔，如下 (市佔率大於 1%，且連IE 7 都不放過)。

    var processors = [
        autoprefixer({browsers: ['> 1%', 'IE 7']})
      ];

那麼如果有支援的 prefix 他都會加入，會得到以下結果：

![](/images/2015/12/screen_shot_2015-12-25-01.png)

其實會發現，`-moz-`、`-o-`這些也不存在啊啊啊啊，**Oprea** 已經改用webkit，**Firefox** 強制更新，目前市面上的版本不需要 Prefix。

## 線上玩玩 PostCSS

另外 [Codepen](http://codepen.io/pen/) 也有提供 post-css 的環境，只要在 CSS 的區域下選擇設定 > `CSS Preprocessor` > `PostCSS` 就可以使用 `@use` 加入想使用的 `post-css` 插件。

![](/images/2015/12/screen_shot_2015-12-25-02.png)

如下圖，透過 `@use cssnext;` 就可以使用 `cssnext` 插件。

![](/images/2015/12/screen_shot_2015-12-25-03.png)

## 結語

Autoprefixer 是目前 post-css 看到最必須導入的工具，有效減少 prefix 的問題。其他的工具 `cssnext`、`lost`等等，目前僅會做測試或研究並不會導入。
