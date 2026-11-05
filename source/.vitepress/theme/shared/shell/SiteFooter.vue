<script setup lang="ts">
/**
 * 頁尾（v4：淺灰底、上框線；多語版型規格 F、G 節，主站首頁規格 E.4、G.2、G.4）。正本在 workspace 的 shared/shell/，部落格與工具共用。
 * 內容一律來自 shell-model.mjs 的 footerModel()，這裡只顯示。由上到下：
 *   站徽加站名（BLOG_LOCALES 的頁另有一句頁尾說明）、連結組、語言列（列得出兩個以上語系時才有）、外語頁的全站與法務連結、署名或版權。
 *   - 連結組照順序：工具（tools.json 有工具才有，自己那支標 aria-current）、這支工具、BLOG_LOCALES 的頁再接文章、熱門主題、關於本站、
 *     卡斯伯的其他地方四組。BLOG_LOCALES 的頁每組是 <nav aria-label> 加 <h2>，跟部落格 P2 的頁尾相同；外語頁的組標題是 <p class="cs-ftr__h">
 *   - BLOG_LOCALES 的頁：署名「© 卡斯伯，站名」，站名連到 /about/；沒有另外的全站與法務列（法務在「關於本站」那組）
 *   - 其他語系：全站首頁、部落格、關於、聯絡與法務一列，連結字用頁面語言；連到別的語言時接 inChinese 或 inEnglish、
 *     <a> 加目的地的 hreflang；全站首頁、關於在該語系的首頁上線後改連 /<code>/
 *   - 法務：一律經 legalLink()；Impressum、外部送信要登錄表有旗標、而且有網址才放
 *   - 站外連結只加一個 aria-hidden 的外連圖示，不加 rel、不開新分頁；工具名是外語時包 <span lang data-foreign>
 * 語言列標題的 id 寫死 cs-ftr-lang：一頁只有一個頁尾。
 */
import { computed } from 'vue'
import { SITE_NAME } from './site.mjs'
import { BLOG_LOCALES } from './i18n/locales.mjs'
import { siteName } from './i18n/seo.mjs'
import { SHELL_LOGO } from './nav.mjs'
import { brandLang, footerModel } from './shell-model.mjs'
import type { SiteToolLink } from './tools.mjs'
import LanguageMenu from './LanguageMenu.vue'

type TextFn = (key: string, params?: Record<string, string | number>) => string
interface NavLink { label: string; href: string; current?: boolean }
interface Target {
  code: string; href: string; exact: boolean; preview?: boolean
  autonym?: string; htmlLang?: string; hreflang?: string; homeOnly?: string | null
}

const props = withDefaults(defineProps<{
  locale: string
  text: TextFn
  /** 「這支工具」那一組的標題（工具名，頁面語言） */
  toolName?: string
  /** 這支工具同語系的每一頁 */
  toolNav?: NavLink[]
  /** 語言列的目標（switchTargets，或部落格的 languageTargets）；單語工具給空陣列，少於兩項時不出語言列 */
  languages?: Target[]
  /** 'site-home'：部落格的外語首頁 */
  kind?: 'page' | 'site-home'
  /** 工具組：tools.mjs 的 siteToolLinks() 結果；空陣列時整組不輸出 */
  siteTools?: SiteToolLink[]
  /** 已上線的外語全站首頁：部落格傳 clusterCodes(plan)（live 建置等於 plan.published，preview 建置是 plan.pages），工具傳 tools.json 的 siteHomes */
  siteHomes?: string[]
  /** 這一頁的網址（完整網址），外語頁的全站與法務連結相同時標 aria-current="page" */
  currentUrl?: string
}>(), { toolName: '', toolNav: () => [], languages: () => [], kind: 'page', siteTools: () => [], siteHomes: () => [], currentUrl: '' })

const isBlogLocale = computed(() => BLOG_LOCALES.includes(props.locale))
const brandName = computed(() => (isBlogLocale.value ? SITE_NAME : siteName(props.locale)))
const brandForeign = computed(() => brandLang(props.locale))
const model = computed(() => footerModel({
  locale: props.locale,
  text: props.text,
  kind: props.kind,
  currentUrl: props.currentUrl,
  siteTools: props.siteTools,
  siteHomes: props.siteHomes,
  toolName: props.toolName,
  toolNav: props.toolNav,
}))
const bottomLinks = computed(() => [...model.value.site, ...model.value.legal])
</script>

