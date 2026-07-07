# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

卡斯伯 Blog (www.casper.tw) — a Hexo 8 static blog with ~364 posts. **HTML is deployed to GitHub Pages** (`master` branch, behind Cloudflare); **post images/assets live on Cloudflare R2** (served at `img.casper.tw`). Node 22 (`.nvmrc`). npm scripts wrap the workflow (`npm run deploy`, `npm run images:upload`, …); no tests/linters. You can still run Hexo directly with `npx hexo …`.

> **Why not Cloudflare Workers for the HTML?** `www.casper.tw` is the **user site** (`wcc723.github.io`), and other project repos are served at **`www.casper.tw/<repo>`** via GitHub Pages path routing. A Worker bound to `www.casper.tw` would only hold the blog and 404 those `/…` project paths — so the HTML stays on GitHub Pages. R2 (for images) is independent and kept. `wrangler.jsonc` + the Worker are vestigial (kept for reference); `wrangler` is still used by the R2 upload tools.

## Commands

```bash
npm run server        # = hexo server — local preview at http://localhost:4000, watches source/ & theme
npm run build         # = hexo generate — incremental build → public/  ("0 files generated" = already up to date)
npm run rebuild       # = hexo clean && hexo generate — full rebuild (after editing _config.yml, switching theme, stale output)
npm run deploy        # clean + generate + `hexo deploy` → force-push public/ to master (GitHub Pages)
npm run backup        # git push origin develop — backs up source

npm run images:upload                       # sync r2-uploads/ → Cloudflare R2 (new pasted images)
npm run images:migrate -- <upload|rewrite|detach>   # one-time /images → R2 migration (see 圖片與 R2 below)
```

- Editing `themes/casper-2026/source/css/style.css` or any `layout/**.ejs` is picked up by `hexo generate` / live-reloaded by `hexo server`. **CSS is hand-written — there is no CSS build step** (no Tailwind/PostCSS in the pipeline, despite a `hexo-renderer-stylus` dep that the active theme does not use).
- Changing **`_config.yml`** requires restarting `hexo server` (or `clean && generate`).

## Two themes, one active

`theme:` in root `_config.yml` selects the theme. **`casper-2026` is active**; `bootstrap-5` is the legacy theme kept for reference. To roll back, set `theme: bootstrap-5`. Most work happens in `themes/casper-2026/`.

## casper-2026 architecture

A single theme that renders **two distinct visual worlds** toggled by a `.dark` class on `<html>`:
- **Light = editorial magazine** (明體 serif, cream paper `#f7f4ee`, vermilion `#b5332a`, open borderless article rows) — the default.
- **Dark = terminal** (near-black, phosphor green, JetBrains Mono, CRT scanlines, card corner-brackets, mirror header).

Key mechanics that span multiple files:
- **All styling lives in one file**: `source/css/style.css`. Design tokens are CSS variables — `:root` defines the light palette, `html.dark{…}` overrides them for dark. Components reference `var(--…)`; mode-specific decorations use `html.dark …` / `html:not(.dark) …` selectors. To change anything visual, edit this file; don't look for per-component stylesheets.
- **Mode toggle**: `common/head.ejs` runs an inline script *before paint* that reads `localStorage['casper-theme']` (default from `theme.default_mode`) and adds `.dark` to `<html>` to avoid FOUC. `common/scripts.ejs` wires the header `#theme-toggle` button (writes localStorage, flips `.dark`, syncs `aria-pressed`).
- **Page flow**: `layout.ejs` is the shell (`head` → `.atmos` → `dark-fx` → `header` → `<main>{{body}}</main>` + `sidebar` → `footer` → `search` → `creatures` → `scripts`). Feed pages (`index/tag/category/archive`) render `common/feed.ejs` → `common/article-card.ejs` per post. `post.ejs`/`page.ejs` render content into `.prose`. The whole feed card is clickable via a stretched `.card h2 a::after` (thumb is a `<div>`, not a nested `<a>`).
- **Helper scripts** (`themes/casper-2026/scripts/`, auto-loaded by Hexo): `thumbnail` (first `<img>` in a post), `card-helpers` (`reading_time`, `thumb_fallback`, `card_excerpt`), `meta`, and `asset-version` (`asset_v('css/style.css')` → file-mtime string for cache-busting).

