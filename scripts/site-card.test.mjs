// scripts/site-card.mjs 的測試（主站首頁規格 F.3、C.5）：產生、--check、拿掉已上線的語系失敗、--allow-remove、shell 欄位，
// 以及提交的 site-card.json 跟現在的設定與計畫一致
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import siteConfig from '../source/.vitepress/site.config.mjs'
import { buildSiteHomePlan } from '../source/.vitepress/lib/site-home.mjs'
import { CARD_COMMENT, CARD_FILE, main, parseArgs, removedCodes, siteCard } from './site-card.mjs'

const plan = (published) => ({ stage: 'live', published, pages: published.map((code) => ({ code, url: `https://www.casper.tw/${code}/`, preview: false })), problems: [], warnings: [] })
const shared = { ...siteConfig, shell: 'shared' }

function withTmp(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'casper-site-card-'))
  try {
    return fn(path.join(dir, 'site-card.json'))
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}
const run = (argv, opts) => {
  const logs = []
  const code = main(argv, { log: (m) => logs.push(m), ...opts })
  return { code, out: logs.join('\n') }
}

test('提交的 site-card.json 跟 site.config.mjs 與 live 計畫一致（S：shared、siteHomes 照 home.locales）', () => {
  const card = JSON.parse(fs.readFileSync(CARD_FILE, 'utf8'))
  assert.deepEqual(card, siteCard({ config: siteConfig, plan: buildSiteHomePlan({ config: siteConfig, env: {} }) }))
  assert.deepEqual(card, { $comment: CARD_COMMENT, schema: 1, shell: 'shared', siteHomes: siteConfig.home.locales })
  assert.equal(run(['--check']).code, 0)
})

test('產生：shell 照設定，siteHomes 照 plan.published；--check 比對提交的檔', () => withTmp((file) => {
  assert.equal(run(['--check'], { file, config: shared, plan: plan(['en']) }).code, 1)
  assert.equal(run([], { file, config: shared, plan: plan(['en', 'ja']) }).code, 0)
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), { $comment: CARD_COMMENT, schema: 1, shell: 'shared', siteHomes: ['en', 'ja'] })
  assert.equal(run(['--check'], { file, config: shared, plan: plan(['en', 'ja']) }).code, 0)
  const stale = run(['--check'], { file, config: { ...siteConfig, shell: 'legacy' }, plan: plan(['en', 'ja']) })
  assert.equal(stale.code, 1)
  assert.match(stale.out, /site-card\.json 過期/)
}))

test('拿掉已上線的語系失敗；--allow-remove 放行', () => withTmp((file) => {
  run([], { file, config: shared, plan: plan(['en', 'ja']) })
  const blocked = run([], { file, config: shared, plan: plan(['en']) })
  assert.equal(blocked.code, 1)
  assert.match(blocked.out, /ja 已經上線，不能拿掉/)
  assert.equal(run(['--check'], { file, config: shared, plan: plan(['en']) }).code, 1)
  assert.equal(run(['--allow-remove', 'ja'], { file, config: shared, plan: plan(['en']) }).code, 0)
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')).siteHomes, ['en'])
  assert.deepEqual(removedCodes({ siteHomes: ['en', 'de'] }, { siteHomes: ['en'] }), ['de'])
  assert.deepEqual(removedCodes(null, { siteHomes: [] }), [])
}))

test('計畫有關卡沒過的語系時不寫檔', () => withTmp((file) => {
  const r = run([], { file, config: shared, plan: { ...plan([]), problems: ['site-home en：G6 …'] } })
  assert.equal(r.code, 1)
  assert.match(r.out, /沒過關卡，不更新 site-card\.json/)
  assert.ok(!fs.existsSync(file))
}))

test('parseArgs', () => {
  assert.deepEqual(parseArgs(['--check', '--allow-remove', 'ja', '--allow-remove', 'de']), { check: true, allowRemove: ['ja', 'de'] })
  assert.throws(() => parseArgs(['--allow-remove']), /要接一個語系代碼/)
  assert.throws(() => parseArgs(['--x']), /不認得的參數/)
})
