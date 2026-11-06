// 負責：routes 模組（P1 workflow）。介面見 ../README.md。
// buildEnd 產生的 atom.xml、content.json，以及 sitemap 的 transformItems。只在 Node 端執行（config.mts）。
//
// 格式照 Hexo 的產物（baseline/hexo-2026-11-03/ 的 atom.xml、content.json、sitemap.xml）：
// - atom.xml：hexo-generator-feed，最新 20 篇。<id>、<link> 是含尾斜線的完整文章網址，<published> 是檔名日期的台北 00:00，
//   這三個逐字照舊，閱讀器才不會把舊文章當成新的。<updated> 改用 front matter 的 updated，沒有就等於發布日
//   （Hexo 用的是作者電腦上的檔案時間）。summary：有 description 就是 description；沒有的舊文用凍結的 Hexo 摘要。
// - content.json：hexo-generator-json-content，欄位 title、date、path、categories、tags，給 ⌘K 搜尋。
// - sitemap：網址集合 = 基準減掉 3 個大寫標籤、/categories/css/ 換成 /categories/CSS/，再加上新頁；
//   不列 /page/、/archives/、分頁、404 與 noindex 頁。lastmod 只寫在文章（updated 或檔名日期）和有寫 updated 的單頁，列表頁不寫。
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { SITE_URL, tagSlug, toAbsolute } from './posts.mjs'
import { SITE_TITLE_LEGACY } from '../theme/shared/shell/site.mjs'
import { LOCALES } from '../theme/shared/shell/i18n/locales.mjs'
import { siteIndex, orderedTags } from './pagedata.mjs'
import { SITE_INDEX } from './site-home.mjs'
import { cardExcerpt, categoryUrl, escapeHtml, frozenFor, markdownText, tagUrl } from './cards.mjs'

export const FEED_LIMIT = 20
export const FEED_AUTHOR = 'Wang Casper' // Hexo 的 config.author
export const SUMMARY_LIMIT = 140 // hexo-generator-feed 的 content_limit

// YYYY-MM-DD → 台北當地 00:00 的 UTC ISO（Hexo 的寫法），例 2026-10-05 → 2026-10-04T16:00:00.000Z
export function taipeiIso(date) {
  return new Date(`${date}T00:00:00+08:00`).toISOString()
}

const modified = (p) => p.updated || p.date

