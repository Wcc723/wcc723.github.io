<script setup lang="ts">
// 首頁最下面的關於條：大頭照、自我介紹、「關於我」、揮手的小幽靈。從 HomePage.vue 拆出來，輸出跟拆之前逐字相同。
// 拆開的理由：工具區（HomeTools）要排在它前面，HomePage 用 v-if / v-else 二選一，沒有工具時只輸出這一段，不多一個註解節點（P1 的 HTML 不變）。
import GhostImg from './GhostImg.vue'

defineProps<{ withTools: boolean }>()
</script>

<template>
  <section class="about-strip" aria-label="關於卡斯伯">
    <img class="about-strip__avatar" src="/img/casper-avatar.webp" alt="卡斯伯的大頭照" width="72" height="72" loading="lazy" decoding="async" />
    <div class="about-strip__text">
      <p class="about-strip__title">嗨，我是卡斯伯</p>
      <p class="about-strip__desc">六角學院共同創辦人，著有《JavaScript 面試力》。這裡放我寫的前端筆記{{ withTools ? '和自己會用的小工具' : '' }}。</p>
    </div>
    <a class="b3d-lite" href="/about/">關於我</a>
    <GhostImg class="about-strip__ghost" name="wave" :width="104" />
  </section>
</template>
