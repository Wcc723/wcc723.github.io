---
layout: post
title: CSS3 垂直文字書寫
category: css
tagline: 
thumbnail: 
cssdemo: 2013-winter
tags: [sass, css]
---
<p>html最早都是應用於拉丁文上，而拉丁文主要是水平由左到右的書寫方式，而到了其他的語系國家，文字也只能用水平由左到右的書寫方式；而漢字是屬於垂直書寫由右到左的書寫方式，現在也能透過CSS的<code>writing-mode</code>改變，就來看一下範例吧。</p>
<!-- more -->
<h2>正常版</h2>
<div class="demo d1020">
  <div class="demo1">
    床前明月光<br>
    疑是地上霜<br>
    舉頭望明月<br>
    低頭思故鄉<br>
  </div>
</div>
<p>這是最正常的水平書寫方式，但我們都知道古詩還是直行的比較習慣。</p>
<h2>Writing-mode</h2>
<div class="demo d1020">
  <div class="demo2">
    床前明月光<br>
    疑是地上霜<br>
    舉頭望明月<br>
    低頭思故鄉<br>
  </div>
</div>
<pre>
-webkit-writing-mode: vertical-lr
writing-mode: vertical-lr 
</pre>
<p>透過<code>writing-mode</code>，值設定為 vertical-lr，就可以把文字改為直書，透過小學課本我們可以了解不只是直書還要由右到左。</p>




<div class="demo d1020">
  <div class="demo3">
    床前明月光<br>
    疑是地上霜<br>
    舉頭望明月<br>
    低頭思故鄉<br>
  </div>
</div>
<pre>
-webkit-writing-mode: vertical-rl
writing-mode: vertical-rl
</pre>
<p>再把值改為vertical-rl，就可以直書且由右到左。</p>

<div class="demo d1020">
  <div class="demo3" style="font-family: 標楷體;">
    床前明月光<br>
    疑是地上霜<br>
    舉頭望明月<br>
    低頭思故鄉<br>
  </div>
</div>
<p>如果還不夠，可以把字體換成標楷體...，就可以重現小學課本上的古詩了...。</p>