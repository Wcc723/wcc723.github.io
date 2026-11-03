import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const THEME = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

function vueFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return vueFiles(p)
    return e.name.endsWith('.vue') ? [p] : []
  })
}

// 最外層 <template> 的內容（拿掉註解，production 建置也會拿掉）
function rootTemplate(src) {
  const m = src.match(/^<template>([\s\S]*)^<\/template>|^<template>(.*)<\/template>$/m)
  if (!m) return null
  return (m[1] ?? m[2]).replace(/<!--[\s\S]*?-->/g, '').trim()
}

// 空的 <template>：SSR 什麼都不輸出，瀏覽器端的 render 卻回傳一個註解節點，
// hydration 對不上，後面的節點全部錯位（2026-11-03 整合時 25 篇示範頁都是這個原因）。
test('主題的 .vue 沒有空的 <template>', () => {
  const files = vueFiles(THEME)
  assert.ok(files.length > 25)
  const empty = files.filter((f) => rootTemplate(fs.readFileSync(f, 'utf8')) === '').map((f) => path.relative(THEME, f))
  assert.deepEqual(empty, [])
})

// 示範元件按需載入：每一頁都會下載主題 chunk，示範元件只有少數文章用到（audit 的 THEME_CHUNK_MAX 也假設它們不在主題 chunk）。
test('theme/index.ts 用非 eager 的 glob 與 defineAsyncComponent 註冊示範元件', () => {
  const src = fs.readFileSync(path.join(THEME, 'index.ts'), 'utf8')
  const globs = [...src.matchAll(/import\.meta\.glob(?:<[^>]*>)?\(\s*(['"])([^'"]+)\1\s*(?:,\s*(\{[^}]*\}))?\s*\)/g)]
  const demoGlobs = globs.filter((m) => m[2].includes('components/demos/'))
  assert.equal(demoGlobs.length, 1, 'demos/ 的 glob 應該剛好一個')
  assert.doesNotMatch(demoGlobs[0][3] ?? '', /eager\s*:\s*true/, 'demos/ 的 glob 不能 eager')
  assert.match(src, /app\.component\(\s*name\s*,\s*defineAsyncComponent\(/)
})

test('主題的其他檔案沒有靜態 import demos/（否則那支元件會被打回主題 chunk）', () => {
  const DEMOS = path.join(THEME, 'components', 'demos')
  const sources = (dir) =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) return e.name === 'demos' || e.name === 'shared' ? [] : sources(p)
      return /\.(vue|ts|mts|js|mjs)$/.test(e.name) && !e.name.endsWith('.test.mjs') ? [p] : []
    })
  const offenders = sources(THEME).filter((f) => {
    const src = fs.readFileSync(f, 'utf8')
    return [...src.matchAll(/(?:^|\n)\s*import\s[^'"]*?(['"])([^'"]+)\1/g)].some((m) => {
      const spec = m[2]
      return spec.startsWith('.') && path.resolve(path.dirname(f), spec).startsWith(DEMOS + path.sep)
    })
  })
  assert.ok(fs.existsSync(DEMOS))
  assert.deepEqual(offenders.map((f) => path.relative(THEME, f)), [])
})

test('rootTemplate 認得空模板', () => {
  assert.equal(rootTemplate('<script setup></script>\n<template></template>\n'), '')
  assert.equal(rootTemplate('<template>\n  <!-- 註解 -->\n</template>\n'), '')
  assert.equal(rootTemplate('<template><span v-if="false" /></template>'), '<span v-if="false" />')
  assert.equal(rootTemplate('<script setup></script>'), null)
})
