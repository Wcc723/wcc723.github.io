---
layout: post
title: Just Another Beginner~
category: jekyll
tagline: "只是另一個開始"
tags: [intro, beginner, jekyll]
thumbnail: 2013-12-11_150540.png
---

告別了一百多天的[aShareaDay](http://ashareaday.wcc.tw/#2013-11-30)，在這裡即將有新的開始。在結束aShareaDay前一直在思考要用什麼樣的平台繼續寫文章，其中的選項有：
1. 目前超夯的[logdown](http://logdown.com/)
2. 自由簡單的wordpress
3. 以及[jekyll](http://jekyllrb.com/)

當然，看到我這網站的位置，就是使用Jekyll in Github page，本篇就是要說明我用jekyll的原因。
<!-- more -->

## aShareaDay 的問題
在很久之前有參加一次KSDG的活動(忘記活動名稱了..，大約是半年前吧)，那次是介紹github page，也在那一次聽說了jekyll，那次只是個開始。約幾個月後，我開始寫[aShareaDay](http://ashareaday.wcc.tw/)，aShareaDay是利用ajax撈其他頁面的資料，而每天的post都是一個html檔，利用ajax載入，這樣可以做出類似CMS的管理效果，但是...我的js並不是很強，所以aShareaDay其實並不完美，尤其是google analytic一直沒有辦法完整的分析，以及搜尋工具無法搜尋到aShareaDay的文章資料。

### aShareaDay的優缺點
優點：
1. 會寫html就可以上傳文章
2. 做demo超方便(如果是用codepen寫demo有連續性的問題)
3. ftp輕鬆上傳，輕鬆改

缺點：
1. 沒有留言功能...(這樣就沒有回饋)
2. google搜尋不到文章內容(我試過了，最多我只能讓他搜尋到ajax的menu...)

在aShareaDay快結束前，我開始尋找其他解決方案，列入考慮的就是摘要所提的那三點(logdown、wordpress、jekyll)。

1. **logdown**
	目前來說，這是一個很夯的blog，markdown、拖曳上傳這些方式都能有效的減少文章編寫的時間，如果硬要說他的缺點就是 1.不好做demo，2.內建的樣板......真的....讓人沒有付費的勇氣。
2. **wordpress**
	其實，他除了樣板多及可以架在自己的server上缺點還挺多的...，除了logdown的不好做demo缺點外它還有幾個缺點 1.寫文章很困難，2.高流量的問題，3.有點慢。
3. **jekyll**
	我不能說它能解決所有的問題，畢竟我還是在測試中，它至少可以解決原本aShareaDay的問題，以及保有aShareaDay的優缺點的優點，所以我目前考慮用jekyll。

## Jekyll
透過 Jekyll 可以將靜態 html 或是 markdown 快速生成一個blog，而他所產生的blog是沒有包含資料庫的純靜態html網頁，在技術上的好處當然就是速度快、簡單，缺點就是留言等功能必須仰賴DISQUS等。

Github 提供靜態網頁的服務，稱作為[github page](http://pages.github.com/)，而他也支援jekyll(如何使用在未來有機會在介紹)，兩個在一起就是無線流量、容量的blog，只要寫好新的文章commit就可以post新的文章。

缺點：馬的，明明就很難 !
