<script setup lang="ts">
/**
 * 頁首 64px（v4：站徽加字標、導覽、右側按鈕；多語版型規格 G、H.3 節，主站首頁規格 G.2、G.3）。正本在 workspace 的 shared/shell/，部落格與工具共用。
 * 顯示文字一律經 text(key)（外殼字串的 ts），連結與 aria-current 由 shell-model.mjs 的 headerModel() 算，這裡不寫死任何字。
 *   - BLOG_LOCALES（zh-tw）：字標是 SITE_NAME，連全站首頁；導覽是工具、文章、關於，再接這支工具 nav 的頁
 *   - kind 'site-home'（外語首頁）：字標連 /<code>/ 並標 aria-current="page"；導覽只有一條「工具」連 /<code>/#tools
 *   - 其他語系：字標依 brand 用 siteName()；該語系的全站首頁已上線（siteHomes 有它）時連 /<code>/，沒上線連該語系的工具首頁
 *     （shell-model.mjs 的 FOREIGN_BRAND 與 foreignSiteHome()）；導覽只放這支工具的頁；不放全站搜尋
 *   - toolBrand（工具自己的品牌，站長 2026-11-12 決定，第一支是背景音樂站）：字標換成工具的 logo 與站名，連工具首頁，在工具首頁時 aria-current="page"；
 *     導覽不變（繁中頁照舊有工具、文章、關於，回得去卡斯伯工具），頁尾不受影響。英文小字站名 SITE_NAME_EN 不出：它是旁邊 SITE_NAME 的英文名，
 *     接在工具站名後面會讀成工具的英文名。不給時輸出跟沒有這個 prop 時逐字相同
 *   - 選單與語言面板都是 <details>，沒有 JS 也能用；有 JS 時按 Esc 或點外面會關掉，一次只開一個
 * 導覽輸出兩份：攤開版 .cs-hdr__nav 與 <details> 裡的 .cs-menu__panel；選單關著時 summary 以外不在無障礙樹上，任何時候只有一個導覽地標。
 * 斷點：1024px 以上英文小字站名才出現；768px 以上導覽攤開；640px 以下語言鈕只剩圖示；
 * 399px 以下字標 17px；359px 以下字標文字改成只給螢幕閱讀器。
 * compact（404）：頁首只放語言選單與選單鈕，導覽一律收在選單裡。
 * 插槽 actions：放在內建按鈕後面（部落格放 ⌘K 與深淺色鈕）。內建的 search、themeToggle 留給工具用。
 * 導覽分組：nav 的一項給 children 時畫成下拉選單（攤開版是 <details>，面板以 .cs-hdr__in 為定位基準，不會被捲動容器裁掉；
 * 選單裡是一行組名加縮排的子連結）。子連結是目前這頁時，組名標 data-current，不用 aria-current（summary 不是連結）。
 * 深淺色切換鈕預設不出：token 還沒有深色版（站長驗收前不做），出的話用 data-cs-theme-toggle 交給 inline script 處理。
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { SITE_NAME_EN } from './site.mjs'
import { BLOG_LOCALES } from './i18n/locales.mjs'
import { SHELL_LOGO } from './nav.mjs'
import { headerModel } from './shell-model.mjs'
import LanguageMenu from './LanguageMenu.vue'

type TextFn = (key: string, params?: Record<string, string | number>) => string
interface NavLink { label: string; href?: string; current?: boolean; children?: NavLink[] }
interface Target {
  code: string; href: string; exact: boolean; preview?: boolean
  autonym?: string; htmlLang?: string; hreflang?: string; homeOnly?: string | null
}
interface HeaderItem { key: string; label: string; href: string; current: 'page' | 'true' | null; children?: HeaderItem[] }
interface ToolBrand { label: string; logo: string; href: string; lang?: string | null }

const props = withDefaults(defineProps<{
  locale: string
  text: TextFn
  /** 這支工具同語系的頁（只放要進頁首的那些），label 是頁面語言 */
  nav?: NavLink[]
  /** 語言選單的目標（switchTargets）；單語工具給空陣列，少於兩項時不出選單 */
  languages?: Target[]
  /** 非 BLOG_LOCALES 語系的工具首頁：該語系的全站首頁還沒上線時，字標連這裡 */
  toolHome?: string
  /** 至少一支工具上線，頁首才輸出「工具」 */
  liveTools?: boolean
  /** 全站搜尋鈕（⌘K）：只有 BLOG_LOCALES 的頁、而且頁面有掛上搜尋功能時才開 */
  search?: boolean
  themeToggle?: boolean
  compact?: boolean
  /** 'site-home'：部落格的外語首頁（字標標 aria-current、導覽只有工具） */
  kind?: 'page' | 'site-home'
  /** 這一頁的網址（完整網址），導覽連結相同時標 aria-current="page" */
  currentUrl?: string
  /** 這一頁在哪一區（部落格 sectionOf()：tools、posts、about），導覽連結同一區時標 aria-current="true" */
  section?: string | null
  /** 已上線的外語全站首頁：外語工具頁的字標在這裡有頁面語系時連 /<code>/（FOREIGN_BRAND 'site-home'） */
  siteHomes?: string[]
  /**
   * 工具自己的品牌：label 是頁面語系的站名，logo 是正方形圖的網址（顯示 36px），href 是這個語系的工具首頁，
   * lang 是站名的語言跟頁面不同時的語言標籤。不給時字標是全站的 SITE_NAME 加小幽靈（shell-model.mjs 的 headerModel）
   */
  toolBrand?: ToolBrand | null
}>(), {
  nav: () => [], languages: () => [], liveTools: true, search: false, themeToggle: false, compact: false,
  kind: 'page', currentUrl: '', section: null, siteHomes: () => [],
})

