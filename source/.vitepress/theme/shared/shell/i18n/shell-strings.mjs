// 外殼字串：頁首、語言選單、署名列、頁尾、404 的顯示文字。頁首頁尾的連結結構另放（../nav.mjs），
// 顯示文字一律從這裡取，同一個字只寫一處。正本語系是 SHELL_SOURCE，審稿紀錄在 shell-review.json（逐 key 記雜湊）。
// 只用標準 JavaScript，不 import 任何套件；client 端可以 import formatShell() 來代入佔位符，
// 字串本身由範本的 virtual:cs-page 依語系提供，不必把七語全部打包。
//
// 全部是草稿，要母語審稿（zh-tw 由站長審）。語氣：de 用 du、es 用 tú、fr 用 vous；ja 用です・ます；
// ko 句子用해요체，按鈕與署名列用名詞或動詞語幹。任何字串都不寫死站名或人名，一律用 {site}、{author}。
// 韓文刻意不讓助詞接在代入值後面（助詞會隨最後一個字有沒有收尾音而變）。
// 「回到這支工具」要冠詞與格變化（de、es），整句放在工具自己的訊息檔（tool.backHome），不做成外殼字串。
import { BLOG_LOCALES, LOCALES, getLocale } from './locales.mjs'
import { siteName, authorName } from './seo.mjs'

export const SHELL_SOURCE = 'zh-tw'

// 每個 key 給誰用：
//   'all'：每個語系；'blog'：BLOG_LOCALES；'non-blog'：BLOG_LOCALES 以外；
//   { legal: '<flag>' }：登錄表 legal 有這個旗標的語系；
//   { except: ['<code>', …] }：除了列出的語系都給（例如 inEnglish 不給 en）；
//   { nativeReviewer: '<值>' }：登錄表 nativeReviewer 是這個值的語系（例如 footer.translated 只給 'ai-cross'）；
//   { sourceLocale: '<code>' }：只給正本語系是 <code> 的工具，而且不給 <code> 本身（例如 footer.translatedFromEn）。
//       要呼叫端在 ctx 給 { sourceLocale }（工具傳 tool.config 的 sourceLocale）才算數；沒給 ctx 的呼叫端
//       （部落格、全站首頁、還沒接線的工具、site-invariants）當成正本是 SHELL_SOURCE，一律不包含，審稿閘門也不會要求它；
//   'draft'：只有正本有字、元件還不能用的 key（ts() 遇到會丟錯），要先寫好字、還不想上線時用。
// 新 key 直接用正式的 audience（主站首頁規格 I.3）：已上線的語系（每支已上線工具的每個語系、已上線的全站首頁語系、
// 部落格用共用外殼之後的 zh-tw）都要審過，由 workspace 的不變量測試（scripts/site-invariants.mjs）擋，不等七語都審過。
// { sourceLocale } 的 key 例外：只有給了同一個 ctx 的工具，自己的 live 閘門（範本 plan.mjs 的 reviewGate）會要求審過。
export const SHELL_KEYS = {
  // 頁首與語言選單
  skipToContent: 'all',
  'nav.label': 'all',
  'nav.tools': 'blog',
  'nav.articles': 'blog',
  'nav.about': 'blog',
  'search.open': 'blog',
  'search.openPosts': 'blog', // 還沒有工具時的 ⌘K 鈕（部落格頁首，跟 P2 的「搜尋文章」相同）
  'menu.open': 'all',
  'menu.close': 'all',
  'theme.toggle': 'all',
  'lang.label': 'all',
  'lang.summary': 'all',
  'lang.current': 'all',
  'lang.homeOnly': 'all', // 語言選單的退路說明，用目標語系顯示
  'breadcrumb.label': 'all',
  'breadcrumb.home': 'all', // 麵包屑第一層（全站首頁）。外語頁只在該語系的全站首頁已上線時用（shell-model.mjs 的 foreignSiteHome，M.1 第 3 題）
  // 署名列、頁尾
  'byline.made': 'all',
  'byline.updated': 'all',
  'byline.reviewed': 'all', // 只在「不是正本」而且「審稿人都是母語者」時顯示（範本的 entry.showReviewedNote）
  'footer.home': 'non-blog',
  'footer.blog': 'non-blog',
  'footer.about': 'all',
  'footer.contact': 'all',
  'footer.privacy': 'all',
  'footer.terms': 'all',
  'footer.legalNotice': { legal: 'impressum' },
  'footer.thirdParty': { legal: 'externalTransmission' },
  'footer.languages': 'all',
  'footer.copyright': 'all',
  'footer.translated': { nativeReviewer: 'ai-cross' }, // 決策 0010：AI 交叉審的語系，頁尾說明本頁譯自繁中版、以繁中版為準
  // 站長 2026-11-10（free-fonts 確認頁 Q9 選 A）：正本是英文的工具，en 以外每個語系的頁（繁中也算）頁尾說明以英文版為準。
  // en 頁不顯示，所以 en 沒有字；shell-model.mjs 的 TRANSLATED_NOTE_KEYS 對到這個 key
  'footer.translatedFromEn': { sourceLocale: 'en' },
  'footer.tools': 'all', // 頁尾工具組的標題；外語首頁頁首唯一的導覽
  // 部落格與繁中頁的完整頁尾（連結結構在 ../nav.mjs 的 FOOTER_BLOG_GROUPS），字跟 P2 的部落格頁尾相同
  'footer.tagline': 'blog',
  'footer.signature': 'blog', // {site} 由元件換成連到 /about/ 的站名（shell-model.mjs 的 footerModel）
  'footer.group.posts': 'blog',
  'footer.group.topics': 'blog',
  'footer.group.site': 'blog',
  'footer.group.elsewhere': 'blog',
  'footer.posts.latest': 'blog',
  'footer.posts.categories': 'blog',
  'footer.posts.tags': 'blog',
  'footer.posts.archives': 'blog',
  'footer.posts.rss': 'blog',
  'footer.topic.css': 'blog',
  'footer.topic.javascript': 'blog',
  'footer.topic.development': 'blog',
  'footer.topic.design': 'blog',
  'footer.elsewhere.games': 'blog',
  'footer.elsewhere.book': 'blog',
  'footer.elsewhere.facebook': 'blog',
  'footer.elsewhere.github': 'blog',
  inChinese: 'non-blog', // 連到繁中頁時接在連結字後面
  inEnglish: { except: ['en'] }, // 連到英文頁（工具的 x-default、/en/）時接在連結字後面
  // 404
  'notFound.title': 'all',
  'notFound.body': 'all',
  'notFound.siteHome': 'all',
}

