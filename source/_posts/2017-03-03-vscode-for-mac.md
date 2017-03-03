---
layout: post
title: VSCode 快速推坑介紹文
category: javascript
tagline:
tags: [js, promise,es6 ]
cssdemo:
jsdemo:
thumbnail: 
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/blog%2F201703%2Fblog_cover_20160303.png?alt=media&token=85525b66-2588-45b7-855a-fe55f7621804
published: true
---

用過的 Editor 很多，常常出現新款的 Editor 都會嘗試一下，雖然主流的不一定會喜歡，但多嘗試也不是壞事，這邊稍微列出個人主觀的意見供大家參考參考：

### Dreamweaver
這是早期在使用的 Editor，特色是所見即所得，但這個也成為 Dreamweaver 的致命傷，畢竟做網頁精準的還是瀏覽器上的呈現，過度依賴所見即所得對於學習會有所限制，後來開始精進 CSS 後就不太使用這個工具。

### Sublime Text
目前相當主流的 Editor，到現在偶爾會打開使用，主要原因是速度極快，搭配良好的套件可以快速完成大量的程式碼，作為一個 Editor 是非常優秀的，但在開發上總是會期待更多的功能 (嘿嘿嘿。

### Atom
算是 Sublime Text 的升級版，優秀的套件管理及更豐富的延伸套件，能夠達到 Sublime Text 沒有的功能，像是快速啟動 Webserver、內嵌終端機都不是問題。缺點是非常消耗硬體資源，對於較大的檔案可能會有 Crash 的問題，除此之外算是遇到 VSCode 之前的主要開發工具。

### VSCode 
在一開始使用時對於操作不是很習慣，但隨著套件越來越多以及更新改版，也很貼近先前使用的幾套工具，開始嘗試使用開發 Node.js 專案是非常棒的，除了前幾套開發工具有的功能外，內建的 Git、debug tool 都非常的實用，且能夠與 iTerm、Gulp、Webpack 整合，算是 Node.js 開發的神器 (2017年初來說的話啦)。


## VSCode 的好用功能

內建 Terminal
按下 `Ctrl + \`` 後， VSCode 就會開啟預設的 Terminal 工具，如下圖所示，個人通常是使用 iTerm 在開發，按下之後下方會有 iTerm 分頁直接使用。如果說有需要修改預設字體，可以打開設定檔加入以下：

```
     "terminal.integrated.fontFamily": "Monaco for Powerline",
```

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488526382500_+2017-03-03+3.32.48.png)


### Git 整合
懶人使用的 Git 工具，只要勾一勾直接就可以 Commit。

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488526637010_screen_shot+2016-12-07+11.17.33.png)


在 Commit 前需要做程式碼比對也是相當容易的，點擊檔案名稱自動會出現比對，過去需要仰賴其他 GUI 工具才能做到，現在 VSCode 就內建此功能，可以大幅減少 Code Review 的時間。

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488526813427_+2017-03-03+3.39.36.png)


### Debug Mode 偵錯工具
針對 Node.js 或其他後端的開發 (目前僅有測試過 Node.js)，VSCode 可以做到服務啟動、中斷點、一鍵重啟的功能，按下 `cmd + shift + D` 可以開始建立組態檔。

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488527132227_screen_shot+2016-12-07+11.20.19.png)


預設的組態檔其實都寫好了，存檔後就可以啟用服務。

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488527193061_screen_shot+2016-12-07+11.29.11.png)


設定中斷點，觸發時會列出當下的變數狀態，讓後端開發搞得跟用 Chrome 一個樣 (有嗎？

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488528002350_+2017-03-03+3.59.41.png)


啟用後畫面上會出現這樣的工具，可以暫停、重啟、停止服務。


### Gulp、Webpack … 整合
如果專案中有 gulpfile.js，按下 `cmd + shift + P` 呼叫 task run，VSCode 會自動撈出 gulpfile 內的 Task 讓開發者選擇執行。

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488527360897_screen_shot+2016-12-07+11.41.51.png)


停止方式：Terminate Running Task

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488527386910_screen_shot+2016-12-07+11.44.03.png)


### 尋找錯誤程式碼
程式碼有錯，卻找不到在哪裡 (隱藏在茫茫 Code 海中的全行字元啊～)，按下 `shift  + cmd + m` 就會標出目前錯誤的問題，但其實平常打錯他就會有標示囉。

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488527872417_+2017-03-03+3.57.19.png)


### 程式碼提示
完整的 Javascript 程式碼提示，像下面這個功能不需要多解釋，隨便按都會看起來很專業。

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488528169928_+2017-03-03+4.02.31.png)


### 設定檔
雖然說他沒有 Atom 那樣的 GUI 設定工具，但這樣的設計反而讓工程師更容易去搜尋想要的設定，左邊是設定的預設值，複製到右邊的個人設定檔就可以修改參數，且設定檔包含完整的中文說明，透過搜尋列可以輕鬆找到要修改得值。

![](https://d2mxuefqeaa7sj.cloudfront.net/s_72BC4B74E216BF77B2784F54FA3797D621AAE94E950A70144D5CC7B5EC2446CC_1488528442661_+2017-03-03+4.07.00.png)


VSCode 的功能相當多，相信不是一兩篇短文推坑就能摸熟，如果有興趣可以參考 Will 保哥介紹的影片，不到一個小時就能讓你從其他 Editor 轉來使用 VSCode。
影片：https://www.youtube.com/watch?v=CAQdar3JGEU

圖片目前放在 Dropbox Paper 上，如有遺失會再更新。