const isBlogLocale = computed(() => BLOG_LOCALES.includes(props.locale))
const model = computed(() => headerModel({
  locale: props.locale,
  text: props.text,
  kind: props.kind,
  currentUrl: props.currentUrl,
  section: props.section,
  liveTools: props.liveTools,
  siteHomes: props.siteHomes,
  toolHome: props.toolHome ?? null,
  toolBrand: props.toolBrand ?? null,
}))
// 用 length 判斷，不跟字面值 '' 比：SITE_NAME_EN 在 P3 前後是不同的字面值，比較式會被型別檢查判成永遠成立或永遠不成立。
// 有 toolBrand 時不出：小字是 SITE_NAME 的英文名，接在工具站名後面會被讀成工具的英文名
const showEnName = computed(() => isBlogLocale.value && SITE_NAME_EN.length > 0 && !props.toolBrand)

const items = computed<HeaderItem[]>(() => [
  ...model.value.siteNav,
  ...props.nav.map(toItem),
])
function toItem(n: NavLink): HeaderItem {
  if (n.children?.length) {
    const children = n.children.map(toItem)
    return { key: `group:${n.label}`, label: n.label, href: '', current: children.some((c) => c.current) ? 'true' : null, children }
  }
  return { key: n.href ?? n.label, label: n.label, href: n.href ?? '', current: n.current ? 'page' : null }
}

// Esc、點外面關掉；打開一個就關掉其他的（語言面板與選單會疊在同一個位置）
const root = ref<HTMLElement | null>(null)
const openDetails = () => [...(root.value?.querySelectorAll('details[open]') ?? [])] as HTMLDetailsElement[]
function onKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  for (const d of openDetails()) {
    d.open = false
    if (d.contains(document.activeElement)) d.querySelector('summary')?.focus()
  }
}
function onPointer(e: Event) {
  for (const d of openDetails()) if (!d.contains(e.target as Node)) d.open = false
}
function onToggle(e: Event) {
  const t = e.target as HTMLDetailsElement
  if (t.tagName === 'DETAILS' && t.open) for (const d of openDetails()) if (d !== t) d.open = false
}
onMounted(() => {
  document.addEventListener('keydown', onKey)
  document.addEventListener('pointerdown', onPointer, true)
  root.value?.addEventListener('toggle', onToggle, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKey)
  document.removeEventListener('pointerdown', onPointer, true)
  root.value?.removeEventListener('toggle', onToggle, true)
})
</script>

