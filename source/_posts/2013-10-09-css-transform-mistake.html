---
layout: post
title: CSS沒有極限 - CSS transform 軸線的謊言
category: css
tagline: 
thumbnail: 
cssdemo: 2013-autumn
tags: [sass, css]
---

<p>從小上數學課，都會知道X軸是左右，Y軸是垂直，看起來就是這麼容易，但是一到了CSS上卻是常常分不清楚，而其中最大的陷阱就是旋轉(rotate)。這篇會用簡單的動態效果，讓大家了解旋轉與軸線之間的關係(本篇都是使用sass)。</p>
<!-- more -->
<h2>先了解軸線的方向</h2>
<p>X軸線就是左右，很容易，但別急，我們慢慢看下去。</p>
<div class="demo d1009">
  <div class="demo0">
    <div class="box">
      <div class="xline" data-line="X"></div>
    </div>
  </div>
</div>

<p>Y軸線就是垂直，也是很容易。</p>
<div class="demo d1009">
  <div class="demo1">
    <div class="box">
      <div class="xline" data-line="X"></div>
      <div class="yline" data-line="Y"></div>
      <div class="zline" data-line="Z"></div>
    </div>
  </div>
</div>

<p>這邊我把平面旋轉了Y軸(垂直軸)，讓大家了解Z軸的位置，而Z軸就是垂直於剛剛的平面之上，這在transform3D會使用到。</p>
<div class="demo d1009">
  <div class="demo2">
    <div class="box">
      <div class="xline" data-line="X"></div>
      <div class="yline" data-line="Y"></div>
      <div class="zline" data-line="Z"></div>
    </div>
  </div>
</div>



<h2>增加些動態吧</h2>
<h3>水平移動</h3>
<p>接下來我用translate的語法，讓這個方塊水平移動。</p>
<pre>
&:hover .box
  +transform(translateX(100%))
  //滑鼠滑入時，沿著X軸移動100%
</pre>
<div class="demo d1009" data-demo="Hover me!">
  <div class="demo3">
    <div class="box">
      <div class="xline" data-line="X"></div>
      <div class="yline" data-line="Y"></div>
      <div class="zline" data-line="Z"></div>
    </div>
  </div>
</div>

<h3>先移動在旋轉</h3>
<p>接下來我們讓這個物件移動並且旋轉，這邊就是陷阱的開始，目前還沒有異樣。</p>
<pre>
&:hover .box
  +transform(translateX(100%) rotate(30deg))
  //在位移的語法後方增加上旋轉
</pre>
<div class="demo d1009" data-demo="Hover me!">
  <div class="demo4">
    <div class="box">
      <div class="xline" data-line="X"></div>
      <div class="yline" data-line="Y"></div>
      <div class="zline" data-line="Z"></div>
    </div>
  </div>
</div>


<h3>先旋轉在移動</h3>
<p>雖然這部分我是做成animation，但其實結果是一樣的，只是要讓大家容易了解。</p>
<p>如果將旋轉的語法放在前面，那麼物件的X軸也會跟著變化，所以CSS的transform是以物件為基準點，當物件旋轉時，物件的基準點也會跟著改變。</p>
<pre>
@-webkit-keyframes Rline
  0%    
  30%
    +transform(rotate(30deg))
  100%
    +transform(rotate(30deg) translateX(200px))
</pre>
<div class="demo d1009">
  <div class="demo5">
    <div class="box">
      <div class="xline" data-line="X"></div>
      <div class="yline" data-line="Y"></div>
      <div class="zline" data-line="Z"></div>
    </div>
  </div>
</div>

<h2>同樣的理論，我們來看看3D</h2>
<p>首先旋轉Y軸(垂直軸)90度，然後以物件為基準朝向Z軸移動。</p>
<pre>
&:hover .box
  +transform(rotateY(90deg) translateZ(500px))
  //維持原本的90度Y軸旋轉，並且朝向Z軸移動
</pre>
<div class="demo d1009" data-demo="Hover me!">
  <div class="demo6">
    <div class="box">
      <div class="xline" data-line="X"></div>
      <div class="zline" data-line="Z"></div>
    </div>
  </div>
</div>


<p>和剛剛一樣，先加入旋轉在移動物件。</p>
<pre>
@-webkit-keyframes Zline  
  30%
    +transform(rotateY(90deg) rotateX(-10deg))
    //維持90度Y軸旋轉，然後在旋轉X軸10度
  100%
    +transform(rotateY(90deg) rotateX(-10deg) translateZ(500px))
    //在旋轉後，往Z軸的方向移動
</pre>
<div class="demo d1009">
  <div class="demo7">
    <div class="box">
      <div class="xline" data-line="X"></div>
      <div class="zline" data-line="Z"></div>
    </div>
  </div>
</div>

<p>經過以上的實驗，相信會更了解物件的軸線吧(!?)。了解後，對於學習CSS transform也會有很大的幫助，接下來會介紹transform的基準點，敬請期待。</p>