---
layout: post
title: Gulp 環境安裝
category: gulp
tagline:
tags: [gulp]
cssdemo:
jsdemo:
thumbnail: gulp/screen_shot_gulp01.png
published: true
---

鐵人賽我有準備一些文章，如網頁視覺設計(技巧、grid system)、前端設計工具的文章，比較偏向視覺設計以及前端工程的混和，但是鐵人賽我決定要換主題，所以文章就直接放出來(都寫了別浪費...)。

這一篇是Gulp的安裝，後來還有一系列的Gulp文章。


## Gulp 可以做什麼

Gulp 是一個前端任務管理工具，它可以做到如Fire.app、Prepros、Grunt等等所能做的事情，如果這樣還不是很了解，那就列表給大家看看。

- 編譯 SASS、Coffeescript
- 壓縮 `.CSS`, `.JS`, 甚至圖檔
- web server with Livereload
- 享受自己動手做Task工具的快感
- others..

雖然很多工具，都能做到類似的功能，但是如果需求不足的時候，就要開另一個工具來幫忙，如另外許多專案已經在執行中，或者是老專案，有些工具過於強大，就會顯得沒那麼合適，那麼就可以用gulp客製化屬於該專案使用的工具。

<!-- more -->


## Gulp 需求

在開始使用Gulp前，需要先安裝Node.js，Node.js 是一個讓 Javascript 運行在服務端的開發平台。它使用了 Google 的 V8 虛擬機(Google Chrome 瀏覽器使用的 Javascript 執行環境)。

另外還有npm，是由Node.js 官方提供的第三方管理工具，並且是一種在 Node.js 應用程式中建立、分享、重複使用模組，而npm在目前的版本，都會隨著Node.js的安裝同時安裝好npm。

簡而言之，我們使用Node.js的服務，透過npm管理工具。


## 安裝node js

*(這部分與先前安裝gitbook雷同)*

Node.js在
這一個部分windows與mac其實只是安裝檔不同，

![](/images/gulp/screen_shot_gulp01.png)

這邊就只Show出windows版本的安裝(Mac版大致相同，而後面的介紹會兩者混用)

![](/images/gulp/screen_shot_gulp02.png)

下載安裝後如果是windows，請打開"命令提示字元”，輸入：

	node -v

	npm -v

預期會出現以下的版本(或者更高)

![](/images/gulp/screen_shot_gulp03.png)


如果是Mac，請打開終端機，和windows相同，輸入以下指令：

	node -v

	npm -v

預期會出現以下的版本(或者更高)

![](/images/gulp/screen_shot_gulp04.png)

接下來，大部份的操作，也都是兩者相同，就不再一一贅述。

首先，安裝全域的`Gulp`。

	npm install -g gulp

![](/images/gulp/screen_shot_gulp05.png)

到目前為止，整體的環境就算完成了，接下來就是建立專案，而這部分我會先開啟一個簡單的範例，有興趣的使用者也可以下載範例來直接使用。

## 範例檔案


這邊我們先假設專案需要編譯coffeescript、compass with susy，最後還需要webserver 並且具有livereload的功能，所以專案的架構大概如下：

	| app /
		| - coffeescripts /
	    	| - a.coffee
	    	| - b.coffee
		| - js/
	    	| - jquery-1.11.0.min.js
		| - sass/
	    	| - all.sass
		| - index.html

這個專案內容都在`app/`的資料夾內，coffeescripts 有兩個coffee檔，sass檔內只有一個all.sass，另外還有個jquery，也會隨後一起壓縮。

## 如何開始使用Gulp


接下來的範例，會先在mac上執行，最後再放回windows，兩者大致相同。而一開始的範例，會先編譯coffeescript。

`npm`是nodejs的模組管理工具，這邊會建立一個package.json。

	npm init

![](/images/gulp/screen_shot_gulp06.png)


接下來我們就來安裝gulp以及coffeescript。

	npm install --save-dev gulp gulp-coffee

![](/images/gulp/screen_shot_gulp07.png)

`—save-dev`的用途是將套件安裝，並且把安裝的資訊也一起寫入剛剛產生的package.json，如果打開package.json，會看到剛剛所安裝的套件名稱及版本。


```
"devDependencies": {
    "gulp-coffee": "^2.1.1",
    "gulp": "^3.8.7"
}
```

這時候看資料夾內，也會看到node的套件安裝到資料夾內了。

![](/images/gulp/screen_shot_gulp09.png)

### 這邊開始是重點

[https://www.npmjs.org/package/gulp-coffee](https://www.npmjs.org/package/gulp-coffee)

官方網站有寫出gulp-coffee怎麼使用，我們可以將它修改成適合這個專案的，首先建立`gulpfile.js`，檔案內容如下。

```javascript
//gulpfile.js
var gulp = require('gulp'),
	coffee = require('gulp-coffee');

gulp.task('coffee', function() { //'coffee'是排程名稱，可自定
	gulp.src('./app/coffeescripts/*.coffee') //來源檔案
	.pipe(coffee()) //編譯
	.pipe(gulp.dest('./app/assets/js')) //輸出位置
});
```

接下來在terminal輸入`gulp coffee`，就可以編譯coffee了。

![](/images/gulp/screen_shot_gulp10.png)

接下來就會在`assets/js`看到編譯好的兩個檔案。

![](/images/gulp/screen_shot_gulp11.png)

以目前的範例結果大概會像這樣。


	| app /
		| - coffeescripts /
			| - a.coffee
			| - b.coffee
		| - js/
			| - jquery-1.11.0.min.js
		| - sass/
			| - all.sass
		| - assets/
			| js /
				| - a.js
				| - b.js
		| - index.html
	| node_modules /
		| - 各式node module….
	| - gulpfile.js
	| - package.json

目前就可以做的簡易的coffee編譯，接下來會使用更多的工具。

# 工商服務 MOPCON

傳說中「真．濁水溪以南最強大科技研討會」Mobile Open Platform Conference 聽說 9/22 準時開始報名, 這次單是議程講師的公司堆起來就金光閃閃啊~~~

[http://mopcon.kktix.cc/events/2014-registration](http://mopcon.kktix.cc/events/2014-registration)

<iframe allowfullscreen="" frameborder="0" height="360" src="//www.youtube.com/embed/vNmK-HyGVO4?rel=0" width="100%"></iframe>

官方網站 [http://mopcon.org/2014/](http://mopcon.org/2014/)