<template>
  <header ref="root" class="cs-hdr" :class="{ 'cs-hdr--compact': compact }">
    <div class="cs-hdr__in">
      <a class="cs-hdr__brand" :href="model.brand.href" :aria-current="model.brand.current ? 'page' : undefined">
        <img class="cs-hdr__logo" :src="model.brand.logo ?? SHELL_LOGO.src" width="36" height="36" alt="" decoding="async">
        <span class="cs-hdr__name" :lang="model.brand.lang ?? undefined" :data-foreign="model.brand.lang ? '' : undefined">{{ model.brand.label }}</span>
        <span v-if="showEnName" class="cs-hdr__en" lang="en" data-foreign>{{ SITE_NAME_EN }}</span>
      </a>
      <nav v-if="items.length && !compact" class="cs-hdr__nav" :aria-label="text('nav.label')">
        <template v-for="item in items" :key="item.key">
          <details v-if="item.children" class="cs-hdr__group">
            <summary :data-current="item.current ? '' : undefined">
              {{ item.label }}
              <svg class="cs-hdr__caret" aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </summary>
            <div class="cs-hdr__drop">
              <a v-for="c in item.children" :key="c.key" :href="c.href" :aria-current="c.current ?? undefined">{{ c.label }}</a>
            </div>
          </details>
          <a v-else :href="item.href" :aria-current="item.current ?? undefined">{{ item.label }}</a>
        </template>
      </nav>
      <div class="cs-hdr__tools">
        <button v-if="search && isBlogLocale" type="button" class="cs-hbtn" data-cs-search :aria-label="text('search.open')" aria-keyshortcuts="Meta+K Control+K">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
        </button>
        <button v-if="themeToggle" type="button" class="cs-hbtn" data-cs-theme-toggle aria-pressed="false" :aria-label="text('theme.toggle')">
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /></svg>
        </button>
        <slot name="actions" />
        <LanguageMenu v-if="languages.length > 1" :current="locale" :targets="languages" :text="text" />
        <details v-if="items.length" class="cs-menu">
          <summary class="cs-hbtn cs-menu__btn">
            <span class="cs-hdr__vh cs-menu__when-closed">{{ text('menu.open') }}</span>
            <span class="cs-hdr__vh cs-menu__when-open">{{ text('menu.close') }}</span>
            <svg class="cs-menu__icon-open" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            <svg class="cs-menu__icon-close" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </summary>
          <nav class="cs-menu__panel" :aria-label="text('nav.label')">
            <template v-for="item in items" :key="item.key">
              <div v-if="item.children" class="cs-menu__group" role="group" :aria-labelledby="`cs-menu-${item.key}`">
                <span :id="`cs-menu-${item.key}`" class="cs-menu__group-label">{{ item.label }}</span>
                <a v-for="c in item.children" :key="c.key" :href="c.href" :aria-current="c.current ?? undefined">{{ c.label }}</a>
              </div>
              <a v-else :href="item.href" :aria-current="item.current ?? undefined">{{ item.label }}</a>
            </template>
          </nav>
        </details>
      </div>
    </div>
  </header>
</template>

