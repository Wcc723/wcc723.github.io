<script setup>
// 〈試試看Canvas (2)，調整Canvas圖片色調〉/canvas/2014/12/08/html5-canvas-02/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有載入 jQuery，這裡載入 jQuery 3.7.1。
// 原本的圖片路徑 /images/2013-winter/cd2.jpg 已經搬到 img.casper.tw，網址跟著改。
// canvas 要讀圖片的像素（getImageData），圖片放在 img.casper.tw，跨網域要用 CORS 載入。
// 載圖那一行改呼叫 __loadCorsImage（Embed.vue 的 loadCorsImage）：img.casper.tw 還沒開放 CORS 時圖照樣畫得出來，但讀像素的效果要等開放以後才看得到。
import { onMounted } from 'vue'
import { runDemo, loadCorsImage } from './Embed.vue'

const LIBS = ['jquery']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
var _canvas = document.getElementById('canvas');
var ctx = _canvas.getContext('2d');
//建立canvas物件

var img = new Image();
img.onload = function(){   
  ctx.canvas.width = img.width
  ctx.canvas.height = img.height    
  draw(this,0,0);
  //draw function
};
__loadCorsImage(img, 'https://img.casper.tw/images/2013-winter/cd2.jpg'); // 2026 改：原本是 img.src = '/images/2013-winter/cd2.jpg';
//圖片載入的事件(與上次同)

function draw(imgObj,w,h){
var x = 0;
var y = 0;
//先定義圖片的x,p坐標位置
ctx.drawImage(imgObj,x,y);
//將原始的圖片匯入

var imgData = ctx.getImageData(x, y, imgObj.width, imgObj.height);
//取得canvas物件的資訊(需要完整的坐標及範圍)
var data = imgData.data;
//再將資訊轉存出來

console.log(data);
//這時候用console.log(data)，就可以看到RGB的值

for(var i = 0; i < data.length; i += 4) {
  //利用回圈將顏色全部替換
    // red
    data[i] = 255 - data[i];
    // green
    data[i + 1] = 255 - data[i + 1];
    // blue
    data[i + 2] = 255 - data[i + 2];
  }
  ctx.putImageData(imgData,0,0)
  //重新將新的影像資訊覆蓋上去
}
`,
String.raw`
var _canvas2 = document.getElementById('canvas2');
var ctx2 = _canvas2.getContext('2d');
var _colorR = $('#colorR').val();
var _colorG = $('#colorG').val();
var _colorB = $('#colorB').val();
var x = 0;
var y = 0;

var img2 = new Image();
img2.onload = function(){   
  ctx2.canvas.width = img2.width
  ctx2.canvas.height = img2.height    
  draw2(this,0,0);
};
__loadCorsImage(img2, 'https://img.casper.tw/images/2013-winter/cd2.jpg'); // 2026 改：原本是 img2.src = '/images/2013-winter/cd2.jpg';
//以上和上次接近，只是將幾個不太會改變的變數改成全域變數

$('.color').on('change','input',function(){
//多一個on change的function，去監控這次加入的input
//只要他改變，就會執行這個function

  _colorR = $('#colorR').val()
  _colorG = $('#colorG').val()
  _colorB = $('#colorB').val()
  //重新取得input的 RGB的值
  imgObj = img2;
  draw2(imgObj);
});

function draw2(imgObj,w,h){  
  ctx2.drawImage(imgObj,x,y);  
  var imgData = ctx2.getImageData(x, y, imgObj.width, imgObj.height);    
  var data = imgData.data;
  for(var i = 0; i < data.length; i += 4) {
    // 這邊以下將會套用新的RGB色彩
    // red
    data[i] = _colorR - (255 - data[i]);
    // green
    data[i + 1] = _colorG - (255 - data[i + 1]);
    // blue
    data[i + 2] = _colorB - (255 -data[i + 2]);
  }
  ctx2.putImageData(imgData,0,0)
}
`
]

onMounted(() => runDemo(LIBS, CODE, { __loadCorsImage: loadCorsImage }))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
