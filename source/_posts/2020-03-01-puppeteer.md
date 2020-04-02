---
layout: post
title: 爬蟲、E2E 測試兩相宜的好工具 - Puppeteer
category: development
tagline:
tags: [test, puppeteer]
cssdemo:
jsdemo:
thumbnail:
photo: https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202003%2Fimg-puppeteer.png?alt=media&token=42d44728-9eaf-42b3-8be2-fd62d0795dd0
published: true
---

Puppeteer 是 Node.js 的函式庫，它提供各種 API 來控制 Chrome 或 Chromium 瀏覽器，而此瀏覽器也是目前主流的瀏覽器，用來做為測試、爬蟲都相當合適，並且所提供的 API 語法淺顯易懂，只要具有 jQuery 的使用經驗就可以很快速地上手。

## 安裝
官方提供兩個版本，一個包含 Chromium，另一個則無，如果有安裝 Chrome 的情況下可以不需要另外下載 Chromium，直接運行本機的應用程式即可（選擇輕量 headless 模式運行一樣很快）。

所以可以採用以下語法加入設定後跳過下載（或者也可以直接使用 puppeteer-core）：
```
npm config set puppeteer_skip_chromium_download true
```

下載 Puppepeer
```
npm i puppeteer 
```


接下來可以新增一個檔案 `test.js`，使用官方提供的範例：
```js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();
```

執行 `node test.js` 則會出現錯誤，主要原因是沒有下載 Chromium，這部分可以手動設置自己的 Chrome 使用。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202003%2FD4B77A61-3F06-4F76-8B5E-2D91D9BFE0D9.png?alt=media&token=225e5015-189e-4933-bbf3-1960d22196b2)

接下來將上述原始碼中的 `browser` 變數改為如下即可運行，
```js
const browser = await puppeteer.launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false
  });
```
Windows 路徑可參考：
```
'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
```

重新執行一次上述的原始碼，則可以發現快速打開了 Chrome 後就關閉了瀏覽器，打開你的專案資料夾可以發現多了一張圖片，在這個過程中 Chrome 已經依據腳本完成了流程，因此來看一下剛剛發生了什麼事：

1. 打開瀏覽器
2. 開啟新的分頁
3. 進入特定的網址
4. 截圖，並把圖片存到特定的路徑

在這個流程下大致就能體會到 Puppeteer 是怎樣的工具，它可以模擬用戶的行為對瀏覽器操作，因此只要熟悉的它的語法做到爬蟲、測試都不會有太大的問題。

```js
const puppeteer = require('puppeteer-core');

(async () => {
  // 使用自訂的 Chrome
  const browser = await puppeteer.launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false // 無外殼的 Chrome，有更佳的效能
  });
  const page = await browser.newPage(); // 開啟新分頁
  await page.goto('https://example.com'); // 進入指定頁面
  await page.screenshot({ path: 'example.png' }); // 截圖，並且存在...

  await browser.close(); // 關閉瀏覽器
})();
```

![資料夾內可以看到執行截圖的畫面](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202003%2F5E922289-CABB-4762-87E7-FC088B2C80E3.png?alt=media&token=0e75f79e-b0ad-44e0-a591-b2bb527f09c7)


## 基礎方法說明

中文文件：https://zhaoqize.github.io/puppeteer-api-zh_CN/#/

Puppeteer 大部分的行為都是非同步的（都是 Promise 的方法），因為無法確認網頁點擊後多久後開啟，也無法確認輸入文字需要多長的時間，而 Promise 搭配 async、await 就能將程式碼轉成類似於同步的語言。

所以使用 Puppeteer 時會看到很多 `await ...`，目的是要確保原始碼可以依序執行，因此以下介紹的方式也都建議都加上 await。

### 常見方法
可以先思考下載網頁中通常會進行哪些行為，不外乎就是：
- 點擊連結
- 填寫表單
- 進入特定頁面，確保資訊有出現

這些方法在文件中都是在文件中的 `page` 找到（所有的頁面行為基本上都在這），以下列出常見的方法給大家參考：

