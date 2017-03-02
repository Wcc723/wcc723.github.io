---
layout: post
title: 鐵人賽 18 - Bootstrap 元件分類概觀 (content, container)
category: css
tagline:
tags: [css, Bootstrap]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/18_bootstrap_header.jpg
published: true
---

接下來我們依循著 OOCSS 與 Bootstrap 的設計模式繼續擴資、修改元件，不過在繼續下一個階段以前，我們先來了解一下 Bootstrap 的設計模式。

<!-- more -->

## Bootstrap 檔案結構

還記得我們一開始所說到的 OOCSS 中結構與樣式、容器與內容這兩者的概念嗎？無論是哪一個版本，Bootstrap 所有樣式模組都是以元件為基礎作為設計，基於這個概念我們可以很快得了解 Bootstrap 3 的結構。

Bootstrap Sass 版本的檔案結構：https://github.com/twbs/bootstrap-sass/tree/master/assets/stylesheets/bootstrap

```
/bootstrap
|- /mixins/
|- _variables.scss
|- _buttons.scss
|- ....scss
|- _components.scss
|- _utilities.scss
```

主要資料夾如上，這邊略為介紹：

* /mixins/ 資料夾：樣式運算的函式庫，這部分可以先忽略他
* `_variables.scss`：變數檔案，上一篇有介紹過，大部分的 Bootstrap 樣式變數都從這檔案設定。
* `_button.scss` ~ `_components.scss`：剩下這層的檔案幾乎都是元件。
* `_utilities.scss`：雖然說是元件，但又沒有完整的形體，像是 .clearfix 清除浮動就被歸在此類。

而這篇要介紹的就是廣大的 Components 類別，從官方的文件及 OOCSS 混合來看，又可以將它作為兩大類的區分，一則是易於修改樣式的 `元件` (OOCSS 的內容)，另一則是包覆個許多子元件專用的 `容器`；這段很熟悉吧，我們在一開始所介紹到的 OOCSS 與此部分又開始產生連結。

![](/images/2016_ironman/18_bootstrap_01.png)

### 容器

作為外層的容器，主要就是要包覆著在其內的內容及元件，在網頁上的功能偏向於排版用途，通常不會有滑鼠事件互動，所以在設計上會遵循著以下概念：

* 不設定高度且具有彈性
* 寬度以百分比為主
* 可以有 theme (主題)
* 狀態不是必須的

![](/images/2016_ironman/18_bootstrap_02.png)

### 元件 (內容)

![](/images/2016_ironman/18_bootstrap_03.png)

元件的特色在於包含許多樣式、狀態，是使用者在觀看網頁時主要互動的物件；以按鈕來說，使用者會滑過按鈕、按下按鈕，並且按鈕可能會回饋訊息給用戶了解，所以除了不同樣式上，元件所傳達得狀態訊息狀態也相同重要：

* 有固定的外型
* 有許多的樣式
* 設計需要包含回饋狀態

| 容器型          | 元件型          |
| :------------- | :------------- |
| grid-system    | form           |
| button-group   | buttons        |
| panel          | breadcrumbs    |

這設計在 Bootstrap 4 更為明顯，但本篇還是以 Bootstrap 作為介紹。

## 結語

樣式雖然不是一定為哪種容器或是元件，但我們在設計一項新的物件時，一定要去思考他是傾向于哪種類型的物件，假設我們需要新增一個容器型物件，我們就要測試他有內容物及無內容物時的差異，甚至在大量的內容時是否會造成破版的問題。反之，設計元件型的樣式時則要思考在不同情境下使用的狀態，基本上就要補上 `啟用中`、`無法使用` 的狀態，這樣的設計會影響往後樣式在套用時的靈活性，與其在後續補上，不如在初期則做到一定的彈性。
