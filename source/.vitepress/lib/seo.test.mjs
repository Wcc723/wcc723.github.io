// lib/seo.mjs 的測試：單元規則，加上對 Hexo 基準（baseline/hexo-2026-11-03/pages.json）657 頁的逐欄比對。
// 不等 routes 模組：pageType、url、heading、breadcrumbs 由這裡照 README 的介面自己構造，
// 再照 VitePress 1.6.4 renderPage 的方式組出 head（createTitle、mergeHead、未跳脫的 description），
// 跑過 transformHtml 後從 HTML 擷取欄位，跟基準比。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { createTitle, mergeHead, escapeHtml as vpEscape } from 'vitepress/dist/client/shared.js'
import { SITE_TITLE_LEGACY, ADSENSE_CLIENT, countAdsLoaders, shouldLoadAds } from '../theme/shared/shell/site.mjs'
import { categoryDir, tagSlug } from './posts.mjs'
import { NOT_FOUND_DESCRIPTION, NOT_FOUND_TITLE } from '../theme/head.mjs'
import {
  siteHead,
  siteHeadFor,
  stripHydration,
  GA4_SHARED_SNIPPET,
  seoPageData,
  transformHtml,
  pageSeo,
  pageHead,
  articleTagOrder,
  firstImage,
  archiveTitle,
  taipeiDateTimeIso,
  dateOnly,
  jsonLdString,
  PERSON_ID,
  HOME_DESCRIPTION,
} from './seo.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(here, '..', '..')
const root = path.resolve(srcDir, '..')
const baseline = JSON.parse(fs.readFileSync(path.join(root, 'baseline/hexo-2026-11-03/pages.json'), 'utf8')).pages
const ctx = { siteConfig: { srcDir } }
const SITE = SITE_TITLE_LEGACY

// ---------------------------------------------------------------------------
// 模擬 VitePress
// ---------------------------------------------------------------------------

const siteData = { title: SITE_TITLE_LEGACY, description: 'A VitePress site', head: siteHead }

/** 跟 VitePress 的 createMarkdownToVueRenderFn 一樣的 pageData 初值 */
function makePageData({ relativePath, filePath, frontmatter, params }) {
  return {
    title: frontmatter.title ?? '',
    titleTemplate: frontmatter.titleTemplate,
    description: frontmatter.description ?? '',
    frontmatter,
    headers: [],
    params,
    relativePath,
    filePath: filePath ?? relativePath,
  }
}

// VitePress 的 renderHead 與 <title> 用的跳脫（& 後面已經像實體的不再跳脫）
const esc = (s) => vpEscape(String(s))

/** VitePress renderPage 的 head 組法（不含 esbuild 壓縮 inline script） */
function renderPage(pageData, page) {
  const title = createTitle(siteData, pageData)
  const description = pageData.description || siteData.description
  const fmHead = (pageData.frontmatter.head ?? []).filter(([t, a]) => !(t === 'meta' && a?.name === 'description'))
  const head = mergeHead(siteData.head, fmHead)
  const tags = head.map(([tag, attrs = {}, inner = '']) => {
    const open = `<${tag}${Object.keys(attrs).map((k) => (k === 'async' ? ' async' : ` ${k}="${esc(attrs[k])}"`)).join('')}>`
    return tag === 'link' || tag === 'meta' ? open : `${open}${inner}</${tag}>`
  })
  const html = `<!DOCTYPE html>
<html lang="zh-TW" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>${esc(title)}</title>
    <meta name="description" content="${description}">
    <meta name="generator" content="VitePress v1.6.4">
    ${tags.join('\n    ')}
  </head>
  <body><div id="app"></div></body>
</html>`
  return transformHtml(html, `/dist/${page.replace(/\.md$/, '.html')}`, { page, siteData, pageData, title, description })
}

// ---------------------------------------------------------------------------
// 從 HTML 擷取欄位（語意同 scripts/blog-baseline.mjs 的 extractPage：取第一個、解實體）
// ---------------------------------------------------------------------------

