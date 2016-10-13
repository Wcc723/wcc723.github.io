---
layout: post
title: font-family要怎麼玩
category: css
tagline:
tags: [css]
cssdemo: 2013-winter
thumbnail:
---

在平面設計中，字型的運用是一門高深的學問，而網頁設計中雖然大多使用內建的字體，但如果沒有的仔細的去調整，就像是word直接用內建的字型一樣，會產生不協調感。

[參考 Just Font](http://blog.justfont.com/2013/12/popular-typography/)

<!-- more -->
## 本篇重點
了解font-family的設定值，以及參考其他知名網站的設定方式。



## font-family
font-family分為兩個部分，一個是指定字體"family-name"，另一種是泛用字"generic-family"。

	Formal syntax: [ <family-name> | <generic-family> ]#

****************

### 泛用字 generic-family
首先介紹泛用字，泛用字簡單來說，就是系統的明體、黑體、捲曲字等預設值，並不是指定特定的字體，而也可稱為"字體集"、"統稱字體"、"泛用字集"、"通用字體集"等，泛用字的類型如下：

**注意：並非所有瀏覽器及系統的預設泛用字是相同的**

{% raw %}
<div class="demo d0101">
	<table style="width: 100%">
    <tr>
      <th>泛用字集</th>
      <th>中文</th>
      <th>English</th>
    </tr>
    <tr class="serif">
      <td>serif 明體</td>
      <td>貳零壹肆 <br>新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
    <tr class="sans-serif">
      <td>sans-serif 黑體</td>
      <td>貳零壹肆 <br>新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
    <tr class="cursive">
      <td>cursive 捲曲字體</td>
      <td>貳零壹肆 <br>新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
    <tr class="fantasy">
      <td>fantasy 花俏字體</td>
      <td>貳零壹肆 <br>新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
    <tr class="monospace">
      <td>monospace 等寬字體</td>
      <td>貳零壹肆 <br>新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
  </table>
</div>
{% endraw %}

一般來說定義font-family時，會將泛用字放在最後方，參考如下。

	"Lucida Grande",Helvetica,Arial,Verdana,sans-serif
	//最後方的是sans-serif(黑體)

************

### 指定字體 family-name
這部分就相當容易理解，只要直接輸入字型名稱即可，但特別要注意的是如果字體名稱中有空白，就必須用`''` 或 `""` 將他括起來。

但有少部分的字體，設定時需要注意它的英文及中文名稱，個瀏覽器的解讀不同，如IE就能夠接受"Microsoft JhengHei"，而Chrome則不行。

{% raw %}
<div class="demo d0101">
  <table style="width: 100%">
    <tr>
      <th>字體</th>
      <th>中文</th>
      <th>English</th>
    </tr>
    <tr class="Microsoft-JhengHei">
      <td>"Microsoft JhengHei"</td>
      <td>貳零壹肆 <br>新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
    <tr class="Microsoft-JhengHei2">
      <td>微軟正黑體</td>
      <td>貳零壹肆 <br>新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
  </table>
</div>
{% endraw %}

另外在優先順序上，放在前方的字體會先被套用，如果不能才會套用次要的字體，也可以利用這方式來套用不同的字體在中英文上。

如下方的範例，先"Segoe UI"，其次是"微軟正黑體"，最後再放泛用字。

	font-family: "Segoe UI","微軟正黑體",sans-serif

{% raw %}
<div class="demo d0101">
  <table style="width: 100%">
    <tr>
      <th>字體</th>
      <th>中文</th>
      <th>English</th>
    </tr>
    <tr class="Segoe-UI">
      <td>"Segoe UI"</td>
      <td>貳零壹肆 <br>新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>

    <tr class="Segoe-UI2">
      <td>"Segoe UI","微軟正黑體"</td>
      <td>貳零壹肆 <br>新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
  </table>
</div>
{% endraw %}

****************

## 參考
font-family在每個網頁的設定都不相同，在Mac OS以及Windows上所擁有的字型也都不相同，
在設定上也必須考量到其他系統使用者的觀感，這邊就提供幾間不同公司的font-family設定值。

### Apple (TW)
[http://www.apple.com/tw/](http://www.apple.com/tw/)

	font-family: "Lucida Grande",Helvetica,Arial,Verdana,sans-serif

{% raw %}
<div class="demo d0101">
  <table style="width: 100%">
    <tr>
      <th colspan="2">Apple</th>
    </tr>
    <tr class="Apple">
      <td>貳零壹肆 新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
  </table>
</div>
{% endraw %}

### 微軟台灣

[http://www.microsoft.com/taiwan/](http://www.microsoft.com/taiwan/)

	font-family: "微軟正黑體", "Microsoft JhengHei", "Segoe UI Semibold", "Segoe UI", "Lucida Grande", Verdana, Arial, Helvetica, sans-serif

{% raw %}
<div class="demo d0101">
  <table style="width: 100%">
    <tr>
      <th colspan="2">Microsoft</th>
    </tr>
    <tr class="Microsoft">
      <td>貳零壹肆 新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
  </table>
</div>
{% endraw %}

### Yahoo (US)

[http://www.yahoo.com/](http://www.yahoo.com/)

	font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif

{% raw %}
<div class="demo d0101">
  <table style="width: 100%">
    <tr>
      <th colspan="2">Yahoo</th>
    </tr>
    <tr class="Yahoo">
      <td>貳零壹肆 新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
  </table>
</div>
{% endraw %}

### Google

google的設定值最泛用....。

[https://www.google.com](https://www.google.com)

	font-family: arial,sans-serif

{% raw %}
<div class="demo d0101">
  <table style="width: 100%">
    <tr>
      <th colspan="2">Google</th>
    </tr>
    <tr class="Google">
      <td>貳零壹肆 新年快樂</td>
      <td>2014 Happy New Year.</td>
    </tr>
  </table>
</div>
{% endraw %}
