---
layout: post
title: Reactjs JSX格式轉換
category: js
tagline: by gulp
tags: [js, reactjs]
cssdemo: 2015-spring
jsdemo: 
thumbnail: 
published: true
---

剛接觸React.js通常遇到一個問題，就是開發環境怎麼配置，原因在於JSX的格式需要轉換。JSX讓javascript內可以插入html tag，雖然是可以選擇使用，但官方也建議使用JSX格式來進行開發，如果對於React.js有興趣的，不妨參考一下這篇JSX格式轉換吧。

<!-- more -->

參考文章：[http://tylermcginnis.com/reactjs-tutorial-pt-2-building-react-applications-with-gulp-and-browserify/](http://tylermcginnis.com/reactjs-tutorial-pt-2-building-react-applications-with-gulp-and-browserify/)

## 安裝Node.js & Gulp

首先要先安裝Node.js 和 Gulp，如果還沒安裝的可以參考我之前的文章。

[/gulp/2014/09/22/gulp-install/](/gulp/2014/09/22/gulp-install/)

## 檔案格式架構

建立以下的檔案

	gulpfile.js
	|-- app
		|-- index.html
		|-- js
			|-- app.js

### index.html code

`<script src="app/app.js"></script>`放在body後方，只是要避免dom的錯誤。

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>React.js</title>
  <script src="http://fb.me/react-0.13.1.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
<!-- build:js -->
<script src="app/app.js"></script>
<!-- endbuild -->
</html>
```

### app.js code

僅是要測試JSX用。

```javascript
var Child = React.createClass({
  render: function(){
    return (
      <div>
        and this is the <b>{this.props.name}</b>.
      </div>
    )
  }
});
var Parent = React.createClass({
  render: function(){
    return (
      <div>
        <div> This is the parent. </div>
        <Child name="child"/>
      </div>
    )
  }
});

React.render(<Parent />, document.getElementById('app'));
```


## 安裝gulp套件

在Terminal下依序輸入以下兩行指令，而`npm init`是用來建立package.json，輸入後會有一些問題，一直按Enter就可以了^ ^。

	$ npm init
	$ npm install gulp gulp-concat gulp-uglify gulp-react gulp-html-replace --save-dev

### gulpfile.js

這範例不包含webserver，主要是轉換JSX，如果對於gulp js很熟悉的使用者，也可只參考其中的JSX轉換即可。

```javascript
var gulp = require('gulp');
var concat = require('gulp-concat'); // 串接
var uglify = require('gulp-uglify'); // 醜化js
var react = require('gulp-react');
var htmlreplace = require('gulp-html-replace');

// 定義變數
var path = {
  HTML: 'app/index.html',
  ALL: ['app/js/*.js', 'app/js/**/*.js', 'app/index.html'],
  JS: ['app/js/*.js', 'app/js/**/*.js'],
  MINIFIED_OUT: 'build.min.js',
  DEST_SRC: 'dist/app',
  DEST_BUILD: 'dist/build',
  DEST: 'dist'
};

// 建立任務，轉換JSX
gulp.task('transform', function(){
  gulp.src(path.JS)
    .pipe(react())
    .pipe(gulp.dest(path.DEST_SRC));
});

// 複製index.html到dist資料夾
gulp.task('copy', function(){
  gulp.src(path.HTML)
    .pipe(gulp.dest(path.DEST));
});

// 監控以上兩個任務
gulp.task('watch', function(){
  gulp.watch(path.ALL, ['transform', 'copy']);
});

// 定義預設動作
gulp.task('default', ['watch']);

// gulu build
gulp.task('build', function(){
  gulp.src(path.JS) 
    .pipe(react()) //轉換jsx
    .pipe(concat(path.MINIFIED_OUT)) // 串接所有js
    .pipe(uglify(path.MINIFIED_OUT)) // 最小化js
    .pipe(gulp.dest(path.DEST_BUILD));
});

// 轉換js路徑
gulp.task('replaceHTML', function(){
  gulp.src(path.HTML)
    .pipe(htmlreplace({
      'js': 'build/' + path.MINIFIED_OUT
    }))
    .pipe(gulp.dest(path.DEST));
});

// production 輸出
gulp.task('production', ['replaceHTML', 'build']);
```

到這部分基本上就完成了，只要透過`gulp`或`gulp production`就能預覽jsx轉換成js。


