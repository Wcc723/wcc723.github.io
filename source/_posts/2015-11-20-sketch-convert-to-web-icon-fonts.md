---
layout: post
title: 將 Sketch icons 轉成 web icon fonts
category: tools
tagline:
tags: [tools, icon fonts, sketch]
cssdemo:
jsdemo:
thumbnail: 2015/11/googleIconsToFonts.png
published: true
---


在之前轉web font icons 通常是使用Icomoon，他提供不錯的介面以及大量的icons供開發者使用，但有些時候Icomoon並不符合我們的需求，例如：

*   公司專案，不宜上傳到第三方空間
*   有版本控管需求時
*   設計師控制慾很強時(?

而萬能的Sketch及Gulp再合體之後，就有了Sketch to icon fonts 的功能，只要轉一次，同時提供了：

*   icon fonts 字型檔
*   寫好的css檔
*   還有HTML使用範本

對於前端以及設計師簡直接就是一大福音。

<!-- more -->

## 如何使用

寫得很清楚的開發文件：[https://github.com/cognitom/symbols-for-sketch](https://github.com/cognitom/symbols-for-sketch)

在開始前，請先確認有以下環境：

1.  Mac
2.  正版的Sketch
3.  Node.js
4.  有gulp更好

Sketch 是這次主要來輸出icons的繪圖軟體，由於只能在Mac上運行，所以Mac也是必須的，本文最後會在介紹直接使用`.svg`轉icon fonts的方法；Node.js是用來運行gulp的環境，如果還沒安裝可以直接到官網下載[https://nodejs.org/en/](https://nodejs.org/en/)；Gulp是這次的主角，負責將sketch轉成icon fonts的工具，如果熟悉javascript的開發者將會很容易上手，當然不熟也沒關係，本文會用圖文說明以下的步驟。

## 安裝Node.js

如果你還沒安裝Node.js，就到[官網](https://nodejs.org/en/)找到下載點，目前的版本有4.2.2及5.1.0，不管你是哪個版本，與本次的實作影響都不大。

![install node js](/images/2015/11/installNodeJs.png)

安裝完以後再打開 Terminal 輸入以下指令，只要有跳出版本號就算成功了(我的版本追不上時代啊～)。

    $ node -v

![](/images/2015/11/node_version.png)

如果還沒安裝gulp，可以順便安裝，指令如下：

    $ npm install gulp -g
    如果不行請加 `sudo` 在前方
    $ sudo npm install gulp -g


*在npm 前方加入`sudo`代表最高權限，通常只有在安裝全域(-g, -global)才有可能使用。*

## 下載專案

接下來到[https://github.com/cognitom/symbols-for-sketch](https://github.com/cognitom/symbols-for-sketch)把專案抓下來，如果熟悉git的開發者可以使用git指令將repo抓下來；另一種更潮的方式，就是直接選擇網站上下角的Download zip。

![download repo](/images/2015/11/downloadRepo.png)


下載後請解壓縮它。

## 再次打開你的 Terminal，剩下簡單的三步驟就完成了

打開Terminal後，請到剛剛下載的資料夾，如果不熟可以參考以下這個指令(我常常把檔案丟桌面，所以以下指令是針對放在桌面上的)。

    $ cd /Users/*****/Desktop/symbols-for-sketch-master

![](/images/2015/11/goToDir.png)

### 安裝node gulp 相依套件

這個步驟是要將gulp相依的套件從網路上抓下來，相依套件同時會放在這個資料夾(node_modules)。

    $ npm install

### 安裝Sketch tool

這有兩個方法，其中一種是使用指令，但在測試時沒有成功，所以這邊是使用方法二。

方法一：直接輸入以下指令，我沒成功...

    $ npm run installtool

方法二：先下載[http://sketchtool.bohemiancoding.com/sketchtool-latest.zip](http://sketchtool.bohemiancoding.com/sketchtool-latest.zip)，解壓縮後到該資料夾，輸入以下指令：

    $ cd ~/Downloads/sketchtools/
    $ sudo ./install.sh


### 將Sketch轉成icon fonts

最後，透過gulp指令結束這個回合吧！

    $ gulp symbols

到剛剛的資料夾，資料夾內增加了dist以及編譯完成的字型檔、CSS以及範例的html。

![](/images/2015/11/afterGulp.png)

範例的HTML可以看到成果。

![](/images/2015/11/demoHTML.png)

## 將.svg 轉成icon fonts

以上的Sketch轉icons如果有成功，接下來的`.svg`轉icons也是相當容易，只要用相同的模組改幾行程式碼就可以運行。不過要注意的是**這有可能編譯失敗**(原因很多，包含svg的檔案也有可能造成編譯失敗)。

這邊是使用Google Material Design 所提供的 icon，直接放在剛剛的資料夾內即可。

![](/images/2015/11/googleIcons.png)

接下來打開`gulpfile.js`，找到以下幾行替換成`gulp.src(['./svg/*.svg'])` (路徑可以自行決定)。

```javascript
gulp.task('symbols', function(){
  //gulp.src('symbol-font-14px.sketch') // 將原本轉換sketch的改成轉svg
    //.pipe(sketch({
    //  export: 'artboards',
    //  formats: 'svg'
    //}))
  gulp.src(['./svg/*.svg'])
})
```

和先前的一樣，在 Terminal 輸入 `$ gulp symbols` 就可以了。

    $ gulp symbols

![](/images/2015/11/googleIconsToFonts.png)

完成～

----

在以前都是使用 Icomoon 的服務再轉 web fonts，最早的時候還忘記要登入，結果整份 web fonts資料都要重建，透過這樣的工具可以自己轉、自己做版控，除了CDN的問題外，倒是挺方便的。
