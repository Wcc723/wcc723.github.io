// 語系登錄表：多語工具的語言事實只寫在這裡。hreflang、og:locale、語言選單、404、sitemap、lang.css、audit 白名單
// 全部從這裡產生。正本在 workspace 的 shared/shell/i18n/，由 scripts/shell-sync.mjs 複製進各專案。
// 只用標準 JavaScript，不 import 任何套件，Node 腳本、Vite、VitePress 都能直接 import。
//
// 欄位（docs 見同目錄 README.md）：
//   code            內部 id，也是網址路徑段、訊息檔檔名、GA4 page_locale 的值；小寫，上線後永久保留
//   htmlLang        <html lang>、JSON-LD inLanguage、外語片段的 lang
//   hreflang        <link rel="alternate" hreflang>、語言選單 <a hreflang>；只寫語言（加書寫系統），不寫地區
//   ogLocale        og:locale、og:locale:alternate（language_TERRITORY）
//   intl            Intl.* 的 locale，明寫地區，避免 likelySubtags 隨 ICU 版本變動
//   autonym         語言選單上的名稱，用該語言自己的寫法；寫死，不用 Intl.DisplayNames（各執行環境輸出不同）
//   dir             <html dir>，先為 RTL 預留
//   script          對到 SCRIPTS 的排版群組
//   fontToken       字型堆疊的 CSS 變數，值定義在 shared/tokens
//   cssLang         產生 :is(:lang(…)) 用；:lang(zh-TW) 比對不到 zh-Hant-TW，所以要列別名
//   brand           站名與作者名用中文（zh）還是英文（en）
//   titleSeparator  title 站名尾巴的分隔符
//   titleBudget     title 長度：unit 'width' 是全形算 2，'chars' 是字元數
//   descBudget      description 長度
//   dateStyle       署名列日期：'iso' 是 YYYY-MM-DD，'medium' 是 Intl 的 medium
//   quotes          CSS quotes（外層開、外層關、內層開、內層關），也拿來檢查訊息檔的引號
//   hyphenate       是否開 hyphens:auto
//   adsense         這個語言在 AdSense 支援清單上；false 的語系每頁都不載 loader
//   nativeReviewer  'required'：審稿人一定要是母語者；'optional'：站長可以審；
//                   'ai-cross'（0010）：沒有母語審稿人，AI 翻譯、另一個模型交叉審，站長看過中文回譯後蓋章（native: false 可以蓋）。
//                   'ai-cross' 的章不算母語審過：署名列不顯示 byline.reviewed
//   legal           法務旗標：'required'、'disclose' 要有網址或站長豁免；'confirm' 要有站長的確認紀錄（legal.mjs）

