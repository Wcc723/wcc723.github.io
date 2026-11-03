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

test('rootTemplate 認得空模板', () => {
  assert.equal(rootTemplate('<script setup></script>\n<template></template>\n'), '')
  assert.equal(rootTemplate('<template>\n  <!-- 註解 -->\n</template>\n'), '')
  assert.equal(rootTemplate('<template><span v-if="false" /></template>'), '<span v-if="false" />')
  assert.equal(rootTemplate('<script setup></script>'), null)
})
