---
layout: post
title: Ubuntu 虛擬主機部署 Node.js 服務，使用 PM2 服務管理
category: development
tagline:
tags: [javascript, nodejs]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fnode-pm2.jpg?alt=media&token=05910b04-58c9-4cd0-a09b-648e9d6605aa
published: true
---

{% raw %} 
<div class="ratio ratio-16x9">
<iframe width="100%" src="https://www.youtube.com/embed/e9Y4sWcwsn8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
{% endraw %}
這是鐵人賽相關文章，影片會在活動開始後發布

本篇文章會介紹如何「租賃虛擬主機，並且部署 Node.js 服務」，因為會從零開始建置，因此本篇文章會包含以下文章：
1. Ubuntu 環境建置：主要是準備 Node.js 及 PM2 環境
2. 專案建置：在此會部署 Node.js 服務，從 GitHub 上 pull 專案直接運行
3. PM2 管理：最後，會示範如何使用 PM2 管理 Node.js 專案

## 建置 Ubuntu 環境

原則上任何的版本、伺服器的 Ubuntu 作業系統不會有太大差異，因此以下指令皆可運行，流程如下：

更新套件列表，在此是更新 Ubuntu 套件列表，確保安裝的套件都是最新的：
```bash
sudo apt-get update
```

安裝 Node.js，其中的 `18.x` 可以替換成預期安裝的任何版本。
```bash
# 安裝 Node.js 18.x 版本
curl -sL <https://deb.nodesource.com/setup_18.x> | sudo -E bash -
sudo apt-get install -y nodejs
```

確認 Node.js 和 npm 安裝成功，正確會回應版本號：
```bash
node -v
npm -v
```

如果 NPM 沒有被安裝，可以使用以下指令安裝：
```bash
curl -L https://www.npmjs.com/install.sh | sudo sh
```

NPM 確認安裝無誤以後，可以安裝 pm2 服務。
```bash
npm install -g pm2
```

## 部署專案

你可以使用任何自己的 Node 專案進行部署，或者參考此[範例專案](https://github.com/Wcc723/node-ironman-sample-2023/tree/feature/error-catch)。

接下來，可以使用到以下指令建立資料夾，並且將專案 clone 至資料夾中：
```
mkdir website-sample
cd website-sample
git clone {{ 專案路徑 }}
cd {{ 專案名稱 }}
```

下載後，也可以輸入 ls，就能看到當前專案的資料夾內容，範例如下：
```bash
> ls 
# app.js bin controllers models package.json pnpm-lock.yaml public routes swagger. js views
```

沒有問題後，就能使用 `npm install` 安裝專案所需的套件，安裝完成後，就能使用 `npm start` 運行專案，確認專案運行是沒有問題的。
```bash
npm install
npm run swagger # 範例專案需要加入 swagger 才能正確運行
npm start
```

確認無誤以後，可以按下 `ctrl + c` 來關閉當前 Node.js 運行，接下來就能使用 PM2 服務管理專案。

## 使用 PM2 管理專案

PM2 是一個 Node.js 應用的運行管理器，廣泛用於 Production 環境。它提供了多種功能，以確保專案運行得更佳穩定，並且對於新手來說相當容易上手。

在專案中，可以使用到以下指令來使用 PM2 管理 Node.js 專案。
```bash
# 一般 Node.js 服務
pm2 start

# Express generator 啟動方式（本範例是使用 Express generator）
pm2 start ./bin/www
```

輸入後，專案就與直接使用 `npm start` 無異，可以輸入 `ip` 來進入你當前的專案，不過除此之外，PM2 還有許多的功能，例如你可以輸入 `pm2 monit` 就能開啟例如下圖的監控介面，可以看到當前專案的運行狀態。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2023_9_22_17_00.png?alt=media&token=47531e75-501d-41dc-b4ea-fe999cf68587)

而 PM2 的指令相當多，在此就不一一介紹，可以參考以下常用指令：

#### PM2 常用服務管理指令
```bash
pm2 restart {id, name} # 重啟特定服務
pm2 delete {id, name} # 移除特定服務
pm2 rename <old_name> <new_name> # 重新命名服務(`pm2 rename app myApp`)
pm2 list # 列出所有服務
```

#### 重啟服務相關指令
```bash
# 以無中斷的方式重啟名為 'app' 的服務
pm2 reload app

# 直接重啟名為 'app' 的服務
pm2 restart app

# 以無中斷的方式重啟所有服務
pm2 reload all

# 直接重啟所有服務
pm2 restart all
```

## PM2 設定檔

PM2 除了使用指令操作以外，還可以建立設定檔案進行進階操作，例如 cluster 叢集、自動重啟機制。而在開頭的影片中，因為篇幅關係，並沒有介紹到設定檔的部分（~~真實原因：我忘記錄了~~）。

PM2 設定檔案可參考以下文件：
https://pm2.keymetrics.io/docs/usage/application-declaration/
