<script setup lang="ts">
// 導覽索引：/categories/、/tags/、/archives/、/archives/YYYY/、/archives/YYYY/MM/。
// H1 旁放拿放大鏡的小幽靈（s-pose4）。內容有兩種來源：動態路由的 <Content />（封存的年、月），
// 以及固定頁（categories/index.md 這類）由 lib/pagedata.mjs 放進 frontmatter.listHtml 的清單 HTML。
import { useData } from 'vitepress'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import GhostImg from '../components/GhostImg.vue'

const { frontmatter } = useData()
</script>

<template>
  <div class="wrap wrap--narrow page-index">
    <Breadcrumbs :items="frontmatter.breadcrumbs" />
    <header class="page-head page-head--panel">
      <div>
        <h1 class="page-head__title">{{ frontmatter.heading || frontmatter.title }}</h1>
        <p v-if="frontmatter.postCount" class="page-head__meta">共 {{ frontmatter.postCount }} 篇文章</p>
      </div>
      <GhostImg class="page-head__ghost" name="pose4" :width="112" eager />
    </header>
    <div class="index-body">
      <Content />
      <div v-if="frontmatter.listHtml" class="index-body__list" v-html="frontmatter.listHtml"></div>
    </div>
  </div>
</template>
