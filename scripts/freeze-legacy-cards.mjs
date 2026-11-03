#!/usr/bin/env node
// 從 Hexo 最後一版產物（origin/master）凍結文章卡片的摘要與閱讀時間，以及 atom.xml 裡沒有 description 的文章摘要，
// 寫成 source/.vitepress/lib/legacy-cards.json，給 lib/cards.mjs、lib/feeds.mjs 用。
//
// 為什麼要凍結：Hexo 的卡片摘要（card-helpers.js 的 card_excerpt）在沒有 description 時取 marked 渲染後的 HTML，
// 閱讀時間（reading_time）也是數渲染後 HTML 的字，裡面有 hljs 的跳脫字元、smartypants 的引號、breaks 的換行。
// 用 markdown-it 重算，摘要 348 篇只有 303 篇相同、閱讀時間 364 篇只有 302 篇相同（2026-11-03 實測），
// 所以舊文的這兩個值直接從產物抽出來。新文章一律寫 description，摘要由 description 算；閱讀時間由內文算。
//
// 用法：node scripts/freeze-legacy-cards.mjs [--ref origin/master] [--check]
// --check 只比對、不寫檔，結果不同時以非 0 結束。
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const OUT_FILE = path.join(root, 'source/.vitepress/lib/legacy-cards.json')
const BASELINE_ATOM = path.join(root, 'baseline/hexo-2026-11-03/atom.xml')
const POSTS_DIR = path.join(root, 'source/_posts')
export const FROZEN_AT = '2026-11-03'

const LIST_PAGE_RE = /^(index\.html|page\/\d+\/index\.html|categories\/.+\/index\.html|tags\/.+\/index\.html)$/

// 解開 HTML 實體（Hexo 的 EJS 只會跳脫 & < > " '，這裡多解數字實體以防萬一）
export function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
}

// casper-2026 主題 article-card.ejs 的卡片：網址、摘要（<p class="excerpt">）、閱讀時間（topline 的「N 分鐘」）
export function parseListCards(html) {
  const cards = []
  for (const m of html.matchAll(/<article class="card[^"]*">([\s\S]*?)<\/article>/g)) {
    const a = m[1]
    const href = a.match(/<h2><a href="([^"]+)">/)
    const excerpt = a.match(/<p class="excerpt">([\s\S]*?)<\/p>/)
    const minutes = a.match(/<span>(\d+) 分鐘<\/span>/)
    if (!href || !excerpt || !minutes) throw new Error(`卡片格式不認得：${a.slice(0, 200)}`)
    cards.push({ url: decodeURI(decodeEntities(href[1])), excerpt: decodeEntities(excerpt[1]), readingTime: Number(minutes[1]) })
  }
  return cards
}

// hexo-generator-feed 的 atom.xml：每個 entry 的網址，以及 <summary> 是 CDATA（沒有 description 的文章）時的 HTML
export function parseAtomSummaries(xml) {
  const out = {}
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1]
    const id = e.match(/<id>([^<]+)<\/id>/)[1]
    const cdata = e.match(/<summary>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/summary>/)
    if (cdata) out[decodeURI(new URL(id).pathname)] = cdata[1]
  }
  return out
}

// 原始碼裡有 front matter description 的文章網址（.md 和還沒轉檔的 .html 都讀）
export function postsWithDescription(dir = POSTS_DIR) {
  const set = new Set()
  for (const file of fs.readdirSync(dir)) {
    const m = file.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|html)$/)
    if (!m) continue
    const { data } = matter(fs.readFileSync(path.join(dir, file), 'utf8'))
    const category = String(data.category ?? [].concat(data.categories ?? [])[0] ?? 'uncategorized')
    if (data.description) set.add(`/${category}/${m[1]}/${m[2]}/${m[3]}/${m[4]}/`)
  }
  return set
}

export function buildLegacy({ listPages, atomXml, described }) {
  const posts = {}
  for (const [file, html] of Object.entries(listPages)) {
    for (const c of parseListCards(html)) {
      const prev = posts[c.url]
      const entry = { readingTime: c.readingTime }
      if (!described.has(c.url)) entry.excerpt = c.excerpt
      if (prev && JSON.stringify(prev) !== JSON.stringify(entry)) {
        throw new Error(`同一篇文章在不同列表頁的卡片不同：${c.url}（${file}）`)
      }
      posts[c.url] = entry
    }
  }
  for (const [url, summary] of Object.entries(parseAtomSummaries(atomXml))) {
    if (!posts[url]) throw new Error(`atom.xml 的文章不在列表頁裡：${url}`)
    if (!described.has(url)) posts[url].atomSummary = summary
  }
  const sorted = {}
  for (const url of Object.keys(posts).sort()) sorted[url] = posts[url]
  return {
    note: '由 scripts/freeze-legacy-cards.mjs 產生，請勿手改。excerpt 只收沒有 description 的文章；文章在 frozenAt 之後加了 updated 就改用重算的值。',
    frozenAt: FROZEN_AT,
    posts: sorted
  }
}

function git(args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 })
}

export function readListPages(ref) {
  const files = git(['ls-tree', '-r', '-z', '--name-only', ref]).split('\0').filter((f) => LIST_PAGE_RE.test(f))
  const pages = {}
  for (const f of files) pages[f] = git(['show', `${ref}:${f}`])
  return pages
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const ref = args.includes('--ref') ? args[args.indexOf('--ref') + 1] : 'origin/master'
  const listPages = readListPages(ref)
  const data = buildLegacy({ listPages, atomXml: fs.readFileSync(BASELINE_ATOM, 'utf8'), described: postsWithDescription() })
  const json = JSON.stringify(data, null, 1) + '\n'
  const n = Object.keys(data.posts).length
  const ex = Object.values(data.posts).filter((p) => 'excerpt' in p).length
  const at = Object.values(data.posts).filter((p) => 'atomSummary' in p).length
  console.log(`列表頁 ${Object.keys(listPages).length} 頁；文章 ${n} 篇，凍結摘要 ${ex} 篇，atom 摘要 ${at} 篇`)
  if (args.includes('--check')) {
    const same = fs.existsSync(OUT_FILE) && fs.readFileSync(OUT_FILE, 'utf8') === json
    console.log(same ? 'legacy-cards.json 與產物一致' : 'legacy-cards.json 與產物不同')
    process.exit(same ? 0 : 1)
  }
  fs.writeFileSync(OUT_FILE, json)
  console.log(`寫入 ${path.relative(root, OUT_FILE)}`)
}
