---
layout: post
title: 鐵人賽：網頁設計 - 圖片壓縮方法
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2Fholy%2015.png?alt=media&token=e343d0d7-27ba-493f-941d-f1d5a6ddf21a
published: true
---

了解基本的格式後，接下來設計師還需要「正確的」輸出圖片並壓縮，網頁上輸出圖片雖然沒有印刷中那麼複雜，但依然有許多眉角需要注意，像是用什麼工具壓縮就很常被詢問到，本篇介紹我再壓縮上常用的一些技巧。

## 工具輸出
繪圖軟體均可輸出圖片（廢話），在此還是比較推薦使用 Sketch 或 Adobe XD，這兩套的圖片輸出功能完整，且可以一鍵大量輸出所有設定的圖片及尺寸。

Sketch 可以直接設定好所有圖片（設定格式、尺寸比例、檔名、尺寸前綴詞...），並且一鍵輸出到特定資料夾。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FD708319C-A480-45CA-B048-66D9621F6CB6.png?alt=media&token=45fbe214-0205-49b8-8d15-615b7ec44ed8)

Adobe XD 再輸出規範時，也可以提供所有圖片的下載連結，讓開發者選用後一次打包下載（Sketch 也有相同功能）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F887CC9A8-82D6-42EE-8EF4-D6C2BE20ADF6.png?alt=media&token=4d32e4cf-a42d-4055-9633-bb4664422020)
設計稿參考： https://lihi.cc/LAfsC （請切換到 Download 頁面）


如果是使用 Photoshop、Illustrator 等平面繪圖軟體，當圖片數量多，且規格複雜時將會花去許多時間，且工程師拿到一堆圖片時，也難以對應檔案與位置上的關係。而 UI 繪圖軟體相對於傳統的平面繪圖軟體來說，它讓工程師更能了解每張圖片所在的位置、運用情境、多尺寸的選擇，設計師只需要做好合適的規範設定即可。

## 圖片壓縮
當然，圖片輸出後檔案還能做最佳化壓縮，目前主流的繪圖軟體都無法有效的壓縮圖片，透過合適的工具壓縮可以在不破壞視覺品質的情況下，大幅降低圖片的尺寸（檔案尺寸可降低 30% ~ 50% 不等）。

### Tinypng
Tinypng: https://tinypng.com/

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F6B0A7651-A844-49A2-9611-A74C99EEAFA5.png?alt=media&token=bd8a815d-855c-4358-bb54-a5ce5cc107c9)

Tinypng 是直接上傳檔案後，該服務會自動在後端壓縮，並且打包壓縮後讓用戶下載。使用方法簡單，無需任何設定，缺點是必須 “上傳圖片” 才能壓縮，如果產品是需要隱密性，不得提前公開的將不適合使用。

不過他們也有提供 Photoshop 版本的擴充套件（我沒有使用過），可以花些費用購買工具將可以在本地端壓縮。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F0FB52C24-8B07-40ED-893B-DE756785744D.png?alt=media&token=78a851ff-2910-42b7-a486-df2d1d0ec195)

### ImageOptim
ImageOptim: https://imageoptim.com/mac

這是目前使用的壓縮工具，優點是離線使用、大量壓縮、免費、簡單操作（也可調整壓縮比），但目前只有 Mac 版本，Windows 僅能使用他另外提供的 Web Service（與 Tinypng 相同）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F55D3F409-A47E-47FD-BCF9-50C5C6464741.png?alt=media&token=da433f0f-db2f-427a-8366-3f37de35bcff)

且這個工具的壓縮能力相當不錯，如下圖我壓縮了一張 png 原始檔案尺寸為 2.4mb，壓縮後為 1.4mb，降低了 42.1% 約 1mb 左右。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FD4FEDA63-3CAF-47E6-8AFD-F0E0AFE77C85.png?alt=media&token=77cc1601-9b2a-4ad2-9635-018a30c4dd0a)
而這個工具是本地端運行的，因此壓縮時會大量用去系統資源，如果電腦的效能沒有很好，建議不要在「工作時間」壓縮大量圖片，這可能會導致你暫時無法作業。


### gulp 自動化壓縮

https://github.com/hexschool/gulp-demo

gulp 到目前為止還是很方便的工具，可以用來處理許多小雜事，這類型的工具只要把圖片放入，部署前輸入一鍵就會全部壓縮。壓縮的效果如下（原圖約為 742kb，壓縮後為 486kb）：

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F%E8%9E%A2%E5%B9%95%E5%BF%AB%E7%85%A7%202018-10-29%20%E4%B8%8A%E5%8D%8811.06.14.png?alt=media&token=f19c3fbb-e61b-41fb-8ff5-96d536f224df)

這個工具看似很方便，很適合工程師使用，但其實壓縮的品質不是很穩定，有些圖片加入後甚至不會做任何壓縮，相比較而言我還是傾向使用前面所介紹的那兩款。

## 結語

程式碼需要壓縮，而圖片當然也需要被壓縮，且圖片壓縮效益大幅超過程式碼壓縮，進而加速網頁瀏覽的速度。而設計師交付給與工程師圖片時，也可以討論這段流程因由誰負責（或由伺服器自動壓縮），並將此流程加入到開發與設計之中。