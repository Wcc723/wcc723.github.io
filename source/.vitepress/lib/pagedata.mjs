// 負責：routes 模組（P1 workflow）。介面見 ../README.md。
// transformPageData 的前半段（每一頁的頁型、網址、麵包屑、H1、卡片、上下篇、文章側欄），以及動態路由 paths loader 用的資料。
// 只在 Node 端執行（config.mts、paths loader），主題不 import。
//
// 順序、分頁、上下篇都照 Hexo（develop 分支的 hexo-generator-index、-category、-tag、-archive 與 casper-2026 主題）：
// - 列表一律依日期新到舊；同一天的文章依檔名「升冪」（Hexo 的排序是穩定排序，同日保留讀檔順序）。
//   基準裡同一天的兩組（2014-01-04、2020-09-22）在首頁分頁、分類、封存、content.json 都是這個順序。
// - 每頁 10 篇（_config.yml 的 per_page），分頁網址 <base>page/N/，第 1 頁就是 <base>。
// - 上下篇照 post-nav.ejs：prev 是較新一篇（右邊「較新一篇 →」），next 是較舊一篇（左邊「← 較舊一篇」）。
// - 標籤順序照 Hexo 資料庫的建立順序：依檔名讀文章時第一次出現的先後（基準 364 篇有 362 篇相同，見 feeds.test.mjs）。
import { loadPosts, categoryDir, tagSlug, toAbsolute } from './posts.mjs'
import { pageTypeOf } from './pagetype.mjs'
import { SITE_NAME } from '../theme/shared/shell/site.mjs'
import { LOCALES } from '../theme/shared/shell/i18n/locales.mjs'
import siteConfig from '../site.config.mjs'
import { buildSiteHomePlan, effectiveShell, siteHomeTitle } from './site-home.mjs'
import { siteFrontmatter } from './site-shell.mjs'
import {
  cardFor,
  categoryUrl,
  tagUrl,
  postCover,
  readingTimeFor,
  renderArchive,
  renderCards,
  renderCategoryList,
  renderTagCloud
} from './cards.mjs'

export const PER_PAGE = 10
export const RELATED_COUNT = 3
// 文章頁側欄：相關文章 5 篇、熱門標籤 20 個（每頁 frontmatter 只多這兩份小清單）
export const SIDEBAR_RELATED_COUNT = 5
export const SIDEBAR_TAG_COUNT = 20
export const ABOUT_NAME = '關於卡斯伯'
export const NOT_FOUND_HEADING = '這頁找不到'

const HOME = { name: '首頁', url: '/' }
const ARTICLES = { name: '文章', url: '/categories/' }

const byFileAsc = (a, b) => (a.file < b.file ? -1 : a.file > b.file ? 1 : 0)

// Hexo 的列表順序：日期新到舊，同日依檔名升冪
export function hexoOrder(posts) {
  return [...posts].sort((a, b) => (a.date === b.date ? byFileAsc(a, b) : a.date < b.date ? 1 : -1))
}

export function totalPages(count) {
  return Math.max(1, Math.ceil(count / PER_PAGE))
}

export function pageUrl(base, n) {
  return n === 1 ? base : `${base}page/${n}/`
}

export function pageSlice(posts, n) {
  return posts.slice((n - 1) * PER_PAGE, n * PER_PAGE)
}

// pager：prevUrl 是較新的一頁（第 2 頁的上一頁是第 1 頁 = base），nextUrl 是較舊的一頁；pages 給跳頁選單
export function pagerFor(base, current, total) {
  return {
    current,
    total,
    base,
    prevUrl: current > 1 ? pageUrl(base, current - 1) : null,
    nextUrl: current < total ? pageUrl(base, current + 1) : null,
    pages: Array.from({ length: total }, (_, i) => ({ number: i + 1, url: pageUrl(base, i + 1) }))
  }
}

// 只差大小寫的兩個網址會互相覆蓋（macOS 的檔案系統、VitePress 用小寫查頁面 chunk），一律讓建置失敗
function assertNoCaseCollision(kind, keys) {
  const seen = new Map()
  for (const k of keys) {
    const low = k.toLowerCase()
    if (seen.has(low) && seen.get(low) !== k) {
      const hint = kind === '標籤' ? '標籤一律小寫，請改 front matter（npm run migrate 會處理 Sass、Bootstrap、Vue）' : '請統一 front matter 的寫法'
      throw new Error(`${kind}只差大小寫：${seen.get(low)}、${k}。${hint}`)
    }
    seen.set(low, k)
  }
}

