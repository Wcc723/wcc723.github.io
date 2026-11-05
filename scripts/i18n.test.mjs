// scripts/i18n.mjs 的測試（主站首頁規格 I.2）：check（真的文案檔要 exit 0）、stamp、rebase、report 與參數。
// stamp、rebase 一律在暫存資料夾的複本上跑，不動 source/.vitepress/i18n/home/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import siteConfig from '../source/.vitepress/site.config.mjs'
import { HOME_DIR } from '../source/.vitepress/lib/site-home.mjs'
import { STAMP_REMINDER } from '../source/.vitepress/theme/shared/shell/i18n/messages.mjs'
import { checkHome, formatReport, main, parseArgs, readHomeDir, summaryLine } from './i18n.mjs'

const AT = '2026-11-04'
const config = { ...siteConfig, home: { ...siteConfig.home, reviewers: { en: [{ id: 'casper', native: false }], ja: [{ id: 'yuki', native: true }] } } }

async function withCopy(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'casper-i18n-'))
  try {
    for (const f of fs.readdirSync(HOME_DIR)) fs.copyFileSync(path.join(HOME_DIR, f), path.join(dir, f))
    return await fn(dir)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
  }
}
async function run(argv, opts = {}) {
  const logs = []
  const code = await main(argv, { log: (m) => logs.push(m), today: AT, ...opts })
  return { code, out: logs.join('\n') }
}
const readJson = (dir, code) => JSON.parse(fs.readFileSync(path.join(dir, `${code}.json`), 'utf8'))
const writeJson = (dir, code, v) => fs.writeFileSync(path.join(dir, `${code}.json`), `${JSON.stringify(v, null, 2)}\n`)

test('check：真的文案檔過 G1，exit 0；每個 roadmap 語系一行摘要', async () => {
  const { code, out } = await run(['check'])
  assert.equal(code, 0, out)
  assert.match(out, /G1 通過/)
  for (const c of siteConfig.home.roadmap) assert.match(out, new RegExp(`^  ${c}：`, 'm'))
  assert.match(out, /  es：沒有文案檔/)
  // en 2026-11-05 站長審過（casper），ja 還沒
  assert.match(out, /  en：ok，未開放/)
  assert.match(out, /  ja：unreviewed（\d+ 個 key 未審），未開放/)
  const { errors, rows } = checkHome()
  assert.deepEqual(errors, [])
  assert.deepEqual(rows.map((r) => r.code), ['en', 'zh-cn', 'ja', 'ko', 'de', 'es'])
  assert.deepEqual([...readHomeDir().files.keys()], ['en', 'ja', 'ko', 'de'])
})

test('check：G1 的錯誤（多一個 key、檔名不對、缺正本、不在 roadmap）exit 1', () => withCopy(async (dir) => {
  const ja = readJson(dir, 'ja')
  ja.hero.extra = 'もう一つ'
  writeJson(dir, 'ja', ja)
  fs.writeFileSync(path.join(dir, 'fr.json'), '{}\n')
  const r = await run(['check'], { dir })
  assert.equal(r.code, 1)
  assert.match(r.out, /i18n\/home\/fr\.json：檔名不是外語首頁的語系代碼/)
  assert.match(r.out, /hero\.extra/)
  fs.rmSync(path.join(dir, 'fr.json'))
  fs.rmSync(path.join(dir, 'en.json'))
  assert.match((await run(['check'], { dir })).out, /缺正本 i18n\/home\/en\.json/)
  const noKo = { ...siteConfig, home: { ...siteConfig.home, roadmap: ['en', 'ja', 'de'] } }
  assert.match(checkHome({ config: noKo }).errors.join('\n'), /ko\.json：ko 不在 site\.config\.mjs 的 home\.roadmap/)
}))

