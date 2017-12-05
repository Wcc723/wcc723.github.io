---
layout: post
title: 在 VSCode 啟用程式碼規範工具 (ESLint)
category: tool
tagline:
tags: [tool]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FC9C74D6F-F88E-4799-846B-AF4AB6347E39.png?alt=media&token=437a863a-3544-4ccd-a8d6-54fef6095d4e
published: true
---

許多同學會詢問到程式碼怎樣寫可以比較整齊且符合規範，在 VSCode 中非常容易整合這樣的工具，這邊提供兩個方法給大家參考，不過記得兩者不能混用，使用時請擇一即可。

- ESLint：比較正式的方法，有完整的文件規範，適合團隊使用
- JavaScript Standard Style 插件：比較簡單的方法。

## 方法一：ESLint

先開啟 / 安裝 VSCode 中的 ESLint 套件，記得預設的 VSCode 是有安裝此套件的，套件中也有提到如何運行。

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FC9C74D6F-F88E-4799-846B-AF4AB6347E39.png?alt=media&token=437a863a-3544-4ccd-a8d6-54fef6095d4e)

安裝 ESlint  的 npm 套件，目的是可以使用 eslint 的指令，方便建立規範使用的。
```
npm install -g eslint
```

開啟 Terminal 後，輸入 `eslint --init`

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F4A7B52F5-F115-42C9-835D-4AACEFEE9795.png?alt=media&token=fc7f2c3e-0051-426f-a57e-acea42063a2b )

接下來會出現一連串的問題，你想要怎麼建立 ESLint 的規範文件？
Q: How would you like to configure ESLint?
  - Answer questions about your style
  - Use a popular style guide
  - Inspect your JavaScript file(s)

建議選擇 使用主流的 Style Guide (第二個)，如果使用此選項，他會要求先建立 package.json，如果專案中沒有 package.json 可以輸入：
```
npm init
```

其中的問題可以 Enter 到底即可，接下來再回到上一步 `eslint --init` 繼續選擇建立規範。

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F862F1C82-5EAD-4538-9232-DB2FA3BD0710.png?alt=media&token=aea5f737-3299-4c74-9075-6c00ac8b8e33 )

選擇 Use a popular style guide 後，會出現三個主流的規範。
- Google
- Airbnb：如果選擇此選項，會多問一個是否使用 React
- Standard

接下來會選擇要哪一種格式 `YAML`、`js`、`json` 來儲存規範，這個規範是能夠讓其他專案使用的，只要團隊討論好即可。

安裝完後，在專案內會增加一個 `eslint.js` (或者其他，依據上述選擇的而定)，此時可以先關閉 VSCode 專案再重啟一次，接下來選擇 "輸出" 可以看到 ESLint server is running.，並且沒有其他錯誤訊息表示已成功運行 (如下圖)。

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2017_11_9_%E4%B8%8B%E5%8D%884_05.png?alt=media&token=efd91747-f9b8-47f6-a622-d8ebaff47085)

接下來會看到畫面上都了很多紅色提示，滑鼠移到紅底線上方會提示該如何修改。

目標就是減少畫面上的紅字 T_T，如果有未定義的變數也會跳紅字，目標當然是去除專案中的紅字來符合規範。

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F5ACA71A6-A31F-4ECF-8309-B96E307B99BE.png?alt=media&token=6f166e2c-5b69-41ce-ac0e-57ae1d3081f9 )

上圖選的是 Airbnb 的規範，相關可參考：[GitHub - airbnb/javascript: JavaScript Style Guide](https://github.com/airbnb/javascript)

其它注意事項：
- 如果無法順利進行，可嘗試重新安裝 `node_modules` 試試看。
- 如果有替換規範，也要重新安裝 `node_modules`。
- 重開 VSCode、重裝 `node_modules` 都是解決問題的好方法。

---
## 方法二：JavaScript Standard Style

這是使用 Standard JS 提供的 VSCode 套件，不要與 ESLint 混合使用，也可以直接在工作區關閉 ESLint 只執行 Standard JS

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F2E7D2A5E-D945-4384-880B-ACFCF28F8E3A.png?alt=media&token=72a6f452-0194-42dd-a891-5bc4ab2131f0 )

接下來安裝 JavaScript Standard Style 的 VSCode 套件，安裝完後直接重起就能使用了，沒有額外的設定檔。

套件路徑：https://marketplace.visualstudio.com/items?itemName=chenxsan.vscode-standardjs

啟用後再右下方一樣會出現 JavaScript Standard Style 的字樣，Standard 相對於其他規範來說寬鬆很多，最大的特點是沒有分號。

寫起來長得像這樣 (未定義或定義但未使用的仍然會跳錯)，另外還有繁體中文的文件 ([standard/README-zhtw.md at master · standard/standard · GitHub](https://github.com/standard/standard/blob/master/docs/README-zhtw.md))。

![]( https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F31102DE8-BBF0-48D5-AA08-8231D70B6899.png?alt=media&token=ca226394-348f-4e14-ad77-8fec44d07b38 )

我自己是比較喜歡 Standard，但缺點就是沒有分號，如果用在教學中同學可能會誤以為 JavaScript 不用分號。Airbnb 比較不習慣的則是物件裡的逗號，一般物件的最後一個是沒有逗號，但在 Airbnb 則是逗號到底。
