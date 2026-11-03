<script setup lang="ts">
// 頁尾：連結組照計畫「導覽」一節，工具組 0 支時整組不輸出；最後一行是署名
import { SITE_NAME } from '../shared/shell/site.mjs'
import { footerGroups, isExternal } from '../utils/nav.mjs'
import { liveTools } from '../tools.mjs'
import GhostImg from './GhostImg.vue'

const groups = footerGroups({ tools: liveTools() })
</script>

<template>
  <footer class="site-footer">
    <div class="wrap">
      <div class="site-footer__top">
        <div class="site-footer__brand">
          <span class="site-footer__name">
            <GhostImg name="logo" :width="28" small />
            {{ SITE_NAME }}
          </span>
          <p class="site-footer__tagline">卡斯伯的前端筆記，從 2013 年寫到現在。</p>
        </div>
        <div class="site-footer__groups">
          <nav v-for="g in groups" :key="g.key" class="footer-group" :aria-label="g.title">
            <h2 class="footer-group__title">{{ g.title }}</h2>
            <ul class="footer-group__list">
              <li v-for="l in g.links" :key="l.href">
                <a :href="l.href">
                  {{ l.text }}
                  <svg v-if="isExternal(l.href)" class="footer-group__ext" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M7 17L17 7M9 7h8v8" />
                  </svg>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <p class="site-footer__copy">© 卡斯伯，<a href="/about/">{{ SITE_NAME }}</a></p>
    </div>
  </footer>
</template>
