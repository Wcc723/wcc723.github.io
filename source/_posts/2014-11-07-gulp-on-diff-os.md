---
layout: post
title: Gulp RUN ruby-compass
category: gulp
tagline: Gulp 最終篇
tags: [gulp, nodejs]
cssdemo:
jsdemo:
thumbnail:
published: true
---

最後一篇，來介紹gulp-compass，這一篇的內容較短，但是要特別注意系統是否可以運作ruby以及ruby compass(由於compass有更新)，所以和前一篇的差別會是多了ruby。

<!-- more -->

gulp-compass是呼叫ruby compass來運作，所以電腦內必須有ruby環境，所以建議先確認電腦內的ruby compass是否能正常運作，再來進行以下步驟。而目前compass的版本是1.01^，詳情就請參照compass官方網站。

[http://compass-style.org](http://compass-style.org)

## 安裝Compass

記得，在安裝compass與susy前，請確認電腦裡是否有ruby的環境，terminal內輸入`ruby -v`。

	ruby -v  

![](/images/gulp/screen_shot_gulp-4-01.png)

接下來輸入以下指令來安裝compass。可參考[http://compass-style.org/install/](http://compass-style.org/install/)

	gem update —system

	gem install compass


輸入`gem install susy`，來安裝susy。可參考[http://susydocs.oddbird.net/en/latest/install/](http://susydocs.oddbird.net/en/latest/install/)

輸入以下指令來驗證是否安裝成功

	compass -v

	gem -v susy

![](/images/gulp/screen_shot_gulp-4-02.png)

## gulp-compass

這一段和之前也相同，打開terminal輸入`npm install —save-dev`，安裝完後打開gulpfile.js。

這個範例已經包含常用的設定，當然也可以參考[https://www.npmjs.org/package/gulp-compass](https://www.npmjs.org/package/gulp-compass)。

```javascript
//gulpfile.js
var gulp = require('gulp'),
     concat = require('gulp-concat'),
     uglify = require('gulp-uglify'),
     webserver = require('gulp-webserver'),
     compass = require('gulp-compass'), //新增gulp-compass
     coffee = require('gulp-coffee');

gulp.task('compass', function() {
  gulp.src('app/sass/*.sass') //來源路徑
  .pipe(compass({ //這段內輸入config.rb的內容
    css: 'app/assets/css', //compass輸出位置
    sass: 'app/sass', //sass來源路徑
    sourcemap: true, //compass 1.0 sourcemap
    style: 'compact', //CSS壓縮格式，預設(nested)
    comments: false, //是否要註解，預設(true)
    require: ['susy'] //額外套件 susy
  }))
 // .pipe(gulp.dest('app/assets/temp')); //輸出位置(非必要)
});

gulp.task('watch', function () { //自定一個watch的排程名稱
  gulp.watch('./app/coffeescripts/*.coffee', ['coffee']); //監聽路徑，以及檔案變更後所執行的任務
  gulp.watch('./app/sass/*.sass', ['compass']);
});

gulp.task('default', ['coffee','compass','webserver','watch']);
```


接下來輸入gulp，就可以開始使用compass 1.0了，當然這邊要特別注意susy，這susy的版本是2，與1差異很大，如果安裝後想使用susy1，sass內import請輸入 @import “susyone”。

```sass
//sass 檔案內容
@import "compass/reset"
@import "compass"
@import "susy"

body
     background-color: black

.container
     +container(80em)
.span6
     color: orange
     +span(6 of 12)
```

會輸出成像下面這樣，還會包含source map。

```css
/*css reset…. 略*/

body { background-color: black; }

.container { max-width: 80em; margin-left: auto; margin-right: auto; }
.container:after { content: " "; display: block; clear: both; }

.span6 { color: orange; width: 49.15254%; float: left; margin-right: 1.69492%; }

/*# sourceMappingURL=style.css.map */
```


如果是從前面的相關文章開始看，目前gulpfile.js檔案結果會像下面這樣。

```javascript
var gulp = require('gulp'),
     concat = require('gulp-concat'),
     uglify = require('gulp-uglify'),
     webserver = require('gulp-webserver'),
     compass = require('gulp-compass'),
     coffee = require('gulp-coffee');

gulp.task('coffee', function() { //‘coffee'是排程名稱，可自定
     gulp.src('./app/coffeescripts/*.coffee') //來源檔案
          .pipe(coffee()) //編譯
          .pipe(concat('main.js')) //合併成一隻
          .pipe(uglify()) //壓縮、醜化
          .pipe(gulp.dest('./app/assets/js')) //輸出位置
});

gulp.task('webserver', function() {
  gulp.src('app') //起始目錄
    .pipe(webserver({
         host: '0.0.0.0', //host設定'0.0.0.0'，就可以用內網檢視
         port: 10000, //設定一個沒在使用的port
      livereload: true, //auto refresh
      open: true //執行gulp時自動開啟browser
    }));
});

gulp.task('compass', function() {
  gulp.src('app/sass/*.sass') //來源路徑
  .pipe(compass({ //這段內輸入config.rb的內容
    css: 'app/assets/css', //compass輸出位置
    sass: 'app/sass', //sass來源路徑
    sourcemap: true, //compass 1.0 sourcemap
    style: 'compact', //CSS壓縮格式，預設(nested)
    comments: false, //是否要註解，預設(true)
    require: ['susy'] //額外套件 susy
  }))
  // .pipe(gulp.dest('app/assets/temp')); //輸出位置(非必要)
});

gulp.task('watch', function () { //自定一個watch的排程名稱
  gulp.watch('./app/coffeescripts/*.coffee', ['coffee']); //監聽路徑，以及檔案變更後所執行的任務
  gulp.watch('./app/sass/*.sass', ['compass']);
});

gulp.task('default', ['coffee','compass','webserver','watch']);
```



Gulp 系列文章

- [Gulp 環境安裝
](/gulp/2014/09/22/gulp-install)
- [Gulp Task and Gulp Pipe](/gulp/2014/09/24/gulp-task)
- [Gulp webserver 以及在不同系統上運作 Gulp](/gulp/2014/11/06/gulp-on-diff-os)
- [Gulp RUN ruby-compass
](/gulp/2014/11/07/gulp-on-diff-os)
