#!/usr/bin/env node
// 從 Hexo 基準凍結舊頁的 description：front matter 沒寫 description 的文章與 about 頁，
// Hexo 的 open_graph 是拿內文摘要截 200 字當 description 和 og:description。VitePress 不再自動摘要，
// 這些頁照舊用基準裡的值（README 的預期差異），寫進 source/.vitepress/lib/legacy-descriptions.json，由 lib/seo.mjs 讀。
//
// 用法：
//   node scripts/freeze-descriptions.mjs           重寫 legacy-descriptions.json
//   node scripts/freeze-descriptions.mjs --check   只檢查檔案是不是最新，不一致就以代碼 1 結束
//
// 規則：
// - key 是網址路徑，未編碼（跟 frontmatter.url 相同），例 /development/2019/12/01/vscode-chinese/、/about/hexschool-traning。
// - 只收 front matter 沒寫 description 的頁；之後補上 description 的文章重跑這支就會從清單拿掉。
// - 基準找不到的文章（P1 之後的新文章）不凍結，直接失敗：新文章一律自己寫 description。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const BASELINE = 'baseline/hexo-2026-11-03/pages.json'
export const OUTPUT = 'source/.vitepress/lib/legacy-descriptions.json'
const SITE_URL = 'https://www.casper.tw'

// 文章檔名：YYYY-MM-DD-<slug>.md。遷移前的舊文是 .html，一起讀，遷移前後跑結果相同。
const POST_RE = /^(\d{4})-(\d{2})-(\d{2})-(.+)\.(md|html)$/

/** 讀 source/ 底下要凍結的候選頁：[{ url, file, hasDescription }] */
export function collectPages(srcDir) {
  const pages = []
  const postsDir = path.join(srcDir, '_posts')
  for (const file of fs.readdirSync(postsDir).sort()) {
    const m = file.match(POST_RE)
    if (!m) continue
    const { data } = matter(fs.readFileSync(path.join(postsDir, file), 'utf8'))
    if (data.published === false) continue
    const category = String(data.category ?? [data.categories].flat()[0] ?? 'uncategorized')
    pages.push({ url: `/${category}/${m[1]}/${m[2]}/${m[3]}/${m[4]}/`, file: `_posts/${file}`, hasDescription: Boolean(data.description) })
  }
  const aboutDir = path.join(srcDir, 'about')
  for (const file of fs.readdirSync(aboutDir).sort()) {
    if (!file.endsWith('.md')) continue
    const { data } = matter(fs.readFileSync(path.join(aboutDir, file), 'utf8'))
    // about/index.md → /about/；about/hexschool-traning.md → /about/hexschool-traning（canonical 不帶副檔名）
    const url = file === 'index.md' ? '/about/' : `/about/${file.slice(0, -'.md'.length)}`
    pages.push({ url, file: `about/${file}`, hasDescription: Boolean(data.description) })
  }
  return pages
}

/**
 * 基準 pages.json 的 pages 陣列 + 候選頁 → { descriptions, missing }。
 * 用 canonical 對基準：hexschool-traning 的檔案網址是 .html，canonical 才是無副檔名的形式。
 */
export function buildLegacyDescriptions(baselinePages, candidates) {
  const byCanonical = new Map(baselinePages.map((p) => [p.canonical, p]))
  const descriptions = {}
  const missing = []
  for (const c of candidates) {
    if (c.hasDescription) continue
    const b = byCanonical.get(SITE_URL + encodeURI(c.url))
    if (!b || !b.description) {
      missing.push(c)
      continue
    }
    if (b.ogDescription !== b.description) throw new Error(`基準的 description 與 og:description 不同：${c.url}`)
    descriptions[c.url] = b.description
  }
  const sorted = Object.fromEntries(Object.keys(descriptions).sort().map((k) => [k, descriptions[k]]))
  return { descriptions: sorted, missing }
}

export function render(descriptions) {
  return JSON.stringify({ baseline: BASELINE, descriptions }, null, 2) + '\n'
}

function main(argv) {
  const check = argv.includes('--check')
  const baseline = JSON.parse(fs.readFileSync(path.join(root, BASELINE), 'utf8')).pages
  const { descriptions, missing } = buildLegacyDescriptions(baseline, collectPages(path.join(root, 'source')))
  if (missing.length) {
    console.error(`這些頁沒有 front matter description，基準裡也找不到（新頁請自己寫 description）：\n${missing.map((m) => `  ${m.file}  ${m.url}`).join('\n')}`)
    return 1
  }
  const out = render(descriptions)
  const target = path.join(root, OUTPUT)
  if (check) {
    const current = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : ''
    if (current !== out) {
      console.error(`${OUTPUT} 不是最新，請跑 node scripts/freeze-descriptions.mjs`)
      return 1
    }
    console.log(`${OUTPUT} 是最新的（${Object.keys(descriptions).length} 筆）`)
    return 0
  }
  fs.writeFileSync(target, out)
  console.log(`寫入 ${OUTPUT}：${Object.keys(descriptions).length} 筆`)
  return 0
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2))
}
