---
name: align-to-live-production
description: >-
  Aligns the local YiiArt git tree to the actually deployed production site
  before any storefront, visual, header, homepage, CSS, or deploy work. Use
  when editing Header, HeaderClient, homepage, EditorialHome, Hero, globals.css,
  brand logos, MesonArt-style UI, or when the user says 对齐, 对齐线上, live site,
  production, www.yiiart.com, deploy, or start a visual/design wave. Always
  run this first; do not restyle from a stale local HEAD.
---

# Align to live production first

YiiArt live site is `https://www.yiiart.com` (Vercel project `yart/yiiart-website`).

**Hard rule:** Before changing storefront UI, fetch remotes and confirm local `HEAD` is the same commit as production. Unfetched `origin/main` is not production. A matching local Header file is not production.

Incident this prevents: visual work applied on July 2026 `HEAD` while live was 37 commits ahead (`fa1188f` MesonArt storefront recovery). Shipping that work would have overwritten the live site.

## Do this before any visual/storefront edit

Copy and complete:

```
Align:
- [ ] git fetch origin
- [ ] local HEAD SHA
- [ ] origin/main SHA
- [ ] production deployment SHA / inspect
- [ ] live Header strings match local HeaderClient
- [ ] only then edit
```

### 1. Fetch and compare git

```powershell
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git log -1 --oneline HEAD
git log -1 --oneline origin/main
git status -sb
```

If `HEAD` is behind `origin/main`, local is stale. Do not edit yet.

### 2. Confirm what Vercel actually serves

```powershell
npx vercel whoami
npx vercel ls yiiart-website --prod
npx vercel inspect www.yiiart.com
```

Prefer the inspect output / production alias over assuming `origin/main`. If inspect has no git SHA, still require:

- `origin/main` after fetch
- live page strings matching local files (step 3)

If git and live disagree, **stop**. Align git to the live commit (or tell the user) before editing.

### 3. Open live and match chrome

Open `https://www.yiiart.com` (browser or fetch). Confirm against local files, not memory:

- Header lives in `src/components/HeaderClient.tsx` (wrapper is `Header.tsx`)
- Live chrome: light header, centered logo, nav includes Best Sellers / New In / All Art
- Home hero eyebrow: "New collection"

If local Header is dark sticky `bg-[#1d1c18]` with Shop Art / Size Guide, you are on the **old** tree. Stop.

### 4. Align the working tree

If there is uncommitted work:

1. Park it on a `wip/` branch and commit there (backup only; do not ship).
2. `git checkout main`
3. Fast-forward to the live commit (`git reset --hard origin/main` only after fetch and after the user asked to 对齐, or after parking WIP).

Then re-apply visual changes **on that tree**. Do not paste a rewrite of Header/home from the stale branch over the recovered storefront.

### 5. Only then edit

Increment the live Meson-like storefront. Keep YiiArt product strengths (size matrix, custom/WhatsApp, hand-painted copy). Do not invent live reviews.

## Never

- Start Header/home/CSS work from `git status` without `git fetch`
- Treat localhost as the live site
- Deploy a restyle that was built on a behind-`origin/main` commit
- Copy `wip/meson-on-stale-july27` Header over `HeaderClient.tsx`

## After alignment, tell the user

One short block: local SHA, `origin/main` SHA, production alias/SHA if known, and whether they match.
