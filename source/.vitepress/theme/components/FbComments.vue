<script setup lang="ts">
// FB 留言。留言框的 <div class="fb-comments"> 在 SSR 就輸出（audit 讀 dist HTML 比對 data-href），
// SDK 才是 client 端的部分：留言框接近畫面時才載入，設定照 Hexo 版
// themes/casper-2026/layout/comment/facebook.ejs 與 common/scripts.ejs（zh_TW、v18.0、同一個 appId）。
// data-href 用 frontmatter.fbHref 逐字，大小寫和尾斜線照舊，舊留言才看得到。
import { onBeforeUnmount, onMounted, ref } from 'vue'

defineProps<{ href: string }>()

const SDK_ID = 'facebook-jssdk'
const SDK_SRC = 'https://connect.facebook.net/zh_TW/sdk.js#xfbml=1&version=v18.0&appId=556473851118881'

const root = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function loadSdk() {
  observer?.disconnect()
  observer = null
  const fb = (window as Window & { FB?: { XFBML?: { parse(el?: Element): void } } }).FB
  if (document.getElementById(SDK_ID)) {
    // 整頁載入時不會走到這裡；保險起見，SDK 已經在時重新解析這一塊
    if (root.value) fb?.XFBML?.parse(root.value)
    return
  }
  const s = document.createElement('script')
  s.id = SDK_ID
  s.async = true
  s.defer = true
  s.crossOrigin = 'anonymous'
  s.src = SDK_SRC
  document.body.appendChild(s)
}

onMounted(() => {
  if (!root.value || !('IntersectionObserver' in window)) return loadSdk()
  observer = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) loadSdk()
  }, { rootMargin: '1200px 0px' })
  observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <section id="comments" ref="root" class="comments">
    <h2 class="section-title comments__title">留言</h2>
    <div id="fb-root"></div>
    <div class="comments__frame">
      <div class="fb-comments" :data-href="href" data-width="100%" data-numposts="5" data-order-by="reverse_time"></div>
    </div>
  </section>
</template>
