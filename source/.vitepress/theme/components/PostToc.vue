<script setup lang="ts">
// 本文目錄（文章側欄的第一塊，桌機才顯示）。SSR 就輸出完整的連結清單，連到既有的標題 id（items 的 slug），不另外產生 id。
// 瀏覽器端只做加強：IntersectionObserver 標出目前段落（aria-current="location"）。
// 判定線在視窗上方 30%：標題上緣捲過這條線就算進入該段。root 的上緣用 rootMargin 撐到很遠，
// 「標題在線以上」就算相交，一次跳過好幾個標題（End 鍵、點目錄連結）也一定會觸發，不用監聽 scroll。
// 目前段落只改顏色、底色和左邊的線，不改字重與尺寸，不會造成版面位移。
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { activeSlug } from '../utils/toc.mjs'

type TocItem = { level: number; title: string; slug: string }

const props = defineProps<{ items: TocItem[] }>()

const active = ref('')
const nav = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!('IntersectionObserver' in window)) return
  const slugs = props.items.map((it) => it.slug)
  const passed = slugs.map(() => false)
  const position = new Map<Element, number>()
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const i = position.get(e.target)
        if (i !== undefined) passed[i] = e.isIntersecting
      }
      active.value = activeSlug(slugs, passed)
    },
    { rootMargin: '100000px 0px -70% 0px' }
  )
  slugs.forEach((slug, i) => {
    const el = document.getElementById(slug)
    if (!el) return
    position.set(el, i)
    observer!.observe(el)
  })
})

onBeforeUnmount(() => observer?.disconnect())

// 目錄本身比視窗高時（目錄可以捲動），把目前段落捲進目錄的可視範圍；只動目錄自己的 scrollTop，不捲整頁
watch(active, async () => {
  await nextTick()
  const box = nav.value
  const link = box?.querySelector<HTMLElement>('[aria-current]')
  if (!box || !link || box.scrollHeight <= box.clientHeight) return
  const top = link.offsetTop
  const bottom = top + link.offsetHeight
  if (top < box.scrollTop + 8) box.scrollTop = Math.max(0, top - 48)
  else if (bottom > box.scrollTop + box.clientHeight - 8) box.scrollTop = bottom - box.clientHeight + 48
})
</script>

<template>
  <nav ref="nav" class="post-toc" aria-label="本文目錄">
    <h2 class="side-block__title post-toc__title">本文目錄</h2>
    <ol class="post-toc__list">
      <li v-for="it in items" :key="it.slug" class="post-toc__item" :class="`post-toc__item--h${it.level}`">
        <a class="post-toc__link" :href="`#${it.slug}`" :aria-current="active === it.slug ? 'location' : undefined">{{ it.title }}</a>
      </li>
    </ol>
  </nav>
</template>