function decode(s) {
  const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }
  return s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (m, e) =>
    e[0] !== '#' ? (named[e] ?? m) : String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)),
  )
}
function attrsOf(s) {
  const a = {}
  for (const m of s.matchAll(/([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    const k = m[1].toLowerCase()
    if (!(k in a)) a[k] = decode(m[2] ?? m[3] ?? m[4] ?? '')
  }
  return a
}
function extract(html) {
  const head = html.slice(0, html.indexOf('</head>'))
  const metas = [...head.matchAll(/<meta\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)].map((m) => attrsOf(m[1]))
  const links = [...head.matchAll(/<link\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi)].map((m) => attrsOf(m[1]))
  const meta = (k, v) => metas.filter((m) => (m[k] ?? '').toLowerCase() === v).map((m) => m.content ?? '')
  const lists = {
    title: [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)].map((m) => decode(m[1]).replace(/\s+/g, ' ').trim()),
    description: meta('name', 'description'),
    canonical: links.filter((l) => (l.rel ?? '').split(/\s+/).includes('canonical')).map((l) => l.href ?? ''),
    ogUrl: meta('property', 'og:url'),
    ogTitle: meta('property', 'og:title'),
    ogSiteName: meta('property', 'og:site_name'),
    ogDescription: meta('property', 'og:description'),
    ogType: meta('property', 'og:type'),
    ogImage: meta('property', 'og:image'),
    robots: meta('name', 'robots'),
    publishedTime: meta('property', 'article:published_time'),
    modifiedTime: meta('property', 'article:modified_time'),
  }
  const out = { dupes: [] }
  for (const [k, v] of Object.entries(lists)) {
    out[k] = v[0] ?? null
    if (v.length > 1) out.dupes.push(k)
  }
  out.jsonLd = [...head.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => JSON.parse(m[1]))
  out.jsonLdTypes = out.jsonLd.map((d) => [d].flat().map((o) => o['@type']).join(','))
  out.keywords = meta('name', 'keywords')[0] ?? null
  out.articleTags = meta('property', 'article:tag')
  out.adsLoaders = countAdsLoaders(html)
  out.adsMeta = meta('name', 'google-adsense-account')[0] ?? null
  out.cssLinks = links.filter((l) => (l.href ?? '').startsWith('https://img.casper.tw/demoFile/css/')).map((l) => l.href)
  return out
}

// ---------------------------------------------------------------------------
// 構造全站頁面（照 README 的 frontmatter 介面）
// ---------------------------------------------------------------------------

const POST_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|html)$/

function readPosts() {
  const posts = []
  for (const file of fs.readdirSync(path.join(srcDir, '_posts')).sort()) {
    const m = file.match(POST_RE)
    if (!m) continue
    const { data } = matter(fs.readFileSync(path.join(srcDir, '_posts', file), 'utf8'))
    if (data.published === false) continue
    const category = String(data.category)
    const url = `/${category}/${m[1]}/${m[2]}/${m[3]}/${m[4]}/`
    posts.push({ file, data, category, url, out: `${category}/${m[1]}/${m[2]}/${m[3]}/${m[4]}/index.md` })
  }
  return posts
}
const posts = readPosts()

// 標籤合併：只差大小寫的標籤併成小寫（sass、bootstrap、vue），其餘照原樣；slug → 名稱
function tagNames() {
  const groups = new Map()
  for (const p of posts) for (const t of [p.data.tags ?? []].flat().map(String)) {
    const k = t.toLowerCase()
    if (!groups.has(k)) groups.set(k, new Set())
    groups.get(k).add(t)
  }
  const bySlug = new Map()
  for (const [lower, variants] of groups) {
    const name = variants.size > 1 ? lower : [...variants][0]
    bySlug.set(tagSlug(name), name)
  }
  return bySlug
}
const tagBySlug = tagNames()
const categoryByDir = new Map(posts.map((p) => [categoryDir(p.category), p.category]))

function frontmatterOf(rel) {
  return matter(fs.readFileSync(path.join(srcDir, rel), 'utf8')).data
}

/** 基準的一頁 → { page（rewrites 之後的路徑）, pageData } */
function pageFor(b) {
  const url = decodeURI(b.alias ?? b.url)
  const home = { name: '首頁', url: '/' }
  if (b.type === 'post') {
    const p = posts.find((x) => encodeURI(x.url) === b.url)
    assert.ok(p, `找不到文章原始檔：${b.url}`)
    const fm = {
      ...structuredClone(p.data),
      pageType: 'post',
      url: p.url,
      breadcrumbs: [home, { name: '文章', url: '/categories/' }, { name: p.category, url: `/categories/${categoryDir(p.category)}/` }],
    }
    return { page: p.out, pageData: makePageData({ relativePath: p.out, filePath: `_posts/${p.file}`, frontmatter: fm }) }
  }
  if (b.type === 'home') {
    return { page: 'index.md', pageData: makePageData({ relativePath: 'index.md', frontmatter: { pageType: 'home', url: '/' } }) }
  }
  if (b.type === 'home-page') {
    const n = url.match(/^\/page\/(\d+)\/$/)[1]
    const fm = { pageType: 'blog-index', url, heading: `最新文章第 ${n} 頁`, breadcrumbs: [home, { name: `最新文章第 ${n} 頁` }] }
    return { page: `page/${n}/index.md`, pageData: makePageData({ relativePath: `page/${n}/index.md`, filePath: 'page/[page]/index.md', frontmatter: fm, params: { page: n } }) }
  }
  if (b.type === 'category') {
    const [, dir, n] = url.match(/^\/categories\/([^/]+)\/(?:page\/(\d+)\/)?$/)
    const name = categoryByDir.get(dir)
    const fm = { pageType: 'taxonomy-list', url, heading: `分類：${name}`, breadcrumbs: [home, { name: '文章', url: '/categories/' }, { name }] }
    const rel = `categories/${dir}/${n ? `page/${n}/` : ''}index.md`
    return { page: rel, pageData: makePageData({ relativePath: rel, filePath: n ? 'categories/[cat]/page/[page]/index.md' : 'categories/[cat]/index.md', frontmatter: fm }) }
  }
  if (b.type === 'tag') {
    const [, slug, n] = url.match(/^\/tags\/([^/]+)\/(?:page\/(\d+)\/)?$/)
    const name = tagBySlug.get(slug)
    assert.ok(name, `找不到標籤：${slug}`)
    const fm = {
      pageType: 'taxonomy-list',
      url,
      heading: `標籤：${name}`,
      breadcrumbs: [home, { name: '文章', url: '/categories/' }, { name: '標籤', url: '/tags/' }, { name }],
    }
    const rel = `tags/${slug}/${n ? `page/${n}/` : ''}index.md`
    return { page: rel, pageData: makePageData({ relativePath: rel, filePath: n ? 'tags/[tag]/page/[page]/index.md' : 'tags/[tag]/index.md', frontmatter: fm }) }
  }
  if (b.type === 'archive') {
    const rel = `${url.slice(1)}index.md`
    const fm = { pageType: 'nav-index', url, heading: b.h1[0], breadcrumbs: [home, { name: '文章', url: '/categories/' }, { name: '封存' }] }
    return { page: rel, pageData: makePageData({ relativePath: rel, filePath: 'archives/index.md', frontmatter: fm }) }
  }
  if (b.type === 'tags-index') {
    const fm = { ...frontmatterOf('tags/index.md'), pageType: 'nav-index', url: '/tags/', breadcrumbs: [home, { name: '文章', url: '/categories/' }, { name: '標籤' }] }
    return { page: 'tags/index.md', pageData: makePageData({ relativePath: 'tags/index.md', frontmatter: fm }) }
  }
  if (b.type === 'about') {
    const rel = url === '/about/' ? 'about/index.md' : 'about/hexschool-traning.md'
    const data = frontmatterOf(rel)
    const fm = { ...data, pageType: 'about', url, breadcrumbs: [home, { name: data.title }] }
    // README：hexschool-traning 的 front matter 設 ads: false（內容停在 2023 年）。原始檔還沒改時這裡先照介面補上
    if (rel === 'about/hexschool-traning.md') fm.ads = false
    return { page: rel, pageData: makePageData({ relativePath: rel, frontmatter: fm }) }
  }
  throw new Error(`沒處理的基準頁型 ${b.type}`)
}

// 基準 657 頁全部跑一次
const results = baseline.map((b) => {
  const { page, pageData } = pageFor(b)
  seoPageData(pageData, ctx)
  return { b, page, pageData, got: extract(renderPage(pageData, page)) }
})

// ---------------------------------------------------------------------------
// 逐欄比對與預期差異
// ---------------------------------------------------------------------------

const FIELDS = ['title', 'description', 'canonical', 'ogUrl', 'ogTitle', 'ogSiteName', 'ogDescription', 'ogType', 'ogImage', 'publishedTime', 'modifiedTime', 'robots']
const MERGED_TAG_PAGES = new Set(['/tags/sass/', '/tags/bootstrap/', '/tags/vue/'])

/** 差異是不是 README 列的預期差異；是就回傳原因 */
function expectedReason(field, r) {
  const { b, got, pageData } = r
  const ours = got[field]
  const base = b[field]
  if ((field === 'canonical' || field === 'ogUrl') && b.url.startsWith('/categories/CSS/') && ours === base.replace('/categories/css/', '/categories/CSS/')) {
    return '/categories/CSS/ 改大寫（站長 2026-11-03）'
  }
  if (MERGED_TAG_PAGES.has(b.url) && ['title', 'description', 'canonical', 'ogUrl'].includes(field) && ours === base.replace(/Sass|Bootstrap|Vue/, (s) => s.toLowerCase())) {
    return 'sass、bootstrap、vue 合併成小寫'
  }
  // 基準沒有 description 的頁（只有 /tags/），頁面模組在 front matter 補寫了 description
  if ((field === 'description' || field === 'ogDescription') && base === null && b.type !== 'post' && ours === pageData.frontmatter.description) {
    return '基準沒有 description，front matter 新寫的'
  }
  // 一般頁的 article:*_time 來自 front matter 的 date；頁面模組拿掉 date 時就不輸出
  if ((field === 'publishedTime' || field === 'modifiedTime') && b.type !== 'post' && ours === null && !pageData.frontmatter.date) {
    return 'front matter 沒有 date'
  }
  if (field === 'modifiedTime' && got.publishedTime) {
    const updated = dateOnly(pageData.frontmatter.updated)
    const policy = updated ? new Date(`${updated}T00:00:00+08:00`).toISOString() : got.publishedTime
    if (ours === policy) return 'modified_time 用 updated，沒有就等於發布日（站長 2026-11-03）'
  }
  return null
}

const report = {}
const unexpected = []
for (const f of FIELDS) report[f] = { same: 0, expected: {}, unexpected: 0 }
for (const r of results) {
  for (const f of FIELDS) {
    if (r.got[f] === r.b[f]) {
      report[f].same++
      continue
    }
    const reason = expectedReason(f, r)
    if (reason) report[f].expected[reason] = (report[f].expected[reason] ?? 0) + 1
    else {
      report[f].unexpected++
      unexpected.push({ url: r.b.url, field: f, ours: r.got[f], baseline: r.b[f] })
    }
  }
}

test('基準 657 頁：title、description、canonical、og、published／modified 逐欄比對，只有預期差異', (t) => {
  assert.equal(results.length, 657)
  for (const [f, s] of Object.entries(report)) {
    const exp = Object.entries(s.expected).map(([k, v]) => `${k} ${v}`).join('；')
    t.diagnostic(`${f}: 相同 ${s.same}/${results.length}${exp ? `，預期差異：${exp}` : ''}${s.unexpected ? `，非預期 ${s.unexpected}` : ''}`)
  }
  assert.deepEqual(unexpected.slice(0, 20), [], `非預期差異 ${unexpected.length} 筆`)
})

test('364 篇文章：title、description、canonical、og:url、og:title、og:site_name、og:type、og:image、published_time 跟基準逐字相同', (t) => {
  const postResults = results.filter((r) => r.b.type === 'post')
  assert.equal(postResults.length, 364)
  const fields = ['title', 'description', 'canonical', 'ogUrl', 'ogTitle', 'ogSiteName', 'ogType', 'ogImage', 'ogDescription', 'publishedTime']
  for (const f of fields) {
    const same = postResults.filter((r) => r.got[f] === r.b[f]).length
    t.diagnostic(`文章 ${f}: ${same}/364`)
    assert.equal(same, 364, f)
  }
  const modSame = postResults.filter((r) => r.got.modifiedTime === r.b.modifiedTime).length
  t.diagnostic(`文章 modifiedTime 與基準相同 ${modSame}/364（基準多半是作者電腦的檔案時間；只有 install-nvm 有 updated）`)
})

test('每頁沒有重複的 head 欄位，og:site_name 全站都是舊站名，每頁都有 google-adsense-account', () => {
  for (const r of results) {
    assert.deepEqual(r.got.dupes, [], r.b.url)
    assert.equal(r.got.ogSiteName, SITE, r.b.url)
    assert.equal(r.got.adsMeta, ADSENSE_CLIENT, r.b.url)
  }
})

test('article:published_time：文章是檔名日期的台北 00:00；about、/tags/ 用 front matter 的 date', () => {
  const r = (url) => results.find((x) => x.b.url === url).got
  assert.equal(r('/development/2022/01/10/install-nvm/').publishedTime, '2022-01-09T16:00:00.000Z')
  assert.equal(r('/development/2022/01/10/install-nvm/').modifiedTime, '2026-07-08T16:00:00.000Z')
  assert.equal(r('/javascript/2019/03/18/JS-THIS/').modifiedTime, r('/javascript/2019/03/18/JS-THIS/').publishedTime)
  assert.equal(r('/about/').publishedTime, '2019-11-12T07:28:32.000Z')
  assert.equal(r('/about/hexschool-traning.html').publishedTime, '2022-06-12T07:28:32.000Z')
  const tagsFm = frontmatterOf('tags/index.md')
  assert.equal(r('/tags/').publishedTime, tagsFm.date ? '2016-10-11T08:21:43.000Z' : null)
  assert.equal(r('/').publishedTime, null)
  assert.equal(r('/categories/CSS/').publishedTime, null)
})

test('canonical 與 og:url：hexschool-traning 不帶副檔名、/categories/CSS/ 大寫、中文標籤 percent-encode', () => {
  const r = (url) => results.find((x) => x.b.url === url).got
  assert.equal(r('/about/hexschool-traning.html').canonical, 'https://www.casper.tw/about/hexschool-traning')
  assert.equal(r('/categories/CSS/').canonical, 'https://www.casper.tw/categories/CSS/')
  assert.equal(r('/categories/CSS/page/2/').ogUrl, 'https://www.casper.tw/categories/CSS/page/2/')
  assert.equal(r('/tags/sass/').canonical, 'https://www.casper.tw/tags/sass/')
  assert.equal(r('/tags/%E8%B3%87%E5%AE%89/').canonical, 'https://www.casper.tw/tags/%E8%B3%87%E5%AE%89/')
  assert.equal(r('/javascript/2019/03/18/JS-THIS/').canonical, 'https://www.casper.tw/javascript/2019/03/18/JS-THIS/')
  assert.equal(r('/sass/2014/05/02/sass-3.3/').canonical, 'https://www.casper.tw/sass/2014/05/02/sass-3.3/')
})

test('title 公式：首頁與 /page/N/ 只有站名；分類、標籤、封存逐字照基準', () => {
  const r = (url) => results.find((x) => x.b.url === url)
  assert.equal(r('/').got.title, SITE)
  assert.equal(r('/').pageData.titleTemplate, false)
  assert.equal(r('/page/2/').got.title, SITE)
  assert.equal(r('/categories/CSS/').got.title, `分類：css | ${SITE}`)
  assert.equal(r('/tags/node-js/').got.title, `標籤：node.js | ${SITE}`)
  assert.equal(r('/tags/sass/').got.title, `標籤：sass | ${SITE}`)
  assert.equal(r('/archives/').got.title, `封存 | ${SITE}`)
  assert.equal(r('/archives/2014/').got.title, `封存：2014 | ${SITE}`)
  assert.equal(r('/archives/2014/05/').got.title, `封存：2014/5 | ${SITE}`)
  assert.equal(r('/tags/').got.title, `所有標籤 | ${SITE}`)
  // og:title 不帶站名：文章、about、/tags/ 是頁名；列表頁跟 Hexo 一樣是站名
  assert.equal(r('/about/').got.ogTitle, '關於卡斯伯')
  assert.equal(r('/tags/').got.ogTitle, '所有標籤')
  assert.equal(r('/categories/CSS/').got.ogTitle, SITE)
})

test('description：列表公式、首頁 tagline、/tags/ 沒有 description（不出現 VitePress 的預設描述）', () => {
  const r = (url) => results.find((x) => x.b.url === url).got
  assert.equal(r('/').description, HOME_DESCRIPTION)
  assert.equal(r('/').ogDescription, null)
  assert.equal(r('/categories/javascript/').description, `「javascript」分類的所有文章 — ${SITE}`)
  assert.equal(r('/tags/sass/page/3/').description, `標籤「sass」的相關文章 — ${SITE}`)
  assert.equal(r('/archives/2014/05/').description, `文章封存 — ${SITE}`)
  assert.equal(r('/tags/').description, frontmatterOf('tags/index.md').description ?? null)
  for (const x of results) assert.notEqual(x.got.description, 'A VitePress site', x.b.url)
})

test('JSON-LD：文章 BlogPosting＋BreadcrumbList＋Person，列表 CollectionPage，about WebPage，首頁沒有', () => {
  const byType = {}
  for (const r of results) {
    const key = `${r.b.type}: ${r.got.jsonLdTypes.join(' | ') || '（無）'}`
    byType[key] = (byType[key] ?? 0) + 1
  }
  assert.deepEqual(byType, {
    'post: BlogPosting,BreadcrumbList,Person': 364,
    'home: （無）': 1,
    'home-page: CollectionPage,BreadcrumbList': 36,
    'category: CollectionPage,BreadcrumbList': 53,
    'tag: CollectionPage,BreadcrumbList': 119,
    'archive: CollectionPage,BreadcrumbList': 81,
    'tags-index: CollectionPage,BreadcrumbList': 1,
    'about: WebPage,BreadcrumbList': 2,
  })
  const post = results.find((r) => r.b.url === '/development/2022/01/10/install-nvm/').got.jsonLd[0]
  const [article, crumbs, person] = post
  assert.equal(article.headline, 'nvm 安裝教學：Windows／Mac 設定 Node.js 版本管理與常用指令')
  assert.equal(article.datePublished, '2022-01-10T00:00:00+08:00')
  assert.equal(article.dateModified, '2026-07-09T00:00:00+08:00')
  assert.equal(article.mainEntityOfPage, 'https://www.casper.tw/development/2022/01/10/install-nvm/')
  assert.deepEqual(article.author, { '@id': PERSON_ID })
  assert.deepEqual(article.publisher, { '@id': PERSON_ID })
  assert.deepEqual(article.image, ['https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2FNVM.jpg?alt=media&token=a38ca452-71d3-4c5c-bcbd-6dc77e9d50e8'])
  assert.deepEqual(person, { '@context': 'https://schema.org', '@type': 'Person', '@id': 'https://www.casper.tw/about/#person', name: '卡斯伯', url: 'https://www.casper.tw/about/' })
  assert.deepEqual(crumbs.itemListElement.map((i) => [i.position, i.name, i.item]), [
    [1, '首頁', 'https://www.casper.tw/'],
    [2, '文章', 'https://www.casper.tw/categories/'],
    [3, 'development', 'https://www.casper.tw/categories/development/'],
  ])
  // 每篇文章的 datePublished 都是檔名日期 +08:00，沒有 image 的不輸出 image
  for (const r of results.filter((x) => x.b.type === 'post')) {
    const [a] = r.got.jsonLd[0]
    const m = r.b.url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//)
    assert.equal(a.datePublished, `${m[1]}-${m[2]}-${m[3]}T00:00:00+08:00`)
    assert.equal(new Date(a.datePublished).toISOString(), r.b.publishedTime)
    assert.deepEqual(a.image, r.b.ogImage ? [r.b.ogImage] : undefined)
  }
  const cat = results.find((r) => r.b.url === '/categories/CSS/page/2/').got.jsonLd[0]
  assert.equal(cat[0]['@id'], 'https://www.casper.tw/categories/CSS/page/2/')
  assert.equal(cat[0].name, '分類：css')
  assert.deepEqual(cat[0].breadcrumb, { '@id': 'https://www.casper.tw/categories/CSS/page/2/#breadcrumb' })
  assert.equal(cat[1].itemListElement.at(-1).item, 'https://www.casper.tw/categories/CSS/page/2/')
  for (const r of results) assert.ok(!JSON.stringify(r.got.jsonLd).includes('FAQPage'))
})

test('keywords 與 article:tag：集合等於 front matter 的標籤；只有文章有 article:tag', () => {
  for (const r of results) {
    const tags = [r.pageData.frontmatter.tags ?? []].flat().map(String)
    if (r.b.type === 'post') {
      assert.equal(r.got.keywords, tags.length ? tags.join(',') : null, r.b.url)
      assert.deepEqual(r.got.articleTags, [...tags].sort(), r.b.url)
    } else {
      assert.equal(r.got.keywords, null, r.b.url)
      assert.deepEqual(r.got.articleTags, [], r.b.url)
    }
  }
})

test('keywords 與 article:tag 的順序：有 routes 模組的 post.tags（Hexo 的標籤建立順序）就照它', () => {
  const fm = { title: 'x', description: 'd', tags: ['javascript', 'nodejs'], post: { tags: [{ name: 'nodejs', url: '/tags/nodejs/' }, { name: 'javascript', url: '/tags/javascript/' }] } }
  const seo = pageSeo({ type: 'post', url: '/development/2022/01/10/x/', fm })
  assert.deepEqual(seo.tags, ['nodejs', 'javascript'])
  assert.deepEqual(pageSeo({ type: 'post', url: '/development/2022/01/10/x/', fm: { ...fm, post: undefined } }).tags, ['javascript', 'nodejs'])
})

test('article:tag 依名稱的字碼順序（Hexo 基準 364 篇都是），keywords 維持建立順序', () => {
  // css/2013/08/20/text-shadow-demo：Hexo 的 keywords 是「sass,css」，article:tag 是 css、sass
  const fm = { title: 'x', description: 'd', post: { tags: [{ name: 'sass' }, { name: 'css' }] } }
  const head = pageHead(pageSeo({ type: 'post', url: '/css/2013/08/20/text-shadow-demo/', fm }))
  const metas = (key) => head.filter(([t, a]) => t === 'meta' && (a.name === key || a.property === key)).map(([, a]) => a.content)
  assert.deepEqual(metas('keywords'), ['sass,css'])
  assert.deepEqual(metas('article:tag'), ['css', 'sass'])
  // 大寫排在小寫前面（UTF-16 字碼），不用語系排序
  assert.deepEqual(articleTagOrder(['vue', 'Cloudflare', 'side project']), ['Cloudflare', 'side project', 'vue'])
  const input = ['b', 'a']
  articleTagOrder(input)
  assert.deepEqual(input, ['b', 'a'], '不改原陣列')
})

test('cssdemo：86 篇有 demoFile link，陣列值攤平，網址跟 Hexo head.ejs 相同', () => {
  const withCss = results.filter((r) => r.got.cssLinks.length)
  assert.equal(withCss.length, 86)
  const vertical = results.find((r) => r.b.url === '/css/2013/10/20/Vertical-write/').got
  assert.deepEqual(vertical.cssLinks, ['https://img.casper.tw/demoFile/css/2013-winter.css'])
  const webFont = results.find((r) => r.b.url === '/css/2013/08/23/web-font/').got
  assert.deepEqual(webFont.cssLinks, ['https://img.casper.tw/demoFile/css/2013-summer.css'])
  const head = pageSeo({ type: 'post', url: '/css/2013/01/01/x/', fm: { title: 'x', description: 'd', cssdemo: ['a', ['b', '']] } })
  assert.deepEqual(head.cssdemo, ['a', 'b'])
})

test('AdSense loader：standard 模式下文章、首頁、列表載入；導覽索引不載入；ads: false 的頁不載入', () => {
  const count = {}
  for (const r of results) {
    const key = `${r.b.type}:${r.got.adsLoaders}`
    count[key] = (count[key] ?? 0) + 1
    assert.equal(r.pageData.frontmatter.ads, r.got.adsLoaders === 1, r.b.url)
  }
  assert.deepEqual(count, {
    'post:1': 364,
    'home:1': 1,
    'home-page:1': 36,
    'category:1': 53,
    'tag:1': 119,
    'archive:0': 81,
    'tags-index:0': 1,
    'about:1': 1,
    'about:0': 1,
  })
  assert.equal(results.find((r) => r.b.url === '/about/hexschool-traning.html').got.adsLoaders, 0)
})

// ---------------------------------------------------------------------------
// 新頁與 404
// ---------------------------------------------------------------------------

function runNew(rel, extra = {}) {
  const fm = { ...frontmatterOf(rel), ...extra }
  const pageData = makePageData({ relativePath: rel, frontmatter: fm })
  seoPageData(pageData, ctx)
  return { pageData, got: extract(renderPage(pageData, rel)) }
}

test('法務頁：front matter 的 title、description，WebPage＋BreadcrumbList，不載入廣告', () => {
  for (const [slug, rel] of [['privacy', 'privacy/index.md'], ['contact', 'contact/index.md'], ['terms', 'terms/index.md']]) {
    if (!fs.existsSync(path.join(srcDir, rel))) continue
    const data = frontmatterOf(rel)
    const { pageData, got } = runNew(rel, { pageType: 'legal', url: `/${slug}/`, breadcrumbs: [{ name: '首頁', url: '/' }, { name: data.title }] })
    assert.equal(got.title, `${data.title} | ${SITE}`)
    assert.equal(got.description, data.description)
    assert.equal(got.ogDescription, data.description)
    assert.equal(got.ogTitle, data.title)
    assert.equal(got.canonical, `https://www.casper.tw/${slug}/`)
    assert.equal(got.ogType, 'website')
    assert.deepEqual(got.jsonLdTypes, ['WebPage,BreadcrumbList'])
    assert.equal(got.adsLoaders, 0)
    assert.equal(got.adsMeta, ADSENSE_CLIENT)
    assert.equal(pageData.frontmatter.ads, false)
    assert.equal(got.robots, null)
  }
})

test('/categories/ 總覽：用自己的 description，CollectionPage，不載入廣告', () => {
  const fm = { title: '文章分類', description: '卡斯伯 Blog 的 27 個文章分類。', pageType: 'nav-index', url: '/categories/', breadcrumbs: [{ name: '首頁', url: '/' }, { name: '文章' }] }
  const pageData = makePageData({ relativePath: 'categories/index.md', frontmatter: fm })
  seoPageData(pageData, ctx)
  const got = extract(renderPage(pageData, 'categories/index.md'))
  assert.equal(got.title, `文章分類 | ${SITE}`)
  assert.equal(got.description, '卡斯伯 Blog 的 27 個文章分類。')
  assert.equal(got.canonical, 'https://www.casper.tw/categories/')
  assert.deepEqual(got.jsonLdTypes, ['CollectionPage,BreadcrumbList'])
  assert.equal(got.adsLoaders, 0)
})

test('404：noindex、沒有 JSON-LD、拿掉 loader；沒有 404.md 時 transformHtml 也補上 noindex', () => {
  const pageData = makePageData({ relativePath: '404.md', frontmatter: { title: '這頁找不到', pageType: 'not-found' } })
  seoPageData(pageData, ctx)
  const got = extract(renderPage(pageData, '404.md'))
  assert.equal(got.robots, 'noindex')
  assert.deepEqual(got.jsonLdTypes, [])
  assert.equal(got.adsLoaders, 0)
  assert.equal(got.canonical, null)
  assert.deepEqual(got.dupes, [])
  assert.equal(pageData.frontmatter.ads, false)

  // VitePress 沒有 404.md 時用內建的 notFoundPageData，不經過 transformPageData
  const builtin = { relativePath: '404.md', filePath: '', title: '404', description: 'Not Found', headers: [], frontmatter: { sidebar: false, layout: 'page' }, isNotFound: true }
  const html = extract(renderPage(builtin, '404.md'))
  assert.equal(html.robots, 'noindex')
  assert.equal(html.adsLoaders, 0)
  // title 與 description 換成中文，不留 VitePress 內建的「404 | 站名」「Not Found」
  assert.equal(html.title, NOT_FOUND_TITLE)
  assert.equal(html.title, `這頁找不到 | ${SITE}`)
  assert.equal(html.description, NOT_FOUND_DESCRIPTION)
  assert.deepEqual(html.dupes, [])
})

test('404：VitePress 留空的 <div id="app"> 補上 SSR 的內容，其他頁不動', () => {
  const content = '<div class="vp-raw site page-type-not-found"><h1 class="not-found__title">這頁找不到</h1></div>'
  const shell = '<html><head><title>404</title></head><body><div id="app"></div></body></html>'
  const nf = transformHtml(shell, '/dist/404.html', { page: '404.md', pageData: { relativePath: '404.md', isNotFound: true, frontmatter: {} }, content })
  assert.ok(nf.includes(`<div id="app">${content}</div>`))
  assert.match(nf, /<meta name="robots" content="noindex">/)
  // 沒有 description 的 404 也補上中文的 description
  assert.ok(nf.includes(`<title>${NOT_FOUND_TITLE}</title>`))
  assert.ok(nf.includes(`<meta name="description" content="${NOT_FOUND_DESCRIPTION}">`))
  // 內容裡的 $& 這類字串不能被 String.replace 當成替換樣式
  const tricky = transformHtml(shell, '/dist/404.html', { page: '404.md', pageData: { isNotFound: true, frontmatter: {} }, content: '<p>$& $1</p>' })
  assert.ok(tricky.includes('<div id="app"><p>$& $1</p></div>'))
  // 一般頁的 #app 由 VitePress 自己填，transformHtml 不碰
  const post = transformHtml(shell, '/dist/x.html', { page: 'index.md', pageData: { relativePath: 'index.md', frontmatter: { pageType: 'home' } }, content })
  assert.ok(post.includes('<div id="app"></div>'))
})

// ---------------------------------------------------------------------------
// 單元規則
// ---------------------------------------------------------------------------

test('transformHtml 跳脫 description：引號與 & 不會弄壞屬性', () => {
  const fm = { title: 'x', description: '用 "引號" & <標籤>', pageType: 'post', url: '/js/2020/01/01/x/' }
  const pageData = makePageData({ relativePath: 'js/2020/01/01/x/index.md', frontmatter: fm })
  seoPageData(pageData, ctx)
  const html = renderPage(pageData, 'js/2020/01/01/x/index.md')
  assert.ok(html.includes('<meta name="description" content="用 &quot;引號&quot; &amp; &lt;標籤&gt;">'))
  assert.equal(extract(html).description, '用 "引號" & <標籤>')
  assert.equal(extract(html).ogDescription, '用 "引號" & <標籤>')
})

test('沒有 description 也不在凍結清單的文章：建置時失敗，提醒新文章要寫 description', () => {
  assert.throws(() => pageSeo({ type: 'post', url: '/js/2027/01/01/new-post/', fm: { title: '新文章' } }), /description/)
})

test('分類、標籤列表頁沒有 heading 時明確失敗', () => {
  assert.throws(() => pageSeo({ type: 'taxonomy-list', url: '/tags/x/', fm: {} }), /heading/)
  assert.throws(() => pageSeo({ type: 'taxonomy-list', url: '/tags/x/', fm: { heading: '分類：x' } }), /heading/)
})

test('archiveTitle、日期轉換', () => {
  assert.equal(archiveTitle('/archives/'), '封存')
  assert.equal(archiveTitle('/archives/2013/'), '封存：2013')
  assert.equal(archiveTitle('/archives/2013/08/'), '封存：2013/8')
  assert.equal(archiveTitle('/archives/2013/12/'), '封存：2013/12')
  assert.equal(taipeiDateTimeIso('2022-6-12 15:28:32'), '2022-06-12T07:28:32.000Z')
  assert.equal(taipeiDateTimeIso(new Date('2019-11-12T15:28:32Z')), '2019-11-12T07:28:32.000Z')
  assert.equal(dateOnly(new Date('2026-07-09T00:00:00Z')), '2026-07-09')
  assert.equal(dateOnly('2026-7-9'), '2026-07-09')
})

test('firstImage：Markdown 與 HTML 的圖取先出現的；程式碼裡的不算', () => {
  assert.equal(firstImage('文字\n![a](https://a/1.png "t")\n<img src="https://a/2.png">'), 'https://a/1.png')
  assert.equal(firstImage('<p><img class="x" src="https://a/2.png?a=1&amp;b=2"></p>\n![a](https://a/1.png)'), 'https://a/2.png?a=1&b=2')
  assert.equal(firstImage('```html\n<img src="https://a/code.png">\n```\n`<img src="x">`\n![b](https://a/real.png)'), 'https://a/real.png')
  assert.equal(firstImage('沒有圖'), '')
  // 相對網址以本頁網址為基準
  const seo = pageSeo({ type: 'post', url: '/js/2020/01/01/x/', fm: { title: 'x', description: 'd', thumbnail: 'cover.png' } })
  assert.equal(seo.ogImage, 'https://www.casper.tw/js/2020/01/01/x/cover.png')
})

test('jsonLdString 把 < 換掉，內容裡的 </script> 不會結束標籤', () => {
  const s = jsonLdString([{ headline: '</script><b>' }])
  assert.ok(!s.includes('</script>'))
  assert.deepEqual(JSON.parse(s), [{ headline: '</script><b>' }])
})

test('siteHead：GA4 與 FB Pixel 只在 www.casper.tw 執行；沒有 highlight.js、Google Fonts 與 noscript', () => {
  const scripts = siteHead.filter(([t]) => t === 'script').map(([, , inner]) => inner)
  const ga = scripts.find((s) => s.includes('G-97433H4032'))
  const px = scripts.find((s) => s.includes('152520611964487'))
  assert.ok(ga.startsWith("(function(){if(location.hostname!=='www.casper.tw')return;"))
  assert.ok(px.startsWith("(function(){if(location.hostname!=='www.casper.tw')return;"))
  const flat = JSON.stringify(siteHead)
  assert.ok(!flat.includes('highlightjs'))
  assert.ok(!flat.includes('fonts.googleapis'))
  assert.ok(!flat.includes('noscript'))
  assert.ok(flat.includes('/atom.xml'))
  // GA 片段在非正式主機名不會插入 gtag.js
  for (const [host, expected] of [['localhost', 0], ['www.casper.tw', 1]]) {
    const appended = []
    const fakeWindow = { dataLayer: undefined }
    const fakeDocument = { createElement: () => ({}), head: { appendChild: (el) => appended.push(el) } }
    new Function('location', 'window', 'document', ga)({ hostname: host }, fakeWindow, fakeDocument)
    assert.equal(appended.length, expected, host)
    if (expected) assert.deepEqual(fakeWindow.dataLayer.map((a) => [...a][0]), ['js', 'config'])
  }
})

// ---------------------------------------------------------------------------
// 外語首頁 /<code>/（主站首頁規格 D.2 到 D.5、D.9）：pagedata 寫 fm.site，seoPageData 組 head，transformHtml 換 GA4
// ---------------------------------------------------------------------------

const homePage = (code) => ({ code, url: `https://www.casper.tw/${code}/`, preview: false })
const HOME_PLAN = { stage: 'live', published: ['en', 'ja'], pages: [homePage('en'), homePage('ja')], problems: [], warnings: [] }

/** 外語首頁或 / 走一遍 pagedata、seo、renderPage */
async function renderSiteHome(relativePath, plan = HOME_PLAN) {
  const { pageDataFor } = await import('./pagedata.mjs')
  const pageData = makePageData({ relativePath, frontmatter: {} })
  pageDataFor(pageData, ctx, srcDir, { plan })
  seoPageData(pageData, ctx, { plan })
  return { pageData, html: renderPage(pageData, relativePath) }
}

test('外語首頁的 head：順序照 D.2，hreflang 照 LOCALES 排序、zh 接在 zh-Hant 後面、x-default 在最後，og:site_name 與 og:locale 不重複', async () => {
  const { siteHomeHeadSequence } = await import('../../../scripts/lib/extract-page.mjs')
  const { pageData, html } = await renderSiteHome('en/index.md')
  const fm = pageData.frontmatter
  assert.equal(pageData.titleTemplate, false)
  assert.equal(pageData.title, fm.title)
  assert.equal(fm.ads, shouldLoadAds({ type: 'site-home' }))
  const x = extract(html)
  assert.deepEqual(x.dupes, [])
  assert.equal(x.title, fm.title)
  assert.equal(x.description, fm.site.home.meta.description)
  assert.equal(x.canonical, 'https://www.casper.tw/en/')
  assert.equal(x.ogTitle, fm.site.home.meta.tagline)
  assert.equal(x.ogType, 'website')
  assert.equal(x.robots, null)
  const kinds = siteHomeHeadSequence(html).map((s) => s.replace(/=.*$/, ''))
  assert.deepEqual(kinds.filter((k) => !['og:locale:alternate'].includes(k)), [
    'title', 'description', 'canonical', 'hreflang:en', 'hreflang:zh-Hant', 'hreflang:zh', 'hreflang:ja', 'hreflang:x-default',
    'og:type', 'og:url', 'og:title', 'og:description', 'og:site_name', 'og:locale',
    'og:image', 'og:image:width', 'og:image:height', 'og:image:alt', 'jsonld',
  ])
  assert.equal(kinds.filter((k) => k === 'og:locale:alternate').length, 2)
})

test('外語首頁的 JSON-LD：WebPage 一筆，inLanguage 是頁面語言，isPartOf 指 / 的 WebSite', async () => {
  const { html } = await renderSiteHome('ja/index.md')
  const x = extract(html)
  assert.deepEqual(x.jsonLdTypes, ['WebPage'])
  const [page] = x.jsonLd[0]
  assert.equal(page['@id'], 'https://www.casper.tw/ja/#webpage')
  assert.equal(page.inLanguage, 'ja')
  assert.deepEqual(page.isPartOf, { '@id': 'https://www.casper.tw/#website' })
  assert.deepEqual(page.author, { '@id': PERSON_ID })
})

test('外語首頁的 transformHtml：拿掉 FB Pixel、article:author、舊 GA4，loader 照 shouldLoadAds，插入帶 page_locale 的 GA4', async () => {
  const { pageData, html } = await renderSiteHome('en/index.md')
  assert.ok(!html.includes('fbevents.js'))
  assert.ok(!html.includes('article:author'))
  assert.ok(!html.includes("content_group:'blog'"))
  // site-home 跟繁中首頁一樣是 standardOnly（站長 2026-11-04，0008 更正第 9 點）
  assert.equal(pageData.frontmatter.ads, shouldLoadAds({ type: 'site-home' }))
  assert.equal(countAdsLoaders(html), shouldLoadAds({ type: 'site-home' }) ? 1 : 0)
  assert.ok(html.includes(`name="google-adsense-account" content="${ADSENSE_CLIENT}"`))
  const configs = [...html.matchAll(/gtag\('config', "G-97433H4032", (\{[^)]*\})\)/g)].map((m) => JSON.parse(m[1]))
  assert.deepEqual(configs, [{ content_group: 'site-home', page_locale: 'en' }])
  assert.ok(html.indexOf("gtag('consent', 'default'") < html.indexOf("gtag('config'"))
})

