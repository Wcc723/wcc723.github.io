<script setup lang="ts">
// 〈GSC 數字背後的運作概念〉/development/2026/11/19/gemini-gsc-seo-diagnosis/ 的 Navboost 概念圖。
// 純展示、沒有狀態：用 HTML 與 CSS 排（不用一張大 SVG），手機上字不會跟著縮小，深色模式也跟著主題變數換色。
// 內容依 SEO 圈常見的解讀整理，圖說寫明 Google 沒有公開細節（站長 2026-11-20：文章不提司法部出處）。
</script>

<template>
  <figure class="nbd">
    <p class="nbd__title">Navboost 行為回饋的概念圖</p>
    <div class="nbd__flow">
      <div class="nbd__loop" aria-hidden="true"><span>下一輪曝光</span></div>
      <div class="nbd__steps" role="list">
        <div class="nbd__step" role="listitem">
          <span class="nbd__n">1</span>
          <div class="nbd__body">
            <b>曝光</b>
            <span>頁面出現在搜尋結果。新頁或剛改版的頁面，會先拿到一些測試曝光。</span>
          </div>
        </div>
        <div class="nbd__arrow" aria-hidden="true"></div>
        <div class="nbd__step" role="listitem">
          <span class="nbd__n">2</span>
          <div class="nbd__body">
            <b>點擊</b>
            <span>使用者從搜尋結果點進網頁。</span>
          </div>
        </div>
        <div class="nbd__arrow" aria-hidden="true"></div>
        <div class="nbd__step nbd__step--fork" role="listitem">
          <span class="nbd__n">3</span>
          <div class="nbd__pair">
            <div class="nbd__card nbd__card--good">
              <b>長點擊</b>
              <span>停留夠久，沒有回搜尋頁改點別人</span>
              <em>好訊號</em>
            </div>
            <div class="nbd__card nbd__card--bad">
              <b>快速跳出</b>
              <span>幾秒就按上一頁，改點下一個結果</span>
              <em>壞訊號</em>
            </div>
          </div>
        </div>
        <div class="nbd__arrow" aria-hidden="true"></div>
        <div class="nbd__step nbd__step--core" role="listitem">
          <span class="nbd__n">4</span>
          <div class="nbd__body">
            <b>Navboost</b>
            <span>累積大約 13 個月的點擊與互動資料，依地區、裝置分開看。</span>
          </div>
        </div>
        <div class="nbd__arrow" aria-hidden="true"></div>
        <div class="nbd__step" role="listitem">
          <span class="nbd__n">5</span>
          <div class="nbd__body">
            <b>調整名次</b>
            <span>好訊號多就站穩、往上；壞訊號多就慢慢往下掉。新的名次決定下一輪拿到多少曝光。</span>
          </div>
        </div>
      </div>
    </div>
    <figcaption class="nbd__cap">Google 沒有公開實際的計算方式，這張圖是依 SEO 圈常見的解讀整理的概念。</figcaption>
  </figure>
</template>

