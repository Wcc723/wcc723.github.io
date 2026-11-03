// 建置時用的文章索引：只在 config 和 paths loader 裡用，不被主題 import，
// 文章摘要不會進到每一頁都會載入的 chunk。
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export const SITE_URL = 'https://www.casper.tw'
export const POSTS_DIR = '_posts'

// 檔名：YYYY-MM-DD-<slug>.md。slug 保留大小寫和點。
const FILE_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.md$/

// 分類網址的例外：front matter 的 css 在分類頁輸出成 /categories/CSS/（Hexo 時代的資料夾大小寫，
// GSC 收錄的是大寫版，站長 2026-11-03 決定照舊）。文章網址本身仍是小寫 /css/...。
export const CATEGORY_DIR = { css: 'CSS' }

export function categoryDir(category) {
  return CATEGORY_DIR[category] ?? category
}

// Hexo 的路徑跳脫：空白和點換成 -（標籤 slug 用）。中文保留，大小寫照舊。
export function tagSlug(name) {
  return String(name).replace(/[\s.]+/g, '-')
}

// 網址一律用 encodeURI 的寫法，跟 Hexo 的 canonical 相同（中文 percent-encode，其餘照舊）。
export function postUrl(p) {
  return `/${p.category}/${p.year}/${p.month}/${p.day}/${p.slug}/`
}

export function toAbsolute(url) {
  return SITE_URL + encodeURI(url)
}

function asArray(v) {
  if (v == null || v === '') return []
  return Array.isArray(v) ? v : [v]
}

function dateString(v) {
  if (!v) return null
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const m = String(v).match(/^(\d{4})-(\d{2})-(\d{2})/)
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null
}

let cache = null

// srcDir 是 VitePress 的 source/。回傳依日期新到舊排序的文章（同日依檔名倒序，跟 Hexo 相同）。
export function loadPosts(srcDir, { includeUnpublished = false } = {}) {
  if (!cache || cache.srcDir !== srcDir) {
    const dir = path.join(srcDir, POSTS_DIR)
    const all = []
    for (const file of fs.readdirSync(dir).sort()) {
      const m = file.match(FILE_RE)
      if (!m) continue
      const raw = fs.readFileSync(path.join(dir, file), 'utf8')
      const { data, content } = matter(raw)
      const [, year, month, day, slug] = m
      const category = String(data.category ?? asArray(data.categories)[0] ?? 'uncategorized')
      const p = {
        file,
        src: `${POSTS_DIR}/${file}`,
        year,
        month,
        day,
        date: `${year}-${month}-${day}`,
        slug,
        category,
        title: String(data.title ?? slug),
        description: data.description ? String(data.description) : '',
        tags: asArray(data.tags).map(String),
        updated: dateString(data.updated),
        published: data.published !== false,
        thumbnail: data.thumbnail ? String(data.thumbnail) : '',
        photo: data.photo ? String(data.photo) : '',
        cssdemo: asArray(data.cssdemo).filter(Boolean).map(String),
        ads: data.ads !== false,
        content
      }
      p.url = postUrl(p)
      p.out = `${category}/${year}/${month}/${day}/${slug}/index.md`
      all.push(p)
    }
    all.sort((a, b) => (a.date === b.date ? (a.file < b.file ? 1 : -1) : a.date < b.date ? 1 : -1))
    cache = { srcDir, all }
  }
  return includeUnpublished ? cache.all : cache.all.filter((p) => p.published)
}

export function unpublishedFiles(srcDir) {
  return loadPosts(srcDir, { includeUnpublished: true })
    .filter((p) => !p.published)
    .map((p) => p.src)
}

// VitePress rewrites：_posts/<檔名>.md → <category>/<YYYY>/<MM>/<DD>/<slug>/index.md
export function postRewrites(srcDir) {
  const map = {}
  for (const p of loadPosts(srcDir)) map[p.src] = p.out
  return map
}
