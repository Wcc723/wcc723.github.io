import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { atomXml, buildFeeds, contentJson, isNoindex, sitemapTransformItems, taipeiIso } from './feeds.mjs'
import { listUrls, siteIndex } from './pagedata.mjs'
import { SITE_URL } from './posts.mjs'
import { SOURCE_DIR, readBaseline } from './test-fixture.mjs'

const srcDir = SOURCE_DIR
const index = siteIndex(srcDir)

// README 的預期差異：只差大小寫的標籤合併成小寫；css 分類的網址改成大寫
const MERGED = new Set(['Sass', 'Bootstrap', 'Vue'])
// Hexo 資料庫的標籤順序有 2 篇重現不了（2026-07-09 改過 front matter 後重建的順序），其餘 362 篇相同
test('taipeiIso：檔名日期是台北 00:00', () => {
  assert.equal(taipeiIso('2026-10-05'), '2026-10-04T16:00:00.000Z')
})

test('atom.xml：跟基準逐行比對，只差 generator、<updated> 和合併成小寫的 Vue 標籤', () => {
  const ours = atomXml(srcDir).split('\n')
  const base = readBaseline('atom.xml').split('\n')
  assert.equal(ours.length, base.length)
  const diffs = []
  for (let i = 0; i < base.length; i++) {
    if (ours[i] === base[i]) continue
    if (/<generator /.test(base[i]) && ours[i] === '  <generator uri="https://vitepress.dev/">VitePress</generator>') continue
    if (/<updated>/.test(base[i]) && /^\s*<updated>\d{4}-\d{2}-\d{2}T16:00:00\.000Z<\/updated>$/.test(ours[i])) continue
    if (ours[i] === base[i].replace(/"(Sass|Bootstrap|Vue)"/, (_, t) => `"${t.toLowerCase()}"`).replace(/\/tags\/(Sass|Bootstrap|Vue)\//, (_, t) => `/tags/${t.toLowerCase()}/`)) continue
    diffs.push(`${i + 1}：\n- ${base[i]}\n+ ${ours[i]}`)
  }
  assert.deepEqual(diffs, [])
})

test('atom.xml：20 筆的 <id>、<link>、<published> 跟基準逐字相同；<updated> 是 updated 或發布日', () => {
  const pick = (xml, tag) => [...xml.matchAll(new RegExp(`    <${tag}[^>]*?>?([^<]*)(?:</${tag}>)?`, 'g'))].map((m) => m[0])
  const ours = atomXml(srcDir)
  const base = readBaseline('atom.xml')
  assert.equal((ours.match(/<entry>/g) ?? []).length, 20)
  for (const tag of ['id', 'link', 'published', 'title']) assert.deepEqual(pick(ours, tag), pick(base, tag), tag)
  const nvm = ours.match(/<id>https:\/\/www\.casper\.tw\/development\/2022\/01\/10\/install-nvm\/<\/id>[\s\S]*?<updated>([^<]+)<\/updated>/)[1]
  assert.equal(nvm, '2026-07-08T16:00:00.000Z') // updated: 2026-07-09
  const top = ours.match(/<updated>([^<]+)<\/updated>/)[1]
  assert.equal(top, taipeiIso(index.posts.slice(0, 20).map((p) => p.updated || p.date).sort().at(-1)))
})

test('content.json：364 筆、欄位與順序相同（含標籤順序），差異只有 css 分類網址與合併成小寫的標籤名稱', () => {
  const ours = JSON.parse(contentJson(srcDir))
  const base = JSON.parse(readBaseline('content.json'))
  assert.equal(ours.length, 364)
  const counts = { cssPermalink: 0, mergedTags: 0 }
  const diffs = []
  for (let i = 0; i < base.length; i++) {
    const a = ours[i]
    const b = base[i]
    assert.deepEqual(Object.keys(a), Object.keys(b))
    for (const k of ['title', 'date', 'path']) if (a[k] !== b[k]) diffs.push(`${b.path} ${k}`)
    const bc = b.categories.map((c) => (c.name === 'css' ? { ...c, permalink: `${SITE_URL}/categories/CSS/` } : c))
    if (JSON.stringify(a.categories) !== JSON.stringify(b.categories)) counts.cssPermalink++
    if (JSON.stringify(a.categories) !== JSON.stringify(bc)) diffs.push(`${b.path} categories`)
    const lower = (t) => (MERGED.has(t.name) ? { name: t.name.toLowerCase(), slug: t.slug.toLowerCase(), permalink: t.permalink.replace(/\/tags\/\w+\/$/, (s) => s.toLowerCase()) } : t)
    const bt = b.tags.map(lower)
    const key = (t) => JSON.stringify(t)
    if (JSON.stringify(a.tags.map(key).sort()) !== JSON.stringify(bt.map(key).sort())) diffs.push(`${b.path} tags`)
    else if (JSON.stringify(a.tags) !== JSON.stringify(bt)) diffs.push(`${b.path} tag order`)
    else if (b.tags.some((t) => MERGED.has(t.name))) counts.mergedTags++
  }
  assert.deepEqual(diffs, [])
  assert.deepEqual(counts, { cssPermalink: 98, mergedTags: 17 })
})

// VitePress 的 sitemap item：siteConfig.pages 經 rewrites 後去掉 index.md 與 .md（cleanUrls），首頁是空字串
function vitepressItems() {
  const pages = [...listUrls(srcDir), ...index.posts.map((p) => p.url), '/about/', '/about/hexschool-traning', '/privacy/', '/contact/', '/terms/', '/404']
  return pages.map((u) => ({ url: u.slice(1), lastmod: undefined }))
}

test('sitemap：網址集合 = 基準減 3 個大寫標籤、css 換成 CSS，再加 /categories/、/privacy/、/contact/、/terms/', () => {
  const items = sitemapTransformItems(srcDir)(vitepressItems())
  const ours = items.map((it) => new URL(it.url, SITE_URL).toString())
  assert.equal(new Set(ours).size, ours.length, '沒有重複')
  const base = [...readBaseline('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  const upper = ['/tags/Sass/', '/tags/Bootstrap/', '/tags/Vue/'].map((u) => SITE_URL + u)
  const expected = new Set(base.filter((u) => !upper.includes(u)).map((u) => (u === `${SITE_URL}/categories/css/` ? `${SITE_URL}/categories/CSS/` : u)))
  for (const u of ['/categories/', '/privacy/', '/contact/', '/terms/']) expected.add(SITE_URL + u)
  assert.equal(expected.size, 469)
  assert.deepEqual([...ours].sort(), [...expected].sort())
  // 網址格式跟 canonical（toAbsolute）一致：中文 percent-encode
  assert.ok(ours.includes(`${SITE_URL}/tags/%E8%B3%87%E5%AE%89/`))
  assert.ok(ours.includes(`${SITE_URL}/about/hexschool-traning`))
})

test('sitemap：lastmod 文章用 updated 或檔名日期，列表頁不寫；首頁排第一、文章新到舊', () => {
  const items = sitemapTransformItems(srcDir)(vitepressItems())
  const by = new Map(items.map((it) => [it.url, it]))
  assert.equal(items[0].url, '')
  assert.equal(items[1].url, index.posts[0].url.slice(1))
  assert.equal(by.get('development/2022/01/10/install-nvm/').lastmod, '2026-07-09')
  assert.equal(by.get('development/2026/10/05/security-habits/').lastmod, '2026-10-05')
  for (const u of ['', 'categories/', 'categories/CSS/', 'tags/', 'tags/css/']) assert.ok(!('lastmod' in by.get(u)), u)
  for (const p of index.posts) assert.equal(by.get(p.url.slice(1)).lastmod, p.updated || p.date)
})

test('sitemap：noindex 的頁不列', () => {
  assert.equal(isNoindex({ noindex: true }), true)
  assert.equal(isNoindex({ robots: 'noindex, follow' }), true)
  assert.equal(isNoindex({ head: [['meta', { name: 'robots', content: 'noindex' }]] }), true)
  assert.equal(isNoindex({ head: [['meta', { name: 'description', content: 'noindex' }]] }), false)
  assert.equal(isNoindex(null), false)
})

test('buildFeeds：寫進 outDir 的 atom.xml 與 content.json', async () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'casper-feeds-'))
  try {
    await buildFeeds({ outDir }, srcDir)
    assert.equal(fs.readFileSync(path.join(outDir, 'atom.xml'), 'utf8'), atomXml(srcDir))
    assert.equal(JSON.parse(fs.readFileSync(path.join(outDir, 'content.json'), 'utf8')).length, 364)
  } finally {
    fs.rmSync(outDir, { recursive: true, force: true })
  }
})

test('sitemap：外語首頁沒有 lastmod，VitePress 加的 xhtml:link（links）一律拿掉，/404 不列（主站首頁規格 D.8）', () => {
  const links = [{ lang: 'en', url: 'en/' }, { lang: 'ja', url: 'ja/' }]
  const items = sitemapTransformItems(srcDir)([
    { url: '', links },
    { url: 'en/', lastmod: '2026-11-04', links },
    { url: 'ja/', lastmod: '2026-11-04', links },
    { url: 'development/2022/01/10/install-nvm/', links },
    { url: '404', links },
    { url: '404.html' },
  ])
  assert.deepEqual(items.map((it) => it.url), ['', 'development/2022/01/10/install-nvm/', 'en/', 'ja/'])
  for (const it of items) assert.ok(!('links' in it), it.url)
  assert.deepEqual(items.filter((it) => /^(en|ja)\/$/.test(it.url)), [{ url: 'en/' }, { url: 'ja/' }])
  assert.equal(items[1].lastmod, '2026-07-09')
})

test('atom.xml 與 content.json 只有文章，不收外語首頁', () => {
  const atom = atomXml(srcDir)
  const content = JSON.stringify(contentJson(srcDir))
  for (const code of ['en', 'zh-cn', 'ja', 'ko', 'de', 'es']) {
    const u = `${SITE_URL}/${code}/`
    assert.ok(!atom.includes(`"${u}"`) && !atom.includes(`>${u}<`), code)
    assert.ok(!content.includes(`"${u}"`) && !content.includes(`"/${code}/"`), code)
  }
})
