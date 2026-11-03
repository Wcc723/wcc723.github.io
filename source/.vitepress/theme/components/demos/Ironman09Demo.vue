<script setup>
// 〈D3js 將資料投影到SVG上〉/d3js/2014/10/08/Ironman-30-days-09/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.3.10。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['d3@3.3.10']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
var w = 600;
var h = 250;

var dataset = [];
for (var i=0; i < 20; i++){
	var Num1 = 5 + Math.floor(Math.random() * 480); //產生第一個數值
	var Num2 = 5 + Math.floor(Math.random() * 230); //產生第二個數值
	dataset.push([Num1, Num2]); //兩個合併成一個陣列
};
console.log(dataset); //檢查看看有沒有怪怪的

var svg = d3.select('.demo').append('svg').attr({'width': w,'height': h})
//產生一個SVG

svg.selectAll('circle').data(dataset).enter() //記得喔 data(dataset).enter() 把資料放入
.append('circle')
.attr({
	'cx': function(d){return d[0] + 10}, //定義圓心的x，在第一個值
	'cy': function(d){return d[1] + 10}, //定義圓心的y，在第二個值
	'r': function(d){return Math.sqrt(h - d[1])}, //圓心的半徑，第二個值開平方
	'fill': function(d){return d3.hsl(d[0] % 360, .6, .6 );}
	//介紹一個顏色的function hsl，可以將顏色算出後轉成色碼
	//格式 (360色相, 1彩度, 1明度)
});

svg.selectAll('text').data(dataset).enter() //補上資料數值
.append('text')
.text(function(d){ return d[0]+ ',' + d[1]}) //將值寫到SVG上
.attr({
	'x': function(d){return d[0] + 10}, //和上面相同，算出X、Y的位置
	'y': function(d){return d[1] + 10},
	'fill': 'red', //文字填滿為紅色
	'font-size': '10px' //Fill、font-size也可以用CSS寫喔～
});
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
