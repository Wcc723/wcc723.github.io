<script setup lang="ts">
// 全站版面。根元素一定要有 vp-raw：VitePress 1.6.4 的路由不攔 .vp-raw 裡的連結，
// 站內連結因此都是一般的整頁載入（計畫的網址規則 12、決策 0006），FB 留言、GA、Auto ads、舊文示範每頁照常初始化。
// 依 frontmatter.pageType（lib/pagedata.mjs 寫的）分派頁型；VitePress 的 404（page.isNotFound）顯示 NotFound。
// 主題只讀 frontmatter，不 import source/.vitepress/lib/，文章資料不會進主題 chunk。
// 頁首頁尾（主站首頁規格 G.5）：__CS_SHARED_SHELL__ 為 true（S 版起，或 preview 建置）而且這頁有 fm.site 時用共用元件，
// 經 components/SharedHeader.vue、SharedFooter.vue 接線；否則是部落格自己的 SiteHeader、SiteFooter。
// fm.site 不存在的頁只有 VitePress 內建的 404（transformPageData 不會跑），preview 時它照舊用部落格自己的頁首頁尾（E.5 的 404 留給 S 版）。
import { computed, defineAsyncComponent } from 'vue'
import { useData } from 'vitepress'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import SearchModal from './components/SearchModal.vue'
import HomePage from './pages/HomePage.vue'
import PostPage from './pages/PostPage.vue'
import ListPage from './pages/ListPage.vue'
import IndexPage from './pages/IndexPage.vue'
import AboutPage from './pages/AboutPage.vue'
import LegalPage from './pages/LegalPage.vue'
import NotFound from './pages/NotFound.vue'

const VIEWS = {
  home: HomePage,
  'blog-index': ListPage,
  post: PostPage,
  'taxonomy-list': ListPage,
  'nav-index': IndexPage,
  about: AboutPage,
  legal: LegalPage,
  'not-found': NotFound,
  // 外語首頁（主站首頁規格 B.6）：只有這次建置要產生外語首頁時才登記（config.mts 的 vite.define）。
  // false 時整段連同 SiteHomePage 與它 import 的 CSS 一起被拿掉：VitePress 的 CSS 全站一份，登記了每一頁的 CSS 就會變
  ...(__CS_SITE_HOME__ ? { 'site-home': defineAsyncComponent(() => import('./pages/SiteHomePage.vue')) } : {})
} as const

// 共用頁首頁尾：false 時（P1、P2 的正式建置）兩個都是 null，動態 import 連同元件與它們 import 的 CSS 一起被拿掉
const SharedHeader = __CS_SHARED_SHELL__ ? defineAsyncComponent(() => import('./components/SharedHeader.vue')) : null
const SharedFooter = __CS_SHARED_SHELL__ ? defineAsyncComponent(() => import('./components/SharedFooter.vue')) : null

const { page, frontmatter } = useData()
const pageType = computed<string>(() => (page.value.isNotFound ? 'not-found' : frontmatter.value.pageType || 'legal'))
const view = computed(() => VIEWS[pageType.value as keyof typeof VIEWS] ?? LegalPage)
// preview 建置的外語首頁，版面根元素多一個 cs-preview（C.3）。__CS_SITE_HOME__ 只能在 script 裡用：模板裡的識別字會變成 _ctx 的屬性，define 換不到
const rootClass = computed(() => [`page-type-${pageType.value}`, __CS_SITE_HOME__ && frontmatter.value.site?.preview ? 'cs-preview' : null])
// 模板用 v-if / v-else 二選一，false 時只輸出部落格自己的頁首頁尾，不多一個註解節點，P1、P2 的 HTML 不變
const sharedShell = computed(() => __CS_SHARED_SHELL__ && !!frontmatter.value.site)
// 跳到主內容的字：共用外殼時用外殼字串 skipToContent（外語頁是那個語言），值沒有佔位符，直接取 fm.site.shell；
// 不 import useSite()，主題 chunk 不多帶 formatShell
const skipText = computed<string>(() => (__CS_SHARED_SHELL__ && frontmatter.value.site?.shell?.skipToContent) || '跳到主要內容')
</script>

<template>
  <div class="vp-raw site" :class="rootClass">
    <a class="skip-link" href="#main">{{ skipText }}</a>
    <component :is="SharedHeader" v-if="sharedShell" />
    <SiteHeader v-else :page-type="pageType" />
    <main id="main" class="site-main" tabindex="-1">
      <component :is="view" />
    </main>
    <component :is="SharedFooter" v-if="sharedShell" />
    <SiteFooter v-else />
    <SearchModal />
  </div>
</template>
