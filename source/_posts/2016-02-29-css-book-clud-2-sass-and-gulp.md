---
layout: post
title: 第二次 CSS 讀書會 - Sass 環境建置
category: css
tagline:
tags: [css]
cssdemo:
jsdemo:
thumbnail: 2016/02/cssBookclub-gulp.jpg
published: true
---

這次是第二次的 CSS 讀書會，目標是要教大家 Sass 的環境建立，
也算是比較大的挑戰，因為要在線上及現場教大家怎麼運行 Sass 的編譯環境，且主要的目標族群包含了設計師、網頁設計師，甚至是沒有碰過 command line 的開發者...。


<!-- more -->

![](/images/2016/02/cssBookclub-gulp.jpg)

## 活動簡報

範例：[https://github.com/Wcc723/gulp-web-designers](https://github.com/Wcc723/gulp-web-designers)

這次活動的簡報是用 Keynote 做的，有些部分是講解上為了呈現動態效果，所以在 slideshare 無法呈現的很完整。

{% raw %}
<iframe src="//www.slideshare.net/slideshow/embed_code/key/kOQtobRIzX2xBr" width="595" height="485" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" style="border:1px solid #CCC; border-width:1px; margin-bottom:5px; max-width: 100%;" allowfullscreen> </iframe> <div style="margin-bottom:5px"> <strong> <a href="//www.slideshare.net/chihchengwang3/sass-node-sass" title="建立 Sass 環境，透過 Node sass" target="blank">建立 Sass 環境，透過 Node sass</a> </strong> from <strong><a target="blank" href="//www.slideshare.net/chihchengwang3">Chih-cheng Wang</a></strong> </div>
{% endraw %}


也有準備了 Hackpad 提供共筆，很感謝前端朋友們熱情協助寫共筆文件。

<script src="https://csscollege.hackpad.com/5k6BVvbKYTf.js"></script><noscript><div>View <a href="https://csscollege.hackpad.com/5k6BVvbKYTf">CSS 讀書會 2 (Sass 編譯環境)</a> on Hackpad.</div></noscript>

## 其他問題

這次有許多問題是 Hackpad 上沒有提到，是在問卷內提出的問題，這邊我就一一回覆：

### 問題：Sass 與 Scss

在一開始寫 Sass 就是使用 `.sass` 的格式，前前後後也有一年多的時間，雖然看到許多開發者都是使用 `.scss`，大多數的文件及範例也都是使用 `.scss` ，但當時是想說只要有愛，就可以堅持下去 !?

直到出現一個問題用 `.sass` 很難解決(讓我轉跳 `.scss` 的原因)，那就是 Sass Maps (範例：http://www.sitepoint.com/using-sass-maps/)，當時也正好在學 Susy， Susy 一定要使用 Sass Maps，用 `.sass` 格式寫 Sass Maps 簡直地獄...。


    // scss
    $map: (
      key: value,
      other-key: other-value
    );


Sass 格式中，Sass Maps不能換行 = =(實際上的 Maps 會更長)，當下花了很長的時間找解法，但一直找不到替代方式，就默默地轉向 `.scss`。


    // sass
    $map: (key: value, other-key: other-value)


另外一個原因是在寫教學文時 `.sass` 對於一般使用者較為陌生，如果不熟悉的讀者看到 `.sass` 應該不知道在寫什麼...。

### 問題：為何不再用 Susy

關於 Susy 這個工具我用過 Susyone、Susy 2，後來確實有些偏見 (這部分是我該反省的點Q_Q，不該用自己的主觀來勸大家別用)，這邊還是要和大家分享為何我不再使用這樣的 Grid 工具。

#### 第一階段

這幾張圖我們就看有色彩的地方，假設需求是左邊有選單(4欄寬度)，右方的區域是文章內容(8欄寬度)，總共為 12 欄寬，一開始我們可能會使用 `.menu` 及 `.article` 來規劃 CSS 。

```scss
.menu {
  // 4 欄寬
}
.article {
  // 8 欄寬
}
```

![](/images/2016/02/step1.png)

#### 第二階段

但這兩個區域的實際內容可能不會只放文章，左邊也有可能是放廣告，所以就把側邊改成 `.side`，中間也改成了 `.content`，以符合以後的運用。

```scss
.side {
  // 4 欄寬
}
.content {
  // 8 欄寬
}
```

![](/images/2016/02/step2.png)

#### 第三階段

後來新增了一個區域 `.ad`，那個區域的寬度與 `.side`也都相同，但稱為 `.side` 的區域也不便直接套在 `.ad`，所有就新增一個 `.ad` 寬度也一樣是 4 欄寬。

```scss
.side {
  // 4 欄寬
}
.content {
  // 8 欄寬
}
.ad {
  // 4 欄寬
}
```

![](/images/2016/02/step3.png)

#### 第四階段

我們會發現其實 `.side`、`.ad` 兩者 CSS 屬性差異不大，所以可以改用欄寬的方式來定義這個 class 名稱，於是乎就出現了 `.col-4`、`.col-8`，m...到了這步驟，是不是發現和 Bootstrap 2 有點像呢!?這樣的 CSS 設計模式是將網格系統模組化，增加了Class 的可複用性。

![](/images/2016/02/step4.png)

Susy 的優點在於快速建立格線系統，但如果是 `col-size` 的 Grid-system 就失去了快速建立格線系統的特色，模組化的優點是增加了 Class 的可複用性，但換個方向去思考，其實它也限制了創意的發想(畢竟 grid 都已經規劃好)，不同的方法與技巧也建議去嘗試看看，這樣才能了解何者適合目前的專案。

### 問題：為何需要用 Scss 與 CSS 如何跟後端的結合

為何需要用 Scss？理由挺多的，就個人這段時間的學習來說，有以下幾個理由：

1. 節省時間：當初學習 CSS 時，每一行都是純手工寫出來的，雖然很有成就感，但久而久之都花時間在重複的地方，透過 Sass 的技術，不僅在重複的地方花更少的時間，還可以投資更多時間在新的技法上。
2. 管理 CSS：就純 CSS 來說，由於所有的程式碼都集中在同一個檔案上(當然也可以用@import，但就效能上有許多建議說別這麼做)，透過 Sass 可以將 CSS "模組"拆分成不同檔案，之後再編譯成同一隻檔案。
3. 進階的 CSS：Sass 在開發上多了變數、運算，可以去思考怎樣用簡單的方式做出豐富的效果，不過這也需要投資一定的時間去研究。

如何與後端語言結合？

其實我在專案上都是透過 Gulp 與後端結合，但這次的讀書會主要是讓新手可以入門 Sass 環境，所以沒仔細提到這段，如果是後端的開發者，可以參考[範例](https://github.com/Wcc723/gulp-web-designers)中的 `gulpfile.js`，抽離掉 webserver 模組後，就可以用來編譯給後端用的 Sass (也可以依據需求調整編譯路徑等)，或者私下敲[我](https://www.facebook.com/chihcheng.wang.3)，我們再來討論討論。

前端的工具還相當多，這樣的一次性介紹還缺乏很多，以後我再多研究研究其他前端工具再與大家分享(近期內應該還會介紹 Bower)。

### 建議：講者說話太快

嗯...，這部分是我該多注意的，往後的課程也會更著重在單一的主題上介紹，不過大家有問題還是盡量可以在 Hackpad 或直播頻道發問，上面有許多高手會一起交流解答～。

就票數上來說，下次會介紹 CSS 架構，希望這個連假可以準備差不多 Orz 。
