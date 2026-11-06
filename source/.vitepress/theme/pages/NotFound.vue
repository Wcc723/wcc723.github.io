<script setup lang="ts">
// 404：睡著的小幽靈（s-pose3）、H1「這頁找不到」、一句說明、⌘K 搜尋鈕、回首頁和文章分類（加上已上線的工具）。
// 沒有麵包屑；noindex、拿掉廣告 loader、404.html 的 title 與 description 由 lib/seo.mjs 處理。
// S 版起（fm.site 存在，主站首頁規格 E.5）：404 不 hydrate，按了沒反應的按鈕不能留，搜尋鈕換成「文章封存」連結；
// 工具按鈕讀 fm.site.tools（siteToolLinks()，連結是完整網址）。沒有 fm.site 的情況（vitepress dev 的內建 404）照舊。
// I1 起主內容最後多一段多語提示（fm.site.notFoundIntl），audit 的 L8 驗。
import { computed, onMounted } from 'vue'
import { liveTools } from '../tools.mjs'
import { useSite } from '../composables/site'
import { NOT_FOUND_DESCRIPTION, NOT_FOUND_HEADING, NOT_FOUND_TITLE } from '../head.mjs'
import { useSearch } from '../composables/search'
import GhostImg from '../components/GhostImg.vue'

const { openSearch } = useSearch()
const site = useSite()
const tools = computed(() =>
  site.value
    ? site.value.tools.map((t) => ({ key: t.slug, href: t.href, label: t.label, hreflang: t.hreflang, lang: t.lang ?? undefined }))
    : liveTools().map((t) => ({ key: t.slug, href: `/${t.slug}/`, label: t.name, hreflang: undefined, lang: undefined }))
)

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
      <a v-if="site" class="b3d-lite not-found__archives" href="https://www.casper.tw/archives/">文章封存</a>
      <button v-else type="button" class="b3d-lite not-found__search" @click="openSearch">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        搜尋文章
      </button>
      <div class="not-found__actions">
        <a class="b3d" href="/">回首頁</a>
        <a class="b3d-lite" href="/categories/">文章分類</a>
        <a v-for="t in tools" :key="t.key" class="b3d-lite" :href="t.href" :hreflang="t.hreflang" :lang="t.lang">{{ t.label }}</a>
      </div>
      <!-- I1 起的多語提示（E.5）：每個已上線的外語首頁一行，字串是那個語系的外殼字串（lib/site-shell.mjs 的 notFoundIntl） -->
      <ul v-if="site?.notFoundIntl?.length" class="cs-404__intl">
        <li v-for="x in site.notFoundIntl" :key="x.code" :lang="x.htmlLang">
          <span>{{ x.title }}</span> <a :href="x.href" :hreflang="x.hreflang">{{ x.linkText }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.cs-404__intl { list-style: none; margin: 32px 0 0; padding: 0; display: grid; gap: 6px; font-size: 14px; color: var(--cs-text-2); text-align: center; }
.cs-404__intl a { color: var(--cs-link); }
</style>
