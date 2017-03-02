---
layout: post
title: 鐵人賽 30 - CSS 鐵人賽的結束與接下來的研究
category: css
tagline:
tags: [css, Sass ]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/30_ending_header.jpg
published: true
---

相較於 Javascript 來說，CSS 的演進速度算是非常緩慢的，主要原因當然是瀏覽器的相容性，瀏覽器不太能因為新的特色加入而毀了以前所建置的網站。

在這個相對穩定的程式語言，精通一個的手法就可以活用的相當久，像是 Sass 來說，到目前為止他還是相當流行的前置語言。

<!-- more -->

就算如此，CSS 依然有許多有趣的新穎功能，以 Flex 來說就能輕鬆排出許多豐富的版型，恰巧這幾天朋友考我 flex，就將這排版獻醜給大家看看，條件如下：

- 用 flex 排版
- navbar 固定在上方
- 主要內容分為三欄
- 中間欄內容長的時候可以 scroll ，左右不需要 scroll
- 右側欄分為三列
- 右上欄有獨立的 scroll

{% raw %}
<a class="jsbin-embed" href="http://jsbin.com/beniledina/1/embed?output">JS Bin on jsbin.com</a><script src="http://static.jsbin.com/js/embed.min.js?3.40.2"></script>
{% endraw %}

```css
body, html {
  margin: 0;
  padding: 0;
}
.flex-h {
  height: 100vh;
}
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}
.flex-3 {
  flex: 3;
}
.flex-col {
  flex-direction: column
}

.scroll {
  overflow-y: scroll;
}
.navbar {
  height: 60px;
  background-color: red;
}
.bg-blue {
  background-color: blue;
}
.bg-gray {
  background-color: gray;
}
```

在這些條件下，相信大家也使用過 `position`、`float` 等排版手法，而 flex 僅需要簡短的語法就能達到接近的效果。不過雖然如此 `flex` 目前不是大家主要排版的首選，需要上線的產品我也不會使用 flex 做為主要排版的語法(會使用在次要的內容)，主因還是 flex 在於目前相容性還不夠高，就算捨去了 IE 還是有部分的瀏覽器在呈現上略有不同(說個鬼故事，很多人的 iOS、Mac OS 都不愛更新的)。

為了讓自己可以更熟悉 Flex，我也做了一個簡單的工具，讓自己可以透過互動的方式查詢 Flex 的語法。

![](/images/2016_ironman/30_ending_02.png)

連結：http://wcc723.github.io/WorkShop-gh-pages/cssFlex/

## CSS column

和 Flex 一樣屬於排版的語法 `CSS column`，去年的時候也有花很多時間研究，也有製作類似的語法互動研究工具，和 `flex` 也遭遇相同的問題，不同瀏覽器雖然都支援，卻顯示出不同的結果，以下連結請玩～

連結：https://wcc723.github.io/css/2015/07/23/css-column/

![](/images/2015-07-23_screen_shot.jpg)

## 據說很猛的 display: grid

第一次研究 `flex` 是在 2013 年，至今也三年左右了... Q_Q，到現在使用上還是有所顧忌，現在對於排版有新的屬性：`display: grid`，依據 flex 的概念他可以等我花三年的時間慢慢研究 >O<。

![](/images/2016_ironman/30_ending_01.png)

以下為圖文參考的文件，就目前看來有許多語法與 `flex` 是共用的，期望 webkit 能統一瀏覽器世界，讓這些語法能夠快速進入實際運用。

https://css-tricks.com/snippets/css/complete-guide-grid/
