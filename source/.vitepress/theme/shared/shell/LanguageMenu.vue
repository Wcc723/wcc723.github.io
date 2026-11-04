<script setup lang="ts">
/**
 * 語言選單（多語版型規格 F 節）。正本在 workspace 的 shared/shell/，由 shell-sync 複製進工具與部落格，不手改副本。
 *   variant 'menu'：頁首的 <details data-cs-lang>，沒有 JS 也能開關（404 不 hydrate）
 *   variant 'list'：頁尾「語言」列的同一組連結，不帶 data-cs-lang（audit J18 只數頁首那一份）；外層的 <nav> 由呼叫端加標籤
 * 面板用 position: absolute 對齊最近的定位祖先（SiteHeader 的內層容器），手機版撐滿整排。
 * 規則：
 *   - 一般 <a href> 整頁載入，不用國旗、不自動轉址；選項順序照 targets（由 urls.mjs 的 switchTargets() 依 LOCALES 排好）
 *   - 連結字是 autonym，lang 標連結字本身的語言、hreflang 標目標頁的語言
 *   - 目前語系是不連結的 <span aria-current="true">
 *   - 目標語系沒有這一頁時連到它的工具首頁，標 data-fallback，用目標語系的 lang.homeOnly 說明
 *   - preview 建置才有的語系標 data-preview
 *   - 退路說明前的間隔用 noteSeparator()：全形括號開頭的（「（工具首頁）」）直接接上，半形的前面加一個空白
 * 單語工具不輸出這個元件；列得出的語系少於兩個時（例如骨架期只有根語系發布）也什麼都不畫，一項的選單沒有用。
 */
import { computed } from 'vue'
import { LOCALE } from './i18n/locales.mjs'
import { noteSeparator } from './i18n/format.mjs'

type TextFn = (key: string, params?: Record<string, string | number>) => string
interface Target {
  code: string
  href: string
  exact: boolean
  preview?: boolean
  autonym?: string
  htmlLang?: string
  hreflang?: string
  /** 目標語系的 lang.homeOnly；exact 為 false 時才用得到 */
  homeOnly?: string | null
}

const props = withDefaults(defineProps<{
  /** 目前語系代碼 */
  current: string
  targets: Target[]
  /** 外殼字串：已代入 {site}、{author}、{autonym} 的 ts(key) */
  text: TextFn
  variant?: 'menu' | 'list'
}>(), { variant: 'menu' })

// 登錄表補齊顯示資料：targets 沒帶 autonym、htmlLang、hreflang 的時候（例如部落格自己組的清單）照登錄表
const items = computed(() => props.targets.map((t) => {
  const l = LOCALE[t.code as keyof typeof LOCALE]
  if (!l) throw new Error(`LanguageMenu：未知的語系 ${t.code}`)
  return {
    code: t.code,
    href: t.href,
    current: t.code === props.current,
    fallback: !t.exact,
    preview: !!t.preview,
    autonym: t.autonym ?? l.autonym,
    htmlLang: t.htmlLang ?? l.htmlLang,
    hreflang: t.hreflang ?? l.hreflang,
    homeOnly: t.exact ? null : (t.homeOnly ?? null),
  }
}))
const currentItem = computed(() => items.value.find((i) => i.current))
const show = computed(() => items.value.length > 1)
const pageLang = computed(() => LOCALE[props.current as keyof typeof LOCALE]?.htmlLang)
</script>

<template>
  <details v-if="variant === 'menu' && show" class="cs-lang" data-cs-lang>
    <summary class="cs-lang__btn" :aria-label="text('lang.summary')">
      <svg class="cs-lang__globe" aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z" /></svg>
      <span class="cs-lang__current" :lang="currentItem?.htmlLang">{{ currentItem?.autonym }}</span>
      <svg class="cs-lang__chev" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
    </summary>
    <ul class="cs-lang__list" :aria-label="text('lang.label')">
      <li v-for="item in items" :key="item.code">
        <span v-if="item.current" class="cs-lang__item cs-lang__item--current" aria-current="true" :lang="item.htmlLang">{{ item.autonym }}</span>
        <a
          v-else
          class="cs-lang__item"
          :href="item.href"
          :hreflang="item.hreflang"
          :lang="item.htmlLang"
          :data-foreign="item.htmlLang !== pageLang ? '' : undefined"
          :data-fallback="item.fallback ? '' : undefined"
          :data-preview="item.preview ? '' : undefined"
        >{{ item.autonym }}<span v-if="item.homeOnly" class="cs-lang__note">{{ noteSeparator(item.homeOnly) }}{{ item.homeOnly }}</span></a>
      </li>
    </ul>
  </details>
  <ul v-else-if="variant === 'list' && show" class="cs-langlist">
    <li v-for="item in items" :key="item.code">
      <span v-if="item.current" class="cs-langlist__item cs-langlist__item--current" aria-current="true" :lang="item.htmlLang">{{ item.autonym }}</span>
      <a
        v-else
        class="cs-langlist__item"
        :href="item.href"
        :hreflang="item.hreflang"
        :lang="item.htmlLang"
        :data-foreign="item.htmlLang !== pageLang ? '' : undefined"
        :data-fallback="item.fallback ? '' : undefined"
        :data-preview="item.preview ? '' : undefined"
      >{{ item.autonym }}<span v-if="item.homeOnly" class="cs-langlist__note">{{ noteSeparator(item.homeOnly) }}{{ item.homeOnly }}</span></a>
    </li>
  </ul>
