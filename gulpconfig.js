module.exports = {
  /*
   * 排除需要編譯的檔案，其餘移至 public
   */
  others: [
    '**/*.scss',
    '**/*.sass',
  ],

  /*
   * 檔案輸出、輸入路徑
   */
  paths: {
    // 來源
    'source': './assets/',
    'sass': './assets/stylesheets/',
    'img': './assets/images/',
    'js': './assets/js/',
    'coffee': './assets/coffee/',
    // 輸出
    'sass_output': 'stylesheets/',
    'js_output': 'js/',
    'public': './themes/next/source/',
    // Bower
    'bower': './bower_components/'
  },

  lib: {
    js: [
      'vue/dist/vue.min.js',
      'jquery.cookie/jquery.cookie.js'
    ],
    jsVendor: './assets/jsVendor/**/*.js'
  },

  /*
   * CSS, PostCSS, Sass 設定
   * 目前 PostCSS 僅有加入 autoprefixer
   */
  postcss: {
    'enabled': true, // 啟用 PostCSS
    'output_name': 'all.css', //輸出之 CSS 名稱
    'output_folder': 'css', //最後輸出之 CSS 資料夾
    'autoprefixer': {browsers: ['last 1 version']}
  },
  sass: {
    'output_style': 'compressed' // sass 輸出模式，可選 'nested', 'expanded', 'compact', 'compressed'
  }
}