let indexCache = null

// 全站的文章索引：列表順序、分類、標籤、封存。依 srcDir 和文章清單快取（dev 時文章增減會重算）
export function siteIndex(srcDir) {
  const published = loadPosts(srcDir)
  const signature = published.map((p) => p.file).join('\n')
  if (indexCache && indexCache.srcDir === srcDir && indexCache.signature === signature) return indexCache.index

  const posts = hexoOrder(published)
  const byUrl = new Map(posts.map((p) => [p.url, p]))
  const position = new Map(posts.map((p, i) => [p.url, i]))

  // Hexo 資料庫的標籤建立順序：所有文章（含 published: false，Hexo 一樣會讀）依檔名升冪，第一次出現的先建立
  const tagRank = new Map()
  for (const p of [...loadPosts(srcDir, { includeUnpublished: true })].sort(byFileAsc)) {
    for (const t of p.tags) if (!tagRank.has(t)) tagRank.set(t, tagRank.size)
  }

  const categoryMap = new Map()
  const tagMap = new Map()
  const yearMap = new Map()
  for (const p of posts) {
    let c = categoryMap.get(p.category)
    if (!c) categoryMap.set(p.category, (c = { name: p.category, dir: categoryDir(p.category), url: categoryUrl(p.category), posts: [] }))
    c.posts.push(p)
    for (const name of p.tags) {
      const slug = tagSlug(name)
      let t = tagMap.get(slug)
      if (!t) tagMap.set(slug, (t = { name, slug, url: tagUrl(name), posts: [] }))
      if (t.name !== name) throw new Error(`標籤 ${t.name} 和 ${name} 的網址都是 /tags/${slug}/，請統一寫法`)
      t.posts.push(p)
    }
    let y = yearMap.get(p.year)
    if (!y) yearMap.set(p.year, (y = { year: p.year, url: `/archives/${p.year}/`, posts: [], monthMap: new Map() }))
    y.posts.push(p)
    let m = y.monthMap.get(p.month)
    if (!m) y.monthMap.set(p.month, (m = { year: p.year, month: p.month, url: `/archives/${p.year}/${p.month}/`, posts: [] }))
    m.posts.push(p)
  }
  assertNoCaseCollision('分類', [...categoryMap.values()].map((c) => c.dir))
  assertNoCaseCollision('標籤', [...tagMap.keys()])

  const byCount = (a, b) => b.posts.length - a.posts.length || (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1)
  const categories = [...categoryMap.values()].sort(byCount)
  const tags = [...tagMap.values()].sort(byCount)
  const years = [...yearMap.values()]
    .sort((a, b) => (a.year < b.year ? 1 : -1))
    .map(({ monthMap, ...y }) => ({ ...y, months: [...monthMap.values()].sort((a, b) => (a.month < b.month ? 1 : -1)) }))

  const index = {
    posts,
    byUrl,
    position,
    tagRank,
    categories,
    categoryByDir: new Map(categories.map((c) => [c.dir, c])),
    tags,
    tagBySlug: new Map(tags.map((t) => [t.slug, t])),
    years
  }
  indexCache = { srcDir, signature, index }
  return index
}

// 照一般規則重現不了 Hexo 標籤順序的文章：檔名 → 基準（baseline/hexo-2026-11-03/content.json）的標籤順序。
// 影響 content.json、atom 的 <category>、keywords 與 article:tag 的順序。標籤有增減（跟這裡不是同一組）就不再套用。
// - vscode-chinese、ten-mins-learn-markdown：Hexo 讀檔是非同步的，標籤建立的先後偶爾不照檔名。
// - 2016-12 的 6 篇 [css, Sass]：Sass 併成小寫 sass 之後，sass 的建立順序變成小寫 sass 第一次出現的位置，
//   排到 css 前面；照線上的順序凍結（只改標籤大小寫，順序不動）。
export const LEGACY_TAG_ORDER = {
  '2019-12-01-vscode-chinese.md': ['vscode', 'develop'],
  '2019-11-23-ten-mins-learn-markdown.md': ['develop', 'markdown'],
  '2016-12-25-sass-map.md': ['css', 'sass'],
  '2016-12-26-sass-extend.md': ['css', 'sass'],
  '2016-12-27-over-my-dead-body.md': ['css', 'sass'],
  '2016-12-28-ios-input.md': ['css', 'sass'],
  '2016-12-29-one-class.md': ['css', 'sass'],
  '2016-12-30-ironman-ending.md': ['css', 'sass']
}

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x))

