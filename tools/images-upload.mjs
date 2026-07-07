#!/usr/bin/env node
// 日常圖片上傳:把專案根目錄 `r2-uploads/` 底下的檔案同步到 R2。
//   本機路徑 r2-uploads/<key>  ->  R2 物件 key = <key>  ->  https://img.casper.tw/<key>
// 因為 VS Code Paste Image 存到 r2-uploads/posts/<文章檔名>/xxx.png,
// 上傳後即對應貼上時已插入的 https://img.casper.tw/posts/<文章檔名>/xxx.png。
//
// 兩種後端(自動偵測):
//   - 有 .env(R2 API 金鑰)→ 走 aws-sdk(快;支援 ETag 內容去重、--force)。
//   - 沒有 .env → 自動改用 wrangler(靠 `wrangler login` 的 OAuth,免金鑰、免 .env);
//     也可用 --wrangler 明確指定。bucket/網域讀 tools/r2.config.mjs。
//
// 用法:
//   npm run images:upload            # 上傳;成功後刪除本機暫存
//   npm run images:upload -- --keep  # 上傳後保留本機檔
//   npm run images:upload -- --wrangler   # 強制用 wrangler(即使有 .env)
//   npm run images:upload -- --force # (aws-sdk)不比對 ETag,一律重傳
//   npm run images:upload -- --dry-run
import { rmSync, statSync, readFileSync, readdirSync, rmdirSync } from 'node:fs';
import path from 'node:path';
import {
  ROOT, getConfig, getBucket, getPublicBase, hasS3Creds, makeClient,
  walk, runPool, putObject, wranglerPut, headETag, md5hex, publicUrl,
} from './lib/r2.mjs';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const keep = args.has('--keep');
const force = args.has('--force');
const useWrangler = args.has('--wrangler') || !hasS3Creds();

const dir = path.join(ROOT, 'r2-uploads');
const files = walk(dir);
if (files.length === 0) {
  console.log('r2-uploads/ 沒有待上傳的檔案。');
  process.exit(0);
}

const cfg = useWrangler ? { bucket: getBucket(), publicBase: getPublicBase() } : getConfig();
const items = files.map((abs) => ({ abs, key: path.relative(dir, abs).split(path.sep).join('/') }));

console.log(
  `${dryRun ? '[dry-run] ' : ''}準備上傳 ${items.length} 個檔案到 R2 bucket「${cfg.bucket}」` +
  `(後端:${useWrangler ? 'wrangler OAuth' : 'aws-sdk'})…\n`
);

const conn = (useWrangler || dryRun) ? null : await makeClient(cfg);
let ok = 0, skip = 0, fail = 0;

await runPool(items, useWrangler ? 6 : 8, async ({ abs, key }) => {
  const url = publicUrl(cfg, key);
  if (dryRun) {
    console.log(`  ${key}  ->  ${url}  (${(statSync(abs).size / 1024).toFixed(0)} KB)`);
    return;
  }
  try {
    if (useWrangler) {
      await wranglerPut(cfg.bucket, key, abs);
    } else {
      const buf = readFileSync(abs);
      if (!force && (await headETag(conn, cfg, key)) === md5hex(buf)) {
        if (!keep) rmSync(abs);
        skip++;
        console.log(`  = ${url}(內容已在 R2,略過)`);
        return;
      }
      await putObject(conn, cfg, key, buf);
    }
    if (!keep) rmSync(abs);
    ok++;
    console.log(`  ✓ ${url}`);
  } catch (e) {
    fail++;
    console.error(`  ✗ ${key}: ${e.message}`);
  }
});

if (!dryRun && !keep) pruneEmptyDirs(dir);

console.log(`\n完成:上傳 ${ok}、略過(內容相同)${skip}、失敗 ${fail}${keep ? '(保留本機檔)' : ''}。`);
if (fail) process.exit(1);

// 上傳並刪檔後,清掉空掉的暫存資料夾(保留 r2-uploads/ 本身)。
function pruneEmptyDirs(root) {
  const walkDirs = (d) => {
    for (const name of readdirSync(d)) {
      const full = path.join(d, name);
      if (statSync(full).isDirectory()) walkDirs(full);
    }
    if (d !== root && readdirSync(d).length === 0) rmdirSync(d);
  };
  walkDirs(root);
}
