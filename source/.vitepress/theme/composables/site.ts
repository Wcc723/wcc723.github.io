import { computed, type ComputedRef } from 'vue'
import { useData } from 'vitepress'
import { formatShell } from '../shared/shell/i18n/shell-strings.mjs'

// fm.site（lib/site-shell.mjs 的 siteFrontmatter() 寫的，主站首頁規格 G.4）：共用頁首頁尾與外語首頁要的資料。
// 外語首頁一律有；其他頁只在用共用頁首頁尾時有（lib/site-home.mjs 的 effectiveShell()：S 版起，或 preview 建置）。
// 字串只有當頁語系的那一份（fm.site.shell），text() 用 formatShell 代入佔位符；缺 key 直接丟錯，不讓 {x} 或空字串漏到頁面上。
// 不 import lib/：資料都在 Node 端算好放在 frontmatter。

type Params = Record<string, string | number>
export type TextFn = (key: string, params?: Params) => string

export interface SiteData {
  locale: string
  kind: 'page' | 'site-home'
  text: TextFn
  tools: any[]
  languages: any[]
  siteHomes: string[]
  section: string
  canonical: string
  home: any | null
  /** preview 建置的外語首頁是 true（根元素加 cs-preview、head 加 noindex），頁面上不放提示 */
  preview: boolean
  notFoundIntl: any[]
}

/** fm.site 不存在時（S 之前的一般頁，或 vitepress dev 的 404）值是 null */
export function useSite(): ComputedRef<SiteData | null> {
  const { frontmatter } = useData()
  return computed(() => {
    const s = frontmatter.value.site
    if (!s) return null
    const text: TextFn = (key, params = {}) => {
      const template = s.shell?.[key]
      if (typeof template !== 'string' || !template) throw new Error(`fm.site.shell 沒有 ${key}（語系 ${s.locale}）`)
      return formatShell(template, s.locale, params)
    }
    return {
      locale: s.locale,
      kind: s.kind,
      text,
      tools: s.tools ?? [],
      languages: s.languages ?? [],
      siteHomes: s.siteHomes ?? [],
      section: s.section ?? '',
      canonical: s.canonical ?? '',
      home: s.home ?? null,
      preview: s.preview === true,
      notFoundIntl: s.notFoundIntl ?? []
    }
  })
}
