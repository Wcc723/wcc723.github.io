---
layout: post
title: Sass 3.3 Source Maps
category: sass
tagline: 
tags: [sass]
cssdemo: 2014-spring
thumbnail: 20140602_sass_source_maps05.png
published: true
---

Sass 3.3 除了上次提到的[$Map](/sass/2014/05/02/sass-3.3/)外，還有另一個很有特色的功能就是`Source Maps`，這功能主要是配合開發者工具，直接就可以看Sass原始碼在哪一個檔甚至是哪一段，而這篇會配合Chrome 開發者工具來介紹`Source Maps`。

<!-- more -->

## 注意

請確認使用的Sass 版本為3.3以及Compass 1.0以上，如果不是，請參考[上次這篇文章](/sass/2014/05/02/sass-3.3/)。

## Chrome 設定

有點忘了Chrome版本要多少才能使用sass maps，而我目前的版本是`35.0.1916.114`是可以直接執行的，如果發現沒有以下設定，就煩請升級到我這版本以上。

首先，打開開發者工具，右方有一個設定按鈕，按下它。

![](/images/20140602_sass_source_maps01.png)

在General 內可以找到Source > `Enable CSS source maps`，把它選起來後關掉開發者工具。

![](/images/20140602_sass_source_maps02.png)

## Compass 設定

*這邊的範例是直接用上次那篇的([上次文章](/sass/2014/05/02/sass-3.3/))。*

基本上我用Sass都會引用Compass，所以這邊直接介紹Compass的做法。打開專案資料夾，找到`config.rb`(沒有就自己加吧)，加入`sourcemap = true`。

![](/images/20140602_sass_source_maps03.png)

接下來在terminal輸入`compass watch`，會出現兩個檔，一個是之前的screen.css，另一個是screen.css.map，`.map`就是等等要給Chrome看的，所以別太在意他的內容。

![](/images/20140602_sass_source_maps04.png)

接下來回到Chrome使用開發者工具，隨意檢視一個物件，會發現screen.css改成用screen.sass了！

`**screen.sass:14**`也直接寫出在screen.sass這個檔案的第14行可以找到這段code，對於css開發者來說，就可以省去很多時間找css code了。

![](/images/20140602_sass_source_maps05.png)

## 如果使用的是其他工具

再過不知道多久的時間，Fire.app應該會更新到sass 3.3，這些工具在使用時，都可以當做一個簡易的server，適合配合livereload等工具。但是這對於source map來說會有些問題，因為Chrome source map 會對應不到最原始的檔案位置，所以必須加入原始的sass檔位置。

打開開發者工具，一樣到設定的位置，從workspace內找到Folders這選項，把原始的Sass檔案夾加入。

![](/images/20140602_sass_source_maps06.png)

在開發者工具內的`Sources`內可以找到已經加入的資料夾。

![](/images/20140602_sass_source_maps07.png)

對他點擊右鍵，選擇`Map to Network Resource`。

![](/images/20140602_sass_source_maps08.png)

選擇對應的檔案。

![](/images/20140602_sass_source_maps09.png)

接下來，按照原本的Chrome開發者工具使用方法，就可直接修改screen.sass這個檔案，配合著compass、livereload等等，畫面就會自動重整。

![](/images/20140602_sass_source_maps10.png)
