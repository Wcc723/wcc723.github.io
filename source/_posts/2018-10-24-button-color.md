---
layout: post
title: 鐵人賽：色彩運用(3) - 按鈕的配色
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2Fholy%2010.png?alt=media&token=dc11531a-8085-4998-bf0d-771c9cda6c72
published: true
---

上一篇透過連結的狀態了解運用，本篇則是探討按鈕再運用上的色彩變化，包含了一般、行動呼籲、外框線、警告意味等常見的類型，當然這些類型介紹上別不會包含上一篇的 “狀態”，實作中依然要記得補上喔。

## 一般狀態

一般狀態通常是最沒有特色的，但使用上也是最為普遍的，這類型的按鈕通常不會帶有太多色彩，並不會特別引人注目，目的也是讓用戶了解的要執行、連結等等。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F77B97AC2-EBEE-4CEE-842F-9134574D1E0B.png?alt=media&token=3af51988-d4a1-4f8f-98c5-327ab05b45e3)

設計：越普通越好

### Call to Action

宣傳網頁、登入頁等等都會有一個按鈕引導用戶到達特定目標，行為上我們稱為「Call to Action」，因此這類型的按鈕都會特別顯眼，配色上則會使用「主色」或「次要色」，並且以「填滿」的方式配置。

也因為這類型按鈕非常重要，所以相似的按鈕一個畫面中不會出現太多次，如以下範例所示，大多服務都是使用在「註冊」上（Airbnb 則是用在搜尋，所以對他們來說搜尋比註冊更為重要），必須謹慎配置這類型的按鈕，請把它用在最重要的地方。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F577C13C5-C430-4850-AAD4-1EEB4509FAAE.png?alt=media&token=d0becd9e-f7e3-4547-a3b9-5ed6b20dcceb)
https://github.com/

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F44B5C9CE-7EF7-4496-BE38-EA531F1A7F78.png?alt=media&token=f396d890-4a16-43ff-b275-d49949a67627)
https://azure.microsoft.com/zh-tw/

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FE958A23D-CA39-4C50-AFC6-8743FB852E1A.png?alt=media&token=814faa75-ed3a-4ab7-a32c-53fd38d56560)
https://www.airbnb.com.tw/

設計：主色或次要色，並且填滿它

## Outline

幾年前開始出現的一種按鈕風格，當時有一種暱稱為 Ghost button，相對於填滿的按鈕來說它的顯眼程度沒有那麼高，但依然能夠符合網頁的主題配置，所以重要性也是介於普通按鈕及 Call to Action 之間，很適合用在宣傳網頁、登入頁的次重要性按鈕。

如下 Uber 的網頁來說，最重要的是引導人們註冊成司機，其次則是引導乘客註冊。因此這個網頁的動機是尋找引導駕駛比引導乘客更為重要。

https://www.uber.com/zh-TW/tw/

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F59827BC1-2DFB-4EF2-9854-3A99E4C9C93F.png?alt=media&token=fd746faf-4406-4cc4-bf86-72be62fd2424)

在 Palantir 的登入頁來說，並不需要引導用戶註冊或購買，重要的是傳遞訊息、故事，因此沒有使用 Call to action 的按鈕，取而代之的是 outline 按鈕來引導用戶觀看他們的故事。

https://www.palantir.com/

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2F79796F76-9D51-4492-BD72-33DD15CCC232.png?alt=media&token=6d84b5af-2c18-4782-b59c-2f1481be8251)


## 警告
警告意味的按鈕是傳達此按鈕的危險性，所以與 Call to action 是相反的概念，警告是避免用戶點擊，Call to action 則是期望用戶點擊（許多電商都是使用橘色、紅色填滿作為 Call to Action。）。配色上大多會使用紅色，並且以「白底紅字」的方式避免過於顯眼，所以無論主色或是次要色選擇了紅色，都會避免使用紅底白字的方式在呈現，因為這樣的配置會吸引用戶點擊。

以 Github 的 Danger Zone 來說就是使用細紅框搭配紅字按鈕呈現，除了提醒用戶這個區域的安全性外，也避免吸引用戶目光。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FE25C4862-2EFD-4659-BA19-5FAADFA7C697.png?alt=media&token=ad2248d3-6f7b-4dc7-a618-01a265d946e7)

避免使用紅色的按鈕，他會吸引用戶目光點擊（警告都不警告了）。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2FEC9D54D1-CC78-4DDC-B4DD-146317336E74.png?alt=media&token=74509e76-7f08-41cd-8f68-eb14aec84482)

---
以上是常見的情境，大家可以依據這些概念看看國內外網站，是不是有很多符合這樣的情境，這些概念同時也可以運用在自己開發上並思考以下事情：

* 網站最重要的行為是什麼？
* 當下按鈕的重要性？
* 當下按鈕所傳達的情緒（警告、興奮、買買買）？

藉此來調整網頁的行動配色喔 :D。