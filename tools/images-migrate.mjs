#!/usr/bin/env node
// 一次性遷移:把既有本地資產(images / libs / demoFile)搬到 R2,
// 並把文章中的 /images/、/demoFile/ 參照改寫成 https://img.casper.tw/…。
// (/libs/ 在文章中都是外部 cdnjs 網址,不改;cssdemo 的 <link> 由主題 head.ejs 指向 R2。)
//
// 建議順序(先設好 R2 bucket + img.casper.tw 自訂網域):
//   1) node tools/images-migrate.mjs upload [images libs demoFile]   # 不指定則全上傳(已 detach 的自動略過)
//   2) node tools/images-migrate.mjs rewrite            # dry-run 預覽
//      node tools/images-migrate.mjs rewrite --apply    # 實際改寫(檔案在 git,可還原)
//   3) node tools/images-migrate.mjs detach [libs demoFile]          # 更名為 _<name>,Hexo 不再複製進 public
import { readFileSync, writeFileSync, existsSync, renameSync, mkdirSync, appendFileSync } from 'node:fs';
import path from 'node:path';
import {
  ROOT, getConfig, getBucket, getPublicBase, hasS3Creds, makeClient,
  walk, runPool, putObject, wranglerPut, objectExists, publicUrl,
} from './lib/r2.mjs';

const THEME_SRC = path.join(ROOT, 'themes', 'casper-2026', 'source');
const POSTS_ROOT = path.join(ROOT, 'source');
// wrangler 後端無便宜的 HeadObject,改用本機 ledger 記錄已上傳的 key,支援中斷後續傳。
const LEDGER = path.join(ROOT, 'r2-uploads', '.migrate-done.log');

// 要遷移到 R2 的本地資產資料夾。name 同時是 R2 key 前綴與 img.casper.tw 下的路徑。
const ASSETS = [
  { name: 'images', dir: path.join(THEME_SRC, 'images') },
  { name: 'libs', dir: path.join(THEME_SRC, 'libs') },
  { name: 'demoFile', dir: path.join(THEME_SRC, 'demoFile') },
];
// 文章中要改寫的根相對前綴(/libs/ 不列,因文章中皆為外部 cdnjs 網址)。
const REWRITE_PREFIXES = ['images', 'demoFile'];

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith('--')));
const targets = rest.filter((a) => !a.startsWith('--'));

switch (cmd) {
  case 'upload': await uploadAssets(); break;
  case 'rewrite': await rewriteRefs(); break;
  case 'detach': detachAssets(); break;
  default:
    console.log(`用法:node tools/images-migrate.mjs <upload|rewrite|detach> [names…] [--apply|--force|--wrangler]

  upload [names…]   上傳資產資料夾到 R2(key = <name>/<相對路徑>)。不指定 names 則全部(images libs demoFile)。
                    已存在的物件會略過(可重跑);加 --force 全部重傳。
  rewrite           改寫文章中的 /images/、/demoFile/ → <R2 網域>/…(預設 dry-run;加 --apply 才寫檔)。
  detach [names…]   把資產資料夾更名為 _<name>,讓 Hexo 不再複製進 public。不指定則全部。

  後端:有 .env(R2 API 金鑰)走 aws-sdk;沒有 .env 自動改用 wrangler(需先 wrangler login);--wrangler 強制。`);
    process.exit(cmd ? 1 : 0);
}

function chosenAssets() {
  return targets.length ? ASSETS.filter((a) => targets.includes(a.name)) : ASSETS;
}

// 來源資料夾:優先非底線版,detach 後改用 _<name>(讓修正/重傳不必先改名回去)。
function srcDir(a) {
  const det = path.join(path.dirname(a.dir), '_' + a.name);
  if (existsSync(a.dir)) return a.dir;
  if (existsSync(det)) return det;
  return null;
}

async function uploadAssets() {
  const present = chosenAssets().map((a) => ({ a, dir: srcDir(a) })).filter((x) => x.dir);
  if (!present.length) {
    console.log('沒有可上傳的資產資料夾。可指定:images / libs / demoFile。');
    return;
  }
  const force = flags.has('--force');
  const useWrangler = flags.has('--wrangler') || !hasS3Creds();
  const cfg = useWrangler ? { bucket: getBucket(), publicBase: getPublicBase() } : getConfig();
  const conn = useWrangler ? null : await makeClient(cfg);
  const done = useWrangler ? loadLedger() : null;

  const items = [];
  for (const { a, dir } of present) {
    for (const abs of walk(dir)) {
      items.push({ abs, key: `${a.name}/${path.relative(dir, abs).split(path.sep).join('/')}` });
    }
  }
  console.log(
    `上傳 ${items.length} 個檔案到 R2 bucket「${cfg.bucket}」(${present.map((x) => x.a.name).join(', ')})` +
    `(後端:${useWrangler ? 'wrangler OAuth' : 'aws-sdk'})…\n`
  );

  let up = 0, skip = 0, fail = 0;
  await runPool(items, useWrangler ? 6 : 8, async ({ abs, key }) => {
    try {
      if (useWrangler) {
        if (!force && done.has(key)) { skip++; return; }
        await wranglerPut(cfg.bucket, key, abs);
        markDone(key); done.add(key);
      } else {
        if (!force && (await objectExists(conn, cfg, key))) { skip++; return; }
        await putObject(conn, cfg, key, readFileSync(abs));
      }
      up++;
      if (up % 50 === 0) console.log(`  …已上傳 ${up}`);
    } catch (e) {
      fail++;
      console.error(`  ✗ ${key}: ${e.message}`);
    }
  });
  console.log(`\n完成:上傳 ${up}、略過(已存在)${skip}、失敗 ${fail}。`);
  if (items.length) console.log(`抽查:${publicUrl(cfg, items[0].key)}`);
  if (fail) process.exit(1);
}

