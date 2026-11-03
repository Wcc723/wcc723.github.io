<script setup lang="ts">
// 404：睡著的小幽靈（s-pose3）、H1「這頁找不到」、一句說明、⌘K 搜尋鈕、回首頁和文章分類（加上已上線的工具）。
// 沒有麵包屑；noindex、拿掉廣告 loader、404.html 的 title 與 description 由 lib/seo.mjs 處理。
import { onMounted } from 'vue'
import { liveTools } from '../tools.mjs'
import { NOT_FOUND_DESCRIPTION, NOT_FOUND_HEADING, NOT_FOUND_TITLE } from '../head.mjs'
import { useSearch } from '../composables/search'
import GhostImg from '../components/GhostImg.vue'

const { openSearch } = useSearch()
const tools = liveTools()

// VitePress 找不到路由時，瀏覽器端用內建的 notFoundPageData 把 title 改成「404 | 站名」、description 改成「Not Found」。
// 掛載後改回跟 404.html 相同的中文。只改 DOM，不改 page 資料：改 page 資料會讓 VitePress 重算 head，
// 把 transformHtml 拿掉的 AdSense loader 重新加回 <head>。
onMounted(() => {
  document.title = NOT_FOUND_TITLE
  document.querySelector('meta[name="description"]')?.setAttribute('content', NOT_FOUND_DESCRIPTION)
})
</script>

<template>
  <div class="wrap page-not-found">
    <div class="not-found">
      <GhostImg class="not-found__ghost" name="pose3" :width="180" eager />
      <h1 class="not-found__title">{{ NOT_FOUND_HEADING }}</h1>
      <p class="not-found__desc">{{ NOT_FOUND_DESCRIPTION }}</p>
      <button type="button" class="b3d-lite not-found__search" @click="openSearch">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        搜尋文章
      </button>
      <div class="not-found__actions">
        <a class="b3d" href="/">回首頁</a>
        <a class="b3d-lite" href="/categories/">文章分類</a>
        <a v-for="t in tools" :key="t.slug" class="b3d-lite" :href="`/${t.slug}/`">{{ t.name }}</a>
      </div>
    </div>
  </div>
</template>
