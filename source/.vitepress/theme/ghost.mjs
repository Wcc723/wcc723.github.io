// 灰藍小幽靈：圖檔統一由 img.casper.tw/brand/ghost/ 提供（workspace 的 shared/brand/ghost/README.md）。
// 原始尺寸寫死在這裡，元件依顯示寬度算出高度，img 一律帶 width、height，避免版面位移。

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

/** 顯示寬度 width 的 src、width、height；不認得的名字丟錯，避免輸出沒有尺寸的圖 */
export function ghostImage(name, width) {
  const g = GHOSTS[name]
  if (!g) throw new Error(`沒有這隻小幽靈：${name}`)
  const w = Math.round(width)
  return { src: GHOST_BASE + g.file, width: w, height: Math.round((w * g.h) / g.w) }
}
