---
layout: post
title: Middleman 超級快上手
category: tools
tagline: 
tags: [tools]
cssdemo: 
jsdemo: 
thumbnail: middleman/20150323-middleman01.png
published: true
---

之前長時間都是使用Fire.app(到目前也有在用)，因為少許原因，所以一直有在嘗試其他工具，而之前有介紹過`Gulp`，他可以透過Node.js做出類似Fire.app的工具。而最近，有人和我介紹了Middleman，嘗試了一小段時間後，比想像中更容易，更貼近Fire.app，比`Gulp`更好設定，有興趣的就來安裝看看吧～。

<!-- more -->

官方網站：[https://middlemanapp.com/](https://middlemanapp.com/)

Middleman是基於Ruby環境的工具，因此請先確認有Ruby環境。

## 安裝

安裝上問題不大，但是可能有ruby 版本的限制，2.0.0裝不進去，rvm切到2.1.2之後很順利安裝，或許是和gem的版本有關(反正我就裝進去了!)。

	$ gem install middleman

## 建立專案

這一套和fire.app有許多相似的地方，為了讓使用者可以快速開始，也有提供快速建立專案的方法，等等會介紹一些`fire.app`沒有的地方。

	$ middleman init

啟動middleman的服務。

	$ middleman server

這樣在進入`localhost:4567`之後，就可以開啟預設的畫面。

![](/images/middleman/20150323-middleman05.png)

## 安裝其他插件

接下來介紹他的一些特色，這不僅像`Fire.app`，也很類似Ruby on rails，所以除了一些預設的基本功能，還可以透過`gemfile`來擴增插件。

### Slim

Slim也是很多人在使用的template language，如果要產生slim的預設版型，就必須先安裝`middleman-slim`。

	$ gem install middleman-slim

![](/images/middleman/20150323-middleman02.png)

接下來init就可以產生slim的template(和原本的`middleman init`產生的內容是一樣，僅是改成slim的副檔名)。

	$ middleman init PROJECT_NAME --template slim

### Sass

接下來還需要其他的gem，可以直接寫入`gemfile`，像是sass, compass。所以打開`gemfile`，把以下三行加進去就可以了。

	# Sass
	gem "sass"
	gem "compass"

回到terminal輸入`bundle install`，就可以使用sass囉(記得sass用法吧，副檔名記得要改成.sass or .scss)。

### livereload

這個版本的livereload已經把gem寫在裡面了，但是要自己啟動，打開`config.rb`，將以下的註解拿掉。

	# configure :development do
	  # activate :livereload
	# end

不需要重啟服務，直接就可以開始使用。

### jquery

如果要jquery的lib，也是將套件先寫在`gemfile`內，`gemfile`內加入以下這行，然後一樣在Terminal輸入`bundle install`。
     
	gem "jquery-middleman"

接下來打開`source/javascript/all.js`裡面加入以下這行，這樣就完成了。

	//= require jquery

參考：[https://github.com/jasl/jquery-middleman](https://github.com/jasl/jquery-middleman)

## 使用slim template language

middleman 不僅有template language，還支援許多類似fire.app的假字功能，這邊用一個範例來介紹：

打開`index.html.slim`

	- 5.times do
	  p
	    == lorem.sentence

![](/images/middleman/20150323-middleman03.png)

這一段的意思是執行五次內容，包含了`<p>`以及產生`lorem.sentence`的假字，結果如下。

![](/images/middleman/20150323-middleman04.png)

## 結語

相對於gulp來說，middleman非常非常的容易上手，如果對於fire.app熟悉的話，並且略懂rails，大概只要20分鐘就可以開始用了。

如果說缺點，就是他並不像gulp那樣的靈活，可以與其他語言服務一起混用。
