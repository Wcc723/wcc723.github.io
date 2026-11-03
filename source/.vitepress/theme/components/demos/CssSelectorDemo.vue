<script setup>
// 〈CSS 選取器(基本篇) - CSS Selector〉/development/2021/09/11/css-selector/ 文末的「CSS Selector 實戰練習」。
// 原本寫在文章 HTML 區塊裡的 <script>（Vue 會把它丟掉），程式碼照原文放進 onMounted 執行；
// 被選到的元素加上 .outline，樣式在文章的 <style scoped> 裡。
import { onMounted } from 'vue'

onMounted(() => {
  const selectorPractice = document.querySelector('#selectorPractice');
  const preBlock = document.querySelector('#preBlock');
  let preDom = [];
  selectorPractice.addEventListener('keyup', selectorFn);
  function selectorFn() {
    const value = selectorPractice.value;
    const selectDom = document.querySelectorAll(`#demo ${value}`);
    preBlock.textContent = `document.querySelectorAll(${value});`;
    if (selectDom) {
      if (preDom) {
        console.log(preDom);
        preDom.forEach(element => {
          element.classList.remove('outline');
        })
      }
      selectDom.forEach(element => {
        element.classList.add('outline');
      });
      preDom = selectDom;
    }
  }
  selectorFn();
})
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
