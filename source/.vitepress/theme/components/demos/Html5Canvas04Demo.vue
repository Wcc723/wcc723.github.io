<script setup>
// 〈專輯封面顏色作為背景色(平均色)〉/canvas/2014/12/18/html5-canvas-04/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有載入 jQuery，這裡載入 jQuery 3.7.1。
// canvas 要讀圖片的像素（getImageData），圖片放在 img.casper.tw，跨網域要用 CORS 載入。
// 載圖那一行改呼叫 __loadCorsImage（Embed.vue 的 loadCorsImage）：img.casper.tw 還沒開放 CORS 時圖照樣畫得出來，但讀像素的效果要等開放以後才看得到。
// 呼叫 draw 的那一行包 try/catch：沒開放 CORS 時 canvas 被跨網域的圖污染，getImageData 會丟 SecurityError，
// 改成只在 console 留一行 warning（跟其他示範的「[demo]」一樣），不留下未捕捉的例外。開放 CORS 後平均色就會出現。
import { onMounted } from 'vue'
import { runDemo, loadCorsImage } from './Embed.vue'

const LIBS = ['jquery']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
$(document).ready(function(){
  var _canvas = document.getElementById('canvas');
  var ctx = _canvas.getContext('2d');

  $('#album input').on('change', function(){
    //取得選擇的專輯封面
    if ($(this).is(':checked')){
      imgPath = $(this).next('li').find('img')
        .attr('src');
      getImg(imgPath);
    }
  });

  function getImg(imgPath){
    var img = new Image();
    __loadCorsImage(img, imgPath); // 2026 改：原本是 img.src = imgPath;
    //取得圖片的路徑，並且讀取後取得長寬資料
    img.onload = function(){   
      ctx.canvas.width = img.width;
      ctx.canvas.height = img.height ;
      try {
        draw(this,0,0);
      } catch (e) { // 2026 改：原本直接呼叫 draw(this,0,0);
        console.warn('[demo]', '讀不到圖片像素（圖片主機沒有開放 CORS），背景不換色', e.message);
      }
      //draw function
    };

  }

  function draw(imgObj,w,h){
    var x = 0, y = 0;
    var r=[],g=[],b=[];//準備空的R,G,B陣列
    ctx.drawImage(imgObj,x,y);
    //將圖片繪製在canvas上
    var imgData = ctx.getImageData(x, y, imgObj.width, imgObj.height);

    for(var i = 0; i < imgData.data.length; i += 4) {
        //製作原始R,G,B陣列
        // red
        r.push(imgData.data[i]);
        // green
        g.push(imgData.data[i + 1]);
        // blue
        b.push(imgData.data[i + 2]);
    }
    rgb = avg(r) + ',' + avg(g) + ',' + avg(b); //平均R,G,B顏色
    $('#album').css('background-color','rgba('+rgb+',1)'); //將顏色寫入背景
  }

  function avg(arguments) {
    //取得平均值，並且轉為整數
    var sum = 0;
    for (var i = 0, j = arguments.length; i < j; i++) {
        sum += arguments[i];
    }
    return Math.floor(sum / arguments.length);
  }
});
`
]

onMounted(() => runDemo(LIBS, CODE, { __loadCorsImage: loadCorsImage }))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
