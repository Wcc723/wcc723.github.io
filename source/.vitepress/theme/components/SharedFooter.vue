<script setup lang="ts">
// 共用頁尾（theme/shared/shell/SiteFooter.vue）的部落格接線（主站首頁規格 E.4、G.4、G.5）。資料全部來自 fm.site（useSite()）。
// 只在 __CS_SHARED_SHELL__ 為 true 時由 Layout.vue 載入（S 版起，或 preview 建置）。
//   - 工具組：fm.site.tools（siteToolLinks()），空的時候整組不輸出
//   - 語言列：fm.site.languages，跟頁首的語言選單同一組
//   - 外語頁的「首頁」「關於」：fm.site.siteHomes（lib/site-shell.mjs 寫的叢集）有該語系時連 /<code>/、/<code>/#about
import SiteFooter from '../shared/shell/SiteFooter.vue'
import { useSite } from '../composables/site'
import '../styles/shared-shell.css'

const site = useSite()
</script>

<template>
  <SiteFooter
    v-if="site"
    :locale="site.locale"
    :text="site.text"
    :kind="site.kind"
    :languages="site.languages"
    :site-tools="site.tools"
    :site-homes="site.siteHomes"
    :current-url="site.canonical"
  />
</template>
