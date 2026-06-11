# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

卡斯伯 Blog (www.casper.tw) — a Hexo 8 static blog with ~364 posts, deployed to GitHub Pages behind Cloudflare. Node 20 (`.nvmrc`). There are no npm scripts and no tests/linters; run Hexo directly with `npx hexo …`.

## Commands

```bash
npx hexo server                      # local preview at http://localhost:4000, watches source/ & theme
npx hexo generate                    # incremental build → public/  ("0 files generated" = already up to date)
npx hexo clean && npx hexo generate  # full rebuild (use after editing _config.yml, switching theme, or stale output)
npx hexo deploy                      # build is NOT run; deploys current public/ → live site (see Deploy below)
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

- `git remote origin` of this **source** repo is `git@github.com:Wcc723/wcc723.github.io.git` — the **same** repo that hosts the published site. Source lives on branch **`develop`**; the built site lives on **`master`**. `npx hexo deploy` (hexo-deployer-git) force-pushes `public/` → `master`; `git push origin develop` backs up the source. They do not interfere.
- The site is served at **www.casper.tw** behind **Cloudflare**, which caches static assets (`style.css` for up to 4h). The CSS `<link>` is **cache-busted** with `?v=<mtime>` via `asset_v()` — so a CSS change ships a new URL and bypasses the CDN/browser cache. HTML is served `DYNAMIC` (not CDN-cached). The custom domain is preserved by `source/CNAME` (must stay, or `hexo deploy` would drop the GitHub Pages domain). Root `_config.yml` `url:` is `https://www.casper.tw` so canonical/og/sitemap use the real domain.

## Conventions & gotchas

- **Do not delete `themes/casper-2026/source/{images,libs,demoFile}`** — they are large (~100MB) and gitignored (kept local, deployed via `public/`); many old posts reference `/libs/…` and `/demoFile/…` (per-post `cssdemo` front-matter). New theme-specific small assets go in **`source/img/`** (not `source/images/`), which *is* committed (e.g. `casper-avatar.webp`, `js-interview-cover.webp`).
- `design-previews/` is gitignored scratch (standalone HTML design mockups), not part of the site.
- `.deploy_git/` is hexo-deployer-git's working clone (gitignored).
- Posts are date-prefixed files in `source/_posts/` (`.html` and `.md`). Custom pages (`about`, `tags`) live in `source/`; the `/tags/` index needs `layout: tags` front-matter to render the tag cloud.
