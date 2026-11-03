<script setup>
// 〈D3.js 國慶日在家裡畫長條圖〉/d3js/2014/10/10/Ironman-30-days-11/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.3.10。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['d3@3.3.10']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
	var w = 600,h = 250,padding = 30, barMargin = 2;
	//定義SVG的大小，但是只要定義直條的間距就好，寬度用算的就好

	var dataset = [];
	for (var i=0; i < 20; i++){
		var Num1 = 5 + Math.floor(Math.random() * 255);
		dataset.push(Num1);
	};
	console.log(dataset);
	//和先前一樣，產生一組隨機的資料

	var Ymax = d3.max(dataset, function(d){return d}),
		Ymin = d3.min(dataset, function(d){return d})
	//這個函示可以取得資料的最大值、最小值

	var xScale = d3.scale.linear() //產生一個屬於X軸的線性尺度
					.domain([0, dataset.length]) //傳入的值改為資料的數量
					.range([padding , w - padding])
					//輸出的範圍是左邊的padd距離，到右邊的padding

	var yScale = d3.scale.linear()
					.domain([Ymin, Ymax])
					.range([padding, h - padding])
					//類似X軸的尺度

	var barWidth = (w - padding*2) / dataset.length - barMargin;
	//算出每一個bar的寬度

	var svg = d3.select('.demo').append('svg').attr({'width': w,'height': h})
		//接下來開始產生SVG

		svg.selectAll('rect').data(dataset).enter() //和先前一樣，選取'circle'並把資料加入
		.append('rect') // 增加圓到SVG內
		.attr({	//加入屬性到圓
			'x': function(d, i){return xScale(i)}, //利用尺度算出X的位置
			'y': function(d){return h - yScale(d)}, //同理算出Y，但是要放在底部，所以要y-yScale(d)
			'width': barWidth, //bar的寬度
			'height':function(d){return yScale(d)}, //高度算法與Y相同
			'fill': function(d){
				var color = 0.2 + d * 0.002;
				return  d3.hsl(200 ,color, color);
			}
			//顏色的function hsl，可以將顏色算出後轉成色碼
			//格式 (360色相, 1彩度, 1明度)
		});

		svg.selectAll('text').data(dataset).enter() //補上資料數值
		.append('text')
		.text(function(d){ return d}) //將值寫到SVG上
		.attr({
			'x': function(d, i){return xScale(i) + barWidth/2},
			//和上面相同，算出X、Y的位置
			'y': function(d){return h - yScale(d) + 15}, //數值放在bar 內
			'fill': 'white', //文字填滿為白色
			'text-anchor': 'middle', //文字置中
			'font-size': '10px' //Fill、font-size也可以用CSS寫喔～
		});
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
