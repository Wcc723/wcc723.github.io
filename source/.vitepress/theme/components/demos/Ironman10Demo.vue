<script setup>
// 〈D3.js Scale 尺度〉/d3js/2014/10/09/Ironman-30-days-10/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.3.10。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['d3@3.3.10']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
var d3Scale = d3.scale.linear() //產生一個屬於X軸的線性尺度
		.domain([10, 990]) //傳入的值是原始資料的最小及最大值
		.range([0 , 100])
		//輸出的範圍是左邊的padd距離，到右邊的padding
console.log("輸出的值 = " + d3Scale(500))
`,
String.raw`
    var w = 600,h = 250,padding = 20;
	//定義SVG的大小

	var dataset = [];
	for (var i=0; i < 20; i++){
		var Num1 = 5 + Math.floor(Math.random() * 900);
		var Num2 = 5 + Math.floor(Math.random() * 220);
		dataset.push([Num1, Num2]);
	};
	console.log(dataset);
	//和先前一樣，產生一組隨機的資料

	var Xmax = d3.max(dataset, function(d){return d[0]}),
		Xmin = d3.min(dataset, function(d){return d[0]}),
		Ymax = d3.max(dataset, function(d){return d[1]}),
		Ymin = d3.min(dataset, function(d){return d[1]})
	//這個函示可以取得資料的最大值、最小值

	var xScale = d3.scale.linear() //產生一個屬於X軸的線性尺度
					.domain([Xmin, Xmax]) //傳入的值是原始資料的最小及最大值
					.range([padding , w - padding])
					//輸出的範圍是左邊的padd距離，到右邊的padding

	var yScale = d3.scale.linear()
					.domain([Ymin, Ymax])
					.range([ h - padding ,padding])
					//類似X軸的尺度

	var svg = d3.select('.demo').append('svg').attr({'width': w,'height': h})
		//接下來開始產生SVG

		svg.selectAll('circle').data(dataset).enter() //和先前一樣，選取'circle'並把資料加入
		.append('circle') // 增加圓到SVG內
		.attr({	//加入屬性到圓
			'cx': function(d){return xScale(d[0])}, //利用尺度算出X的位置
			'cy': function(d){return yScale(d[1])}, //同理算出Y
			'r': function(d){return Math.sqrt(h - d[1])}, //圓的大小是高 - Y值的平方
			'fill': function(d){return d3.hsl(d[0] % 360, .6, .6 );}
			//介紹一個顏色的function hsl，可以將顏色算出後轉成色碼
			//格式 (360色相, 1彩度, 1明度)
		});

		svg.selectAll('text').data(dataset).enter() //補上資料數值
		.append('text')
		.text(function(d){ return d[0]+ ',' + d[1]}) //將值寫到SVG上
		.attr({
			'x': function(d){return xScale(d[0])}, //和上面相同，算出X、Y的位置
			'y': function(d){return yScale(d[1])},
			'fill': 'red', //文字填滿為紅色
			'font-size': '10px' //Fill、font-size也可以用CSS寫喔～
		});
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
