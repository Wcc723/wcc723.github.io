---
layout: post
title: 鐵人賽：邁向 JavaScript 的勇者
category: javascript
tagline:
tags: [js, javascript, ironman]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201801%2F18_ironman_cover_30.jpg?alt=media&token=78b9c963-1d50-4f34-b11b-a4b45fe832dc
published: true
---

這次是第四次參加鐵人賽，先前參加的主題分別為兩次 CSS 及一次 JavaScript (D3.js)。

因為原本是視覺設計師，在過去曾經打算專精於 CSS 就好，所以不斷專精 CSS 的表現模式以及他的開發模式，我還曾經開發過幾次的 CSS Framework (有實際運用過)，不過隨著時間發展這個概念有了改變 :D。

撇開 CSS 不說，對於多變的 JavaScript 還是有一些自己的看法，在最後一篇就寫寫我對於此的一些看法。

## 目前還有持續學 CSS 嗎？
CSS 很重要，但如果在良好的架構下，定義好的 CSS 基本上不太需要去做調整，一個專門的前端開發者 (需要包含 CSS、JavaScript 開發)，絕大多的時間都會把開發精神放在 JavaScript 上，且 CSS 的變化性不像是 JavaScript 那麼快，學個幾招夠用好幾年，所以就現在來說只會先略為研究新的語法 `CSS Grid`，但目前不會使用在主要的產品網站上，等有被實際運用在主要網站上後再觀察也不遲。

以 Flex 來說，我在 4 ~ 5 年前就已經有研究了，2 ~ 3 年前已經有許多知名網站已經開始套用(我自己實際是在 2016 在產品頁面上套用 Flex，發生錯誤的回饋並不多)，但實際被接受也是近一兩年，CSS 變化挺慢的且應用變化不多，所以新語法研究一段時間後就把時間拿去研究 JavaScript 了。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201801%2F20161201.jpg?alt=media&token=043c930d-ce81-43cb-bd0d-d09114671330)

## 先學 jQuery 還是先學 JavaScript
先說，我是先學 ActionScript 的，後來開始工作後開始學 jQuery，後來才開始花更多的時間學習 JavaScript 。

這個議題也是看過很多人討論，但就目前而言我會比較推薦先學「jQuery」，除了你可以啃得下 [JavaScript 基本指南](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Guide) 不會覺得難以閱讀(如果沒問題，可以跳過 jQuery)。會先說學習 jQuery 的原因在於它容易學習且容易有成就感，並不是所有人在學習 JavaScript 就有程式背景，而 jQuery 將許多複雜的概念用簡單的方式去執行。

雖然如此，在了解 jQuery 後，還是需要精進 Native JavaScript 能力，畢竟糖吃太多對身體不太好。學了 JavaScript 後可以再回頭看看 `糖` 的成分是什麼，也會有所茅塞頓開的感覺。

## 要不要接觸後端
我主要的工作是前後端均有參與的，雖然不到專精於後端的全端工程師，但基礎的 Router、API、部署 也都沒有問題，如果對於 JavaScript 掌握度有一定的朋友，或工作上有很長時間需要接觸 JavaScript 的開發者，非常建議花時間玩玩 Node.js，原因如下：

### 了解前後端協作的眉角
前端並不了解後端，也並非所有後端了解怎麼與前端配合，在這兩個專業領域之間就產生了一個隔閡，許多誤會、溝通成本就在此部分出現。所以身為前端如果了解後端的運作原理，自然也能夠多為對方著想。

像是一個新的開發需求產生，如果前端在等待後端的 API 過程中就只能刻刻畫面、假裝研究新技術!?但如果有些經驗後，也可以先與後端先討論 資料欄位、API 發送時機、後端需配合的額外欄位 (很多是為了配合畫面而開的)，這樣的討論下，後端甚至能在腦中勾勒出：「啊，原來這樣做就好了喔～」(情境二：靠北，怎麼這麼麻煩)，然後預先產出可用的資料結構供前端先行運作，最後等待兩人完成的介接。

### 更豐富的運用
瀏覽器端的 JavaScript 通常稱為 "客戶端"，主要是讓使用者有更好體驗所存在的，但 Server 端就不僅僅是為了服務客戶端，除了服務公司外，也能成為自己的好幫手。

