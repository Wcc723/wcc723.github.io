<script setup lang="ts">
// 〈GSC 30 天三指標同步診斷〉/development/2026/11/19/gemini-gsc-seo-diagnosis/ 文中的互動圖。
// 四種情境的 30 天模擬資料：曝光、點閱率、平均排名同一條時間軸對照，點擊數 = 曝光 × 點閱率。
// 資料寫成字面陣列（不在執行時用 Math.sin 之類產生），SSR 和瀏覽器算出來的文字才會一模一樣，hydration 不會對不上。
// 數字格式也自己寫，不用 toLocaleString（Node 和瀏覽器的 ICU 可能不同）。
import { computed, ref } from 'vue'

type Metric = 'imp' | 'ctr' | 'pos'
interface Phase { from: number; to: number; name: string; note: string }
interface Scenario {
  key: string
  label: string
  title: string
  signal: string
  action: string
  imp: number[]
  ctr: number[]
  pos: number[]
  phases: Phase[]
}

const DAYS = 30

const SCENARIOS: Scenario[] = [
  {
    key: 'test',
    label: '演算法測試',
    title: '正常的演算法測試（通過）',
    signal: '曝光先衝高、名次在幾個位置間震盪，回測時點閱率沒有跟著掉，之後一路往上，名次站穩前 3 名。',
    action: '先觀察 2 到 4 週，不要因為中間那幾天回落就大改標題或內容。',
    imp: [130, 130, 140, 140, 140, 150, 150, 430, 840, 1220, 1330, 1180, 1050, 840, 780, 750, 720, 920, 1060, 1160, 1250, 1380, 1380, 1420, 1500, 1510, 1600, 1660, 1650, 1740],
    ctr: [2.5, 2.6, 2.7, 2.7, 2.9, 2.9, 2.8, 3.2, 3.6, 4.1, 4.7, 4.8, 5.1, 4.8, 4.9, 5.4, 5.6, 6, 6.4, 6.4, 6.7, 6.9, 7, 7.4, 7.6, 7.6, 7.9, 7.9, 8, 8.2],
    pos: [14, 14.1, 13.7, 13.4, 13.3, 12.6, 12.5, 9.6, 7.3, 5.3, 4.6, 5.1, 5.8, 7, 7.5, 8, 6.8, 5.1, 4.7, 4.2, 4.1, 3.7, 3.4, 3.2, 2.9, 2.8, 2.7, 2.4, 2.4, 2.2],
    phases: [
      { from: 1, to: 7, name: '還在第二頁', note: '排在 12 到 14 名，曝光很少。' },
      { from: 8, to: 13, name: '首頁試探', note: '頁面被推上首頁收集點擊，曝光一下子衝高。' },
      { from: 14, to: 17, name: '短暫回測', note: '名次退到第 7、8 名，曝光回落，點閱率沒有跟著掉。' },
      { from: 18, to: 30, name: '站穩爬升', note: '點閱率持續上升，名次回到前 3 名。' }
    ]
  },
  {
    key: 'dissatisfied',
    label: '行為不滿意',
    title: '使用者行為不滿意（排名下滑）',
    signal: '排在前 5 名時點閱率就偏低，接著名次連續兩週以上往下掉，曝光跟著萎縮，沒有回彈。',
    action: '檢查標題與內容有沒有對準搜尋意圖，再看首屏載入與廣告干擾，搭配 GA4 的參與時間確認。',
    imp: [1090, 1170, 1190, 1190, 1160, 1130, 1090, 980, 950, 930, 870, 850, 820, 760, 730, 670, 610, 540, 450, 420, 400, 360, 330, 320, 290, 280, 260, 240, 230, 210],
    ctr: [2.4, 2.2, 2.1, 2.1, 2, 2, 2, 1.8, 1.8, 1.7, 1.6, 1.7, 1.6, 1.5, 1.5, 1.3, 1.3, 1.2, 1.1, 1.1, 1, 1, 1, 0.9, 0.9, 0.9, 0.8, 0.8, 0.7, 0.7],
    pos: [3.4, 3.4, 3.6, 3.8, 3.8, 4.2, 4.4, 4.7, 5.3, 5.6, 6.1, 6.7, 7, 7.7, 8.3, 8.8, 9.8, 10.9, 12, 13.1, 13.6, 14.6, 15.7, 16.4, 17.2, 17.6, 17.9, 18.6, 18.9, 19.5],
    phases: [
      { from: 1, to: 7, name: '高曝光但點閱偏低', note: '排在第 3、4 名，點閱率卻只有 2% 左右。' },
      { from: 8, to: 17, name: '名次一路下滑', note: '名次每週掉 2 到 3 名，曝光跟著減少，沒有回彈。' },
      { from: 18, to: 30, name: '跌出首頁', note: '排到第 10 名以後，曝光和點擊都所剩不多。' }
    ]
  },
  {
    key: 'longtail',
    label: '長尾擴張',
    title: '長尾擴張（健康成長）',
    signal: '曝光一路上升，平均排名數字變大、點閱率變低，但每天的點擊沒有掉，反而變多。',
    action: '這是好訊號。把核心字和新的長尾字分開看，不要誤判成掉排名。',
    imp: [850, 840, 860, 830, 810, 820, 790, 810, 820, 850, 960, 1020, 1080, 1210, 1270, 1370, 1490, 1510, 1620, 1690, 1760, 1940, 2010, 2100, 2240, 2250, 2370, 2520, 2560, 2760],
    ctr: [6.8, 6.8, 6.7, 6.5, 6.6, 6.6, 6.5, 6.6, 6.4, 5.9, 5.7, 5.2, 5, 4.7, 4.4, 4.3, 4, 3.7, 3.6, 3.4, 3.4, 3.5, 3.2, 3.2, 3.2, 3, 3.2, 3.1, 3, 3.1],
    pos: [4, 4.2, 4.1, 4.2, 4.4, 4.3, 4.3, 4.4, 4.3, 5.2, 6.3, 7.3, 8.6, 9.4, 10.4, 11.1, 11.4, 12.1, 12.8, 13.1, 13.6, 13.6, 13.6, 14.2, 14.2, 14.6, 15, 14.9, 15.2, 15.4],
    phases: [
      { from: 1, to: 9, name: '只排核心字', note: '平均第 4 名，點閱率 6% 以上。' },
      { from: 10, to: 20, name: '收錄大量長尾字', note: '新配對到的字多半排在 10 名以後，平均排名數字變大、點閱率變低。' },
      { from: 21, to: 30, name: '總點擊變多', note: '平均值看起來變差，但每天的點擊比第 1 天還多。' }
    ]
  },
  {
    key: 'squeeze',
    label: 'SERP 版位擠壓',
    title: 'SERP 版位擠壓（零點擊）',
    signal: '曝光和平均排名都很穩，只有點閱率和點擊從第 13 天起一起往下掉。',
    action: '不是頁面變差。先自己搜一次，看結果頁多了 AI 摘要、精選摘要還是廣告，再調整標題、描述與內容結構。',
    imp: [1480, 1520, 1490, 1530, 1530, 1470, 1510, 1490, 1490, 1550, 1510, 1520, 1530, 1470, 1520, 1530, 1510, 1570, 1520, 1500, 1540, 1490, 1530, 1570, 1520, 1560, 1530, 1500, 1550, 1530],
    ctr: [10.7, 10.7, 10.5, 10.6, 10.4, 10.4, 10.6, 10.4, 10.5, 10.5, 10.3, 10.4, 7.5, 6.3, 5.3, 5.1, 5.1, 5.1, 4.8, 4.9, 4.9, 4.8, 4.9, 4.7, 4.6, 4.6, 4.4, 4.5, 4.6, 4.4],
    pos: [2.2, 2.1, 2.1, 2.1, 2.1, 2.2, 2.2, 2.1, 2.2, 2.1, 2.1, 2.2, 2.1, 2.2, 2.2, 2.1, 2.2, 2.1, 2.1, 2.2, 2.2, 2.2, 2.2, 2.1, 2.2, 2.2, 2.2, 2.3, 2.2, 2.2],
    phases: [
      { from: 1, to: 12, name: '正常版位', note: '穩定在第 2 名，點閱率 10% 左右。' },
      { from: 13, to: 30, name: '結果頁多了 AI 摘要', note: '名次和曝光都沒變，點閱率掉到一半以下。' }
    ]
  }
]

