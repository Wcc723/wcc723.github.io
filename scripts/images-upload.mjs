#!/usr/bin/env node
// 日常圖片上傳(搭配 VS Code 內建 Markdown 貼圖):
//   1) 貼圖(Cmd+V)→ VS Code 存到 r2-uploads/posts/<文章檔名>/,並在文章插入相對路徑
//      如 ![](../../r2-uploads/posts/<文章檔名>/image.png)(編輯器預覽可直接看到)。
//   2) 本指令把 r2-uploads/** 同步到 R2(key = 相對於 r2-uploads 的路徑),
//      並把文章中對應的相對路徑改寫成 https://img.casper.tw/<key>,最後刪掉本機暫存。
//
// 後端自動偵測:有 .env(R2 API 金鑰)走 aws-sdk;沒有則用 wrangler(需 wrangler login)。--wrangler 強制。
//
// 用法:
//   npm run images:upload            # 上傳 + 改寫文章 + 刪本機暫存
//   npm run images:upload -- --keep  # 保留本機檔(仍會改寫文章為 R2 網址)
//   npm run images:upload -- --force # (aws-sdk)不比對 ETag,一律重傳
//   npm run images:upload -- --dry-run
import { rmSync, statSync, readFileSync, writeFileSync, readdirSync, rmdirSync } from 'node:fs';
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
  `${dryRun ? '[dry-run] ' : ''}上傳 ${items.length} 個檔案到 R2 bucket「${cfg.bucket}」` +
  `(後端:${useWrangler ? 'wrangler OAuth' : 'aws-sdk'})…\n`
);

const conn = (useWrangler || dryRun) ? null : await makeClient(cfg);
let ok = 0, skip = 0, fail = 0;
const doneKeys = new Set(); // 已確認在 R2 的 key(上傳成功或內容相同)

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
        doneKeys.add(key);
        skip++;
        console.log(`  = ${url}(內容已在 R2,略過)`);
        return;
      }
      await putObject(conn, cfg, key, buf);
    }
    doneKeys.add(key);
    ok++;
    console.log(`  ✓ ${url}`);
  } catch (e) {
    fail++;
    console.error(`  ✗ ${key}: ${e.message}`);
  }
});

// 改寫文章中對應的相對路徑 → R2 網址(只改已確認在 R2 的 key)
let rw = { files: 0, refs: 0 };
if (!dryRun && doneKeys.size) rw = rewritePostRefs(doneKeys, cfg.publicBase);

// 刪除已上傳的本機暫存(除非 --keep)
if (!dryRun && !keep) {
  for (const { abs, key } of items) if (doneKeys.has(key)) { try { rmSync(abs); } catch {} }
  pruneEmptyDirs(dir);
}

console.log(
  `\n完成:上傳 ${ok}、略過 ${skip}、失敗 ${fail}` +
  `${dryRun ? '' : `;改寫文章 ${rw.files} 檔、${rw.refs} 處 → ${cfg.publicBase}/…`}` +
  `${keep ? '(保留本機檔)' : ''}。`
);
if (fail) process.exit(1);

// 把文章中的 (相對前綴)r2-uploads/<key> 改寫成 <R2 網域>/<key>。只改已上傳的 key。
function rewritePostRefs(doneKeys, base) {
  const postFiles = walk(path.join(ROOT, 'source')).filter((f) => /\.(md|markdown|html)$/i.test(f));
  const re = /(\]\(|(?:src|href)=["'])((?:\.{1,2}\/)*)r2-uploads\/([^)"'\s]+)/g;
  let filesChanged = 0, refs = 0;
  for (const file of postFiles) {
    const before = readFileSync(file, 'utf8');
    const after = before.replace(re, (m, anchor, _prefix, rest) => {
      if (doneKeys.has(rest) || doneKeys.has(decodeURIComponent(rest))) { refs++; return `${anchor}${base}/${rest}`; }
      return m;
    });
    if (after !== before) { writeFileSync(file, after); filesChanged++; }
  }
  return { files: filesChanged, refs };
}

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
