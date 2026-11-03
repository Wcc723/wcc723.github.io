<script setup lang="ts">
// 麵包屑：讀 frontmatter.breadcrumbs（[{ name, url }]，最後一層沒有 url），最後一層不加連結。
// BreadcrumbList 的 JSON-LD 由 lib/seo.mjs 輸出，這裡只負責看得到的那一列。
import { toHref } from '../utils/format.mjs'

defineProps<{ items?: { name: string; url?: string }[] }>()
</script>

<template>
  <nav v-if="items && items.length" class="breadcrumbs" aria-label="麵包屑">
    <ol>
      <li v-for="(item, i) in items" :key="i">
        <a v-if="item.url && i < items.length - 1" :href="toHref(item.url)">{{ item.name }}</a>
        <span v-else aria-current="page">{{ item.name }}</span>
      </li>
    </ol>
  </nav>
</template>
