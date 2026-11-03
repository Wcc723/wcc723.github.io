<script setup>
// 〈D3.js 超粘的Voronoi Diagram繪圖〉/d3js/2014/10/19/Ironman-30-days-20/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.2.0。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['d3@3.2.0']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
var svgSize = {
		w : 600,
		h : 500
	}

	var hslValue = 3;

	var vertices = d3.range(60).map(function(d) {
		return [Math.random() * svgSize.w, Math.random() * svgSize.h];
		//產生100個坐標，位置是隨機的
	});

	console.log(vertices)

	var voronoi = d3.geom.voronoi() //套用voronoi，這段只有裁切區域
		.clipExtent([[0,0], [svgSize.w , svgSize.h]])
		//裁切voronoi區域

	var svg = d3.select('.demo').append('svg')
		.attr('width', svgSize.w)
		.attr('height', svgSize.h)
		.on('mousemove', function() {
			vertices[0] = d3.mouse(this);//殘忍地將第一個替換掉
			redraw();
			//將滑鼠的坐標帶入redraw
		})

	var path = svg.append('g').selectAll('path'); //等等要用path來畫間隔線

	svg.selectAll('circle')
		.data(vertices) //將剛剛產生的x,y插入
		.enter().append('circle') //補上原點的位置
		.attr('transform', function(d){ return 'translate(' + d + ')'; }) //位置坐標如資料
		.attr('r', 1.5) //大小是1.5px

	redraw()

	function redraw(){
		path = path.data(voronoi(vertices) , polygon)
		// voronoi(vertices) 會傳回path 所需要的路徑坐標
		// 然後用polygon function執行

		path.exit().remove();
		//如果多餘就移除

		path.enter().append('path')
			.attr('d', polygon) //調用下方的polygon函示
			.style('fill', function(d, i){ return d3.hsl((120 + i * hslValue % 360),.6,.6)})

		path.order(); //這段似乎有沒有都沒差...
	}

	function polygon(d) {
		console.log(d)
		return "M" + d.join("L") + "Z";
	}
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
