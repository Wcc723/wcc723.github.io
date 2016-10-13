---
layout: post
title: 隨意玩玩的 nw.js
category: web
tagline: 
tags: [web]
cssdemo: 
jsdemo: 
thumbnail: 2015-07-31_01.png
published: true
---

之前就有聽說 web可以上桌面應用程式，也找到相關的工具，這次就是把實驗的成果記錄下來。

<!-- more -->

## 安裝nw.js環境

[http://nwjs.io/](http://nwjs.io/)

到官網下載指定版本的工具，由於我是使用mac，最後結果是可行的，但windows等其他環境我就都沒有試過。

![](/images/2015-07-31_02.png)

下載後直接安裝到Mac OS應用程式內就可以了。

## 下載範例包

[https://github.com/zcbenz/nw-sample-apps](https://github.com/zcbenz/nw-sample-apps)

這個測試包可以快速瞭解是否有成功，實際上我也沒寫過(遮臉)。

![](/images/2015-07-31_03.png)

下載後解壓縮內容大概如上，接下來在這個路徑下打開Terminal，輸入以下指令nw.js就會直接打開desktop web app。

    $ /Applications/nwjs.app/Contents/MacOS/nwjs {資料夾名稱}

像這樣輸入以上指令，就可以打開應用程式。

![](/images/2015-07-31_04.png)

這是控制應用程式導覽列的範例。

![](/images/2015-07-31_05.png)

除此之外這包還有許多不錯的範例，像是Camera...，如果有興趣可以自己打開來看看。

