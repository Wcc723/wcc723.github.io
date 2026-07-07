/**
 * Cloudflare Workers 靜態資產 `_headers`
 * @description hexo generate 時輸出 public/_headers,交給 Workers Static Assets 解析(與 Cloudflare Pages 同格式)。
 *   - HTML 預設就是 `Cache-Control: public, max-age=0, must-revalidate`,不必自己寫。
 *   - 這裡只替「已用 ?v=mtime 做 cache busting 的 CSS / JS」加長快取。
 *   - 規則不可重疊:同一個 header 被多條規則命中時,值會用逗號「合併」而非覆寫。
 * 註:`_headers` 檔本身不會被當靜態檔對外輸出,而是被解析成規則。
 */
hexo.extend.generator.register('cf_headers', function () {
  const body = [
    '# 由 themes/casper-2026/scripts/cf-headers.js 自動產生,請勿手改 public/_headers',
    '/css/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '/js/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    ''
  ].join('\n');

  return { path: '_headers', data: body };
});