const METRICS: { key: Metric; name: string; unit: string }[] = [
  { key: 'imp', name: '曝光次數', unit: '次' },
  { key: 'ctr', name: '點閱率（CTR）', unit: '%' },
  { key: 'pos', name: '平均排名', unit: '名，第 1 名在最上面' }
]

// 各指標 Y 軸上限的候選值，取第一個大於資料最大值 5% 以上的
const NICE: Record<Metric, number[]> = {
  imp: [100, 200, 300, 500, 800, 1000, 1500, 2000, 3000, 4000, 5000, 8000, 10000],
  ctr: [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 30],
  pos: [5, 10, 20, 30, 50, 100]
}

const current = ref(0)
const day = ref(DAYS)
const showPhases = ref(true)

const sc = computed(() => SCENARIOS[current.value])
const clicks = computed(() => sc.value.imp.map((v, i) => Math.round((v * sc.value.ctr[i]) / 100)))
const clickDiff = computed(() => clicks.value[DAYS - 1] - clicks.value[0])
const phaseIndex = computed(() => sc.value.phases.findIndex((p) => day.value >= p.from && day.value <= p.to))
const phase = computed(() => sc.value.phases[phaseIndex.value])

function fmt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
function signed(n: number): string {
  return (n > 0 ? '+' : n < 0 ? '−' : '±') + fmt(Math.abs(n))
}

