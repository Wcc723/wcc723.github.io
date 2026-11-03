#!/usr/bin/env node
// 逐篇把 Markdown 轉成 VitePress 會交給 Vue 的 SFC，再用 Vue 編譯器檢查。
// vitepress build 遇到第一個錯誤就停；這支一次列出全部會壞的文章和原因。
// 用法：node scripts/check-compile.mjs [檔名或 glob 片段...] [--json]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { createMarkdownRenderer } from 'vitepress'
import { parse, compileTemplate } from '@vue/compiler-sfc'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'source')

export async function checkFiles(files, { markdownOptions } = {}) {
  const config = markdownOptions ?? (await loadMarkdownOptions())
  const md = await createMarkdownRenderer(srcDir, config, '/')
  const results = []
  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8')
    const { content } = matter(raw)
    const errors = []
    let html = ''
    const env = { path: file, relativePath: path.relative(srcDir, file), cleanUrls: true }
    try {
      html = md.render(content, env)
    } catch (e) {
      errors.push(`markdown: ${e.message}`)
    }
    // 跟 VitePress 的 markdownToVue 一樣：頂層的 <script>、<style> 抽成 SFC 區塊，其餘包進 <template><div>…</div></template>
    const blocks = env.sfcBlocks ?? { scripts: [], styles: [], customBlocks: [] }
    const sfc = [
      ...blocks.scripts.map((b) => b.content),
      `<template><div>${html}</div></template>`,
      ...blocks.styles.map((b) => b.content),
      ...blocks.customBlocks.map((b) => b.content)
    ].join('\n')
    const { descriptor, errors: parseErrors } = parse(sfc, { filename: file })
    for (const e of parseErrors) errors.push(`parse: ${e.message}${e.loc ? ` @${e.loc.start.line}:${e.loc.start.column}` : ''}`)
    if (!parseErrors.length && descriptor.template) {
      const r = compileTemplate({ source: descriptor.template.content, filename: file, id: 'x', ssr: true, ssrCssVars: [] })
      for (const e of r.errors) errors.push(`template: ${typeof e === 'string' ? e : e.message}`)
    }
    results.push({ file: path.relative(root, file), errors })
  }
  return results
}

async function loadMarkdownOptions() {
  try {
    const mod = await import(path.join(srcDir, '.vitepress', 'lib', 'markdown.mjs'))
    return mod.markdownOptions ?? {}
  } catch {
    return {}
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  const asJson = args.includes('--json')
  const filters = args.filter((a) => !a.startsWith('--'))
  const dir = path.join(srcDir, '_posts')
  let files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).map((f) => path.join(dir, f))
  // 文章以外的固定頁（動態路由的 [xxx]/index.md 內容由 paths loader 產生，build 時才編譯）
  const pages = ['index.md', 'about/index.md', 'about/hexschool-traning.md', 'categories/index.md', 'tags/index.md', 'archives/index.md', 'privacy/index.md', 'contact/index.md', 'terms/index.md']
  files.push(...pages.map((f) => path.join(srcDir, f)).filter(fs.existsSync))
  if (filters.length) files = files.filter((f) => filters.some((q) => f.includes(q)))
  const results = await checkFiles(files)
  const bad = results.filter((r) => r.errors.length)
  if (asJson) console.log(JSON.stringify(bad, null, 2))
  else {
    for (const r of bad) console.log(`${r.file}\n  ${r.errors.slice(0, 5).join('\n  ')}`)
    console.log(`\n${results.length} 篇檢查，${bad.length} 篇有錯`)
  }
  process.exit(bad.length ? 1 : 0)
}