// 本機 ledger(wrangler 後端用):記錄已成功上傳的 key,重跑時略過。放 r2-uploads/(已 gitignore)。
function loadLedger() {
  if (!existsSync(LEDGER)) return new Set();
  return new Set(readFileSync(LEDGER, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean));
}
function markDone(key) {
  mkdirSync(path.dirname(LEDGER), { recursive: true });
  appendFileSync(LEDGER, key + '\n');
}

async function rewriteRefs() {
  const BASE = getPublicBase(); // https://img.casper.tw(不需 R2 憑證)
  const apply = flags.has('--apply');
  const files = walk(POSTS_ROOT).filter((f) => /\.(md|markdown|html)$/i.test(f));

  let filesChanged = 0, totalRepl = 0;
  const samples = [];
  for (const file of files) {
    const before = readFileSync(file, 'utf8');
    const { content, n } = rewrite(before, BASE);
    if (n === 0) continue;
    guard(content, BASE, file); // 防止拼出 casper.twhttps / 雙前綴
    filesChanged++;
    totalRepl += n;
    if (samples.length < 8) samples.push({ file: path.relative(ROOT, file), n });
    if (apply) writeFileSync(file, content);
  }

  console.log(`${apply ? '' : '[dry-run] '}改寫 ${REWRITE_PREFIXES.map((p) => `/${p}/`).join('、')} → ${BASE}/…`);
  console.log(`  影響檔案:${filesChanged} 個,替換 ${totalRepl} 處。`);
  if (samples.length) {
    console.log('  範例:');
    for (const s of samples) console.log(`    ${s.file}  (${s.n} 處)`);
  }
  if (!apply) console.log('\n這是預覽。確認無誤後執行:node tools/images-migrate.mjs rewrite --apply');
  else console.log('\n已寫入。可用 `git diff -- source/_posts` 檢視。');
}

// 只在「真正的資源參照」語境改寫,避免動到內文/程式碼中的提及,也避免改到已是完整網址的字串。
function rewrite(content, BASE) {
  let n = 0;
  const bump = () => { n++; };
  const out = content
    // images:沿用既有分語境規則(含 front-matter photo: /images/…)
    .replace(/\]\(\/images\//g, () => (bump(), `](${BASE}/images/`))          // markdown ![]() / []()
    .replace(/=(["'])\/images\//g, (_, q) => (bump(), `=${q}${BASE}/images/`)) // html 屬性="…" / '…'
    .replace(/url\((["']?)\/images\//g, (_, q) => (bump(), `url(${q}${BASE}/images/`)) // css url()
    .replace(/^(\s*[A-Za-z_][\w-]*:\s+)\/images\//gm, (_, k) => (bump(), `${k}${BASE}/images/`)) // front-matter
    // demoFile:引號/括號緊接的根相對路徑(涵蓋 markdown ](、css url('、html attr="、JS 字串 '…')
    .replace(/([("'])\/demoFile\//g, (_, q) => (bump(), `${q}${BASE}/demoFile/`));
  return { content: out, n };
}

function guard(content, base, file) {
  const host = base.replace(/^https?:\/\//, ''); // img.casper.tw
  const bad = [host + 'http', base + base]; // 雙前綴 / 拼到別的協定
  for (const b of bad) {
    if (content.includes(b)) {
      throw new Error(`改寫產生異常字串「${b}」於 ${path.relative(ROOT, file)},已中止。請回報。`);
    }
  }
}

function detachAssets() {
  const chosen = chosenAssets();
  let any = false;
  for (const a of chosen) {
    const detached = path.join(path.dirname(a.dir), '_' + a.name);
    if (!existsSync(a.dir)) { console.log(`- ${a.name}:無來源(可能已 detach)`); continue; }
    if (existsSync(detached)) { console.log(`- ${a.name}:目標 _${a.name} 已存在,略過`); continue; }
    renameSync(a.dir, detached);
    console.log(`✓ ${a.name} → _${a.name}`);
    any = true;
  }
  if (any) {
    console.log('\nHexo 會略過底線開頭資料夾,故這些不再進 public、部署變輕(資源一律走 R2)。');
    console.log('本機仍保留備份(已在 .gitignore)。下一步 npm run rebuild 驗證後再部署。');
  }
}