const TOP = 8
const SPAN = 86
const x = (d: number) => ((d - 1) / (DAYS - 1)) * 100

function scaleOf(m: Metric, values: number[]) {
  const peak = Math.max(...values)
  const max = NICE[m].find((n) => n >= peak * (m === 'pos' ? 1 : 1.05)) ?? peak * 1.2
  if (m === 'pos') {
    const mid = max === 5 ? 3 : max / 2
    const y = (v: number) => TOP + ((v - 1) / (max - 1)) * SPAN
    return { y, ticks: [1, mid, max].map((v) => ({ v, label: '#' + v, y: y(v) })) }
  }
  const y = (v: number) => TOP + (1 - v / max) * SPAN
  const label = (v: number) => (m === 'ctr' ? v + '%' : v >= 1000 ? v / 1000 + 'k' : String(v))
  return { y, ticks: [0, max / 2, max].map((v) => ({ v, label: label(v), y: y(v) })) }
}

const charts = computed(() =>
  METRICS.map((m) => {
    const values = sc.value[m.key]
    const { y, ticks } = scaleOf(m.key, values)
    const pts = values.map((v, i) => [x(i + 1), y(v)] as const)
    const line = pts.map(([px, py], i) => (i ? 'L' : 'M') + px.toFixed(2) + ' ' + py.toFixed(2)).join(' ')
    const base = TOP + SPAN
    const area = line + ` L100 ${base} L0 ${base} Z`
    return { ...m, line, area, ticks, dotY: y(values[day.value - 1]) }
  })
)

const bands = computed(() =>
  sc.value.phases.map((p, i) => {
    const left = Math.max(0, x(p.from - 0.5))
    const right = Math.min(100, x(p.to + 0.5))
    return { ...p, n: i + 1, left, width: right - left }
  })
)

const readout = computed(() => {
  const i = day.value - 1
  return {
    imp: fmt(sc.value.imp[i]),
    ctr: sc.value.ctr[i] + '%',
    pos: String(sc.value.pos[i]),
    clicks: fmt(clicks.value[i])
  }
})

const valueText = computed(
  () => `第 ${day.value} 天：曝光 ${readout.value.imp} 次，點閱率 ${readout.value.ctr}，平均排名 ${readout.value.pos}，點擊 ${readout.value.clicks} 次`
)

function pick(i: number) {
  current.value = i
  day.value = DAYS
}

const plots = ref<HTMLElement | null>(null)
function follow(e: PointerEvent) {
  const plot = plots.value?.querySelector<HTMLElement>('.gscd__plot')
  if (!plot) return
  const r = plot.getBoundingClientRect()
  if (!r.width) return
  const t = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  day.value = Math.round(t * (DAYS - 1)) + 1
}
</script>

