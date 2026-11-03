<script setup>
// 〈D3.js 軸線(Axis)〉/d3js/2014/10/13/Ironman-30-days-14/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.3.10。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['d3@3.3.10']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
var w = 600,h = 400,padding = 30;

//random data
var dataset = [];
var numDataPoints = 100; //總共100個點
var xRange = Math.random() * 500;
var yRange = Math.random() * 1000;
for (var i = 0; i < numDataPoints; i++){
	var num1 = Math.floor(Math.random() * xRange);
	var num2 = Math.floor(Math.random() * yRange);
	dataset.push([num1,num2])
}//和更早之前一樣，我們用假的資料來做範例
console.table(dataset)


var Xmax = d3.max(dataset, function(d){return d[0]}),
	Xmin = d3.min(dataset, function(d){return d[0]}),
	Ymax = d3.max(dataset, function(d){return d[1]}),
	Ymin = d3.min(dataset, function(d){return d[1]})
	//取得X,Y的最大及最小值

var xScale = d3.scale.linear() //製作線性尺度
	.domain([0, Xmax]) //輸入的範圍
	.range([padding , w - padding]) //輸出的範圍


var yScale = d3.scale.linear()
	.domain([0, Ymax])
	.range([ h - padding ,padding])




var svg = d3.select('.demo').append('svg').attr({'width': w,'height': h}) //增加SVG容器

	svg.selectAll('circle').data(dataset).enter() //插入資料
	.append('circle') //增加圓形物件
	.attr({
		'cx': function(d){return xScale(d[0])}, //利用尺度算出圓心x位置
		'cy': function(d){return yScale(d[1])}, //同上算出y
		'r': '2px', //圓心大小
		'fill': 'black' //填色
	});

	svg.selectAll('text').data(dataset).enter() //插入資料
	.append('text') //增加文字區塊
	.text(function(d){ return d[0]+ ',' + d[1]}) //補上坐標文字
	.attr({
		'x': function(d){return xScale(d[0])},
		'y': function(d){return yScale(d[1])},
		'fill': 'red', //填滿紅色
		'font-size': '10px' //文字大小
	});

//Axis
var xAxis = d3.svg.axis().scale(xScale) //增加軸線物件，並套用尺度(x)
	.orient("bottom") //標示位置
	.ticks(6) //刻度數量

var yAxis = d3.svg.axis().scale(yScale) //增加軸線物件，並套用尺度(y)
	.orient("left") //標示位置
	.ticks(10) //刻度數量

//刻度化標籤，這範例不使用
// var formatAsAxis = d3.format('.1%');
// xAxis.tickFormat(formatAsAxis);
//刻度化標籤


svg.append('g').attr('class', 'axis') //增加一個群組並加上class="axis"
	.attr('transform', 'translate(0, '+ (h - padding) +')') //移動到下方
	.call(xAxis); //將軸線匯入

svg.append('g').attr('class', 'axis')
	.attr('transform', 'translate('+ (padding) +')', 0) //移動到左方
	.call(yAxis);
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
