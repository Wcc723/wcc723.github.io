---
layout: post
title: 在Jekyll中調整屬於自己的Template
category: jekyll
tagline:
tags: [jekyll, github, git]
cssdemo:
thumbnail:
published: true
---

會用jekyll有一部分是想要自己設計版型，我所擅長的是視覺設計、HTML、CSS，我就用這幾個技能設計自己的版型，當然這並不是那麼的一兩篇就可以介紹完。所以這篇會說明一個範例，介紹Jekyll中的版型運作邏輯，有興趣的使用者可以依據這概念設計屬於自己的blog。

<!-- more -->

## 本篇重點

調整jekyll bootstrap的版型，加入文章摘要於首頁，藉此了解jekyll bootstrap的運作方式。

*參考：[http://truongtx.me/tags.html#jekyll-ref](http://truongtx.me/tags.html#jekyll-ref)*

## 注意

**由於jekyll內不能連續輸入兩個大括號 或是 大括號+百分比，所以等等的大括號中間都會插入空白隔開，Copy時記得刪除....。**

	{ { content } }
	 ^	         ^  //記得消除..

	{ % include JB/setup %}
	 ^	            //記得消除..


-------------------

## Jekyll bootstrap架構

首先我們再來看一下網站架構，這邊列出可能會修改到的檔案。

	|-- index.html   #網站首頁
	|-- _config.yml  #網站設定檔
	|
	|---/_includes  #網站結構資料夾
	|	|--/JB      #Jekyll-bootstrap 模組
	|	|--/themes  #Jekyll-bootstrap 預設版型
	|
	|---/_layouts   #版型
	|
	|---/_posts     #文章資料夾
	|
	|---/assets     #CSS,JS 資料夾

前幾篇有介紹`_config.yml`，今天要介紹怎麼修改index.html的版型。

在傳統Jekyll架構中網站首頁的`index.html`可以透過設定檔去抓取`_layouts`內的版型，`index.html`設定參考如下：

<pre>
---
layout: default
---
</pre>


而在Jekyll bootstrap內的`_layouts`會再去載入屬於它專有的版型，路徑就放在`_includes/themes/twitter/`內，而在`layout`內的default.html原始碼如下：

```md
---
theme :
  name : twitter
---
{ % include JB/setup %}
{ % include themes/twitter/default.html %}

//前4行的是設定CSS的路徑
//後2行是在載入include/themes/twitter/內的default.html
```


而最後的`include/themes/twitter/default.html`的結構就像是一般的html，而以上的內容會被放在`default.html`的`{ { content } }`內。

default.html的[原始碼](https://github.com/plusjade/jekyll-bootstrap/blob/master/_includes/themes/twitter/default.html)

而以上三個請參考這張圖，最左方的是跟目錄的`index.html`，透過一層一層的去取的Jekyll bootstrap版型。

![](/images/2014-01-15-jekyll-folder.png)


-----------------

-----------------

## 開始

上面的介紹有點抽象，接下來就來實際操作一次可能會更了解，**請按照步驟慢慢地做下去**。

### 步驟一

首先打開`include/themes/twitter/`資料夾，並且創一個index.html檔案。

![](/images/2014-01-13_215408.png)

裡面程式碼請輸入以下(就這麼三行，剩下的他會去抓同層的default.html)：


	<div class="content">
		{ { content } }
	</div>

![](/images/2014-01-13_215418.png)

### 步驟二

打開`_layouts`的資料夾，並且複製`post.html`於原位置，並且修改檔名為`index.html`。

![](/images/2014-01-13_215208.png)

![](/images/2014-01-13_215224.png)

打開`index.html`修改以下程式碼。

<pre>
include themes/twitter/post.html

修改成
include themes/twitter/index.html
</pre>

![](/images/2014-01-13_215330.png)

### 步驟三

打開跟目錄的`index.html`，貼下以下程式碼。

程式碼：[https://github.com/wcc723demo/wcc723demo.github.io/blob/master/index.html](https://github.com/wcc723demo/wcc723demo.github.io/blob/master/index.html)

![](/images/2014-01-13_215719.png)

接下來利用先前介紹的Ruby `jekyll server`來預覽看看網頁，應該會得到這樣的結果，他把目前頁面的前100字擷取了出來。

![](/images/2014-01-13_215806.png)

上面那一段的程式碼的內容如下(煩請自動補腦大括號)：


	for post in site.posts limit:10
	//本站的10筆文章

	post.title
	//等等會用來放置中文標題

	if post.content contains "<!-- more -->"
	//如果內容包含"<!-- more -->" 就擷取到"<!-- more -->"
	//如果沒有就擷取100字

	endfor,endif
	語法結尾



----------

### 步驟四 修改文章

最後把`/_posts/core-samples`內的範例文章`2011-12-29-jekyll-introduction.md`打開，在文字中插入以下分隔語法。

	<!-- more -->

![](/images/2014-01-13_215900.png)

最後在首頁就能看到文章的摘要，而如果增加文章，也會依這功能擷取摘要。

![](/images/2014-01-13_215950.png)

範例網站：[http://wcc723demo.github.io/](http://wcc723demo.github.io/)

------------

## 注意

**由於jekyll內不能連續輸入兩個大括號 或是 大括號+百分比，所以本文中的大括號中間都會插入空白隔開，Copy時記得刪除....。**

	{ { content } }
	 ^	         ^  //記得消除..

	{ % include JB/setup %}
	 ^	            //記得消除..
