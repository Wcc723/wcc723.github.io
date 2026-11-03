<script setup>
// 〈一個工具，帶你完整認識 CSS Animation〉/development/2021/10/04/css-animation/ 文末的「動手試試看」。
// 原本在文章裡用 unpkg 的 vue@next 掛一個 Vue app（#app），這裡改寫成元件，模板與資料照原文，不再載入 unpkg。
// 跟原本的差別：
// - 根元素不用 id="app"（VitePress 的根元素已經是 #app），改用 class。
// - 下拉選單的值直接寫進 inline style 的 animation-name，所以 @keyframes 不能被 scoped 改名，
//   放在下面沒有 scoped 的 <style>；文章本身的 .box、.rotate、.move 樣式在文章的 <style scoped> 裡。
// - Hexo 的版面沒有載入 Bootstrap，row、col 這些 class 原本沒有作用，這裡補上簡單的兩欄排版。
import { reactive } from 'vue'

const animationStyle = reactive({
  animationName: {
    name: 'animation-name',
    description: '*動畫所套用的 keyframe 名稱',
    properties: ['rotate-keyframe', 'move-object']
  },
  animationDuration: {
    name: 'animation-duration',
    description: '*動畫持續時間',
    properties: ['1s', '3s', '500ms', 'alternate-reverse']
  },
  animationIterationCount: {
    name: 'animation-iteration-count',
    description: '*動畫播放次數',
    properties: ['1', '3', '1.5', 'infinite']
  },
  animationTimingFunction: {
    name: 'animation-timing-function',
    description: '動畫轉換時的加速曲線',
    properties: ['ease', 'ease-in', 'ease-out', 'linear', 'steps(5, end)', 'cubic-bezier(.4,.94,.56,1.59)']
  },
  animationDirection: {
    name: 'animation-direction',
    description: '動畫向前，或是反轉播放',
    properties: ['normal', 'reverse', 'alternate', 'alternate-reverse']
  },
  animationPlayState: {
    name: 'animation-play-state',
    description: '動畫播放的狀態',
    properties: ['running', 'paused']
  },
  animationFillMode: {
    name: 'animation-fill-mode',
    description: '定義播放以外的時間的呈現狀態',
    properties: ['none', 'forwards', 'backwards', 'both']
  },
  animationDelay: {
    name: 'animation-delay',
    description: '第一次播放動畫延遲時間',
    properties: ['0', '1s', '2s', 'initial']
  }
})

const selectProperties = reactive({
  'animation-name': 'rotate-keyframe',
  'animation-duration': '3s',
  'animation-iteration-count': 'infinite',
  'animation-timing-function': 'linear'
})
</script>

<template>
  <div class="css-animation-demo">
    <div class="row row-cols-lg-2 gy-2 gx-3">
      <div v-for="(ani, key) in animationStyle" :key="key" class="col">
        <label :for="key">{{ ani.name.replace('animation-', '') }} <small>({{ ani.description }})</small></label>
        <select :id="key" v-model="selectProperties[ani.name]" class="form-select">
          <option value="">不設定</option>
          <option v-for="item in ani.properties" :key="`${item}property`" :value="item">
            {{ item }}
          </option>
        </select>
      </div>
    </div>
    <div class="demo my-3">
      <div class="box" :style="selectProperties"></div>
    </div>

    <p>運作時所套用的 CSS 程式碼</p>
    <pre class="hljs"><code class="hljs">.animation {
<template v-for="(item, key) in selectProperties" :key="key"><div v-if="item">  {{ key }}: {{ item }};</div></template>}
@keyframes rotate-keyframe {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes move-object {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(200%);
  }
}</code></pre>
  </div>
</template>

<style>
/* 下拉選單把名稱直接寫進 inline style，keyframes 必須是原本的名稱（不能 scoped）；名稱只有這個示範用到 */
@keyframes rotate-keyframe {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes move-object {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(200%);
  }
}
</style>

<style scoped>
.row {
  display: grid;
  gap: 0.5rem 0.75rem;
}
@media (min-width: 992px) {
  .row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.col label {
  display: block;
}
.form-select {
  width: 100%;
}
.my-3 {
  margin-block: 1rem;
}
</style>
