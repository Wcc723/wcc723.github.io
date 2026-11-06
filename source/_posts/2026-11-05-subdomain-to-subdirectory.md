---
layout: post
title: 子網域整併至子目錄：用 Cloudflare Workers 架構多專案與搬遷踩雷
category: development
tagline:
tags: [Cloudflare, seo, vite]
description: 為了集中流量並簡化 GA4 與登入設定，我把口袋工具各子站從子網域搬遷至單一網域子目錄。這篇記錄如何透過 Cloudflare Workers 路由與 Vite 設定，讓十多個獨立專案共用網域，並聊聊搬遷後流量受影響的真實代價。
cssdemo:
jsdemo:
thumbnail: https://img.casper.tw/posts/2026-11-05-subdomain-to-subdirectory/cover.png
photo:
published: true
---

我在做口袋工具的時候，一開始的想法很單純：一個工具一個 repo，一個 repo 一個子網域。口袋工具是我下班後陸續做的一組小工具，像是[社畜人生計算機](https://www.pocketool.app/compound-calculator/)、[台灣郵遞區號查詢](https://www.pocketool.app/tools/zipcode)、QR Code 製造機，以前每一個都有自己的子網域，看起來就像好幾個各自獨立的小站。

結果笑死，因為每一個網域分開算，所以流量幾乎沒有辦法累積 😅

<!-- more -->

## 我為什麼要把子網域搬成子路徑

工具越做越多之後，我把它們全部搬到同一個網域底下的子路徑（也就是常說的子目錄）：

```txt
搬遷前
https://compound-calculator.pocketool.app/
https://zipcode.pocketool.app/

搬遷後
https://www.pocketool.app/compound-calculator/
https://www.pocketool.app/zipcode/
```

![搬遷前後的網址對照：四個子網域 301 到同一個網域底下的四條子路徑](https://img.casper.tw/posts/2026-11-05-subdomain-to-subdirectory/fig1-url.webp)

乍看只是網址換個寫法，但我真正想解決的是三件事。

第一件是 SEO：但站群剛起步、外部連結很少的時候，透過集中在同一個網域下，SEO 的累積速度會比較快。

第二件是設定一直重複：每多一個子網域，GA4 就多一份要設定的資源，Google 登入也要多登記一個允許的來源（OAuth 的「已授權 JavaScript 來源」），每次新增都要多一道流程，說實在在管理上面很麻煩。

第三件是我觀察別人的做法：我看過一些老站，會把許多工具集結在同一個站點。那這樣的話，流量也會比較集中。

所以我的目標是：程式碼照樣分開，每個工具還是自己的 repo、自己部署；但對外，大家都住在 `www.pocketool.app/<slug>/`。

會選在那個時間點搬：是整個網域在 Google Search Console 30 天幾乎沒什麼流量，我希望在流量大量累積之前先把網站給搬好。

## 讓 Cloudflare 的路由優先權自己分流

Cloudflare 本來就有的兩種綁定方式：

- **Custom Domain**：把整個主機名交給一支 Worker。主站綁 `www.pocketool.app`，當作最後的兜底。
- **Zone Route**：把「某個網址樣式」指給某支 Worker，例如 `www.pocketool.app/zipcode*`。每個工具掛自己的兩條。

關鍵在順序。Cloudflare 的文件說，綁在 Custom Domain 上的 Worker 會被當成「源站」，route 上的 Worker 會在它之前先跑。所以請求進來時，先看有沒有工具的 Zone Route 命中，命中就直接由那個工具回應；都沒命中，才落到主站。整個過程沒有任何一行轉發程式。

![請求進到 Cloudflare 之後的分流順序：舊子網域先 301，接著 Zone Route 把工具路徑交給各自的 Worker，都沒攔到才落到主站的 Custom Domain](https://img.casper.tw/posts/2026-11-05-subdomain-to-subdirectory/fig2-cloudflare.webp)

以社畜人生計算機為例，它的 `wrangler.jsonc` 只要這樣寫：

```json
"routes": [
  { "pattern": "www.pocketool.app/compound-calculator*", "zone_name": "pocketool.app" },
  { "pattern": "www.pocketool.app/compound-calculator/*", "zone_name": "pocketool.app" }
],
"workers_dev": false
```

舊的子網域則交給 Cloudflare 的 Bulk Redirects（大量重新導向）處理，一個工具一列，例如 `zipcode.pocketool.app/` 301 到 `https://www.pocketool.app/zipcode/`。301 是告訴瀏覽器和搜尋引擎「這個網址永久搬家了」。用清單而不是一站一條轉址規則，是因為七個站搬完也只佔一條規則的額度。

## 子站這邊：讓打包出來的資料夾，長得跟網址一模一樣

Cloudflare 那邊分好流之後，子站要做的事其實不多，核心只有一個想法：讓 `dist` 裡的檔案路徑，跟線上的網址路徑一一對齊。

```ts
// vite.config.ts
export default defineConfig({
  base: '/compound-calculator/',
  build: {
    outDir: 'dist/compound-calculator',
  },
})
```

`base` 讓 Vite 產生的資產網址都帶上 `/compound-calculator/` 前綴；`outDir` 讓打包結果放在 `dist/compound-calculator/`。`wrangler.jsonc` 的資產目錄則維持 `./dist`：

```json
"assets": {
  "directory": "./dist",
  "html_handling": "auto-trailing-slash",
  "not_found_handling": "404-page"
}
```

這樣線上的 `/compound-calculator/fire` 就剛好對到 `dist/compound-calculator/fire.html`。Cloudflare 不用知道任何前綴規則，照著資料夾找檔案就好，子站也不用寫任何 Worker 程式。

Static Assets 本身怎麼部署（`wrangler.jsonc` 的欄位、綁自訂網域、404 怎麼處理），我之前另外寫過一篇：[Cloudflare Workers Static Assets 部署靜態網站實戰](https://www.pocketool.app/blog/cloudflare-workers-static-assets-deploy)。

## 10 個獨立的 repo，分開管理開發更快速

現在掛在 `www.pocketool.app` 底下的，有主站、各個工具，還有一個問題回報服務，加起來十來個 repo。每個 repo 還是各自 push、各自由 Cloudflare Workers Builds 建置部署。某個工具壞掉或改版，都不會牽動其他站。

![每個工具是獨立的 repo，各自 git push、各自建置成 Worker，對外都在同一個網域底下；robots.txt、GA4 與共用頁尾統一管理](https://img.casper.tw/posts/2026-11-05-subdomain-to-subdirectory/fig3-projects.webp)

讓它們看起來像同一個網站，主要是靠以下三個方法：

第一件是根目錄的檔案統一由主站提供。搜尋引擎只會讀網域根目錄的 `robots.txt`，AdSense 也只讀根目錄的 `ads.txt`，放在子路徑底下的沒有人會看。所以子站把這兩個檔刪掉，改由主站的 `robots.txt` 把每個工具的 sitemap 列出來：

```txt
User-agent: *
Allow: /

Sitemap: https://www.pocketool.app/sitemap.xml
Sitemap: https://www.pocketool.app/compound-calculator/sitemap.xml
Sitemap: https://www.pocketool.app/qrcode-studio/sitemap.xml
Sitemap: https://www.pocketool.app/kaomoji/sitemap.xml
Sitemap: https://www.pocketool.app/zipcode/sitemap.xml
```

> 結果我的 Adsense 還沒過 😂

第二件是 GA4 改成全站共用一個 property，再用 `content_group` 區分是哪個工具。郵遞區號站送出去的設定長這樣：

```javascript
gtag('config', GA_ID, { content_group: 'zipcode' })
```

這樣同一個人從首頁逛到工具，就是同一段連續的瀏覽，首頁帶了多少人進工具終於量得出來，內部流量排除這些設定也只要做一次。

Google 登入也是同樣的道理：全站共用一個 OAuth Client，允許來源只要登記 `https://www.pocketool.app` 一個，新工具要做登入就直接沿用。

第三件是共用頁尾。我希望每個工具底下都有同一份頁尾，可以互相連到其他工具。但 Workers Builds 每次只會 clone 那一個 repo，所以頁尾不能做成「大家去引用某個共用資料夾」的形式，每個 repo 都要能自己建置。

我的做法是在一個專門管站群的 workspace 裡放一份正本：一個 Vue 元件、一份資料檔、一支檢查用的稽核，再用腳本把它原樣拷貝進每個 repo。樣式可以各站不同，但結構和連結只有一份，各站建置或測試時會用那支稽核檢查頁尾有沒有走樣。要新增一個工具，就是改正本再全部同步一次。

## 實戰心得：適合一個人同時顧很多專案

這樣的優點，就是讓同一個大站底下的子站都可以分開管理。

但不得不說，真的不要隨意更改你的網域，因為這樣會大幅降低你在搜尋引擎的權重。雖然我在流量還很小的時候就搬，但是我透過各種方式檢視，發現其實那次的搬移已經大幅影響到後續的流量。

![Bing Webmaster 近 30 天的點擊與曝光趨勢](https://img.casper.tw/posts/2026-11-05-subdomain-to-subdirectory/bing-traffic.webp)

> Bing Webmaster 的流量圖

以目前來講的話，我在 Bing Webmaster 的流量，還大幅高於在 Google 上面的流量。這種情況說實在也是非常罕見的。
