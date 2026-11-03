import type { App } from 'vue'
import Layout from './Layout.vue'

// v4 外觀：token 正本（shared/，不手改）→ 主題變數與深色版 → 字型 → 基礎與共用元件 → 頁首頁尾 → 頁型 → 本文
import './shared/tokens/tokens.css'
import './styles/vars.css'
import './styles/fonts.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/pages.css'
import './styles/prose.css'

// theme/components/demos/ 底下的元件（文章示範用）一律自動註冊成全域元件，文章裡可以直接寫 <CssAnimationDemo />。
const demos = import.meta.glob('./components/demos/*.vue', { eager: true }) as Record<string, { default: object }>

export default {
  Layout,
  enhanceApp({ app }: { app: App }) {
    for (const [file, mod] of Object.entries(demos)) {
      const name = file.split('/').pop()!.replace(/\.vue$/, '')
      app.component(name, mod.default)
    }
  }
}
