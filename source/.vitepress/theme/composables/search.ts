import { ref } from 'vue'

// ⌘K 搜尋的開關狀態：頁首的搜尋鈕、首頁和 404 的搜尋按鈕、快捷鍵都改這一個值，SearchModal 依它顯示。
// 只在瀏覽器裡會變成 true，SSR 一律是 false，所以產物 HTML 裡沒有搜尋視窗。
const open = ref(false)
let opener: HTMLElement | null = null

export function useSearch() {
  return {
    open,
    openSearch(e?: Event) {
      opener = (e?.currentTarget as HTMLElement | null) ?? (document.activeElement as HTMLElement | null)
      open.value = true
    },
    closeSearch() {
      open.value = false
      // 關掉後把焦點還給打開它的按鈕
      const el = opener
      opener = null
      if (el && typeof el.focus === 'function') requestAnimationFrame(() => el.focus())
    }
  }
}