### Animated effects (gated, config-toggleable)

Two opt-in effect layers, each a partial with an inline IIFE that follows the same gating pattern — **start only when** the mode matches AND not `prefers-reduced-motion` AND tab visible AND (for heavy/canvas effects) desktop width; a `MutationObserver` on `<html>`'s class starts/stops them on light↔dark toggle; `visibilitychange` pauses them.
- `common/creatures.ejs` — **light-only** strolling kaomoji couple along the `.layout` edge, with a "hearts when close" easter egg. Flag: `creatures.enable`.
- `common/dark-fx.ejs` — **dark-only** single-glyph kaomoji rain (one throttled `<canvas>`, capped columns, central mask over the reading column), a rainbow "pixel" border-runner injected as a `.edge-runner` child into cards (avoids the card's `::before/::after` corner brackets), and a CSS sweep band. Flag: `dark_fx.enable`.

All theme config (menu, author, `book`, `social`, `google_adsense`, `plugins`, `comment`, effect flags) is in `themes/casper-2026/_config.yml`.

### External integrations (wired in head/scripts + theme _config)
GA4 (`G-97433H4032`), Facebook Pixel + comments, Google AdSense (`ca-pub-8296684122088055`, with `source/ads.txt`), ⌘K search reading `/content.json` (from `hexo-generator-json-content`; its `jsonContent` config lives in root `_config.yml`), Atom feed, `sitemap.xml`, `source/robots.txt`. SEO `<link rel=canonical>` + Article JSON-LD are emitted from `common/head.ejs`.

## Deploy & cache (important, repo-specific)

**HTML deploys to GitHub Pages** via `hexo-deployer-git` — `npm run deploy` = `hexo clean && hexo generate && hexo deploy` force-pushes `public/` → **`master`** (config in `_config.yml` `deploy:`). `git remote origin` is `git@github.com:Wcc723/wcc723.github.io.git` — the **same** repo: source on **`develop`** (`npm run backup` = `git push origin develop`), built site on **`master`**.

- **Custom domain / user site**: `source/CNAME` (= `www.casper.tw`) is copied into `public/CNAME` on build, preserving the GitHub Pages custom domain — **must stay**. `www.casper.tw` is the **user-site** domain; other project repos serve at `www.casper.tw/<repo>` via GitHub Pages path routing — **don't repoint `www` elsewhere or those break**.
- **Caching**: served behind Cloudflare; the CSS `<link>` is **cache-busted** with `?v=<mtime>` via `asset_v()`, so a CSS change ships a new URL and bypasses CDN/browser cache. HTML is served `DYNAMIC`. Root `_config.yml` `url:` is `https://www.casper.tw` for canonical/og/sitemap.
- **Cloudflare Workers (NOT used for HTML)**: `wrangler.jsonc` + `themes/casper-2026/scripts/cf-headers.js` (emits `public/_headers`) were set up while trying Workers hosting, then abandoned (a Worker on `www.casper.tw` would 404 the `/<project>` paths — see intro). They're harmless/vestigial; `_headers` is ignored by GitHub Pages. `wrangler` itself is still used by the R2 upload tools.

## 圖片與 R2 (image workflow, repo-specific)

Post images live on **Cloudflare R2**, served via custom domain **`img.casper.tw`**. The R2 **object key === the URL path** (no prefix): key `posts/foo/bar.png` → `https://img.casper.tw/posts/foo/bar.png`. Tooling is in **`tools/`** (`tools/lib/r2.mjs` = shared helpers). Uploads have **two auto-selected backends**: if `.env` (R2 API token, from `.env.example`, git-ignored) is present → `@aws-sdk/client-s3` (fast, parallel, ETag/HeadObject dedup); **otherwise it falls back to `wrangler r2 object put`** (OAuth via `wrangler login` — **no token/`.env`**, resumable via a local ledger). `--wrangler` forces the wrangler backend. Non-secret config (bucket name, `img.casper.tw`) lives in committed **`tools/r2.config.mjs`**.

- **New images (paste → upload)**: VS Code **Paste Image** (`mushan.vscode-paste-image`, configured in `.vscode/settings.json`) saves a pasted image to **`r2-uploads/posts/<post-basename>/<timestamp>.png`** (outside `source/`, so Hexo never copies it into `public/`) and auto-inserts the final markdown ref `![](https://img.casper.tw/posts/<post-basename>/<img>)`. Then `npm run images:upload` mirrors `r2-uploads/**` → R2 (key = path relative to `r2-uploads/`) and deletes the local temp files (`-- --keep` to retain, `-- --dry-run` to preview). **Local preview shows the image only after upload** (the ref points at R2 from the moment you paste).
- **Duplicate handling**: `images:upload` skips any file whose content already matches the R2 object at that key (compares R2 ETag = content MD5), so re-runs don't re-transfer; `-- --force` overrides. `images:migrate -- upload` skips keys that already exist (HeadObject). Note there is **no content-level dedup across different filenames** — the same image pasted twice gets two timestamped names → two R2 objects (Paste Image names by timestamp).
- **R2 setup** (one-time): create the bucket (`npx wrangler r2 bucket create casper-blog-images`, or dashboard) and connect the custom domain (**bucket → Settings → Custom Domains** → `img.casper.tw`). **Auth — pick one**: (a) `npx wrangler login` once → tooling uses wrangler OAuth, **no `.env`/token needed**; or (b) **R2 → Manage R2 API Tokens** → *Object Read & Write* → `cp .env.example .env` and fill Account ID + Access Key + Secret (bucket/domain default from `tools/r2.config.mjs`).
- **Legacy `/images` migration**: the old local `/images/*` (~100MB in `themes/casper-2026/source/images/`, 515 refs) was migrated to R2 at `https://img.casper.tw/images/*` (1:1 path map). Run order: `npm run images:migrate -- upload` (uploads the folder to R2, key `images/<rel>`, skips already-present, re-runnable) → `npm run images:migrate -- rewrite` (dry-run; then `-- rewrite --apply`) rewrites post refs (`/images/…` → `https://img.casper.tw/images/…`; anchored to real refs only — markdown/html/css/front-matter — never prose or the `firebasestorage` external URLs) → `npm run images:migrate -- detach` renames `images` → `_images` so Hexo stops copying it into `public/` (local backup kept, git-ignored). The 602 `firebasestorage.googleapis.com` refs are **left as-is** (external, still hosted).

## Conventions & gotchas

- **Post images are on R2** (`https://img.casper.tw/…`), not local. `themes/casper-2026/source/images/` was migrated and renamed **`_images`** (underscore ⇒ Hexo skips it; kept as a git-ignored local backup, no longer deployed). New pasted images stage in **`r2-uploads/`** (git-ignored) → `npm run images:upload`. See「圖片與 R2」above.
- **`libs` / `demoFile` are on R2 too** (`https://img.casper.tw/{libs,demoFile}/…`), migrated and renamed **`_libs` / `_demoFile`** (Hexo-skipped, git-ignored local backups). Post `/demoFile/…` refs were rewritten; the per-post `cssdemo` front-matter `<link>` is emitted straight to R2 by `head.ejs`. Post `/libs/…` matches were all external cdnjs URLs (untouched). Re-upload with `node tools/images-migrate.mjs upload libs demoFile --force` (auto-uses the `_`-prefixed backup). New theme-specific small assets go in **`source/img/`** (committed; e.g. `casper-avatar.webp`, `js-interview-cover.webp`).
- `design-previews/` is gitignored scratch (standalone HTML design mockups), not part of the site.
- `.deploy_git/` is hexo-deployer-git's working clone (gitignored).
- Posts are date-prefixed files in `source/_posts/` (`.html` and `.md`). Custom pages (`about`, `tags`) live in `source/`; the `/tags/` index needs `layout: tags` front-matter to render the tag cloud.