test('stamp：寫進 $meta.review，提醒蓋章的意義；不在 home.reviewers 的人不能蓋', () => withCopy(async (dir) => {
  const r = await run(['stamp', '--locale', 'en', '--by', 'casper', '--at', AT], { dir, config })
  assert.equal(r.code, 0, r.out)
  assert.ok(r.out.startsWith(STAMP_REMINDER))
  assert.match(r.out, /已蓋章：i18n\/home\/en\.json（全部 key，casper，2026-11-04）/)
  const en = readJson(dir, 'en')
  assert.ok(Object.keys(en.$meta.review).length > 5)
  assert.ok(Object.values(en.$meta.review).every((rec) => rec.by === 'casper' && rec.at === AT))
  await run(['stamp', '--locale', 'ja', '--by', 'yuki', '--keys', 'hero.lead,tools.h2', '--at', AT], { dir, config })
  assert.deepEqual(Object.keys(readJson(dir, 'ja').$meta.review).sort(), ['hero.lead', 'tools.h2'])
  await assert.rejects(run(['stamp', '--locale', 'ja', '--by', 'someone', '--at', AT], { dir, config }))
  assert.match(summaryLine(checkHome({ config, dir }).rows.find((x) => x.code === 'en')), /en：ok，未開放/)
}))

test('rebase：正本改了字但意思不變，已審的譯文跟著換基準，記在 $meta.rebases', () => withCopy(async (dir) => {
  await run(['stamp', '--locale', 'en', '--by', 'casper', '--at', AT], { dir, config })
  await run(['stamp', '--locale', 'ja', '--by', 'yuki', '--at', AT], { dir, config })
  const en = readJson(dir, 'en')
  en.tools.h2 = `${en.tools.h2} `
  writeJson(dir, 'en', en)
  await run(['stamp', '--locale', 'en', '--by', 'casper', '--keys', 'tools.h2', '--updated', '--at', AT], { dir, config })
  assert.match(formatReport({ config, dir }), /tools\.h2\s+ok\s+outdated/)
  const r = await run(['rebase', '--key', 'tools.h2', '--by', 'casper', '--reason', '只多了空白', '--at', AT], { dir, config })
  assert.equal(r.code, 0, r.out)
  assert.match(r.out, /已 rebase tools\.h2：ja/)
  assert.deepEqual(readJson(dir, 'ja').$meta.rebases, [{ key: 'tools.h2', by: 'casper', at: AT, reason: '只多了空白' }])
  assert.match(formatReport({ config, dir }), /tools\.h2\s+ok\s+ok/)
  // 重跑同一個 rebase：已經對到新原文，不多記一筆
  assert.match((await run(['rebase', '--key', 'tools.h2', '--by', 'casper', '--reason', '只多了空白', '--at', AT], { dir, config })).out, /沒有語系的 tools\.h2 需要 rebase/)
  assert.equal(readJson(dir, 'ja').$meta.rebases.length, 1)
  // 譯文自己改過（c 不符）的不 rebase
  const ja = readJson(dir, 'ja')
  ja.tools.lead = `${ja.tools.lead}。`
  writeJson(dir, 'ja', ja)
  assert.match((await run(['rebase', '--key', 'tools.lead', '--by', 'casper', '--reason', 'x', '--at', AT], { dir, config })).out, /沒有語系的 tools\.lead 需要 rebase/)
  await assert.rejects(run(['rebase', '--key', 'tools.h2', '--by', 'yuki', '--reason', 'x', '--at', AT], { dir, config }), /要由正本 en 的審稿人宣告/)
}))

test('report：列是 key、欄是語系，最後列出沒有文案檔的語系', () => {
  const text = formatReport()
  const lines = text.split('\n')
  assert.match(lines[0], /正本 en；已開放：沒有/)
  assert.match(lines[1], /^key\s+en\s+ja\s+ko\s+de$/)
  assert.match(text, /^hero\.lead\s+ok\s+unreviewed\s+unreviewed\s+unreviewed$/m)
  assert.equal(lines.at(-1), '沒有文案檔：zh-cn、es')
})

test('parseArgs', () => {
  assert.equal(parseArgs([]).command, 'check')
  assert.deepEqual(parseArgs(['stamp', '--locale', 'ja', '--by', 'yuki', '--keys', 'a, b', '--updated']).keys, ['a', 'b'])
  assert.throws(() => parseArgs(['publish']), /不認得的指令/)
  assert.throws(() => parseArgs(['stamp', '--locale', 'ja']), /stamp 要給 --locale 與 --by/)
  assert.throws(() => parseArgs(['rebase', '--key', 'a', '--by', 'casper']), /rebase 要給 --key、--by 與 --reason/)
  assert.throws(() => parseArgs(['check', '--at', '11/04']), /--at 要是 YYYY-MM-DD/)
  assert.throws(() => parseArgs(['stamp', '--by']), /--by 要接一個值/)
  assert.throws(() => parseArgs(['check', '--x']), /不認得的參數/)
})
