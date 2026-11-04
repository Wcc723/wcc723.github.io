// 重新產生 site-card.json：部落格對 workspace 的契約（主站首頁規格 F.3、C.5）。
//   node scripts/site-card.mjs                        照 site.config.mjs 與 plan.published 寫 site-card.json
//   node scripts/site-card.mjs --check                不寫檔，跟提交的檔比對，不一致就 exit 1（npm test 也驗）
//   node scripts/site-card.mjs --allow-remove <code>  站長已建好 Redirect Rule、確定要下架某個外語首頁時才用，可重複
// workspace 的 scripts/site-data.mjs 讀部署分支上的這個檔：shell 判斷部落格是不是已經用共用外殼的 zh-tw 字串，siteHomes 是已上線的外語首頁。
// 上線後不能拿掉：舊檔有、新的 published 沒有的語系直接失敗（GitHub Pages 不能 301）。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import siteConfig from '../source/.vitepress/site.config.mjs'
import { buildSiteHomePlan } from '../source/.vitepress/lib/site-home.mjs'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const CARD_FILE = path.join(ROOT, 'site-card.json')
export const CARD_COMMENT = '由 npm run site:card 產生，不要手改。workspace 的 scripts/site-data.mjs 讀部署分支上的這個檔。'
const json = (v) => `${JSON.stringify(v, null, 2)}\n`

/** site-card.json 的內容：shell 等於 site.config.mjs，siteHomes 等於 live 計畫的 published（照 LOCALES 排序，不含 zh-tw） */
export function siteCard({ config = siteConfig, plan } = {}) {
  return { $comment: CARD_COMMENT, schema: 1, shell: config.shell, siteHomes: [...plan.published] }
}

/** 舊檔有、新的沒有的語系 */
export const removedCodes = (prev, next) => (prev?.siteHomes ?? []).filter((c) => !next.siteHomes.includes(c))

/** 參數：--check、--allow-remove <code>（可重複） */
export function parseArgs(argv) {
  const o = { check: false, allowRemove: [] }
  const rest = [...argv]
  while (rest.length) {
    const a = rest.shift()
    if (a === '--check') o.check = true
    else if (a === '--allow-remove') {
      const v = rest.shift()
      if (!v || v.startsWith('--')) throw new Error('--allow-remove 要接一個語系代碼')
      o.allowRemove.push(v)
    } else throw new Error(`不認得的參數：${a}`)
  }
  return o
}

export function main(argv = process.argv.slice(2), { config = siteConfig, file = CARD_FILE, log = console.log, plan } = {}) {
  const o = parseArgs(argv)
  // live 的計畫（env 是空的，不受 CS_STAGE 影響）：關卡沒過的語系不能寫進契約
  const p = plan ?? buildSiteHomePlan({ config, env: {} })
  if (p.problems.length) {
    log(`✗ 外語首頁沒過關卡，不更新 site-card.json：\n${p.problems.join('\n')}`)
    return 1
  }
  const next = siteCard({ config, plan: p })
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null
  const blocked = removedCodes(prev, next).filter((c) => !o.allowRemove.includes(c))
  if (blocked.length) {
    for (const c of blocked) log(`✗ ${c} 已經上線，不能拿掉（GitHub Pages 不能 301）。要下架請站長先建 Redirect Rule，再用 --allow-remove ${c}`)
    return 1
  }
  const text = json(next)
  if (o.check) {
    const same = prev !== null && json(prev) === text
    log(same ? 'site-card.json 跟 site.config.mjs、plan 一致' : `✗ site-card.json 過期，跑 npm run site:card：\n${text}`)
    return same ? 0 : 1
  }
  fs.writeFileSync(file, text)
  log(`已寫入 ${path.relative(ROOT, file) || file}：shell ${next.shell}，siteHomes ${next.siteHomes.join('、') || '（沒有）'}`)
  return 0
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    process.exitCode = main()
  } catch (e) {
    console.error(`✗ ${e.message}`)
    process.exitCode = 1
  }
}
