<script setup lang="ts">
// 法務與聯絡：/privacy/、/contact/、/terms/。H1 和最後更新日（front matter 的 updated，沒有就用 date），下面是本文。
// 頁型不認得時也用這個版面（H1 加本文），不會整頁空白。
import { computed } from 'vue'
import { useData } from 'vitepress'
import { formatDate } from '../utils/format.mjs'
import Breadcrumbs from '../components/Breadcrumbs.vue'

const { frontmatter } = useData()
const updated = computed(() => formatDate(frontmatter.value.updated) ?? formatDate(frontmatter.value.date))
</script>

<template>
  <div class="wrap wrap--narrow page-legal">
    <Breadcrumbs :items="frontmatter.breadcrumbs" />
    <article class="post">
      <header class="page-head page-head--panel">
        <div>
          <h1 class="page-head__title">{{ frontmatter.heading || frontmatter.title }}</h1>
          <p v-if="updated" class="page-head__meta">最後更新：<time :datetime="updated.iso" class="en">{{ updated.text }}</time></p>
        </div>
      </header>
      <div class="post-body">
        <div class="prose"><Content /></div>
      </div>
    </article>
  </div>
</template>
