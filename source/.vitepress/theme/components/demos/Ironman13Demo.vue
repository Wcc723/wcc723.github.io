<script setup>
// 〈D3.js 讀取CSV資料並繪製成長條圖〉/d3js/2014/10/12/Ironman-30-days-13/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.3.10。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

// 原本的 CSV 放在 img.casper.tw，那台主機沒有開放跨網域讀取（CORS），d3.csv 讀不到。
// 這裡內嵌同一份資料（原檔用舊 Mac 的 CR 換行，這裡改成 \n，解析結果相同），掛載時做成 blob 網址，
// 程式碼在原本組好 dataUrl 之後多一行改讀它。img.casper.tw 開放 CORS 以後，拿掉那一行就會改回讀原檔。
const CSV = [
  'name,value',
  'Tyler,234',
  'Boy,124',
  'Joe,357',
  'Alan,946',
  'Cristin,689',
  'Joshua,436',
  'Kathy,654',
  'Lucy,245',
  'Mickey,358',
  'Jeffery,421',
  'Alexander,526',
  'Hilton,313',
  'Sammy,134',
  'Shawn,367'
].join('\n')

const LIBS = ['d3@3.3.10']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
dataPath = 'https://img.casper.tw/demoFile/d3data/';
dataFile = 'd3demoData141011.csv';
dataUrl = dataPath + dataFile;
dataUrl = __d3demoCsv; // 2026 改：改讀內嵌的同一份 CSV，原因見元件開頭的說明
//定義SVG的大小
d3.csv(dataUrl, function(data){
	console.debug(JSON.stringify(data));
	dataset = data;

	var w = 600,h = 250,padding = 30, barMargin = 2;
	//定義寬高,padding等等值

	var Ymax = d3.max(dataset, function(d){return d.value}),
		Ymin = d3.min(dataset, function(d){return d.value});
		//取得Y軸的最大值

	var xScale = d3.scale.linear() //產生一個屬於X軸的線性尺度
		.domain([0, dataset.length]) //傳入的值是原始資料的最小及最大值
		.range([padding , w - padding])
		//輸出的範圍是左邊的padd距離，到右邊的padding

	var yScale = d3.scale.linear()
		.domain([Ymin, Ymax])
		.range([padding, h - padding])
		//類似X軸的尺度
	var yScale = d3.scale.linear()
		.domain([Ymin, Ymax])
		.range([padding, h - padding])
		//類似X軸的尺度

	var colorScale = d3.scale.linear()
		.domain([Ymin, Ymax])
		.range([0, 700])
		//這次顏色都要用尺度來算

	var barWidth = (w - padding*2) / dataset.length - barMargin;

	var svg = d3.select('.demo').append('svg').attr({'width': w,'height': h})
		//接下來開始產生SVG

	svg.selectAll('rect').data(dataset).enter() //和先前一樣，選取'circle'並把資料加入
	.append('rect') // 增加圓到SVG內
	.attr({	//加入屬性到圓
		'x': function(d, i){return xScale(i)}, //利用尺度算出X的位置
		'y': function(d){return h - yScale(d.value)}, //同理算出Y
		'width': barWidth,
		'height':function(d){return yScale(d.value)}, //同理算出Y
		// 'r': function(d){return Math.sqrt(h - d[1])}, //圓的大小是高 - Y值的平方
		'fill': function(d){
			var color = 0.2 + colorScale(d.value) * 0.001;
			return  d3.hsl(200 ,color, color); //利用尺度來算出顏色
		},
		'title': function(d){
			return 'Name : ' + d.name;
		}
		//介紹一個顏色的function hsl，可以將顏色算出後轉成色碼
		//格式 (360色相, 1彩度, 1明度)
	});

	svg.selectAll('text').data(dataset).enter() //補上資料數值
	.append('text')
	.text(function(d){ return d.value}) //將值寫到SVG上
	.attr({
		'x': function(d, i){return xScale(i) + barWidth/2}, //和上面相同，算出X、Y的位置
		'y': function(d){return h - yScale(d.value) + 15},
		'fill': 'white', //文字填滿為紅色
		'text-anchor': 'middle',
		'font-size': '10px' //Fill、font-size也可以用CSS寫喔～
	});

	svg.append('g').selectAll('text').data(dataset).enter() //這邊再多做一個人名顯示的區域
	.append('text')
	.text(function(d){ return d.name}) //寫入人名
	.attr({
		'x': function(d, i){return xScale(i) + barWidth/2}, //和上面相同，算出X、Y的位置
		'y': function(d){return h - yScale(d.value) - 10},
		'fill': 'SlateGray', //文字填滿為超漂亮灰色
		'text-anchor': 'middle',
		'font-size': '10px' //Fill、font-size也可以用CSS寫喔～
	});

});
`
]

onMounted(() => {
  const __d3demoCsv = URL.createObjectURL(new Blob([CSV], { type: 'text/csv' }))
  runDemo(LIBS, CODE, { __d3demoCsv })
})
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
