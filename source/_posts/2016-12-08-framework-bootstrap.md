---
layout: post
title: 鐵人賽 8 - CSS 框架架構參考 Bootstrap
category: css
tagline:
tags: [css, oocss]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/08_oocss_header.png
published: true
---

Bootstrap 是目前我最喜歡的 CSS 框架。

雖說如此，我以往可是很討厭 Bootstrap 的，身為一名設計師希望能夠有更多自己發揮的空間，所以早期一直在避免使用 Bootstrap 這樣的框架，總認為這些框架做出來的設計都很像，還因此自己寫一個 CSS 框架。

經歷過了一段自幹的歷程，從新再研究了 Bootstrap 的框架才發現自己很多觀念上的不足如：

* 過度的 sass @extend (良好的 CSS 架構，不太需要使用 @extend)
* OOCSS 觀念不夠強 (結構與樣式並未良好的分離)
* 框架可用套件不足 (自幹的怎會有套件 @_@)
* Bug 發現慢 (多人開發的框架 bug 自然少)

<!-- more -->

## Sass 架構簡介

Bootstrap 第三版是使用 `LESS`，到了第四版改用 `SASS`，但不管用哪一個開發工具，其實整個架構的差異都不大，只要了解其中一種觀念，就可以套用在每個版本上。

Bootstrap 的架構其實並不複雜，整個核心都圍繞在 "模組" 上，我們可以視 Bootstrap 每一個部件都是一個模組：

```
|- bootstrap.scss   # 主檔案，負責載入所有模組
|- _variables.scss  # 變數，如果要修改整體樣式可從這裡調整
|- _buttons.scss    # 從這以下都是模組
|- _tables.scss
|- _alert.scss
|- _utilities.scss
|- ...
|- /mixins          # 樣式運算函式庫
   |- _buttons.scss
   |- _forms.scss
   |- _grid.scss
   |- ...
```

### bootstrap.scss

這隻檔案相當的單純，主要是載入全部的樣式表，除了這隻以外還有以下幾個分支：

bootstrap-flex.scss     
bootstrap-grid.scss
bootstrap-reboot.scss

這些的功能都是一樣的，只是差異在載入的檔案不同，如果第一次想了解 Bootstrap 的同學，可以先看看這隻檔案 "依序" 載入了哪些的檔案。

### _variables.scss

在 `scss` 中，前方帶有下底線的代表該檔案不會被輸出(所以上一段落的 bootstrap.scss 會被轉成 css)，Bootstrap 主要的樣式也都是在這隻檔案做設定。

以色彩來說，檔案裡面可以看到以下的設定，開發者可以修改以下變數，在編譯時自然會套用到所有的模組上。

```
$brand-primary:             #0275d8 !default;
$brand-success:             #5cb85c !default;
$brand-info:                #5bc0de !default;
$brand-warning:             #f0ad4e !default;
$brand-danger:              #d9534f !default;
$brand-inverse:             $gray-dark !default;
```

### _buttons.scss, _tables.scss, _utilities.scss ...

這個部分就是整個 Bootstrap 的結構重點了，除了以上的 bootstrap.scss、_variables.scss 及稍後提到的 `_mixins` 資料夾，其他都是屬於 "模組"。

Bootstrap 將模組檔案拆分得相當細，官方的文件也是依據這個架構所呈現：

![](/images/2016_ironman/08_framework_bootstrap_01.png)

Bootstrap 的說明文件

每個元件拆離以後有以下優點：

* 元件各自獨立，互不影響 (僅少部分有相依關係 如：buttons, button-group)
* 易讀性高：開發者可以輕易地找出元件檔案，並且在開發新元件不影響其他元件
* 開發者可以依據 bootstrap.scss 自行決定載入哪些元件

> 元件之間影響變小了，全部是由 bootstrap.scss 串接，由 _variables.scss 決定樣式。

元件的設計除了有 Pure CSS 的結構與樣式分離外，Bootstrap 在容器與內容分離也是做得相當徹底，加上 Bootstrap 有大量的元件，彼此之間的組合變化也相當多元，就 Bootstrap 現有的架構下其實我們可以將元件分為兩大類型：

![](/images/2016_ironman/08_framework_bootstrap_03.png)

一則是在外的容器，另外則是在內的元件(內容)；像是 grid-system 就是屬於在外的容器，在外側的容器並不會影響內部的元件樣式，按鈕來說他就是屬於在內部的元件，他可以依附在任何的容器內。

以下是簡單的 Bootstrap 容器與元件分類：

![](/images/2016_ironman/08_framework_bootstrap_02.png)

Bootstrap 就如同前文 OOCSS 所介紹的包含結構與樣式分離、容器與內容分離，在這架構下 Bootstrap 的可用性就會相當高，而且在後續的新增元件也會更為容易。

> 說句坦白話，拆解 Bootstrap 讓我更能了解 OOCSS。

### _mixins 資料夾

_mixins 資料夾是元件的運算函式，在大部分的情況下不需要做調整，只要修改 _variables.scss，就能運算出新的樣式表，本篇就不細說了。

## 結語

一般來說閱讀 Bootstrap 的結構方法如下：

1. 找出 bootstrap.scss (了解整體架構)
2. 找出變數檔案 _variables.scss
3. 尋找、閱讀 各元件

了解整體架構後，如果需要自行修改或自幹(?)也會相對容易很多。