- `page.goto(url[, options])`：直接進入特定的連結頁面
- `page.$(selector)`：選取特定元素，等同於 document.querySelector
- `page.$$(selector)`：前者的複數型，等同於 document.querySelectorAll
- `page.$eval(selector, pageFunction[, ...args])`：對於選取的元素進行特定行為，如取出元素的 HTML 屬性值。
- `page.$$eval(selector, pageFunction[, ...args])`：前者的複數型
- `page.click(selector[, options])`：點擊特定的元素
- `page.type(selector, text[, options])`：在特定的元素上輸入文字內容，通常是 input 上輸入
- `page.select(selector, ...values)`：在 select 元素上選取特定的值
- `page.waitForSelector(selector[, options])`：等待頁面上的特定元素出現，在非同步的過程中很實用。

方法中可以看到 selector 不斷的出現，selector 即是畫面上的元素選取方式，因為它可以模擬用戶的行為，所以 selector 的選取技巧在此工具中是非常重要的。

### Selector 技巧

選取器是遵循 `document.querySelector` 的規則，基本上就是與撰寫 CSS 時的方式一致（所以才會提到熟悉 jQuery 會非常有幫助），在選擇元素的過程中，最準確的是 id（一個網頁原則上只有一個 id），所以直接的方式就是使用 id 選擇該元素。

```js
page.click('#button'); // 點擊網頁中 id 為 button 的元素
```

但許多時候網頁元素是沒有 id 的，那麼就可以搭配 Chrome 的開發者工具直接抓出特定元素選取器。

![](https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202003%2F%E8%B2%BC%E4%B8%8A%E7%9A%84%E5%BD%B1%E5%83%8F_2020_2_27_%E4%B8%8A%E5%8D%8811_11.png?alt=media&token=d56adac1-47a2-45e4-85c6-4dac5bab5965)

如上圖，在特定的元素上按下右鍵 > Copy > Copy selector，接下來就可以取得絕對的元素路徑（頁面必須維持在固定的狀態）。
```
#tsf > div:nth-child(2) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input
```

另外一種方式，如果確定元素具有特定的 HTML 屬性時，也可以使用以下的方式選取，這種寫法是使用 CSS 的屬性選取器。
```js
await page.$('input[title="Google 搜尋"]')); // 可以選到標籤屬性為 title="Google 搜尋" 的項目
```

## 流程實戰

最後，透過 Google 搜尋特定的文字，並且進入特定頁面的方式，規劃一個簡單的流程，來測試是否可以正確運行，流程如下：

1. 開啟 Google 頁面
2. 搜尋 `flex` 文字並送出
3. 轉址進入搜尋結果頁面
4. 點選具有 `https://wcc723.github.io` 的頁面

```js
const puppeteer = require('puppeteer-core');

(async () => {
  // 使用自訂的 Chrome
  const browser = await puppeteer.launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false // 無外殼的 Chrome，有更佳的效能
  });
  const page = await browser.newPage(); // 開啟新分頁
  await page.waitFor(10000); // 等待十秒鐘（給我開錄影工具用的）
  await page.goto('https://www.google.com.tw'); // 進入指定頁面
  await page.type('input[title="Google 搜尋"]', 'flex'); // Google 搜尋特定項目
  await (await page.$('input[title="Google 搜尋"]')).press('Enter'); // 特定元素上按下 Enter
  await page.waitFor(1000); // 等待一秒
  await page.waitForSelector('#gsr'); // 確定網頁的元素出現
  await page.click( // 點擊網址中包含以下的連結...
    'a[href*="https://wcc723.github.io"]');

  // 接下來也可插入 await browser.close(); 關閉瀏覽器
})();
```

在上述的範例中 `href*="https://wcc723.github.io"]` 是選取網址中**包含** `https://wcc723.github.io` 的連結，


{% raw %}
<video width="320" height="240" controls autoplay>
  <source src="https://firebasestorage.googleapis.com/v0/b/casper-de5d5.appspot.com/o/images%2Fblog%2F202003%2FMar-01-2020%2013-26-52.mp4?alt=media&token=d586a299-a888-4084-932b-cfbf569bfb5a" type="video/mp4">
Your browser does not support the video tag.
</video>
{% endraw %}

> 運行中的畫面

參考資料：
- Google 提供的範例：https://developers.google.com/web/tools/puppeteer/examples
- 中文文件：https://zhaoqize.github.io/puppeteer-api-zh_CN/#/
- Chrome 與 Chromium 差異：https://www.howtogeek.com/202825/what%E2%80%99s-the-difference-between-chromium-and-chrome/