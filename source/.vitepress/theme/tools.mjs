// 已上線的工具清單：頁首「工具」連結、首頁 #tools 區、頁尾工具組、⌘K 搜尋、404 的按鈕都讀這裡。
// P2 是 0 支，所以這些地方都不輸出。P3 第一支工具 /lucky-draw/ 上線時，改成讀 data/tools.json
// （由 workspace 的 projects.json 產生，只列 status 為 live 的工具），格式跟下面的 TOOLS 相同。
//
// 每支工具：
//   slug         網址 /<slug>/，也是 repo 名和 Worker 名
//   name         顯示名稱，例「抽獎大師」
//   description  一句用途，例「抽獎、轉盤、分組」
//   ghost        首頁工具卡的小幽靈（spot1 到 spot4），見 ghost.mjs
//   keywords     ⌘K 搜尋多比對的字（可省略）
//   live         true 才輸出

/** @type {{ slug: string, name: string, description: string, ghost?: string, keywords?: string[], live: boolean }[]} */
export const TOOLS = []

/** 已上線的工具，依清單順序 */
export function liveTools(list = TOOLS) {
  return list.filter((t) => t && t.live === true && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(t.slug))
}