// 陣列順序就是 hreflang、語言選單、og:locale:alternate 的順序；新語系加在最後
export const LOCALES = [
  { code: 'en', htmlLang: 'en', hreflang: 'en', ogLocale: 'en_US', intl: 'en-US', autonym: 'English', dir: 'ltr',
    script: 'Latn', fontToken: '--cs-font-latn', cssLang: ['en'], brand: 'en', titleSeparator: ' | ',
    titleBudget: { unit: 'chars', max: 60 }, descBudget: { unit: 'chars', min: 120, max: 160 },
    dateStyle: 'medium', quotes: ['“', '”', '‘', '’'], hyphenate: false, adsense: true,
    nativeReviewer: 'optional', legal: { privacy: 'required' } },
  { code: 'zh-tw', htmlLang: 'zh-Hant-TW', hreflang: 'zh-Hant', ogLocale: 'zh_TW', intl: 'zh-Hant-TW', autonym: '繁體中文', dir: 'ltr',
    script: 'Hant', fontToken: '--cs-font-hant', cssLang: ['zh-Hant', 'zh-TW', 'zh-HK', 'zh-MO'], brand: 'zh', titleSeparator: '｜',
    titleBudget: { unit: 'width', max: 60 }, descBudget: { unit: 'chars', min: 80, max: 110 },
    dateStyle: 'iso', quotes: ['「', '」', '『', '』'], hyphenate: false, adsense: true,
    nativeReviewer: 'optional', legal: { privacy: 'required' } },
  { code: 'zh-cn', htmlLang: 'zh-Hans', hreflang: 'zh-Hans', ogLocale: 'zh_CN', intl: 'zh-Hans-CN', autonym: '简体中文', dir: 'ltr',
    script: 'Hans', fontToken: '--cs-font-hans', cssLang: ['zh-Hans', 'zh-CN', 'zh-SG', 'zh-MY'], brand: 'zh', titleSeparator: '｜',
    titleBudget: { unit: 'width', max: 60 }, descBudget: { unit: 'chars', min: 80, max: 110 },
    dateStyle: 'medium', quotes: ['“', '”', '‘', '’'], hyphenate: false, adsense: true,
    nativeReviewer: 'required', legal: { privacy: 'required' } },
  { code: 'ja', htmlLang: 'ja', hreflang: 'ja', ogLocale: 'ja_JP', intl: 'ja-JP', autonym: '日本語', dir: 'ltr',
    script: 'Jpan', fontToken: '--cs-font-jpan', cssLang: ['ja'], brand: 'en', titleSeparator: '｜',
    titleBudget: { unit: 'width', max: 60 }, descBudget: { unit: 'chars', min: 80, max: 110 },
    dateStyle: 'medium', quotes: ['「', '」', '『', '』'], hyphenate: false, adsense: true,
    nativeReviewer: 'ai-cross', legal: { privacy: 'required', externalTransmission: 'disclose' } },
  { code: 'ko', htmlLang: 'ko', hreflang: 'ko', ogLocale: 'ko_KR', intl: 'ko-KR', autonym: '한국어', dir: 'ltr',
    script: 'Kore', fontToken: '--cs-font-kore', cssLang: ['ko'], brand: 'en', titleSeparator: ' | ',
    titleBudget: { unit: 'width', max: 60 }, descBudget: { unit: 'chars', min: 80, max: 110 }, // ko 的預算是推論，比照中日
    dateStyle: 'medium', quotes: ['“', '”', '‘', '’'], hyphenate: false, adsense: true,
    nativeReviewer: 'ai-cross', legal: { privacy: 'required', pipa: 'confirm' } },
  { code: 'de', htmlLang: 'de', hreflang: 'de', ogLocale: 'de_DE', intl: 'de-DE', autonym: 'Deutsch', dir: 'ltr',
    script: 'Latn', fontToken: '--cs-font-latn', cssLang: ['de'], brand: 'en', titleSeparator: ' | ',
    titleBudget: { unit: 'chars', max: 60 }, descBudget: { unit: 'chars', min: 120, max: 160 },
    dateStyle: 'medium', quotes: ['„', '“', '‚', '‘'], hyphenate: true, adsense: true,
    nativeReviewer: 'ai-cross', legal: { privacy: 'required', impressum: 'required' } },
  // es：intl 'es-ES' 代表數字與日期照西班牙的格式；文案用中性西文。要依拉美地區格式化的工具在自己的設定覆寫，不改這裡
  { code: 'es', htmlLang: 'es', hreflang: 'es', ogLocale: 'es_ES', intl: 'es-ES', autonym: 'Español', dir: 'ltr',
    script: 'Latn', fontToken: '--cs-font-latn', cssLang: ['es'], brand: 'en', titleSeparator: ' | ',
    titleBudget: { unit: 'chars', max: 60 }, descBudget: { unit: 'chars', min: 120, max: 160 },
    dateStyle: 'medium', quotes: ['«', '»', '“', '”'], hyphenate: true, adsense: true,
    nativeReviewer: 'ai-cross', legal: { privacy: 'required' } },
]
export const LOCALE = Object.fromEntries(LOCALES.map((l) => [l.code, l]))

// 部落格與 /about/、/contact/、/terms/、/privacy/ 只有繁中（docs/decisions/0007-sound-effects-multilingual.md）
export const BLOG_LOCALES = ['zh-tw']

