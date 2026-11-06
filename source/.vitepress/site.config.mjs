// 部落格的站台設定。外語首頁的語系、外殼模式都只寫在這裡（主站首頁規格 B.5）。
// 只用標準 JavaScript：config.mts、[locale]/index.paths.mjs、scripts/、測試都直接 import。
// 驗證在 lib/site-home.mjs 的 validateSiteConfig()，config 載入時跑，錯了建置就失敗。
export default {
  // 'legacy'：部落格自己的頁首頁尾（P1、P2）；'shared'：shared/shell 的共用元件（S 版起）。
  // S 穩定後刪掉 legacy 元件與這個欄位（K.3）
  shell: 'shared',
  home: {
    // 外語首頁文案的正本語系（I.1）
    sourceLocale: 'en',
    // 優先順序（站長 2026-11-04：「英文、日文、韓文、德文 這些語言優先」，簡中與西文之後）。
    // 這些語系都能用 npm run build:preview 在本機看草稿；正式產物只看 locales
    roadmap: ['en', 'ja', 'ko', 'de', 'zh-cn', 'es'],
    // 正式開放的語系。一次加一個，加的那一版就是那個語系的上線版（GSC 記註記）。
    // 列進來的語系一定要通過 C.2 的全部關卡，否則建置失敗；上線後不能拿掉（B.1）
    locales: [],
    // 外語首頁文案檔（i18n/home/<code>.json）的審稿人 id（不寫真名，0008 M.1 第 8 題）。
    // native 決定 nativeReviewer: 'required' 的語系能不能蓋章；同一個 id 在 shared/shell/i18n/reviewers.json 也有時，native 要相同（I.4）
    // ja、ko、de、es 照 0010（AI 交叉審＋站長看回譯）由站長蓋章，native: false
    reviewers: {
      en: [{ id: 'casper', native: false }],
      ja: [{ id: 'casper', native: false }],
      ko: [{ id: 'casper', native: false }],
      de: [{ id: 'casper', native: false }],
      es: [{ id: 'casper', native: false }],
    },
    // 選填：事實性文字（en 的 $meta.factualKeys）在某語系過期時的暫時豁免（G9），格式照範本的 i18nWaivers：
    // [{ page: 'home', locale: 'ja', keys: ['about.body'], until: 'YYYY-MM-DD' }]，until 最多是今天加 30 天。
    // 只在站長當次明確指示時新增
    waivers: [],
  },
}
