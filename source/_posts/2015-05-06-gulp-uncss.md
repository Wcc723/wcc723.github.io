---
layout: post
title: 壓縮css的終極必殺技
category: gulp
tagline: uncss
tags: [gulp, nodejs]
cssdemo: 
jsdemo: 
thumbnail: 
published: true
---

CSS 再怎麼開起開壓縮，頂多縮個幾十k，uncss可以搜尋html內所用的class、id，再將`.css`內的多餘class or id移除，達到最佳化的壓縮。

<!-- more -->

## 注意

雖然標題很聳動，但是有個問題比較麻煩，就是他無法偵測動態產生的標籤，像是js產生的，所以在移除時可能會有些錯誤...。uncss有提供解決的方案，就是使用忽略，但實際上有可能自己都忘記忽略。

## 使用gulp

在先前的文章有介紹過[gulp](/gulp/2014/09/22/gulp-install/)，本篇也是會用gulp。

首先先安裝gulp-uncss

  $ npm install gulp-uncss --save-dev

### 簡單使用

npm可參考:[https://www.npmjs.com/package/gulp-uncss](https://www.npmjs.com/package/gulp-uncss)

文件:[https://github.com/giakki/uncss#within-nodejs](https://github.com/giakki/uncss#within-nodejs)
  
```javascript
var gulp = require('gulp');
var uncss = require('gulp-uncss');

gulp.task('default', function() {
  return gulp.src('site.css') //輸入的css
    .pipe(uncss({
      html: ['index.html', 'posts/**/*.html', 'http://example.com'], //檢查的頁面(網址也可)
      ignore: ['.ui-datepicker','dropdown'] // 忽略的class or id
    }))
    .pipe(gulp.dest('./out')); //輸出
});
```

### 壓縮範例如下

這次的壓縮並沒有針對js的問題加以修正，僅是範例而已。

![](/images/gulp/screen_shot_gulp-uncss-01.png)

> 壓縮前

![](/images/gulp/screen_shot_gulp-uncss-02.png)

> 壓縮後

透過這個方法，可以有效的壓縮css，但其實在使用上並沒有那麼容易(需要補上ignore)。