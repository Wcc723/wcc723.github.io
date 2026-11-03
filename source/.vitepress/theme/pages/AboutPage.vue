<script setup lang="ts">
// 關於：/about/、/about/hexschool-traning（.html）。H1 旁放揮手的小幽靈（s-wave），下面是本文和 FB 留言。
// 本文一樣是 <div class="prose"> 到 <div class="post-foot">，跟 Hexo 的 page.ejs 相同，基準的本文指紋才對得上。
import { computed } from 'vue'
import { useData } from 'vitepress'
import { formatDate } from '../utils/format.mjs'
import Breadcrumbs from '../components/Breadcrumbs.vue'
import FbComments from '../components/FbComments.vue'
import GhostImg from '../components/GhostImg.vue'

const { frontmatter } = useData()
const updated = computed(() => formatDate(frontmatter.value.updated) ?? formatDate(frontmatter.value.date))
</script>

<template>
  <div class="wrap wrap--narrow page-about">
    <Breadcrumbs :items="frontmatter.breadcrumbs" />
    <article class="post">
      <header class="page-head page-head--panel">
        <div>
          <h1 class="page-head__title">{{ frontmatter.heading || frontmatter.title }}</h1>
          <p v-if="updated" class="page-head__meta">最後更新：<time :datetime="updated.iso" class="en">{{ updated.text }}</time></p>
        </div>
        <GhostImg class="page-head__ghost page-head__ghost--wave" name="wave" :width="128" eager />
      </header>
      <div class="post-body">
        <div class="prose"><Content /></div>
        <div class="post-foot">
          <FbComments v-if="frontmatter.fbHref" :href="frontmatter.fbHref" />
        </div>
      </div>
    </article>
  </div>
</template>
