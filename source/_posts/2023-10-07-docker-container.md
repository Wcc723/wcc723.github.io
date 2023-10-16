---
layout: post
title: 在 Ubuntu 上加入 Docker 環境並部署 Node.js 專案
category: development
tagline:
tags: [javascript, nodejs]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fdocker-image.jpg?alt=media&token=895a087f-2b85-469d-8670-2c9fe663016b
published: true
---

{% raw %} 
<div class="ratio ratio-16x9">
<iframe width="100%" src="https://www.youtube.com/embed/RsY5cCc9RGM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>
{% endraw %}
這是鐵人賽相關文章，影片會在活動開始後發布

本篇文章會介紹如何「如何在 Ubuntu 環境上加入 Docker 環境，並且部署 Node.js 專案」，建議對於指令操作有基本的經驗，以下是本文包含的流程：
1. 在 Ubuntu 上安裝 Docker 環境
2. 本地端上傳 Docker Image（使用 SCP 的指令）
3. 伺服器 Docker Daemon 未啟動的解決方式

另外，本篇的相關程式碼可以參考：https://github.com/Wcc723/node-ironman-sample-2023/tree/feature/docker-sample

## 建立 Dockerfile 以及產生 Docker Images

請先確保環境中已經有安裝 Docker 或 [Docker Desktop](https://www.docker.com/products/docker-desktop/)，可以使用以下指令確保有安裝 Docker 環境。

```bash
docker --version
```

Dockerfile 是一個純文字檔案，檔案名稱必須為 `Dockerfile`，並且放在專案的根目錄下，以下是一個 Node.js 的 Dockerfile 範例：

```dockerfile
# 選擇 Node.js 的基礎映像檔
FROM node:18

# 設置工作目錄，WORKDIR 是 Dockerfile 的指令，用來設置在容器內部用於存儲應用程式檔案的目錄。
WORKDIR /usr/src/app

# 首先複製 package.json 到工作目錄
COPY package*.json ./

# 安裝套件
# RUN 指令用於在映像檔構建階段執行命令，並創建新的層。每個 RUN 指令都會在當前映像檔的頂部創建一個新的層並提交更改，進而形成新的映像檔。
RUN npm install

# 複製應用程式程式碼到工作目錄
COPY . .

# 建立 Swagger 文件
RUN npm run swagger

# 暴露應用程式所使用的端口
EXPOSE 3000 

# 啟動您的應用程式
# CMD 指令用於指定一個容器啟動時需要執行的命令。每個 Dockerfile 只能包含一個 CMD 指令。
# 總結來說，RUN 是在構建映像檔時執行的命令，而 CMD 是在容器啟動時執行的命令。
CMD ["npm", "start"]
```

其中因為專案中會使用到 Swagger，所以必須額外運行 `RUN npm run swagger` 來進行初始化。在上述範例中均有包含註解，但要額外解釋的是 `RUN` 與 `CMD` 的差異：
- `RUN` 是在構建映像檔時執行的命令，每個專案可以包含多個 `RUN` 指令。
- `CMD` 是在容器啟動時執行的命令，每個專案只能包含 **一個 `CMD` 指令**。

如果專案中有需要被忽略不在建構時加入的檔案，可以在專案根目錄下新增 `.dockerignore` 檔案，並在檔案中指定要忽略的檔案或目錄，以下是一個範例：

```bash
node_modules
```

準備完成以後，可以輸入以下指令來開始進行建構：

```bash
docker build -t {自訂名稱} .
```

範例如：`docker build -t my-nodejs-app .`，其中的 -t 是定義標籤用的，也就是後方的名稱，如果沒有這個名稱會被隨機分配 id，以後也不好管理。除此之外，後面需要加上 `.`，表示當前路徑。

![打包中的圖片](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fdocker-image-01.png?alt=media&token=24ae08d0-9e1e-496f-bdc3-c5771e4b1e5c)

在 Docker Desktop 也能看到這一個範例，可以直接從 Docker Desktop 執行它，或在終端機中輸入以下指令：

![Docker Desktop 中的畫面](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fdocker-image-02.png?alt=media&token=af45b3ae-e974-489f-9391-58dcb3b3f34b)

```bash
docker run -p 3000:3000 sample-node-express
```
上述指令所代表的意思是：
- -p 是內部 port 與外部 port 對應的指令，因為我們建立時是使用 3000 port，所以後者輸入 3000，後者可以映射另一個 port 來執行它（前者）
- 範例：docker run -p 5678:3000 sample-node-express
- 運行後，終端機會卡在容器運行的狀態，如果想直接在背景運行，可以使用 `-d` 取代掉 `-p`

如果要關閉容器，可以這麼做：
- 另外開一個終端機，輸入 `docker ps` ，列出所有運行中的容器
- docker stop {id} 來停止運行中的容器

## 補充知識：容器化概念說明

#### Docker Image（映像檔）：
Docker 映像檔是一個輕量級的、獨立的、可執行的軟體包，包含了執行應用程式所需要的一切，包括程式碼、運行環境、函式庫、環境變數和設定文件等等。由於映像檔包含了應用運行所需的全部相依套件，這使得您可以在任何 Docker 環境上一致地運行您的應用。Docker 映像檔可以透過 Dockerfile 來建立，也可以透過 Docker Hub 或其他 Docker Registry 下載。

#### Docker Container（容器）：

Docker 容器(container)是 Docker 映像檔(image)的一個執行實例。當透過 `docker run` 指令啟動一個映像檔時，該映像檔就會成為一個活動的容器。每一個容器都是從映像檔建立的，而且是完全獨立的，它有獨立的檔案系統、網路接口和進程空間等等。可以在一台主機上同時運行多個容器，它們之間彼此隔離，但又可以透過特定的方式進行互動。

#### Docker Daemon：
Docker Daemon 是一個持續運行的後臺進程，用於管理 Docker 容器。當作業系統開啟 Docker Desktop 或者運行 Docker 時。就能透過 `docker` 指令來建立、運行、或管理容器時，實際上是 Docker Daemon 在幕後處理這些任務。

例如，當執行 `docker run` 時，Docker Daemon 會找到或者下載適當的映像檔，創建新的容器，並且分配資源給它。Docker Daemon 也負責監控、日誌記錄、網路配置等等。

## Docker 常見指令

- `docker run <image>`：從映像檔建立並啟動一個新的容器。
- `docker ps`：列出正在運行的容器。
- `docker stop <container>`：停止一個容器。
- `docker ps -a` ：列出所有容器，包含停止的容器。
- `docker rm <container>`：移除一個容器。
- `docker images`：列出本地的所有映像檔。
- `docker rmi <image>`：移除一個映像檔。
- `docker pull <image>`：從 Docker Hub 或其他 Docker Registry 下載一個映像檔。
- `docker build -t <image> .`：從當前目錄的 Dockerfile 建立一個新的映像檔。
- `docker exec -it <container> bash`：進入一個正在運行的容器的 bash shell。
- `docker run -d -p 8080:3000 <image名稱:tag>` ：在背景運行