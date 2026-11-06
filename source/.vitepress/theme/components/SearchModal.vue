<script setup lang="ts">
// ⌘K 搜尋：打開時才 fetch /content.json（只比對標題、分類、標籤），再併入已上線的工具。
// 工具：S 版起讀 fm.site.tools（siteToolLinks() 的結果，主站首頁規格 F.7）；沒有 fm.site 的頁（S 之前）照舊讀 theme/tools.mjs。
// 快捷鍵：⌘K 或 Ctrl K 開關，/ 打開，Esc 關閉；↑↓ 切換結果，Enter 開啟（整頁載入）。
// v-if 控制，SSR 不輸出這個視窗；它放在版面根元素 .vp-raw 裡面，結果連結不會被 VitePress 的路由攔下。
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { useSearch } from '../composables/search'
import { buildPostIndex, buildSiteToolIndex, buildToolIndex, searchIndex, highlightParts } from '../utils/search.mjs'
import { liveTools } from '../tools.mjs'
import { useSite } from '../composables/site'

type Entry = { kind: 'post' | 'tool'; title: string; url: string; date?: string; category?: string; description?: string; hay: string }

const LIMIT = 50
const { open, openSearch, closeSearch } = useSearch()
const site = useSite()
const tools = computed<Entry[]>(() => (site.value ? buildSiteToolIndex(site.value.tools) : buildToolIndex(liveTools())))

const query = ref('')
const index = ref<Entry[] | null>(null)
const failed = ref(false)
const active = ref(0)
const input = ref<HTMLInputElement | null>(null)
const box = ref<HTMLElement | null>(null)
const list = ref<HTMLElement | null>(null)
let loading = false

const postCount = computed(() => (index.value ? index.value.filter((e) => e.kind === 'post').length : 0))
const results = computed<Entry[]>(() => (index.value ? searchIndex(index.value, query.value, LIMIT) : []))
const placeholder = computed(() => (tools.value.length ? '搜尋文章或工具' : '搜尋文章標題、分類或標籤'))
const status = computed(() => {
  if (failed.value) return '無法載入搜尋索引，請稍後再試。'
  if (!index.value) return '載入中…'
  const q = query.value.trim()
  if (!q) return `輸入關鍵字開始搜尋，比對標題、分類和標籤，共 ${postCount.value} 篇文章。`
  if (!results.value.length) return `找不到「${q}」相關的文章${tools.value.length ? '或工具' : ''}。`
  return `「${q}」找到 ${results.value.length} 筆${results.value.length >= LIMIT ? `，只列出前 ${LIMIT} 筆` : ''}。`
})

async function load() {
  if (index.value || loading) return
  loading = true
  failed.value = false
  try {
    const res = await fetch(withBase('/content.json'))
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    index.value = [...tools.value, ...buildPostIndex(await res.json())]
  } catch {
    failed.value = true
  } finally {
    loading = false
  }
}

watch(open, async (isOpen) => {
  if (isOpen) {
    document.documentElement.style.overflow = 'hidden'
    load()
    await nextTick()
    input.value?.focus()
  } else {
    document.documentElement.style.overflow = ''
    query.value = ''
    active.value = 0
  }
})

watch(query, () => {
  active.value = 0
})

function scrollActive() {
  nextTick(() => list.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }))
}

function go(i: number) {
  const hit = results.value[i]
  if (hit) window.location.href = hit.url
}

function onInputKey(e: KeyboardEvent) {
  const n = results.value.length
  if (e.key === 'ArrowDown' && n) {
    e.preventDefault()
    active.value = (active.value + 1) % n
    scrollActive()
  } else if (e.key === 'ArrowUp' && n) {
    e.preventDefault()
    active.value = (active.value - 1 + n) % n
    scrollActive()
  } else if (e.key === 'Enter' && !e.isComposing) {
    e.preventDefault()
    go(active.value)
  }
}

// Tab 只在視窗裡面循環（輸入框和關閉鈕）
function trapFocus(e: KeyboardEvent) {
  if (e.key !== 'Tab' || !box.value) return
  const items = [...box.value.querySelectorAll<HTMLElement>('input, button:not([disabled])')]
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))

function onGlobalKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    if (open.value) closeSearch()
    else openSearch()
  } else if (e.key === '/' && !open.value && !isTyping(e.target)) {
    e.preventDefault()
    openSearch()
  } else if (e.key === 'Escape' && open.value) {
    e.preventDefault()
    closeSearch()
  }
}

onMounted(() => window.addEventListener('keydown', onGlobalKey))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onGlobalKey)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <div v-if="open" class="search-modal vp-raw" role="dialog" aria-modal="true" aria-label="搜尋" @keydown="trapFocus">
    <div class="search-modal__backdrop" @click="closeSearch()"></div>
    <div ref="box" class="search-modal__box">
      <div class="search-modal__top">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.6-3.6" />
        </svg>
        <input
          ref="input"
          v-model="query"
          class="search-modal__input"
          type="search"
          role="combobox"
          aria-label="搜尋關鍵字"
          aria-autocomplete="list"
          aria-controls="search-results"
          :aria-expanded="results.length ? 'true' : 'false'"
          :aria-activedescendant="results.length ? `search-hit-${active}` : undefined"
          :placeholder="placeholder"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          enterkeyhint="go"
          @keydown="onInputKey"
        />
        <button type="button" class="icon-btn" aria-label="關閉搜尋" @click="closeSearch()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <p class="search-modal__status" role="status" aria-live="polite">{{ status }}</p>
      <ul id="search-results" ref="list" class="search-modal__results" role="listbox" aria-label="搜尋結果">
        <li
          v-for="(hit, i) in results"
          :id="`search-hit-${i}`"
          :key="hit.url"
          class="search-hit"
          role="option"
          :aria-selected="i === active ? 'true' : 'false'"
          @mousemove="active = i"
        >
          <a :href="hit.url" tabindex="-1">
            <span class="search-hit__title">
              <span v-if="hit.kind === 'tool'" class="chip search-hit__kind">工具</span>
              <template v-for="(part, k) in highlightParts(hit.title, query)" :key="k">
                <mark v-if="part.hit">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
            <span v-if="hit.kind === 'tool'" class="search-hit__meta">{{ hit.description }}</span>
            <span v-else class="search-hit__meta"><span class="en">{{ hit.date?.replaceAll('-', '.') }}</span><template v-if="hit.category">，{{ hit.category }}</template></span>
          </a>
        </li>
      </ul>
      <div class="search-modal__foot">
        <span class="search-modal__keys">↑↓ 切換，Enter 開啟，Esc 關閉</span>
        <span>共 {{ postCount }} 篇文章</span>
      </div>
    </div>
  </div>
</template>
