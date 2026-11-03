<script>
// 文章裡的外部嵌入與舊文示範共用的工具。
//
// <Embed src="..." />：取代文章裡 CodePen、JS Bin、GitHub Gist 的 <script>。
// VitePress 會把文章裡單獨成塊的 <script> 抽成 Vue 元件的 script，包在 HTML 裡的會被 Vue 丟掉，
// 所以嵌入一律改用這個元件，在 onMounted 之後才載入外部 script（SSR 不碰 window，hydration 也不會對不上）。
// - CodePen：舊的 ei.js 網址都會 301 到現在的官方網址，這裡直接載官方網址；同一頁只載一次，它會把頁面上所有 .codepen 換成 iframe。
// - JS Bin：一律用 https 載入官方的 embed.js（舊文寫的是 http，在 https 的網站上本來就被瀏覽器擋下）。
// - GitHub Gist：官方的 .js 用 document.write，頁面載入完才插入的 script 不能用，改放進沙箱 iframe 的 srcdoc 裡執行。
//
// 另外匯出 loadLibs、runDemo、sheetFeed、loadCorsImage、warnOnce 給 demos/ 底下各篇的示範元件使用。

/** 舊文示範用到的函式庫，固定版本並加上 SRI。d3 的版本照文章 front matter 的 jsvendor。 */
export const LIBS = {
  jquery: {
    src: 'https://code.jquery.com/jquery-3.7.1.min.js',
    integrity: 'sha384-1H217gwSVyLSIfaLxHbE7dRb3v4mYCKbpQvzx0cegeju1MVsGrX5xXxAvs/HgeFs'
  },
  'd3@3.3.10': {
    src: 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.3.10/d3.min.js',
    integrity: 'sha384-VzrAzrPBtCMHBtNBXPCT6EbUQgsPR9uM+fYs8B65bt1PBv/fk3B5oz1Kd+avRyCF'
  },
  'd3@3.2.0': {
    src: 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.2.0/d3.min.js',
    integrity: 'sha384-3tWuX6IBJ52+0dpVhv8PQPuc5THbuOzMpUIDgMpb9tjM5Xbcr9BI7cvs0j8BFIpK'
  }
}

/** 嵌入服務現在的官方 script */
export const EMBED_SCRIPTS = {
  codepen: 'https://public.codepenassets.com/embed/index.js',
  jsbin: 'https://static.jsbin.com/js/embed.min.js'
}

