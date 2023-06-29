---
layout: post
title: Mac OSX 截圖全說明（單一視窗、全螢幕、重設截圖路徑、Touch Bar）
category: development
tagline:
tags: [mac, osx]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fmac_os_%E6%88%AA%E5%9C%96_cover.png?alt=media&token=c41c6f3f-8714-4ecc-ac7c-d77d93fdb547
published: true
---

Mac OSX 的內建截圖熱鍵相當好用，雖然看起來熱鍵組合很多，但每一個鍵都有它的組合意義，在此先附上完整的熱鍵組合表。

![Mac OSX 截圖熱鍵全表](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fmac_os_%E6%88%AA%E5%9C%96.png?alt=media&token=59971169-9a1f-44d7-975b-d043953e97bd)
> Mac OSX 截圖熱鍵全表，使用方法可參考下方文章說明


## 組合規則
首先，要使用截圖一率會使用 `command` + `shift` 加上特定數字鍵作為開始，而這些數字鍵分別代表：

- `command` + `shift` + `3`：立即全螢幕截圖
- `command` + `shift` + `4`：局部或視窗截圖，點擊後會出現區域截圖的游標，使用滑鼠圈選後會截圖
- `command` + `shift` + `5`：開啟截圖應用程式（可調整設定或使用所有的截圖功能）
- `command` + `shift` + `6`：立即 Touch Bar 截圖

![基本全螢幕截圖](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E6%88%AA%E5%9C%96%202021-09-24%20%E4%B8%8A%E5%8D%889.11.44%EF%BC%883%EF%BC%89.png?alt=media&token=b825520b-e8b3-4439-a408-d949d695c65c)
> 基本全螢幕截圖

![Mac OSX 預設的截圖會儲存於桌面上](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FBAEB2FCE-0448-40D3-B292-7430A2A35EFB.png?alt=media&token=eb1a464c-0bc7-444a-900b-d1826c1da2a7)
> 預設的截圖會儲存於桌面上

#### 儲存於剪貼簿 `control`
而上述的基本截圖後會立即儲存新檔案，而新增的檔案會儲存於桌面上（後續文章會說明如何調整儲存位置）。

如果不要新增檔案可以同時按下 `control` 鍵，截圖的內容將不會產生新檔案，而是暫存於剪貼簿內，可以使用 `command` + `v` 貼在任何文件上。

- `command` + `shift` + `control` + `3`：立即全螢幕截圖，並暫存於剪貼簿
- `command` + `shift` + `control` + `4`：局部或視窗截圖，點擊後會出現區域截圖的游標，使用滑鼠圈選後會截圖，並暫存於剪貼簿
- `command` + `shift` + `control` + `6`：立即 Touch Bar 截圖，並暫存於剪貼簿

#### 局部或視窗進階截圖方法

當按下  `command` + `shift` + `4` 時會出現十字游標，此時可以圈選任何區域進行截圖。

當需要使用視窗方式截圖時，則可以再按下 `space` 空白鍵，游標會轉為 ![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fmacos-mojave-screenshot-window-inline-icon.png?alt=media&token=d148c5ea-af33-4aad-b0a2-7deeac8fbbd6) 的符號，在任何的視窗按下滑鼠左鍵即可進行截圖，此截圖亦可搭配前述介紹的 `control` 決定儲存新檔或是暫存於剪貼簿內。

- `command` + `shift` + `4` 後按下 `space`：進行視窗截圖
- `command` + `shift` + `control` + `4` 後按下 `space`：進行視窗截圖，並暫存於剪貼簿

![Mac OSX 視窗截圖，會包含大範圍的陰影](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FEB055D62-7AA4-4B68-B8E1-C2CF96E5311A.png?alt=media&token=99890ceb-c9b9-40c6-8fee-978f5be00e1a)
> 視窗截圖，會包含大範圍的陰影

預設的視窗截圖會包含很深的陰影樣式，如果僅想要純粹的視窗截圖，可以在截圖的同時按下 `option`，就可以去除多餘的陰影樣式。

- `command` + `shift` + `4` 後按下 `space`，搭配 `option` 按下左鍵：進行視窗截圖並去除陰影
- `command` + `shift` + `control` + `4` 後按下 `space`，搭配 `option` 按下左鍵：進行視窗截圖並去除陰影，同時暫存於剪貼簿

![Mac OSX 如果要去除截圖的陰影，可以在點擊時加上 `option` 鍵](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F0934F8A9-6DD2-42AA-B900-359CE4F49C69.png?alt=media&token=3dc23e60-4c7e-4ede-a524-df701a3b76b6)
> 如果要去除截圖的陰影，可以在點擊時加上 `option` 鍵

#### Touch Bar 截圖

Touch Bar 截圖方式與全螢幕相同，按下 `command` + `shift` + `6` 就會立即截圖。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FTouch%20Bar%20%E5%BF%AB%E7%85%A7%202017-09-01%20%E4%B8%8A%E5%8D%889.49.56.png?alt=media&token=d46e0ab2-d83e-40f3-9bf2-7e6a5ca2e117)

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%A7%B8%E6%8E%A7%E5%88%97%E5%BF%AB%E7%85%A7%202021-09-28%20%E4%B8%8B%E5%8D%883.32.34.png?alt=media&token=622da787-394b-4953-a792-999764526ede)
> 當把 Touch Bar 改為 F1... 等按鍵，你會發現另一個新天地（終於不用擔心誤觸了!?

## 調整截圖路徑
立即儲存的方式很好用，但如果都儲存在桌面上，很容易造成桌面的凌亂，而我會習慣在桌面另外開一個資料夾專門存放截圖的圖檔，流程如下：

1. 建立預期儲存截圖的資料夾
2. 按下 `command` + `shift` + `5` 開啟截圖 APP
3. 選擇 `選項` > `其它位置`，接下來對應到剛剛建立的資料夾即可

![Mac OSX 截圖 APP 包含所有的截圖功能，也可自訂圖片的儲存位置](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F3B97ACA6-3E90-4E4B-B790-EF9AFEC80722.png?alt=media&token=55672861-6da2-4364-8d7b-01e6b9b08a99)
> 截圖 APP 包含所有的截圖功能，也可自訂圖片的儲存位置


![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F144F4BEE-55F6-474C-B436-C999FA916E21.png?alt=media&token=f450fc35-ad7b-4b88-8c7e-648cc8077a6d)
> 我會在桌面上建立一個資料夾存放所有截圖的圖檔

## 調整截圖熱鍵
如果你想要調整截圖的熱鍵，也可以到 「系統偏好設定 > 鍵盤 > 快捷鍵 > 截圖」內找到相關的設定喔

![Mac OSX 重新設定截圖熱鍵 「系統偏好設定 > 鍵盤 > 快捷鍵 > 截圖」](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FAC4665CF-DDD9-4F6A-9F59-8D4231A5435B.png?alt=media&token=07564515-10c0-47ab-b643-e1bfbe2a7114)
> 重新設定截圖熱鍵