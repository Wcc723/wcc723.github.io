/**
 * casper-2026 主題 helper
 */

// 估算閱讀時間（分鐘）：中文約 350 字/分，英文約 200 字/分
hexo.extend.helper.register('reading_time', function (post) {
  var text = (post.content || '').replace(/<[^>]+>/g, ' ');
  var cjk = (text.match(/[一-鿿]/g) || []).length;
  var words = (text.replace(/[一-鿿]/g, ' ').match(/[a-zA-Z0-9]+/g) || []).length;
  var mins = Math.round((cjk / 350) + (words / 200));
  return Math.max(1, mins);
});

// 無縮圖時的替代字（取首個標籤／分類，英文取前 3 碼大寫、中文取前 2 字）
hexo.extend.helper.register('thumb_fallback', function (post) {
  var t = '';
  try {
    if (post.tags && post.tags.length) {
      t = post.tags.data ? post.tags.data[0].name : post.tags.toArray()[0].name;
    } else if (post.categories && post.categories.length) {
      t = post.categories.data ? post.categories.data[0].name : post.categories.toArray()[0].name;
    }
  } catch (e) { t = ''; }
  if (!t) t = post.title || '?';
  t = String(t).replace(/[^a-zA-Z0-9一-鿿]/g, '');
  if (/[a-zA-Z]/.test(t.charAt(0))) return t.slice(0, 3).toUpperCase();
  return t.slice(0, 2) || '?';
});

// 文章內頁頂部首圖：只用明確設定的 front-matter thumbnail，且需為可解析的絕對網址
// （設計過的封面，如 R2 cover.png），並排除「與內文第一張圖相同」以免頂部與內文重複。
// 相對路徑（舊文多為相對於文章 URL、實際 404 的舊值）一律不顯示。
hexo.extend.helper.register('post_cover', function (post) {
  var url = post.thumbnail || '';
  if (!/^https?:\/\//i.test(url)) return '';
  if ((post.content || '').indexOf(url) !== -1) return ''; // 封面已出現在內文任何位置 → 不重複顯示
  return url;
});

// 取文章描述（front-matter description 優先，否則用 excerpt 純文字裁切）
hexo.extend.helper.register('card_excerpt', function (post, len) {
  len = len || 90;
  var raw = post.description || post.excerpt || post.content || '';
  var text = raw.replace(/<[^>]+>/g, '').replace(/[#*`>\-\[\]!]/g, '').replace(/\s+/g, ' ').trim();
  if (text.length > len) return text.slice(0, len) + '…';
  return text;
});
