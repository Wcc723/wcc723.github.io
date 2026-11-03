// audit-build.test.mjs 用的測試世界：拿 hexo/ 底下的 Hexo 原始頁（從基準 commit 用 git show 存下來的 9 頁）
// 1. 照 workspace scripts/blog-baseline.mjs 的算法產生迷你基準（pages.json、urls.txt、atom、sitemap、content.json、凍結檔）；
// 2. 模擬 VitePress 產物：同樣的 SEO 欄位與本文，換成新主題的外框（vp-raw、prose、post-foot、post-card、
//    程式碼區塊的複製鈕與語言標籤、標題錨點的零寬字元、直引號），加上新頁、404、assets。
// 這份 dist 應該通過全部檢查；各測試再用 mutate 改壞一個地方，確認對應的檢查會失敗。
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  SITE, fileToUrl, urlAliases, pageType, extractPage, articleOf, hexoCards, postLinks, mainOf, demoCssLinks,
} from '../lib/extract-page.mjs'
import { SITE_TITLE_LEGACY, ADSENSE_CLIENT, ADSENSE_LOADER_SRC, shouldLoadAds } from '../../source/.vitepress/theme/shared/shell/site.mjs'
import { pageTypeOf } from '../../source/.vitepress/lib/pagetype.mjs'
import { NOT_FOUND_TITLE, NOT_FOUND_DESCRIPTION } from '../../source/.vitepress/theme/head.mjs'
import { expectedSitemap, expectedContentEntry, NEW_PAGES } from '../audit-build.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
export const HEXO_DIR = path.join(HERE, 'hexo')

/** hexo/ 底下的檔案（樹裡的路徑） */
export function hexoFiles() {
  const out = []
  const walk = (rel) => {
    for (const e of fs.readdirSync(path.join(HEXO_DIR, rel), { withFileTypes: true })) {
      const r = rel ? `${rel}/${e.name}` : e.name
      if (e.isDirectory()) walk(r)
      else out.push(r)
    }
  }
  walk('')
  return out.sort()
}

export const readHexo = (file) => fs.readFileSync(path.join(HEXO_DIR, file), 'utf8')

const CATEGORIES = JSON.parse(fs.readFileSync(path.join(HERE, '../data/categories.json'), 'utf8')).categories.map((c) => c.name)

// 文章索引（lib/posts.mjs 的形狀），日期從網址取；install-nvm 有 updated
const POSTS = [
  { file: '2021-09-11-css-selector.md', url: '/development/2021/09/11/css-selector/', category: 'development', tags: ['css'] },
  { file: '2015-01-08-2014-year-report.md', url: '/life/2015/01/08/2014-year-report/', category: 'life', tags: ['life'] },
  { file: '2013-09-29-css-target.md', url: '/css/2013/09/29/css-target/', category: 'css', tags: ['css'], cssdemo: ['2013-autumn'] },
  { file: '2022-01-10-install-nvm.md', url: '/development/2022/01/10/install-nvm/', category: 'development', tags: ['javascript', 'nodejs'], updated: '2026-07-09' },
  { file: '2020-01-01-draft.md', url: '/development/2020/01/01/draft/', category: 'development', tags: [], published: false },
].map((p) => ({ date: p.url.split('/').slice(2, 5).join('-'), updated: null, published: true, ads: true, cssdemo: [], ...p }))

const FROZEN = {
  'ads.txt': 'google.com, pub-8296684122088055, DIRECT, f08c47fec0942fa0\n',
  'robots.txt': 'User-agent: *\nAllow: /\n',
  CNAME: 'www.casper.tw\n',
  'search.xml': '<?xml version="1.0"?><search></search>\n',
  'css/style.css': 'body{color:#333}\n',
  'img/casper-avatar.webp': 'RIFF-avatar',
  'img/js-interview-cover.webp': 'RIFF-cover',
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Hexo 本文 → VitePress 的樣子：標題錨點、程式碼外框，文字節點裡的 smartypants 轉換倒回去（typographer 關閉；
 * 標題 id 不動，markdown 模組會模擬 Hexo 的 slugify），install-nvm 的佔位字重新顯示
 */
export function toVitePressProse(prose, url) {
  const unSmarty = (t) => t.replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/—/g, '---').replace(/–/g, '--').replace(/…/g, '...')
  let h = prose
    .replace(/<a href="#([^"]*)" class="headerlink" title="[^"]*"><\/a>([\s\S]*?)<\/h([1-6])>/g, (m, id, text, lv) => `${text} <a class="header-anchor" href="#${id}" aria-label="Permalink">&#8203;</a></h${lv}>`)
    .replace(/<pre><code class="hljs ([\w-]+)">/g, '<div class="language-$1 vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">$1</span><pre class="shiki" tabindex="0"><code>')
    .replace(/<\/code><\/pre>/g, '</code></pre></div>')
    .replace(/>([^<]+)</g, (m, text) => `>${unSmarty(text)}<`)
  if (url.endsWith('/install-nvm/')) h = h.replaceAll('nvm install ：', 'nvm install {{ version }}：')
  return h
}

