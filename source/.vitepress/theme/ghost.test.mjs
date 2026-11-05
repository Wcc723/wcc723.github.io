import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { GHOSTS, ghostImage, toolCardArt, toolFeatureArt, TOOL_MARK_SIZE } from './ghost.mjs'
import { TOOL_MARK_SIZE as SHARED_TOOL_MARK_SIZE } from './shared/shell/tools.mjs'

const readme = fileURLToPath(new URL('../../../../../shared/brand/ghost/README.md', import.meta.url))

test('ghostImage：依原始比例算高度，網址在 img.casper.tw', () => {
  assert.deepEqual(ghostImage('logo', 36), { src: 'https://img.casper.tw/brand/ghost/s-logo.webp', width: 36, height: 36 })
  assert.deepEqual(ghostImage('deco', 280), { src: 'https://img.casper.tw/brand/ghost/s-deco.webp', width: 280, height: 121 })
  assert.equal(ghostImage('hero', 360).height, 335)
  assert.equal(ghostImage('wave', 112).height, 99)
})

test('toolCardArt：有 mark 用工具自己的站徽，否則用小幽靈；都是 340 見方，跟 s-spot<N>.webp 同尺寸', () => {
  const mark = 'https://www.casper.tw/sound-effects/brand/a/card-340.webp'
  assert.deepEqual(toolCardArt({ mark, ghost: null }), { src: mark, width: 340, height: 340 })
  assert.deepEqual(toolCardArt({ ghost: 'spot3', mark: null }), { src: 'https://img.casper.tw/brand/ghost/s-spot3.webp', width: 340, height: 340 })
  assert.deepEqual(toolCardArt({}), ghostImage('spot2', 340), '都沒有時退到 spot2，跟原本一樣')
  assert.deepEqual([GHOSTS.spot1.w, GHOSTS.spot1.h], [340, 340])
})

test('toolFeatureArt：介紹區塊的主圖是 feature.images[0]，沒有圖時退回 toolCardArt()', () => {
  const main = { src: 'https://img.casper.tw/sound-effects/sfx-feature-a.webp', width: 960, height: 600 }
  const deco = { src: 'https://img.casper.tw/sound-effects/sfx-cat-impacts.webp', width: 240, height: 240 }
  const mark = 'https://www.casper.tw/sound-effects/brand/a/card-340.webp'
  assert.deepEqual(toolFeatureArt({ mark, ghost: null, feature: { intro: 'x', highlights: ['a', 'b'], cta: 'Go', images: [main, deco] } }), main)
  assert.deepEqual(toolFeatureArt({ mark, ghost: null, feature: { intro: 'x', highlights: ['a', 'b'], cta: 'Go', images: [] } }), toolCardArt({ mark }))
  assert.deepEqual(toolFeatureArt({ ghost: 'spot3', mark: null, feature: null }), toolCardArt({ ghost: 'spot3' }))
  assert.deepEqual(toolFeatureArt(), toolCardArt({}))
  // 回傳的是新物件，改了不影響資料
  const link = { feature: { images: [main] } }
  toolFeatureArt(link).width = 1
  assert.equal(link.feature.images[0].width, 960)
})

test('ghostImage：不認得的名字丟錯', () => {
  assert.throws(() => ghostImage('casper', 10))
})

test('尺寸跟 workspace 的小幽靈對照表一致', { skip: !fs.existsSync(readme) }, () => {
  const text = fs.readFileSync(readme, 'utf8')
  for (const g of Object.values(GHOSTS)) {
    const re = new RegExp('`' + g.file.replace('.', '\\.') + '` \\| (\\d+) × (\\d+)')
    const m = re.exec(text)
    assert.ok(m, g.file)
    assert.deepEqual([Number(m[1]), Number(m[2])], [g.w, g.h], g.file)
  }
})

test('TOOL_MARK_SIZE 跟 shared/shell/tools.mjs 一致（ghost.mjs 不 import 那支，免得 LOCALES 進正式站 chunk）', () => {
  assert.equal(TOOL_MARK_SIZE, SHARED_TOOL_MARK_SIZE)
  const src = fs.readFileSync(fileURLToPath(new URL('./ghost.mjs', import.meta.url)), 'utf8')
  assert.doesNotMatch(src, /^\s*import\b/m)
})
