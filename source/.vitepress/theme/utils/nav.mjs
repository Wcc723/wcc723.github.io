// 頁首與頁尾的連結（計畫「導覽」一節）。工具相關的連結只在至少 1 支工具上線時輸出。
// 站內連結一律寫路徑，整頁載入由版面根元素的 vp-raw 負責。

/** 頁型屬於哪一個主選單：文章頁、列表、導覽索引算「文章」，關於頁算「關於」 */
export function sectionOf(pageType) {
  if (['post', 'blog-index', 'taxonomy-list', 'nav-index'].includes(pageType)) return 'posts'
  if (pageType === 'about') return 'about'
  return ''
}

/**
 * 頁首主選單。current：'page'（正在這一頁）、'true'（在這一區）、null。
 * @param {{ tools: object[], pageType?: string, url?: string }} opts
 */
export function headerLinks({ tools = [], pageType = '', url = '' } = {}) {
  const section = sectionOf(pageType)
  const links = []
  if (tools.length) links.push({ key: 'tools', text: '工具', href: '/#tools' })
  links.push({ key: 'posts', text: '文章', href: '/categories/' })
  links.push({ key: 'about', text: '關於', href: '/about/' })
  return links.map((l) => ({
    ...l,
    current: url && url === l.href ? 'page' : l.key === section ? 'true' : null
  }))
}

/** 頁尾的連結組，順序照計畫；工具組 0 支時整組不輸出 */
export function footerGroups({ tools = [] } = {}) {
  const groups = []
  if (tools.length) {
    groups.push({ key: 'tools', title: '工具', links: tools.map((t) => ({ text: t.name, href: `/${t.slug}/` })) })
  }
  groups.push(
    {
      key: 'posts',
      title: '文章',
      links: [
        { text: '最新文章', href: '/' },
        { text: '所有分類', href: '/categories/' },
        { text: '標籤', href: '/tags/' },
        { text: '封存', href: '/archives/' },
        { text: 'RSS', href: '/atom.xml' }
      ]
    },
    {
      key: 'topics',
      title: '熱門主題',
      links: [
        { text: 'CSS', href: '/categories/CSS/' },
        { text: 'JavaScript', href: '/categories/javascript/' },
        { text: '開發環境', href: '/categories/development/' },
        { text: '設計', href: '/categories/design/' }
      ]
    },
    {
      key: 'site',
      title: '關於本站',
      links: [
        { text: '關於卡斯伯', href: '/about/' },
        { text: '聯絡', href: '/contact/' },
        { text: '隱私權政策', href: '/privacy/' },
        { text: '使用條款', href: '/terms/' }
      ]
    },
    {
      key: 'elsewhere',
      title: '卡斯伯的其他地方',
      links: [
        { text: '卡伯遊戲', href: 'https://games.casper.tw/' },
        { text: '《JavaScript 面試力》', href: 'https://hex.school/byKCb' },
        { text: 'Facebook', href: 'https://www.facebook.com/WccCasper' },
        { text: 'GitHub', href: 'https://github.com/wcc723' }
      ]
    }
  )
  return groups
}

/** 是不是站外連結（頁尾加上外連圖示用） */
export const isExternal = (href) => /^https?:\/\//.test(href)
