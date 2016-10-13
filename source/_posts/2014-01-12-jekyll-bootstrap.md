---
layout: post
title: 利用Jekyll Bootstrap 快速建立Blog
category: jekyll
tagline: 之到處都可以看到的 Bootstrap
tags: [jekyll, github, git]
cssdemo: 
thumbnail: 2014-01-02_165953.png
published: true
---
Bootstrap是一套好用的framework，而jekyll就利用bootstrap的便利建立一套jekyll framework，稱作為Jekyll Bootstrap。除了版型外，還另外增加許多實用的模組，如Disqus、google analytic等等，本篇就來介紹如何在github上建立jekyll bootstrap。

<!-- more -->
## 本篇重點
接續前篇github的使用，請務必先參考前一篇的內容。而本篇會進一步的使用jekyll bootstrap，且建立在前篇所的github page，最後在介紹jekyll的發文方式及可能會遇到的問題。

## 安裝Jekyll bootstrap

透過Jekyll bootstrap號稱可以從0開始到建立一個Blog只要3分鐘，但根據我的經驗...第一次建立應該要超過10分鐘，除非這流程已經練習好幾次了。

[Jekyll bootrap](http://jekyllbootstrap.com/)

透過以上連結就可以到Jekyll bootrap的官方網站，詳細的介紹會放在文章的後半段，前半段會直接介紹如何安裝。再到Jekyll bootrap網站後，直接點選Code on Github。

![](/images/2014-01-02_165953.png)

到了github上，就把整個code下載到本機，而這邊我是直接Download zip。

![](/images/2014-01-02_170007.png)


下圖的左方是本機端(上次的github page資料夾)，右方則是下載的jekyll bootstrap，就把他們整個複製到本機端吧！

![](/images/2014-01-02_170143.png)

接下來打開`git shell`，如果是mac os可以打開`terminal`，依序輸入以下git指令，將jekyll bootstrap上傳到github page伺服器。

	git add --all
	git commit -m "jekyll bootstrap"
	git push

![](/images/2014-01-02_170404.png)

![](/images/2014-01-02_170557.png)

### 完成

最後只要輸入`username.github.io`就可以看到以下的網站，這樣就代表成功了。

參考[http://wcc723demo.github.io/](http://wcc723demo.github.io/)

![](/images/2014-01-02_170719.png)

------------------

## Jekyll設定

在設定前，先了解Jekyll bootstrap的資料夾結構。

![](/images/2014-01-12_120950.png)

	*僅列出部分*

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

所以在發文前，就先設定一下網站的名稱吧，打開`_config.yml`，可以找到`title`的設定，就把它改成自己的網站名稱，然後利用`git push`上傳吧。

![](/images/2014-01-10_173140.png)

在一段時間後，就可以看到網站的標題已經替換了。

![](/images/2014-01-12_115553.png)


## 發文

發文我們這邊用它內建的文章做介紹，首先我們在以下路徑可以找到這篇文章，這篇使用教學。注意，jekyll的檔名上是有一定的規則`年-月-日-標題.附檔名`，副檔名則接受.md或是.html兩者都可以正常運作。

	\_posts\core-samples\2011-12-29-jekyll-introduction.md
						\年-月-日-標題.md
						\年-月-日-標題.html

接下來打開這篇文章，每篇文章的開始都需要一個yaml文件頭，用來設定一些數據，就如同資料庫的欄位一樣(注意：首行不能有空格)。他是利用'---'來標記開始和結束。

<pre>
---
layout: post  #文章的版型
category: lessons  #文章的資料夾
tagline: Supporting tagline  #文章的標語
tags: #文章的tag
  - intro
  - beginner
  - jekyll
  - tutorial
published: true #是否發佈
---
</pre>

所以在以上，應該有發現到沒有標題，因為標題要設定在檔名上，所以這邊不會有標題。這邊我就在文章的內部，用markdown加入一行字之後再用`git push`上傳。

![](/images/2014-01-12_123057.png)

接下來在github page上，看到內文有了改變。

[參考連結](http://wcc723demo.github.io/lessons/2011/12/29/jekyll-introduction/)

![](/images/2014-01-12_123320.png)


-----------------

## 這時候可能會遇到的錯誤

如果github page在此時如果編譯錯誤，他會發一封mail到用戶的信箱，如下圖，這是沒有驗證過的信箱...，要驗證後的信箱他才會正常的編譯。

![](/images/2014-01-12_114728.png)
