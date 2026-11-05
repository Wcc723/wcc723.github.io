<script setup lang="ts">
// 共用頁首（theme/shared/shell/SiteHeader.vue）的部落格接線（主站首頁規格 E.2、G.3、G.5）。資料全部來自 fm.site（useSite()），這裡不算連結。
// 只在 __CS_SHARED_SHELL__ 為 true 時由 Layout.vue 載入（S 版起，或 preview 建置），P1、P2 的正式建置沒有這支，也沒有它 import 的 CSS。
//   - 字標、導覽、aria-current：元件用 headerModel() 算，這裡傳 locale、kind、currentUrl（fm.site.canonical）、section、siteHomes
//   - 「工具」連結：fm.site.tools 不是空的才有（liveTools）
//   - 語言選單：fm.site.languages（lib/site-home.mjs 的 languageTargets()），少於兩項時元件不輸出
//   - actions 插槽：繁中頁放 ⌘K（SearchButton，沒有工具時字是 search.openPosts，有工具後是 search.open）與深淺色鈕；
//     外語頁不放 ⌘K（索引只有中文文章，search.* 的 audience 是 blog），只放深淺色鈕，title 跟 aria-label 一樣用 theme.toggle
//   - 元件內建的 search、themeToggle 不用：那兩顆是給工具的，字與快捷鍵提示跟部落格現在的不同
import { computed } from 'vue'
import SiteHeader from '../shared/shell/SiteHeader.vue'
import { BLOG_LOCALES } from '../shared/shell/i18n/locales.mjs'
import { useSite } from '../composables/site'
import SearchButton from './SearchButton.vue'
import ThemeToggle from './ThemeToggle.vue'
import '../styles/shared-shell.css'

const site = useSite()
const blog = computed(() => !!site.value && BLOG_LOCALES.includes(site.value.locale))
const searchLabel = computed(() => (blog.value ? site.value!.text(site.value!.tools.length ? 'search.open' : 'search.openPosts') : ''))
const themeLabel = computed(() => site.value?.text('theme.toggle') ?? '')
</script>

<template>
  <SiteHeader
    v-if="site"
    :locale="site.locale"
    :text="site.text"
    :kind="site.kind"
    :languages="site.languages"
    :live-tools="site.tools.length > 0"
    :current-url="site.canonical"
    :section="site.section || null"
    :site-homes="site.siteHomes"
  >
    <template #actions>
      <SearchButton v-if="blog" :label="searchLabel" />
      <ThemeToggle :label="themeLabel" :title="blog ? undefined : themeLabel" />
    </template>
  </SiteHeader>
</template>