// 一篇文章的標籤，照 Hexo 的資料庫順序
export function orderedTags(post, index) {
  const legacy = LEGACY_TAG_ORDER[post.file]
  if (legacy && sameSet(legacy, post.tags)) return [...legacy]
  return [...post.tags].sort((a, b) => index.tagRank.get(a) - index.tagRank.get(b))
}

const link = (p) => ({ title: p.title, url: p.url })

// 接著讀：同分類的其他文章，離本篇最近的先（同距離時較舊的先，接著往下讀），
// 已經出現在上下篇的排到最後，分類太小時才補進來。
export function relatedOf(post, index, exclude = []) {
  const list = index.categories.find((c) => c.name === post.category)?.posts ?? []
  const i = list.indexOf(post)
  const skip = new Set(exclude)
  return list
    .map((p, j) => ({ p, j }))
    .filter(({ p }) => p !== post)
    .sort((a, b) => {
      const na = skip.has(a.p.url) ? 1 : 0
      const nb = skip.has(b.p.url) ? 1 : 0
      return na - nb || Math.abs(a.j - i) - Math.abs(b.j - i) || b.j - a.j
    })
    .slice(0, RELATED_COUNT)
    .map(({ p }) => link(p))
}

// 側欄的相關文章：跟本篇共有的標籤數就是分數，高分在前；同分時同分類的先，再依日期新到舊，
// 最後依檔名（同一天的文章），結果跟文章讀進來的順序無關，每次建置都一樣。
// 只收分數至少 1，或同分類（分數 0）的文章：標籤和分類都不同的文章不算相關，寧可少於 5 篇。
// exclude 是頁面上已經有的連結（上一篇、下一篇、底部接著讀），不重複出現；本篇自己一律排除。
export function sidebarRelatedOf(post, index, exclude = []) {
  const skip = new Set([post.url, ...exclude])
  const mine = new Set(post.tags)
  const picked = []
  for (const p of index.posts) {
    if (skip.has(p.url)) continue
    let score = 0
    for (const t of new Set(p.tags)) if (mine.has(t)) score++
    const same = p.category === post.category ? 1 : 0
    if (score === 0 && !same) continue
    picked.push({ p, score, same })
  }
  return picked
    .sort((a, b) => b.score - a.score || b.same - a.same || (a.p.date === b.p.date ? byFileAsc(a.p, b.p) : a.p.date < b.p.date ? 1 : -1))
    .slice(0, SIDEBAR_RELATED_COUNT)
    .map(({ p }) => ({ title: p.title, url: p.url, date: p.date }))
}

// 側欄的熱門標籤：文章數多的前 20 個（同數依名稱），網址是合併後的小寫寫法（tagUrl），不會連到線上 404 的大寫標籤
export function popularTags(index) {
  return index.tags.slice(0, SIDEBAR_TAG_COUNT).map((t) => ({ name: t.name, url: t.url, count: t.posts.length }))
}

// rewrites 之後的 relativePath → 網址路徑（未編碼）
export function urlOf(relativePath) {
  const p = relativePath.replace(/\\/g, '/')
  if (p === 'index.md') return '/'
  if (p === '404.md') return '/404.html'
  if (p.endsWith('/index.md')) return '/' + p.slice(0, -'index.md'.length)
  return '/' + p.replace(/\.md$/, '')
}

function pageNumber(raw, total, what) {
  const n = Number(raw)
  if (!Number.isInteger(n) || n < 2 || n > total) throw new Error(`pagedata：${what} 沒有第 ${raw} 頁（共 ${total} 頁）`)
  return n
}

