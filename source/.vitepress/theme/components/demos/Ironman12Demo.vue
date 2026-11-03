<script setup>
// 〈D3.js 利用Excel建立資料(CSV)〉/d3js/2014/10/11/Ironman-30-days-12/ 的示範。
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
dataPath = 'https://img.casper.tw/demoFile/d3data/'; //檔案路徑
dataFile = 'd3demoData141011.csv'; //檔名
dataUrl = dataPath + dataFile; //路徑加檔名
dataUrl = __d3demoCsv; // 2026 改：改讀內嵌的同一份 CSV，原因見元件開頭的說明
//定義SVG的大小
d3.csv(dataUrl, function(data){
	console.table(data); //用table的方式在console呈現json
	d3.select('.demo').text(JSON.stringify(data)) //把json寫到.demo上
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
