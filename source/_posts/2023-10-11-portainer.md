---
layout: post
title: Portainer 環境建置 - Docker 伺服器端最易上手的 GUI 管理工具
category: development
tagline:
tags: [javascript, nodejs]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fportainer.jpg?alt=media&token=53074ae4-7d1d-4237-919c-7097db7797f9
published: true
---

{% raw %} 
<div class="ratio ratio-16x9">
<iframe width="100%" src="https://www.youtube.com/embed/o7ZPkruxRbg" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
{% endraw %}
這是鐵人賽相關文章，影片會在活動開始後發布

本篇文章會介紹如何「如何在 Ubuntu 環境上加入 Portainer 工具，並且示範部署 Node.js 專案」，建議對於 Docker 操作有基本的經驗，以下是本文包含的流程：
1. 在 Ubuntu 上安裝 Portainer 環境
2. 從 Docker Hub 下載 Docker 映像檔並運行
3. Portainer 環境的基本操作

## 在 Ubuntu 上安裝 Portainer 環境

在安裝 Portainer 前，請確保已經有先安裝 Docker 環境，如果還沒安裝可以先參考 [本篇文章：在 Ubuntu 上加入 Docker 環境並部署 Node.js 專案](https://www.casper.tw/development/2023/10/07/docker-container/)，Portainer 是一個開源的容器管理工具，可以讓您輕鬆管理 Docker 或 Kubernetes，不過本系列文章只會聚焦在 Docker 上。

以下是在遠端 Ubuntu 伺服器上安裝 Portainer 的步驟：

1. **下載 Portainer 映像**：
使用以下指令下載 Portainer 的 Docker 映像：
    
```bash
sudo docker pull portainer/portainer-ce
```
    
2. **建立 Portainer 容器**：
使用以下指令建立 Portainer 容器，並將其綁定到主機的 9000 port：
    
```bash
sudo docker run -d -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
```
    
3. **瀏覽 Portainer**：

至此，Portainer 已經在您的主機上運行（沒錯，真的已經裝好了）。現在，您可以打開瀏覽器並訪問 `http://伺服器IP:9000`。應該能夠看到 Portainer 的登錄界面。第一次訪問時，需要設置管理員密碼，按照你的配置輸入帳密即可完成。


4. **配置 Portainer**：
藉此，Portainer 已經基礎配置完成，在嚮導流程中，可以在選擇 Get Started Docker 的選項，並且選擇 Local，這樣就可以看到本機運行中的 Docker 環境了。

![Portainer 介面](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96%202023-10-08%2009.46.18.png?alt=media&token=ac76abb2-a2cb-4176-8205-6f0c583bf2cf)

![Portainer 運行中的容器](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96%202023-10-08%2009.47.45.png?alt=media&token=b2c53fd8-9172-45a9-bd16-5c6b39d57378)
> Portainer 運行中的容器


## 從 Docker Hub 下載 Docker 映像檔並運行

使用 Portainer 部署 Docker 映像檔，就不需要指令就能完成複雜流程，可以透過 Portainer 的介面，直接從 Docker Hub 下載映像檔，並且運行，以下是操作步驟：

1. 在 Container 中點選 Add container

![新增一個 Container](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96_2023-10-08_09_48_29.png?alt=media&token=7b35c041-7a5f-44cd-afd6-0ac0c735d406)


2. 在 Image 中輸入 Docker Hub 上的映像檔名稱
![Portainer 介面中，可直接輸入 Docker hub 上的映像檔名稱](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96%202023-10-08%2009.49.59.png?alt=media&token=21061eea-440f-45a1-b397-f08b82906b10)
> 注意：路徑中請不要帶入空白鍵，例如：`casper723/nodejs-docker`，而不是 `casper723 / nodejs-docker`


3. 輸入 network、port、volume 等設定，最後按下 Deploy the container 就可以完成部署了
![Portainer：輸入 port 對應](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96_2023-10-08_09_51_31.png?alt=media&token=fd282b0b-79a5-4f49-a04a-a9d7809c4518)


稍等片刻，就可以在 Container 中看到剛剛部署的映像檔，並且可以透過 Portainer 的介面，直接操作映像檔，例如：啟動、停止、刪除等等。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96%202023-10-08%2009.52.18.png?alt=media&token=ed0b7f8e-eb76-4170-b580-15670e5ca287)

## Portainer 環境的基本操作

過去，如果要透過 Docker 指令查看容器 logs 是相對麻煩的操作，但是透過 Portainer 就可以直接在介面上查看 logs。只要打開運行中的容器，點選 logs 就可以看到 logs 訊息了。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96%202023-10-08%2009.53.40.png?alt=media&token=45669d71-6ce5-4071-bd0d-18e234baa4b0)

在 logs 訊息操作上，我會建議稍作以下的調整：
1. 把行數調整為 1000 行（更大也行），這樣在瀏覽上可以看到更多的 logs 訊息
2. 如果是已經找到相關要查看的片段，可以關閉 Auto-refresh，這樣就不會一直更新 logs 訊息了

![Portainer Logs 操作](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96_2023-10-08_09_54_14.png?alt=media&token=d5505bff-3161-4097-971a-1d2a59a35c6f)

然後再重啟策略上，先前必須在建置 container 時，就要設定重啟策略，但是透過 Portainer 就可以直接在介面上設定，回到 Container 的頁面，在下方就能看到 Restart policies 的設定。接下來直接下拉選擇後，按下 Update 就可以完成設定了。

![Portainer 重啟策略調整（Restart policies）](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96%202023-10-08%2010.04.39.png?alt=media&token=5510ff98-65f4-4a44-9c10-dde485e14480)

除此之外，Portainer 在免費的版本下就有許多功能可用（沒錯，他是可以另外付費的），少部分功能則需要另外付款才能開通，但在一開始的使用上，免費的功能就已經足夠了。