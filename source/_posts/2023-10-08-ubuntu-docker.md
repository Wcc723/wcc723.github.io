---
layout: post
title: 在 Ubuntu 上加入 Docker 環境並部署 Node.js 專案
category: development
tagline:
tags: [javascript, nodejs]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fubuntu-docker.jpg?alt=media&token=3112bf6d-7951-458e-9def-b158a6c72609
published: true
---

{% raw %} 
<div class="ratio ratio-16x9">
<iframe width="100%" src="https://www.youtube.com/embed/JocSDHOFNzw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
{% endraw %}
這是鐵人賽相關文章，影片會在活動開始後發布

本篇文章會介紹如何「如何在 Ubuntu 環境上加入 Docker 環境，並且部署 Node.js 專案」，建議對於指令操作有基本的經驗，以下是本文包含的流程：
1. 在 Ubuntu 上安裝 Docker 環境
2. 本地端上傳 Docker Image（使用 SCP 的指令）
3. 伺服器 Docker Daemon 未啟動的解決方式

另外，本篇的相關程式碼可以參考：https://github.com/Wcc723/node-ironman-sample-2023/tree/feature/docker-sample

## 在 Ubuntu 上安裝 Docker 環境

Ubuntu 上安裝 Docker 環境可直接參考[官方文件](https://docs.docker.com/engine/install/ubuntu/)，文件說明已相當完整，或在此參考中文化版本。

1. 首先更新你的現有列表套件：

```bash
sudo apt-get update
```

2. 允許使用 HTTPS 進行套件安裝：

```bash
sudo apt-get install ca-certificates curl gnupg
```

3. 添加 Docker 的 GPG 鑰匙：

```bash
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

4. 添加 Docker 的 repository：

```bash
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
```

5. 再次更新套件：

```bash
sudo apt-get update
```

6. 安裝 Docker：

```bash
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

7. 驗證是否有安裝成功：

```html
docker -v
```
![檢視安裝的 Docker 版本](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fubuntu-docker-1.png?alt=media&token=57f34fe2-90ee-4e04-9cc0-4a3a443127f7)

8. 驗證 Docker 是否已成功安裝，並運行：

```bash
sudo docker run hello-world
```

![運行官方提供的範例](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fubuntu-docker-2.png?alt=media&token=19817044-4443-4ca4-a0a3-90977a7afc10)

官方的範例僅會出現上方提示文字，表示已經成功運行。可以直接使用 `docker ps` 列出所有容器，然後再使用 `docker rm <container id>` 移除該容器。

## 本地端上傳 Docker Image

首先，在你的本地系統中保存 Docker Image 成 tar 檔案： `-o` 表示輸出 output（請先使用 build 指令建立映像檔）。
    
```bash
docker save -o <tar文件名稱.tar> <image名稱:tag>
```
    
在本地端使用 scp 將 tar 檔案傳輸到虛擬主機上：
    
```bash
scp <tar文件名稱.tar> <使用者名稱>@<虛擬機IP位址>:<路徑>/<檔名>.tar
```
    
登入虛擬主機，然後在虛擬主機中使用 Docker load 加載 Image（`-i` 表示輸入 input）：
    
```bash
docker load -i <tar文件名稱.tar>
```
    
接下來使用 `docker images` 檢視已經準備好的 image，可以看到剛剛的 image 已經加入列表中，並使用 `docker run -d <image名稱:tag>` 運行 docker 環境。
    
```html
docker run -d -p 8080:3000 <image名稱:tag>
```

上述指令中的：    
-  `-d` 選項意為 "detach"，意即在背景模式下運行容器。使用 `-d` 選項後，Docker 會在背景中運行容器，並返回容器 ID，不會看到任何的輸出，終端機會直接返回。
- `-p 8080:3000` 表示將容器的 3000 port 對應到主機的 8080 port，這樣就可以在主機上透過 8080 port 來訪問容器中的應用程式。

可能遇到的錯誤：
```
WARNING: The requested image's platform (linux/arm64/v8) does not match the detected host platform (linux/amd64/v3) and no specific platform was requested
```
    
錯誤是因為試圖在一個系統環境（如 `linux/amd64`）上運行為另一個系統環境（本範例為 `linux/arm64/v8`）建立的 Docker 映像。解決方式需要在建立時指定平台，例如：
    
```bash
docker build --platform=linux/amd64 -t {tag name}
```

完成後再重複上述的流程即可。

#### Docker 服務遇到錯誤終止的解決方式


在執行時加入 `--restart=always` 參數，表示當服務終止時，Docker 會自動重啟服務。
    
```bash
docker run --restart=always -d my-node-app
```

## 伺服器 Docker Daemon 未啟動的解決方式

如果機器出現錯誤，導致 Docker Daemon 未啟動，可以使用以下指令啟動 Docker Daemon：

```bash
sudo systemctl start docker
```

如果你想要在系統開機時自動啟動 Docker，可以使用以下指令：（雖然這樣，重啟後的 container 依然不會自動運行）

```bash
sudo systemctl enable docker
```

要停止 Docker daemon，可以使用以下指令：

```bash
sudo systemctl stop docker
```


如果你不希望在系統開機時自動啟動 Docker，可以使用以下指令：

```bash
sudo systemctl disable docker
```

要檢查 Docker daemon 的狀態，可以使用以下指令：

```bash
sudo systemctl status docker
```

這些指令都需要 root 權限，所以需要使用 `sudo` 指令。如果你已經將用戶添加到了 `docker` 群組，則可以直接執行 Docker 指令，不再需要 `sudo`。

#### 如果無法停止
    
如果會看到以下錯誤，主要原因是因為 docker socket 仍在運行中（部分容器還在運行）：

```bash
Warning: Stopping docker.service, but it can still be activated by:
docker.socket
```

需要將完整的 docker service 關閉，可使用以下指令：

```bash
sudo systemctl stop docker.service
sudo systemctl stop docker.socket
```

## 總結

本篇文章介紹如何在 Ubuntu 上安裝 Docker 環境，並且部署 Node.js 專案，另外也介紹了如何在本地端上傳 Docker Image 到虛擬主機上，以及 Docker Daemon 未啟動的解決方式。

