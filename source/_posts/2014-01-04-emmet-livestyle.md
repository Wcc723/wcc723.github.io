---
layout: post
title: Emmet Live Style 加減用啦~
category: tools
tagline: 如果 livereload 不能用的話...
tags: [tools, emmet, sublime text]
cssdemo: 
thumbnail: 
---

livereload for Windows因為是測試版，經常性的有問題，有時候還會不能使用，這時候可以試試Emmet LiveStyle，他主要會針對CSS的部分直接reload。來看看官方的影片吧。

<iframe src="//www.youtube.com/embed/iQLhGbkupS4" frameborder="0" width="100%" height="480" > </iframe>

<!-- more -->

------------------
## 安裝

[http://livestyle.emmet.io/install/](http://livestyle.emmet.io/install/)

安裝流程都是參考官方文件。而這是Sublime Text的擴充功能，所以一定要用Sublime Text，流程如下：

1. 安裝Package Control 
2. 安裝LiveStyle 擴充功能
3. 安裝Chrome的 LiveStyle 擴充功能
4. 使用LiveStyle

-------------------

## 安裝Package Control 

<p>這部分只要開啟Sublime Text，按下<code>ctrl+`</code>並且貼上以下的code即可。</p>

	import urllib.request,os,hashlib; h = '7183a2d3e96f11eeadd761d777e62404e330c659d4bb41d3bdf022e94cab3cd0'; pf = 'Package Control.sublime-package'; ipp = sublime.installed_packages_path(); urllib.request.install_opener( urllib.request.build_opener( urllib.request.ProxyHandler()) ); by = urllib.request.urlopen( 'http://sublime.wbond.net/' + pf.replace(' ', '%20')).read(); dh = hashlib.sha256(by).hexdigest(); print('Error validating download (got %s instead of %s), please try manual install' % (dh, h)) if dh != h else open(os.path.join( ipp, pf), 'wb' ).write(by)

*原諒我這段，這邊我懶得重裝了...，所以沒有圖。*

## 安裝LiveStyle 擴充功能

在Sublime Text上方的Preferences下找到Package Control。

![安裝LiveStyle](/images/2014-01-04_153230.png)

選擇：Install Package

![安裝LiveStyle](/images/2014-01-04_153244.png)

接下來輸入LiveStyle，就能安裝LiveStyle擴充功能

![安裝LiveStyle](/images/2014-01-04_153318.png)

## 安裝Chrome的 LiveStyle 擴充功能

打開這個網址
[Chrome Emmet LiveStyle](https://chrome.google.com/webstore/detail/emmet-livestyle/diebikgmpmeppiilkaijjbdgciafajmg)，再加入倒Chomre就可以了。

![安裝Chrome的 LiveStyle 擴充功能](/images/2014-01-04_153622.png)


## 使用 LiveStyle

Chrome的擴充元件，放在開發者工具裡，只要按下F12，就能看到開發者工具，找到LiveStyle並
`Enable LiveStyle for current page`。

![按F12](/images/2014-01-04_153855.png)

接下來開啟正在做的檔案(直接開就可以了)

![開啟檔案](/images/2014-01-04_154140.png)

修改CSS，不需要存檔，就會發現畫面上的CSS效果跟著改變囉。

![修改CSS](/images/2014-01-04_154152.png)