---
layout: post
title: 簡易CSS transform 視差效果
category: css
tagline:
tags: [css, sass]
cssdemo: 2013-winter
thumbnail: 2013-12-23-lol-zig.png"
---

在先前範例中可以得知，CSS transform 來做視覺特效，效能會比原始的CSS2還要好，所以本篇就利用css transform 以及hover來簡單做一個互動的效果吧！

<!-- more -->
## 本篇重點
利用hover結合css transform來作出簡易互動效果，而本篇主要是CSS3，所以將會使用sass做範例。

#### Demo
滑鼠移過下方的區域時，下方的兩個角色會靠近，另外在滑鼠在角色的圖片上時，角色會從模糊變成清楚。

{% raw %}
<div class="demo d1223" data-demo="Hover me!">
	<div class="transform3d">
		<span class="ez"><img src="/images/2013-12-23-lol-f.png" alt=""></span>
		<span class="ziggs"><img src="/images/2013-12-23-lol-zig.png" alt=""></span>
	</div>
</div>
{% endraw %}

*圖片來源：英雄聯盟 *


## 原理
在這範例用的是用CSS 3D，而在滑鼠移過時，會移動兩個角色的X軸，使其有簡易的視差效果。

    .transform3d
        height: 500px
        +transform-style(preserve-3d)
        //如果要做3D效果，其外層必須要有transform-style(preserve-3d)

        &:hover //滑鼠滑過時執行以下效果
            .ez   //左邊那個手指男
                +transform(translate3d(50%,0,0))
                //X軸向右位移50%

            .ziggs  //右方的炸彈男
                +transform(translate3d(-50%,0,0))
                //軸向左位移50%

## 製作
先來看看html結構，如果要使用transform 3d，記得其外層一定要有transform-style(preserve-3d)這個屬性`transform3d`這一個class就是這個用途，而span內分別包著一張角色圖片。

    <div class="demo" data-demo="Hover me!">
        <div class="transform3d">
            <span class="ez"><img src="/images/2013-12-23-lol-f.png" alt=""></span>
            <span class="ziggs"><img src="/images/2013-12-23-lol-zig.png" alt=""></span>
        </div>
    </div>


### 完整sass
大部份的功能，都直接寫在註解裡，這樣比較容易理解，另外filter是比較耗效能，建議不要結合transition(等等下方會有範例)。

    .demo
        position: relative  
        //定位角色初始位置

    .transform3d
        height: 500px
        +transform-style(preserve-3d)
        //如果要做3D效果，其外層必須要有transform-style(preserve-3d)

        &:hover //滑鼠滑過時執行以下效果
            .ez   //左邊那個手指男
                +transform(translate3d(50%,0,0))
                //X軸向右位移50%

            .ziggs  //右方的炸彈男
                +transform(translate3d(-50%,0,0))
                //軸向左位移50%

    span
        //定義角色共通屬性
        width: 40%
        display: block
        position: absolute
        bottom: 0
        +transition(transform 1s ease-in-out)  
        //動態轉場效果(僅對transform有效)

        img
            +filter(blur(5px)) //模糊濾鏡
            width: 100%
            &:hover
                +filter(blur(0))
    .ez   //手指男靠左
        left: 0

    .ziggs  //炸彈男靠右
        right: 0

## 再一次demo

{% raw %}
<div class="demo d1223" data-demo="Hover me!">
    <div class="transform3d">
        <span class="ez"><img src="/images/2013-12-23-lol-f.png" alt=""></span>
        <span class="ziggs"><img src="/images/2013-12-23-lol-zig.png" alt=""></span>
    </div>
</div>
{% endraw %}


## 增加filter 效果
這部分在增加一個filter的drop-shadow效果，這樣會更有層次，但是效能會更差一點。而這邊要表現的效果，就是角色後方的陰影，會因為hover而改變位置。因filter效能不好，較好的方式還是在後方增加一層圖片，然後再用transform去改變其位置。

{% raw %}
<div class="demo d1223" data-demo="Hover me!">
    <div class="transform3d2">
        <span class="ez"><img src="/images/2013-12-23-lol-f.png" alt=""></span>
        <span class="ziggs"><img src="/images/2013-12-23-lol-zig.png" alt=""></span>
    </div>
</div>
{% endraw %}

    .ez
        +filter(drop-shadow(-5px 0 0 rgba(black ,.5)))
    .ziggs
        +filter(drop-shadow(5px 0 0 rgba(black ,.5)))
    &:hover
        .ez
            +transform(translate3d(50%,0,0))
            +filter(drop-shadow(5px 0 0 rgba(black ,.5)))
        .ziggs
            +transform(translate3d(-50%,0,0))
            +filter(drop-shadow(-5px 0 0 rgba(black ,.5)))
