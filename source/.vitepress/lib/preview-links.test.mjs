import { test } from 'node:test'
import assert from 'node:assert/strict'
import vm from 'node:vm'
import { PREVIEW_LINKS_MARKER, previewHead, previewLinkScript, toolSlugs } from './preview-links.mjs'

const INDEX = { siteHomes: [], tools: [{ slug: 'sound-effects' }, { slug: 'lucky-draw' }] }

test('previewHead：只有 preview 有腳本，正式建置是空陣列', () => {
  assert.deepEqual(previewHead({ stage: 'live' }), [])
  assert.deepEqual(previewHead({ stage: 'live' }, INDEX), [])
  assert.deepEqual(previewHead(undefined), [])
  // 正式建置不讀 tools.json：格式不對的 slug 也不會讓 live 建置失敗
  assert.deepEqual(previewHead({ stage: 'live' }, { tools: [{ slug: '' }] }), [])
  const head = previewHead({ stage: 'preview' }, INDEX)
  assert.equal(head.length, 1)
  assert.equal(head[0][0], 'script')
  assert.equal(head[0][2], previewLinkScript('https://www.casper.tw', ['sound-effects', 'lucky-draw']))
})

test('previewLinkScript：開頭是固定記號 /*!cs-preview-links*/，audit 靠它認出這段腳本', () => {
  assert.equal(PREVIEW_LINKS_MARKER, '/*!cs-preview-links*/')
  assert.ok(previewLinkScript().startsWith(PREVIEW_LINKS_MARKER))
  assert.ok(previewHead({ stage: 'preview' }, INDEX)[0][2].startsWith(PREVIEW_LINKS_MARKER))
  // 記號只在開頭出現一次
  assert.equal(previewLinkScript('https://www.casper.tw', ['sound-effects']).split(PREVIEW_LINKS_MARKER).length, 2)
})

test('previewLinkScript：經過 VitePress 對 head 腳本的 esbuild 壓縮，記號還在開頭，工具 slug 也還在', async () => {
  // VitePress 1.6.4 的 renderHead：transformWithEsbuild(innerHTML, 'inline-script.js', { minify: true })
  const { transformWithEsbuild } = await import('vite')
  const out = (await transformWithEsbuild(previewHead({ stage: 'preview' }, INDEX)[0][2], 'inline-script.js', { minify: true })).code.trim()
  assert.ok(out.startsWith(PREVIEW_LINKS_MARKER), out.slice(0, 60))
  assert.match(out, /\["sound-effects","lucky-draw"\]/)
})

test('toolSlugs：取 tools.json 每支工具的 slug，格式不對就丟錯', () => {
  assert.deepEqual(toolSlugs(INDEX), ['sound-effects', 'lucky-draw'])
  assert.deepEqual(toolSlugs({ tools: [] }), [])
  assert.deepEqual(toolSlugs({}), [])
  assert.throws(() => toolSlugs({ tools: [{ slug: '' }] }), /slug/)
  assert.throws(() => toolSlugs({ tools: [{}] }), /slug/)
  assert.throws(() => toolSlugs({ tools: [{ slug: '</script>' }] }), /slug/)
  assert.throws(() => previewLinkScript('https://www.casper.tw', ['a/b']), /slug/)
})

function run(hostname, origin, href, extra = {}) {
  let listener = null
  const loc = { hostname, origin, href: origin + '/en/' }
  const ctx = {
    location: loc,
    Element: class {},
    document: { addEventListener: (type, fn, capture) => { assert.equal(type, 'click'); assert.equal(capture, true); listener = fn } }
  }
  vm.runInNewContext(previewLinkScript('https://www.casper.tw', extra.slugs ?? []), ctx)
  if (!listener) return { listener: false, href: loc.href }
  const a = { target: extra.target ?? '', getAttribute: () => href }
  const el = Object.assign(new ctx.Element(), { closest: () => a })
  const ev = { defaultPrevented: false, button: 0, metaKey: !!extra.metaKey, ctrlKey: false, shiftKey: false, altKey: false, target: el, prevented: false, preventDefault() { this.prevented = true }, stopImmediatePropagation() {} }
  listener(ev)
  return { listener: true, href: loc.href, prevented: ev.prevented }
}

test('previewLinkScript：localhost 上把 www.casper.tw 連結換成同一路徑', () => {
  const r = run('localhost', 'http://localhost:4184', 'https://www.casper.tw/ko/')
  assert.equal(r.prevented, true)
  assert.equal(r.href, 'http://localhost:4184/ko/')
  assert.equal(run('localhost', 'http://localhost:4184', 'https://www.casper.tw/#tools').href, 'http://localhost:4184/#tools')
})

test('previewLinkScript：工具的網址不攔（線上由工具的 Worker 提供，preview 沒有這些頁）', () => {
  const slugs = ['sound-effects', 'lucky-draw']
  for (const href of [
    'https://www.casper.tw/sound-effects/',
    'https://www.casper.tw/sound-effects/zh-tw/',
    'https://www.casper.tw/sound-effects',
    'https://www.casper.tw/sound-effects?q=cat',
    'https://www.casper.tw/lucky-draw/ja/'
  ]) {
    const r = run('localhost', 'http://localhost:4184', href, { slugs })
    assert.equal(r.prevented, false, href)
    assert.equal(r.href, 'http://localhost:4184/en/', href)
  }
  // 部落格自己的頁照樣留在 localhost
  assert.equal(run('localhost', 'http://localhost:4184', 'https://www.casper.tw/en/', { slugs }).href, 'http://localhost:4184/en/')
  assert.equal(run('localhost', 'http://localhost:4184', 'https://www.casper.tw/#tools', { slugs }).href, 'http://localhost:4184/#tools')
  assert.equal(run('localhost', 'http://localhost:4184', 'https://www.casper.tw/about/', { slugs }).href, 'http://localhost:4184/about/')
  assert.equal(run('localhost', 'http://localhost:4184', 'https://www.casper.tw/', { slugs }).prevented, true)
  // 只比路徑開頭：路徑中間出現 slug 的文章照樣攔
  assert.equal(run('localhost', 'http://localhost:4184', 'https://www.casper.tw/tags/sound-effects/', { slugs }).href, 'http://localhost:4184/tags/sound-effects/')
})

test('previewLinkScript：外站連結、新分頁、按著修飾鍵都不攔', () => {
  assert.equal(run('localhost', 'http://localhost:4184', 'https://img.casper.tw/a.webp').prevented, false)
  assert.equal(run('localhost', 'http://localhost:4184', 'https://www.casper.tw.evil.example/').prevented, false)
  assert.equal(run('localhost', 'http://localhost:4184', 'https://www.casper.tw/', { target: '_blank' }).prevented, false)
  assert.equal(run('localhost', 'http://localhost:4184', 'https://www.casper.tw/', { metaKey: true }).prevented, false)
})

test('previewLinkScript：在 www.casper.tw 上什麼都不做', () => {
  assert.equal(run('www.casper.tw', 'https://www.casper.tw', 'https://www.casper.tw/ko/').listener, false)
})