<style>
/* Navboost 概念圖（沒有 scoped，選擇器一律以 .nbd 開頭）。VitePress 的全站 CSS 只有一支，這段會併進去，所以盡量精簡。 */
.nbd {
  --nbd-good-bg: var(--cs-green-50, #E8F3EE);
  --nbd-good-edge: var(--cs-green-200, #A3CFBB);
  --nbd-good-text: var(--cs-green-700, #0F5132);
  --nbd-bad-bg: var(--cs-red-50);
  --nbd-bad-edge: var(--cs-red-200);
  --nbd-bad-text: var(--cs-red-700);
  --nbd-core-bg: var(--cs-blue-50);
  --nbd-core-edge: var(--cs-blue-200);
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
html.dark .nbd {
  --nbd-good-bg: rgba(71, 159, 118, 0.14);
  --nbd-good-edge: rgba(71, 159, 118, 0.45);
  --nbd-good-text: #8FD3B0;
  --nbd-bad-bg: rgba(227, 93, 106, 0.13);
  --nbd-bad-edge: rgba(227, 93, 106, 0.45);
  --nbd-bad-text: #F1AEB5;
  --nbd-core-bg: #13233A;
  --nbd-core-edge: #3E5F92;
}
.nbd p.nbd__title {
  margin: 0 0 14px;
  font-size: 1.1em;
  font-weight: 700;
}
.nbd__flow {
  position: relative;
  padding-left: 40px;
}
/* 左邊的虛線括號：從第 5 步繞回第 1 步，表示新的名次決定下一輪曝光 */
.nbd__loop {
  position: absolute;
  top: 26px;
  bottom: 30px;
  left: 8px;
  width: 22px;
  border: 2px dashed var(--cs-mute);
  border-right: 0;
  border-radius: 14px 0 0 14px;
}
.nbd__loop::after {
  content: '';
  position: absolute;
  top: -7px;
  right: -9px;
  border: 6px solid transparent;
  border-left: 9px solid var(--cs-mute);
}
.nbd__loop span {
  position: absolute;
  top: 50%;
  left: -9px;
  transform: translateY(-50%);
  padding: 4px 0;
  background: var(--th-surface);
  color: var(--cs-mute);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  writing-mode: vertical-rl;
  white-space: nowrap;
}
.nbd__step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid var(--cs-line-2);
  border-radius: var(--cs-radius-tile);
  background: var(--th-surface);
}
.nbd__step--core {
  border-color: var(--nbd-core-edge);
  background: var(--nbd-core-bg);
}
.nbd__step--fork {
  padding: 10px;
}
.nbd__n {
  flex: none;
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  margin-top: 1px;
  border-radius: 50%;
  background: var(--cs-section);
  border: 1px solid var(--cs-line-2);
  color: var(--cs-text-2);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}
.nbd__body,
.nbd__card {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.nbd__body b,
.nbd__card b {
  font-size: 1em;
}
.nbd__body span,
.nbd__card span {
  color: var(--cs-text-2);
  font-size: 0.9em;
}
.nbd__pair {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  min-width: 0;
}
.nbd__card {
  padding: 8px 12px;
  border: 1px solid;
  border-radius: var(--cs-radius-sm);
}
.nbd__card em {
  margin-top: 4px;
  font-size: 0.82em;
  font-style: normal;
  font-weight: 700;
}
.nbd__card--good {
  border-color: var(--nbd-good-edge);
  background: var(--nbd-good-bg);
}
.nbd__card--good em {
  color: var(--nbd-good-text);
}
.nbd__card--bad {
  border-color: var(--nbd-bad-edge);
  background: var(--nbd-bad-bg);
}
.nbd__card--bad em {
  color: var(--nbd-bad-text);
}
/* 步驟之間往下的箭頭 */
.nbd__arrow {
  position: relative;
  height: 22px;
}
.nbd__arrow::before {
  content: '';
  position: absolute;
  top: 3px;
  bottom: 8px;
  left: 50%;
  width: 2px;
  margin-left: -1px;
  background: var(--cs-mute);
}
.nbd__arrow::after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: 50%;
  margin-left: -6px;
  border: 6px solid transparent;
  border-top: 8px solid var(--cs-mute);
  border-bottom: 0;
}
.nbd figcaption.nbd__cap {
  margin: 14px 0 0;
  color: var(--cs-mute);
  font-size: 0.85em;
  text-align: left;
}
@media (max-width: 640px) {
  .nbd {
    padding: 14px;
    font-size: 14px;
  }
  .nbd__flow {
    padding-left: 34px;
  }
  .nbd__loop {
    left: 5px;
    width: 18px;
  }
  .nbd__step {
    padding: 10px;
    gap: 10px;
  }
  .nbd__pair {
    gap: 8px;
  }
  .nbd__card {
    padding: 8px 10px;
  }
}
</style>
