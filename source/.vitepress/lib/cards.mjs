// 負責：routes 模組（P1 workflow）。介面見 ../README.md。
// 文章卡片的資料（摘要、閱讀時間、封面）與列表頁的 HTML。只在 Node 端執行（config、paths loader），主題不 import。
//
// 規則照 Hexo 的 casper-2026 主題（develop 分支 themes/casper-2026/scripts/card-helpers.js、thumbnail.js）：
// - 摘要 card_excerpt：依序取 description、excerpt（<!-- more --> 之前）、內文；拿掉標籤和 # * ` > - [ ] ! 這幾個字元，
//   空白壓成一格，超過 80 個字元（UTF-16 長度）就截斷並補「…」。
// - 閱讀時間 reading_time：中文每分鐘 350 字、英數單字每分鐘 200 個，四捨五入，至少 1 分鐘。
// - 卡片封面 thumbnail：front matter 的 thumbnail，沒有就用內文第一張圖。
// - 文章頁封面 post_cover：只用 thumbnail，而且要是絕對網址、內文沒有同一張圖。
// Hexo 算摘要和閱讀時間用的是 marked 渲染後的 HTML，markdown-it 重現不了，舊文的值凍結在 legacy-cards.json
// （scripts/freeze-legacy-cards.mjs 從 origin/master 的列表頁抽出）；新文章一律寫 description，閱讀時間由內文算。
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { categoryDir, tagSlug } from './posts.mjs'

export const EXCERPT_LENGTH = 80
export const LEGACY_FILE = fileURLToPath(new URL('./legacy-cards.json', import.meta.url))

let legacyCache = null
export function legacyCards() {
  if (!legacyCache) legacyCache = JSON.parse(fs.readFileSync(LEGACY_FILE, 'utf8'))
  return legacyCache
}

// 凍結值只代表凍結當時的內文；之後實質改寫（front matter 的 updated 晚於凍結日）就改用重算的值。feeds.mjs 也用這條規則
export function frozenFor(post) {
  const data = legacyCards()
  const hit = data.posts[post.url]
  if (!hit) return null
  if (post.updated && post.updated > data.frozenAt) return null
  return hit
}

export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// href 一律寫成跟 canonical 相同的編碼（中文 percent-encode，大小寫照舊）
export function hrefOf(url) {
  return escapeHtml(encodeURI(url))
}

