<script setup>
// 〈鐵人賽：ES6 原生 Fetch 遠端資料方法〉/javascript/2017/12/28/javascript-fetch/ 的示範。
// 原本寫在文章裡的 <script>：用 fetch 取得 Unsplash 的圖片，轉成 blob 網址後插進 .newImg。
// 程式碼本來就是 ES6 寫法，這裡照原文放進 onMounted 執行（images.unsplash.com 有開 CORS）。
// 原文沒有處理失敗；這裡補一個 catch，圖片抓不到（離線、被擋、網址失效）時只在 console 留 warning，
// 跟其他示範的「[demo] 載入失敗」一樣，不留下未處理的 Promise rejection。
import { onMounted } from 'vue'

onMounted(() => {
  // unsplash 上的圖片
  let url = 'https://images.unsplash.com/photo-1513313778780-9ae4807465f0?auto=format&fit=crop&w=634&q=80'
  fetch(url)
    .then((response) => {
      return response.blob();
    })
    .then((imageBlob) => {
      let img = document.createElement('IMG')
      document.querySelector('.newImg').appendChild(img);
      // 將 blog 物件轉為 url
      img.src = URL.createObjectURL(imageBlob);
    })
    .catch((e) => console.warn('[demo]', `載入失敗：${url}`, e.message))
})
</script>

<!-- 不輸出元素，只留一個註解節點。空的 <template> 在 SSR 什麼都不輸出，瀏覽器端卻是一個註解節點，hydration 會對不上 -->
<template><span v-if="false" /></template>
