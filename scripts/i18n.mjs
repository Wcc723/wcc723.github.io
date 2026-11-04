// 外語首頁文案（source/.vitepress/i18n/home/<code>.json）的檢查、蓋章、rebase 與狀態表（主站首頁規格 I.2）。
//
//   node scripts/i18n.mjs check                         G1 加各語系狀態摘要；npm test（i18n.test.mjs）與 prebuild 都跑。
//                                                       G1 有錯才 exit 1；未審、outdated 只列在摘要（列進 home.locales 的語系由建置時的 G2 到 G9 擋）
//   node scripts/i18n.mjs stamp --locale <code> --by <id> [--keys a,b] [--updated]
//   node scripts/i18n.mjs rebase --key <key> --by <id> --reason "<為什麼>"
//   node scripts/i18n.mjs report                        每個語系、每個 key 的狀態表
//
// 蓋章代表審稿人逐字看過。agent 不自己蓋章，只在審稿人當次明確指示時代為執行，--by 寫審稿人自己的 id。
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import siteConfig from '../source/.vitepress/site.config.mjs'
import { HOME_DIR, SITE_HOME_CODES, homeFileProblems, readGlossary, validateSiteConfig } from '../source/.vitepress/lib/site-home.mjs'
import { STAMP_REMINDER, fileKeyStates, rebaseFiles, reviewerProblem, stampFile, todayUtc } from '../source/.vitepress/theme/shared/shell/i18n/messages.mjs'
import { leafKeys, worstState } from '../source/.vitepress/theme/shared/shell/i18n/review.mjs'
import { sortLocaleCodes } from '../source/.vitepress/theme/shared/shell/i18n/locales.mjs'
import { textWidth } from '../source/.vitepress/theme/shared/shell/i18n/seo.mjs'

export const REVIEWERS_LABEL = 'site.config.mjs 的 home.reviewers'
const json = (v) => `${JSON.stringify(v, null, 2)}\n`
const MARK = { ok: 'ok', outdated: 'outdated', unreviewed: 'unreviewed' }

