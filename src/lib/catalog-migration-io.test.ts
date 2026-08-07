import assert from "node:assert/strict"
import test from "node:test"
import {
  buildBackupFilename,
  parseCatalogMigrationArgs,
  summarizeMigrationPlans,
} from "./catalog-migration-io"

test("supports a read-only inventory without a decision file", () => {
  assert.deepEqual(parseCatalogMigrationArgs([
    "--inventory-only",
    "--report-dir=reports/catalog-migration",
  ]), {
    apply: false,
    inventoryOnly: true,
    reportDir: "reports/catalog-migration",
  })
})

test("defaults a reviewed migration to dry-run", () => {
  assert.deepEqual(parseCatalogMigrationArgs([
    "--decisions=config/catalog-decisions.json",
    "--report-dir=reports/catalog-migration",
  ]), {
    apply: false,
    inventoryOnly: false,
    decisions: "config/catalog-decisions.json",
    reportDir: "reports/catalog-migration",
  })
})

test("requires explicit apply flag", () => {
  assert.equal(parseCatalogMigrationArgs([
    "--decisions=config/catalog-decisions.json",
    "--report-dir=reports/catalog-migration",
    "--apply",
  ]).apply, true)
})

test("rejects missing required arguments and empty values", () => {
  assert.throws(
    () => parseCatalogMigrationArgs(["--inventory-only"]),
    /--report-dir is required/,
  )
  assert.throws(
    () => parseCatalogMigrationArgs(["--inventory-only", "--report-dir="]),
    /--report-dir requires a non-empty value/,
  )
  assert.throws(
    () => parseCatalogMigrationArgs(["--decisions=", "--report-dir=reports/catalog-migration"]),
    /--decisions requires a non-empty value/,
  )
  assert.throws(
    () => parseCatalogMigrationArgs(["--report-dir=reports/catalog-migration"]),
    /--decisions is required unless --inventory-only is present/,
  )
})

test("rejects unknown flags and incompatible modes", () => {
  assert.throws(
    () => parseCatalogMigrationArgs(["--inventory-only", "--report-dir=reports/catalog-migration", "--force"]),
    /Unknown argument: --force/,
  )
  assert.throws(
    () => parseCatalogMigrationArgs([
      "--inventory-only",
      "--report-dir=reports/catalog-migration",
      "--apply",
    ]),
    /--apply cannot be used with --inventory-only/,
  )
})

test("creates timestamped backup names in UTC", () => {
  assert.equal(
    buildBackupFilename(new Date("2026-08-08T02:03:04.000Z")),
    "sanity-artworks-20260808-020304.json",
  )
})

test("summarizes ready records and every skipped reason", () => {
  assert.deepEqual(summarizeMigrationPlans([
    { status: "ready", artworkId: "a", patch: {} },
    { status: "skipped", artworkId: "b", reason: "slug_mismatch" },
    { status: "skipped", artworkId: "c", reason: "slug_mismatch" },
    { status: "skipped", artworkId: "d", reason: "missing_review_decision" },
  ]), {
    total: 4,
    ready: 1,
    skipped: 3,
    reasons: {
      slug_mismatch: 2,
      missing_review_decision: 1,
    },
  })
})