function jsonLd(type, extra = {}) {
  const graph = {
    post: ['BlogPosting', 'BreadcrumbList'], 'blog-index': ['CollectionPage', 'BreadcrumbList'], 'taxonomy-list': ['CollectionPage', 'BreadcrumbList'],
    'nav-index': ['CollectionPage', 'BreadcrumbList'], about: ['WebPage', 'BreadcrumbList'], legal: ['WebPage', 'BreadcrumbList'],
  }[type]
  if (!graph) return ''
  const nodes = graph.map((t) => (t === 'BlogPosting' ? { '@type': t, ...extra } : { '@type': t }))
  return `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })}</script>`
}

/** 一頁 VitePress 風格的 HTML */
export function builtHtml({ file, title, description, canonical, robots, published, modified, ldExtra, main, adsFalse = false, demoCss = [], tags = [] }) {
  const type = pageTypeOf(file.replace(/\.html$/, '.md'))
  const loader = shouldLoadAds({ type, adsFalse })
  const head = [
    '<meta charset="utf-8">',
    `<title>${esc(title)}</title>`,
    description ? `<meta name="description" content="${esc(description)}">` : '',
    // keywords 照標籤的建立順序，article:tag 依名稱的字碼順序（跟 Hexo 與 lib/seo.mjs 相同）
    tags.length ? `<meta name="keywords" content="${esc(tags.join(','))}">` : '',
    ...[...tags].sort().map((t) => `<meta property="article:tag" content="${esc(t)}">`),
    `<meta name="google-adsense-account" content="${ADSENSE_CLIENT}">`,
    loader ? `<script async src="${ADSENSE_LOADER_SRC}" crossorigin="anonymous"></script>` : '',
    canonical ? `<link rel="canonical" href="${esc(canonical)}">` : '',
    canonical ? `<meta property="og:url" content="${esc(canonical)}">` : '',
    `<meta property="og:site_name" content="${SITE_TITLE_LEGACY}">`,
    published ? `<meta property="article:published_time" content="${published}">` : '',
    modified ? `<meta property="article:modified_time" content="${modified}">` : '',
    robots ? `<meta name="robots" content="${robots}">` : '',
    ...demoCss.map((href) => `<link rel="stylesheet" href="${href}">`),
    jsonLd(type, ldExtra),
    // VitePress 把 config.head 序列化進每一頁；loader 網址出現在字串裡，但不是 <script src>，不能被算成 loader
    `<script>window.__VP_SITE_DATA__=JSON.parse("{\\"head\\":[[\\"script\\",{\\"src\\":\\"${ADSENSE_LOADER_SRC}\\"}]]}")</script>`,
  ].filter(Boolean).join('\n')
  return `<!DOCTYPE html>\n<html lang="zh-TW" dir="ltr">\n<head>\n${head}\n</head>\n<body><div id="app"><!--[--><div class="vp-raw" data-v-7a1b2c3d><header class="site-header"><a href="/">卡斯伯 Blog</a><a href="/categories/">文章</a></header><main class="site-main" data-v-7a1b2c3d>${main}</main><footer class="site-footer"><a href="/privacy/">隱私權政策</a></footer></div><!--]--></div></body>\n</html>\n`
}

const cardHtml = (c) => `<article class="post-card"><a class="post-card__cover" href="${c.url}" tabindex="-1"><img src="https://img.casper.tw/x.png" alt=""></a><h2 class="post-card__title"><a href="${c.url}">標題</a></h2><p class="post-card__meta"><time>2023</time></p><p class="post-card__excerpt">${esc(c.excerpt)}</p></article>`