// card-helpers.js 的 card_excerpt，逐字照抄
export function cardExcerpt(raw, len = EXCERPT_LENGTH) {
  const text = String(raw ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/[#*`>\-\[\]!]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length > len) return text.slice(0, len) + '…'
  return text
}

// card-helpers.js 的 reading_time，輸入是 HTML 或純文字
export function readingTimeOf(text) {
  const plain = String(text ?? '').replace(/<[^>]+>/g, ' ')
  const cjk = (plain.match(/[一-鿿]/g) || []).length
  const words = (plain.replace(/[一-鿿]/g, ' ').match(/[a-zA-Z0-9]+/g) || []).length
  return Math.max(1, Math.round(cjk / 350 + words / 200))
}

// Markdown 原始碼轉成接近渲染後文字的樣子：去掉註解、圖片、連結網址，給沒有凍結值的新文章用
export function markdownText(src) {
  return String(src ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' $1 ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, ' $1 ')
}

const MORE_RE = /<!--\s*more\s*-->/

// 第一張圖：Markdown 圖片或 HTML 的 <img>，取先出現的那張（Hexo 的 thumbnail helper 對渲染後的 HTML 找第一個 <img>）
const IMG_RE = /!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)|<img\s[^>]*?\bsrc\s*=\s*['"]?([^\s'">]+)/i
export function firstImage(src) {
  const m = IMG_RE.exec(String(src ?? '').replace(/<!--[\s\S]*?-->/g, ''))
  if (!m) return ''
  return (m[1] ?? m[2]).replace(/&amp;/g, '&')
}

const isAbsolute = (url) => /^https?:\/\//i.test(url)

// 卡片封面：thumbnail，沒有就用內文第一張圖；只收絕對網址（相對網址的舊圖多半已經 404，也會被 Vue 當成模組 import）
export function cardCover(post) {
  const url = post.thumbnail || firstImage(post.content)
  return isAbsolute(url) ? url : null
}

// 文章頁頂部的封面：只用絕對網址的 thumbnail，而且內文沒有同一張圖
export function postCover(post) {
  const url = post.thumbnail || ''
  if (!isAbsolute(url)) return null
  if (String(post.content ?? '').includes(url)) return null
  return url
}

export function excerptOf(post, len = EXCERPT_LENGTH) {
  if (post.description) return cardExcerpt(post.description, len)
  const frozen = frozenFor(post)
  if (frozen?.excerpt != null && len === EXCERPT_LENGTH) return frozen.excerpt
  const parts = String(post.content ?? '').split(MORE_RE)
  return cardExcerpt(markdownText(parts[0]), len)
}

export function readingTimeFor(post) {
  const frozen = frozenFor(post)
  if (frozen?.readingTime != null) return frozen.readingTime
  return readingTimeOf(markdownText(post.content))
}

export function categoryUrl(category) {
  return `/categories/${categoryDir(category)}/`
}

export function tagUrl(name) {
  return `/tags/${tagSlug(name)}/`
}

// README 的卡片欄位：{ title, url, date, category, categoryUrl, excerpt, readingTime, cover }
export function cardFor(post) {
  return {
    title: post.title,
    url: post.url,
    date: post.date,
    category: post.category,
    categoryUrl: categoryUrl(post.category),
    excerpt: excerptOf(post),
    readingTime: readingTimeFor(post),
    cover: cardCover(post)
  }
}

// 2026-10-05 → 2026 年 10 月 05 日（跟 Hexo 的 date(post.date, 'YYYY 年 MM 月 DD 日') 相同）
export function displayDate(date) {
  const [y, m, d] = date.split('-')
  return `${y} 年 ${m} 月 ${d} 日`
}

const asCard = (item) => ('excerpt' in item && 'readingTime' in item ? item : cardFor(item))

// 一張卡。標題是 h2（頁面的 h1 由主題依 frontmatter.heading 輸出），連結都是一般的 <a href>。
export function renderCard(item) {
  const c = asCard(item)
  const href = hrefOf(c.url)
  const cover = c.cover
    ? `<a class="post-card__cover" href="${href}" tabindex="-1" aria-hidden="true"><img src="${escapeHtml(c.cover)}" alt="" loading="lazy" decoding="async"></a>`
    : ''
  return (
    `<article class="post-card">` +
    cover +
    `<h2 class="post-card__title"><a href="${href}">${escapeHtml(c.title)}</a></h2>` +
    `<p class="post-card__meta"><time datetime="${c.date}">${displayDate(c.date)}</time>` +
    `<span class="post-card__sep" aria-hidden="true"> · </span><a href="${hrefOf(c.categoryUrl)}">${escapeHtml(c.category)}</a>` +
    `<span class="post-card__sep" aria-hidden="true"> · </span><span>${c.readingTime} 分鐘閱讀</span></p>` +
    `<p class="post-card__excerpt">${escapeHtml(c.excerpt)}</p>` +
    `</article>`
  )
}

// 列表頁的內容（paths loader 的 content）。
// 整段寫成一行：markdown-it 的 HTML 區塊遇到空行就結束，後面會被當成 Markdown；
// 外層加 v-pre：標題和摘要裡的 {{ }} 不能被 Vue 當成插值。
// 固定頁用 v-html 放進去的 HTML（frontmatter.listHtml）不經過 Vue 編譯，傳 { pre: false } 省掉 v-pre。
const preAttr = (pre) => (pre ? ' v-pre' : '')

export function renderCards(items, { pre = true } = {}) {
  return `<div class="post-list"${preAttr(pre)}>${items.map(renderCard).join('')}</div>`
}

// 封存：依年、月分組的標題清單。groups：[{ year, url, months: [{ month, url, posts }] }]
// /archives/ 與 /archives/YYYY/ 是年份 h2、月份 h3 加清單；/archives/YYYY/MM/ 兩個都關掉，只有清單。
export function renderArchive(groups, { showYears = true, showMonths = true, pre = true } = {}) {
  const row = (p) =>
    `<li class="archive-row"><time class="archive-row__date" datetime="${p.date}">${p.month}/${p.day}</time>` +
    `<a class="archive-row__title" href="${hrefOf(p.url)}">${escapeHtml(p.title)}</a>` +
    `<span class="archive-row__category">${escapeHtml(p.category)}</span></li>`
  const list = (posts) => `<ul class="archive-list__items">${posts.map(row).join('')}</ul>`
  let html = ''
  for (const y of groups) {
    if (showYears) html += `<h2 class="archive-list__year" id="y${y.year}"><a href="${hrefOf(y.url)}">${y.year} 年</a></h2>`
    for (const m of y.months) {
      if (showMonths) html += `<h3 class="archive-list__month" id="m${y.year}-${m.month}"><a href="${hrefOf(m.url)}">${Number(m.month)} 月</a></h3>`
      html += list(m.posts)
    }
  }
  return `<div class="archive-list"${preAttr(pre)}>${html}</div>`
}

// /categories/ 的分類卡：名稱與篇數
export function renderCategoryList(categories, { pre = true } = {}) {
  const items = categories.map(
    (c) =>
      `<li class="category-card"><a class="category-card__link" href="${hrefOf(c.url)}">` +
      `<span class="category-card__name">${escapeHtml(c.name)}</span>` +
      `<span class="category-card__count">${c.posts.length} 篇</span></a></li>`
  )
  return `<ul class="category-list"${preAttr(pre)}>${items.join('')}</ul>`
}

// /tags/ 的標籤雲：依篇數多到少
export function renderTagCloud(tags, { pre = true } = {}) {
  const items = tags.map(
    (t) =>
      `<a class="tag-cloud__item" href="${hrefOf(t.url)}" rel="tag">${escapeHtml(t.name)}` +
      `<span class="tag-cloud__count">${t.posts.length}</span></a>`
  )
  return `<div class="tag-cloud"${preAttr(pre)}>${items.join('')}</div>`
}