</template>

<style>
@layer cs.base, cs.components, cs.utilities;
@layer cs.components {
  .cs-lang { position: static; }
  .cs-lang__btn {
    display: inline-flex; align-items: center; gap: 8px; min-block-size: var(--cs-size-tap); min-inline-size: 128px;
    padding-inline: 12px; border: var(--cs-size-border) solid var(--cs-line); border-radius: var(--cs-radius-input);
    background: var(--cs-bg); color: var(--cs-text); font-size: 15px; line-height: 20px; font-weight: 700;
    cursor: pointer; list-style: none; white-space: nowrap; user-select: none;
  }
  .cs-lang__btn::-webkit-details-marker { display: none; }
  .cs-lang__btn:hover { background: var(--cs-section); }
  .cs-lang[open] > .cs-lang__btn { background: var(--cs-soft); border-color: var(--cs-subtle); color: var(--cs-link); }
  .cs-lang__globe, .cs-lang__chev { flex: none; }
  .cs-lang__current { flex: 1 1 auto; }
  .cs-lang__chev { color: var(--cs-mute); transition: transform .12s; }
  /* 鈕的底色變成 --cs-section、--cs-soft 時，--cs-mute 不到 4.5:1（主站首頁規格 G.7），箭頭跟著換色 */
  .cs-lang__btn:hover .cs-lang__chev { color: var(--cs-text-2); }
  .cs-lang[open] .cs-lang__chev { transform: rotate(180deg); color: var(--cs-link); }
  /* 面板：頁首底下，不蓋到底部 90px 的錨定廣告區（規格 H.3） */
  .cs-lang__list {
    position: absolute; inset-inline-end: var(--cs-size-gutter); inset-block-start: 100%; z-index: 30;
    min-inline-size: 240px; max-inline-size: calc(100vw - 2 * var(--cs-size-gutter));
    max-block-size: calc(100dvh - var(--cs-size-header) - 90px); overflow: auto;
    margin: 0; padding: 6px; list-style: none; background: var(--cs-bg);
    border: var(--cs-size-border) solid var(--cs-line); border-radius: var(--cs-radius-button);
    box-shadow: var(--cs-shadow-card), 0 12px 28px rgba(33, 37, 41, .14);
  }
  .cs-lang__item {
    display: flex; align-items: center; flex-wrap: wrap; gap: 0 4px; min-block-size: var(--cs-size-tap); padding-inline: 12px;
    border-radius: var(--cs-radius-sm); color: var(--cs-text); font-size: 15px; line-height: 20px; font-weight: 700; text-decoration: none;
  }
  a.cs-lang__item:hover { background: var(--cs-section); color: var(--cs-link); }
  .cs-lang__item--current { background: var(--cs-soft); color: var(--cs-link); }
  /* 頁首面板的說明在白底上用 --cs-mute（4.69:1）；滑過時底色變 --cs-section，改用 --cs-text-2。
     頁尾語言列在 --cs-section 底上，一律 --cs-text-2（--cs-mute 只有 4.45:1，主站首頁規格 G.7） */
  .cs-lang__note, .cs-langlist__note { font-size: 13px; font-weight: 400; }
  .cs-lang__note { color: var(--cs-mute); }
  a.cs-lang__item:hover .cs-lang__note { color: var(--cs-text-2); }
  .cs-langlist__note { color: var(--cs-text-2); }
  .cs-lang__item[data-preview], .cs-langlist__item[data-preview] { text-decoration: underline dashed var(--cs-line-2); text-underline-offset: 4px; }

  .cs-langlist { display: flex; flex-wrap: wrap; gap: 0 16px; margin: 0; padding: 0; list-style: none; }
  .cs-langlist__item {
    display: inline-flex; align-items: center; flex-wrap: wrap; gap: 0 4px; min-block-size: var(--cs-size-tap);
    color: var(--cs-text-2); font-size: 15px; text-decoration: none;
  }
  a.cs-langlist__item:hover { color: var(--cs-link); text-decoration: underline; }
  .cs-langlist__item--current { color: var(--cs-text); font-weight: 700; }

  /* 640px 以下：語言鈕只剩地球圖示，autonym 留給 aria-label；面板改成頁首底下整排 */
  @media (max-width: 639px) {
    .cs-lang__btn { min-inline-size: var(--cs-size-tap); inline-size: var(--cs-size-tap); justify-content: center; padding: 0; }
    .cs-lang__current, .cs-lang__chev {
      position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap;
    }
    .cs-lang__list { inset-inline: 0; min-inline-size: 0; max-inline-size: none; border-radius: 0 0 var(--cs-radius-button) var(--cs-radius-button); }
  }
}
</style>
