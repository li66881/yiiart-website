# Plan: MesonArt-Inspired YiiArt Full Redesign

**Date:** 2026-07-30  
**Branch (docs):** `feat/sprint0-mesonart-design-spec`  
**Code base of truth:** GitHub `main` (= yiiart.com)  
**Local note:** Pre-Sprint0 WIP stashed as `wip-before-sprint0-mesonart-redesign`. `git fetch` was flaky; main tarball extracted for reference at `%TEMP%\yiiart-main-extract\...`.

---

## Sprint progress (auto)

- [x] Sprint 0 docs + decisions locked
- [x] Tokens + Announcement/Trust bars
- [x] PDP gallery/buybox/accordion/rails/artist spotlight
- [x] Discovery ProductCard hover
- [x] Home Best sellers / styles / real homes / advisory
- [x] Footer shop links + cart/header padding
- [ ] Remaining content pages polish + QA screenshots
- [ ] Push branch / PR when user asks

- [x] Stash local divergent WIP  
- [x] Design Spec: `docs/superpowers/specs/2026-07-30-mesonart-inspired-redesign-design.md`  
- [x] Content/Copy/Reviews/Images Spec: `docs/superpowers/specs/2026-07-30-mesonart-inspired-content-copy.md`  
- [ ] User confirms Spec → proceed Sprint 1  

## Sprint 1 — Design tokens + global shell

1. Sync workspace to latest `main` (retry fetch / apply tarball reset)  
2. Extend `globals.css` tokens from Design Spec  
3. Build `AnnouncementBar`, `TrustBar`  
4. Refine `Header` / `Footer` to Spec hierarchy  
5. Wire EN/ZH keys from Content Spec §2  

## Sprint 2 — Product detail (highest priority)

1. `ProductGallery` (thumbs, arrows, swipe, lightbox, motion)  
2. `BuyBox` strict order  
3. Accordion four sections + handmade disclosure  
4. Rails: similar / artist / more to love  
5. Sample reviews JSON for UI preview  

## Sprint 3 — Discovery

1. Unified `ProductCard`  
2. Facet filters + sort  
3. Collection/shop grids  

## Sprint 4 — Home

Reorder sections per Design Spec §8; reuse cards/rails.

## Sprint 5 — Content + commerce chrome

Custom, real homes, reviews index, cart/checkout visual align.

## Sprint 6 — Polish + QA

Motion, mobile, a11y, content generation batch, release checklist.

---

## Locked decisions (2026-07-30)

1. Social proof (`X sold in last Y hours`): **placeholder first** (UI always present; replace with real aggregates later).  
2. Generated reviews: **allowed on production** (curated YiiArt-original copy + optional generated photos, marked in CMS).  
3. Sale countdown: **only when bound to a real `saleEndsAt`**.  

## Fidelity bar (user-confirmed)

Page layout, motion, and **small UI details** must match MesonArt closely — especially the **product detail page** (gallery arrangement, tag/copy hierarchy, image browse animation, buy-box order, badges, accordions, rails). Brand name, assets, and verbatim copy stay YiiArt; structure/spacing/interaction parity is the goal.
