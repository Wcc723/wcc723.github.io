---
layout: post
title: 前端設計師的設計與執行
category: design
tagline: 
tags: [design]
cssdemo: 
jsdemo: 
thumbnail: 2014-11-12-01.png
published: true
---

> 圖片來源 google material design

看到 嫁給RD的 UI Designer 的[這篇文章](http://blog.akanelee.me/posts/241439-design-and-f2e-cut-images)有感，想說也寫一下我對於這個主題的想法，在工作的流程中，每個人所佔的崗位不同，都會有不同的觀點，她的這一篇所在的角色是UI，我的看法是設計師與前端之間的角色。

從學設計到現在轉職成前端，因為設計背景的關係，所以大部份在執行時都是從設計到切版都是我做，這在執行上並一定是好的流程，只是不同崗位，有不同的觀點，同時橫跨兩個崗位，就會掌握不同的面向，但畢竟是一個人，無法面面俱到，所以這邊會提出一些我的看法及解決辦法。

<!-- more -->

## 規劃

首先，在設計前必須了解需求，需求不外乎包含瀏覽器限制、Responsive web design、整體色調、是否包含維護、配合的後端技術or其他framework等等...，再從這些面向去思考設計如何執行。

## 瀏覽器限制

基本上我現在所執行的網站大多是IE8+，甚至是不用管IE(在2013年後期政府專案很多都只要ie8+)，這些直接影響了所使用的CSS layout、CSS3效果、SVG等等效果，如果還有使用webfont，雖然可以執行，但是Render 會很醜...。

如果遇到需要配合低階瀏覽器，會避免掉許多效果，像是RWD、Retina display。配合低階瀏覽器，還要做這些，無疑是拿石頭砸自己的腳；且目標客群都不想用新式瀏覽器，自然也不會在乎這網站上用了什麼技術。

## 設計工具

講到這就突然難過了起來，以前我都是使用Illustrator，在設計Web時剛開始也就認命的辛苦些(有點難用)，直到了用過Sketch、Affinity Designer，發現不僅是程式不斷的在演化，設計工具也是必須有改變，但苦於想學的東西太多，不知不覺設計工具的優先值就被往後排了。

因此在設計前先了解對於軟體的熟悉度，以及專案是否有配合其他設計師，從中判斷用哪套軟體(現在我多用Sketch 起手)。

關於Sketch、Affinity Designer，兩套我都有買，但並非相當精通，我認為Sketch較偏向Layout，而Affinity比較適合繪製細節，像是Icon、Logo等。

![](/images/2014-11-12-02.png)

> Sketch

![](/images/2014-11-12-03.png)

> Affinity Designer

## Responsive web design

這也是重點中的重點，今年以前Responsive web design只要提出來，價碼都好說好說(以後幾乎是必備)，所以在前公司提案時，盡量都會以Responsive web design為賣點，以增加拿到案子的成功率，所以既然挖了這個坑就要自己跳了...。

RWD在執行時，要先思考使用CSS framework 或是自己用sass做，在過去我主要會使用sass 搭配 susy執行，但現在由於專案越來越大，我就會自幹CSS framework。兩者不同點在於susy 比較適合小型專案，他可以語意化Class，可以快速搭建小型專案所需的layout，但在大型專案中，所有的CSS最好都是模組化，可供各頁面重複使用，以增加工作效率。

如果真有要考慮RWD，會Sass是比較好，如果不熟Sass，使用bootstrap grid system可能會穩定些。

## 顏色

(這部分我改天整理更完整的)

在使用繪圖軟體時，調色我都使用RGB bar去拉，再把最適合的色彩存在色票內，可能會約存5種色彩(主要顏色、底色、次要色、警告色、提示色等)，有點類似bootstrap所提供色彩，但會因為專案的不同所調整。

![](/images/2014-11-12-04.png)

常用的顏色會拉下來當色票，不過建議是排整齊，別跟我一樣，排整齊之後反而找不到...。

顏色上再進入sass開發後，會定義成變數，並且在套用時進行色彩運算，如果是經常使用的色彩，也可以先運算。

```sass
$primary-color: #009aff
$primary-color-darken: darken($primary-color, 10%)
$primary-color-lighten: lighten($primary-color, 10%)
```

<p data-height="268" data-theme-id="0" data-slug-hash="zxOgZR" data-default-tab="result" data-user="Wcc723" class='codepen'>See the Pen <a href='http://codepen.io/Wcc723/pen/zxOgZR/'>zxOgZR</a> by Wcc723 (<a href='http://codepen.io/Wcc723'>@Wcc723</a>) on <a href='http://codepen.io'>CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

這樣可以讓顏色更有系統的管理，不過變數的命名又是另一門學問了，這邊就不再多作闡述。

## 維護

這直接影響這個專案的未來，有資歷的開發者都很有感觸，到底要不要挖坑給未來的自己跳...，只有經驗會告訴你。

*不過以為專案就像石頭往河裡丟一樣，但常常像飛盤一樣飛回來打到自己。*

## 配合的後端以及相關Framework、library

執行前，有機會也可以先和配合的後端聊聊，雖然我寫的是Sass，但卻沒有配合過Rails  or Node.js專案(泣)，可以先了解後端了解的事項有：

1. 切好的Prototype如何交付
2. 細部的已知功能工作分配 (javascript的分配)
3. 專案架構是否為MVC，以及版面修正配合方式

接下來還可以詢問javascript library為何，一般來說最常使用的jquery，如果是jquery還要了解版本為何，以及可能會使用到的plugin，就以我工作上來說，大多會另外使用bootstrap js、datatable等等，這些在設計上就可以盡量使用。

----

除了這些之外，更重要的當然是怎樣做好Web UI，除了多看好的設計之外，更重要的是要閱讀Style guide，UI設計和程式有很大的關係，必須依據一定的準則，在執行及操作上才會有良好的體驗。

如果要推薦一份Style guide，當然就是Google material design，而且運氣不錯，有人翻譯成繁體中文版了([http://wcc723.gitbooks.io/google_design_translate/](http://wcc723.gitbooks.io/google_design_translate/))。
