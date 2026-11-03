<script setup lang="ts">
// 頁首 64px：站徽和字標、主選單（工具 0 支時不輸出「工具」）、⌘K 搜尋鈕、深淺色切換
import { computed, onMounted, ref } from 'vue'
import { useData } from 'vitepress'
import { SITE_NAME, SITE_NAME_EN } from '../shared/shell/site.mjs'
import { headerLinks } from '../utils/nav.mjs'
import { liveTools } from '../tools.mjs'
import { useSearch } from '../composables/search'
import GhostImg from './GhostImg.vue'
import ThemeToggle from './ThemeToggle.vue'

const props = defineProps<{ pageType: string }>()
const { frontmatter } = useData()
const { openSearch } = useSearch()

const links = computed(() => headerLinks({ tools: liveTools(), pageType: props.pageType, url: frontmatter.value.url }))

// SSR 一律輸出 ⌘K，掛載後不是蘋果裝置才改成 Ctrl K
const shortcut = ref('⌘K')
onMounted(() => {
  const ua = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || navigator.userAgent
  if (!/mac|iphone|ipad|ipod/i.test(ua)) shortcut.value = 'Ctrl K'
})
</script>

<template>
  <header class="site-header">
    <div class="wrap site-header__inner">
      <a class="brand" href="/">
        <GhostImg class="brand__logo" name="logo" :width="36" small eager />
        <span class="brand__name">{{ SITE_NAME }}</span>
        <span v-if="SITE_NAME_EN" class="brand__en en">{{ SITE_NAME_EN }}</span>
      </a>
      <nav class="main-nav" aria-label="主選單">
        <a
          v-for="link in links"
          :key="link.key"
          class="main-nav__link"
          :href="link.href"
          :aria-current="link.current ?? undefined"
        >{{ link.text }}</a>
      </nav>
      <div class="site-header__tools">
        <button type="button" class="search-btn" aria-label="搜尋文章" aria-keyshortcuts="Meta+K Control+K" @click="openSearch">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.6-3.6" />
          </svg>
          <span class="search-btn__label" aria-hidden="true">搜尋文章</span>
          <kbd aria-hidden="true">{{ shortcut }}</kbd>
        </button>
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>
