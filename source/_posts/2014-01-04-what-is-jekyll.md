---
layout: post
title: Jekyll 介紹
category: jekyll
tagline: 建立超有個性 Bolg
tags: [jekyll]
cssdemo: 
thumbnail: 2013-12-14-jekyll.png
---
本篇開始會重頭介紹Jekyll，如果對jekyll有興趣的開發者，請先必備以下的技能。

- 熟悉 Git (至少要會git push)
- 熟悉 Html (修改 template 及 寫文章用)

<!-- more -->

![jekyll](/images/2013-12-14-jekyll.png)

## 為什麼會考慮Jykell
在用之前，先說一下過去用過什麼類似的CMS好了。

首先，我購買了一個php空間，什麼都不會的情況下，就用Wordpress建立了第一個[blog](http://www.f2e.wcc.tw/)，就個剛開始來說，他是挺方便的，只要上傳到空間就建完了。但我在這之中遇到了幾個問題：

- 版型不好改(主要是要配合許多內建的元件及php語法，要花很多時間理解)。
- 慢(1000元的美國空間配合強大的CMS...)。
- 如果要在文章內放入自己的demo不方便。
- 文章寫不方便(除了不是markdown外，光loading就很慢)

接下來，我自己用ajax寫了第二個blog(?)，也是現在這blog的前生[a share a day](http://ashareaday.wcc.tw/)，做這個的原因，一部分是針對wordpress不方便做改進，另一部份是為了挑戰100天發文。但是自己寫的要和強大的CMS挑戰，就如同XX比雞腿一樣...。接下來就遇到了一些問題：

- 文章一多很難管理(純html)
- Google 等搜尋引擎搜不到內容(試著處理，但還是有問題)

在這期間logdown出了，真的是非常非常適合寫程式的人使用，簡單的介面、流暢的操作，但是這不是我要的blog，原因如下：

- 我的CSS demo很多，這點還是不方便
- free template缺乏個性

後來就是現在的[Jekyll blog](http://wcc723.github.io/)，它有一些優點，是我喜歡的：

- 自己做版型很容易，輕鬆做出自己的個性
- 做demo容易
- 快
- 管理容易
- markdown 混用 html 

## Jykell Necessary Skills
在學習前，還是有學習門檻，往後的內容會牽涉到許多git及html，只要熟悉這兩個技能，建立就不會太困難。

- 熟悉 Git (push 到 github page 用)
- 熟悉 Html (修改 template 及 寫文章用)

*雖然寫文章是用markdown，但都會寫markdown的應該就精通html了吧-.-。*

----------

## What is Jekyll
Jekyll是基於Ruby Gem的解析引擎，能夠將樣板、liquid 語言、markdown轉換為"靜態網頁"的產生器。
[http://jekyllrb.com/](http://jekyllrb.com/)

**特色**
- No more databases 不需要資料庫
- Liquid Template 動態模板
- Free hosting with GitHub Pages 只要學會git push 就可以丟到github page上
- Markdown 好編寫

## Jekyll 的相關技術

### Git, Github, Github Pages
Git版本控制工具，Github是使用git版本控制項目的的虛擬主機服務(這邊不再詳述)
[http://pages.github.com/](http://pages.github.com/)
Github Pages是Github提供的服務，可以建立自己的靜態頁面，而他有提供額外的Jekyll解析服務，在每次的git push後會將markdown轉換為靜態的html，且不需要任何databases，是很適合建立blog的服務。

**特色**
- 快速 html靜態頁就是快速。
- 穩定 大廠牌”github” 就是穩定。
- 免費 free!
- 容量無限 只要會git commit、git push。

### Markdown
Markdown的目標是實現「易讀易寫」，他在編寫完後就像是一般的文字檔，而不會像是程式語言，並沒有許多的標籤及指令。
其語法都是用標點符號組成，主要目的是用來作為網路內容的寫作語言。相關範例建議參考 [http://markdown.tw/](http://markdown.tw/)

### Liquid Template
Jekyll所使用的樣板語言，如果熟悉html或是其他樣板語言將會比較容易上手。

-------------------
## Jekyll 運作流程

這分為兩種，一種是預計要使用的在github page上的，另一種是要在本地端預覽用的。而在github page呈現前，建議能夠在本地端正常運作，在push到github page上市能夠正常顯示的。

### 本地端
**Local** 建立好本地端的Liquid Template以及文章，透過Jekyll server，就能產生出靜態的頁面。

![Jekyll 流程1](/images/2014-01-04jekyll-flow-01.png)

### Github Page
在push Liquid Template後，之後每次都只需要push文章就可以，而每次push到github上的文章及Template，都會透過Jekyll server轉換為靜態的網站。

![Jekyll 流程2](/images/2014-01-04jekyll-flow-02.png)

--------------
###後記

Jekyll loacl端建議使用Mac OSX，由於工作的關係，我會頻繁地在兩種系統交換使用，Windows是在安裝上的注意事項就可以寫一整篇了...，OSX就去看官網吧，三到四行貼完就結束了。

不過我一開始是在Windows上建立的，接下來的文章還是會介紹我所遇到的問題。

