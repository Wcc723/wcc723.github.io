<script setup lang="ts">
// 列表頁：/page/N/（blog-index）、分類與標籤列表（taxonomy-list）。
// H1 用 frontmatter.heading，篇數用 frontmatter.postCount；卡片是 paths loader 輸出的 HTML（<Content />，
// 外層已經是 <div class="post-list">），分頁讀 frontmatter.pager。
import { useData } from 'vitepress'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import Pager from '../components/Pager.vue'

const { frontmatter } = useData()
</script>

<template>
  <div class="wrap wrap--narrow page-list">
    <Breadcrumbs :items="frontmatter.breadcrumbs" />
    <header class="page-head">
      <div>
        <h1 class="page-head__title">{{ frontmatter.heading || frontmatter.title }}</h1>
        <p v-if="frontmatter.postCount && frontmatter.pageType === 'taxonomy-list'" class="page-head__meta">共 {{ frontmatter.postCount }} 篇文章</p>
      </div>
    </header>
    <div class="list-body"><Content /></div>
    <Pager :pager="frontmatter.pager" />
  </div>
</template>