// 扁平 key。正本 SHELL_SOURCE 有全部 key；其他語系剛好有「任何一種 sourceLocale 下 audience 包含它」、而且不是 draft 的 key
// （shellKeysAnySource(code)）
export const SHELL_STRINGS = {
  'zh-tw': {
    skipToContent: '跳到主要內容',
    'nav.label': '主選單',
    'nav.tools': '工具',
    'nav.articles': '文章',
    'nav.about': '關於',
    'search.open': '搜尋工具或文章',
    'search.openPosts': '搜尋文章',
    'menu.open': '開啟選單',
    'menu.close': '關閉選單',
    'theme.toggle': '深色模式',
    'lang.label': '語言',
    'lang.summary': '切換語言（目前：{autonym}）',
    'lang.current': '目前語言',
    'lang.homeOnly': '（工具首頁）',
    'breadcrumb.label': '頁面路徑',
    'breadcrumb.home': '首頁',
    'byline.made': '由{author}製作與維護',
    'byline.updated': '最後更新 {date}',
    'byline.reviewed': '譯文經母語人士審閱',
    'footer.home': '{site}首頁',
    'footer.blog': '{author}的部落格',
    'footer.about': '關於{author}',
    'footer.contact': '聯絡',
    'footer.privacy': '隱私權政策',
    'footer.terms': '使用條款',
    'footer.legalNotice': '網站經營者資訊',
    'footer.thirdParty': '外部傳送說明',
    'footer.languages': '語言',
    'footer.copyright': '© {author}',
    'footer.translated': '這頁是翻譯版本，內容有出入時以繁體中文版為準。',
    'footer.translatedFromEn': '這頁是翻譯版本，內容有出入時以英文版為準。',
    'footer.tools': '工具',
    'footer.tagline': '{author}的前端筆記，從 2013 年寫到現在。',
    'footer.signature': '© {author}，{site}',
    'footer.group.posts': '文章',
    'footer.group.topics': '熱門主題',
    'footer.group.site': '關於本站',
    'footer.group.elsewhere': '{author}的其他地方',
    'footer.posts.latest': '最新文章',
    'footer.posts.categories': '所有分類',
    'footer.posts.tags': '標籤',
    'footer.posts.archives': '封存',
    'footer.posts.rss': 'RSS',
    'footer.topic.css': 'CSS',
    'footer.topic.javascript': 'JavaScript',
    'footer.topic.development': '開發環境',
    'footer.topic.design': '設計',
    'footer.elsewhere.games': '卡伯遊戲',
    'footer.elsewhere.book': '《JavaScript 面試力》',
    'footer.elsewhere.facebook': 'Facebook',
    'footer.elsewhere.github': 'GitHub',
    inChinese: '{label}（繁體中文）',
    inEnglish: '{label}（英文）',
    'notFound.title': '這頁找不到',
    'notFound.body': '網址可能打錯了，或這一頁已經搬走。',
    'notFound.siteHome': '前往{site}首頁',
  },
  'zh-cn': {
    skipToContent: '跳到主要内容',
    'nav.label': '主菜单',
    'menu.open': '打开菜单',
    'menu.close': '关闭菜单',
    'theme.toggle': '深色模式',
    'lang.label': '语言',
    'lang.summary': '切换语言（当前：{autonym}）',
    'lang.current': '当前语言',
    'lang.homeOnly': '（工具首页）',
    'breadcrumb.label': '页面路径',
    'breadcrumb.home': '首页',
    'byline.made': '由{author}制作和维护',
    'byline.updated': '最后更新 {date}',
    'byline.reviewed': '译文经母语人士审校',
    'footer.home': '{site}首页',
    'footer.blog': '{author}的博客',
    'footer.about': '关于{author}',
    'footer.contact': '联系方式',
    'footer.privacy': '隐私政策',
    'footer.terms': '使用条款',
    'footer.languages': '语言',
    'footer.copyright': '© {author}',
    'footer.translatedFromEn': '本页为翻译版本，内容如有出入，以英文版为准。',
    'footer.tools': '工具',
    inChinese: '{label}（繁体中文）',
    inEnglish: '{label}（英文）',
    'notFound.title': '页面不存在',
    'notFound.body': '网址可能输错了，或者页面已被移动或删除。',
    'notFound.siteHome': '前往{site}首页',
  },
  en: {
    skipToContent: 'Skip to main content',
    'nav.label': 'Main menu',
    'menu.open': 'Open menu',
    'menu.close': 'Close menu',
    'theme.toggle': 'Dark mode',
    'lang.label': 'Language',
    'lang.summary': 'Change language (current: {autonym})',
    'lang.current': 'Current language',
    'lang.homeOnly': '(tool home page)',
    'breadcrumb.label': 'Breadcrumb',
    'breadcrumb.home': 'Home',
    'byline.made': 'Made and maintained by {author}',
    'byline.updated': 'Updated {date}',
    'byline.reviewed': 'Translation reviewed by a native speaker',
    'footer.home': '{site} home',
    'footer.blog': '{author}’s blog',
    'footer.about': 'About {author}',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy policy',
    'footer.terms': 'Terms of use',
    'footer.languages': 'Languages',
    'footer.copyright': '© {author}',
    'footer.tools': 'Tools',
    inChinese: '{label} (in Traditional Chinese)',
    'notFound.title': 'Page not found',
    'notFound.body': 'The address may have a typo, or the page has moved.',
    'notFound.siteHome': 'Go to the {site} home page',
  },
  ja: {
    skipToContent: '本文へスキップ',
    'nav.label': 'メインメニュー',
    'menu.open': 'メニューを開く',
    'menu.close': 'メニューを閉じる',
    'theme.toggle': 'ダークモード',
    'lang.label': '言語',
    'lang.summary': '言語を切り替え（現在：{autonym}）',
    'lang.current': '現在の言語',
    'lang.homeOnly': '（ツールのトップ）',
    'breadcrumb.label': 'パンくずリスト',
    'breadcrumb.home': 'トップ',
    'byline.made': '制作・運営：{author}',
    'byline.updated': '最終更新：{date}',
    'byline.reviewed': '翻訳はネイティブスピーカーが確認しています',
    'footer.home': '{site}トップ',
    'footer.blog': '{author}のブログ',
    'footer.about': '{author}について',
    'footer.contact': 'お問い合わせ',
    'footer.privacy': 'プライバシーポリシー',
    'footer.terms': '利用規約',
    'footer.thirdParty': '外部送信について',
    'footer.languages': '言語',
    'footer.copyright': '© {author}',
    'footer.translated': 'このページは翻訳版です。内容に違いがある場合は、繁体字中国語版が優先されます。',
    'footer.translatedFromEn': 'このページは翻訳版です。内容に違いがある場合は、英語版が優先されます。',
    'footer.tools': 'ツール',
    inChinese: '{label}（繁体字中国語）',
    inEnglish: '{label}（英語）',
    'notFound.title': 'ページが見つかりません',
    'notFound.body': 'URLが間違っているか、ページが移動した可能性があります。',
    'notFound.siteHome': '{site}のトップへ',
  },
  ko: {
    skipToContent: '본문 바로가기',
    'nav.label': '주 메뉴',
    'menu.open': '메뉴 열기',
    'menu.close': '메뉴 닫기',
    'theme.toggle': '다크 모드',
    'lang.label': '언어',
    'lang.summary': '언어 바꾸기(현재: {autonym})',
    'lang.current': '현재 언어',
    'lang.homeOnly': '(도구 홈)',
    'breadcrumb.label': '현재 위치',
    'breadcrumb.home': '홈',
    'byline.made': '제작·관리: {author}',
    'byline.updated': '마지막 업데이트: {date}',
    'byline.reviewed': '원어민 번역 검수 완료',
    'footer.home': '{site} 홈',
    'footer.blog': '{author}의 블로그',
    'footer.about': '{author} 소개',
    'footer.contact': '문의하기',
    'footer.privacy': '개인정보처리방침',
    'footer.terms': '이용약관',
    'footer.languages': '언어',
    'footer.copyright': '© {author}',
    'footer.translated': '이 페이지는 번역본이에요. 내용이 다를 때는 번체 중국어판이 우선해요.',
    'footer.translatedFromEn': '이 페이지는 번역본이에요. 내용이 다를 때는 영문판이 우선해요.',
    'footer.tools': '도구',
    inChinese: '{label} (번체 중국어)',
    inEnglish: '{label} (영어)',
    'notFound.title': '페이지를 찾을 수 없어요',
    'notFound.body': '주소를 잘못 입력했거나 페이지가 옮겨졌을 수 있어요.',
    'notFound.siteHome': '{site} 홈으로 가기',
  },
  de: {
    skipToContent: 'Zum Inhalt springen',
    'nav.label': 'Hauptmenü',
    'menu.open': 'Menü öffnen',
    'menu.close': 'Menü schließen',
    'theme.toggle': 'Dunkelmodus',
    'lang.label': 'Sprache',
    'lang.summary': 'Sprache ändern (aktuell: {autonym})',
    'lang.current': 'Aktuelle Sprache',
    'lang.homeOnly': '(Startseite des Tools)',
    'breadcrumb.label': 'Navigationspfad',
    'breadcrumb.home': 'Startseite',
    'byline.made': 'Erstellt und gepflegt von {author}',
    'byline.updated': 'Zuletzt aktualisiert: {date}',
    'byline.reviewed': 'Übersetzung muttersprachlich geprüft',
    'footer.home': 'Startseite von {site}',
    'footer.blog': 'Blog von {author}',
    'footer.about': 'Über {author}',
    'footer.contact': 'Kontakt',
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.legalNotice': 'Impressum',
    'footer.languages': 'Sprachen',
    'footer.copyright': '© {author}',
    'footer.translated': 'Diese Seite ist eine Übersetzung. Bei Abweichungen gilt die Fassung auf traditionellem Chinesisch.',
    'footer.translatedFromEn': 'Diese Seite ist eine Übersetzung. Bei Abweichungen gilt die englische Fassung.',
    'footer.tools': 'Tools',
    inChinese: '{label} (auf traditionellem Chinesisch)',
    inEnglish: '{label} (auf Englisch)',
    'notFound.title': 'Seite nicht gefunden',
    'notFound.body': 'Vielleicht ist die Adresse falsch geschrieben oder die Seite ist umgezogen.',
    'notFound.siteHome': 'Zur Startseite von {site}',
  },
  es: {
    skipToContent: 'Saltar al contenido principal',
    'nav.label': 'Menú principal',
    'menu.open': 'Abrir menú',
    'menu.close': 'Cerrar menú',
    'theme.toggle': 'Modo oscuro',
    'lang.label': 'Idioma',
    'lang.summary': 'Cambiar idioma (actual: {autonym})',
    'lang.current': 'Idioma actual',
    'lang.homeOnly': '(inicio de la herramienta)',
    'breadcrumb.label': 'Ruta de navegación',
    'breadcrumb.home': 'Inicio',
    'byline.made': 'Creado y mantenido por {author}',
    'byline.updated': 'Última actualización: {date}',
    'byline.reviewed': 'Traducción revisada por un hablante nativo',
    'footer.home': 'Inicio de {site}',
    'footer.blog': 'Blog de {author}',
    'footer.about': 'Sobre {author}',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Política de privacidad',
    'footer.terms': 'Términos de uso',
    'footer.languages': 'Idiomas',
    'footer.copyright': '© {author}',
    'footer.translated': 'Esta página es una traducción. Si hay diferencias, prevalece la versión en chino tradicional.',
    'footer.translatedFromEn': 'Esta página es una traducción. Si hay diferencias, prevalece la versión en inglés.',
    'footer.tools': 'Herramientas',
    inChinese: '{label} (en chino tradicional)',
    inEnglish: '{label} (en inglés)',
    'notFound.title': 'Página no encontrada',
    'notFound.body': 'Puede que la dirección tenga un error o que la página se haya movido.',
    'notFound.siteHome': 'Ir a la página de inicio de {site}',
  },
  fr: {
    skipToContent: 'Aller au contenu principal',
    'nav.label': 'Menu principal',
    'menu.open': 'Ouvrir le menu',
    'menu.close': 'Fermer le menu',
    'theme.toggle': 'Mode sombre',
    'lang.label': 'Langue',
    'lang.summary': 'Changer de langue (langue actuelle : {autonym})',
    'lang.current': 'Langue actuelle',
    'lang.homeOnly': '(accueil de l’outil)',
    'breadcrumb.label': 'Fil d’Ariane',
    'breadcrumb.home': 'Accueil',
    'byline.made': 'Créé et maintenu par {author}',
    'byline.updated': 'Dernière mise à jour : {date}',
    'byline.reviewed': 'Traduction relue par un locuteur natif',
    'footer.home': 'Accueil de {site}',
    'footer.blog': 'Blog de {author}',
    'footer.about': 'À propos de {author}',
    'footer.contact': 'Contact',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions d’utilisation',
    'footer.languages': 'Langues',
    'footer.copyright': '© {author}',
    'footer.translated': 'Cette page est une traduction. En cas de différence, la version en chinois traditionnel fait foi.',
    'footer.translatedFromEn': 'Cette page est une traduction. En cas de différence, la version anglaise fait foi.',
    'footer.tools': 'Outils',
    inChinese: '{label} (en chinois traditionnel)',
    inEnglish: '{label} (en anglais)',
    'notFound.title': 'Page introuvable',
    'notFound.body': 'L’adresse contient peut-être une erreur, ou la page a été déplacée.',
    'notFound.siteHome': 'Aller à l’accueil de {site}',
  },
}

