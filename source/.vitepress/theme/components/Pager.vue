<script setup lang="ts">
// 分頁：上一頁、跳頁選單、下一頁。讀 frontmatter.pager，只有 1 頁時不輸出。
// 選單換頁用 location.href，跟站內其他連結一樣是整頁載入。
import { computed } from 'vue'
import { pagerModel } from '../utils/pager.mjs'
import { toHref } from '../utils/format.mjs'

const props = defineProps<{ pager?: Record<string, unknown> | null }>()
const model = computed(() => pagerModel(props.pager))

function jump(e: Event) {
  const url = (e.target as HTMLSelectElement).value
  if (url) window.location.href = url
}
</script>

<template>
  <nav v-if="model" class="pager" aria-label="分頁">
    <a v-if="model.prevUrl" class="b3d-lite pager__btn" :href="toHref(model.prevUrl)" rel="prev">← 上一頁</a>
    <span v-else class="b3d-lite pager__btn is-disabled" aria-hidden="true">← 上一頁</span>
    <span class="pager__jump">
      <select class="pager__select" aria-label="跳到指定頁" @change="jump">
        <option v-for="o in model.options" :key="o.n" :value="toHref(o.url)" :selected="o.selected">{{ o.label }}</option>
      </select>
      <span class="pager__total">共 {{ model.total }} 頁</span>
    </span>
    <a v-if="model.nextUrl" class="b3d-lite pager__btn" :href="toHref(model.nextUrl)" rel="next">下一頁 →</a>
    <span v-else class="b3d-lite pager__btn is-disabled" aria-hidden="true">下一頁 →</span>
  </nav>
</template>
