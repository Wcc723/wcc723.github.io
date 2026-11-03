<script setup>
// 〈D3.js 圈圈小效果〉/d3js/2014/10/18/Ironman-30-days-19/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.3.10。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['d3@3.3.10']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
var	width = 600,
	height = 500;

var i = 0; //場上圓圈的數量，預設是0

var svg = d3.select('.demo').append('svg') //插入SVG
		.attr('width', width)
		.attr('height', height);

svg.append('rect').attr('width', width)
	.attr('height', height)
	.on('ontouchstart' in document ? 'touchmove' : 'mousemove', particle);
	//偵測是滑鼠還是觸控事件


function particle(){
	var m = d3.mouse(this)
	//m是陣列，只有x,y 坐標

	svg.insert('circle', 'rect') //在rect內新增circle
		.attr('cx', m[0])//滑鼠x坐標
		.attr('cy', m[1])//滑鼠y坐標
		.attr('r', 1e-6) //(0.000001 ,科學計算法)
		.style('stroke', d3.hsl((i = (i+1) % 360), 1, .5))
		//(i = (i+1) % 360) 取餘數
		.style('stroke-opacity', 1) //一開始是不透明
		.transition() //轉場效果
		.duration(2000) //動畫轉場時間2秒
		.ease(Math.sqrt) //取得平方根，不懂在這邊有什麼意義
		.attr('r', 100) //不斷放大
		.style('stroke-opacity', 1e-6) //轉變成半透明
		.remove(); //時間到後移除物件

	d3.event.preventDefault();	//移除預設事件
}
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
