// 外語首頁 /<code>/：paths() 回這次建置要產生的頁（lib/site-home.mjs 的 buildSiteHomePlan() 的 pages，主站首頁規格 C.1）。
// P1、P2 的 home.locales 是空陣列，live 建置回 []，VitePress 不產生任何頁；preview 建置（CS_STAGE=preview）回 roadmap 裡有文案檔的語系。
// 文案、title、head 由 lib/pagedata.mjs、lib/seo.mjs 在 transformPageData 寫進 frontmatter，這裡只給語系代碼。
import { buildSiteHomePlan } from '../.vitepress/lib/site-home.mjs'

export default {
  paths: () => buildSiteHomePlan().pages.map(({ code }) => ({ params: { locale: code } }))
}
