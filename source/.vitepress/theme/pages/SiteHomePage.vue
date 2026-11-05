<script setup lang="ts">
// 外語首頁 /<code>/ 的主內容（主站首頁規格 E.1）。版面根元素、跳到主內容的連結、頁首、<main>、頁尾都在 Layout.vue，
// 這裡只輸出 <main> 裡面的 <div class="cs-shome">，每頁剛好一個 <main>、一個 id="main"。
// 文字、連結、語言標示全部由 lib/site-home.mjs、lib/site-shell.mjs 在 Node 端算好放在 fm.site，元件只顯示，不 import lib/。
// 不寫 <style>：樣式在 styles/site-home.css（含介紹區塊 .cs-toolfeature*），工具卡在 styles/toolcards.css（繁中首頁的 components/HomeTools.vue 共用）。
// 這支元件只在 __CS_SITE_HOME__ 為 true 時由 Layout.vue 登記，下面三支 CSS 跟著它一起進出建置（VitePress 的 CSS 全站一份，B.6）。
// preview 建置不在頁面上放提示條（站長 2026-11-05）：noindex 與根元素的 cs-preview 照舊（C.3）。
import { computed } from 'vue'
import '../shared/shell/i18n/lang-scoped.css'
import '../styles/site-home.css'
import '../styles/toolcards.css'
import { useSite } from '../composables/site'
import { ghostImage, toolCardArt, toolFeatureArt } from '../ghost.mjs'

const site = useSite()
const home = computed(() => site.value?.home ?? null)
// 工具資料全部來自 siteToolLinks()（F.6），有頁面語言版本的已經排在前面。
const links = computed(() => site.value?.tools ?? [])
// 介紹區塊（E.1，站長 2026-11-05「英文版，音效工具也要有完整的介紹」）：link.feature 不是 null 的工具
// （exact、而且那個語系有 intro）排在卡片前面，各自維持 siteToolLinks() 的順序；audit T1 照同一個順序比對。
// 主圖是 feature.images[0]，沒有圖時退回工具卡的圖（toolFeatureArt）；其他圖是旁邊那一排小裝飾圖
const features = computed(() => links.value.filter((t) => t.feature).map((t) => ({
  ...t,
  art: toolFeatureArt(t),
  wide: t.feature.images.length > 0,
  deco: t.feature.images.slice(1),
})))
// 其他工具照舊是卡片。圖是工具自己的站徽（mark）或小幽靈（ghost），toolCardArt() 二選一（站長 2026-11-05 決定每支工具都可以用自己的站徽）
const tools = computed(() => links.value.filter((t) => !t.feature).map((t) => ({ ...t, img: toolCardArt(t) })))
// 小幽靈、工具站徽、介紹區塊的插圖都是裝飾，alt 留空（旁邊就是工具名與介紹）；分享圖的描述只用在 og:image:alt。
// 圖都帶 .ghost（base.css）：深色模式加淺色貼紙描邊，維持「小幽靈只放在淺底上」，跟繁中首頁的 GhostImg 相同；
// 透明的站徽與工具插圖同樣處理，小裝飾圖用 .ghost--small 的細描邊
const hero = ghostImage('hero', 960)
</script>

<template>
  <div v-if="home" class="cs-shome">
    <section class="cs-shome__hero" aria-labelledby="cs-shome-h1">
      <img class="ghost" :src="hero.src" :width="hero.width" :height="hero.height" alt="" decoding="async" fetchpriority="high" />
      <h1 id="cs-shome-h1"><span v-if="home.h1.lang" :lang="home.h1.lang" data-foreign="">{{ home.h1.text }}</span><template v-else>{{ home.h1.text }}</template></h1>
      <p class="cs-lead">{{ home.hero.lead }}</p>
      <a class="b3d" :href="home.hero.toolsHref">{{ home.hero.toolsButton }}</a>
    </section>
    <section id="tools" class="cs-shome__tools" aria-labelledby="cs-shome-tools">
      <h2 id="cs-shome-tools">{{ home.tools.h2 }}</h2>
      <p>{{ home.tools.lead }}</p>
      <!-- 介紹區塊：a.cs-toolcard（主圖、名稱、說明）是這支工具的主連結，audit T1 跟卡片一起數；按鈕是第二個連到同一頁的連結 -->
      <div v-for="t in features" :key="t.slug" class="cs-toolfeature">
        <a class="cs-toolcard cs-toolfeature__card" :href="t.href" :hreflang="t.hreflang">
          <span class="cs-toolfeature__stage">
            <img :class="['ghost', 'cs-toolfeature__art', { 'cs-toolfeature__art--card': !t.wide }]" :src="t.art.src" alt="" :width="t.art.width" :height="t.art.height" loading="lazy" decoding="async" />
          </span>
          <span class="cs-toolcard__name cs-toolfeature__name">{{ t.before }}<span :lang="t.lang ?? undefined" :data-foreign="t.lang ? '' : undefined">{{ t.label }}</span>{{ t.after }}</span>
          <span v-if="t.summary" class="cs-toolcard__sum cs-toolfeature__sum">{{ t.summary }}</span>
        </a>
        <div class="cs-toolfeature__body">
          <p class="cs-toolfeature__intro">{{ t.feature.intro }}</p>
          <ul class="cs-toolfeature__points">
            <li v-for="(h, i) in t.feature.highlights" :key="i">{{ h }}</li>
          </ul>
          <a class="b3d cs-toolfeature__cta" :href="t.href" :hreflang="t.hreflang">{{ t.feature.cta }}</a>
          <div v-if="t.deco.length" class="cs-toolfeature__strip">
            <img v-for="d in t.deco" :key="d.src" class="ghost ghost--small" :src="d.src" alt="" :width="d.width" :height="d.height" loading="lazy" decoding="async" />
          </div>
        </div>
      </div>
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
