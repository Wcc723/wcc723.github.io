<script setup lang="ts">
// 全站版面。根元素一定要有 vp-raw：VitePress 1.6.4 的路由不攔 .vp-raw 裡的連結，
// 站內連結因此都是一般的整頁載入（計畫的網址規則 12、決策 0006），FB 留言、GA、Auto ads、舊文示範每頁照常初始化。
// 依 frontmatter.pageType（lib/pagedata.mjs 寫的）分派頁型；VitePress 的 404（page.isNotFound）顯示 NotFound。
// 主題只讀 frontmatter，不 import source/.vitepress/lib/，文章資料不會進主題 chunk。
import { computed } from 'vue'
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
  'not-found': NotFound
} as const

const { page, frontmatter } = useData()
const pageType = computed<string>(() => (page.value.isNotFound ? 'not-found' : frontmatter.value.pageType || 'legal'))
const view = computed(() => VIEWS[pageType.value as keyof typeof VIEWS] ?? LegalPage)
</script>

<template>
  <div class="vp-raw site" :class="`page-type-${pageType}`">
    <a class="skip-link" href="#main">跳到主要內容</a>
    <SiteHeader :page-type="pageType" />
    <main id="main" class="site-main" tabindex="-1">
      <component :is="view" />
    </main>
    <SiteFooter />
    <SearchModal />
  </div>
</template>
