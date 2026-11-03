import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { GHOSTS, ghostImage } from './ghost.mjs'

const readme = fileURLToPath(new URL('../../../../../shared/brand/ghost/README.md', import.meta.url))

test('ghostImage：依原始比例算高度，網址在 img.casper.tw', () => {
  assert.deepEqual(ghostImage('logo', 36), { src: 'https://img.casper.tw/brand/ghost/s-logo.webp', width: 36, height: 36 })
  assert.deepEqual(ghostImage('deco', 280), { src: 'https://img.casper.tw/brand/ghost/s-deco.webp', width: 280, height: 121 })
  assert.equal(ghostImage('hero', 360).height, 335)
  assert.equal(ghostImage('wave', 112).height, 99)
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
