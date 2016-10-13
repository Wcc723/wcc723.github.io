---
layout: post
title: GitHub Page
category: jekyll
tagline: Jekyll 前置作業
tags: [jekyll, github, git]
cssdemo: 
thumbnail: 2014-01-02_161136.png
---
這一篇先介紹Github Page，這一個空間是每一個GitHub使用者都可以了解的地方，如果需要做一些DEMO給其他人看，可以試試看這方式，速度快，而且免費!

<!-- more -->
## 本篇重點
學會使用Github page，再參考本篇文章前，建議先有git基礎，而本篇是用git shell做demo，如果是mac OS使用者可以用terminal(還更簡單喔...)。

![git shell](/images/2014-01-02_171127.png)

如果需要git shell，只要安裝[github for windows](http://windows.github.com/)就有附贈git shell了

## 申請 Github 帳號

首先當然要先申請一個帳號，再申請的流程也不囉嗦，只要填入使用者名稱、E-mail、以及密碼即可。

![](/images/2014-01-02_163228.png)

## 新的儲存庫 (New repository)

畫面的右方，應該可以找到如下的小框框，這邊會列出你所有的儲存庫，只要點其右上的New repository，就可以創立新的儲存庫。

![](/images/2014-01-02_163313.png)

這邊要特別**注意**了，因為是要for github page用，**repository name要輸入`username.github.io`**，剩下不需要特別設定，只要按下`creat repository`就創立了。

![](/images/2014-01-02_163346.png)

如果看到這個畫面，就代表已經創立成功，而他上方所顯示的`https://github.com/username/...`這一段等等會用到，可以先複製起來。

![](/images/2014-01-02_163546.png)

## Push 一個文件檔

首先先把儲存庫上的空儲存庫clone下來(我習慣這樣用)。

	git clone https://github.com/username/.....剛剛那排

![](/images/2014-01-02_164441.png)

接下來建立一個index.html檔，內容如下。

	<!doctype html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Hello</title>
	</head>
	<body>
		Hi~大家好
	</body>
	</html>	

![](/images/2014-01-02_163810.png)

如果新的檔案建立好就依下方輸入git指令：
	
	git add --all
	git commit -m "first commit"

![](/images/2014-01-02_164544.png)

最後在push上去(如果有要輸入帳密，就輸入吧)。

	git push -u  origin master

![](/images/2014-01-02_165026.png)

在剛剛的網頁重新整理後，可以看到那一個index.html已經傳上去了。

![](/images/2014-01-02_165145.png)

## 等待

這時候網址請輸入`username.github.io`，可能會看到如下的畫面。

[http://wcc723demo.github.io/](http://wcc723demo.github.io/)

![](/images/2014-01-02_165301.png)

但請不要灰心，就不斷地一直按`F5`，10分鐘內應該就可以看到如下面的畫面。

![](/images/2014-01-02_165626.png)

## 後記

到這部分github page就算是成功了，而接下來就會開始接觸到jekyll，如果用過github的使用者應該是相當容易上手的。