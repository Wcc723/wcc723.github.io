---
layout: post
title: 純 "CSS" Banner animation教學
category: css
tagline: 本站上方banner製作方式已修改
tags: [css, sass]
thumbnail: banner-01.png
---
在座這網站的時候，上方有保留一塊區域打算放banner，一般來說banner都會用jquery跑馬燈的方式去做，但是對我來說那要做好幾張圖...好麻煩，所以我就做一張連續圖片(左右可以相連的圖片)，讓他不斷的向右移動。
<!-- more -->
## 本篇重點
本篇會介紹如何用css寫出類似本站上方的banner。

### CSS範例

{% raw %}
<iframe src="http://cdpn.io/Cgbtn" frameborder="0" height="340" width="100%">

</iframe>
{% endraw %}


### 準備圖片

一開始當然要先做一張圖，圖的重點是左右方可以相連的，如下圖最左方的chrome是被切一半，和右方的另一半chrome剛好可以接起來。另外這banner的寬度是"1122px"，等等會用到這寬度。

![banner](/images/banner-01.png)

### CSS
直接介紹CSS的寫法，會比較容易了解其原理，這是利用css3 Animation的語法製作，Animation 包含keyframes 及 animation，前者是物件運動的時間軸，相當於劇本；後者是keyframes所呈現的方式(directive)，這兩者都是必要的，缺一不可。

首先介紹keyframes

	@keyframes banner-slider {
	/*banner-slider 是自訂義命名，本篇命名為banner-slider*/

	  from { /*開始*/
	    background-position: 0 0;
	  }

	  to { /*結束，在結束時background-position的x移動了1122px*/
	    background-position: 1122px 0;
	  }
	}

介紹animation

	animation: banner-slider 180s infinite linear;
	/*banner-slider 是keyframe的名稱*/
	/*180s 是整段keyframes的時間*/
	/*infinite 無限次輪播*/
	/*linear 播放速率是固定的(線性)*/


## 完成
CSS3是很麻煩的語法，要依瀏覽器寫入對應的前輟詞，如果有興趣的設計師，可以直接複製下方CSS，然後把圖片略做修改就可以玩看看囉。

	.banner {
	  background: url('/images/banner-01.png') center repeat-x;
	  min-height: 300px;
	  -webkit-animation: banner-slider 180s infinite linear;
	  -moz-animation: banner-slider 180s infinite linear;
	  -o-animation: banner-slider 180s infinite linear;
	  animation: banner-slider 180s infinite linear;
	}

	@-webkit-keyframes banner-slider {
	  from {
	    background-position: 0 0;
	  }

	  to {
	    background-position: 1122px 0;
	  }
	}

	@-moz-keyframes banner-slider {
	  from {
	    background-position: 0 0;
	  }

	  to {
	    background-position: 1122px 0;
	  }
	}

	@-ms-keyframes banner-slider {
	  from {
	    background-position: 0 0;
	  }

	  to {
	    background-position: 1122px 0;
	  }
	}

	@keyframes banner-slider {
	  from {
	    background-position: 0 0;
	  }

	  to {
	    background-position: 1122px 0;
	  }
	}

如果本篇有任何疑問，也歡迎在下方留言。
