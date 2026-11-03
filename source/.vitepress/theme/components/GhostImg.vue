<script setup lang="ts">
// 小幽靈圖：一律帶 width、height（依原始比例算），CSS 再用寬度縮放，不會造成版面位移
import { computed } from 'vue'
import { ghostImage } from '../ghost.mjs'

const props = withDefaults(
  defineProps<{ name: string; width: number; alt?: string; eager?: boolean; small?: boolean }>(),
  { alt: '', eager: false, small: false }
)
const img = computed(() => ghostImage(props.name, props.width))
</script>

<template>
  <img
    class="ghost"
    :class="{ 'ghost--small': small }"
    :src="img.src"
    :width="img.width"
    :height="img.height"
    :alt="alt"
    :loading="eager ? 'eager' : 'lazy'"
    decoding="async"
  />
</template>
