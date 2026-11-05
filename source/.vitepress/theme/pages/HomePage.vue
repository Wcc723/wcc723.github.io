<script setup lang="ts">
// 首頁：Hero（H1 是站名）、工具區 #tools（0 支時整區不輸出）、最新 10 篇（frontmatter.cards）、分頁、關於條。
// 文章資料只在這一頁的 frontmatter，主題不 import 任何文章索引。
// 工具區有兩份，同一時間最多一份有東西：
//   - legacy（文章上面）：theme/tools.mjs 的 TOOLS，P1、P2 是 0 支，K.3 跟 legacy 頁首頁尾一起刪
//   - 共用外殼（S 版起與 preview）：fm.site.tools（tools.json），在文章與分頁下面、關於條上面（站長 2026-11-05「可以先放在文章下方」）。
//     HomeTools 只在 __CS_SHARED_SHELL__ 為 true 時載入；模板用 v-if / v-else 跟關於條二選一，沒有工具時只輸出關於條，P1 的 HTML 不變
import { computed, defineAsyncComponent } from 'vue'
import { useData } from 'vitepress'
import { SITE_NAME } from '../shared/shell/site.mjs'
import { liveTools } from '../tools.mjs'
import { useSearch } from '../composables/search'
import GhostImg from '../components/GhostImg.vue'
import PostCard from '../components/PostCard.vue'
import Pager from '../components/Pager.vue'
import AboutStrip from '../components/AboutStrip.vue'

const HomeTools = __CS_SHARED_SHELL__ ? defineAsyncComponent(() => import('../components/HomeTools.vue')) : null

const { frontmatter } = useData()
const { openSearch } = useSearch()
const tools = liveTools()
const siteTools = computed<any[]>(() => (__CS_SHARED_SHELL__ && frontmatter.value.site?.tools) || [])
const hasTools = computed(() => tools.length > 0 || siteTools.value.length > 0)
const cards = computed(() => frontmatter.value.cards ?? [])
const heading = computed(() => frontmatter.value.heading || SITE_NAME)
const lead = computed(() => (hasTools.value ? '卡斯伯的前端筆記和免費線上小工具' : '卡斯伯的前端筆記'))
</script>

<template>
  <div class="wrap home">
    <section class="hero">
      <div class="hero__text">
        <span class="chip">前端，沒有極限</span>
        <h1 class="hero__title">{{ heading }}</h1>
        <p class="hero__lead">{{ lead }}，從 2013 年寫到現在<template v-if="frontmatter.postCount">，共 {{ frontmatter.postCount }} 篇</template>。</p>
        <div class="hero__actions">
          <a class="b3d" href="/categories/">看文章分類</a>
          <button type="button" class="b3d-lite" @click="openSearch">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.6-3.6" />
            </svg>
            搜尋文章
          </button>
        </div>
      </div>
      <GhostImg class="hero__ghost" name="hero" :width="360" eager alt="小幽靈抱著藍色工具箱，身邊飄著尺、鉛筆、計算機、扳手和手機" />
    </section>

    <section v-if="tools.length" id="tools" class="home-section" aria-label="工具">
      <div class="section-head">
        <h2 class="section-title">工具</h2>
      </div>
      <div class="tool-grid">
        <a v-for="t in tools" :key="t.slug" class="c3d tool-card" :href="`/${t.slug}/`">
          <span class="tool-card__art"><GhostImg :name="t.ghost || 'spot2'" :width="116" /></span>
          <strong class="tool-card__name">{{ t.name }}</strong>
          <span class="tool-card__desc">{{ t.description }}</span>
        </a>
      </div>
    </section>

    <section class="home-section" aria-label="最新文章">
      <div class="section-head">
        <h2 class="section-title">最新文章</h2>
        <a class="more-link" href="/archives/">
          所有文章的封存
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
      <div class="post-list">
        <PostCard v-for="c in cards" :key="c.url" :card="c" />
      </div>
      <Pager :pager="frontmatter.pager" />
    </section>

    <template v-if="siteTools.length">
      <component :is="HomeTools" :tools="siteTools" />
      <AboutStrip :with-tools="true" />
    </template>
    <AboutStrip v-else :with-tools="hasTools" />
  </div>
</template>
