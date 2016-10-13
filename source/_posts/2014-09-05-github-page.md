---
layout: post
title: Gem Github pages
category: jekyll
tagline:
tags: [jekyll]
cssdemo:
jsdemo:
thumbnail: jekyll/jekyll-20140905-01.png
published: true
---

最近聽說github pages有更新，那我也稍微看一下(真的只是稍微)，之前都是用純Jekyll寫Blog，現在發現有github pages的gem(其實已經存在很久了)，似乎可以方便很多。

這篇主要就是記錄安裝過程以及簡易使用。

[https://github.com/github/pages-gem](https://github.com/github/pages-gem)

<!-- more -->

## 安裝github-pages

裝之前請先確認有ruby環境，先前的Jekyll教學有完整的Ruby環境安裝，所以這邊就不再提了。

打開Terminal輸入以下指令(Windows沒有測試過)。

	gem install github-pages

安裝完後輸入`github-pages versions`，可以看到目前所有相關gem的版本。

![](/images/jekyll/jekyll-20140905-02.png)

## Bundle

接下來要把gem寫到專案裡，打開專案後新增一個檔案`Gemfile`，裡面輸入以下：

	gem 'github-pages'

![](/images/jekyll/jekyll-20140905-03.png)

接下來在Terminal輸入`bundle install`，這樣專案與Github pages的gem就會綁在一起
`。

![](/images/jekyll/jekyll-20140905-05.png)

## 執行jekyll

恩...，這真的不是很困難，所以已經到結尾了...，打開Terminal輸入以下指令就完成了。

	bundle exec jekyll serve --watch

![](/images/jekyll/jekyll-20140905-04.png)

至於這樣有什麼功能呢？我也還正在閱讀中...。