<template>
  <footer class="cs-ftr">
    <div class="cs-ftr__in">
      <div class="cs-ftr__top">
        <div class="cs-ftr__about">
          <span class="cs-ftr__brand">
            <img class="cs-ftr__logo" :src="SHELL_LOGO.src" width="28" height="28" alt="" decoding="async" loading="lazy">
            <span :lang="brandForeign ?? undefined" :data-foreign="brandForeign ? '' : undefined">{{ brandName }}</span>
          </span>
          <p v-if="model.tagline" class="cs-ftr__tagline">{{ model.tagline }}</p>
        </div>
        <div v-if="model.groups.length" class="cs-ftr__groups">
          <!-- 這支工具那組：第一項就是工具名（首頁），標題只給螢幕閱讀器，畫面上不重複 -->
          <nav v-for="g in model.groups" :key="g.id" class="cs-ftr__group" :class="`cs-ftr__group--${g.id}`" :aria-label="g.title || undefined">
            <h2 v-if="g.heading === 'h2'" class="cs-ftr__h">{{ g.title }}</h2>
            <p v-else-if="g.id !== 'tool'" class="cs-ftr__h">{{ g.title }}</p>
            <ul class="cs-ftr__links">
              <li v-for="l in g.links" :key="l.key">
                <a :href="l.href" :hreflang="l.hreflang" :aria-current="l.current ? 'page' : undefined">{{ l.before }}<span v-if="l.lang" :lang="l.lang" data-foreign>{{ l.label }}</span><template v-else>{{ l.label }}</template>{{ l.after }}<svg v-if="l.external" class="cs-ftr__ext" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8" /></svg></a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <nav v-if="languages.length > 1" class="cs-ftr__group cs-ftr__langs" aria-labelledby="cs-ftr-lang">
        <h2 v-if="isBlogLocale" id="cs-ftr-lang" class="cs-ftr__h">{{ text('footer.languages') }}</h2>
        <p v-else id="cs-ftr-lang" class="cs-ftr__h">{{ text('footer.languages') }}</p>
        <LanguageMenu variant="list" :current="locale" :targets="languages" :text="text" />
      </nav>
      <div class="cs-ftr__bottom">
        <ul v-if="bottomLinks.length" class="cs-ftr__links">
          <li v-for="item in bottomLinks" :key="item.key"><a :href="item.href" :hreflang="item.hreflang" :aria-current="item.current ? 'page' : undefined">{{ item.label }}</a></li>
        </ul>
        <p v-if="model.signature" class="cs-ftr__copy">{{ model.signature.before }}<a :href="model.signature.href">{{ model.signature.site }}</a>{{ model.signature.after }}</p>
        <p v-else-if="model.copyright" class="cs-ftr__copy">{{ model.copyright }}</p>
      </div>
    </div>
  </footer>
</template>

<style>
@layer cs.base, cs.components, cs.utilities;
@layer cs.components {
  .cs-ftr { margin-block-start: 64px; background: var(--cs-section); border-block-start: var(--cs-size-border) solid var(--cs-line); color: var(--cs-text-2); }
  .cs-ftr__in {
    display: flex; flex-direction: column; gap: 20px; box-sizing: border-box; inline-size: 100%;
    max-inline-size: calc(var(--cs-size-container) + 2 * var(--cs-size-gutter));
    margin-inline: auto; padding: 28px var(--cs-size-gutter);
  }
  .cs-ftr__top { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 16px 32px; }
  .cs-ftr__about { display: flex; flex-direction: column; gap: 4px; max-inline-size: 320px; }
  .cs-ftr__brand { display: flex; align-items: center; gap: 10px; min-block-size: var(--cs-size-tap); color: var(--cs-text); font-size: 16px; font-weight: 800; }
  .cs-ftr__logo { inline-size: var(--cs-size-logo-footer); block-size: var(--cs-size-logo-footer); object-fit: contain; flex: none; }
  .cs-ftr__tagline { margin: 0; color: var(--cs-text-2); font-size: 14px; line-height: 1.6; }
  .cs-ftr__groups { display: flex; flex-wrap: wrap; gap: 16px 40px; min-inline-size: 0; }
  .cs-ftr__group { display: flex; flex-direction: column; align-items: flex-start; gap: 0; min-inline-size: 0; }
  /* 這支工具的連結自成一列、排在四組上面（E.4 的順序）；不被 .cs-ftr__groups 拉到整列高、浮在中間 */
  .cs-ftr__group--tool { flex-direction: row; flex-wrap: wrap; align-items: center; align-self: flex-start; flex-basis: 100%; gap: 0 20px; }
  .cs-ftr__h { margin: 0; color: var(--cs-text); font-size: 15px; line-height: 20px; font-weight: 700; letter-spacing: 0; }
  .cs-ftr__links { display: flex; flex-wrap: wrap; gap: 0 20px; margin: 0; padding: 0; list-style: none; min-inline-size: 0; }
  .cs-ftr__group:not(.cs-ftr__group--tool) > .cs-ftr__links { flex-direction: column; gap: 0; }
  .cs-ftr__links a {
    display: inline-flex; align-items: center; gap: 4px; min-block-size: var(--cs-size-tap);
    color: var(--cs-text-2); font-size: 15px; text-decoration: none; overflow-wrap: anywhere;
  }
  .cs-ftr__links a:hover { color: var(--cs-link); text-decoration: underline; text-underline-offset: 4px; }
  .cs-ftr__links a[aria-current] { color: var(--cs-text); font-weight: 700; }
  .cs-ftr__ext { flex: none; }
  .cs-ftr__langs { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 0 20px; }
  .cs-ftr__bottom {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 32px;
    padding-block-start: 16px; border-block-start: 1px solid var(--cs-line-2);
  }
  .cs-ftr__bottom > .cs-ftr__links { flex-direction: row; }
  .cs-ftr__copy { margin: 0; font-size: 14px; color: var(--cs-text-2); }
  .cs-ftr__copy a { color: var(--cs-link); text-underline-offset: 4px; }
  @media (max-width: 639px) {
    .cs-ftr__in { padding-inline: 16px; }
    .cs-ftr__group--tool, .cs-ftr__langs { flex-direction: column; align-items: flex-start; }
  }
}
</style>
