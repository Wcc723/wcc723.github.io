<script setup>
// 〈D3.js Transition動態效果〉/d3js/2014/10/20/Ironman-30-days-21/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.3.10。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['d3@3.3.10']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
var w = 600,h = 400,padding = 30;

var dataset = []; //產生空的陣列
var numDataPoints = 100; //最大點的數量是100
var xRange = Math.random() * 1000;
var yRange = Math.random() * 1000; //隨機範圍最大值都是1000
for (var i = 0; i < numDataPoints; i++){
	var num1 = Math.floor(Math.random() * xRange);
	var num2 = Math.floor(Math.random() * yRange);
	dataset.push([num1,num2]) //運算出新的值，並加到dataset
}


var Xmax = d3.max(dataset, function(d){return d[0]}),
	Xmin = d3.min(dataset, function(d){return d[0]}),
	Ymax = d3.max(dataset, function(d){return d[1]}),
	Ymin = d3.min(dataset, function(d){return d[1]}); //計算最大值

var xScale = d3.scale.linear() //線性尺度
			.domain([0, Xmax]) //輸入值
			.range([padding , w - padding]) //輸出值
			.nice() //取最適合數值

var yScale = d3.scale.linear()
			.domain([0, Ymax])
			.range([ h - padding ,padding])
			.nice()




var svg = d3.select('.demo').append('svg').attr({'width': w,'height': h})

//裁切區域
svg.append('clipPath') //新增svg裁切區域
	.attr('id', 'chart-area') //定義id
	.append('rect')	//再增加一個矩型
	.attr({
		'x': padding,
		'y': padding,
		'width': w - padding * 2,
		'height': h - padding * 2
	})

	svg.append('g')
		.attr('clip-path', 'url(#chart-area)') //套用裁切區域
		.selectAll('circle')
		.data(dataset).enter() //輸入資料
		.append('circle') //加入圓
		.attr({
			'cx': function(d){return xScale(d[0])}, //用x尺度算出cx位置
			'cy': function(d){return yScale(d[1])}, //用y尺度算出cy位置
			'r': '3px'
		});

//Axis
var xAxis = d3.svg.axis().scale(xScale) //用x尺度製作x軸線
	.orient("bottom") //標示位置
	.ticks(6) //尺度數量

var yAxis = d3.svg.axis().scale(yScale)
	.orient("left") //標示位置
	.ticks(6) //尺度數量


svg.append('g').attr('class', 'x axis') //定義尺度樣式
	.attr('transform', 'translate(0, '+ (h - padding) +')') //移動到下方
	.call(xAxis) //套用x軸線


svg.append('g').attr('class', 'y axis')
	.attr('transform', 'translate('+ (padding) +')', 0)
	.call(yAxis)




//轉場時的code，其實有許多是和原本相同
//如果有興趣的可以先全部讀完，再重新製作一次
d3.select('.btn').on('click', function(){ //每次點擊的時候
	dataset = []; //將陣列清空
	var xRange = Math.random() * 1000;
	var yRange = Math.random() * 1000;
	for (var i = 0; i < numDataPoints; i++){
		var num1 = Math.floor(Math.random() * xRange);
		var num2 = Math.floor(Math.random() * yRange);
		dataset.push([num1,num2])
	} //這段和前面一樣，YA

	var Xmax = d3.max(dataset, function(d){return d[0]}),
		Xmin = d3.min(dataset, function(d){return d[0]}),
		Ymax = d3.max(dataset, function(d){return d[1]}),
		Ymin = d3.min(dataset, function(d){return d[1]}); //一樣

	var xScale = d3.scale.linear() //由於尺度有重新計算，所以必須再跑一次
			.domain([0, Xmax])
			.range([padding , w - padding])
			.nice() //取整數

	var yScale = d3.scale.linear()
			.domain([0, Ymax])
			.range([ h - padding ,padding])
			.nice()

	svg.selectAll('circle').data(dataset)
		// .enter() //這不需要再加入
		// .append('circle') //這也不需要
		.transition() //套用動態效果
		.duration(250) //動態持續時間
		.each('start', function(){ //過場開始執行
			d3.select(this)
				.attr('fill', 'DeepPink')
				.attr('r', 2)
		})
		.transition() //套用動態效果
		.duration(1000) //第二段時間
		.attr({
			'cx': function(d){return xScale(d[0])},
			'cy': function(d){return yScale(d[1])},
			'r': '3px',
			'fill': 'black',
			'r': 5
		});

	// 更新Axis
	var xAxis = d3.svg.axis().scale(xScale)
		.orient("bottom") //標示位置
		.ticks(6) //尺度數量

	var yAxis = d3.svg.axis().scale(yScale)
		.orient("left") //標示位置
		.ticks(6) //尺度數量


	svg.select('.x.axis')
		.transition() //動態尺度
		.duration(1000)
		.call(xAxis);

	svg.select('.y.axis')
		.transition()
		.duration(1000)
		.call(yAxis);

});
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
