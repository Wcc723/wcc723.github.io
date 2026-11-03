import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildLegacyDescriptions, collectPages, render, BASELINE, OUTPUT } from './freeze-descriptions.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('只收沒寫 description 的頁，用 canonical 對基準，key 是未編碼的網址', () => {
  const pages = [
    { url: '/a/', canonical: 'https://www.casper.tw/a/', description: '舊 A', ogDescription: '舊 A' },
    { url: '/b/', canonical: 'https://www.casper.tw/b/', description: '舊 B', ogDescription: '舊 B' },
    { url: '/about/hexschool-traning.html', canonical: 'https://www.casper.tw/about/hexschool-traning', description: '舊 H', ogDescription: '舊 H' },
    { url: '/tags/%E8%B3%87%E5%AE%89/', canonical: 'https://www.casper.tw/tags/%E8%B3%87%E5%AE%89/', description: '中文', ogDescription: '中文' },
  ]
  const { descriptions, missing } = buildLegacyDescriptions(pages, [
    { url: '/b/', hasDescription: false },
    { url: '/a/', hasDescription: true },
    { url: '/about/hexschool-traning', hasDescription: false },
    { url: '/tags/資安/', hasDescription: false },
    { url: '/new/', hasDescription: false },
  ])
  assert.deepEqual(descriptions, { '/about/hexschool-traning': '舊 H', '/b/': '舊 B', '/tags/資安/': '中文' })
  assert.deepEqual(Object.keys(descriptions), ['/about/hexschool-traning', '/b/', '/tags/資安/'])
  assert.deepEqual(missing.map((m) => m.url), ['/new/'])
})

test('基準的 description 與 og:description 不同就停下來', () => {
  const pages = [{ canonical: 'https://www.casper.tw/a/', description: 'x', ogDescription: 'y' }]
  assert.throws(() => buildLegacyDescriptions(pages, [{ url: '/a/', hasDescription: false }]), /og:description/)
})

test('legacy-descriptions.json 跟目前的 source/ 與基準一致（等同 --check）', () => {
  const baseline = JSON.parse(fs.readFileSync(path.join(root, BASELINE), 'utf8')).pages
  const candidates = collectPages(path.join(root, 'source'))
  const { descriptions, missing } = buildLegacyDescriptions(baseline, candidates)
  assert.deepEqual(missing, [])
  assert.equal(fs.readFileSync(path.join(root, OUTPUT), 'utf8'), render(descriptions))
  // 文章與 about 頁：要嘛 front matter 有 description，要嘛在凍結清單裡
  for (const c of candidates) assert.ok(c.hasDescription || descriptions[c.url], c.url)
  assert.ok(descriptions['/about/'] && descriptions['/about/hexschool-traning'])
})
