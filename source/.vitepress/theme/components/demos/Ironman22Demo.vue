<script setup>
// 〈D3.js 資料數量增減〉/d3js/2014/10/21/Ironman-30-days-22/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.2.0。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['d3@3.2.0']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
var dataset = [];
var numValues = 20; //一開始的資料數量是固定的

var randDataset = function(num){
	for (var i=0; i < num; i++){
		var newNum = 5 + Math.floor(Math.random() * 30);
		dataset.push({ key : i, value: newNum}); //產生一段陣列，包含key and value
	}
}//只要給予資料"數量"，就會產生隨機資料

var key = function(d) {
			return d.key;
		}

randDataset(numValues); //一開始預設的20筆資料

console.table(dataset); //打開console開結果

var originDataLength = dataset.length // 將原始的資料長度記錄

var h=200,w = 500, barMargin = 1;

maxDataset = d3.max(dataset, function(d){ return d.value }); //從value 取得最大值


var xScale = d3.scale.ordinal()
//不同於linear的尺度，可以處理非數字資料
	.domain(d3.range(dataset.length)) //這範例是給予資料的長度
	.rangeRoundBands([0, w], 0); //利用整體的寬度去做運算

var yScale = d3.scale.linear() //y尺度和先前是相同的，都是線性尺度
		.domain([0 , maxDataset]) //輸入值範圍
		.range([0, h]); //輸出值範圍

var svg = d3.select('.demo').append('svg').attr('width',w).attr('height', h); //建立svg

svg.selectAll('rect').data(dataset, key) //插入資料
	.enter().append('rect') //直條圖用rect~
	.attr({
		'x': function(d, i){
			return xScale(i); //利用尺度算出每個rect的x軸位置
		},
		'y': function(d){
			return h - yScale(d.value); //算出y的位置(因為需要置底)
		},
		'width': w / dataset.length - barMargin,
		//每個rect寬度是固定的，但需要補上間距
		'height': function(d){ return yScale(d.value)},
		//算出高度
		'fill': function(d){ return d3.hsl(320 + d.value  % 360 , .5 , .5)} //利用資料產生不同色彩
	});

var dataText = svg.selectAll('text').data(dataset, key).enter().append('text'); //補上文字
dataText.text(function(d){return d.value})
	.attr({
		'x': function(d,i){
			return xScale(i) + 11; //算出x位置
		},
		'y': function(d){ return (h - yScale(d.value) + 15)},
		//算出文字y的位置
		'fill': 'white', //文字反白
		'text-anchor': 'middle', //文字置中
		'font-size': '11px' //字小一點比較秀氣
	});



var chartFn = function(){ //這一段是在點擊後觸發的函式
	dataset = []; //資料清空
	var numValues = 1 + Math.floor(Math.random() * 30); //隨機長度的資料

	randDataset(numValues); //重新製作一組資料

	newDataLength = dataset.length // 儲存新的資料長度
	xScale.domain(d3.range(dataset.length))
	//資料長度不同，所以domain改變

	maxDataset = d3.max(dataset, function(d){ return d.value });
	yScale.domain([0 , maxDataset])
	//資料最大值不同，所以domain改變

	var bars = svg.selectAll("rect")
			.data(dataset, key); //重新套用資料

		var texts = svg.selectAll('text')
			.data(dataset, key);

		//檢查資料長度，如果比原本長就需要移除
	if (newDataLength > originDataLength){  //如果比原本長

		bars.enter().append('rect')
			.transition()
			.attr('x', w); //增加新的rect，以及進場的方式

		texts.enter().append('text').text(function(d){return d.value})
			.attr({
				'x': w,
				'y': function(d){ return (h - yScale(d.value) + 15)}
			}); //類似同上
		originDataLength = newDataLength; //儲存資料長度

	} else if (newDataLength < originDataLength){
		bars.exit() //選擇多餘的部分
		.transition() //退場方式
		//.duration(500)
		.attr('width', 0) //寬度降為0
		.remove() //清除物件

		texts.exit().transition().duration(500)
		.attr('width', 0)
		.remove() //清除文字物件

		originDataLength = newDataLength; //儲存資料長度
	}


		bars.transition()
			.delay(500) //延遲新的效果(等前方的進退場動畫結束)
			// 	.delay(function(d, i) {
		// 	return i / dataset.length * 1000;   
		// // 每個物件套用不同的delay 時間
		// })
			.duration(1500) // 持續時間(豪秒)
			.ease('elastic') // 動畫型態
 			.attr({ //這段同前
			'x': function(d, i){
				return xScale(i)
			},
			'y': function(d){
				return h - yScale(d.value)
			},
			'width': w / dataset.length - barMargin,
			'height': function(d){
				return yScale(d.value);
			},
			'fill': function(d){ return d3.hsl(320 + d.value  % 360 , .5 , .5)}
		})
 	texts.transition() //文字也是同前
			.delay(500)
			.duration(1500) // 持續時間(豪秒)
			.ease('elastic') // 動畫型態
			.attr({
			'x': function(d,i){
				//return i * (w  / dataset.length)
				return xScale(i) + 11
			},
			'y': function(d){ return (h - yScale(d.value) + 15)},
			'fill': 'white',
			'text-anchor': 'middle',
			'font-size': '11px'
		});


};

// 點擊button時，更新資料
d3.select('.update_btn').on('click', function(){
	chartFn();
});
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