// 分類、標籤列表頁：/categories/<dir>/、/categories/<dir>/page/N/、/tags/<slug>/、/tags/<slug>/page/N/
function taxonomyData(url, index) {
  const m = url.match(/^\/(categories|tags)\/([^/]+)\/(?:page\/([^/]+)\/)?$/)
  if (!m) throw new Error(`pagedata：看不懂的列表網址 ${url}`)
  const [, kind, key, rawPage] = m
  const group = kind === 'categories' ? index.categoryByDir.get(key) : index.tagBySlug.get(key)
  if (!group) throw new Error(`pagedata：沒有這個${kind === 'categories' ? '分類' : '標籤'} ${key}`)
  const total = totalPages(group.posts.length)
  const n = rawPage == null ? 1 : pageNumber(rawPage, total, group.url)
  const label = kind === 'categories' ? '分類' : '標籤'
  const trail = kind === 'categories' ? [HOME, ARTICLES] : [HOME, ARTICLES, { name: '標籤', url: '/tags/' }]
  const breadcrumbs = n === 1 ? [...trail, { name: group.name }] : [...trail, { name: group.name, url: group.url }, { name: `第 ${n} 頁` }]
  return { heading: `${label}：${group.name}`, breadcrumbs, pager: pagerFor(group.url, n, total), postCount: group.posts.length }
}

// 封存：/archives/、/archives/YYYY/、/archives/YYYY/MM/
function archiveData(url, index) {
  const m = url.match(/^\/archives\/(?:(\d{4})\/(?:(\d{2})\/)?)?$/)
  if (!m) throw new Error(`pagedata：看不懂的封存網址 ${url}`)
  const [, year, month] = m
  const trail = [HOME, ARTICLES]
  if (!year) {
    return {
      heading: '封存',
      breadcrumbs: [...trail, { name: '封存' }],
      postCount: index.posts.length,
      listHtml: renderArchive(index.years, { pre: false })
    }
  }
  const y = index.years.find((g) => g.year === year)
  if (!y) throw new Error(`pagedata：${year} 年沒有文章`)
  const archives = { name: '封存', url: '/archives/' }
  if (!month) {
    return { heading: `封存：${year}`, breadcrumbs: [...trail, archives, { name: `${year} 年` }], postCount: y.posts.length }
  }
  const mo = y.months.find((g) => g.month === month)
  if (!mo) throw new Error(`pagedata：${year} 年 ${month} 月沒有文章`)
  return {
    heading: `封存：${year} / ${Number(month)}`,
    breadcrumbs: [...trail, archives, { name: `${year} 年`, url: y.url }, { name: `${Number(month)} 月` }],
    postCount: mo.posts.length
  }
}

function postData(url, index) {
  const p = index.byUrl.get(url)
  if (!p) throw new Error(`pagedata：文章索引裡沒有 ${url}（published: false 的文章要在 srcExclude 裡）`)
  const i = index.position.get(url)
  const prev = i > 0 ? link(index.posts[i - 1]) : null
  const next = i < index.posts.length - 1 ? link(index.posts[i + 1]) : null
  const neighbours = [prev?.url, next?.url].filter(Boolean)
  const related = relatedOf(p, index, neighbours)
  return {
    heading: p.title,
    breadcrumbs: [HOME, ARTICLES, { name: p.category, url: categoryUrl(p.category) }, { name: p.title }],
    post: {
      date: p.date,
      category: p.category,
      categoryUrl: categoryUrl(p.category),
      tags: orderedTags(p, index).map((name) => ({ name, url: tagUrl(name) })),
      readingTime: readingTimeFor(p),
      cover: postCover(p),
      updated: p.updated
    },
    prev,
    next,
    related,
    sidebar: {
      related: sidebarRelatedOf(p, index, [...neighbours, ...related.map((r) => r.url)]),
      tags: popularTags(index)
    },
    fbHref: toAbsolute(url)
  }
}

// 沒有傳 plan 時用的外語首頁計畫（測試與單獨呼叫用）；config.mts 一律傳它自己算的那一份
let defaultPlan = null
const planOf = (plan) => plan ?? (defaultPlan ??= buildSiteHomePlan())

