# YiiArt Rolled Checkout Dry-Run Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make reviewed rolled-canvas eligibility independent of a legacy empty `shippingProfile`, then regenerate an exact non-mutating dry-run for all 63 artworks.

**Architecture:** Keep `MigrationDecision.enableRolledCheckout` as the reviewed commercial input. The pure migration planner derives `allowCheckout`, writes `shippingProfile: "Ships rolled"` for eligible records, and continues generating only sizes whose longest side is at most `210 cm`; the existing guarded CLI publishes a write-once report and never mutates Sanity without `--apply`.

**Tech Stack:** TypeScript 5.9, Node `node:test`, `tsx`, Sanity migration CLI, PowerShell.

## Global Constraints

- All 63 artworks have sales authorization and complete storefront content.
- Direct checkout is limited to rolled canvas in this scope.
- Do not change stretched or framed prices, options, or shipping surcharges.
- Do not change payment providers, cart submission, checkout routes, URLs, or product media.
- Do not run the migration with `--apply` in this plan.
- Archive the current dry-run before publishing the replacement because reports are write-once artifacts.

---

## File Responsibilities

- `src/lib/catalog-migration.ts`: derive checkout eligibility and the Sanity patch from reviewed decisions.
- `src/lib/catalog-migration.test.ts`: lock the empty-profile eligibility, rejection gates, rolled-size limit, and idempotency contracts.
- `reports/catalog-migration/operator-decisions.json`: generated private operator decisions for exactly 63 artworks; ignored by Git.
- `reports/catalog-migration/dry-run.json`: generated write-once migration handoff; ignored by Git.
- `reports/catalog-migration/archive/`: retained superseded dry-run reports; ignored by Git.

### Task 1: Make Reviewed Rolled Eligibility Authoritative

**Files:**
- Modify: `src/lib/catalog-migration.ts`
- Modify: `src/lib/catalog-migration.test.ts`

**Interfaces:**
- Consumes: `MigrationDecision.rightsApproved`, `contentReady`, `enableRolledCheckout`, and generated direct sizes.
- Produces: `PlannedArtworkPatch.shippingProfile?: "Ships rolled"` and an `allowCheckout` value independent of the source profile.

- [ ] **Step 1: Write the failing eligibility test**

Add a test whose source has `shippingProfile: null`, all three reviewed booleans are `true`, and at least one direct size exists. Assert:

```ts
assert.equal(result.status, "ready")
if (result.status !== "ready") return
assert.equal(result.patch.allowCheckout, true)
assert.equal(result.patch.shippingProfile, "Ships rolled")
assert.ok(result.patch.standardSizes?.every((size) => Math.max(size.widthCm, size.heightCm) <= 210))
```

Also extend the idempotency fixture with `shippingProfile: "Ships rolled"` and assert the second plan omits `shippingProfile`.

- [ ] **Step 2: Run the focused test and verify the intended failure**

Run:

```powershell
npx tsx --test src/lib/catalog-migration.test.ts
```

Expected: FAIL because a null source profile currently forces `allowCheckout` false and the patch type has no `shippingProfile` field.

- [ ] **Step 3: Implement the minimal planner change**

Extend `PlannedArtworkPatch`:

```ts
shippingProfile: "Ships rolled"
```

Calculate eligibility without reading `source.shippingProfile`:

```ts
const mayCheckout = mayPublish
  && decision.enableRolledCheckout
  && directSizes.length > 0
```

After deriving `mayCheckout`, add the normalized profile only for an eligible record whose source is not already normalized:

```ts
if (mayCheckout && source.shippingProfile !== "Ships rolled") {
  patch.shippingProfile = "Ships rolled"
}
```

Do not change `frameOptions`, rolled pricing, or standard-size generation.

- [ ] **Step 4: Run focused and full unit verification**

Run:

```powershell
npx tsx --test src/lib/catalog-migration.test.ts
npm run test:unit
```

Expected: focused migration tests pass and the complete unit suite passes.

- [ ] **Step 5: Commit the planner change**

```powershell
git add -- src/lib/catalog-migration.ts src/lib/catalog-migration.test.ts
git commit -m "fix: derive rolled checkout from reviewed eligibility"
```

### Task 2: Regenerate And Audit The 63-Artwork Dry-Run

**Files:**
- Modify, generated: `reports/catalog-migration/operator-decisions.json`
- Archive, generated: `reports/catalog-migration/dry-run.json`
- Create, generated: `reports/catalog-migration/dry-run.json`

**Interfaces:**
- Consumes: the 63 current decisions, live Sanity source records, and `planArtworkMigration`.
- Produces: one reviewed dry-run with exact counts, proposed patches, artifact owner, and fingerprint.

- [ ] **Step 1: Update all operator approvals mechanically**

Load the decision array and set these exact fields on every record while preserving IDs, slugs, physical sizes, profiles, categories, room tags, color tags, style tags, and series values:

```ts
rightsApproved: true
contentReady: true
enableRolledCheckout: true
```

Validate before replacing the generated file:

```ts
decisions.length === 63
new Set(decisions.map((item) => item.artworkId)).size === 63
decisions.every((item) => item.rightsApproved && item.contentReady && item.enableRolledCheckout)
```

- [ ] **Step 2: Archive the superseded write-once report**

Resolve both source and archive directory under `reports/catalog-migration`, verify both remain inside the repository worktree, then move the current `dry-run.json` to:

```text
reports/catalog-migration/archive/dry-run-pre-rolled-approval-<UTC timestamp>.json
```

Expected: the canonical `reports/catalog-migration/dry-run.json` path is absent and the archived file remains readable JSON.

- [ ] **Step 3: Generate the replacement dry-run without apply**

Run:

```powershell
npx tsx scripts/migrate-made-to-order-catalog.mts --decisions="reports/catalog-migration/operator-decisions.json" --report-dir="reports/catalog-migration"
```

Expected console contract:

```text
total: 63
ready: 63
skipped: 0
dry-run only: no backup created and no mutation attempted
```

- [ ] **Step 4: Audit the report data**

Parse the JSON and assert:

```ts
report.sourceCount === 63
report.decisionCount === 63
report.summary.total === 63
report.summary.ready === 63
report.summary.skipped === 0
report.plans.every((plan) => plan.status === "ready")
report.plans.every((plan) => plan.patch.allowCheckout === true)
report.plans.every((plan) => plan.patch.shippingProfile === "Ships rolled")
report.plans.every((plan) => plan.patch.standardSizes.every(
  (size) => Math.max(size.widthCm, size.heightCm) <= 210,
))
report.plans.every((plan) => plan.patch.frameOptions.length === 1
  && plan.patch.frameOptions[0]._key === "rolled"
  && plan.patch.frameOptions[0].priceDeltaCny === 0)
```

Confirm that neither `reports/catalog-migration-backups` nor an apply-result or apply-lock artifact was created by this run.

- [ ] **Step 5: Run final verification and stop at approval**

Run:

```powershell
npm test
npm run build
git status --short
```

Expected: tests and production build pass; only intentionally generated ignored artifacts remain outside Git status. Report the exact decision counts, checkout counts, patch-field counts, oversize exclusions, fingerprint, and archive path. Do not run `--apply` until the user explicitly approves this exact dry-run.
