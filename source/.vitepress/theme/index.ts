import type { App } from 'vue'
import Layout from './Layout.vue'

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