// 每一頁都會跑（config.mts 的 transformPageData，seo 之前）。結果寫進 pageData.frontmatter，欄位見 README。
// opts：plan 是 lib/site-home.mjs 的 buildSiteHomePlan()，config 是 site.config.mjs（測試可以換）。
// fm.site（主站首頁規格 G.4）：外語首頁一律寫；其他頁只在實際用共用頁首頁尾時寫（effectiveShell：S 版起，或 preview 建置），
// P1、P2 的正式產物因此不變
export function pageDataFor(pageData, ctx, srcDir, { plan, config = siteConfig } = {}) {
  const fm = (pageData.frontmatter ??= {})
  const type = pageTypeOf(pageData.relativePath)
  const url = urlOf(pageData.relativePath)
  fm.pageType = type
  fm.url = url
  const title = typeof fm.title === 'string' ? fm.title : pageData.title || ''

  let data
  switch (type) {
    case 'home': {
      const index = siteIndex(srcDir)
      data = {
        heading: SITE_NAME,
        cards: index.posts.slice(0, PER_PAGE).map(cardFor),
        pager: pagerFor('/', 1, totalPages(index.posts.length)),
        postCount: index.posts.length
      }
      break
    }
    case 'blog-index': {
      const index = siteIndex(srcDir)
      const total = totalPages(index.posts.length)
      const n = pageNumber(url.match(/^\/page\/([^/]+)\/$/)?.[1], total, '最新文章')
      data = {
        heading: `最新文章：第 ${n} 頁`,
        breadcrumbs: [HOME, { name: `最新文章第 ${n} 頁` }],
        pager: pagerFor('/', n, total),
        postCount: index.posts.length
      }
      break
    }
    case 'taxonomy-list':
      data = taxonomyData(url, siteIndex(srcDir))
      break
    case 'nav-index': {
      const index = siteIndex(srcDir)
      if (url === '/categories/') {
        data = {
          heading: title || '文章分類',
          breadcrumbs: [HOME, { name: '文章' }],
          postCount: index.posts.length,
          listHtml: renderCategoryList(index.categories, { pre: false })
        }
      } else if (url === '/tags/') {
        data = {
          heading: title || '所有標籤',
          breadcrumbs: [HOME, ARTICLES, { name: '標籤' }],
          postCount: index.posts.length,
          listHtml: renderTagCloud(index.tags, { pre: false })
        }
      } else {
        data = archiveData(url, index)
      }
      break
    }
    case 'post':
      data = postData(url, siteIndex(srcDir))
      break
    case 'about':
      data = {
        heading: title,
        breadcrumbs: url === '/about/' ? [HOME, { name: title || ABOUT_NAME }] : [HOME, { name: ABOUT_NAME, url: '/about/' }, { name: title }],
        // FB 留言的 data-href 跟基準逐字相同：/about/hexschool-traning 不帶 .html
        fbHref: toAbsolute(url)
      }
      break
    case 'legal':
      data = { heading: title, breadcrumbs: [HOME, { name: title }] }
      break
    case 'not-found':
      data = { heading: NOT_FOUND_HEADING }
      break
    case 'site-home': {
      // 外語首頁 /<code>/（主站首頁規格 B.6）：文案、連結都在 fm.site.home，title 由 lib/seo.mjs 交給 VitePress
      const code = url.slice(1, -1)
      const site = siteFrontmatter({ pageType: type, canonical: toAbsolute(url), locale: code, plan: planOf(plan) })
      data = { title: siteHomeTitle(code, site.home), titleTemplate: false, description: site.home.meta.description, site }
      break
    }
    default:
      throw new Error(`pagedata：沒有處理頁型 ${type}`)
  }
  Object.assign(fm, data)
  if (type !== 'site-home' && effectiveShell(planOf(plan), config) === 'shared') {
    fm.site = siteFrontmatter({ pageType: type, canonical: type === 'not-found' ? '' : toAbsolute(url), plan: planOf(plan) })
  }
  return pageData
}

// ---------------------------------------------------------------------------
// 動態路由的 paths loader（source/**/[*]/index.paths.mjs 呼叫）。content 是卡片或封存清單的 HTML，
// 取代 route 檔裡的 <!-- @content -->；params 另外帶顯示名稱（name），給主題或 seo 需要時用。
// ---------------------------------------------------------------------------