/**
 * 建一個臨時的 repo 根目錄：baseline/hexo-fixture/、dist/、package.json。
 * mutate(dist, world) 可以在寫檔前改 dist（Map：相對路徑 → 字串）或 world.rootFiles。
 * 回傳 { root, opts }，opts 直接交給 runAudit。
 */
export function buildWorld(mutate) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-world-'))
  const files = hexoFiles()
  const pages = files.map((file) => ({ url: fileToUrl(file), file, type: pageType(file), alias: urlAliases(file)[0] ?? null, ...extractPage(readHexo(file)) }))
    .sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0))
  const posts = POSTS.filter((p) => p.published)
  const bdir = path.join(root, 'baseline', 'hexo-fixture')
  const atomEntry = (p) => `  <entry>\n    <id>${SITE}${p.url}</id>\n    <link href="${SITE}${p.url}"/>\n    <published>${pages.find((x) => x.url === p.url).publishedTime}</published>\n  </entry>\n`
  const content = posts.map((p) => ({
    title: pages.find((x) => x.url === p.url).h1[0],
    date: pages.find((x) => x.url === p.url).publishedTime,
    path: p.url.slice(1),
    categories: [{ name: p.category, slug: p.category, permalink: `${SITE}/categories/${p.category}/` }],
    tags: p.tags.map((t) => ({ name: t, slug: t, permalink: `${SITE}/tags/${t}/` })),
  }))
  const sitemapBase = [...posts.map((p) => p.url), '/', '/about/hexschool-traning', '/tags/vue/', '/tags/Vue/', '/categories/css/']
  const baseFiles = {
    'pages.json': JSON.stringify({ source: { commit: 'fixture' }, pageCount: pages.length, pages }, null, 1),
    'urls.txt': [...new Set([...files.flatMap((f) => [fileToUrl(f), ...urlAliases(f)]), ...Object.keys(FROZEN).map((f) => '/' + f), '/_headers', '/atom.xml', '/content.json', '/sitemap.xml'])].sort().join('\n') + '\n',
    'atom.xml': `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n${posts.map(atomEntry).join('')}</feed>\n`,
    'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n${sitemapBase.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>2026-01-01</lastmod></url>\n`).join('')}</urlset>\n`,
    'content.json': JSON.stringify(content),
    ...Object.fromEntries(['ads.txt', 'robots.txt', 'CNAME', 'search.xml'].map((f) => [f, FROZEN[f]])),
  }
  fs.mkdirSync(bdir, { recursive: true })
  for (const [f, v] of Object.entries(baseFiles)) fs.writeFileSync(path.join(bdir, f), v)

  // --- dist ---
  const dist = new Map()
  const listMain = (h1, cards) => `<h1>${esc(h1)}</h1><div class="post-list">${cards.map(cardHtml).join('')}</div><nav class="pager"><a href="/page/3/">下一頁</a></nav>`
  for (const p of pages) {
    const hexo = readHexo(p.file)
    const fix = (u) => u?.replace('/tags/Vue/', '/tags/vue/')
    const lower = (s) => (p.url === '/tags/vue/' ? s?.replaceAll('Vue', 'vue') : s)
    const common = { file: p.file, title: lower(p.title), description: lower(p.description), canonical: fix(p.canonical) }
    let main
    if (p.type === 'post' || p.type === 'about') {
      const post = POSTS.find((x) => x.url === p.url)
      const prose = toVitePressProse(articleOf(hexo), p.url)
      main = `<nav class="breadcrumbs"><a href="/">首頁</a></nav><article class="post"><header><h1>${esc(p.h1[0])}</h1></header>` +
        `<div class="prose" data-v-7a1b2c3d><div>${prose}</div></div><div class="post-foot" data-v-7a1b2c3d><div class="fb-comments" data-href="${p.fbCommentsHref}" data-width="100%"></div></div></article>`
      common.demoCss = demoCssLinks(hexo)
      if (post) {
        common.tags = expectedContentEntry(content.find((x) => '/' + x.path === p.url)).tags.map((t) => t.name)
        const mod = `${post.updated ?? post.date}T00:00:00+08:00`
        Object.assign(common, { published: p.publishedTime, modified: mod, ldExtra: { datePublished: `${post.date}T00:00:00+08:00`, dateModified: mod } })
      }
      if (p.type === 'about') common.adsFalse = true
    } else if (p.type === 'archive') {
      main = `<h1>${esc(p.h1[0])}</h1>${postLinks(hexo).map((u) => `<a class="archive-row" href="${u}">文章</a>`).join('')}`
    } else {
      const h1 = p.type === 'home' ? '卡斯伯 Blog' : p.type === 'home-page' ? '最新文章：第 2 頁' : lower(p.h1[0])
      main = listMain(h1, hexoCards(hexo))
    }
    dist.set(p.file, builtHtml({ ...common, main }))
  }
  const newPage = (u, title, body) => dist.set(u.slice(1) + 'index.html', builtHtml({ file: u.slice(1) + 'index.html', title, description: `${title}的說明`, canonical: SITE + u, main: `<h1>${title}</h1>${body}` }))
  newPage('/categories/', '文章分類', CATEGORIES.map((c) => `<a href="/categories/${c === 'css' ? 'CSS' : c}/">${c}</a>`).join(''))
  newPage('/privacy/', '隱私權政策', '<p>可以到 <a href="https://adssettings.google.com/">廣告設定</a> 或 <a href="https://www.aboutads.info/">www.aboutads.info</a> 停用個人化廣告。</p>')
  newPage('/contact/', '聯絡', '<p>內容</p>')
  newPage('/terms/', '使用條款', '<p>內容</p>')
  dist.set('404.html', builtHtml({ file: '404.html', title: NOT_FOUND_TITLE, description: NOT_FOUND_DESCRIPTION, robots: 'noindex', main: '<h1>這頁找不到</h1>' }))
  for (const [f, v] of Object.entries(FROZEN)) dist.set(f, v)
  dist.set('atom.xml', baseFiles['atom.xml'])
  dist.set('content.json', JSON.stringify(content.map(expectedContentEntry)))
  const lastmod = new Map(posts.map((p) => [SITE + p.url, p.updated ?? p.date]))
  dist.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset>\n${[...expectedSitemap(baseFiles['sitemap.xml'])].map((u) => `<url><loc>${u}</loc>${lastmod.has(u) ? `<lastmod>${lastmod.get(u)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`)
  dist.set('assets/app.Bc12xY.js', 'import"./chunks/theme.Dx9.js";console.log("app")\n')
  dist.set('assets/chunks/theme.Dx9.js', 'export const theme={name:"casper"};\n')
  dist.set('assets/chunks/framework.Fa1.js', 'export const vue={};\n')
  dist.set('assets/style.Cc3.css', 'body{margin:0}\n')
  dist.set('hashmap.json', '{}')

  const world = { rootFiles: new Map([['package.json', JSON.stringify({ scripts: { build: 'vitepress build source', postbuild: 'node scripts/audit-build.mjs' } })]]) }
  if (mutate) mutate(dist, world)
  for (const [f, v] of world.rootFiles) fs.writeFileSync(path.join(root, f), v)
  const distDir = path.join(root, 'dist')
  for (const [f, v] of dist) {
    fs.mkdirSync(path.dirname(path.join(distDir, f)), { recursive: true })
    fs.writeFileSync(path.join(distDir, f), v)
  }
  const baselineHtml = new Map([...files.map((f) => [f, readHexo(f)]), ...['css/style.css', 'img/casper-avatar.webp', 'img/js-interview-cover.webp'].map((f) => [f, FROZEN[f]])])
  return {
    root,
    opts: {
      root, distDir, baselineDir: bdir, srcDir: null, posts: POSTS, categories: CATEGORIES,
      adsFalseUrls: new Set(['/about/hexschool-traning.html']), baselineHtml,
      fixedAnchors: [
        ['/development/2021/09/11/css-selector/', '“屬性及值”-完全符合'],
        ['/life/2015/01/08/2014-year-report/', 'SASS-amp-Compass'],
      ].map(([u, id]) => [encodeURI(u), id]),
    },
    cleanup: () => fs.rmSync(root, { recursive: true, force: true }),
  }
}

export { NEW_PAGES, mainOf }
