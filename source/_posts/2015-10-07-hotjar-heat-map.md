---
layout: post
title: Hotjar 網站熱圖
category: tools
tagline:
tags: [tools]
cssdemo: 2015-summer
jsdemo:
thumbnail:
published: true
---

Hotjar 是監視網站使用者資訊的工具，提供 Heatmap、Recording、Funnels、Forms 四種監測服務，透過這四種服務可以分析使用者行為，判斷使用者操作是否符合預期。

<!-- more -->


服務：[https://www.hotjar.com/](https://www.hotjar.com/)

## 註冊

在註冊時分為兩個步驟，第一階段是一般註冊資訊，第二階段會要求建立要監測的站台，如果還沒有站台，其實先隨意填也沒關係，在註冊後還是可以修改。

![](/images/hotjar/screen_shot_2015-10-07_01.png)

## 測試 heatmap

登入到Dashborad後，他會要求在網站內加入一段 `<script>` ，這段需要有在線上的網站才能夠運行，本文先以這 **http://wcc723.github.io/** 做為測試，將以下 `<script>` 加入網站的主版。

![](/images/hotjar/screen_shot_2015-10-07_02.png)

另外加入後，他會有一個 **驗證script** 按鈕，驗證網頁是否有正確加入，如果正確就會詢問出現以下畫面，讓開發者選擇服務。

![](/images/hotjar/screen_shot_2015-10-07_03.png)

接下來開一個 `Heatmap` 服務，操作上也相當容易，只要填入名稱、網址即可。

![](/images/hotjar/screen_shot_2015-10-07_04.png)

接下來靜置個一段時間...，不然就是自己動手測試(Blog太久沒更新流量降低 orz...)就可以獲得一些些data。

![](/images/hotjar/screen_shot_2015-10-07_05.png)

最後就可以獲得以下的熱點圖，而目前這個blog版型是使用 `Material design lite`，在scroll上有些bug，因此監測scroll的準確度很低，如果要正常使用，網頁的scroll也必須注意。

*Manage up to 3 Heatmaps with Hotjar Basic. Need more? Delete old Heatmaps or go unlimited.*

*基本版提供三個Heatmap服務*

## Recording

這個工具用影片的方式呈現使用者的行為，啟用以後就可以進行全站錄製，但和heatmap一樣，目前本blog有scroll的bug ＝ ＝...，所以沒辦法錄得很好，只能先體驗一下。

監視工具還會提供使用者的基本資料，如國家、裝置、瀏覽器、系統還有操作時間等等，只要點 `PLAY` ，就可以預覽錄製的影片。

![](/images/hotjar/screen_shot_2015-10-07_06.png)

就這樣使用者的行為被開發者摸得一清二楚!?

![](/images/hotjar/screen_shot_2015-10-07_07.png)

*Manage up to 300 recordings with Hotjar Basic. Need more? Delete old recordings or go unlimited.*

*基本版提供300個影片紀錄*

由於本 Blog 不適合繼續玩 Funnel、Form 所以只能留給大家自己玩了。

許多時候設計師和工程師在介面上各有意見時，不仿試試看監測工具，分析使用者的行為，或許使用者操作會超乎所有開發者的預期。而相關的工具也越來越多，只能多方嘗試，選定合適才是上策。



