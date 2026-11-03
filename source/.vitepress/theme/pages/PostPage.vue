<script setup lang="ts">
// 文章頁：麵包屑、標題面板（分類膠囊、H1、日期、閱讀時間、s-deco）、封面、本文、標籤、上一篇下一篇、FB 留言、接著讀。
//
// 結構跟 Hexo 版一樣，基準的本文指紋才算得出來（scripts/blog-baseline.mjs 的 articleOf）：
// 本文是 <div class="prose"> 到 <div class="post-foot">，兩個 class 都不能加別的屬性或 class，
// 這兩個 div 之間只放 <Content />，標題區、標籤、上下篇、留言都不在這段裡。
// 上下篇照 lib/pagedata.mjs：next 是較舊一篇（左邊「← 較舊一篇」），prev 是較新一篇（右邊「較新一篇 →」）。
import { computed } from 'vue'
import { useData } from 'vitepress'
import { formatDate, dateFromPath, readingText, toHref } from '../utils/format.mjs'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import FbComments from '../components/FbComments.vue'
import GhostImg from '../components/GhostImg.vue'

type Link = { title: string; url: string }

const { frontmatter } = useData()
const fm = frontmatter
const post = computed(() => fm.value.post ?? {})
const title = computed(() => fm.value.heading || fm.value.title || '')
const date = computed(() => formatDate(post.value.date) ?? formatDate(dateFromPath(fm.value.url)))
const updated = computed(() => {
  const u = formatDate(post.value.updated)
  return u && u.iso !== date.value?.iso ? u : null
})
const reading = computed(() => readingText(post.value.readingTime))
const tags = computed<{ name: string; url: string }[]>(() => post.value.tags ?? [])
const older = computed<Link | null>(() => fm.value.next ?? null)
const newer = computed<Link | null>(() => fm.value.prev ?? null)
const related = computed(() =>
  ((fm.value.related ?? []) as Link[]).map((r) => ({ ...r, date: formatDate(dateFromPath(r.url)) }))
)
</script>

<template>
  <div class="wrap wrap--narrow page-post">
    <Breadcrumbs :items="fm.breadcrumbs" />
    <article class="post">
      <header class="post-hero">
        <div class="post-hero__text">
          <a v-if="post.category" class="chip" :href="toHref(post.categoryUrl)">{{ post.category }}</a>
          <h1 class="post-hero__title">{{ title }}</h1>
          <p class="post-hero__meta">
            <time v-if="date" :datetime="date.iso">{{ date.text }}</time>
            <template v-if="reading">
              <span aria-hidden="true">·</span>
              <span>{{ reading }}</span>
            </template>
            <template v-if="updated">
              <span aria-hidden="true">·</span>
              <span>更新於 <time :datetime="updated.iso">{{ updated.text }}</time></span>
            </template>
          </p>
        </div>
        <GhostImg class="post-hero__deco" name="deco" :width="240" eager />
      </header>

      <figure v-if="post.cover" class="post-cover">
        <img :src="post.cover" alt="" width="720" height="405" loading="eager" fetchpriority="high" decoding="async" />
      </figure>

      <div class="post-body">
        <div class="prose"><Content /></div>
        <div class="post-foot">
          <div v-if="tags.length" class="post-tags">
            <span class="post-tags__label">標籤</span>
            <a v-for="t in tags" :key="t.url" class="chip" :href="toHref(t.url)" rel="tag">{{ t.name }}</a>
          </div>

          <nav v-if="older || newer" class="post-nav" aria-label="上一篇與下一篇">
            <a v-if="older" class="c3d post-nav__item" :href="toHref(older.url)">
              <span class="post-nav__label">← 較舊一篇</span>
              <span class="post-nav__title">{{ older.title }}</span>
            </a>
            <a v-if="newer" class="c3d post-nav__item post-nav__item--next" :href="toHref(newer.url)">
              <span class="post-nav__label">較新一篇 →</span>
              <span class="post-nav__title">{{ newer.title }}</span>
            </a>
          </nav>

          <FbComments v-if="fm.fbHref" :href="fm.fbHref" />
        </div>
      </div>
    </article>

    <section v-if="related.length" class="related" aria-label="接著讀">
      <h2 class="section-title related__heading">接著讀</h2>
      <div class="related__grid">
        <a v-for="r in related" :key="r.url" class="c3d related__card" :href="toHref(r.url)">
          <span v-if="r.date" class="chip en related__date">{{ r.date.text }}</span>
          <strong class="related__title">{{ r.title }}</strong>
        </a>
      </div>
    </section>
  </div>
</template>
