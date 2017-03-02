---
layout: post
title: 鐵人賽 14 - Gulp - Webserver
category: css
tagline:
tags: [css, gulp]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/14_gulp_header.jpg
published: true
---

Gulp 很適合搭配任何其他的前後端結構，就先前介紹的幾個章節，只要略為修改輸入及輸出的路徑即可；除了搭配其他後端結構外，Gulp 也有適合直接開發的方法，本章會在介紹 Gulp Webserver，這樣就能夠直接在 Gulp 中開啟 Webserver。

<!-- more -->

## gulp webserver

範例程式碼：https://github.com/Wcc723/ironman-gulp-sass/tree/v0.4.icon-fonts

Gulp webserver 能夠在 gulp 運行的期間開啟 webserver，並且包含著 Livereload 的功能，只要修改專案中的資料夾檔案，就能夠自動的更新瀏覽器上的畫面，讓開發更迅速。

package.json: 僅有新增一個 gulp-webserver。

```json
"dependencies": {
  "async": "^2.1.4",
  "autoprefixer": "^6.5.3",
  "gulp": "^3.9.1",
  "gulp-consolidate": "^0.2.0",
  "gulp-iconfont": "^8.0.1",
  "gulp-plumber": "^1.1.0",
  "gulp-postcss": "^6.2.0",
  "gulp-sass": "^2.3.2",
  "gulp-webserver": "^0.9.1"
}
```

`gulpfile.js` 可以依據以下的方法設定。

```js
var webserver = require('gulp-webserver');  // 載入 webserver

// webserver
gulp.task('webserver', function() {
  setTimeout(function(){
    gulp.src(path.public)                   // 預設開啟路徑
      .pipe(webserver({                     // 啟動 webserver
        livereload: true,                   // Livereload 的功能
        open: false,                        // 是否自動開啟 瀏覽器
        host: '0.0.0.0',                    // 如果使用 0.0.0.0 的 ip，還會另外開啟 wifi 等對外網路
        port: 10000,                        // 開放通訊埠
      }));
  }, 1000);
});

gulp.task('default', ['others', 'sass', 'iconfonts', 'watch', 'webserver']);
```

設定完成後，一樣輸入 `gulp` 就會依序執行先前所設定的內容，而 Webserver 放在做後是確保所有流程完成後再開啟 Webserver ，使第一次執行專案的開發者也能夠執行。

## 結語

Gulp 介紹的目前為止，其實已經掌握大部分 Gulp 所使用的手法，接下來僅需要調整到合適的搭配環境即可；如果在開發上遇到 Gulp 不足的地方，可以到 NPM 的網站上透過 `gulp` 作為關鍵字，搜尋是否有其他套件可以使用。

![](/images/2016_ironman/14_gulp_webserver_01.png)

到目前所介紹的內容，也都只要略作修改，觀念都可以運用在任何的套件上，如果遇到任何問題，也歡迎來詢問我喔～。
