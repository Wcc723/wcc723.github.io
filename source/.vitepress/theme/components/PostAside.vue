<script setup lang="ts">
// 文章側欄：<aside> 一個，每塊各有 h2（文章的 h1 只有一個）。全部在 SSR 輸出，連結搜尋引擎看得到。
// 資料：本文目錄來自 page.headers（PostPage 用 utils/toc.mjs 整理好傳進來）；相關文章與熱門標籤來自
// frontmatter.sidebar（lib/pagedata.mjs 算好）；作者卡、著作、社群是 utils/aside.mjs 的固定內容。
//
// 順序（理由見 README「文章側欄」）：
//   本文目錄 → 相關文章 → 關於作者 → 我的著作 → 熱門標籤 → 社群
// 桌機兩欄（版面在 styles/pages.css）：目錄跟著本文 sticky，其餘各塊從本文結束處開始（沒有目錄時從最上面開始）。
// 手機與平板：排在文章與「接著讀」下方，目錄不顯示（排在文末用不到）。
//
// 這裡不放任何廣告元素：廣告只用 AdSense Auto ads，Hexo 版側欄的「贊助／廣告版位」不重現。
//
// 錨點文字只放名稱（直接從 HTML 抽文字的解析器不會拿到「css118」「…CSS Selector2021.09.11」這種黏在一起的字串）：
// 相關文章的日期放在連結外面，整行靠連結的 ::after 撐開仍然都能點；熱門標籤的篇數放在 data-count，由 CSS 顯示；
// 社群的名稱與帳號中間留一個空白（站外連結，帳號留在連結裡）。
import { computed } from 'vue'
import { formatDate, toHref } from '../utils/format.mjs'
import { AUTHOR, BOOK, SOCIAL, isExternalHref } from '../utils/aside.mjs'
import PostToc from './PostToc.vue'

type TocItem = { level: number; title: string; slug: string }
type Related = { title: string; url: string; date?: string }
type Tag = { name: string; url: string; count?: number }

const props = withDefaults(defineProps<{ toc?: TocItem[]; related?: Related[]; tags?: Tag[] }>(), {
  toc: () => [],
  related: () => [],
  tags: () => []
})

const relatedItems = computed(() => props.related.map((r) => ({ ...r, when: formatDate(r.date) })))
</script>

<template>
  <aside class="post-aside" :class="{ 'post-aside--toc': toc.length }" aria-label="文章側欄">
    <div v-if="toc.length" class="post-aside__track">
      <PostToc :items="toc" />
    </div>

    <div class="post-aside__more">
      <section v-if="relatedItems.length" class="side-block side-related">
        <h2 class="side-block__title">相關文章</h2>
        <ol class="side-related__list">
          <li v-for="r in relatedItems" :key="r.url" class="side-related__item">
            <a class="side-related__link" :href="toHref(r.url)">{{ r.title }}</a>
            <time v-if="r.when" class="side-related__date en" :datetime="r.when.iso">{{ r.when.text }}</time>
          </li>
        </ol>
      </section>

      <section class="side-block side-author">
        <h2 class="side-block__title">關於作者</h2>
        <div class="side-author__card">
          <div class="side-author__head">
            <img
              class="side-author__avatar"
              :src="AUTHOR.avatar.src"
              :width="AUTHOR.avatar.width"
              :height="AUTHOR.avatar.height"
              alt=""
              loading="lazy"
              decoding="async"
            />
            <p class="side-author__name">
              <span class="en">{{ AUTHOR.name }}</span>
              <span class="side-author__local">{{ AUTHOR.localName }}</span>
            </p>
          </div>
          <p class="side-author__bio">{{ AUTHOR.bio }}</p>
          <a class="side-block__more" :href="AUTHOR.about">關於卡斯伯 →</a>
        </div>
      </section>

      <section class="side-block side-book">
        <h2 class="side-block__title">我的著作</h2>
        <a class="c3d side-book__card" :href="BOOK.href" target="_blank" rel="noopener">
          <img
            class="side-book__cover"
            :src="BOOK.cover.src"
            :width="BOOK.cover.width"
            :height="BOOK.cover.height"
            alt=""
            loading="lazy"
            decoding="async"
          />
          <span class="side-book__text">
            <strong class="side-book__name">{{ BOOK.title }}</strong>
            <span class="side-book__desc">{{ BOOK.description }}</span>
            <span class="side-book__action">
              {{ BOOK.action }}<span class="sr-only">（另開分頁）</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" />
              </svg>
            </span>
          </span>
        </a>
      </section>

      <section v-if="tags.length" class="side-block side-tags">
        <h2 class="side-block__title">熱門標籤</h2>
        <div class="side-tags__list">
          <a
            v-for="t in tags"
            :key="t.url"
            class="chip side-tags__chip"
            :href="toHref(t.url)"
            :data-count="t.count || undefined"
          >{{ t.name }}</a>
        </div>
        <a class="side-block__more" href="/tags/">所有標籤 →</a>
      </section>

      <section class="side-block side-social">
        <h2 class="side-block__title">社群</h2>
        <ul class="side-social__list">
          <li v-for="s in SOCIAL" :key="s.href">
            <a
              class="side-social__link"
              :href="s.href"
              :target="isExternalHref(s.href) ? '_blank' : undefined"
              :rel="isExternalHref(s.href) ? 'noopener' : undefined"
            >
              <span class="side-social__name en">{{ s.name }}</span> <span class="side-social__handle">{{ s.handle }}</span>
              <span v-if="isExternalHref(s.href)" class="sr-only">（另開分頁）</span>
            </a>
          </li>
        </ul>
      </section>
    </div>
  </aside>
</template>
