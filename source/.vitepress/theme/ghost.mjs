// 灰藍小幽靈：圖檔統一由 img.casper.tw/brand/ghost/ 提供（workspace 的 shared/brand/ghost/README.md）。
// 原始尺寸寫死在這裡，元件依顯示寬度算出高度，img 一律帶 width、height，避免版面位移。
// 工具卡圖的邊長。跟 shared/shell/tools.mjs 的 TOOL_MARK_SIZE 一樣，但不從那裡 import：
// 那支會帶進整份 LOCALES 登錄表，讓正式站的 theme chunk 多 3.5 KB。ghost.test.mjs 檢查兩者相等
export const TOOL_MARK_SIZE = 340

export const GHOST_BASE = 'https://img.casper.tw/brand/ghost/'

export const GHOSTS = {
  logo: { file: 's-logo.webp', w: 144, h: 144 },
  wave: { file: 's-wave.webp', w: 640, h: 563 },
  hero: { file: 's-hero.webp', w: 960, h: 894 },
  deco: { file: 's-deco.webp', w: 480, h: 207 },
  spot1: { file: 's-spot1.webp', w: 340, h: 340 },
  spot2: { file: 's-spot2.webp', w: 340, h: 340 },
  spot3: { file: 's-spot3.webp', w: 340, h: 340 },
  spot4: { file: 's-spot4.webp', w: 340, h: 340 },
  pose1: { file: 's-pose1.webp', w: 340, h: 340 },
  pose2: { file: 's-pose2.webp', w: 340, h: 340 },
  pose3: { file: 's-pose3.webp', w: 340, h: 340 },
  pose4: { file: 's-pose4.webp', w: 340, h: 340 }
}

/**
 * 工具卡的圖（主站首頁規格 F.2、E.1）：tools.json 的工具（或 siteToolLinks() 的連結）有 mark 就用工具自己的站徽，
 * 否則用它的小幽靈 ghost（沒寫時 spot2）。兩種都是 TOOL_MARK_SIZE 見方，回 { src, width, height }，顯示大小由 CSS 決定
 */
export function toolCardArt({ mark = null, ghost = null } = {}) {
  if (typeof mark === 'string' && mark) return { src: mark, width: TOOL_MARK_SIZE, height: TOOL_MARK_SIZE }
  return ghostImage(ghost || 'spot2', TOOL_MARK_SIZE)
}

/**
 * 外語首頁介紹區塊的主圖（主站首頁規格 E.1、F.6）：連結的 feature.images[0]（工具自己的橫式插圖），
 * 沒有圖時退回工具卡的圖 toolCardArt()。回 { src, width, height }；SiteHomePage.vue 與 audit T1 都用這一支
 */
export function toolFeatureArt(link = {}) {
  const main = link?.feature?.images?.[0]
  if (main && typeof main.src === 'string' && main.src) return { src: main.src, width: main.width, height: main.height }
  return toolCardArt(link ?? {})
}

/** 顯示寬度 width 的 src、width、height；不認得的名字丟錯，避免輸出沒有尺寸的圖 */
export function ghostImage(name, width) {
  const g = GHOSTS[name]
  if (!g) throw new Error(`沒有這隻小幽靈：${name}`)
  const w = Math.round(width)
  return { src: GHOST_BASE + g.file, width: w, height: Math.round((w * g.h) / g.w) }
}
