---
layout: post
title: CSS沒有極限 - Checkbox的妙用
category: css
tagline: 
thumbnail: 
cssdemo: 2013-autumn
tags: [sass, css]
---

<p>CSS3 新增了<code>:checked</code>的偽元素，它可以判斷目前的checkbox 及 radio 是否有被選核，這樣html就能夠做出基本的點擊功能；並且結合label標籤，label標籤能夠讓樣式的套用更為自由，藉此增加畫面的豐富性。</p>
<!-- more -->
<h2>Selector "~"</h2>
<p>在介紹checked之前，先介紹另一個selector "~"，許多人應該都有用過"+"這一個selector，它的功能是選擇相鄰的下一個元素，而"~"的功能是選擇同層級的後方元素，下面來看個簡單範例。</p>
<div class="demo d1007" data-demo="hover me!">
<div class="demo1">
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
  <div></div>
</div>
</div>
<pre>
//html code
&lt;div class=&quot;demo1&quot;&gt;
  &lt;div&gt;&lt;/div&gt;
  &lt;div&gt;&lt;/div&gt;
  &lt;div&gt;&lt;/div&gt;
  &lt;div&gt;&lt;/div&gt;
  &lt;div&gt;&lt;/div&gt;
  &lt;div&gt;&lt;/div&gt;
  &lt;div&gt;&lt;/div&gt;
  &lt;div&gt;&lt;/div&gt;
&lt;/div&gt;
</pre>
<pre>
//sass code
div
  &:hover
    background: orange
  &:hover ~ div
    background: #B0095C
</pre>
<p>它的功能就像上面所顯示一樣，可以選取後方複數以上的同層級元素，而在結合<code>:hover</code>等等偽元素，它能有更多的效果，而等等就會拿來結合<code>:checked</code>。</p>





<h2>:checked</h2>
<div class="demo d1007">
  <div class="demo2">
    <input type="checkbox" id="a1">
    <label for="a1"></label>
  </div>
</div>
<pre>
//html code
&lt;input type=&quot;checkbox&quot; id=&quot;a1&quot;&gt;
&lt;label for=&quot;a1&quot;&gt;&lt;/label&gt;
</pre>
<pre>
//sass code
[type="checkbox"]
  &:checked ~ label
    //當checkbox被選取時，改變label顏色
    background: #B0095C
    &:before          
      content: "Checkbox is checked."
</pre>
<p>上面有兩個元素，一個是checkbox，另一個是label，不管點哪一者都會得到一樣的結果，其原理是用 label for 對應checkbox的id，這樣兩者就會產生連動效果(html 的概念)；再利用CSS的選取器"~"改變label的樣式。</p>




<h3>複數 label也可以執行</h3>
<div class="demo d1007">
  <div class="demo2">
    <input type="checkbox" id="a2">
    <label for="a2"></label>
    <label for="a2"></label>
    <label for="a2"></label>
  </div>
</div>
<pre>
//html code
&lt;input type=&quot;checkbox&quot; id=&quot;a1&quot;&gt;
&lt;label for=&quot;a1&quot;&gt;&lt;/label&gt;
&lt;label for=&quot;a1&quot;&gt;&lt;/label&gt;
&lt;label for=&quot;a1&quot;&gt;&lt;/label&gt;
</pre>
<p>在html的規定id是不能夠重複的，但是label for是可以重複使用。</p>


<h3>隱藏checkbox</h3>
<div class="demo d1007">
  <div class="demo3">
    <input type="checkbox" id="a3">
    <label for="a3"></label>
    <div class="circles"></div>
     <div class="circles"></div>
     </div>
</div>
<pre>
  &lt;input type=&quot;checkbox&quot; id=&quot;a3&quot;&gt;
  &lt;label for=&quot;a3&quot;&gt;&lt;/label&gt;
  &lt;div class=&quot;circles&quot;&gt;&lt;/div&gt;
  &lt;div class=&quot;circles&quot;&gt;&lt;/div&gt;
</pre>
<pre>
//sass code
.demo3
  [type="checkbox"]
    display: none
    //隱藏checkbox
    &:checked + label
      background: #B0095C
      //當checkbox被選取時，和checkbox相鄰的 label改變顏色
      &:before          
        content: "Checkbox is checked."
      & ~ .circles
        //和checkbox同層的元素，開始進行animation
        animation: ifinityCircles 3s linear infinite
        -webkit-animation: ifinityCircles 3s linear infinite
</pre>

<p>剛剛有提到，label可以讓樣式設定更為容易，所以我們可以把checked隱藏起來，讓使用者只有看到label，這樣在畫面的設計上會更為自由。</p>
<p>而這互動效果，在後面的章節會有更豐富的運用，敬請期待!</p>