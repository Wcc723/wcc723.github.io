---
layout: post
title: 鐵人賽：網頁設計常用格線系統(下)
category: design
tagline:
tags: [design, ironman]
cssdemo:
jsdemo:
thumbnail:
photo:  https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F201810%2Fholy%2004.png?alt=media&token=544df737-1cf9-431b-8db8-1f76ec4dc686
published: true
---

上一篇介紹了格線系統的概念及計算方式，擁有了這些觀念後會如何運用在繪圖軟體上呢？無論你是使用 Sketch 或是 Adobe XD 都可以快速建立如前文所提到的格線，本篇不會著重在軟體的操作，而是網格如何運用在網頁的設計上。

* 實際運用
* 格線與響應式的搭配


## 實際運用
假設我們的網頁內容包含了以下元素：
* 頂部的大 Banner（頁首）
* 側邊選單
* 主要內容區域
* 頁腳

我們一樣先依據下圖的數據打開格線系統，如果有必要也可用更大或更小的數值調整。

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608QETNQb7KdU.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608QETNQb7KdU.png)

接下來可以依據這個概念將元素一個一個繪製到畫面上，所有的相對位置大約會如下圖呈現（選單佔 3 欄寬，內容佔 9 欄寬，中間保留一個 Gutter 寬）。透過格線系統的限制下，將不需要花太多精力去思考“水平空間” 及 “水平間距” 需要多大，只要貼的格線繪製都會顯得整齊。

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608LwuFynoBPO.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608LwuFynoBPO.png)
這個概念下，如果有額外的需求也能跟著調整，假設需要增加三個廣告欄位在畫面上，那麼我們可以將三個廣告做 4 欄寬的設計（12 / 3 = 4），也可以如下圖的呈現：

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608pTbJoHCoYl.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608pTbJoHCoYl.png)

雖然廣告欄位與選單、主要內容區塊的垂直線並沒有完全對應上，但因為具有固定的間隔，還是感受到它具有一定的規範。

#### 額外問題：如果廣告欄位與欄位數不一致怎麼辦？
雖然格線系統限制了思維模式，但如果同時熟悉網頁開發技巧其實可以做這樣的變化，廣告欄位維持 4 欄寬度，超過 100% 寬度後將會自動換行，並且以置中的方式來繼續做排列。

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608Kp0x4LtjSj.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608Kp0x4LtjSj.png)

## 格線系統與行動版網頁
現在行動版網頁盛行的情況下，網站支援手機瀏覽也是很正常的，而格線系統當然也可以應用在行動版網頁，觀念上大致上差異不大，僅需要調整一些數值即可。
先假設需要預覽的寬度為 320px，那麼我們可依據公式將數值調整為如下：
公式：((320 - 20) - 20 * 3)  / 4
Total Width: 320
Number of Column: 4 -> 行動版建議不要有太細的欄位數，建議以單欄為主
Gutter Width: 20 -> 不變
Gutter on outside: 10 -> 不變
Column Width:  60 -> 由於欄位數大幅的減少，因此欄寬度也維持在 60px

行動版網頁在瀏覽時會以單欄為主，因此會將原本的內容轉為 100% 寬度，次要的內容會轉為 50% 寬度，甚至是 25% 寬度。

轉換的結果如下圖，元件還是依然的緊貼於格線之上，主要內容佔有 100% 的寬度，保有最大的空間讓用戶可以輕鬆地閱讀。

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608l7VgbxHhPb.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608l7VgbxHhPb.png)

而在這樣的格線轉換，設計師不需要花費太多心力去計算寬度的轉換，雖然僅製作了 320 寬度的版型，工程師也能從「相同的邏輯延伸出不同尺寸下的變化」，且這樣的公式也能透過 CSS 來得以實踐。

## Bootstrap 框架
除了設計軟體隨著網頁發展有了新工具，網頁本身在開發時也有許多現成工具可運用，如 Bootstrap 就是網頁開發中最廣泛運用的 CSS 框架，提供了許多現成的組件直接運用，當然也有網格系統在其中。

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608X4YUOY248p.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608X4YUOY248p.png)

Bootstrap 的網格系統中包含了多種裝置的設計，對照它所提供的數值其實與剛剛所運用的差異不大，除了 Gutter 為 30px 並非 20px。所以本篇所介紹的內容，只要將格線間隔調整為 30px（實際上維持 20px，Bootstrap 本身也能配合執行），也可以使用 Bootstrap 來執行，並且同時包含桌面版及行動版。

## 實例
接下來你或許會思考「這個概念是否有被廣泛運用」？其實可以從網站中的原始碼尋找一些蛛絲馬跡（因此必須要有查看原始碼的能力），最簡單的方式可以在網頁上按下右鍵 -> 選擇「檢查」。

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608MQx8v3cwP4.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608MQx8v3cwP4.png)


接下來使用畫面上的小工具來選擇網頁中的區塊。

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608LdWZiZNiVP.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608LdWZiZNiVP.png)

範例網頁：https://events.google.com/io/
畫面中我選擇到了一個區塊，上面的程式碼 `grid__item--12-cols grid__item--6-cols--gt-sm`中的訊息為：
* grid__item--12-cols：預設為 12 欄寬
* grid__item--6-cols--gt-sm：在小裝置以上時，改使用 6 欄寬

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608QrrR0SqOZs.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608QrrR0SqOZs.png)

接下來我們可以用相同手法在各個網站尋找，這些概念目前已被廣泛的運用。不過由於網頁技術不斷的跟進，並不一定需要像過去定義欄位數才能完成這樣的排版，甚至可依據內容數量自動排列等寬的格線，製作出類似 Grid System 概念的排版。

![https://ithelp.ithome.com.tw/upload/images/20181019/20083608jTBr6t8GUA.png](https://ithelp.ithome.com.tw/upload/images/20181019/20083608jTBr6t8GUA.png)

以上介紹的網格系統是屬於通用的概念，在熟悉這些概念依然可以做許多延伸，設計並沒有絕對不變的，而是在了解通則及可行性後再來加以變化。