<style>
@layer cs.base, cs.components, cs.utilities;
@layer cs.components {
  .cs-hdr { position: relative; z-index: 20; background: var(--cs-bg); border-block-end: var(--cs-size-border) solid var(--cs-line); }
  .cs-hdr__in {
    position: relative; display: flex; align-items: center; gap: 16px; min-block-size: var(--cs-size-header);
    inline-size: 100%; max-inline-size: calc(var(--cs-size-container) + 2 * var(--cs-size-gutter));
    margin-inline: auto; padding-inline: var(--cs-size-gutter); box-sizing: border-box;
  }
  .cs-hdr__brand {
    display: flex; align-items: center; gap: 10px; flex: none; min-block-size: var(--cs-size-tap);
    color: var(--cs-text); text-decoration: none;
  }
  .cs-hdr__brand:hover { color: var(--cs-text); }
  .cs-hdr__logo { inline-size: var(--cs-size-logo-header); block-size: var(--cs-size-logo-header); object-fit: contain; flex: none; }
  .cs-hdr__name { font-size: 19px; line-height: 24px; font-weight: 800; letter-spacing: .01em; white-space: nowrap; }
  .cs-hdr__en { display: none; font-family: var(--cs-lang-accent); font-size: 14px; line-height: 20px; font-weight: 800; color: var(--cs-text-2); white-space: nowrap; }

  /* 導覽是捲動容器（overflow-x: auto 連帶 overflow-y 也是 auto），框外的焦點框會被裁掉：
     四周留焦點框的寬度加間距當 padding，再用一樣大的負 margin 抵掉，版面位置與大小不變 */
  .cs-hdr__nav {
    display: none; gap: 4px; min-inline-size: 0; overflow-x: auto; scrollbar-width: none;
    padding: calc(var(--cs-size-focus-ring) + var(--cs-size-focus-offset)); margin: calc(-1 * (var(--cs-size-focus-ring) + var(--cs-size-focus-offset)));
  }
  .cs-hdr__nav::-webkit-scrollbar { display: none; }
  .cs-hdr__nav a, .cs-menu__panel a {
    display: inline-flex; align-items: center; min-block-size: var(--cs-size-tap); padding-inline: 12px; border-radius: var(--cs-radius-input);
    color: var(--cs-text-2); font-size: 15px; line-height: 20px; font-weight: 700; text-decoration: none; white-space: nowrap;
  }
  .cs-hdr__nav a:hover, .cs-menu__panel a:hover { background: var(--cs-section); color: var(--cs-text); }
  .cs-hdr__nav a[aria-current], .cs-menu__panel a[aria-current] { background: var(--cs-soft); color: var(--cs-link); }

  /* 下拉分組：details 不設定位，面板以 .cs-hdr__in 為基準（脫離 .cs-hdr__nav 的捲動容器才不會被裁掉），
     水平位置用靜態位置（left 不設），剛好在組名下方 */
  .cs-hdr__group { position: static; flex: none; }
  .cs-hdr__group > summary {
    display: inline-flex; align-items: center; gap: 4px; min-block-size: var(--cs-size-tap); padding-inline: 12px; border-radius: var(--cs-radius-input);
    color: var(--cs-text-2); font-size: 15px; line-height: 20px; font-weight: 700; white-space: nowrap; cursor: pointer; list-style: none;
  }
  .cs-hdr__group > summary::-webkit-details-marker { display: none; }
  .cs-hdr__group > summary:hover { background: var(--cs-section); color: var(--cs-text); }
  .cs-hdr__group > summary[data-current], .cs-hdr__group[open] > summary { background: var(--cs-soft); color: var(--cs-link); }
  .cs-hdr__caret { flex: none; transition: transform .15s; }
  .cs-hdr__group[open] .cs-hdr__caret { transform: rotate(180deg); }
  .cs-hdr__drop {
    position: absolute; inset-block-start: calc(100% - 6px); z-index: 30;
    display: flex; flex-direction: column; min-inline-size: 200px; padding: 6px; box-sizing: border-box;
    background: var(--cs-bg); border: var(--cs-size-border) solid var(--cs-line); border-radius: var(--cs-radius-button);
    box-shadow: var(--cs-shadow-card), 0 12px 28px rgba(33, 37, 41, .14);
  }
  .cs-hdr__drop a { color: var(--cs-text); }
  .cs-menu__group { display: flex; flex-direction: column; }
  .cs-menu__group-label { padding: 10px 12px 2px; color: var(--cs-mute); font-size: 13px; font-weight: 700; }
  .cs-menu__panel .cs-menu__group a { padding-inline-start: 24px; }

  .cs-hdr__tools { display: flex; align-items: center; gap: 4px; margin-inline-start: auto; flex: none; }
  .cs-hbtn {
    display: inline-flex; align-items: center; justify-content: center; inline-size: var(--cs-size-tap); block-size: var(--cs-size-tap);
    padding: 0; border: 0; border-radius: var(--cs-radius-input); background: transparent; color: var(--cs-text-2);
    cursor: pointer; list-style: none;
  }
  .cs-hbtn::-webkit-details-marker { display: none; }
  .cs-hbtn:hover { background: var(--cs-section); color: var(--cs-text); }

  .cs-menu { position: static; }
  .cs-menu[open] > .cs-menu__btn { background: var(--cs-soft); color: var(--cs-link); }
  .cs-menu__icon-close, .cs-menu[open] .cs-menu__icon-open, .cs-menu__when-open, .cs-menu[open] .cs-menu__when-closed { display: none; }
  .cs-menu[open] .cs-menu__icon-close, .cs-menu[open] .cs-menu__when-open { display: block; }
  .cs-menu[open] .cs-menu__when-open { display: inline; }
  .cs-menu__panel {
    position: absolute; inset-inline-end: var(--cs-size-gutter); inset-block-start: 100%; z-index: 30;
    display: flex; flex-direction: column; min-inline-size: 240px; max-inline-size: calc(100vw - 2 * var(--cs-size-gutter));
    max-block-size: calc(100dvh - var(--cs-size-header) - 90px); overflow: auto; padding: 6px; box-sizing: border-box;
    background: var(--cs-bg); border: var(--cs-size-border) solid var(--cs-line); border-radius: var(--cs-radius-button);
    box-shadow: var(--cs-shadow-card), 0 12px 28px rgba(33, 37, 41, .14);
  }
  .cs-menu__panel a { white-space: normal; color: var(--cs-text); }

  .cs-hdr__vh {
    position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap;
  }

  /* 768px 以上導覽攤開，選單鈕收起來（404 的 compact 例外：導覽一律在選單裡） */
  @media (min-width: 768px) {
    .cs-hdr:not(.cs-hdr--compact) .cs-hdr__nav { display: flex; }
    .cs-hdr:not(.cs-hdr--compact) .cs-menu { display: none; }
  }
  @media (min-width: 1024px) {
    .cs-hdr__in { gap: 28px; }
    .cs-hdr__en { display: inline; }
  }
  @media (max-width: 639px) {
    .cs-hdr__in { padding-inline: 16px; gap: 8px; }
    .cs-menu__panel { inset-inline: 0; min-inline-size: 0; max-inline-size: none; border-radius: 0 0 var(--cs-radius-button) var(--cs-radius-button); }
  }
  @media (max-width: 399px) {
    .cs-hdr__name { font-size: 17px; }
  }
  /* 320px 這類窄螢幕：字標文字只給螢幕閱讀器，留站徽 */
  @media (max-width: 359px) {
    .cs-hdr__name { position: absolute; inline-size: 1px; block-size: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  }
}
</style>
