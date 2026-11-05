<script setup lang="ts">
// 繁中首頁 / 的工具區 #tools（主站首頁規格 E.1、F.7；站長 2026-11-05「中文版也要加入工具列表，可以先放在文章下方」）。
// 只在 __CS_SHARED_SHELL__ 為 true 時由 HomePage.vue 載入（S 版起，或 preview 建置），P1、P2 的正式建置沒有這支，也沒有 toolcards.css。
// 資料是 fm.site.tools（lib/site-shell.mjs 用 siteToolLinks(index, { locale: 'zh-tw' }) 算好）。
// 卡片跟外語首頁 SiteHomePage.vue 的 ul.cs-toolcards 同一個 DOM 契約，audit T1 用同一支 toolCardsIn() 比對：
// 區塊裡只有工具卡的 <a>（標題不放連結），圖是 toolCardArt()（工具自己的站徽或小幽靈），說明只有 exact 的工具有。
// 外語首頁的介紹區塊（link.feature）這裡先不輸出，T1 預期 / 只有卡片（主站首頁規格 E.1）。
import { computed } from 'vue'
import { toolCardArt } from '../ghost.mjs'
import '../styles/toolcards.css'

interface ToolLink {
  slug: string; href: string; hreflang: string; label: string; lang: string | null
  before: string; after: string; summary: string | null; ghost: string | null; mark: string | null
}

const props = defineProps<{ tools: ToolLink[] }>()
// 小幽靈與工具站徽都是裝飾，alt 留空（旁邊就是工具名）；圖帶 .ghost：深色模式加淺色貼紙描邊
const cards = computed(() => props.tools.map((t) => ({ ...t, img: toolCardArt(t) })))
</script>

<template>
  <section id="tools" class="home-section" aria-label="工具">
    <div class="section-head">
      <h2 class="section-title">工具</h2>
    </div>
    <ul class="cs-toolcards">
      <li v-for="t in cards" :key="t.slug">
        <a class="cs-toolcard" :href="t.href" :hreflang="t.hreflang">
          <img class="ghost" :src="t.img.src" alt="" :width="t.img.width" :height="t.img.height" loading="lazy" />
          <span class="cs-toolcard__name">{{ t.before }}<span :lang="t.lang ?? undefined" :data-foreign="t.lang ? '' : undefined">{{ t.label }}</span>{{ t.after }}</span>
          <span v-if="t.summary" class="cs-toolcard__sum">{{ t.summary }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>