<template>
  <div class="gscd" :data-scenario="sc.key">
    <div class="gscd__head">
      <p class="gscd__title">GSC 30 天三指標同步診斷</p>
      <p class="gscd__desc">切換四種情境，在圖上移動或拖動下方滑桿，對照同一天的曝光、點閱率與平均排名。數字是模擬資料。</p>
    </div>

    <div class="gscd__bar">
      <div class="gscd__tabs" role="group" aria-label="選擇情境">
        <button
          v-for="(s, i) in SCENARIOS"
          :key="s.key"
          type="button"
          class="gscd__tab"
          :aria-pressed="i === current ? 'true' : 'false'"
          @click="pick(i)"
        >{{ s.label }}</button>
      </div>
      <div class="gscd__now">
        <span>目前情境：{{ sc.title }}</span>
        <label class="gscd__switch">
          <input v-model="showPhases" type="checkbox" />
          <span class="gscd__knob" aria-hidden="true"></span>
          顯示階段說明
        </label>
      </div>
    </div>

    <div class="gscd__summary">
      <div class="gscd__stat">
        <span class="gscd__k">第 30 天點擊數</span>
        <span class="gscd__big">{{ fmt(clicks[DAYS - 1]) }} <small>次</small></span>
        <span class="gscd__sub">比第 1 天 {{ signed(clickDiff) }} 次</span>
      </div>
      <div class="gscd__text">
        <span class="gscd__k">訊號判讀</span>
        <span class="gscd__v">{{ sc.signal }}</span>
      </div>
      <div class="gscd__text">
        <span class="gscd__k">建議做法</span>
        <span class="gscd__v">{{ sc.action }}</span>
      </div>
    </div>

    <div class="gscd__panel">
      <div class="gscd__readout">
        <span class="gscd__day">第 {{ day }} 天<template v-if="showPhases && phase">・{{ phase.name }}</template></span>
        <span class="gscd__nums">
          <span><i class="gscd__dot gscd__dot--imp"></i>曝光 <b>{{ readout.imp }}</b></span>
          <span><i class="gscd__dot gscd__dot--ctr"></i>點閱率 <b>{{ readout.ctr }}</b></span>
          <span><i class="gscd__dot gscd__dot--pos"></i>平均排名 <b>{{ readout.pos }}</b></span>
          <span>點擊 <b>{{ readout.clicks }}</b></span>
        </span>
      </div>

      <div ref="plots" class="gscd__plots" @pointermove="follow" @pointerdown="follow">
        <div v-for="(c, ci) in charts" :key="c.key" class="gscd__chart" :class="'gscd__chart--' + c.key">
          <div class="gscd__label">
            <span><i class="gscd__dot" :class="'gscd__dot--' + c.key"></i>{{ c.name }}</span>
            <small>單位：{{ c.unit }}</small>
          </div>
          <div class="gscd__frame">
            <div class="gscd__axis" aria-hidden="true">
              <span v-for="t in c.ticks" :key="t.v" :style="{ top: t.y + '%' }">{{ t.label }}</span>
            </div>
            <div class="gscd__plot">
              <template v-if="showPhases">
                <div
                  v-for="b in bands"
                  :key="b.n"
                  class="gscd__band"
                  :class="{ 'is-odd': b.n % 2 === 0, 'is-on': b.n - 1 === phaseIndex }"
                  :style="{ left: b.left + '%', width: b.width + '%' }"
                >
                  <span v-if="ci === 0" class="gscd__bandn">{{ b.n }}</span>
                </div>
              </template>
              <svg class="gscd__svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <line v-for="t in c.ticks" :key="t.v" class="gscd__grid" x1="0" x2="100" :y1="t.y" :y2="t.y" vector-effect="non-scaling-stroke" />
                <path class="gscd__area" :d="c.area" />
                <path class="gscd__line" :d="c.line" vector-effect="non-scaling-stroke" />
              </svg>
              <div class="gscd__cursor" :style="{ left: ((day - 1) / (DAYS - 1)) * 100 + '%' }"></div>
              <div class="gscd__pin" :style="{ left: ((day - 1) / (DAYS - 1)) * 100 + '%', top: c.dotY + '%' }"></div>
            </div>
          </div>
        </div>
        <div class="gscd__frame gscd__frame--x" aria-hidden="true">
          <div class="gscd__axis"></div>
          <div class="gscd__xaxis">
            <span v-for="d in [1, 10, 20, 30]" :key="d" :style="{ left: ((d - 1) / (DAYS - 1)) * 100 + '%' }">第 {{ d }} 天</span>
          </div>
        </div>
      </div>

      <label class="gscd__range">
        <span class="gscd__k">移動到第幾天</span>
        <input v-model.number="day" type="range" min="1" :max="DAYS" step="1" :aria-valuetext="valueText" />
      </label>
    </div>

    <ol v-if="showPhases" class="gscd__phases">
      <li v-for="b in bands" :key="b.n" :class="{ 'is-on': b.n - 1 === phaseIndex }">
        <span class="gscd__pn">{{ b.n }}</span>
        <span><b>第 {{ b.from }} 到 {{ b.to }} 天：{{ b.name }}</b>{{ b.note }}</span>
      </li>
    </ol>
  </div>
