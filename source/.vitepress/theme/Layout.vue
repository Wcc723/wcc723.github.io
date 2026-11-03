<script setup lang="ts">
import { useData } from 'vitepress'
const { frontmatter } = useData()
</script>

<template>
  <div class="vp-raw">
    <main>
      <h1 v-if="frontmatter.title">{{ frontmatter.title }}</h1>
      <Content />
    </main>
  </div>
</template>
