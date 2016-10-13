---
layout: post
title: 在Jekyll設定自己的留言板
category: jekyll
tagline: 之超級簡單
tags: [jekyll, github, git]
cssdemo: 
thumbnail: 2014-01-10_173447.png
published: true
---

寫blog的作者，都會希望每篇文章都能有些回覆，所以一個留言機制是必要的，但是jekyll本身是屬於靜態網頁，並沒有資料庫，所以必須透過其他服務來做。在jekyll bootstrap內已經有包含disqus的留言板，而且設定容易，使用者也相當多，非常建議用disqus服務。

<!-- more -->

## 本篇重點
在jekyll bootstrap內建立屬於自己的留言板，主要會使用disqus，設定容易，使用方便。


## Disqus

許多網站，甚至是這次所建立的jekyll bootstrap，都應該有看過以下這個留言板，這是disqus的服務，不管是開發者或是使用者都相容易。他是用iframe嵌入在網站內，資料會存在disqus.com的server，所以開發者可以不用理會資料庫要怎麼建；而使用者可以用disqus或是facebook帳號登入就可以開始使用了。

![](/images/2014-01-10_173329.png)

[http://disqus.com/](http://disqus.com/)

開啟以上連結並先登入(我是用facebook)，上方有兩個選項For Websites 及 Using Disqus，Using Disqus是給一般使用者管理留言用，這次會用For Websites來增加到Jekyll網站。

![](/images/2014-01-10_173447.png)

點完就選擇Add Disqus to Your Site來增加到網站上吧。

![](/images/2014-01-10_173448.png)

這邊設定其實很容易，只要輸入一個site name就可以了，其他可以不設定，sitename這個值等等也需要回填到jekyll bootstrap上。

![](/images/2014-01-10_173527.png)

## 設定 `_config.yml`

打開jekyll內的_config.yml，可以找到以下的內容。

	comments :
      provider : disqus    # 啟動的留言板服務，這邊就用預設即可
      disqus :
        short_name : jekyllbootstrap    # 將內容替換成剛剛在disqus上申請的site name
      livefyre :
        site_id : 123
      intensedebate :
        account : 123abc
      facebook :
        appid : 123
        num_posts: 5
        width: 580
        colorscheme: light

![](/images/2014-01-10_173300.png)

這部分就如上方所解說的一樣，把short_name修改成剛剛申請的site name。

	comments :
      provider : disqus
      disqus :
        short_name : wcc723demo    # 將內容替換成剛剛在disqus上申請的site name

之後只要和之前一樣上傳到github，就會發現留言板已經換成屬於自己的。

	git add --all
	git commit -m "disqus"
	git push

# 完成

![](/images/2014-01-10_173833.png)

接下來回到網頁上，可以試著留言，而他的留言是依據網址，如果需要管理這些內容可以到disqus的後台(連Local都建了...)。

![](/images/2014-01-10_173888.png)
