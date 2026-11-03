<script setup lang="ts">
// 深淺色切換：在 <html> 加或拿掉 .dark，寫進 localStorage 的 casper-theme（跟 Hexo 版同一個 key）。
// 兩個圖示都輸出，由 CSS 依 html.dark 決定顯示哪一個；aria-pressed 掛載後才讀實際狀態。
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { THEME_STORAGE_KEY } from '../head.mjs'

const dark = ref(false)

function apply(next: boolean) {
  document.documentElement.classList.toggle('dark', next)
  dark.value = next
}

function toggle() {
  const next = !document.documentElement.classList.contains('dark')
  apply(next)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light')
  } catch {
    // 隱私模式或停用 storage：這一頁照樣切換，只是不記住
  }
}

// 別的分頁（或同源的工具）改了設定時跟著換
function onStorage(e: StorageEvent) {
  if (e.key === THEME_STORAGE_KEY) apply(e.newValue === 'dark')
}

onMounted(() => {
  dark.value = document.documentElement.classList.contains('dark')
  window.addEventListener('storage', onStorage)
})
onBeforeUnmount(() => window.removeEventListener('storage', onStorage))
</script>

<template>
  <button
    type="button"
    class="icon-btn theme-toggle"
    aria-label="深色模式"
    title="切換深淺色"
    :aria-pressed="dark ? 'true' : 'false'"
    @click="toggle"
  >
    <svg class="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
    <svg class="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
    </svg>
  </button>
</template>
