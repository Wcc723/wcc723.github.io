import { defineAsyncComponent, type App, type Component } from 'vue'
import Layout from './Layout.vue'

// v4 外觀：圖層順序 → token 正本（shared/，不手改）→ 主題變數與深色版 → 字型 → 基礎與共用元件 → 頁首頁尾 → 頁型 → 本文
// layers.css 一定第一個（S 版起，主站首頁規格 E.7）：@layer 的順序由第一次出現決定，base.css 在 cs.base，共用頁首頁尾在 cs.components
import './styles/layers.css'
import './shared/tokens/tokens.css'
import './styles/vars.css'
import './styles/fonts.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/pages.css'
import './styles/prose.css'

// theme/components/demos/ 底下的元件（文章示範用）一律自動註冊成全域元件，文章裡可以直接寫 <CssAnimationDemo />。
// 按需載入：glob 不用 eager，每支元件各自是一個 chunk（Embed.vue 也是，示範元件共用它的工具函式），
// 不進每一頁都會下載的主題 chunk，只有用到的文章才下載。
// - SSR：renderToString 會等 async component 載入完，預先渲染的 HTML 跟同步註冊時一樣完整。
// - 瀏覽器：hydration 遇到 async component 先保留伺服器輸出的 DOM，等 chunk 載入後再接手，不重畫，也不會對不上。
// - chunk 載入失敗（部署後讀者還拿著舊 HTML、舊雜湊的 chunk 已經不在，或離線）：那一段維持 SSR 的靜態 HTML。
//   Vue 的 hydration（__asyncHydrate）對 loader 的 Promise 沒有 catch，失敗會留下未處理的 rejection，
//   所以瀏覽器端的 loader 包一層：失敗時只留一行 warning（跟其他示範的「[demo] 載入失敗」一樣），
//   回傳一個永遠不完成的 Promise，元件一直停在等待，不 hydrate 那一段、不清掉 DOM、不丟錯。
//   SSR 不包：建置時載入失敗要直接讓建置失敗，不能卡住。
// - 主題的其他檔案不要靜態 import demos/ 底下的檔案，否則那支元件會被打回主題 chunk（demos.test.mjs 會檢查）。
const demos = import.meta.glob<Component>('./components/demos/*.vue', { import: 'default' })

/** 瀏覽器端的示範 loader：chunk 載入失敗時不丟錯，那一段留著 SSR 的 HTML */
function quietLoader(name: string, load: () => Promise<Component>): () => Promise<Component> {
  return () =>
    load().catch((e: unknown) => {
      console.warn('[demo]', `${name} 載入失敗，保留預先渲染的內容`, e instanceof Error ? e.message : e)
      return new Promise<Component>(() => {})
    })
}

export default {
  Layout,
  enhanceApp({ app }: { app: App }) {
    for (const [file, load] of Object.entries(demos)) {
      const name = file.split('/').pop()!.replace(/\.vue$/, '')
      app.component(name, defineAsyncComponent(import.meta.env.SSR ? load : quietLoader(name, load)))
    }
  }
}