function cdata(html) {
  return `<![CDATA[${String(html).replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}

function summaryXml(p) {
  if (p.description) return `    <summary>${escapeHtml(p.description)}</summary>\n`
  const frozen = frozenFor(p)?.atomSummary
  if (frozen != null) return `    <summary>\n      ${cdata(frozen)}\n    </summary>\n`
  // 新文章一律寫 description；萬一沒寫，用內文前 140 字的純文字
  return `    <summary>${escapeHtml(cardExcerpt(markdownText(p.content), SUMMARY_LIMIT))}</summary>\n`
}

export function atomXml(srcDir) {
  const index = siteIndex(srcDir)
  const posts = index.posts.slice(0, FEED_LIMIT)
  const latest = posts.map(modified).sort().at(-1) ?? '1970-01-01'
  let xml =
    `<?xml version="1.0" encoding="utf-8"?>\n` +
    `<feed xmlns="http://www.w3.org/2005/Atom">\n` +
    `  <author>\n    <name>${FEED_AUTHOR}</name>\n  </author>\n` +
    `  <generator uri="https://vitepress.dev/">VitePress</generator>\n` +
    `  <id>${SITE_URL}/</id>\n` +
    `  <link href="${SITE_URL}/" rel="alternate"/>\n` +
    `  <link href="${SITE_URL}/atom.xml" rel="self"/>\n` +
    `  <rights>All rights reserved ${latest.slice(0, 4)}, ${FEED_AUTHOR}</rights>\n` +
    `  <title>${escapeHtml(SITE_TITLE_LEGACY)}</title>\n` +
    `  <updated>${taipeiIso(latest)}</updated>\n`
  for (const p of posts) {
    const url = toAbsolute(p.url)
    xml += `  <entry>\n    <author>\n      <name>${FEED_AUTHOR}</name>\n    </author>\n`
    xml += `    <category term="${escapeHtml(p.category)}" scheme="${toAbsolute(categoryUrl(p.category))}"/>\n`
    for (const t of orderedTags(p, index)) xml += `    <category term="${escapeHtml(t)}" scheme="${toAbsolute(tagUrl(t))}"/>\n`
    xml +=
      `    <id>${url}</id>\n` +
      `    <link href="${url}"/>\n` +
      `    <published>${taipeiIso(p.date)}</published>\n` +
      summaryXml(p) +
      `    <title>${escapeHtml(p.title)}</title>\n` +
      `    <updated>${taipeiIso(modified(p))}</updated>\n` +
      `  </entry>\n`
  }
  return xml + `</feed>\n`
}

// hexo-generator-json-content 的格式。css 分類的 permalink 照新的 canonical 寫成 /categories/CSS/
export function contentJson(srcDir) {
  const index = siteIndex(srcDir)
  const entries = index.posts.map((p) => ({
    title: p.title,
    date: taipeiIso(p.date),
    path: p.url.slice(1),
    categories: [{ name: p.category, slug: p.category, permalink: toAbsolute(categoryUrl(p.category)) }],
    tags: orderedTags(p, index).map((name) => ({ name, slug: tagSlug(name), permalink: toAbsolute(tagUrl(name)) }))
  }))
  return JSON.stringify(entries)
}

// config.mts 的 buildEnd：寫進 dist/
/**
 * /sitemap-index.xml（P3，計畫網站地圖、docs/runbooks/add-a-tool.md 第 7 步）：部落格的 /sitemap.xml，加上 tools.json 每支工具的
 * /<slug>/sitemap.xml（每支工具都輸出自己的 sitemap，add-a-tool.md）。robots.txt 多一行 Sitemap 指向這裡，GSC 只要提交一次。
 * 工具清單是 0 支時照樣輸出（只有部落格那一份）。
 */
export function sitemapIndexXml(index = SITE_INDEX) {
  const tools = Array.isArray(index?.tools) ? index.tools : []
  const urls = [`${SITE_URL}/sitemap.xml`, ...tools.map((t) => {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(t?.slug ?? '')) throw new Error(`sitemap-index：tools.json 的 slug 不對：${JSON.stringify(t?.slug)}`)
    return `${SITE_URL}/${t.slug}/sitemap.xml`
  })]
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) => `  <sitemap><loc>${escapeHtml(u)}</loc></sitemap>`),
    '</sitemapindex>',
    '',
  ].join('\n')
}

export async function buildFeeds(siteConfig, srcDir) {
  const outDir = siteConfig.outDir
  fs.writeFileSync(path.join(outDir, 'atom.xml'), atomXml(srcDir))
  fs.writeFileSync(path.join(outDir, 'content.json'), contentJson(srcDir))
  fs.writeFileSync(path.join(outDir, 'sitemap-index.xml'), sitemapIndexXml())
}

// ---------------------------------------------------------------------------
// sitemap
// ---------------------------------------------------------------------------

// 不進 sitemap 的網址：404、首頁分頁與列表分頁（/page/N/）、封存
const EXCLUDE_RE = [/^\/404(\.html)?$/, /(^|\/)page\/\d+\/$/, /^\/archives\//]

function frontmatterOf(file) {
  try {
    return matter(fs.readFileSync(file, 'utf8')).data
  } catch {
    return null
  }
}

// front matter 寫 noindex: true、robots 含 noindex，或 head 裡有 robots noindex 的 meta
export function isNoindex(fm) {
  if (!fm) return false
  if (fm.noindex === true) return true
  if (typeof fm.robots === 'string' && /noindex/i.test(fm.robots)) return true
  return (fm.head ?? []).some(
    (h) => Array.isArray(h) && h[0] === 'meta' && /^robots$/i.test(h[1]?.name ?? '') && /noindex/i.test(h[1]?.content ?? '')
  )
}

// 網址對應的原始檔（只有固定頁；動態路由沒有自己的檔，回傳 null）
function sourceFileOf(srcDir, url, index) {
  const post = index.byUrl.get(url)
  if (post) return path.join(srcDir, post.src)
  const rel = url === '/' ? 'index.md' : url.endsWith('/') ? `${url.slice(1)}index.md` : `${url.slice(1)}.md`
  const file = path.join(srcDir, rel)
  return fs.existsSync(file) ? file : null
}

const dateOnly = (v) => {
  if (!v) return null
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const m = String(v).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` : null
}

// VitePress 的 item.url 是相對路徑（例 development/2022/01/10/install-nvm/，首頁是空字串），
// 由 sitemap 套件用 new URL(url, hostname) 補成完整網址並 percent-encode，結果跟 toAbsolute() 相同。
// 外語首頁 /<code>/（主站首頁規格 D.8）：首頁沒有可信的更新日，不輸出 lastmod
const SITE_HOME_URL_RE = new RegExp(`^/(${LOCALES.map((l) => l.code).filter((c) => c !== 'zh-tw').join('|')})/$`)

export function sitemapTransformItems(srcDir) {
  return (items) => {
    const index = siteIndex(srcDir)
    const out = []
    for (const item of items) {
      const url = '/' + String(item.url).replace(/^\//, '')
      if (EXCLUDE_RE.some((re) => re.test(url))) continue
      const file = sourceFileOf(srcDir, url, index)
      const fm = file ? frontmatterOf(file) : null
      if (isNoindex(fm)) continue
      const post = index.byUrl.get(url)
      const lastmod = SITE_HOME_URL_RE.test(url) ? null : post ? modified(post) : dateOnly(fm?.updated)
      // links：VitePress 設了 locales 就替每筆加 xhtml:link；hreflang 只放 HTML head 一種方法（D.8），一律拿掉
      const { lastmod: _drop, links: _links, ...rest } = item
      out.push(lastmod ? { ...rest, lastmod } : rest)
    }
    // 順序：首頁、文章（新到舊）、其他頁依網址排序
    const rank = (it) => {
      const url = '/' + String(it.url).replace(/^\//, '')
      if (url === '/') return -1
      return index.position.has(url) ? index.position.get(url) : Infinity
    }
    return out.sort((a, b) => rank(a) - rank(b) || (a.url < b.url ? -1 : a.url > b.url ? 1 : 0))
  }
}
