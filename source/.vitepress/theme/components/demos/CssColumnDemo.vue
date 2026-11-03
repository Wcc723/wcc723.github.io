<script setup>
// 〈CSS column 教學〉/css/2015/07/23/css-column/ 的示範。
// 原本寫在文章裡的 <script>，這裡照原樣保留，掛載後先載入函式庫，再當成一般 script 依序執行（Embed.vue 的 runDemo）。
// Hexo 版沒有載入 jQuery，示範一直沒有作用，這裡載入 jQuery 3.7.1。
// 程式碼只多一行：breakColumnProps 的空字串在 jQuery 3 會讓 $('#') 丟錯，改成跳過（見程式碼裡標 2026 改的那一行）。
import { onMounted } from 'vue'
import { runDemo } from './Embed.vue'

const LIBS = ['jquery']

// 原本的程式碼，一段是一個 <script>
const CODE = [
String.raw`
$(document).ready(function(){
  var column = 'column-count';
  var columnProps = ['column-count',
                     'column-width',
                     'column-gap',
                     'column-rule-width',
                     'column-rule-style',
                     'column-rule-color',

                    ];
  var h3columnProps = 'column-span';
  var columnBreakInside = 'column-break-inside';
  var breakColumnProps = [
                     '',
                     'column-break-before',
                     'column-break-after'
                    ];
  $.each(columnProps, function(i, prop){
    console.log($('#'+prop));
    $('#'+prop).on('change', function(){
      console.log('a');
      var val = $(this).val();
      $('.column-demo').css(prop, val);
    });
  });
  $.each(breakColumnProps, function(i, prop){
    if (!prop) return; // 2026 改：清單第一個是空字串，jQuery 1.x 的 $('#') 回傳空集合，jQuery 3 會丟錯中斷後面的綁定，所以跳過
    console.log($('#'+prop));
    $('#'+prop).on('change', function(){
      console.log('a');
      var val = $(this).val();
      $('.columnBreak').css(prop, val);
    });
  });
  $('#'+columnBreakInside).on('change', function(){
    console.log('a');
    var val = $(this).val();
    $('.column-demo p').css(columnBreakInside, val);
  });
  $('#'+h3columnProps).on('change', function(){
    console.log('a');
    var val = $(this).val();
    $('.column-demo h3').css(h3columnProps, val);
  });
});
`
]

onMounted(() => runDemo(LIBS, CODE))
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
