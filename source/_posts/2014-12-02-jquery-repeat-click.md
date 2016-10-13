---
layout: post
title: Jquery 重複點擊判斷
category: jquery
tagline:
tags: [jquery, javascript]
cssdemo: 2013-summer
jsdemo: 20130818
thumbnail:
published: true
---

這篇是舊文重貼，原本是在aShareaDay上的文章，可能因為太短...，所以我沒放到這新的Blog上，但最近有人在詢問(感謝貴人提醒)，範例也相當實用，就再重新放上來。



<!-- more -->


Jquery有個很簡單的方式可以做到重複點擊判斷，這邊就不再多作闡述，只要看了範例就可以快速瞭解。

來源：[http://jsfiddle.net/visualidiot/WJEBr/](http://jsfiddle.net/visualidiot/WJEBr/)

{% raw %}
<div class="d0818 demo">
	<a href="#" class="d0818click">點我</a>
	<span class="old"></span>
	<span class="new"></span>
</div>
{% endraw %}

```javascript
$('.d0818click').click(function() {
    $('.old').animate({left: '+=10'});
    $('.new').is(':animated') || $('.new').animate({left: '+=10'});
});
```

寫到這，我突然想起來為什麼沒有放到這Blog上了...，因為當時Jekyll載入外部Js功能還沒寫好，後來寫好忘記放進來...，所以最近可以補很多以前的Js文章...。

另外舊的Blog(aShareaDay)因為空間沒有再續約，所以停了，大部分文章在這Blog都可以找到，有缺的部分也會盡量補齊，感謝大家的支持。
