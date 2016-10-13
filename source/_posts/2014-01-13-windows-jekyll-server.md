---
layout: post
title: 在Winodws上運作jekyll
category: jekyll
tagline: 之Mac OSX可以跳過一大段
tags: [jekyll, github, git]
cssdemo: 
thumbnail: 2013-11-30_213819.png
published: true
---

Jekyll是在Ruby環境下運行，而Windows對於Ruby的支援性較差，所以在安裝時較為麻煩(Mac OS使用者可以直接參考[官方網站](http://jekyllrb.com/))，並且會有些問題，有興趣的Windows user就來參考我這篇吧~(我至少從頭裝了5次!)。

<!-- more -->
![](/images/2013-11-30_213819.png)

## 本篇重點
介紹如何在Windows環境下安裝jekyll，並解決可能會遇到的問題，而Mac OSX使用者可以參考[官方網站](http://jekyllrb.com/)，如果在兩個環境都安裝一遍的情況下，會發現Mac OSX真的簡單太多了...。

**Mac使用者可以從[這裡開始閱讀](#jekyll)**

**本篇適用於windows 7(64bit)、windows 8(64bit)**，其他環境未測試。

## Windows下安裝Ruby

首先請打開以下連結，會看到不同版本的ruby installers，選定的Ruby版本等等會對應DevKit，如果沒有電腦內還沒有安裝Ruby的使用者，可以以參考本篇安裝2.0以上的 Ruby。

[http://rubyinstaller.org/downloads/](http://rubyinstaller.org/downloads/)

![](/images/2014-01-09_213631.png)

下載完後就開始安裝吧，語系也沒什麼好調的，只有英文跟日文= =。

![](/images/2014-01-09_213711.png)

接受License

![](/images/2014-01-09_213723.png)

路徑上可以用預設即可，如果在網路上搜尋問題，大部分的人也都是用預設路徑來回答。

![](/images/2014-01-09_213732.png)

安裝完成。

![](/images/2014-01-09_213807.png)

安裝完成後，在程式集內或是windows8的動態磚可以找到 `Command Prompt with Ruby`，而等等還要安裝DevKit。

![](/images/2014-01-09_214834.png)

## 安裝Devkit

Gem是Ruby的應用程序，而在windows中，許多的gem都需要透過DevKit才能夠使用，Jekyll也是，所以這邊要先安裝DevKit。

上一步驟的[http://rubyinstaller.org/downloads/](http://rubyinstaller.org/downloads/)，從這邊下載DevKit，記得版本要對應上一步驟的Ruby版本，接下來如下解壓縮。

![](/images/2014-01-09_214322.png)

打開`Command Prompt with Ruby`

![](/images/2014-01-09_214834.png)

輸入以下指令

	cd Devkit
	ruby dk.rb init	

![](/images/2014-01-09_214941.png)

再輸入`ruby dk.rb install`，就可以完成Devkit安裝了。

	ruby dk.rb install

![](/images/2014-01-09_214942.png)

----------

<div id="jekyll"></div>

Mac OS使用者從這邊開始與Windows較為接近，可以從這邊開始閱讀。

## 安裝Jekyll

剛剛的`Command Prompt with Ruby`，會一直使用，而Ruby的指令就直接輸入在這裏面，Mac OS的使用者就打開`Terminal` (終端機)吧。

首先升級gem。

	gem update --system

![](/images/2014-01-09_215200.png)

接下來安裝jekyll。

	gem install jekyll

![](/images/2014-01-09_220027.png)

接下來驗證jekyll是否有安裝完成，以及檢查版本

	jekyll -v

![](/images/2014-01-09_220141.png)

## 啟用Jekyll

辛苦建立的blog在這邊就可以看到了，在jekyll的資料夾下輸入`jekyll server`，就可以看到嚕。

	jekyll server

![](/images/2014-01-12_130029.png)

這時候網址列只要輸入`http://localhost:4000/`，就可以看到剛剛建立的站台，**注意：這個站台是在輸入`jekyll server`後產生的，如果檔案有修改，必須先停止jekyll server，再重新啟動才會看到新的修改**

如果要停止只要按照說明按下`Ctrl + C`即可。

![](/images/2014-01-12_182831.png)

---------

### Windows 特有錯誤

在我安裝過那麼多次，都一定會遇到的錯誤，就是Windows版 jekyll中文會有編碼的問題，只要輸入`jekyll server`就會出現以下錯誤。

![](/images/2014-01-09_220257.png)

這時候就要到Ruby裡的jekyll資料夾修改一些設定檔

![](/images/2014-01-09_220510.png)

在windows的Ruby安裝路徑找到convertible.rb這個檔案打開

	C:\Ruby200-x64\lib\ruby\gems\2.0.0\gems\jekyll-1.4.2\lib\jekyll\convertible.rb

將convertible.rb裡的值如下修改，就可以修正這個問題

	原
	self.content = File.read_with_options(File.join(base, name),
                                      merged_file_read_opts(opts))
	改為
	self.content = File.read(File.join(base, name),:encoding=>"utf-8")

接下來再輸入一次jekyll server試試看吧，這問題就會解決了。

### Mac OS的優勢

windows在每次修改完檔案後，都必須停止jekyll server，再重新啟動，網站才會更新；而Mac OS只要輸入`jekyll server --watch`，他就會自動偵測站台是否有儲存，只要有儲存動作就會更新網站。

	jekyll server --watch

![](/images/2014-01-13-83410.png)

所以我喜歡在Mac OS寫文章...。