<script setup>
// 〈D3.js 究竟搭不搭捷運與死亡率有沒有關係？(3) - 將資料繪製成折線圖〉/d3js/2014/10/17/Ironman-30-days-18/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jQuery 3.7.1 與 jsvendor 指定的 d3 3.3.10。
// Google 試算表的舊版 feeds API 已經停用，原本的 $.getJSON 拿不到資料。
// 程式碼裡那一行改呼叫 __sheetFeed（Embed.vue 的 sheetFeed）：從同一份公開試算表讀 CSV，回傳跟舊 API 一樣形狀的資料，其餘照舊。
import { onMounted } from 'vue'
import { runDemo, sheetFeed } from './Embed.vue'

const LIBS = ['jquery','d3@3.3.10']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
$(function() {

var shPath = 'https://spreadsheets.google.com/feeds/list/',
	shKey = '1hX3lqWLHFuwYiQeaBL0WevleUEOBAPKzshj2fJHogsM',
	shCallback = '/public/values?alt=json-in-script&callback=?',
	shList = [
		{
			'listKey': 'od6',
		},{
			'listKey': 'ol1cvs7',
		}
		,{
			'listKey': 'objevh6',
		} //這部分是高雄縣市的合併資料
		]

var url = shPath + shKey + '/' + shList + shCallback; //合併路徑
var dataRemote = []; //建立空的陣列

//讀入每一個資料表
$.each(shList, function(i, list){
	__sheetFeed( shKey, list.listKey ) // 2026 改：原本是 $.getJSON( shPath + shKey + '/' + list.listKey + shCallback)
	.done(function (data) {	 //如果成功
		list.dataName = []
		var entry = data.feed.entry //只取feed entry的部分
		var title = data.feed.title.$t //資料頁的標題
		dataRemote.push({ //存回陣列
			'title': title,
			'data': entry
		}); //送回dataset
		jsonDone(); //執行驗證
	})
	.fail(function(jqxhr, textStatus, error){
		console.log('GG,沒戲唱了'); //失敗
	});

})


//驗證資料跑完沒
jsonDone = function(){
	if (shList.length != dataRemote.length){
		console.log('快好了'); //驗證未完成
	} else if (shList.length == dataRemote.length){
		console.log('好了', dataRemote); //驗證成功
		dataset = dataRemote
		runChart(); //繪製圖表
	}
};


//真的開始畫圖了
runChart = function(){

	var margin = {top: 60, right: 40, bottom: 50, left: 60};
	var w = 560 ; // 寬
	var h = 300 ; // 高

	console.log(dataset[0].data.length)

	datatime = []; //將時間存成陣列，作為Xscale用處
	$.each(dataset[0].data,function(i,d){
		datatime.push(d.gsx$time.$t)
	});
	var xScale = d3.scale.linear().domain([0,dataset[0].data.length]).range([0,w])

	var yScale = d3.scale.linear().domain([.2, .85]).range([h, 0]);
	//Y的Scale就不另外寫，先直接設定值

	// 增加一個line function，用來把資料轉為x, y
	var line = d3.svg.line()
		.x(function(d,i) {
			return xScale(i + 1); //利用尺度運算資料索引，傳回x的位置
		})
		.y(function(d) {
			return yScale(d.gsx$percent.$t); //利用尺度運算資料的值，傳回y的位置
		});

	//增加一個SVG元素
	var svg = d3.select('.demo').append('svg')
		.attr('width', w + margin.left + margin.right) //將左右補滿
		.attr('height', h + margin.top + margin.bottom) //上下補滿
		.append('g') //增加一個群組g
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// 增加x軸線，tickSize是軸線的垂直高度，-h會往上拉高
	var xAxis = d3.svg.axis().scale(xScale).ticks(5).orient('bottom').tickSize(-h).tickSubdivide(true);
	// SVG加入x軸線
	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + h + ')')
		.call(xAxis);


	// 建立y軸線，4個刻度，數字在左
	var yAxisLeft = d3.svg.axis().scale(yScale).ticks(4).orient('left');
	// SVG加入y軸線
	svg.append('g')
		.attr('class', 'y axis')
		.attr('transform', 'translate(0,0)')
		.call(yAxisLeft);

	$.each(dataset,function(i,d){
		svg.append('path').attr('d', line(d.data))
			.style({
				'stroke': d3.hsl((120 + 90*i), .6, .6),//d3.hsl是d3提供的顏色function
				'stroke-width':1,
			});//將每個資料繪製成折線，並且套用不同的色彩

		svg.append('g').selectAll('circle').data(d.data).enter() //增加原點
		.append('circle')
		.attr({
			'cx': function(d, i){return xScale(i + 1) },
			'cy': function(d){return yScale(d.gsx$percent.$t)}, //x,y算法都類似line function
			'r':'2px',
			'class': 'dot' //這圓點主要是要給hover使用的
		})
		.style({
			'fill': d3.hsl((120 + 90*i), .6, .6)//套用相同色彩
		})

		svg.append('g').append('text') //補上左上示意文字
			.text(d.title)
			.style({
				'fill': d3.hsl((120 + 90*i), .6, .6),
				'transform': 'translate(8px,'+ ((i * 15) + 12) //拉開間距
					+'px)',
				'font-size':'12px'
			})
	});

	showTips = function(id){ //這部分是要作為Hover用的資料
		date = dataset[0].data[id].gsx$time.$t //時間取其中一份的即可
		var html = ''
		$.each(dataset, function(i, dataset){ //將資料定義，並回傳
			title = dataset.title;
			percent = dataset.data[id].gsx$percent.$t;
			html = html + '<div><span>'+title+'</span>/<span> '+percent+'%</span></div>'
		});
		html = '<div>'+date+'</div>' + html;
		return html; //回傳整理好的html
	};

	svg.selectAll('.dot').on('mouseover', function(d){
	//d3 function，類似jquery，直接可以控制class
		var xPos = parseFloat(d3.select(this).attr('cx')) + margin.left //截取點的位置
		var yPos = parseFloat(d3.select(this).attr('cy')) + margin.top
		//這一個目標(d)，裡面也包含了資料，所以d.gsx$id可以抓到這個點所包含的資料
		var id = d.gsx$id.$t - 1 //抓取資料id

		d3.select('#tooltip') //將div抓來用
			.style({
				'left': xPos + 'px',
				'top': yPos + 'px'
			})
			.classed('hidden', false) //移除隱藏的class
			.html(showTips(id)) //將剛剛的showTips function帶入
	}).on('mouseout', function(d){ //如果移出的話
		d3.select('#tooltip').classed('hidden', true); //補回剛剛的Class
	});




}

});
`
]

onMounted(() => runDemo(LIBS, CODE, { __sheetFeed: sheetFeed }))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