</template>

<style>
/* 互動圖的樣式（沒有 scoped，選擇器一律以 .gscd 開頭）。VitePress 的全站 CSS 只有一支，這段會併進去，所以盡量精簡。 */
.gscd {
  --gscd-imp: var(--cs-blue-500);
  --gscd-ctr: var(--cs-green-500);
  --gscd-pos: var(--cs-purple-500);
  --gscd-band: rgba(15, 21, 32, 0.045);
  --gscd-band-on: rgba(13, 110, 253, 0.1);
  margin: 1.75em 0;
  padding: 20px;
  border: var(--cs-size-border, 2px) solid var(--th-card-edge);
  border-radius: var(--cs-radius-card);
  background: var(--th-surface);
  box-shadow: var(--cs-shadow-card);
  color: var(--cs-text);
  font-size: 15px;
  line-height: 1.6;
}
html.dark .gscd {
  --gscd-imp: var(--cs-blue-300);
  --gscd-ctr: var(--cs-teal-400);
  --gscd-pos: var(--cs-purple-300);
  --gscd-band: rgba(255, 255, 255, 0.04);
  --gscd-band-on: rgba(125, 179, 255, 0.14);
}
.gscd p.gscd__title {
  margin: 0;
  font-size: 1.15em;
  font-weight: 700;
}
.gscd p.gscd__desc {
  margin: 4px 0 16px;
  color: var(--cs-text-2);
  font-size: 0.93em;
}
.gscd__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.gscd__tab {
  min-height: 40px;
  padding: 6px 14px;
  border: 2px solid var(--th-lite-edge);
  border-radius: var(--cs-radius-pill);
  background: var(--th-lite-bg);
  color: var(--th-lite-text);
  font: inherit;
  font-size: 0.93em;
  font-weight: 600;
  cursor: pointer;
}
.gscd__tab:hover {
  background: var(--th-lite-hover);
}
.gscd__tab[aria-pressed='true'] {
  border-color: var(--th-btn-edge);
  background: var(--th-btn-face);
  color: var(--th-btn-text);
}
.gscd__tab:focus-visible,
.gscd__switch input:focus-visible + .gscd__knob,
.gscd__range input:focus-visible {
  outline: 3px solid var(--th-focus);
  outline-offset: 2px;
}
.gscd__now {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--cs-line);
  color: var(--cs-text-2);
  font-size: 0.9em;
}
.gscd__switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.gscd__switch input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
}
.gscd__knob {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 11px;
  background: var(--cs-line-2);
  transition: background 0.15s;
}
.gscd__knob::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s;
}
.gscd__switch input:checked + .gscd__knob {
  background: var(--th-btn-face);
}
.gscd__switch input:checked + .gscd__knob::after {
  transform: translateX(16px);
}
.gscd__summary {
  display: grid;
  grid-template-columns: minmax(130px, 0.8fr) 1fr 1fr;
  gap: 16px;
  margin: 16px 0;
  padding: 16px;
  border-radius: var(--cs-radius-tile);
  background: var(--cs-section);
}
.gscd__summary > div,
.gscd__range {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.gscd__k {
  color: var(--cs-mute);
  font-size: 0.82em;
  font-weight: 600;
}
.gscd__big {
  font-size: 1.9em;
  font-weight: 700;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}
.gscd__big small {
  font-size: 0.5em;
}
.gscd__sub {
  color: var(--cs-text-2);
  font-size: 0.85em;
}
.gscd__v {
  font-size: 0.93em;
}
.gscd__panel {
  padding: 14px;
  border: 1px solid var(--cs-line);
  border-radius: var(--cs-radius-tile);
}
.gscd__readout {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
  margin-bottom: 8px;
  padding: 8px 12px;
  border-radius: var(--cs-radius-sm);
  background: var(--cs-section);
  font-size: 0.9em;
}
.gscd__day {
  font-weight: 700;
}
.gscd__nums {
  display: flex;
  flex-wrap: wrap;
  gap: 2px 14px;
  color: var(--cs-text-2);
  font-variant-numeric: tabular-nums;
}
.gscd__nums b {
  color: var(--cs-text);
}
.gscd__dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  margin-right: 6px;
  border-radius: 50%;
  vertical-align: 0.05em;
}
.gscd__dot--imp { background: var(--gscd-imp); }
.gscd__dot--ctr { background: var(--gscd-ctr); }
.gscd__dot--pos { background: var(--gscd-pos); }
.gscd__plots {
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;
}
.gscd__chart + .gscd__chart {
  margin-top: 10px;
}
.gscd__label {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 0.88em;
  font-weight: 600;
}
.gscd__label small {
  color: var(--cs-mute);
  font-weight: 400;
}
.gscd__frame {
  display: grid;
  grid-template-columns: 40px 1fr;
}
.gscd__axis {
  position: relative;
  color: var(--cs-mute);
  font-family: var(--th-font-mono);
  font-size: 11px;
}
.gscd__axis span {
  position: absolute;
  right: 6px;
  transform: translateY(-50%);
  line-height: 1;
}
.gscd__plot {
  position: relative;
  height: 110px;
  border-radius: 6px;
  cursor: crosshair;
}
.gscd__band {
  position: absolute;
  top: 0;
  bottom: 0;
  border-left: 1px dashed var(--cs-line-2);
}
.gscd__band:first-child {
  border-left: 0;
}
.gscd__band.is-odd {
  background: var(--gscd-band);
}
.gscd__band.is-on {
  background: var(--gscd-band-on);
}
.gscd__bandn {
  position: absolute;
  top: 2px;
  left: 50%;
  transform: translateX(-50%);
  display: grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--th-surface);
  border: 1px solid var(--cs-line-2);
  color: var(--cs-text-2);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}
