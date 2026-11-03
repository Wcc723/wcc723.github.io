<script setup>
// 〈初入D3.js〉/d3js/2014/10/07/Ironman-30-days-08/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有輸出 front matter 的 jsvendor，d3 沒有載入，示範一直沒有作用；這裡載入 jsvendor 指定的 d3 3.3.10。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['d3@3.3.10']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
    var dataset = [];

	for (var i=0; i < 20; i++){
		var newNum = 5 + Math.floor(Math.random() * 30);
		dataset.push(newNum);
	}
	d3.select('.pre').text(dataset);

	d3.select('.demo').selectAll('div')
		.data(dataset) // D3 data computing
		.enter()
		.append('div')
		.attr('class','bar')
		.style('height', function(d){
			return (d*3)  + 'px'
		});

	console.log(d3.select('.demo').selectAll('div'))
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
