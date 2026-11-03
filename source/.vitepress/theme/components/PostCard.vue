<script setup lang="ts">
// 首頁的文章卡。HTML 結構和 class 跟列表頁（lib/cards.mjs 的 renderCard）相同，樣式只寫一份（styles/pages.css）。
// 首頁的 H1 是站名、區塊標題是 h2，所以卡片標題用 h3。
import { computed } from 'vue'
import { longDate, toHref } from '../utils/format.mjs'

const props = defineProps<{
  card: { title: string; url: string; date: string; category: string; categoryUrl: string; excerpt?: string; readingTime?: number; cover?: string | null }
}>()

const href = computed(() => toHref(props.card.url))
</script>

<template>
  <article class="post-card">
    <a v-if="card.cover" class="post-card__cover" :href="href" tabindex="-1" aria-hidden="true">
      <img :src="card.cover" alt="" loading="lazy" decoding="async" />
    </a>
    <h3 class="post-card__title"><a :href="href">{{ card.title }}</a></h3>
    <p class="post-card__meta">
      <time :datetime="card.date">{{ longDate(card.date) }}</time>
      <span class="post-card__sep" aria-hidden="true"> · </span>
      <a :href="toHref(card.categoryUrl)">{{ card.category }}</a>
      <template v-if="card.readingTime">
        <span class="post-card__sep" aria-hidden="true"> · </span>
        <span>{{ card.readingTime }} 分鐘閱讀</span>
      </template>
    </p>
    <p v-if="card.excerpt" class="post-card__excerpt">{{ card.excerpt }}</p>
  </article>
</template>
