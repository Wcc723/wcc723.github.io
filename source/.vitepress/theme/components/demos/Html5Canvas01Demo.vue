<script setup>
// 〈試試看Canvas〉/canvas/2014/12/04/html5-canvas-01/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// 四段 <script> 不需要函式庫，依原本的順序執行。
// 第一段原本用 getElementById('Canvas')，但前面的標題「#### Canvas」id 也是 Canvas（標題 id 照 Hexo 不能改），
// 拿到的是標題，結果跳出「your browser not support canvas」的 alert，第一個示範沒有畫出來；Hexo 版本來就是這樣。這裡改成只找 canvas 元素。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = []

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
var _canvas = document.querySelector('canvas#Canvas'); // 2026 改：原本是 document.getElementById('Canvas')
console.log(_canvas, '111');
if (_canvas.getContext) {
  var ctx = _canvas.getContext('2d');
  draw();
}else {
  alert('your browser not support canvas')
};

function draw(){
  ctx.fillStyle = "rgb(200,0,0)";
  ctx.fillRect (10, 10, 55, 50);

  ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  ctx.fillRect (30, 30, 55, 50);
}
`,
String.raw`
 var _canvas2 = document.getElementById('canvas2');

  if (_canvas2.getContext) {
    var ctx = canvas2.getContext('2d');
    draw2();
  }

function draw2(){
  ctx.fillStyle = "rgb(200,0,0)"; //正方形的填滿色彩
  ctx.fillRect (10, 10, 130, 130); //繪製一個填滿色彩的正方形
  ctx.clearRect(20, 20, 110, 110); //摟空一個正方形區域

  ctx.strokeStyle = "rgb(0,200,0)"; //正方形線段的色彩
  ctx.strokeRect(40, 40, 70, 70); //畫一個正方形線段
}
`,
String.raw`
 var _canvas3 = document.getElementById('canvasB');

  if (_canvas3.getContext) {
    var ctx = _canvas3.getContext('2d');
    draw3();
  }

function draw3(){
    ctx.beginPath(); //線段開始
    ctx.moveTo(20,100); //從20,100的點
    ctx.lineTo(130,100); //畫線段到130,100
    ctx.lineTo(75,25);
    ctx.fill(); //填滿
  }
`,
String.raw`
  var _canvas4 = document.getElementById('canvasC');


  if (_canvas4.getContext) {
    var ctx = _canvas4.getContext('2d');
    draw4();
  }  

  function draw4(){
    ctx.strokeStyle = "rgb(220,200,45)";
    ctx.beginPath();
    ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
    ctx.moveTo(110,75);
    ctx.arc(75,75,35,0,Math.PI,false);   // Mouth (clockwise)
    ctx.moveTo(65,65);
    ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
    ctx.moveTo(95,65);
    ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
    ctx.stroke();
  }
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
