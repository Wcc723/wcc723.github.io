<script setup lang="ts">
// 外語首頁 /<code>/ 的主內容（主站首頁規格 E.1）。版面根元素、跳到主內容的連結、頁首、<main>、頁尾都在 Layout.vue，
// 這裡只輸出 <main> 裡面的 <div class="cs-shome">，每頁剛好一個 <main>、一個 id="main"。
// 文字、連結、語言標示全部由 lib/site-home.mjs、lib/site-shell.mjs 在 Node 端算好放在 fm.site，元件只顯示，不 import lib/。
// 不寫 <style>：樣式在 styles/site-home.css。這支元件只在 __CS_SITE_HOME__ 為 true 時由 Layout.vue 登記，
// 下面兩支 CSS 跟著它一起進出建置（VitePress 的 CSS 全站一份，B.6）。
import { computed } from 'vue'
import '../shared/shell/i18n/lang-scoped.css'
import '../styles/site-home.css'
import { useSite } from '../composables/site'
import { ghostImage } from '../ghost.mjs'

const site = useSite()
const home = computed(() => site.value?.home ?? null)
const preview = computed(() => site.value?.preview ?? null)
// 工具卡：資料全部來自 siteToolLinks()（F.6），有頁面語言版本的已經排在前面
const tools = computed(() => (site.value?.tools ?? []).map((t) => ({ ...t, img: ghostImage(t.ghost || 'spot2', 340) })))
// 小幽靈都是裝飾，alt 留空；分享圖的描述只用在 og:image:alt。
// 兩張圖都帶 .ghost（base.css）：深色模式加淺色貼紙描邊，維持「小幽靈只放在淺底上」，跟繁中首頁的 GhostImg 相同
const hero = ghostImage('hero', 960)
</script>

<template>
  <div v-if="home" class="cs-shome">
    <p v-if="preview" class="cs-preview__bar" role="note">{{ preview.notice }}</p>
    <section class="cs-shome__hero" aria-labelledby="cs-shome-h1">
      <img class="ghost" :src="hero.src" :width="hero.width" :height="hero.height" alt="" decoding="async" fetchpriority="high" />
      <h1 id="cs-shome-h1"><span v-if="home.h1.lang" :lang="home.h1.lang" data-foreign="">{{ home.h1.text }}</span><template v-else>{{ home.h1.text }}</template></h1>
      <p class="cs-lead">{{ home.hero.lead }}</p>
      <a class="b3d" :href="home.hero.toolsHref">{{ home.hero.toolsButton }}</a>
    </section>
    <section id="tools" class="cs-shome__tools" aria-labelledby="cs-shome-tools">
      <h2 id="cs-shome-tools">{{ home.tools.h2 }}</h2>
      <p>{{ home.tools.lead }}</p>
      <p v-if="preview?.toolsNote" class="cs-preview__note" role="note">{{ preview.toolsNote }}</p>
      <ul v-if="tools.length" class="cs-toolcards">
        <li v-for="t in tools" :key="t.slug">
          <a class="cs-toolcard" :href="t.href" :hreflang="t.hreflang">
            <img class="ghost" :src="t.img.src" alt="" :width="t.img.width" :height="t.img.height" loading="lazy" />
            <span class="cs-toolcard__name">{{ t.before }}<span :lang="t.lang ?? undefined" :data-foreign="t.lang ? '' : undefined">{{ t.label }}</span>{{ t.after }}</span>
            <span v-if="t.summary" class="cs-toolcard__sum">{{ t.summary }}</span>
          </a>
        </li>
      </ul>
    </section>
    <section class="cs-shome__articles" aria-labelledby="cs-shome-articles">
      <h2 id="cs-shome-articles">{{ home.articles.h2 }}</h2>
      <p>{{ home.articles.body }}</p>
      <p class="cs-shome__links">
        <a :href="home.links.latest.href" :hreflang="home.links.latest.hreflang">{{ home.links.latest.label }}</a>
        <a :href="home.links.categories.href" :hreflang="home.links.categories.hreflang">{{ home.links.categories.label }}</a>
      </p>
    </section>
    <section id="about" class="cs-shome__about" aria-labelledby="cs-shome-about">
      <h2 id="cs-shome-about">{{ home.about.title }}</h2>
      <p>{{ home.about.body }}</p>
      <a :href="home.links.about.href" :hreflang="home.links.about.hreflang">{{ home.links.about.label }}</a>
    </section>
  </div>
</template>
