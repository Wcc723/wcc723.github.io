<script setup lang="ts">
// ⌘K 搜尋鈕：從 components/SiteHeader.vue 拆出來（主站首頁規格 G.3），S 版放進共用頁首的 actions 插槽。
// 字由呼叫端傳（S 版用外殼字串：沒有工具時是 search.openPosts「搜尋文章」，有工具後是 search.open），快捷鍵提示跟現在的頁首相同。
// P1 只建檔，沒有任何地方 import，legacy 頁首照舊用自己的那份，所以不進建置。
import { onMounted, ref } from 'vue'
import { useSearch } from '../composables/search'

defineProps<{ label: string }>()
const { openSearch } = useSearch()

// SSR 一律輸出 ⌘K，掛載後不是蘋果裝置才改成 Ctrl K
const shortcut = ref('⌘K')
onMounted(() => {
  const ua = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || navigator.userAgent
  if (!/mac|iphone|ipad|ipod/i.test(ua)) shortcut.value = 'Ctrl K'
})
</script>

<template>
  <button type="button" class="search-btn" :aria-label="label" aria-keyshortcuts="Meta+K Control+K" @click="openSearch">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
    <span class="search-btn__label" aria-hidden="true">{{ label }}</span>
    <kbd aria-hidden="true">{{ shortcut }}</kbd>
  </button>
</template>