/** 依文章原本寫的 src 判斷是哪一種嵌入 */
export function embedKind(src) {
  if (/codepen/i.test(src)) return 'codepen'
  if (/(^|\/\/|\.)jsbin\.com\//i.test(src)) return 'jsbin'
  if (/^(https?:)?\/\/gist\.github\.com\/.+\.js$/i.test(src)) return 'gist'
  return 'script'
}

/** 協定相對或 http 的網址一律換成 https */
export function toHttps(src) {
  return src.replace(/^(https?:)?\/\//i, 'https://')
}

const pending = new Map()
const warned = new Set()

/** 同一則訊息在同一頁只印一次：同一頁有好幾個嵌入共用同一支 script 時，它們拿到同一個失敗的 Promise，各自印會洗版 */
export function warnOnce(tag, message) {
  if (warned.has(message)) return
  warned.add(message)
  console.warn(tag, message)
}

/** 載入外部 script，同一個網址只載一次，回傳 Promise；只能在瀏覽器端（onMounted 之後）呼叫 */
export function loadScript(src, { integrity } = {}) {
  if (!pending.has(src)) {
    pending.set(
      src,
      new Promise((resolve, reject) => {
        const el = document.createElement('script')
        el.src = src
        if (integrity) {
          el.integrity = integrity
          el.crossOrigin = 'anonymous'
        }
        el.onload = () => resolve()
        el.onerror = () => {
          pending.delete(src)
          reject(new Error(`載入失敗：${src}`))
        }
        document.head.appendChild(el)
      })
    )
  }
  return pending.get(src)
}

/** 依序載入 LIBS 裡的函式庫（例如 ['jquery', 'd3@3.3.10']） */
export async function loadLibs(names = []) {
  for (const name of names) {
    const lib = LIBS[name]
    if (!lib) throw new Error(`沒有這個函式庫：${name}`)
    await loadScript(lib.src, lib)
  }
}

/**
 * 把舊文的示範程式當成一般 script（不是 module，也不是 strict mode）執行。
 * 這些程式寫於 2013 到 2015 年，大量使用沒有宣告的全域變數、在不同 <script> 之間共用變數，
 * 包成 module 會在 strict mode 下出錯，所以原樣交給瀏覽器執行，跟當年寫在頁面裡的行為相同。
 */
export function runScript(code) {
  const el = document.createElement('script')
  el.textContent = code
  document.body.appendChild(el)
  el.remove()
}

/**
 * 先載入函式庫，再依序執行每一段原本的 <script>；函式庫載入失敗就不執行，只在 console 留訊息。
 * globals 會先掛到 window，給原本的程式碼呼叫（例如 { __sheetFeed: sheetFeed }）。
 */
export async function runDemo(libs, codes, globals = {}) {
  try {
    await loadLibs(libs)
  } catch (e) {
    warnOnce('[demo]', e.message)
    return
  }
  Object.assign(window, globals)
  for (const code of codes) runScript(code)
}

/** 舊版 feeds API 的工作表代號對應現在的 gid 與工作表名稱（代號換算：去掉開頭的 o，36 進位轉數字再 XOR 474） */
const SHEETS = {
  '1hX3lqWLHFuwYiQeaBL0WevleUEOBAPKzshj2fJHogsM': {
    od6: { gid: '0', title: '台北市' },
    ol1cvs7: { gid: '1272070461', title: '高雄市' },
    objevh6: { gid: '697734144', title: '高雄縣市(合併)' }
  }
}

/**
 * 取代 Google 試算表舊版 feeds API（spreadsheets.google.com/feeds/list/...，已經停用）的 $.getJSON。
 * 試算表本身還是公開的，改用 gviz 匯出 CSV（有開放跨網域讀取），再組成舊 API 回傳的形狀：
 * feed.title.$t 是工作表名稱，feed.entry 每一列的欄位是 gsx$欄位名稱.$t，原本讀資料的程式碼不用改。
 * 回傳 jQuery 的 promise，跟 $.getJSON 一樣接 .done()、.fail()；呼叫前要先載入 jQuery 與 d3 3.x（用 d3.csv.parse 解析）。
 */
export function sheetFeed(key, listKey) {
  const deferred = window.jQuery.Deferred()
  const sheet = SHEETS[key]?.[listKey]
  if (!sheet) return deferred.reject(null, 'error', `沒有這個工作表：${listKey}`).promise()
  fetch(`https://docs.google.com/spreadsheets/d/${key}/gviz/tq?tqx=out:csv&gid=${sheet.gid}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.text()
    })
    .then((text) => {
      const entry = window.d3.csv.parse(text).map((row) => {
        const item = {}
        for (const [name, value] of Object.entries(row)) {
          item[`gsx$${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`] = { $t: value }
        }
        return item
      })
      deferred.resolve({ feed: { title: { $t: sheet.title }, entry } })
    })
    .catch((e) => deferred.reject(null, 'error', e.message))
  return deferred.promise()
}

/**
 * 載入給 canvas 讀像素用的圖片。跨網域的圖要用 CORS 載入，getImageData 才讀得到像素；
 * 圖片主機沒有開放 CORS 時會載入失敗，這時改用一般方式再載一次：圖照樣畫得出來，只是讀像素那一步會被瀏覽器擋下。
 */
export function loadCorsImage(img, src) {
  img.crossOrigin = 'anonymous'
  img.addEventListener('error', function retry() {
    img.removeEventListener('error', retry)
    img.removeAttribute('crossorigin')
    img.src = src
  })
  img.src = src
}
</script>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  /** 文章原本 <script> 的 src */
  src: { type: String, required: true },
  /** 只給 Gist 用：iframe 的高度，預設 400px；放在固定高度的容器裡時用 100% */
  height: { type: String, default: '400px' }
})

const gistDoc = ref('')

onMounted(async () => {
  const kind = embedKind(props.src)
  const src = toHttps(props.src)
  if (kind === 'gist') {
    gistDoc.value =
      '<!doctype html><html><head><meta charset="utf-8"><base target="_blank">' +
      '<style>body{margin:0}</style></head><body>' +
      `<script src="${src.replace(/"/g, '&quot;')}"><\/script></body></html>`
    return
  }
  const url = kind === 'script' ? src : EMBED_SCRIPTS[kind]
  // CodePen 的 script 已經在這一頁執行過（例如元件晚一步掛上），直接叫它再掃一次 .codepen
  const ready = kind === 'codepen' && typeof window.__CPEmbed === 'function'
  try {
    await loadScript(url)
    if (ready) window.__CPEmbed()
  } catch (e) {
    warnOnce('[embed]', e.message)
  }
})
</script>

<template>
  <iframe
    v-if="gistDoc"
    class="gist-embed"
    title="GitHub Gist"
    :srcdoc="gistDoc"
    sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
    loading="lazy"
    :style="{ display: 'block', width: '100%', height: props.height, border: 0 }"
  ></iframe>
</template>