// 排版群組：新語系如果用既有的書寫系統，CSS 完全不用改，重跑 node shared/shell/i18n/build.mjs 即可
//   rootOnly          這組的字型與行高只作用在根元素：中文頁裡的 <span lang="en"> 不會中途換成 Nunito
//   lh                行高：body、prose（長文）、heading
//   headingTracking   標題字距
//   minSize           最小字級，check:layout 用
//   wordBreak         'keep-all' 時另加 overflow-wrap:anywhere 兜底
//   lineBreak         'strict' 讓促音、長音不出現在行首
//   autospace         text-autospace 的值，null 代表不設
//   headingWordBreak  標題與短的 UI 字串（dt、th、label、按鈕、.cs-phrase）的 word-break（ja 用 auto-phrase，
//                     「文字数（スペース込み）」不會斷成「込 ⏎ み」），null 代表不設；長段落不套，以免整個詞組擠出版面
//   textWrap          段落（p、li、dd）的 text-wrap。ko 用 wrap：pretty 會在 ’ 與助詞之間找斷點（Unicode LB19a），
//                     把「‘바이트’는」的「는」單獨斷到下一行，keep-all 擋不住
//   noItalic          不合成斜體，em、i、cite、dfn 改成正體，em 改粗體
export const SCRIPTS = {
  Latn: { rootOnly: true, lh: { body: 1.6, prose: 1.65, heading: 1.2 }, headingTracking: '-0.01em', minSize: '13px',
          wordBreak: 'normal', lineBreak: 'auto', autospace: null, headingWordBreak: null, noItalic: false, textWrap: 'pretty' },
  Hant: { lh: { body: 1.7, prose: 1.9, heading: 1.35 }, headingTracking: '0.01em', minSize: '12px',
          wordBreak: 'normal', lineBreak: 'auto', autospace: 'normal', headingWordBreak: null, noItalic: true, textWrap: 'pretty' },
  Hans: { lh: { body: 1.7, prose: 1.9, heading: 1.35 }, headingTracking: '0.01em', minSize: '12px',
          wordBreak: 'normal', lineBreak: 'auto', autospace: 'normal', headingWordBreak: null, noItalic: true, textWrap: 'pretty' },
  Jpan: { lh: { body: 1.7, prose: 1.9, heading: 1.35 }, headingTracking: '0', minSize: '12px',
          wordBreak: 'normal', lineBreak: 'strict', autospace: 'normal', headingWordBreak: 'auto-phrase', noItalic: true, textWrap: 'pretty' },
  Kore: { lh: { body: 1.7, prose: 1.7, heading: 1.35 }, headingTracking: '0', minSize: '12px',
          wordBreak: 'keep-all', lineBreak: 'auto', autospace: null, headingWordBreak: null, noItalic: true, textWrap: 'wrap' },
}

/** 取一筆登錄表；不認得的代碼直接丟錯，避免拼錯的語系默默變成 undefined */
export const getLocale = (code) => LOCALE[code] ?? (() => { throw new Error(`未知的語系：${code}`) })()

// 語系的固定順序（hreflang、語言選單、og:locale:alternate 都照它）。排序只在這裡寫一次，其他檔案都 import
export const LOCALE_ORDER = new Map(LOCALES.map((l, i) => [l.code, i]))
/** 兩個語系代碼照 LOCALES 的順序比較（給 Array.prototype.sort 用） */
export const byLocaleOrder = (a, b) => LOCALE_ORDER.get(getLocale(a).code) - LOCALE_ORDER.get(getLocale(b).code)
/**
 * 去重、驗證代碼（不認得就丟錯），照 LOCALES 排序，回新陣列。
 * 先逐一 getLocale 再排序：只有一個元素時 Array.prototype.sort 不呼叫比較函式，靠 byLocaleOrder 驗不到
 */
export const sortLocaleCodes = (codes) => {
  const unique = [...new Set(codes)]
  unique.forEach((c) => getLocale(c))
  return unique.sort(byLocaleOrder)
}