test('preview 的外語首頁：最前面多 robots noindex, nofollow；hreflang 跟著 plan.pages', async () => {
  const plan = { stage: 'preview', published: [], pages: [{ ...homePage('en'), preview: true }, { ...homePage('ko'), preview: true }], problems: [], warnings: [] }
  const { html } = await renderSiteHome('ko/index.md', plan)
  const x = extract(html)
  assert.equal(x.robots, 'noindex, nofollow')
  assert.deepEqual([...html.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i), ['en', 'zh-Hant', 'zh', 'ko', 'x-default'])
})

test('繁中首頁 /：有外語首頁時才加叢集的 hreflang 與 og:locale:alternate，其他繁中頁一律不加', async () => {
  const { html } = await renderSiteHome('index.md')
  assert.deepEqual([...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1]), ['en', 'zh-Hant', 'zh', 'ja', 'x-default'])
  assert.equal([...html.matchAll(/og:locale:alternate/g)].length, 2)
  const p1 = await renderSiteHome('index.md', { stage: 'live', published: [], pages: [], problems: [], warnings: [] })
  assert.ok(!p1.html.includes('hreflang='))
  assert.ok(!p1.html.includes('og:locale:alternate'))
  const about = await renderSiteHome('about/index.md')
  assert.ok(!about.html.includes('hreflang='))
})