像是 [好想工作室的 Howard: 爬蟲始終來自於墮性](https://ithelp.ithome.com.tw/users/20107159/ironman/1325) 就是一個例子，最近聽到一個學生看完他的爬蟲教學後，也嘗試來爬 **PTT 表特版** (優秀)。除此之外像是金流服務、Bot，甚至到個人創業的 idea 都可以執行。好後端，不試試嗎？

### 穩定的環境
在瀏覽器端寫 ES6 (甚至部分 ES5) 都要不斷的注意相容性，有些語法寫得很開心，實際測試卻不能運行；不然就是要透過 `Babel` 來編譯，把純 JavaScript 都搞得像前置語言一樣 (`CoffeeScript`、`TypeScript`...)。在 Node.js 環境下，可以直接看 [Node.js Support ES6](http://node.green/) 了解目前的伺服器可以運行哪些語法，不行直接掛點，一翻兩瞪眼毫不囉唆。

## JavaScript 多面向的運用情境

JavaScript 可以被運用的層面相當廣，就目前所認識的程式語言來說，他是最廣的一種(很抱歉，這裡我就不去查相關資料囉)。從前面所介紹的前端、後端，他亦可運行在許多不同的環境下，如果地球上最多人使用的是印歐語系，那麼 JavaScript 就是開發界的印歐語系，搭配不同的工具，讓同一個語言到處都能通。

### 桌面應用程式

- 代表工具：https://electronjs.org/
- 應用程式：Slack、Atom、Github Desktop、VSCode

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201801%2F%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7%202018-01-02%20%E4%B8%8A%E5%8D%8810.17.20.png?alt=media&token=6db6acf9-f263-4e75-acd6-8b4c3b66b346)

Electron 是基於 Chromium 和 Node.js (簡單來說就是一個 Chrome 的應用程式)，因此只要瀏覽器做得到的事情，基本上他都能辦到，並且可以與作業系統的環境整合(最近文件、自訂選單、縮圖、提示訊息...)，也有許多官方應用程式現在都是直接使用 Electron 做開發，透過此工具可以一次開發符合 Windows、Mac OS、Linux 等平台，相對能減少許多的開發成本。

缺點：一個應用程式相當於一個 Chrome 分頁，資源相對消耗比較高。

### 行動應用程式

- 代表工具：Crodova
- 相關支援工具：Ionic、Adobe PhoneGap

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201801%2F%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7%202018-01-02%20%E4%B8%8A%E5%8D%8810.18.09.png?alt=media&token=0efd66f2-7fea-4f4c-8b09-18e45ad8cfe9)

Crodova 與 Electron 類似，但亦有些不同。Electron 是基於 Chromium 上開發(運行在 Chrome 上)，而 Crodova 基於瀏覽器的 Web View(是使用裝置的瀏覽器)，另外 Electron 除了 Web 技術外，另外還包含 Node.js，而 Crodova 僅使用 Web 技術。

使用 Web 技術開發行動應用程式發展許久，但因為每家的瀏覽器都略有些不同，要做到跨裝置的呈現還是有些困難，效能、呈現上也似乎還離原生應用還有段距離，

### IOT
- 代表工具：Webduino
- 相關教學：https://ithelp.ithome.com.tw/users/20091306/ironman/1161

Webduino 是台灣所開發的應用服務，可以使用 Web JavaScript 呼叫雲服務的 API 控制 Arduino，也因為可以使用 Web 技術，無論是什麼框架都沒有限制(jQuery, polymer 都可使用)。先前有參加過他們活動，當第一次透過自己寫的程式碼控制燈泡亮起來是真的非常有成就感。

<iframe width="560" height="315" src="https://www.youtube.com/embed/kemcCLAseTg" frameborder="0" gesture="media" allow="encrypted-media" allowfullscreen></iframe>

> 他們先前釋出的影片，透過 Web 操作氣球，就如同遙控飛機一樣。

## 鐵人賽結束

當然，很開心在幾年前學到一個應用層面這麼廣的程式語言，到目前還有許多都還不斷的在學習中。除了開發以外，今年依然期許自己能夠有更多的發展(區塊鏈、智能合約等等)。

那麼，感謝大家三十天來的觀看，有機會可以來我粉絲團聊聊喔 :D

卡斯伯粉絲團：https://www.facebook.com/WccCasper
