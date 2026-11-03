// ⌘K 搜尋的資料處理：/content.json（hexo-generator-json-content 格式）加上已上線的工具，
// 只比對標題、分類、標籤（工具比對名稱、用途和關鍵字），跟 Hexo 版的行為相同。
// 只用標準 JavaScript，元件和 node:test 都能 import。

import { dateFromPath } from './format.mjs'

const names = (list) => (Array.isArray(list) ? list.map((x) => (typeof x === 'string' ? x : x?.name ?? '')).filter(Boolean) : [])

const toUrl = (p) => {
  const u = String(p ?? '')
  if (!u || /^https?:\/\//.test(u) || u.startsWith('/')) return u
  return `/${u}`
}

/** content.json → [{ kind: 'post', title, url, date, category, hay }] */
export function buildPostIndex(data) {
  const posts = Array.isArray(data) ? data : Array.isArray(data?.posts) ? data.posts : []
  return posts.map((p) => {
    const cats = names(p.categories)
    const tags = names(p.tags)
    const url = toUrl(p.path ?? p.permalink)
    return {
      kind: 'post',
      title: p.title || '（無標題）',
      url,
      date: dateFromPath(url) || String(p.date ?? '').slice(0, 10),
      category: cats[0] ?? '',
      hay: [p.title ?? '', ...cats, ...tags].join(' ').toLowerCase()
    }
  })
}

/** 工具清單（theme/tools.mjs 的格式）→ [{ kind: 'tool', title, url, description, hay }] */
export function buildToolIndex(tools) {
  return (Array.isArray(tools) ? tools : []).map((t) => ({
    kind: 'tool',
    title: t.name,
    url: `/${t.slug}/`,
    description: t.description ?? '',
    hay: [t.name, t.description ?? '', ...(t.keywords ?? [])].join(' ').toLowerCase()
  }))
}

/** 空白分開的每個詞都要出現；工具排在文章前面，其餘照原本順序（文章是新到舊） */
export function searchIndex(entries, query, limit = 50) {
  const terms = String(query ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  const hits = entries.filter((e) => terms.every((t) => e.hay.includes(t)))
  const tools = hits.filter((e) => e.kind === 'tool')
  const rest = hits.filter((e) => e.kind !== 'tool')
  return [...tools, ...rest].slice(0, limit)
}

/** 把標題切成 [{ text, hit }]，元件用 <mark> 標出命中的字，不用 v-html */
export function highlightParts(text, query) {
  const src = String(text ?? '')
  const terms = String(query ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  if (!terms.length || !src) return [{ text: src, hit: false }]
  const lower = src.toLowerCase()
  const marks = new Array(src.length).fill(false)
  for (const t of terms) {
    let i = lower.indexOf(t)
    while (i !== -1) {
      for (let k = i; k < i + t.length; k++) marks[k] = true
      i = lower.indexOf(t, i + t.length)
    }
  }
  const parts = []
  for (let i = 0; i < src.length; i++) {
    const last = parts[parts.length - 1]
    if (last && last.hit === marks[i]) last.text += src[i]
    else parts.push({ text: src[i], hit: marks[i] })
  }
  return parts
}
