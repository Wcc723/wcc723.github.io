// 測試用（pagedata、cards、feeds 的 *.test.mjs）：repo 路徑、基準檔，以及讀 Hexo 最後一版產物（origin/master）的工具。
// 測試一律讀真正的 source/（遷移完成後的 364 篇），不另外模擬：只差大小寫的標籤這類問題要讓測試失敗。
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const REPO_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
export const SOURCE_DIR = path.join(REPO_DIR, 'source')
export const BASELINE_DIR = path.join(REPO_DIR, 'baseline/hexo-2026-11-03')

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