.gscd__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  overflow: visible;
}
.gscd__grid {
  stroke: var(--cs-line);
  stroke-width: 1;
}
.gscd__line {
  fill: none;
  stroke-width: 2.25;
  stroke-linejoin: round;
  stroke-linecap: round;
}
.gscd__area {
  opacity: 0.14;
}
.gscd__chart--imp .gscd__line { stroke: var(--gscd-imp); }
.gscd__chart--imp .gscd__area { fill: var(--gscd-imp); }
.gscd__chart--ctr .gscd__line { stroke: var(--gscd-ctr); }
.gscd__chart--ctr .gscd__area { fill: var(--gscd-ctr); }
.gscd__chart--pos .gscd__line { stroke: var(--gscd-pos); }
.gscd__chart--pos .gscd__area { fill: var(--gscd-pos); }
.gscd__cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 0;
  border-left: 1px solid var(--cs-text-2);
  pointer-events: none;
}
.gscd__pin {
  position: absolute;
  width: 11px;
  height: 11px;
  margin: -5.5px 0 0 -5.5px;
  border: 2px solid var(--th-surface);
  border-radius: 50%;
  pointer-events: none;
}
.gscd__chart--imp .gscd__pin { background: var(--gscd-imp); }
.gscd__chart--ctr .gscd__pin { background: var(--gscd-ctr); }
.gscd__chart--pos .gscd__pin { background: var(--gscd-pos); }
.gscd__frame--x {
  margin-top: 4px;
}
.gscd__xaxis {
  position: relative;
  height: 16px;
  color: var(--cs-mute);
  font-size: 11px;
}
.gscd__xaxis span {
  position: absolute;
  transform: translateX(-50%);
  white-space: nowrap;
  line-height: 16px;
}
.gscd__xaxis span:first-child {
  transform: none;
}
.gscd__xaxis span:last-child {
  transform: translateX(-100%);
}
.gscd__range {
  margin-top: 12px;
}
.gscd__range input {
  width: 100%;
  margin: 4px 0 0;
  accent-color: var(--cs-primary);
}
.gscd ol.gscd__phases {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
  font-size: 0.9em;
}
.gscd__phases li {
  display: flex;
  gap: 10px;
  margin: 0;
  padding: 6px 8px;
  border-radius: var(--cs-radius-sm);
  color: var(--cs-text-2);
}
.gscd__phases li.is-on {
  background: var(--gscd-band-on);
  color: var(--cs-text);
}
.gscd__phases b {
  margin-right: 4px;
  color: var(--cs-text);
}
.gscd__pn {
  flex: none;
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  border-radius: 50%;
  border: 1px solid var(--cs-line-2);
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}
@media (max-width: 640px) {
  .gscd {
    padding: 14px;
    font-size: 14px;
  }
  .gscd__summary {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px;
  }
  .gscd__panel {
    padding: 10px;
  }
  .gscd__frame {
    grid-template-columns: 34px 1fr;
  }
  .gscd__plot {
    height: 96px;
  }
}
</style>
