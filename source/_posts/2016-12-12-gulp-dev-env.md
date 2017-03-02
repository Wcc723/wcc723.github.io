---
layout: post
title: 鐵人賽 12 - Gulp - 定義預設開發環境
category: css
tagline:
tags: [css, gulp]
cssdemo:
jsdemo:
thumbnail: 2016_ironman/12_gulp_header.jpg
published: true
---

今天的進度來做個小調整，讓大家在使用 Gulp 時就能相容於目前的環境，目前使用的主要套件有：`gulp-sass`、`gulp-postcss`，這次調整後會有一個主要的前端專案資料夾，可以配合各個後端語言做調整，大家也可用相同的概念加入習慣的開發環境。

<!-- more -->

## 定義輸入及輸出

範例程式碼：https://github.com/Wcc723/ironman-gulp-sass/tree/v0.3.gulp-default

為了優化前端的效能會使用工具再將前端的內容編譯一次，如壓縮合併 Javascript、CSS；這時候會有一個原始碼以及壓縮後的程式碼，主要作業都是在原始碼，壓縮後的程式碼是用來部署使用。

在 `gulpfile.js` 內可以準備以下的變數：

```js
var path = {
  source: './source/', // 原始碼
  public: './public/'  // 輸出位置
}
```

這些變數可以依序套用在先前準備的 Task 上，開發時無論是配合什麼後端語言，只要調整原始碼、輸出位置就能夠配合各種語言。

```js
gulp.task('sass', function () {
  return gulp.src(path.source + 'scss/**/*.scss')  // 輸入點
    /* Task 的其他工作 */
    .pipe(gulp.dest(path.public + 'stylesheets')); // 輸出點
});
```

## 複製主要工作項以外的檔案

原始碼之中有許多檔案是不需要編譯的，但為了方便整理，我們可以將全部原始碼先放在 `source`
資料夾，再透過 gulp 一起輸出到另一個資料夾。

透過 `!` 可以避掉特定的檔案，所以我們可以匯入全部檔案後，再排除不需要複製檔案，以下程式碼就可以直接完成以下流程。

```js
// 其它不編譯的物件
var objs = ['./source/**/**.*'];
var others = [
    '**/*.scss',
    '**/*.sass',]; // 不複製的檔案
for (var i = 0; i < others.length; i++) {
  objs.push('!' + path.source + others[i]);
}
gulp.task('others', function(){
  return gulp.src(objs)
    .pipe(plumber())
    .pipe(gulp.dest(path.public));
});
```

這個步驟會新增一個 Task，所以我們需要使用 `gulp others` 來執行這段流程，此時我們也有幾個 Task，這時可以加入一個整合性的 Task 將所有的任務串接再一起。

`default` 是預設 gulp 會執行的 Task，後方的陣列內在加入要一起執行的 Task 即可。

```js
gulp.task('default', ['others', 'sass', 'watch']);
```

完成到這個步驟，只要執行 `gulp` 就會自動將以上流程一次完成，並且監聽相關的檔案是否有異動。

到目前為止，基本的 Gulp 運用已經足夠應付 CSS 在前端上的需求，在後面的章節會介紹更進階的 Gulp 套件運用。
