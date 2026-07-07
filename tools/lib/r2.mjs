// R2 共用工具:.env 載入、S3 client、mime、遞迴走檔、上傳。
// R2 走 S3 相容 API(@aws-sdk/client-s3)。物件 key 直接對應 img.casper.tw 的路徑。
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bucket as CFG_BUCKET, publicBase as CFG_BASE } from '../r2.config.mjs';

// tools/lib/r2.mjs → 專案根目錄
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

// 極簡 .env 解析(不引入 dotenv;相容各 Node 20.x)。已存在的環境變數優先。
export function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!existsSync(envPath)) return;
  for (const raw of readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.replace(/^﻿/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

// bucket 名稱(非機密):env 優先,否則 tools/r2.config.mjs。
export function getBucket() {
  loadEnv();
  return process.env.R2_BUCKET || CFG_BUCKET;
}

// 對外公開網域(非機密):env 優先,否則 config。改寫參照與產生 URL 用,不需憑證。
export function getPublicBase() {
  loadEnv();
  return (process.env.R2_PUBLIC_BASE || CFG_BASE || 'https://img.casper.tw').replace(/\/+$/, '');
}

// 是否具備 aws-sdk(S3 API token)所需憑證。沒有 → 改走 wrangler OAuth。
export function hasS3Creds() {
  loadEnv();
  return ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'].every((k) => process.env[k]);
}

// 讀取並驗證 S3(aws-sdk)所需設定。缺憑證就明確報錯。bucket/網域可由 config 補齊。
export function getConfig() {
  loadEnv();
  const need = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'];
  const missing = need.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(
      `缺少 R2 環境變數:${missing.join(', ')}\n` +
      `請複製 .env.example 為 .env 並填入,或改用 wrangler 上傳(--wrangler / 未建 .env 時自動)。`
    );
  }
  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: getBucket(),
    publicBase: getPublicBase(),
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  };
}

// 動態載入 aws-sdk,讓不需上傳的指令(如 rewrite dry-run)即使還沒 npm install 也能跑。
export async function makeClient(cfg) {
  let S3Client, PutObjectCommand, HeadObjectCommand;
  try {
    ({ S3Client, PutObjectCommand, HeadObjectCommand } = await import('@aws-sdk/client-s3'));
  } catch {
    throw new Error('找不到 @aws-sdk/client-s3,請先執行 `npm install`。');
  }
  const client = new S3Client({
    region: 'auto',
    endpoint: cfg.endpoint,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
  return { client, PutObjectCommand, HeadObjectCommand };
}

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.bmp': 'image/bmp',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.m4v': 'video/x-m4v',
  '.mov': 'video/quicktime', '.pdf': 'application/pdf',
};
export function contentType(key) {
  return MIME[path.extname(key).toLowerCase()] || 'application/octet-stream';
}

// 遞迴列出目錄下所有檔案的絕對路徑(略過 .DS_Store 等隱藏檔)。
export function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (st.isFile()) out.push(full);
  }
  return out;
}

// 以固定併發數執行一批非同步工作。
export async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;
  async function next() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

// 上傳單一物件(圖片長快取;檔名唯一時 immutable 安全)。
export async function putObject({ client, PutObjectCommand }, cfg, key, body) {
  await client.send(new PutObjectCommand({
    Bucket: cfg.bucket,
    Key: key,
    Body: body,
    ContentType: contentType(key),
    CacheControl: 'public, max-age=31536000, immutable',
  }));
}

// HeadObject 判斷 key 是否已存在(供遷移時略過已上傳者、可重跑)。
export async function objectExists({ client, HeadObjectCommand }, cfg, key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: cfg.bucket, Key: key }));
    return true;
  } catch (e) {
    if (e?.$metadata?.httpStatusCode === 404 || e?.name === 'NotFound') return false;
    throw e;
  }
}

// 取物件 ETag(未加引號);不存在回 null。單段 PutObject 的 ETag 即內容 MD5 hex。
export async function headETag({ client, HeadObjectCommand }, cfg, key) {
  try {
    const r = await client.send(new HeadObjectCommand({ Bucket: cfg.bucket, Key: key }));
    return (r.ETag || '').replace(/"/g, '');
  } catch (e) {
    if (e?.$metadata?.httpStatusCode === 404 || e?.name === 'NotFound') return null;
    throw e;
  }
}

export function md5hex(buf) {
  return createHash('md5').update(buf).digest('hex');
}

export function publicUrl(cfg, key) {
  return `${cfg.publicBase}/${key.split('/').map(encodeURIComponent).join('/')}`;
}

// ── wrangler 後端(OAuth,不需 .env / API token)────────────────────────────
// 優先用 npm install 後的本地 wrangler(node_modules/.bin),否則退回 PATH 上的全域。
export function wranglerBin() {
  const local = path.join(ROOT, 'node_modules', '.bin', 'wrangler');
  return existsSync(local) ? local : 'wrangler';
}

// 用 `wrangler r2 object put` 上傳單一物件(--remote 確保寫到真正的雲端 bucket)。
export function wranglerPut(bucket, key, absPath) {
  const argv = [
    'r2', 'object', 'put', `${bucket}/${key}`,
    '--file', absPath,
    '--content-type', contentType(key),
    '--cache-control', 'public, max-age=31536000, immutable',
    '--remote',
  ];
  return new Promise((resolve, reject) => {
    const p = spawn(wranglerBin(), argv, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', (d) => { err += d; });
    p.on('error', (e) => reject(
      e.code === 'ENOENT'
        ? new Error('找不到 wrangler,請先 `npm install`(或全域安裝 wrangler)。')
        : e
    ));
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(err.trim() || `wrangler 結束碼 ${code}`))));
  });
}
