<script setup>
// 〈試試看Canvas (3)，Canvas 小畫家〉/canvas/2014/12/09/html5-canvas-03/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有載入 jQuery，這裡載入 jQuery 3.7.1。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['jquery']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
  var _canvas = document.getElementById('canvas');
  var ctx = _canvas.getContext('2d');  

  $('.color input').change(function(){
    r = $('#red').val();
    g = $('#green').val();
    b = $('#blue').val();
    changeColor(r,g,b);
    //取出input中的數值
  });

  function changeColor(r,g,b){
    colors = {
      red : r,
      green : g,
      blue : b
    }
    $.each(colors, function(_color, _value) {
      $('#v'+_color).val(_value);
    });
    ctx.strokeStyle = "rgb("+r+","+g+","+b+")" ;
    //將顏色的值寫到ctx.strokeStyle即可
  };

  var x = 0;
  var y = 0;

  function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    //getBoundingClientRect 取得物件完整座標資訊，包含寬高等
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };   
    //這個function將會傳回滑鼠在 _canvas上的座標
  };

  function mouseMove(evt) {
    var mousePos = getMousePos(_canvas, evt);
    //透過getMousePos function 去取得滑鼠座標
    //mousePos 是一個物件，包含x和y的值
    ctx.lineTo(mousePos.x, mousePos.y);
    //利用取回的值畫線
    ctx.stroke();
    //畫!
  };

  canvas.addEventListener('mousedown', function(evt) {
    var mousePos = getMousePos(_canvas, evt);
    //從按下去就會執行第一次的座標取得
    evt.preventDefault();
    ctx.beginPath();
    //建立path物件
    ctx.moveTo(mousePos.x, mousePos.y);  
    //每次的點用moveTo去區別開，如果用lineTo會連在一起  
    canvas.addEventListener('mousemove', mouseMove, false);
    //mousemove的偵聽也在按下去的同時開啟
  });

  canvas.addEventListener('mouseup', function() {
    canvas.removeEventListener('mousemove', mouseMove, false);
  }, false);
  //如果滑鼠放開，將會停止mouseup的偵聽

  $('#save').on('click', function(){
    var _url = _canvas.toDataURL();
    //利用toDataURL() 把canvas轉成data:image
    this.href = _url;
    //再把href載入上面的Data:image
  });
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
