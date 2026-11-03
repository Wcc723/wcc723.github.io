<script setup>
// 〈純 CSS 毛玻璃特效 - backdrop-filter 屬性介紹〉/development/2020/10/12/frosted-glass/ 文末的特效選單。
// 原本寫在文章 HTML 區塊裡的 <script>（Vue 會把它丟掉），程式碼照原文放進 onMounted 執行。
import { onMounted } from 'vue'

onMounted(() => {
  const customBackdrop = document.querySelector('#custom-backdrop');
  const backdropSelect = document.querySelector('#backdrop-filter');
  const backdropText = document.querySelector('#backdrop-text')
  let backdrop = '';
  backdropSelect.addEventListener('change', function() {
    const style = this.value;
    console.log(style);
    customBackdrop.style.backdropFilter = style;
    backdropText.innerText = style;
  });
})
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
