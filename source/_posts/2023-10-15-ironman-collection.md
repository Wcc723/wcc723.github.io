---
layout: post
title: Node.js 實戰密技大統整（套件運用、金流、第三方登入、雲服務、Docker）
category: development
tagline:
tags: [javascript, nodejs]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fnode_full_package.jpg?alt=media&token=54c353df-2cdf-4f50-987b-454ffdbb9960
published: true
---

大家好，我是卡斯伯老師，

我在 2023 年參加了 iThome 所舉辦的鐵人賽，這個比賽是連續 30 天每天都要寫一篇技術文章，系列主題名稱為：「Node.js 實戰密技與辦公室的小壞壞：即戰力釋放讓總裁的心動瞬間」，顧名思義主題會跟 Node.js 的實作有關（但是後面那段是...？）

在這個系列中，我介紹了許多 Node.js 的實作技巧，包含：Node.js 基礎、Node.js 實用套件、Node.js 與第三方服務、Node.js 與雲服務、Docker 容器化等等，與過去單純寫文有很大不同；過去主要是以文章為主，而這次則轉換成以影片為主，並且搭配文字說明，希望能夠讓大家更容易理解。

在這裡我將這 30 篇文章做一個大統整，方便大家查閱，也歡迎大家訂閱我們的 [YouTube 頻道](https://www.youtube.com/@hexschool)，我們會持續更新更多的影片。

## Node.js 知識

首先來到 Node.js 的知識篇，算是整篇中與實戰關係較小的部分，主要想跟大家分享我在教學中新手同學的常見問題，以及一些 Node.js 的在應用上的小技巧。

##### 1. Node.js 可以使用 import 取代 require 嗎？
影片連結：https://youtu.be/62q8z_ZjAcw

##### 2. 還在用 npm？使用 pnpm 解決 node_module 塞爆硬碟的問題
影片連結：https://youtu.be/DKulVqlQYa8

##### 3. 27 分鐘示範 MVC 架構
影片連結：https://youtu.be/kgcoikKc-74

##### 4. 使用 Promise 解決 Node.js 伺服器終止運作的問題
影片連結：https://youtu.be/PQ5sFBS2HNY

---

## Node.js 實用套件

Node.js 在開發上總是會使用許多不同的套件，這些套件可以讓我們的開發更加快速，也能夠讓我們的應用更加穩定，因此在這個系列中我會介紹許多實用的套件，主題的選擇上都是實戰中常用的工具，希望能夠讓大家在開發上更加順利。

##### 1. 從零開始介紹 JWT 驗證
影片連結：https://youtu.be/0ZWo22vF4uU

##### 2. WebSocket 實現 1 對 1、1 對多即時通訊
影片連結：https://youtu.be/1JH3tLhyzl8

##### 3. Jest 單元測試 | 增加應用程式穩定性
影片連結：https://youtu.be/t6gmcGENJTw

##### 4. 開發同時附加文檔｜Node.js Swagger API 文件建置
影片連結：https://youtu.be/L-MYeWFpXWE

##### 5. 使用 Puppeteer 實現自動化測試
影片連結：https://youtu.be/xNXNR4evwC0

##### 6. Cheer.io 實作 Node.js 爬蟲工具
影片連結：https://youtu.be/A-Rfk8yDc2Q

---


## Node.js 與第三方服務

許多程式語言本身並不難，難的是如何與第三方服務進行串接，因此在這個系列中我會介紹許多與第三方服務串接的技巧，包含：金流串接、第三方登入、雲服務等等。內容會著重在這些第三方服務如何申請以及運作邏輯，並且直接提供完整的範例程式碼，讓大家可以直接套用。

##### 1. Node.js 串接第三方支付 - 藍新金流
影片連結：https://youtu.be/-eg-fRDWNFg
補充文件：[連結](/development/2023/09/26/newebay/)

##### 2. 綠界科技金流串接 - Node.js
影片連結：https://youtu.be/qVaVvesLgus

##### 3. GitHub OAuth 第三方登入超簡單
影片連結：https://youtu.be/A7s8sqitq50

##### 4. 開發者不可不會 Google OAuth 實作
影片連結：https://youtu.be/75brbKarbn0

##### 5. 從零開始 AWS S3 檔案上傳範例（包含 IAM 設定）
影片連結：https://youtu.be/y12KO8XM6jw
補充文件：[連結](/development/2023/09/28/aws-s3/)

##### 6. 想蹭免費雲端儲存空間？Firebase Storage 省錢用超爽
影片連結：https://youtu.be/H4GmskFhSJQ
補充文件：[連結](http://localhost:4000/development/2023/09/29/fireabase-storage/)

---

## Node.js 與雲服務

學了後端怎麼可能不上雲？但對於許多新手來說，租用一台虛擬主機、購買一個網址，不管在選擇或是在理解流程上，都需要花上不少時間，因此在這個系列中我會介紹許多雲服務的使用技巧，包含：IaaS、PaaS、VPS、Domain、SSL 憑證等等，並且提供完整的操作流程，讓大家可以輕鬆上手。

##### 1. IaaS、PaaS 是什麼？新手雲端主機怎麼選？
影片連結：https://youtu.be/Gj27EIv5Xhk

##### 2. 上手無門檻、部署超快速的雲服務 (ft. Zeabur)
影片連結：https://youtu.be/OoLqwr7vYsk


##### 3. 從零租一台 VPS 主機，並且部署 Node.js 應用跑給你看（PM2）
影片連結：https://youtu.be/e9Y4sWcwsn8
補充文件：[連結](/development/2023/10/03/unbuntu-and-pm2/)

##### 4. 使用 GitHub Action 部署 Node.js 應用
影片連結：https://youtu.be/cUmSAGtP-70
補充文件：[連結](/development/2023/10/04/nodejs-github-action/)

##### 5. Domain 如何運作？從零註冊一個網址並綁定至 VPS 主機
影片連結：https://youtu.be/xfoyZn0LeqQ

##### 6. 【教學】讓你的網站更安全，使用 Cloudflare 免費加入 SSL 憑證
影片連結：https://youtu.be/JZf_Z8p5IJo


## Docker 容器化

隨著微服務的興起，Docker 容器化的概念也越來越受到重視，雖然本系列是以 Node.js 為主軸，但在 Docker 的許多基礎概念是可以延伸運用的，本系列會從頭開始介紹 Docker 的基礎概念，並且逐漸延伸到 Docker Compose 並且部署到雲服務，同時結合前幾章的內容，讓這些服務可以綁定特定 Domain。

##### 1. 20 分鐘入門 Docker，建立屬於你自己的 Docker Image
影片連結：https://youtu.be/RsY5cCc9RGM
補充文件：[連結](/development/2023/10/07/docker-container/)

##### 2. 運行 Docker 在 Ubuntu 環境｜從本地端上傳 Docker Image 至 Ubuntu 伺服器
影片連結：https://youtu.be/JocSDHOFNzw
補充文件：[連結](/development/2023/10/08/ubuntu-docker/)

##### 3. 超容易！10 分鐘透過 Docker hub 部署 image
影片連結：https://youtu.be/hxX5MIohy1Q

##### 4. Docker 搭配 GitHub Action，git push 達成自動化部屬
影片連結：https://youtu.be/NXhTMrlooic

##### 5. Docker Compose 神器：一行指令部署 MongoDB 和 Node.js！
影片連結：https://youtu.be/Bxr0A3tdgMc

##### 6. 使用 Portainer 的 GUI 管理伺服器 Docker 服務
影片連結：https://youtu.be/o7ZPkruxRbg
補充文件：[連結](/development/2023/10/11/portainer/)

##### 7. Docker Compose 搭配 GitHub Action，一鍵部署到底的自動化服務
影片連結：https://youtu.be/LJZ9YQOgu2w

##### 8. 使用 Traefik 進行反向代理｜單一伺服器綁定多網域
影片連結：https://youtu.be/CV3pi8KQEy0
補充文件：[連結](/development/2023/10/14/traefik/)


## 2023 年末 - Vue 作品實戰班

你是否...
- 找工作時，總是被問到「有什麼作品嗎？」
- JavaScript 會了語法，但要開始做東西 “卻不知如何下手？”
- 嘗試做小作品，但每次都因為美感不佳而放棄
- 業界聽說都要前後端分離，但總找不到相關資源進行練習？

2023 僅此一班，Vue 作品實戰班即將開班囉（講師：卡斯伯）～

#### 課程包含
- **帶您做出一份求職專屬作品**
- 超過 1800 分鐘的教學內容（8週直播 + 20小時課程影音）
- 超過 30 支客製化 API 練習
- 透過專題引導帶您完成獨立作品
- 求職前的履歷健檢
- 課程期間的無限次發問

{% raw %}
<a href="https://hex.school/fPKVU" target="_blank">
  <img src="/images/2023/only-vue-banner-w2.jpg" width="60%" style="border: 1px solid gray" alt=""> 
</a>
{% endraw %}

2023 額外新增分組專題，詳情可見 [Vue 作品實戰班](https://hex.school/fPKVU) 課程說明頁面。