---
layout: post
title: Gulp webserver 以及在不同系統上運作 Gulp
category: gulp
tagline: Gulp 還未結束
tags: [gulp, nodejs]
cssdemo:
jsdemo:
thumbnail:
published: true
---

透過以上兩篇，基本上已經可以套用許多gulp的工具，而這篇要介紹的是gulp webserver，以及在不同環境使用gulp (mac OS, Windows)。

<!-- more -->

## Gulp web server

首先，先裝gulp-webserver，這一套已經包含許多功能，甚至livereload都已經含在內部。

	npm install --save-dev gulp-webserver

一樣打開Gulpfile.js，加上以下js。

```javascript
var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	webserver = require('gulp-webserver’), //定義webserver
	coffee = require('gulp-coffee’);

gulp.task('webserver', function() {
	gulp.src('app') //起始目錄
	.pipe(webserver({
		host: '0.0.0.0', //host設定'0.0.0.0'，就可以用內網檢視
		port: 10000, //設定一個沒在使用的port
		livereload: true, //auto refresh
		open: true //執行gulp時自動開啟browser
	}));
});

gulp.task('default', ['coffee','webserver','watch']); //加上web server
```

接下來一樣回到`terminal`，輸入`gulp`，就會直接打開web，webserver這一套直接可以auto refresh，而且在跨裝置的情況下一樣可行。

> **特別注意：如果有開啓其他有auto refresh的軟體，可能會造成其中一方auto refresh失效(EX:Fire.app)。**

![/images/gulp/screen_shot_gulp-3-01](/images/gulp/screen_shot_gulp-3-01.png)

> 這時候修改index.html或者是其他檔案修改後都會自動refresh，也不需要額外安裝套件(所以沒有限定Chrome)。

![](/images/gulp/screen_shot_gulp-3-02.png)

> 接下來直接使用wifi的內網ip加上port，也可以直接瀏覽，這個網址直接複製到使用相同wifi的裝置上也是可行的。

![](/images/gulp/screen_shot_gulp-3-03.png)

> 修改內文也一樣，裝置上的網頁也會自動refresh。

## 在windows上執行Gulp

先前的所有範例，都是在Mac上做範例，如果此時加入使用其他環境的開發該如何配合？且Git上如何管理？

在剛剛所介紹的範例中，所有的gulp 套件都會安裝在`node_modules`這個資料夾內，只要透過package.json，就可以一個指令安裝回所有的套件。所以如果有使用git，就可以直接忽略這個資料夾，同理，在給其他開發者，也不需要這個資料夾。

![](/images/gulp/screen_shot_gulp-3-04.png)

> 將整個專案移到windows內(不需要`node_modules`資料夾)。

![](/images/gulp/screen_shot_gulp-3-05.png)

> 只需要保留gulpfile、package.json、app資料夾即可。

![](/images/gulp/screen_shot_gulp-3-06.png)

輸入npm install ，就可還原`node_modules`資料夾，接下來一樣執行`gulp`就可以運行了。

![](/images/gulp/screen_shot_gulp-3-07.png)

這樣就可以還原整個專案，且在不同作業系統都可以正常運作。