test('site-home 沒有 fm.site 時 seoPageData 丟錯', () => {
  assert.throws(() => seoPageData(makePageData({ relativePath: 'en/index.md', frontmatter: {} }), ctx), /是 site-home，要先由 lib\/pagedata\.mjs 寫 fm\.site/)
})

test('siteHeadFor：S 版（shared）的 GA4 是 ga4HeadHtml() 的 consent 版，content_group blog、不帶 page_locale；其他項目跟 legacy 相同', () => {
  const shared = siteHeadFor('shared')
  const legacy = siteHeadFor('legacy')
  assert.deepEqual(legacy, siteHead)
  assert.equal(shared.length, legacy.length)
  const ga = shared.filter(([t]) => t === 'script').map(([, , inner]) => inner).find((s) => s.includes('G-97433H4032'))
  assert.equal(ga, GA4_SHARED_SNIPPET)
  assert.ok(!ga.includes('<script>') && !ga.includes('</script>'))
  assert.match(ga, /^if \(location\.hostname === "www\.casper\.tw"\) \{/)
  // consent default 在 config 之前
  assert.ok(ga.indexOf("gtag('consent', 'default'") < ga.indexOf("gtag('config'"))
  assert.match(ga, /gtag\('config', "G-97433H4032", \{"content_group":"blog"\}\)/)
  assert.ok(!ga.includes('page_locale'))
  // GA4 以外逐項相同
  const strip = (head) => head.filter(([t, , inner]) => !(t === 'script' && String(inner).includes('G-97433H4032')))
  assert.deepEqual(strip(shared), strip(legacy))
  assert.throws(() => siteHeadFor('new'), /shell 要是/)
})

test('seoPageData：S 版的 404（source/404.md）只寫 title、description，不加 head、不載廣告', () => {
  const pageData = { relativePath: '404.md', title: '', frontmatter: { pageType: 'not-found' } }
  assert.equal(seoPageData(pageData, {}), null)
  assert.equal(pageData.title, NOT_FOUND_TITLE)
  assert.equal(pageData.titleTemplate, false)
  assert.equal(pageData.description, NOT_FOUND_DESCRIPTION)
  assert.equal(pageData.frontmatter.head, undefined)
  assert.equal(pageData.frontmatter.ads, false)
})

test('transformHtml：S 版的 404（有 fm.site）拿掉 module script 與 modulepreload；沒有 fm.site 時照舊', () => {
  const html = [
    '<html><head><title>404</title>',
    '<link rel="modulepreload" href="/assets/chunks/framework.abc12345.js">',
    '<link rel="stylesheet" href="/assets/style.abc12345.css">',
    '</head><body><div id="app"><main>x</main></div>',
    '<script type="module" src="/assets/app.abc12345.js"></script>',
    '<script>window.x=1</script>',
    '</body></html>'
  ].join('\n')
  const s = transformHtml(html, '404.html', { page: '404.md', pageData: { frontmatter: { pageType: 'not-found', site: { locale: 'zh-tw' } } } })
  assert.ok(!s.includes('modulepreload'))
  assert.ok(!s.includes('type="module"'))
  assert.ok(s.includes('rel="stylesheet"'))
  assert.ok(s.includes('<script>window.x=1</script>'))
  assert.ok(s.includes('<meta name="robots" content="noindex">'))
  const legacy = transformHtml(html, '404.html', { page: '404.md', pageData: { frontmatter: { pageType: 'not-found' } } })
  assert.ok(legacy.includes('modulepreload') && legacy.includes('type="module"'))
  assert.equal(stripHydration('<script type="module">import "x"</script><p>a</p>'), '<p>a</p>')
})
