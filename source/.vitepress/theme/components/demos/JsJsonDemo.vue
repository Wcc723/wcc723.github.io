<script setup>
// 〈試試看Json〉/jquery/2013/11/01/js-json/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有載入 jQuery，示範一直沒有作用，這裡載入 jQuery 3.7.1。
// Flickr 的網址原本是 http，在 https 的頁面會被瀏覽器擋下，這裡改成 https（文章裡顯示的程式碼不變）。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['jquery']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
(function() {
  var flickerAPI = "https://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
  $.getJSON( flickerAPI, {
    tags: "mount rainier",
    tagmode: "any",
    format: "json"
  })
    .done(function( data ) {

      $.each( data.items, function( i, item ) {
        console.log(item)
        $( "<img>" ).attr( "src", item.media.m ).appendTo( "#images" );
        if ( i === 3 ) {
          return false;
        }
      });
    });
})();
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
