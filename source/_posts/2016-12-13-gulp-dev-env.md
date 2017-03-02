---
layout: post
title: 鐵人賽 13 - Gulp - 在本地端製作 Icon Fonts
category: css
tagline:
tags: [css, gulp]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/13_gulp_header.jpg
published: true
---

網頁設計都會需要大量的小 icon，現在的 icon 都傾向使用 web fonts 來處理，因為 web font 所製作的 icon 有以下的好處：

* 載入容易，HTML 只要載入一隻 CSS 就搞定
* 套用容易，只要透過 Class 就能套用
* 可自由調整大小、色彩

<!-- more -->

雖然只能使用單色，但在開發的便利性上還是有不少人選擇 icon font，目前大家所選擇主流 icon fonts 有以下：


* FontAwesome：http://fontawesome.io/
    * 相當完整的 web font icons
    * 可滿足大多的開發需求
    * 我還參與 Font Awesome 的募資 >O<：
    https://www.kickstarter.com/projects/232193852/font-awesome-5?ref=1oakzw
* IcoMoon：https://icomoon.io/
    * 可以自選 icons
    * 可以自定義 icons
    * 付費可以使用它們的 CDN
* Google Material Icon：https://material.io/icons/
    * 很潮，Google 出的
    * icon 可以被搜尋、選取

除了以上幾種不同選擇外，大家應該也會想知道 "如果想自己做呢!?"，這次就來介紹怎麼用 Gulp 來自定自己的 icon fonts。

## gulp iconfont

這一個套件會將 `.svg` 的檔案轉換成字體，接下來在轉換成 CSS 供開發者使用。

範例程式碼：https://github.com/Wcc723/ironman-gulp-sass/tree/v0.4.icon-fonts

使用套件：https://www.npmjs.com/package/gulp-iconfont

經過這幾次的練習，相信大家應該了解 gulp 的開發順序，我們會先打開 `package.json` 將所需要的套件載入，這次新增的套件有 `async`、`gulp-consolidate`、`gulp-iconfont`。

```json
"dependencies": {
    "async": "^2.1.4",
    "autoprefixer": "^6.5.3",
    "gulp": "^3.9.1",
    "gulp-consolidate": "^0.2.0",
    "gulp-iconfont": "^8.0.1",
    "gulp-plumber": "^1.1.0",
    "gulp-postcss": "^6.2.0",
    "gulp-sass": "^2.3.2"
}
```

接下來打開 `gulpfile.js` 加入以下的 Task。

```js
// icon fonts
gulp.task('iconfonts', function(done){
  var iconStream = gulp.src([path.source + 'icons/*.svg'])    // 載入 svg
    .pipe(iconfont({ fontName: 'icon' }));                    // 定義 fontName

  async.parallel([
    function handleGlyphs (cb) {
      iconStream.on('glyphs', function(glyphs, options) {
        gulp.src(path.source + 'css_template/iconfonts.css')  // 取用要輸出的 CSS 樣板
          .pipe(consolidate('lodash', {
            glyphs: glyphs,
            fontName: 'icon',
            fontPath: '../fonts/',                            // CSS 對應的字體路徑
            className: 'all-my-class'                         // CSS Class 的前輟詞
          }))
          .pipe(gulp.dest(path.public + 'stylesheets'))       // CSS 輸出資料夾
          .on('finish', cb);
      });
    },
    function handleFonts (cb) {
      iconStream
        .pipe(gulp.dest(path.public + 'fonts/'))              // 字體輸出資料夾
        .on('finish', cb);
    }
  ], done);
});
```

除了 SVG 以外，在 gulpfile.js 還有列出一個 css template，這是用來產出 iconfont 所需的 CSS 檔案樣板，在我所提供的範例中已包含 template 的樣板，大家可以直接參考。

```
|- /source        # 專案資料夾 (sass 位置)
  |- css_template # webfont 需要的 css 樣板
  |- icons        # .svg 原始檔位置
|- /mode_modules  # node.js 套件資料夾
|- /public        # 專案匯出的資料夾
|- .gitignore
|- gulpfile.js    # gulp 腳本檔案
|- package.json   # 套件管理 json
```


接下來執行 `gulp iconfonts` public 就會產生一個字體檔以及 CSS 檔案，接下來我們在 HTML 中載入 CSS 檔案，就可以開始使用 icon font 囉～。

![](/images/2016_ironman/13_gulp_iconfonts_01.png)

## 結語

在使用這功能時，要思考團隊中是不是有專門的設計師能繪製 icon ，以及 icon 不足時能不能有專人提供，避免用了這個功能，卻無法做良好的維護。
