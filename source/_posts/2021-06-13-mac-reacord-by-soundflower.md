---
layout: post
title: Mac 擷取系統音效 - 直播、錄影均適用
category: life
tagline:
tags: [mac]
cssdemo: 
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2Fmac_sound.jpg?alt=media&token=67c79d98-633e-4f38-a09d-895d839ef5f9
published: true
---


直播遊戲或是錄影希望搭配系統的聲音，如果沒有另外進行設定，就只能透過麥克風接收系統所播放的聲音，這樣的品質對於聽眾來說真的不太好，且如果太大聲也會影響直播者 / 錄影者的思緒。

因此，本篇介紹如何使用「軟體」的方式擷取系統的聲音，如果直播或錄影工具可接收多個收音裝置，將可使用系統的聲音進行錄影 / 直播，本篇所介紹的直播工具為 OBS，也是許多值播主所使用的軟體。

> 請注意，本篇不支援「M1」的作業系統。

## 第一步：安裝 Soundflower
先安裝 [SoundFlower](https://github.com/mattingalls/Soundflower/releases) 音效擷取工具，雖然它是 2014 的軟體，但到目前的 Intel Mac 主機均能正常運作。

請注意，它目前並不支援「M1」的作業系統。

打開下載的壓縮檔以後，可以看到 `Soundflower.pkg`，如果直接點擊兩下會無法安裝。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FCE129C6F-51DC-41FE-B0D8-243DF0AB7DB3.png?alt=media&token=49c8cee3-c5e5-4be0-b768-eb5751a2549c)

請使用右鍵 > 選擇打開的方式開啟來開啟這份安裝檔。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F2564702B-BCA0-4093-8D84-8433BD361B3B.png?alt=media&token=c417ff60-476d-4771-99b4-344f6d201e81)

接下來選擇左方的打開，就可以開始進入安裝的流程。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F9318C0AA-6D02-45F0-91C6-70D105C9C7B3.png?alt=media&token=8526644e-5ac4-43d7-9229-19b0db9b9172)


安裝完 SoundFlower 以後，可以看到聲音的項目下增加了 `SoundFlower(2ch)`、`SoundFlower(64ch)`，到這個步驟就算是已經完成了（如果沒有，可以重開機試試看）。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F9038CB03-975B-4843-8DB1-1970434E02C8.png?alt=media&token=60eb2a78-49f3-4816-8e1c-ec99b9a5b73c)


## 第二步：OBS 設定

回到 OBS，進入「設定 > 音效」內可以選擇 `SoundFlower(64)`（如下圖的選擇方式），他會擷取系統的音效，而 `麥克風 / 輔助音效`可以選擇另一個麥克風，讓擷取聲音的同時也可以播放麥克風的聲音。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F8793EE69-6B16-4B87-9B37-D52294FF27DB.png?alt=media&token=cd1c4dcc-572b-45d3-835f-afef1d9cc06e)

可以看到，音效混音器增加了一個「擷取音效輸出」，如果要調整直播時的錄製聲音大小，一樣可以透過鍵盤上的聲音調整（如果沒有正確切換，也可以將目前的播放器改為 `SoundFlower(64)`）。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F4438447A-1C26-40CA-8EC4-7E02CE281970.png?alt=media&token=e3e33c9a-387e-435e-8f82-6ac350c061e0)

這麼做會只能透過 OBS 直播時，觀眾可聽到聲音但直播主聽不到，如果是播放音樂的話，直播 / 錄影也難以了解目前所播放的進度。

## 擷取 + 播放一起共存
打開「音訊 MIDI 設定」，可以在畫面左下 + 號找到「製作多重輸出裝置」。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2021_6_13_%E4%B8%8A%E5%8D%8811_10.png?alt=media&token=2150f29e-4a43-4925-9742-68f436068c41)

下拉選單可以找到「製作多重輸出裝置」。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F85C9E2B3-3D8A-483F-90CE-7EFC46B405A1.png?alt=media&token=59d5d8e3-aa0f-497d-b98a-6967223af129)

選擇後加入「Macbook 揚聲器」及「SoundFlower(64ch)」，然後主裝置選擇 SoundFlower(64ch)，設定方式如下圖。揚聲器可以選擇外接的耳機，但 AirPods 設定上經常失敗；另外每次調整設定都可能導致擷取出現錯誤，會建議直接刪除重做一個新的「多重輸出裝置」。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F0CA07636-2347-47D9-BC4E-1B27A9B0C2B9.png?alt=media&token=57e67a9e-6f56-4c4f-bfe8-1e4a9acc08e5)

這段設定完，回到系統偏好設定 -> 聲音 -> 輸出 -> 選擇「多重輸出裝置」
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2021_6_13_%E4%B8%8A%E5%8D%8811_13.png?alt=media&token=25e12f80-c40d-4594-9782-1857430b9b60)

如下圖，選擇「多重輸出裝置」。接下來回到 OBS 應該就能正確運作了（OBS 設定不需要另外調整）。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FBCC7D952-17D0-4207-BFDF-3951C90075B3.png?alt=media&token=93d58267-33cd-4b7c-bfdc-c764671575d1)

接下來會有另一個問題：「多重輸出裝置」難以調整每個輸出裝置的聲音大小。因此，可以回到前面的「音訊 MIDI 設定」，進入輸出的裝置調整單獨的音量（SoundFlower 也可獨立設定）。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FF5B2D4E6-51AE-45E2-86D0-04D664700454.png?alt=media&token=5796cf10-805f-44c6-a263-667bb149c5f9)

接下來預計就可以設定出以麥克風音效為主，擷取音效為輔的設定。以 OBS 聲音的介面來說，目前測試麥克風可以到黃色的區塊（到紅色可能會破音或太大聲），而擷取的音效輸出上可以依據需求調整，如果要作為背景的音效建議可以低於 -35 左右的刻度。
![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FA453DFC5-8ADF-4498-841B-0E0C8941F568.png?alt=media&token=08990ff2-b552-415e-9e5d-4e1dfe511a53)

以上，祝大家錄影、直播順利～