/**
 * 呼叫端的情境 ctx：{ sourceLocale }，這頁內容的正本語系（工具傳 tool.config 的 sourceLocale）。
 * 沒給是 SHELL_SOURCE：部落格、全站首頁與正本是繁中的工具都是，跟加上 { sourceLocale } 這種 audience 以前完全相同。
 * 不認得的語系代碼丟錯
 * @typedef {{ sourceLocale?: string }} ShellContext
 */
const sourceOf = (ctx) => getLocale(ctx?.sourceLocale ?? SHELL_SOURCE).code

/**
 * 這個 audience 包不包含這個語系；'draft' 一律不包含。{ except } 列的代碼不在登錄表就丟錯。
 * { sourceLocale } 只在 ctx 的 sourceLocale 相同、而且語系不是它本身時包含
 * @param {ShellContext} [ctx]
 */
export function audienceIncludes(audience, code, ctx = {}) {
  const l = getLocale(code)
  const source = sourceOf(ctx)
  if (audience === 'all') return true
  if (audience === 'blog') return BLOG_LOCALES.includes(code)
  if (audience === 'non-blog') return !BLOG_LOCALES.includes(code)
  if (audience === 'draft') return false
  if (audience && typeof audience === 'object' && typeof audience.legal === 'string') return audience.legal in l.legal
  if (audience && typeof audience === 'object' && typeof audience.nativeReviewer === 'string') return l.nativeReviewer === audience.nativeReviewer
  if (audience && typeof audience === 'object' && Array.isArray(audience.except)) {
    audience.except.forEach(getLocale)
    return !audience.except.includes(code)
  }
  if (audience && typeof audience === 'object' && typeof audience.sourceLocale === 'string') {
    const only = getLocale(audience.sourceLocale).code
    return source === only && code !== only
  }
  throw new Error(`未知的 audience：${JSON.stringify(audience)}`)
}

