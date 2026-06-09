/**
 * asset_v('css/style.css') → 以檔案 mtime 產生短版本字串，供 CSS/JS 連結做 cache busting
 * 檔案一變動版本就變，URL 隨之改變，繞過 CDN/瀏覽器快取
 */
var fs = require('fs');
var path = require('path');

hexo.extend.helper.register('asset_v', function (rel) {
  try {
    var f = path.join(hexo.theme_dir, 'source', String(rel).replace(/^\/+/, ''));
    return Math.round(fs.statSync(f).mtimeMs).toString(36);
  } catch (e) {
    return '';
  }
});
