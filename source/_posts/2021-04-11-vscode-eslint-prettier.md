---
layout: post
title: VSCode Prettier 整合 ESLint 自動排版
category: development
tagline:
tags: [vue,js,javascript]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fvscode_eslint_prettier.jpg?alt=media&token=fb98775e-0bfe-4d52-8dfe-96caf43641f5
published: true
---

VSCode 中有一個非常不錯的格式化工具，可以透過一個按鍵將雜亂的程式碼排列的整整齊齊，無論是 HTML、CSS、JavaScript 均可以套用。而此工具稱為 “Prettier”，在 VSCode 中也是屬於預設工具，除了預設選項外也能有許多的客製化調整。

而我們在開發的過程中，為了確保團隊的開發風格一致，JS 部分通常也會導入 ESLint 來統一撰寫風格。

但是，ESlint 與 Prettier 先前是兩者不相容的，雖然 Prettier 可以將程式碼一鍵格式化，但預設的格式是與 ESLint 並不一致，所以許多專案甚至乾脆的關閉 Prettier 這樣好用的工具。

不過這個問題在近期獲得了解決，現在可以透過套件讓 Prettier 直接載入 ESLint 設定檔，讓整份文件不僅符合團隊風格，更可透過一個按鍵快速格式化！

## 環境準備
要整合 Prettier 與 ESLint 需要以下幾個步驟：
- 專案加入 ESLint
- VSCode 安裝 “[Prettier ESLint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint)”
- 專案中加入「prettier」及「prettier-eslint」

#### 步驟一：專案須先導入 ESLint
本篇介紹 Prettier 與 ESLint 的整合，因此 ESLint 的設定檔案是必要的，各大框架都有導入 ESLint 的流程，或是可參考「[透過 ESLint 學習 JavaScript ES6](https://wcc723.github.io/javascript/2018/01/01/javascript-eslint/)」來安裝 ESLint 至你的開發環境中。

#### 步驟二：VSCode 安裝 Prettier ESLint 延伸模組
此套件可以讓 VSCode 中的 Prettier 套件使用 ESLint 的設定檔案，直接在 VSCode 模組搜尋安裝即可。

延伸模組說明：https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F327BFE1A-09D7-429F-8A4F-D35ADD6D2A49.png?alt=media&token=3e631085-a196-4ad2-9579-8559d8daca69)

#### 步驟三：專案中加入「prettier」及「prettier-eslint」
至上「步驟二」以後，可以試著跳過此流程直接跳下一段落試試看，許多框架會直接引入此套件，因此在框架所產生的環境已可直接使用 ESLint 結合 Prettier。

但如果還是無法運作，可以在專案中安裝這兩個套件。官方文檔有說明這是必要的，而你可以選擇安裝在全域或是在此專案中。
```shell
npm i prettier prettier-eslint --save-dev
```

## 使用 Prettier 一鍵符合 ESLint 格式吧

接下來，打開雜亂無章的 Code，此範例是使用 ESLint Airbnb 的規範，調整以前以此段程式碼中在 Airbnb 的規範會跳出 4 ~ 5 個提示。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FB8F65D89-B62E-4B66-8261-FC9C10407FA8.png?alt=media&token=3812191b-37e7-4a62-8da7-fed6c6a1d982)

按下 `ctrl + shift + p`，如果是 Mac 使用者則是 `cmd + shift + p`，可以看到以下的介面後輸入「format」，可選擇**文件格式化方式（format Document...）**。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F04682B9B-EFE8-4E2F-B7F3-CF0FCA4FDA98.png?alt=media&token=26779f93-af79-4d36-8d46-625d8bc87066)

選擇 Prettier ESLint，或者你也可以選則「設定預設格式」，將預設指向 Prettier ESLint。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FB33C98A6-E4D0-4284-AF78-3BC1DA6E7489.png?alt=media&token=b97c072d-1dc7-46e6-8ffd-696758209ab3)

最後，按下 `alt + shfit + f`，Mac 使用者則是 `option + shift + f`，就能看到剛剛那份程式碼轉為符合 ESLint 的格式囉～
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F549408D9-123C-41D3-AD62-8132F5297D75.png?alt=media&token=72841154-56c7-42ee-a988-563588e9e64d)

以這段程式碼說就調整了以下格式：
- 移除首行多餘的程式碼
- 將 var 改為使用 const
- 宣告物件的後方補上了分號
- 雙引號改為了單引號
- 程式碼最後補上了一行空白行

而這僅在短短一個熱鍵中就完成了，並解決過去要花上許多時間調整 ESLint 錯誤的問題。

文章發佈於：[卡斯伯 Blog](https://wcc723.github.io/development/2021/04/11/vscode-eslint-prettier/)