---
layout: post
title: 安裝 nvm 環境，Node.js 開發者必學（Windows、Mac 均適用）
category: development
tagline:
tags: [nodejs,javascript]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FNVM.jpg?alt=media&token=a38ca452-71d3-4c5c-bcbd-6dc77e9d50e8
published: true
---

使用 NVM 已經是 Node.js 開發者必備的工具，它最大的用途在於可以輕鬆切換不同版本的 Node.js，尤其在後端的專案中，團隊需要統一的開發環境時可以精確切換到同一個 Node.js 子版本上，避免發生版本不同所發生的問題。

NVM 為 Node Version Manager 的縮寫，顧名思義就是「Node 版本管理控制」，常用的功能包含：
- 切換 Node.js 的版本
- 使用特定 Node.js 作為預設啟用環境
- 安裝不同的套件至特定的版本上

除了以上的功能外，就我在使用的感受上甚至可以比官方下載安裝有便利的體驗（例如：Mac OS 系統下不需要使用 `sudo` 就能使用 `npm install`）。

接下來本篇文章將要來介紹如何安裝 NVM 工具，流程如下：
- 安裝 NVM
- Mac 環境的額外設定
- 常見 NVM 指令及示範

## 安裝 NVM 環境
接下來到 NVM 的 [GitHub 儲存庫下載](https://github.com/nvm-sh/nvm)，無論你是 Windows、MacOS、Unix 系統都有對應的安裝方式。

#### Windows
[NVM for Windows](https://github.com/coreybutler/nvm-windows) 有提供安裝工具，下載後照著安裝精靈依序完成即可運作，[下載連結](https://github.com/coreybutler/nvm-windows/releases)。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FCapture.PNG?alt=media&token=ac661f77-33c6-4c98-8d9a-43144e45e83d)
> 請選擇 `nvm-setup` 下載並安裝

下載後依循著安裝精靈即可完成。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F2.PNG?alt=media&token=1b528b03-2cb9-4953-8b3f-c1a833cb4346)

完成後，打開「命令提示字元」可以試著輸入 `nvm`，如果看到類似以下畫面就算是完成了。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F3.PNG?alt=media&token=e03b523e-9294-46e9-81e4-f9a942385e01)

#### MacOS

MacOS 則是使用指令進行安裝，打開「終端機」或自行安裝的「iTerm」等工具，輸入以下指令即可開始安裝，（更多版本[連結](https://github.com/nvm-sh/nvm#installing-and-updating)）。

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
```

安裝後預期會顯示以下片段及算安裝完成，而此時如果你有安裝其它指令工具，有可能會發生輸入 `nvm` 無法呼叫的狀況（例如：`zsh: command not found: nvm`）。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F2CE395C0-B566-4FBB-BA01-C69584560989.png?alt=media&token=3b53e246-2f91-4e89-bcc4-b51d59e94692)

接下來可以在你所使用的命令設定檔案加入以下片段程式碼，以下提供 bash、zsh 的說明，兩者依據環境選擇其一即可：
- ☝️ bash（預設）
- ☝️ zsh

#### ☝️ bash

預設的情況下，MacOS 中可能沒有任何一個指令設定檔案，此時可以使用 `touch ~/.bash_profile` 新增一個文字檔案在根目錄上，接下來回到資料根目錄可以找到 `.bash_profile`，沒看到的話代表未開啟隱藏檔案顯示，可以按下 `Command + Shift+ .` 顯示。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2022_1_11_%E4%B8%8A%E5%8D%889_57.png?alt=media&token=a2251dcd-7be8-4f82-99ee-66417c70861f)

接下來使用任何文字編輯器打開該檔案，並加入以下程式碼存檔即可。
```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

#### ☝️ zsh

可以打開  `.zshrc` 加入以下片段後重啟（注意：`.zshrc` 通常在使用者根目錄下並且為隱藏檔，找到後使用任何文字編輯器打開編輯）。
```sh
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```

設定完成以後，按下 `nvm` 就會跳出如下圖就算完成了。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FECA8043A-CD93-4074-B652-BD91F9B735A0.png?alt=media&token=6ff29801-7a12-4622-af6b-aa6a1fddec23)

## 🚀 常用 NVM 指令
直接輸入 `nvm` 及可以看到所有的指令列表，在此僅列出最常見的幾個指令（基本上常用的只有兩三個，剩下幾個只要認識即可） 

常見指令：
- nvm ls-remote：列出目前可用的遠端 Node.js 版本
- nvm install {{ version }}：安裝特定版本的 Node.js
- nvm ls：列出本定端所安裝的 Node.js 環境
- nvm alias default node：設定命令列預設開啟的 Node.js 版本
- nvm use：當前命令列套用特定版本的 Node.js

## 示範
第一次安裝，如果不清楚選擇哪一個版本，可到 [Node.js 官方網站](https://nodejs.org/en/) 查看，通常會用左右的方式排列，選擇其中左方的 LTS 推薦的版本。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F7B4581E8-D4BD-4521-B2FB-A2F8C5BB47C0.png?alt=media&token=43bee2a1-f6aa-4be2-8ce4-5e917887a57f)

接下來依序輸入以下指令 `nvm install {{ 版本號 }}`，就會開始安裝 Node.js 的環境。
```
nvm install 16
```

安裝過程圖，安裝完成以後可以輸入 `node` 查看是否有正確安裝。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F256D026B-3CCE-4052-9ECC-7004518D340F.png?alt=media&token=a46a0828-d922-4b9c-b356-22d402b859f3)

以我們公司來說是以 Node.js 14 版為主，因此我另外安裝了 14 的版本在我的作業環境上。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F237E2344-3A31-4046-890E-F15989A8792E.png?alt=media&token=4592d719-f0ce-4318-a829-cea08ba2c7db)

關掉命令列重啟以後，再次輸入 `node -v`  會使用其中一個做為預設版本，以我 Mac 來說預設為 16 版。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F55CE4478-D4CD-4E84-8E12-C7F504F47299.png?alt=media&token=2236eaa1-a7bb-404f-a0e9-7cc260988287)

畢竟在公司是比較長的時間，因此可以使用 `nvm alias default {{ 版本號 }}` 將特定版本作為預設值（下次開啟為 14 版）。
```
nvm alias default 14
```

命令列重啟後使用 `nvm list` 查看本機的狀態，可以看到當前版本為 14.18.2，並且預設版本也為此版號。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FD136D51A-D682-49F2-8357-B4AA932B5AF1.png?alt=media&token=a594247b-1626-45a6-9c72-5c71607fe620)

接下來想切換至特定版本，可以使用 `nvm use {{ 版本號 }}` 切換當前命令列所使用的 Node.js 版本。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F4D13FD16-FB7C-4635-8211-E70A6C597F1C.png?alt=media&token=5f3c4ff3-8f9f-413e-b33c-ddf4848270a1)

安裝完成，接下來回到你的專案試試看吧～