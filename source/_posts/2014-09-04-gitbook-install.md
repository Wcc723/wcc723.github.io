---
layout: post
title: 安裝Gitbook
category: design
tagline:
tags: [design]
cssdemo:
jsdemo:
thumbnail: gitbook/gitbook-20140904-1.png
published: true
---

利用Gitbook製作電子書是相當容易的，作者只要熟悉markdown語法以及簡易的安裝，就可以快速編寫屬於自己的書籍，它有著以下幾點特色。

1. 利用git 版本控制
2. 用git就可以發佈新版本
3. 利用markdown語法編寫
4. 包含手機版

這邊就簡單介紹如何安裝gitbook server在自己本機上，以利於快速與他人合作。

*注意：本文不會提到git操作，在使用gitbook前，請先熟悉git。*


<!-- more -->

![](/images/gitbook/gitbook-20140904-1.png)

[https://www.gitbook.io/book/wcc723/google_design_translate](https://www.gitbook.io/book/wcc723/google_design_translate)

## 安裝

在安裝Gitbook必須先裝Node.js，Node.js 是一個讓 Javascript 運行在服務端的開發平台。它使用了 Google 的 V8 虛擬機(Google Chrome 瀏覽器使用的 Javascript 執行環境)。

另外還有npm，是由Node.js 官方提供的第三方管理工具，並且是一種在 Node.js 應用程式中建立、分享、重複使用模組，而npm在目前的版本，都會隨著Node.js的安裝同時安裝好npm。

簡而言之，我們使用Node.js的服務，透過npm管理工具，如果還是不知道，就是照著操作就是了。

### 安裝node.js

Node.js在這一個部分windows與mac其實只是安裝檔不同，只要按照官方程序裝完就可以了。

![](/images/gitbook/gitbook-20140904-2.jpeg)

這邊就只Show出windows版本的安裝(Mac版大致相同，而後面的介紹會兩者混用)

![](/images/gitbook/gitbook-20140904-3.png)


如果是windows，請打開"命令提示字元”，輸入：

     node -v
     npm -v

預期會出現以下的版本(或者更高)

![](/images/gitbook/gitbook-20140904-4.png)


如果是Mac，請打開終端機，和windows相同，輸入以下指令：

     node -v
     npm -v

預期會出現以下的版本(或者更高)

![](/images/gitbook/gitbook-20140904-5.png)


### 安裝gitbook

由於我這邊mac已經裝完，我用windows做範例，當然結果是一樣的。

打開command輸入以下指令。

     npm install -g gitbook

![](/images/gitbook/gitbook-20140904-6.png)

安裝完後輸入 `gitbook version`，預期會出現以下畫面。

![](/images/gitbook/gitbook-20140904-7.png)

### gitbook serve

範例專案：[https://github.com/Wcc723/google_design_translate](https://github.com/Wcc723/google_design_translate)

接下來到一個專案的資料夾，輸入`gitbook serve`，它就會打開一個port，並且運行gitbook server。

![](/images/gitbook/gitbook-20140904-8.png)

網址輸入`localhost:4000`就可以看到這一個網站。

![](/images/gitbook/gitbook-20140904-9.png)

### 可能會遇到的問題

我也不知道為什麼...，Mac版會出現這個錯誤，反正有解決方式。

![](/images/gitbook/gitbook-20140904-11.png)

回到Terminal，輸入`ulimit -n 4096`，在執行一次`gitbook serve`。

     ulimit -n 4096

![](/images/gitbook/gitbook-20140904-12.png)

安捏，就可以正常執行了。

![](/images/gitbook/gitbook-20140904-13.png)

剩下的部分，可以參考目前[範例](https://github.com/Wcc723/google_design_translate)的架構。而最近發這篇文，是因為聽說9月9日快到了。
