<script setup>
// 〈Jquery 重複click判斷〉/jquery/2014/03/01/jquery-repeat-click/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有載入 jQuery；原本的 <script> 又寫在按鈕前面，執行當下還找不到 .d0818click。
// 這裡載入 jQuery 3.7.1，等文章掛載完才執行，點擊才有作用。方塊的樣式來自 front matter 的 cssdemo（2013-summer）。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['jquery']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
$('.d0818click').click(function(evt) {
	evt.preventDefault();
    $('.old').animate({left: '+=10'});
    $('.new').is(':animated') || $('.new').animate({left: '+=10'});
});
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