// /page/2/ 到 /page/N/
export function blogIndexPaths(srcDir) {
  const { posts } = siteIndex(srcDir)
  const out = []
  for (let n = 2; n <= totalPages(posts.length); n++) {
    out.push({ params: { page: String(n) }, content: renderCards(pageSlice(posts, n).map(cardFor)) })
  }
  return out
}

// VitePress 的語系判斷沒有錨定開頭（/tags/es/ 會被當成西文頁，主站首頁規格 B.3），分類目錄名、標籤 slug 不分大小寫等於語系代碼就丟錯
const LOCALE_CODES = new Set(LOCALES.map((l) => l.code.toLowerCase()))

export function assertNoLocaleSegments(groups, key) {
  const what = key === 'cat' ? '分類目錄' : '標籤'
  for (const g of groups) {
    const seg = String(g[key === 'cat' ? 'dir' : 'slug'])
    if (LOCALE_CODES.has(seg.toLowerCase())) throw new Error(`${what}「${g.name}」的路徑段 ${seg} 跟語系代碼相同，VitePress 會把它當成外語頁`)
  }
  return groups
}

function groupFirstPages(groups, key) {
  return groups.map((g) => ({ params: { [key]: g[key === 'cat' ? 'dir' : 'slug'], name: g.name }, content: renderCards(pageSlice(g.posts, 1).map(cardFor)) }))
}

function groupLaterPages(groups, key) {
  const out = []
  for (const g of groups) {
    for (let n = 2; n <= totalPages(g.posts.length); n++) {
      out.push({
        params: { [key]: g[key === 'cat' ? 'dir' : 'slug'], page: String(n), name: g.name },
        content: renderCards(pageSlice(g.posts, n).map(cardFor))
      })
    }
  }
  return out
}

// /categories/<dir>/ 與 /categories/<dir>/page/N/（css 的 dir 是 CSS）
export const categoryPaths = (srcDir) => groupFirstPages(assertNoLocaleSegments(siteIndex(srcDir).categories, 'cat'), 'cat')
export const categoryPagePaths = (srcDir) => groupLaterPages(siteIndex(srcDir).categories, 'cat')

// /tags/<slug>/ 與 /tags/<slug>/page/N/
export const tagPaths = (srcDir) => groupFirstPages(assertNoLocaleSegments(siteIndex(srcDir).tags, 'tag'), 'tag')
export const tagPagePaths = (srcDir) => groupLaterPages(siteIndex(srcDir).tags, 'tag')

// /archives/YYYY/：年份裡依月份分組；/archives/YYYY/MM/：只有清單。都不分頁
export function archiveYearPaths(srcDir) {
  return siteIndex(srcDir).years.map((y) => ({ params: { year: y.year }, content: renderArchive([y], { showYears: false }) }))
}

export function archiveMonthPaths(srcDir) {
  const out = []
  for (const y of siteIndex(srcDir).years) {
    for (const m of y.months) {
      out.push({ params: { year: y.year, month: m.month }, content: renderArchive([{ ...y, months: [m] }], { showYears: false, showMonths: false }) })
    }
  }
  return out
}

// 首頁、列表、索引頁的全部網址（未編碼）：動態路由加上 index.md、categories/、tags/、archives/ 這四個固定頁。
// 給測試和 audit 跟基準比對用。
export function listUrls(srcDir) {
  const urls = ['/']
  for (const r of blogIndexPaths(srcDir)) urls.push(`/page/${r.params.page}/`)
  for (const r of categoryPaths(srcDir)) urls.push(`/categories/${r.params.cat}/`)
  for (const r of categoryPagePaths(srcDir)) urls.push(`/categories/${r.params.cat}/page/${r.params.page}/`)
  urls.push('/categories/', '/tags/')
  for (const r of tagPaths(srcDir)) urls.push(`/tags/${r.params.tag}/`)
  for (const r of tagPagePaths(srcDir)) urls.push(`/tags/${r.params.tag}/page/${r.params.page}/`)
  urls.push('/archives/')
  for (const r of archiveYearPaths(srcDir)) urls.push(`/archives/${r.params.year}/`)
  for (const r of archiveMonthPaths(srcDir)) urls.push(`/archives/${r.params.year}/${r.params.month}/`)
  return urls
}
