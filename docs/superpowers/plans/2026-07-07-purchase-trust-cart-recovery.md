# Purchase Trust And Cart Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add near-purchase reassurance to artwork pages and useful recovery paths to the empty cart state.

**Architecture:** Keep the change local to the product page and cart page. Add a static regression test that reads page source and verifies the customer-facing copy and route links remain present.

**Tech Stack:** Next.js App Router, React Server Components, client cart page, Node test runner via `tsx --test`.

## Global Constraints

- Do not change payment APIs, order storage, CMS schemas, or checkout behavior.
- Public copy must be premium and customer-facing, not implementation notes.
- Empty cart links must use existing routes: `/artworks`, `/contact`, and `/custom-painting`.

---

### Task 1: Add Regression Coverage

**Files:**
- Create: `src/lib/purchase-trust-copy.test.ts`

**Interfaces:**
- Consumes: source files `src/app/artwork/[slug]/page.tsx` and `src/app/cart/page.tsx`.
- Produces: tests that fail until the purchase trust copy and empty cart recovery links are present.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs"
import path from "node:path"
import test from "node:test"
import assert from "node:assert/strict"

test("artwork page shows purchase reassurance near buying actions", () => {
  const source = readFileSync(path.join(process.cwd(), "src", "app", "artwork", "[slug]", "page.tsx"), "utf8")

  assert.match(source, /PayPal secure checkout/)
  assert.match(source, /Free worldwide shipping/)
  assert.match(source, /30-day return window/)
  assert.match(source, /Extra photos before purchase/)
})

test("empty cart offers recovery paths for browsing advice and custom work", () => {
  const source = readFileSync(path.join(process.cwd(), "src", "app", "cart", "page.tsx"), "utf8")

  assert.match(source, /Shop curated artworks/)
  assert.match(source, /Request room advice/)
  assert.match(source, /Start a custom painting/)
  assert.match(source, /href="\/artworks"/)
  assert.match(source, /href="\/contact"/)
  assert.match(source, /href="\/custom-painting"/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/purchase-trust-copy.test.ts`
Expected: FAIL because the new customer-facing copy is not present yet.

### Task 2: Implement Page Copy And Layout

**Files:**
- Modify: `src/app/artwork/[slug]/page.tsx`
- Modify: `src/app/cart/page.tsx`

**Interfaces:**
- Consumes: the test from Task 1.
- Produces: visible trust copy on product pages and three empty-cart recovery links.

- [ ] **Step 1: Update product page**

Add a local `checkoutTrustItems` list and render it in the purchase panel close to the main CTA.

- [ ] **Step 2: Update empty cart**

Replace the single empty-state button with a quiet three-option recovery grid.

- [ ] **Step 3: Run focused test**

Run: `npm test -- src/lib/purchase-trust-copy.test.ts`
Expected: PASS.

### Task 3: Verify Whole Project

**Files:**
- No additional files.

**Interfaces:**
- Consumes: all modified source and test files.
- Produces: verified buildable project.

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 2: Run public copy check**

Run: `npm run copy:check`
Expected: public copy check passes.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Next.js build exits 0.
