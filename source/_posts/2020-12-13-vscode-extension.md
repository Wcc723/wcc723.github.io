---
layout: post
title: 12 個前端愛用的 VSCode 擴充套件
category: development
tagline:
tags: [vscode]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fvscode.jpg?alt=media&token=4454d966-0526-44e6-b043-f488c2f97af4
published: true
---

工欲善其事，缺乏好工具必定壞脾氣。

身為一名工程師，將文字編輯器打造出具個人風格也是理所當然的。VSCode 是現在主流的文字編輯器，也因為使用者相當多，沒有特別打理的情況不乏會有撞衫的情況：

「你也是用 VSCode 喔」
「我也是耶...」（不知怎麼往下接）

為了避免尷尬情境，並且突顯自己的高尚，將 VSCode 安裝一堆套件，讓它每次展示就像一款從未現身於世面的工具；在社群中將不會有撞衫感，更能顯示自身的獨特品味！

錯誤：「你的 VSCode 怎麼有彩虹線條？」
正確：「天啊，你的程式碼怎麼沒有彩虹線條？」


## Better Comment
註解都灰灰的看不清楚嗎？

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FDC191490-1ADA-4B01-BC55-3FE44EC0366C.png?alt=media&token=c80f9c83-e324-46c2-82f9-84cbd459fa4e)

Better Comment 能夠將你的註解加入不同的色彩，並且可以依據不同的關鍵詞進行 Highlight，讓註解的說明更容易被辨識。

> 注意：實戰中過多的 TODO 代表不重要。

套件網址：https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments

私心推薦：⭐⭐⭐

## Bracket Pair Colorizer （已暫停維護）
每次都找不到大小括號的結尾在哪嗎？

Bracket Pair Colorizer 協助大中小括號（`{}`、`[]`、`()`）一一的獨立補上不同色彩，讓你在撰寫程式碼時可以專注在邏輯處理上，不必為了尋找結尾而耗去大量精力。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FBD077B13-DBDC-4AEB-992C-F77168C6E111.png?alt=media&token=f08ea66b-82bf-48b7-8d2e-34c43344d1a9)

> 如果安裝此套件還是找不到結尾，代表你的程式碼真的太亂惹。
套件網址：https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer

私心推薦：⭐⭐⭐⭐

> 2022 更新：此套件已暫停維護，VSCode 新版已內建此功能，打開設定檔加入以下即可使用，不需要另外裝擴充套件。

```
{
    "editor.bracketPairColorization.enabled": true,
    "editor.guides.bracketPairs":"active"
}
```


## indent-rainbow
找不到大小括號就算了，連 103 行與 127 行的縮排也都對不上！

在撰寫 HTML 時，良好的縮排是好的習慣，不過隨著結構越複雜的情況下，常常會對不上不同行數的縮排。indent-rainbow 為 VSCode 的縮排補上彩虹般的色彩，讓你可以輕鬆地用顏色進行配對。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FBEC22E87-4998-4AE4-9DB3-E19D7F15CDB3.png?alt=media&token=525c2e68-58b5-4617-abbd-de7b35d8df89)
> 使用縮排進行結尾的工具或語言更能體驗到它的美好

套件網址：https://marketplace.visualstudio.com/items?itemName=oderwat.indent-rainbow

私心推薦：⭐⭐⭐⭐

## Prettier
對於程式碼整齊有強迫症，每次都要耗去許多時間嗎？

Prettier 可透過熱鍵的方式，針對整個檔案進行重新排版，讓你不需要自己手動一一對齊，甚至有機會找到你失散已久的結尾喔 :D

{% raw %}
<video width="100%" controls autoplay loop>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FOct-14-2020%2014-03-44.mp4?alt=media&token=2c43fd30-39d4-4aa1-ae2d-7b99e6264664" type="video/mp4">
Your browser does not support the video tag.
</video>
{% endraw %}
> 不過有時候，你必須把它關掉自己手動對齊（眼神死）

套件網址：https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

私心推薦：⭐⭐⭐⭐

## Import Cost
身為一個專業的開發者，應該要能精確的掌握外部資源的大小。

Import Cost 可以計算 `@import` 或 `require` 的外部資源尺寸，包含原始尺寸及 Gzip 均有提供。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F7929ACC2-E904-4A28-B3F3-3E54404FB605.png?alt=media&token=9e81f119-d977-453e-875f-24cc5d3227b1)
> 別只注意到你的 JS 尺寸，結果頁面中隨便一張圖就比原始碼大

套件網址：https://marketplace.visualstudio.com/items?itemName=wix.vscode-import-cost

私心推薦：⭐⭐⭐

## VSCode 中文化

沒中文就是看不懂辣～

VSCode 為國際知名大廠微軟大大所開發，因此包含各種語系檔案也是理所當然的，而語系檔案並非直接附加在 VSCode 上，需要另外透過套件的形式另行安裝。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_12_13_%E4%B8%8A%E5%8D%889_01.png?alt=media&token=511da457-11d0-4a47-9501-91de55459bc5)
> 安裝教學：https://wcc723.github.io/development/2019/12/01/vscode-chinese/