/**
 * 這個語系的元件可以用的外殼 key（audience 包含它、不是 draft），照 SHELL_KEYS 的順序。
 * ctx 沒給時不含 { sourceLocale } 的 key（審稿閘門 shellKeyStates 也照這份）
 * @param {string} code
 * @param {ShellContext} [ctx]
 */
export const shellKeysFor = (code, ctx = {}) => Object.keys(SHELL_KEYS).filter((k) => audienceIncludes(SHELL_KEYS[k], code, ctx))

/**
 * 這個語系在任何一種 sourceLocale 下可能用到的 key（照 SHELL_KEYS 的順序）：SHELL_STRINGS[code] 剛好要有這些字，
 * 審稿紀錄的「改了沒重新蓋章」與 --stamp-shell 省略 --keys 時也看這份
 */
export const shellKeysAnySource = (code) => {
  const sources = [...new Set([SHELL_SOURCE, ...LOCALES.map((l) => l.code)])]
  return Object.keys(SHELL_KEYS).filter((k) => sources.some((s) => audienceIncludes(SHELL_KEYS[k], code, { sourceLocale: s })))
}

/**
 * 這個語系的外殼字串（尚未代入佔位符），只含 shellKeysFor(code, ctx)；給範本的 virtual:cs-page 用
 * @param {string} code
 * @param {ShellContext} [ctx]
 */
