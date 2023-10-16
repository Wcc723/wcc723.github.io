---
layout: post
title: 使用 GitHub Action 部署 Node.js 專案至虛擬主機上
category: development
tagline:
tags: [javascript, nodejs]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fgithub-action-o.jpeg?alt=media&token=70ca38c4-d431-448a-b8a8-ad47f57c2e96
published: true
---

{% raw %} 
<div class="ratio ratio-16x9">
<iframe width="100%" src="https://www.youtube.com/embed/cUmSAGtP-70" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
{% endraw %}
這是鐵人賽相關文章，影片會在活動開始後發布

本篇文章會介紹如何「使用 GitHub Action 部署專案至虛擬主機上」，虛擬主機會使用 PM2 來進行管理，整個流程與業界實戰會略有落差，主要是作為 “基礎知識” 理解所使用，實戰中還是多利用 Docker 容器化來進行管理：
1. 虛擬主機環境準備
2. 準備 GitHub Action
3. 其他說明

程式碼部分可以參考 [本範例](https://github.com/Wcc723/node-ironman-sample-2023/tree/feature/action-pm2)，不過在環境配置上，還是需要勞煩各位自己動手做，它才能夠正確的運行喔

## 虛擬主機環境準備

這是整個流程最複雜的地方，而本篇不會介紹 PM2 的安裝，如果不熟悉可以先參考我另一篇文章 [Ubuntu 虛擬主機部署 Node.js 服務，使用 PM2 服務管理](/development/2023/10/03/unbuntu-and-pm2/)，會從零開始介紹 Ubuntu 環境建置、專案建置、PM2 管理。

這段主要準備的是給予 GitHub Action 連線用的配置，主要是產生 SSH 金鑰，並將私鑰提供給 GitHub Action 使用，流程如下：

#### 建立公私鑰，並加入到儲存庫的 secrets 中

1. 輸入以下指令以建立新的 SSH 私鑰。這裡使用的是 RSA 類型的金鑰（your_email@example.com 請替換為個人 Email）：
    
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

2. 當提示您 `Enter a file in which to save the key`（輸入一個文件來保存鑰匙）時，只需按 Enter。這將會將私鑰保存在預設位置，即您的 home 目錄下的 `.ssh/id_rsa` 文件。

3. 在接下來的提示 "Enter passphrase (empty for no passphrase)"（輸入密碼短語，不需要密碼短語則留空）中，您可以選擇是否要為私鑰設置一個密碼短語。設置密碼短語可以提高安全性，但同時也會降低方便性。如果選擇設置密碼短語，每次使用私鑰時都會要求輸入。選擇不設置，只需按 Enter 即可。

> 注意：在本 GitHub workflow 範例中，加入短語可能會無法運作，屆時需要自行調整


4. 如果一切順利，應該已經在 `~/.ssh/id_rsa` 和 `~/.ssh/id_rsa.pub` 中生成了私鑰和公鑰。可以使用 `cat ~/.ssh/id_rsa` 查看私鑰，並使用 `cat ~/.ssh/id_rsa.pub` 查看公鑰。

> 請注意保護好您的私鑰，不要讓它落入他人手中。

5. 接下來將公鑰加入至 Server 中
  1. `cat ~/.ssh/id_rsa.pub` 查看公鑰並複製
  2. 執行指令 `echo 'ssh-rsa AAAA...' >> ~/.ssh/authorized_keys` 其中的 `'ssh-rsa AAAA...'` 替換成剛剛複製的公鑰

6. 設置權限，讓他可以被讀取
    
```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

#### 將 SSH 私鑰加入到儲存庫的 secrets 中

1. 打開 GitHub 儲存庫，進入上方的 Settings，左側找到 Secrets and variables，展開選擇 Actions，然後按下 “New repository secret”，然後在虛擬主機上使用 `cat ~/.ssh/id_rsa` 查看並複製私鑰。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fgithub-action-01.png?alt=media&token=4ce6b89d-235d-4dc0-bc84-7ecb0f953f84)

2. 加入名稱 “DEPLOY_SSH_KEY” 然後把完整的私鑰加入。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fgithub-action-02.png?alt=media&token=a9424a8d-8f36-4725-b482-f3f0d6f83bfd)

之後以此類推，只要需要加入 secrets 的地方，都可以使用此方式加入。


## 準備 GitHub Action

在專案中，建立資料夾 `.github/workflows`，並且建立 `deploy.yml` 檔案，內容如下：

```yml
name: 部署 PM2 專案

on:
  push: 
    branches:
      - feature/action-pm2

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v1
      
      - name: Install Node.js
        uses: actions/setup-node@v1
        with:
          node-version: 18

      - name: npm install, build and test
        run: |
          npm install
          npm run swagger

      - name: Create .env file
        run: |
          echo ENV_VARIALBES=${{ secrets.ENV_VARIALBES }} >> .env
          echo PORT=${{ secrets.ENV_PORT }} >> .env
        # 然後再執行 rsync 來將 .env 文件傳輸到虛擬主機

      - name: Install SSH key  # 第二步，安裝 SSH 密鑰
        uses: webfactory/ssh-agent@v0.5.3  # 使用第三方的 ssh-agent 動作
        with:
          ssh-private-key: ${{ secrets.DEPLOY_SSH_KEY }}  # 從 GitHub Secrets 中取得私鑰

      - name: 更新 known_hosts 文件  # 步驟的名稱
        run: |  # 將要執行的命令
          mkdir -p ~/.ssh
          ssh-keyscan ${{ secrets.hostname }} >> ~/.ssh/known_hosts
        # 請將 'hostname' 替換為你的服務器地址，例如 IP 地址或域名

      - name: Transfer files  # 第六步，傳輸文件
        run: rsync -avz --delete ./ root@${{ secrets.hostname }}:~/website-sample/node-ironman-sample-2023/  # 使用 rsync 命令將文件傳輸到虛擬主機
        # root@hostname 請替換成相應的帳號及主機位置(ip 或網址)
        env:
          ENV_VARIABLE: ${{ secrets.ENV_VARIABLE }}  # 從 GitHub Secrets 中取得環境變數的值

      - name: Restart PM2  # 第八步，重啟 PM2
        run: ssh root@${{ secrets.hostname }} 'cd ~/website-sample/node-ironman-sample-2023/ && pm2 restart www --update-env'  # 透過 SSH 連到虛擬主機，然後進到應用程式的目錄，並重啟所有 PM2 管理的應用程式
```

專案加入 GitHub Action 後，每次 push 就會觸發部署，並且會在 GitHub Action 中看到部署的狀態，如下圖

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fgithub-action-03.png?alt=media&token=fa331f44-c0d2-43d8-b7c0-1b126b547b23)

如果成功會出現如下的綠色勾勾，並且可以點進去看到詳細的部署過程。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fgithub-action-04.png?alt=media&token=b5b132e9-97c8-43cf-9255-f7f59b66f52c)

反之，當遇到錯誤，則會出現紅色的叉叉，並且可以點進去看到詳細的錯誤訊息。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fgithub-action-06.png?alt=media&token=d0b0c794-f9c1-4e18-9ec2-364f32e682d7)

## 其他說明

GitHub Action 是目前相當主流的自動化工具之一，只要是 GitHub 儲存庫都可以使用，而且可以部署各種語言的專案，例如 Node.js、Python、Java、Go、Ruby、PHP 等等，甚至可以使用 Docker 來進行部署，這邊只是介紹其中一種方式，如果有興趣可以參考 [GitHub Action 官方文件](https://docs.github.com/en/actions)。

然而 GitHub Action 並非免費的服務，可以在個人設定 > Billing and plans > plans and usage 中找到相關的使用量及說明。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fgithub-action-05.png?alt=media&token=8ab5fcb4-b67e-4eda-a5fd-e1987ae40e3a)