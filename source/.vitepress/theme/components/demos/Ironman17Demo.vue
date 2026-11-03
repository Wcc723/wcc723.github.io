<script setup>
// 〈D3.js 究竟搭不搭捷運與死亡率有沒有關係？(2) - Google 試算表〉/d3js/2014/10/16/Ironman-30-days-17/ 的示範。
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
$(function(){
	var shPath = 'https://spreadsheets.google.com/feeds/list/',
	shKey = '1hX3lqWLHFuwYiQeaBL0WevleUEOBAPKzshj2fJHogsM',
	shCallback = '/public/values?alt=json-in-script&callback=?',
	shList = 'ol1cvs7'
	var dataset = []
	__sheetFeed( shKey, shList ) // 2026 改：原本是 $.getJSON( shPath + shKey + '/' + shList + shCallback)
	.done(function (data) {	 //如果成功
		var entry = data.feed.entry //只取feed entry的部分
		var title = data.feed.title.$t
		dataset.push({
			'title': title,
			'data': entry
		}); //送回dataset
		console.log(dataset)
		$('.demo .log').text('success:' + dataset[0].title  + ',' + dataset[0].data[5].gsx$time.$t)

	})
	.fail(function(jqxhr, textStatus, error){
		$('.demo .log').text('GG,沒戲唱了'); //失敗
	});
});
`
]

onMounted(() => runDemo(LIBS, CODE, { __sheetFeed: sheetFeed }))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
