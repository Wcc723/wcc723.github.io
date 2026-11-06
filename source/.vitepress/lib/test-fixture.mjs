// 測試用（pagedata、cards、feeds、posts 的 *.test.mjs）：repo 路徑、基準檔，以及讀 Hexo 最後一版產物（origin/master）的工具。
// 測試讀真正的 source/（遷移完成後的 364 篇），不另外模擬：只差大小寫的標籤這類問題要讓測試失敗。
// 基準之後的新文章（Hexo 基準沒有的已發布文章）不在這些對照測試裡：SOURCE_DIR 是 source/ 的「基準視圖」，
// 舊文章與其他檔案照舊連到真正的檔案，只少了新文章；新文章由建置後的 audit 驗（scripts/audit-build.mjs 的 newPostsOf，站長 2026-11-06）。
// posts.test.mjs 另驗被排除的每一篇都是基準日之後的新文章，舊文章不會被誤排除。
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { loadPosts, POSTS_DIR } from './posts.mjs'

export const REPO_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
export const REAL_SOURCE_DIR = path.join(REPO_DIR, 'source')
export const BASELINE_DIR = path.join(REPO_DIR, 'baseline/hexo-2026-11-03')
/** 基準的日期（資料夾名稱）：比這天晚的文章才可能是新文章 */
export const BASELINE_DATE = /hexo-(\d{4}-\d{2}-\d{2})$/.exec(BASELINE_DIR)[1]

/** 已發布、網址不在基準 content.json 的文章（基準之後的新文章），回傳文章索引的項目 */
export function postsAfterBaseline(srcDir = REAL_SOURCE_DIR) {
  const base = new Set(JSON.parse(fs.readFileSync(path.join(BASELINE_DIR, 'content.json'), 'utf8')).map((x) => encodeURI('/' + x.path)))
  return loadPosts(srcDir, { includeUnpublished: true }).filter((p) => p.published && !base.has(encodeURI(p.url)))
}

/** source/ 的基準視圖：暫存資料夾，每一項都是連回 source/ 的符號連結，_posts 只連基準有的文章（含未發布的草稿） */
function baselineView() {
  const skip = new Set(postsAfterBaseline().map((p) => p.file))
  if (!skip.size) return REAL_SOURCE_DIR
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-source-baseline-'))
  for (const name of fs.readdirSync(REAL_SOURCE_DIR)) {
    if (name !== POSTS_DIR) fs.symlinkSync(path.join(REAL_SOURCE_DIR, name), path.join(dir, name))
  }
  fs.mkdirSync(path.join(dir, POSTS_DIR))
  for (const name of fs.readdirSync(path.join(REAL_SOURCE_DIR, POSTS_DIR))) {
    if (!skip.has(name)) fs.symlinkSync(path.join(REAL_SOURCE_DIR, POSTS_DIR, name), path.join(dir, POSTS_DIR, name))
  }
  process.on('exit', () => fs.rmSync(dir, { recursive: true, force: true }))
  return dir
}

export const SOURCE_DIR = baselineView()

export const HEXO_REF = 'origin/master'

// origin/master（Hexo 最後一版產物，凍結）在不在；CI 的淺 clone 沒有這個 ref，需要它的測試就跳過
export function hasHexoOutput() {
  try {
    execFileSync('git', ['-C', REPO_DIR, 'rev-parse', '--verify', '--quiet', `${HEXO_REF}^{commit}`], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// 一次讀很多個 origin/master 的檔案（git cat-file --batch），回傳 Map<路徑, 內容>；不存在的檔案不放進 Map
export function hexoOutputs(files) {
  const out = new Map()
  if (!files.length) return out
  const buf = execFileSync('git', ['-C', REPO_DIR, 'cat-file', '--batch'], {
    input: files.map((f) => `${HEXO_REF}:${f}`).join('\n') + '\n',
    maxBuffer: 1 << 30
  })
  let pos = 0
  for (const f of files) {
    const nl = buf.indexOf(10, pos)
    const header = buf.subarray(pos, nl).toString('utf8')
    pos = nl + 1
    if (header.endsWith(' missing')) continue
    const size = Number(header.split(' ')[2])
    out.set(f, buf.subarray(pos, pos + size).toString('utf8'))
    pos += size + 1
  }
  return out
}

// origin/master 的檔案清單（含中文路徑，用 -z 避免 git 把路徑加引號）
export function hexoFiles() {
  return execFileSync('git', ['-C', REPO_DIR, 'ls-tree', '-r', '-z', '--name-only', HEXO_REF], { encoding: 'utf8', maxBuffer: 1 << 26 })
    .split('\0')
    .filter(Boolean)
}

// 網址 → origin/master 裡的 index.html 路徑，例 /page/2/ → page/2/index.html、/ → index.html
export function hexoFileOf(url) {
  return decodeURI(url).slice(1) + 'index.html'
}

export function readBaseline(name) {
  return fs.readFileSync(path.join(BASELINE_DIR, name), 'utf8')
}