export function shellStringsFor(code, ctx = {}) {
  const table = SHELL_STRINGS[code]
  if (!table) throw new Error(`外殼字串沒有這個語系：${code}`)
  return Object.fromEntries(shellKeysFor(code, ctx).map((k) => [k, table[k]]))
}

const PLACEHOLDER = /\{([a-zA-Z_][\w.]*)\}/g
/** 字串裡的佔位符名稱集合，例如 '{author} 製作與維護' → ['author'] */
export const placeholdersOf = (str) => [...new Set([...String(str).matchAll(PLACEHOLDER)].map((m) => m[1]))].sort()

/**
 * 代入佔位符：{site}、{author}、{autonym} 依語系自動帶入（params 可覆寫），{date}、{label} 由呼叫端給。
 * 少給任何一個就丟錯，不讓 {x} 漏到頁面上。
 */
export function formatShell(template, code, params = {}) {
  const l = getLocale(code)
  const values = { site: siteName(code), author: authorName(code), autonym: l.autonym, ...params }
  return String(template).replace(PLACEHOLDER, (m, name) => {
    if (values[name] === undefined || values[name] === null) throw new Error(`外殼字串缺少參數 {${name}}（語系 ${code}）`)
    return String(values[name])
  })
}

/**
 * 取字串並代入 {site}、{author}、{autonym}、{date}、{label}。key 的 audience 不含 code（照 ctx 算），或是 'draft'，就丟錯
 * @param {ShellContext} [ctx]
 */
export function ts(code, key, params = {}, ctx = {}) {
  if (!(key in SHELL_KEYS)) throw new Error(`未知的外殼 key：${key}`)
  if (SHELL_KEYS[key] === 'draft') throw new Error(`外殼 key ${key} 還是 draft，元件不能使用`)
  if (!audienceIncludes(SHELL_KEYS[key], code, ctx)) {
    throw new Error(`外殼 key ${key} 不給 ${code} 用（audience：${JSON.stringify(SHELL_KEYS[key])}，sourceLocale：${sourceOf(ctx)}）`)
  }
  const str = SHELL_STRINGS[code]?.[key]
  if (typeof str !== 'string' || str === '') throw new Error(`外殼字串缺 ${code}.${key}`)
  return formatShell(str, code, params)
}
