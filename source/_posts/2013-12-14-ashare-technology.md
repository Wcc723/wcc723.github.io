---
layout: post
title: aShare使用技術
category: jekyll
tagline: 本站的特色
tags: [intro, beginner, jekyll]
thumbnail: 2013-12-14-jekyll.png
---

上一篇簡單介紹了本站為什麼選擇jekyll，但是這其中並不是只有這一項技術就可以達成，其中除了我已經很熟悉的html、css、sass外，必須要了解Git、Liquid、Markdown等等的技術，當然其中會有許多困難，但是不斷的突破困境是進步最快的方式。

### 本站所使用的技術如下

1. [Jekyll](http://jekyllrb.com/)
2. [Liquid](http://liquidmarkup.org/)
3. [github](https://github.com/)
4. [github page](http://pages.github.com/)
5. [Markdown](http://markdown.tw/)
6. [Sass](http://sass-lang.com/)
7. [compass](http://compass-style.org/)
8. [fire.app](http://fireapp.kkbox.com/)

<!-- more -->

## 為何要建立一個使用這麼多技術的blog
雖然這些技術看起來非常的多，但有一半已經是經常使用的，而另一部份是應該去學習，卻一直沒有機會，如果可以透過建立blog的方式順便學習，還真的是挺划算的。

## Jekyll

![jekyll](/images/2013-12-14-jekyll.png)

Jekyll是這個blog的核心，它是一個靜態網站的生成器，還多裡面運行了Textile、Markdown或Liquid的編譯器，透過這些功能可以產生一個完整的靜態網站。

光是這樣介紹真的很模糊，未來的章節會介紹如何建置jekyll靜態網站。

## Liquid

本站上主要的版型模組都是用Liquid建置，像是右邊的Related Posts、Recent Posts、Tags等等。而這我並不是很擅長，但也不是很難...，只要看得懂html，大部分都是複製、貼上，重新修改就可以了。


## Git & Github & Github page

![Github](/images/2013-12-14-github-logo.png)

這三個有連帶關係，因為我是放在github page上，所以要用github，因為要用github所以一定要用git。
git是版本控管的工具。任何專案保存的過程中，其演進的歷程及紀錄都是非常重要的，而git就是紀錄這些的工具。

[github](https://github.com/)則是git的大型線上儲存庫，讓使用者可以透過雲端的管理，在不同的地方都可以進行作業(git相當複雜，有興趣可以參考[保哥的介紹](http://ithelp.ithome.com.tw/ironman6/player/doggy/dev/1))。

github page，是github提供的額外服務，他可以將push到github上的檔案，透過jekyll轉換成靜態頁，github page優勢如下：
1. **快速** html靜態頁就是快速。
2. **穩定** 大廠牌"github" 就是穩定。
3. **免費** free!
4. **容量無限** 只要會git commit、git push。

## Markdown

Markdown的主要目的就是要拿來寫作用，由於html的標籤有一點點混亂，所以在編寫時有一點點麻煩，Markdown簡化了許多寫法。

Markdown範例

```
html的寫法
&lt;h1&gt;Markdown&lt;/h1&gt;

Markdown的寫法
# Markdown
```


它就是簡化寫法的語言而已，不過如果沒用Markdown，純html寫blog找段文字都會看到眼瞎是真的。

## Sass & Compass & Susy

![sass](/images/2013-12-14-sass.png)

sass是CSS的高階語言，透過sass可以一行抵三行，有效率的編寫及管理CSS，說實在沒用這類型的東西，我不知道該怎麼寫好CSS了。

而[Compass](http://compass-style.org/)是sass的擴充framework，compass有許多擴充功能如css3 前輟詞以及提供許多@mixin以供使用者運用。

另外的[susy](http://susy.oddbird.net/)是基於sass、compass的版型framework，優勢在於可以快速建立responsive web，和其他grid system (ex:bootstrap)不同的是html乾淨、自由、class 語意化，熟悉susy的使用者在建立responsive web可以比bootstrap更快速。

## 製作小心得

本站在結束ashareaday後大概兩周就大致完成了，第一周花了很多時間在學習git以及測試jekyll，只會用github for windows的情況下開始學，到現在主要都用github shell或是mac 終端機在作業了，以上是題外話...。

測試jekyll時遇到超多的問題，之後再介紹jekyll時會有詳細的介紹，而剛開始我是用jekyll bootstrap做測試，在許多的問題都克服(如中文、編譯錯誤等)以後，才開始正式執行。

第一周測試完後，第二周開始製作版型，說實在sass、compass、susy加起來真的太快了(大推...)，配合自己平常準備的模組，一個早上就完成大部分的。而這個網站在設計上，當然就是走現在主流的扁平化設計，簡單且沒有太多的裝飾。

在版型完成後，就替換掉jekyll bootstrap，把原本的html css抽換，保留許多的Liquid模組，就大致完成了aShare，而許多不足的地方，就是不斷地搜尋及測試。

[ashareaday](http://ashareaday.wcc.tw/)是在2013/11/30結束，它讓我學習太多了，而這個網站會保留其大部分文章，且會以更精緻的方式執行下去。