套件網址：https://marketplace.visualstudio.com/items?itemName=MS-CEINTL.vscode-language-pack-zh-hant

私心推薦：⭐⭐⭐⭐

## CodeSpellChecker
看到過去拼錯的變數名稱很糗嗎？

`CodeSpellChecker` 針對程式碼的英文拼字進行偵測，避免把 `start` 拼成了 `strat`；老手一瞬間成了新手！`CodeSpellChecker` 還支援各種連接形式， `_`、`-`、大小駝峰通通都可做拼字檢查～。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F5D949E58-65F5-4986-9B03-8E8933CC6EB8.png?alt=media&token=3287e072-57d6-4b6f-87bd-7e959b75be0f)

> 看到別人拼錯，儘早提醒他是維持雙方關係的好方法

套件網址：https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker

私心推薦：⭐⭐⭐⭐⭐

## Live Server
確保本地開發與運行環境一致，使用 Web Server 是好方法。

如果是在具有後端的環境下，如 PHP、.NET 開發都是包含 Web Server，但有時僅是製作小工具，如果還要開啟後端環境就太麻煩了，`Live Server` 這個套件能夠讓你一鍵秒開 Web Server，不需再花費許多時間在環境上。

{% raw %}
<video width="100%" controls autoplay loop>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FOct-14-2020%2014-36-18.mp4?alt=media&token=8a61fc4c-8da9-411c-82e5-807e56b04cf9" type="video/mp4">
Your browser does not support the video tag.
</video>
{% endraw %}

> Live Server 開服務像免費一樣，常常會不知道開到第幾 `port` 惹
套件網址：https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer

私心推薦：⭐⭐⭐⭐⭐

## dash
什麼方式搜尋文件最潮呢？

透過 `dash` 只需要一鍵就能將程式碼中的片段說明文件調出，支援各種網路上可搜尋到的大部分文檔，讓你不需透過瀏覽器就能掌握各式語言，付費版本更是 0 等待。還在花時間查文檔嗎？`dash` 絕對讓你在查詢文件上潮到爆～

{% raw %}
<video width="100%" controls autoplay loop>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FOct-14-2020%2014-57-37.mp4?alt=media&token=2bbcc6c3-b257-4524-981b-c6b5d8f14908" type="video/mp4">
Your browser does not support the video tag.
</video>
{% endraw %}

> 說實在，都拼不出來了怎麼使用此功能.

套件網址：https://marketplace.visualstudio.com/items?itemName=deerawan.vscode-dash

私心推薦：⭐⭐⭐

## PDF Preview, Excel Viewer, SVG Viewer
我要住在 VSCode 啦～～

網路下載的、客戶寄來的、同事分享的，每一個檔案格式都不一樣，開啟一堆應用程式就煩躁嗎？你可以試試以下套件，讓你一個 VSCode 就能預覽所有文件，輕鬆開關不佔用你的應用程式列。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F2529A91C-C92F-4A49-89D3-9BC93CC9BD91.png?alt=media&token=38237d8e-df3b-4f02-9736-b2cd2620e92c)

> 看起來簡單，但真的很實用的系列

套件網址：
- Excel Viewer: https://marketplace.visualstudio.com/items?itemName=GrapeCity.gc-excelviewer
- PDF Viewer: https://marketplace.visualstudio.com/items?itemName=analytic-signal.preview-pdf
- SVG Viewer(已下架): https://marketplace.visualstudio.com/items?itemName=cssho.vscode-svgviewer


私心推薦：⭐⭐⭐⭐

#### 2022 更新推薦 SVG Preview

先前版本的 SVG Viewer 已經下架，在此推薦 SVG Preview，除了本身能強化對於 SVG 程式碼的撰寫以外，還能即時的預覽 SVG 的修改變化喔。

- SVG Preview: [https://marketplace.visualstudio.com/items?itemName=jock.svg](https://marketplace.visualstudio.com/items?itemName=jock.svg)



## favorites
前後端程式碼混在一起，老是找不到自己寫的檔案嗎？

`favorites` 能夠讓將專案中的特定檔案、資料夾存到我的最愛，往後需要存取時不需要一層一層的尋找。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FDA137DFE-4A99-4F71-A511-8F5CC8EF6430.png?alt=media&token=2bf81c9e-543f-45ad-9885-e11b0a11bcf7)

> 雖然 `cmd + p` 可以很快切到指定檔案，但是金魚腦不一定記得檔名啊～

套件網址：https://marketplace.visualstudio.com/items?itemName=howardzuo.vscode-favorites

私心推薦：⭐⭐⭐⭐

## Polacode
佛要金裝、人要衣裝，程式碼貼文前也需要個好框框。

`Polacode` 可以依據你的編輯器主題、Highlight 色彩、字體、縮放尺寸快速產生用於貼文的圖片，如果你是經常活躍於網路社群的開發者，那麼此工具則不可錯過！
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F909E3086-A7C5-49D0-885F-63D4510BC6AC.png?alt=media&token=c51b9de4-5860-474e-a084-c7a63b6d15b3)

> 在 Instagram 上，有露臉的照片比不露臉的照片更能獲得更多關注；有外框的程式碼也能受到更多人的閱讀（毫無證據的推論）。