/** 資料夾裡的文案檔：Map<code, 檔案物件>，照 LOCALES 排序。檔名不是外語首頁的語系代碼時記在 unknown */
export function readHomeDir(dir = HOME_DIR) {
  const files = new Map()
  const unknown = []
  const names = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')) : []
  for (const name of names) {
    const code = name.replace(/\.json$/, '')
    if (!SITE_HOME_CODES.includes(code)) {
      unknown.push(name)
      continue
    }
    files.set(code, JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')))
  }
  return { files: new Map(sortLocaleCodes([...files.keys()]).map((c) => [c, files.get(c)])), unknown }
}

/**
 * check 的結果：{ errors, rows, notes }。errors 是 G1（缺正本、檔名不對、key、佔位符、lint、書寫系統、$meta 格式）；
 * rows 是每個 roadmap 語系的摘要 { code, file, state, unreviewed, outdated, published }；notes 是審稿人登記這類提醒（不擋）
 */
export function checkHome({ config = siteConfig, dir = HOME_DIR, glossary = readGlossary() } = {}) {
  const home = config.home
  const src = home.sourceLocale
  const { files, unknown } = readHomeDir(dir)
  const errors = unknown.map((name) => `i18n/home/${name}：檔名不是外語首頁的語系代碼（${SITE_HOME_CODES.join('、')}）`)
  const notes = []
  const source = files.get(src)
  if (!source) errors.push(`缺正本 i18n/home/${src}.json`)
  for (const code of files.keys()) if (!home.roadmap.includes(code)) errors.push(`i18n/home/${code}.json：${code} 不在 site.config.mjs 的 home.roadmap`)
  const rows = []
  for (const code of sortLocaleCodes(home.roadmap)) {
    const file = files.get(code)
    const published = home.locales.includes(code)
    if (!file) {
      rows.push({ code, file: false, state: null, unreviewed: 0, outdated: 0, published })
      if (published) errors.push(`${code} 在 home.locales，但沒有 i18n/home/${code}.json`)
      continue
    }
    if (source) errors.push(...homeFileProblems({ file, source, code, sourceLocale: src, glossary }))
    const states = Object.values(fileKeyStates(file, source, code, src))
    rows.push({
      code,
      file: true,
      state: states.length ? worstState(states) : 'unreviewed',
      unreviewed: states.filter((s) => s === 'unreviewed').length,
      outdated: states.filter((s) => s === 'outdated').length,
      published,
    })
    for (const [key, r] of Object.entries(file.$meta?.review ?? {})) {
      const problem = reviewerProblem({ reviewers: home.reviewers ?? {}, label: REVIEWERS_LABEL }, code, r?.by)
      if (problem) notes.push(`${code} 的 ${key}：${problem}（列進 home.locales 時 G4 會擋）`)
    }
  }
  return { errors, rows, notes }
}

/** 摘要的一行 */
export function summaryLine(r) {
  if (!r.file) return `  ${r.code}：沒有文案檔${r.published ? '（已列在 home.locales）' : ''}`
  const detail = [r.unreviewed && `${r.unreviewed} 個 key 未審`, r.outdated && `${r.outdated} 個 key 原文已改`].filter(Boolean).join('、')
  return `  ${r.code}：${MARK[r.state]}${detail ? `（${detail}）` : ''}${r.published ? '，已開放' : '，未開放'}`
}

/** 逐 key 的狀態表：列是 key，欄是語系 */
export function formatReport({ config = siteConfig, dir = HOME_DIR } = {}) {
  const home = config.home
  const src = home.sourceLocale
  const { files } = readHomeDir(dir)
  const source = files.get(src)
  const codes = sortLocaleCodes(home.roadmap).filter((c) => files.has(c))
  const states = new Map(codes.map((c) => [c, fileKeyStates(files.get(c), source, c, src)]))
  const keys = source ? leafKeys(source) : []
  const head = ['key', ...codes]
  const cells = keys.map((k) => [k, ...codes.map((c) => states.get(c)[k] ?? '缺')])
  const cols = head.map((h, i) => Math.max(textWidth(h), ...cells.map((c) => textWidth(c[i]))))
  const pad = (s, n) => `${s}${' '.repeat(Math.max(0, n - textWidth(s)))}`
  const line = (c) => c.map((x, i) => (i === c.length - 1 ? x : pad(x, cols[i]))).join('  ').trimEnd()
  const missing = sortLocaleCodes(home.roadmap).filter((c) => !files.has(c))
  return [
    `外語首頁文案的審稿狀態（正本 ${src}；已開放：${home.locales.join('、') || '沒有'}）`,
    line(head),
    line(cols.map((n) => '-'.repeat(n))),
    ...cells.map(line),
    ...(missing.length ? [`沒有文案檔：${missing.join('、')}`] : []),
  ].join('\n')
}

/** 參數解析：stamp、rebase 共用 */
export function parseArgs(argv) {
  const o = { command: argv[0] ?? 'check', locale: null, by: null, keys: null, key: null, reason: null, updated: false, at: null }
  const rest = argv.slice(1)
  while (rest.length) {
    const a = rest.shift()
    const val = () => {
      const v = rest.shift()
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} 要接一個值`)
      return v
    }
    if (a === '--locale') o.locale = val()
    else if (a === '--by') o.by = val()
    else if (a === '--keys') o.keys = val().split(',').map((s) => s.trim()).filter(Boolean)
    else if (a === '--key') o.key = val()
    else if (a === '--reason') o.reason = val()
    else if (a === '--at') o.at = val()
    else if (a === '--updated') o.updated = true
    else throw new Error(`不認得的參數：${a}`)
  }
  if (!['check', 'stamp', 'rebase', 'report'].includes(o.command)) throw new Error(`不認得的指令：${o.command}（check、stamp、rebase、report）`)
  if (o.command === 'stamp' && (!o.locale || !o.by)) throw new Error('stamp 要給 --locale 與 --by')
  if (o.command === 'rebase' && (!o.key || !o.by || !o.reason)) throw new Error('rebase 要給 --key、--by 與 --reason')
  if (o.at && !/^\d{4}-\d{2}-\d{2}$/.test(o.at)) throw new Error('--at 要是 YYYY-MM-DD')
  return o
}

export async function main(argv = process.argv.slice(2), { config = siteConfig, dir = HOME_DIR, log = console.log, today = todayUtc(), glossary } = {}) {
  validateSiteConfig(config)
  const o = parseArgs(argv)
  const home = config.home
  const src = home.sourceLocale
  if (o.command === 'check') {
    const { errors, rows, notes } = checkHome({ config, dir, glossary: glossary ?? readGlossary() })
    log('外語首頁文案（i18n/home）：')
    for (const r of rows) log(summaryLine(r))
    for (const n of notes) log(`  注意：${n}`)
    if (errors.length) {
      for (const e of errors) log(`✗ ${e}`)
      log(`G1 有 ${errors.length} 個問題`)
      return 1
    }
    log('G1 通過（未審、原文已改的語系只列在上面，列進 home.locales 時由建置的 G2 到 G9 擋）')
    return 0
  }
  if (o.command === 'report') {
    log(formatReport({ config, dir }))
    return 0
  }
  const { files } = readHomeDir(dir)
  const source = files.get(src)
  if (!source) throw new Error(`缺正本 i18n/home/${src}.json`)
  const at = o.at ?? today
  log(STAMP_REMINDER)
  if (o.command === 'stamp') {
    const file = files.get(o.locale)
    if (!file) throw new Error(`沒有 i18n/home/${o.locale}.json`)
    const next = stampFile(file, source, { code: o.locale, by: o.by, at, keys: o.keys, updated: o.updated, reviewers: home.reviewers ?? {}, sourceLocale: src, label: REVIEWERS_LABEL })
    fs.writeFileSync(path.join(dir, `${o.locale}.json`), json(next))
    log(`已蓋章：i18n/home/${o.locale}.json（${o.keys ? o.keys.join('、') : '全部 key'}，${o.by}，${at}）`)
    return 0
  }
  const changed = rebaseFiles(files, source, { key: o.key, by: o.by, at, reason: o.reason, reviewers: home.reviewers ?? {}, sourceLocale: src, label: REVIEWERS_LABEL })
  for (const [code, next] of changed) fs.writeFileSync(path.join(dir, `${code}.json`), json(next))
  log(changed.size ? `已 rebase ${o.key}：${[...changed.keys()].join('、')}` : `沒有語系的 ${o.key} 需要 rebase（沒有紀錄、譯文已經改過，或已經對到新原文）`)
  return 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exitCode = await main()
  } catch (e) {
    console.error(`✗ ${e.message}`)
    process.exitCode = 1
  }
}
