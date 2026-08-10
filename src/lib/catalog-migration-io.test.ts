import assert from "node:assert/strict"
import {
  link,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  rename,
  rm,
  symlink,
  unlink,
  writeFile,
} from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import { pathToFileURL } from "node:url"
import {
  acquireApplyLease,
  applyPlansSequentially,
  buildBackupFilename,
  createApplyResultPersister,
  createDryRunReport,
  indexMigrationDecisions,
  parseCatalogMigrationArgs,
  parseMigrationDecisions,
  prepareContainedOutputDirectory,
  repositoryRootFromScriptUrl,
  runApplyMigration,
  summarizeMigrationPlans,
  UncertainMutationError,
  verifyDryRunReportForApply,
  writeAndVerifyBackup,
  writeDryRunReportOnce,
  writeJsonCrashDurableOnce,
  type ApplyResult,
  type MigrationSourceRecord,
} from "./catalog-migration-io"
import type { MigrationDecision, PlannedArtworkMigration } from "./catalog-migration"

const validDecision: MigrationDecision = {
  artworkId: "art-1",
  expectedSlug: "green-rain-study",
  sizeProfile: "three-four",
  category: "Textured Art",
  roomTypes: ["Living room"],
  colorFamilies: ["Green"],
  styleTags: ["Organic"],
  rightsApproved: false,
  contentReady: false,
  enableRolledCheckout: false,
  seriesSlug: "green-rain",
  seriesRank: 1.5,
}

function sourceRecord(id: string, revision = `rev-${id}`): MigrationSourceRecord {
  return {
    _id: id,
    _rev: revision,
    slug: { current: `slug-${id}` },
  }
}

function decisionFor(source: MigrationSourceRecord): MigrationDecision {
  return {
    ...validDecision,
    artworkId: source._id,
    expectedSlug: source.slug?.current ?? "",
  }
}

function readyPlan(
  source: MigrationSourceRecord,
  patch: Extract<PlannedArtworkMigration, { status: "ready" }>["patch"] = { allowCheckout: false },
): PlannedArtworkMigration {
  return { status: "ready", artworkId: source._id, patch }
}

function cloneResult(result: ApplyResult) {
  return structuredClone(result)
}

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

test("validates the complete operator decision shape and domains", () => {
  assert.deepEqual(parseMigrationDecisions([validDecision]), [validDecision])

  const invalidCases: Array<[string, unknown, RegExp]> = [
    ["expected slug", { ...validDecision, expectedSlug: " " }, /decision 0 expectedSlug must be a non-empty string/],
    ["size profile", { ...validDecision, sizeProfile: "poster" }, /decision 0 sizeProfile must be one of/],
    ["category", { ...validDecision, category: "Other" }, /decision 0 category must be one of/],
    ["room", { ...validDecision, roomTypes: ["Garage"] }, /decision 0 roomTypes\[0\] must be one of/],
    ["color", { ...validDecision, colorFamilies: ["Purple"] }, /decision 0 colorFamilies\[0\] must be one of/],
    ["style tag", { ...validDecision, styleTags: [""] }, /decision 0 styleTags\[0\] must be a non-empty string/],
    ["approval", { ...validDecision, rightsApproved: "false" }, /decision 0 rightsApproved must be a boolean/],
    ["series slug", { ...validDecision, seriesSlug: "" }, /decision 0 seriesSlug must be a non-empty string/],
    ["series rank", { ...validDecision, seriesRank: Number.POSITIVE_INFINITY }, /decision 0 seriesRank must be finite/],
    ["physical size", { ...validDecision, physicalSize: { widthCm: -1, heightCm: 20 } }, /decision 0 physicalSize.widthCm must be positive and finite/],
    ["unknown field", { ...validDecision, accidentalApproval: true }, /decision 0 contains unknown field: accidentalApproval/],
  ]

  for (const [label, value, expected] of invalidCases) {
    assert.throws(() => parseMigrationDecisions([value]), expected, label)
  }
})

test("rejects malformed and duplicate operator decisions before planning", () => {
  assert.throws(
    () => parseMigrationDecisions({ decisions: [validDecision] }),
    /Migration decisions must be a JSON array/,
  )
  assert.throws(
    () => parseMigrationDecisions([{ ...validDecision, artworkId: "" }]),
    /decision 0 artworkId must be a non-empty string/,
  )

  const source = sourceRecord("art-1")
  assert.throws(
    () => indexMigrationDecisions([validDecision, validDecision], [source]),
    /Duplicate migration decision for artworkId: art-1/,
  )
})

test("confines report output and rejects traversal, absolute, and symlink escapes", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-repo-"))
  const outside = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-outside-"))
  context.after(async () => {
    await rm(repository, { recursive: true, force: true })
    await rm(outside, { recursive: true, force: true })
  })
  await mkdir(path.join(repository, "reports"), { recursive: true })

  await assert.rejects(
    prepareContainedOutputDirectory(repository, "..\\outside"),
    /Output directory must stay within the repository reports directory/,
  )
  await assert.rejects(
    prepareContainedOutputDirectory(repository, outside),
    /Output directory must stay within the repository reports directory/,
  )

  const escape = path.join(repository, "reports", "catalog-migration")
  await symlink(outside, escape, "junction")
  await assert.rejects(
    prepareContainedOutputDirectory(repository, path.join("reports", "catalog-migration")),
    /Output directory resolves outside|contains a symbolic link/,
  )
  await rm(escape)

  const contained = await prepareContainedOutputDirectory(
    repository,
    path.join("reports", "catalog-migration"),
  )
  assert.equal(contained, path.join(repository, "reports", "catalog-migration"))
})

test("crash-durable publication syncs the file before the parent directory", async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-json-"))
  context.after(() => rm(directory, { recursive: true, force: true }))
  const reportDirectory = path.join(directory, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const filePath = path.join(reportDirectory, "checkpoint.json")
  const events: string[] = []

  await writeJsonCrashDurableOnce(filePath, { state: "ready" }, {
    repositoryRoot: directory,
    io: {
      open: async (target, flags) => {
        if (flags === "wx") {
          const handle = await open(target, "wx")
          return {
            writeFile: async (data: string) => {
              events.push("file:write")
              await handle.writeFile(data, "utf8")
            },
            sync: async () => {
              events.push("file:sync")
              await handle.sync()
            },
            close: () => handle.close(),
          }
        }
        assert.equal(target, reportDirectory)
        return {
          writeFile: async () => undefined,
          sync: async () => { events.push("directory:sync") },
          close: async () => undefined,
        }
      },
      link,
      unlink,
    },
  })

  assert.deepEqual(JSON.parse(await readFile(filePath, "utf8")), { state: "ready" })
  assert.ok(events.indexOf("file:sync") < events.indexOf("directory:sync"))
})

test("directory sync fallback syncs the published destination handle", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-windows-sync-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const filePath = path.join(reportDirectory, "checkpoint.json")
  const events: string[] = []

  await writeJsonCrashDurableOnce(filePath, { state: "ready" }, {
    repositoryRoot: repository,
    io: {
      open: async (target, flags) => {
        if (flags === "wx") {
          const handle = await open(target, "wx")
          return {
            writeFile: (data: string) => handle.writeFile(data, "utf8").then(() => undefined),
            sync: () => handle.sync(),
            close: () => handle.close(),
          }
        }
        if (target === reportDirectory) {
          return {
            writeFile: async () => undefined,
            sync: async () => {
              events.push("directory:sync:unsupported")
              throw Object.assign(new Error("directory sync unsupported"), { code: "EPERM" })
            },
            close: async () => undefined,
          }
        }
        assert.equal(target, filePath)
        return {
          writeFile: async () => undefined,
          sync: async () => { events.push("destination:sync") },
          close: async () => undefined,
        }
      },
      link,
      unlink,
    },
  })

  assert.deepEqual(events, ["directory:sync:unsupported", "destination:sync"])
})

test("write-once publication never replaces a target created during the publish race", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-target-race-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const filePath = path.join(reportDirectory, "dry-run.json")

  await assert.rejects(writeJsonCrashDurableOnce(filePath, { owned: true }, {
    repositoryRoot: repository,
    beforePublish: () => writeFile(filePath, "unrelated race winner\n", "utf8"),
  }), /destination appeared during publication|EEXIST/)

  assert.equal(await readFile(filePath, "utf8"), "unrelated race winner\n")
})

test("write boundary rejects an ancestor swapped after the temporary file sync", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-ancestor-race-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  const movedDirectory = path.join(repository, "reports", "catalog-migration-moved")
  await mkdir(reportDirectory, { recursive: true })
  const filePath = path.join(reportDirectory, "dry-run.json")

  await assert.rejects(writeJsonCrashDurableOnce(filePath, { owned: true }, {
    repositoryRoot: repository,
    beforePublish: async () => {
      await rename(reportDirectory, movedDirectory)
      await mkdir(reportDirectory)
    },
  }), /Output directory changed during publication/)

  assert.equal(await readFile(filePath, "utf8").catch(() => null), null)
})

test("post-publication mismatch never unlinks a destination pathname", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-post-link-race-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  const movedDirectory = path.join(repository, "reports", "catalog-migration-moved")
  await mkdir(reportDirectory, { recursive: true })
  const filePath = path.join(reportDirectory, "dry-run.json")
  const displacedPublication = path.join(movedDirectory, "displaced-publication.json")
  let destinationUnlinkAttempted = false

  await assert.rejects(writeJsonCrashDurableOnce(filePath, { owned: true }, {
    repositoryRoot: repository,
    io: {
      open: async (target, flags) => {
        const handle = await open(target, flags)
        return {
          writeFile: (data: string) => handle.writeFile(data, "utf8"),
          sync: () => handle.sync(),
          close: () => handle.close(),
        }
      },
      link,
      unlink: async (target) => {
        if (target === filePath) {
          destinationUnlinkAttempted = true
          await rename(target, displacedPublication)
          await writeFile(target, "unrelated replacement\n", "utf8")
        }
        await unlink(target)
      },
    },
    afterPublish: async () => {
      await rename(reportDirectory, movedDirectory)
      await symlink(movedDirectory, reportDirectory, "junction")
    },
  }), /Output directory changed after publication/)

  assert.equal(destinationUnlinkAttempted, false)
  assert.deepEqual(
    JSON.parse(await readFile(path.join(movedDirectory, "dry-run.json"), "utf8")),
    { owned: true },
  )
  const recoveryArtifacts = (await readdir(movedDirectory)).filter((name) => name.endsWith(".tmp"))
  assert.equal(recoveryArtifacts.length, 1)
  assert.deepEqual(
    JSON.parse(await readFile(path.join(movedDirectory, recoveryArtifacts[0]), "utf8")),
    { owned: true },
  )
})

test("post-publication mismatch preserves an unrelated replacement and recovery artifact", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-post-link-replacement-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const filePath = path.join(reportDirectory, "dry-run.json")
  const movedPublication = path.join(reportDirectory, "created-inode.json")
  let failureMessage = ""

  await assert.rejects(writeJsonCrashDurableOnce(filePath, { owned: true }, {
    repositoryRoot: repository,
    afterPublish: async () => {
      await rename(filePath, movedPublication)
      await writeFile(filePath, "unrelated replacement\n", "utf8")
    },
  }), (error: unknown) => {
    if (!(error instanceof Error)) return false
    failureMessage = error.message
    return /manual reconciliation is required/.test(error.message)
  })

  assert.equal(await readFile(filePath, "utf8"), "unrelated replacement\n")
  assert.deepEqual(JSON.parse(await readFile(movedPublication, "utf8")), { owned: true })
  const recoveryArtifacts = (await readdir(reportDirectory)).filter((name) => name.endsWith(".tmp"))
  assert.equal(recoveryArtifacts.length, 1)
  assert.ok(failureMessage.includes(path.join(reportDirectory, recoveryArtifacts[0])))
  assert.deepEqual(
    JSON.parse(await readFile(path.join(reportDirectory, recoveryArtifacts[0]), "utf8")),
    { owned: true },
  )
})

test("dry-run handoff has exact ownership and never replaces same-shape JSON", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-dry-run-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const filePath = path.join(reportDirectory, "dry-run.json")
  const sameShape = {
    sourceCount: 63,
    decisionCount: 0,
    summary: { total: 63, ready: 0, skipped: 63, reasons: {} },
    plans: [],
  }
  await writeFile(filePath, `${JSON.stringify(sameShape)}\n`, "utf8")

  await assert.rejects(
    writeDryRunReportOnce({
      repositoryRoot: repository,
      reportDirectory,
      owner: { projectId: "project-a", dataset: "production", runId: "run-1" },
      report: sameShape,
    }),
    /EEXIST|already exists/,
  )
  assert.deepEqual(JSON.parse(await readFile(filePath, "utf8")), sameShape)

  await unlink(filePath)
  await writeDryRunReportOnce({
    repositoryRoot: repository,
    reportDirectory,
    owner: { projectId: "project-a", dataset: "production", runId: "run-1" },
    report: {
      ...sameShape,
      format: "unrelated-format",
      version: 999,
      owner: { projectId: "other", dataset: "other", runId: "other" },
    },
  })
  const owned = JSON.parse(await readFile(filePath, "utf8"))
  assert.equal(owned.format, "yiiart-catalog-migration-dry-run")
  assert.equal(owned.version, 2)
  assert.deepEqual(owned.owner, { projectId: "project-a", dataset: "production", runId: "run-1" })
})

test("dry-run then apply verifies an identical fingerprint without overwriting the handoff", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-handoff-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const sources = [sourceRecord("art-1")]
  const decisions = [decisionFor(sources[0])]
  const plans = [readyPlan(sources[0])]
  const report = createDryRunReport({ sources, decisions, plans })
  const owner = { projectId: "project-a", dataset: "production", runId: "run-1" }

  await writeDryRunReportOnce({ repositoryRoot: repository, reportDirectory, owner, report })
  const filePath = path.join(reportDirectory, "dry-run.json")
  const before = await readFile(filePath, "utf8")
  const verifiedOwner = await verifyDryRunReportForApply({
    repositoryRoot: repository,
    reportDirectory,
    projectId: owner.projectId,
    dataset: owner.dataset,
    expectedReport: createDryRunReport({ sources, decisions, plans }),
  })

  assert.deepEqual(verifiedOwner, owner)
  assert.equal(await readFile(filePath, "utf8"), before)
})

test("apply handoff rejects stale sources and different decisions", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-stale-handoff-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const sources = [sourceRecord("art-1")]
  const decisions = [decisionFor(sources[0])]
  const plans = [readyPlan(sources[0])]
  const report = createDryRunReport({ sources, decisions, plans })
  await writeDryRunReportOnce({
    repositoryRoot: repository,
    reportDirectory,
    owner: { projectId: "project-a", dataset: "production", runId: "run-1" },
    report,
  })

  const staleSources = [sourceRecord("art-1", "rev-changed")]
  await assert.rejects(verifyDryRunReportForApply({
    repositoryRoot: repository,
    reportDirectory,
    projectId: "project-a",
    dataset: "production",
    expectedReport: createDryRunReport({ sources: staleSources, decisions, plans }),
  }), /does not match the current source, decisions, and plans/)

  await assert.rejects(verifyDryRunReportForApply({
    repositoryRoot: repository,
    reportDirectory,
    projectId: "project-a",
    dataset: "production",
    expectedReport: createDryRunReport({
      sources,
      decisions: [{ ...decisions[0], rightsApproved: true }],
      plans,
    }),
  }), /does not match the current source, decisions, and plans/)
})

test("apply result persister keeps checkpoints immutable and writes canonical result only at terminal", async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-result-"))
  context.after(() => rm(directory, { recursive: true, force: true }))
  const reportDirectory = path.join(directory, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const journal = createApplyResultPersister({
    repositoryRoot: directory,
    reportDirectory,
    owner: { projectId: "project-a", dataset: "production", runId: "run-1" },
  })
  const initial: ApplyResult = {
    appliedIds: [], skippedIds: [], pendingIds: [], uncertain: [], errors: [],
  }

  await journal.preflightTerminal()
  await journal.persistCheckpoint(initial)
  await journal.persistCheckpoint({ ...initial, pendingIds: ["art-1"] })
  const final = { ...initial, appliedIds: ["art-1"] }
  await journal.persistCheckpoint(final)

  const finalCheckpoint = path.join(
    reportDirectory,
    "apply-runs",
    "run-1",
    "checkpoints",
    "000002.json",
  )
  assert.deepEqual(JSON.parse(await readFile(finalCheckpoint, "utf8")), {
    format: "yiiart-catalog-migration-apply-result",
    version: 2,
    owner: { projectId: "project-a", dataset: "production", runId: "run-1" },
    sequence: 2,
    appliedIds: ["art-1"],
    skippedIds: [],
    pendingIds: [],
    uncertain: [],
    errors: [],
  })

  assert.equal(
    await readFile(path.join(reportDirectory, "apply-result.json"), "utf8").catch(() => null),
    null,
  )

  const canonicalPath = await journal.persistTerminal(final)
  assert.equal(canonicalPath, path.join(reportDirectory, "apply-result.json"))
  assert.deepEqual(JSON.parse(await readFile(canonicalPath, "utf8")), {
    format: "yiiart-catalog-migration-apply-result",
    version: 3,
    owner: { projectId: "project-a", dataset: "production", runId: "run-1" },
    latestCheckpoint: "apply-runs/run-1/checkpoints/000002.json",
    appliedIds: ["art-1"],
    skippedIds: [],
    pendingIds: [],
    uncertain: [],
    errors: [],
  })

  const nextRun = createApplyResultPersister({
    repositoryRoot: directory,
    reportDirectory,
    owner: { projectId: "project-a", dataset: "production", runId: "run-2" },
  })
  await assert.rejects(
    nextRun.preflightTerminal(),
    /Canonical apply result already exists before backup or mutation.*manual reconciliation is required/,
  )
  assert.equal(
    JSON.parse(await readFile(path.join(reportDirectory, "apply-result.json"), "utf8")).owner.runId,
    "run-1",
  )
})

test("partial-error and uncertain terminal summaries are canonical write-once files", async (context) => {
  const cases: Array<{ runId: string; result: ApplyResult }> = [
    {
      runId: "partial-run",
      result: {
        appliedIds: ["art-1"],
        skippedIds: ["art-3"],
        pendingIds: [],
        uncertain: [],
        errors: [{ artworkId: "art-2", message: "commit rejected" }],
      },
    },
    {
      runId: "uncertain-run",
      result: {
        appliedIds: [],
        skippedIds: [],
        pendingIds: ["art-1"],
        uncertain: [{ artworkId: "art-1", message: "response lost" }],
        errors: [],
      },
    },
  ]

  for (const testCase of cases) {
    const repository = await mkdtemp(path.join(os.tmpdir(), `catalog-migration-${testCase.runId}-`))
    context.after(() => rm(repository, { recursive: true, force: true }))
    const reportDirectory = path.join(repository, "reports", "catalog-migration")
    await mkdir(reportDirectory, { recursive: true })
    const journal = createApplyResultPersister({
      repositoryRoot: repository,
      reportDirectory,
      owner: { projectId: "project-a", dataset: "production", runId: testCase.runId },
    })

    await journal.preflightTerminal()
    await journal.persistCheckpoint(testCase.result)
    const resultPath = await journal.persistTerminal(testCase.result)
    const canonical = JSON.parse(await readFile(resultPath, "utf8"))
    assert.deepEqual({
      appliedIds: canonical.appliedIds,
      skippedIds: canonical.skippedIds,
      pendingIds: canonical.pendingIds,
      uncertain: canonical.uncertain,
      errors: canonical.errors,
    }, testCase.result)
    assert.equal(
      canonical.latestCheckpoint,
      `apply-runs/${testCase.runId}/checkpoints/000000.json`,
    )
    await assert.rejects(journal.persistTerminal(testCase.result), /already exists|previous-run file/)
  }
})

test("pre-existing canonical result aborts before backup, identity read, or patch", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-canonical-preflight-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const canonicalPath = path.join(reportDirectory, "apply-result.json")
  const existingCanonical = {
    format: "yiiart-catalog-migration-apply-result",
    version: 3,
    owner: { projectId: "project-a", dataset: "production", runId: "previous-run" },
  }
  await writeFile(canonicalPath, `${JSON.stringify(existingCanonical)}\n`, "utf8")

  const sources = Array.from({ length: 63 }, (_, index) => sourceRecord(`art-${index}`))
  const plans: PlannedArtworkMigration[] = sources.map((source, index) => index === 0
    ? readyPlan(source)
    : { status: "skipped", artworkId: source._id, reason: "missing_review_decision" })
  const journal = createApplyResultPersister({
    repositoryRoot: repository,
    reportDirectory,
    owner: { projectId: "project-a", dataset: "production", runId: "current-run" },
  })
  const events: string[] = []

  await assert.rejects(runApplyMigration({
    token: "configured",
    sources,
    plans,
    decisionsByArtworkId: new Map([[sources[0]._id, decisionFor(sources[0])]]),
    acquireLease: async () => {
      events.push("lease:acquire")
      return {
        release: async () => { events.push("lease:release") },
        retain: async () => { events.push("lease:retain") },
      }
    },
    preflightTerminalResult: async () => {
      events.push("canonical:preflight")
      await journal.preflightTerminal()
    },
    writeBackup: async () => {
      events.push("backup")
      return "backup.json"
    },
    readCurrentIdentity: async (artworkId) => {
      events.push(`identity:${artworkId}`)
      const source = sources[0]
      return { _id: source._id, _rev: source._rev, slug: source.slug }
    },
    commitPatch: async ({ artworkId }) => { events.push(`patch:${artworkId}`) },
    persistResult: journal.persistCheckpoint,
    persistTerminalResult: journal.persistTerminal,
  }), /Canonical apply result already exists before backup or mutation.*manual reconciliation is required/)

  assert.deepEqual(events, ["lease:acquire", "canonical:preflight", "lease:release"])
  assert.deepEqual(JSON.parse(await readFile(canonicalPath, "utf8")), existingCanonical)
  assert.equal(
    await readFile(path.join(reportDirectory, "apply-runs", "current-run", "checkpoints", "000000.json"), "utf8")
      .catch(() => null),
    null,
  )
})

test("canonical appearance race preserves terminal recovery and retains the lease", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-canonical-race-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const canonicalPath = path.join(reportDirectory, "apply-result.json")
  const raceWinner = "unrelated canonical race winner\n"
  const sources = Array.from({ length: 63 }, (_, index) => sourceRecord(`art-${index}`))
  const plans = sources.map((source) => readyPlan(source))
  const owner = { projectId: "project-a", dataset: "production", runId: "race-run" }
  const journal = createApplyResultPersister({ repositoryRoot: repository, reportDirectory, owner })
  const events: string[] = []

  await assert.rejects(runApplyMigration({
    token: "configured",
    sources,
    plans,
    decisionsByArtworkId: new Map(sources.map((source) => [source._id, decisionFor(source)])),
    acquireLease: async () => {
      events.push("lease:acquire")
      const lease = await acquireApplyLease({
        repositoryRoot: repository,
        reportDirectory,
        owner,
        createdAt: "2026-08-08T02:03:04.000Z",
      })
      return {
        release: async () => {
          events.push("lease:release")
          await lease.release()
        },
        retain: async () => {
          events.push("lease:retain")
          await lease.retain()
        },
      }
    },
    preflightTerminalResult: async () => {
      events.push("canonical:preflight")
      await journal.preflightTerminal()
    },
    writeBackup: async () => {
      events.push("backup")
      return "backup.json"
    },
    readCurrentIdentity: async (artworkId) => {
      events.push(`identity:${artworkId}`)
      const source = sources.find((item) => item._id === artworkId)!
      return { _id: source._id, _rev: source._rev, slug: source.slug }
    },
    commitPatch: async ({ artworkId }) => {
      events.push(`patch:${artworkId}`)
      await writeFile(canonicalPath, raceWinner, { encoding: "utf8", flag: "wx" })
      throw new UncertainMutationError("remote response was lost after dispatch")
    },
    persistResult: journal.persistCheckpoint,
    persistTerminalResult: journal.persistTerminal,
  }), /durable run-specific terminal recovery.*manual reconciliation is required/)

  assert.deepEqual(events, [
    "lease:acquire",
    "canonical:preflight",
    "backup",
    "identity:art-0",
    "patch:art-0",
    "lease:retain",
  ])
  assert.equal(await readFile(canonicalPath, "utf8"), raceWinner)
  const retainedLock = JSON.parse(await readFile(path.join(reportDirectory, "apply.lock"), "utf8"))
  assert.deepEqual(retainedLock.owner, owner)
  const recoveryPath = path.join(reportDirectory, "apply-runs", owner.runId, "terminal.json")
  const recovery = JSON.parse(await readFile(recoveryPath, "utf8"))
  assert.deepEqual({
    appliedIds: recovery.appliedIds,
    skippedIds: recovery.skippedIds,
    pendingIds: recovery.pendingIds,
    uncertain: recovery.uncertain,
    errors: recovery.errors,
  }, {
    appliedIds: [],
    skippedIds: [],
    pendingIds: ["art-0"],
    uncertain: [{ artworkId: "art-0", message: "remote response was lost after dispatch" }],
    errors: [],
  })
  assert.equal(recovery.latestCheckpoint, "apply-runs/race-run/checkpoints/000002.json")
})

test("derives repository root from the script module URL instead of cwd", () => {
  const repository = path.join(os.tmpdir(), "catalog-root")
  const scriptUrl = pathToFileURL(path.join(repository, "scripts", "migrate-made-to-order-catalog.mts")).href
  assert.equal(repositoryRootFromScriptUrl(scriptUrl), repository)
})

test("apply lease acquisition is atomic and stale locks fail closed", async (context) => {
  const repository = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-lease-"))
  context.after(() => rm(repository, { recursive: true, force: true }))
  const reportDirectory = path.join(repository, "reports", "catalog-migration")
  await mkdir(reportDirectory, { recursive: true })
  const leaseArgs = (runId: string) => ({
    repositoryRoot: repository,
    reportDirectory,
    owner: { projectId: "project-a", dataset: "production", runId },
    createdAt: "2026-08-08T02:03:04.000Z",
  })

  const attempts = await Promise.allSettled([
    acquireApplyLease(leaseArgs("run-a")),
    acquireApplyLease(leaseArgs("run-b")),
  ])
  const acquired = attempts.filter((attempt) => attempt.status === "fulfilled")
  const rejected = attempts.filter((attempt) => attempt.status === "rejected")
  assert.equal(acquired.length, 1)
  assert.equal(rejected.length, 1)
  assert.match(String((rejected[0] as PromiseRejectedResult).reason), /apply lock already exists/i)

  const lease = (acquired[0] as PromiseFulfilledResult<Awaited<ReturnType<typeof acquireApplyLease>>>).value
  await lease.release()
  await writeFile(path.join(reportDirectory, "apply.lock"), "stale lock\n", { flag: "wx" })
  await assert.rejects(acquireApplyLease(leaseArgs("run-c")), /apply lock already exists/i)
})

test("backup write failure aborts before verification", async () => {
  const sources = Array.from({ length: 63 }, (_, index) => sourceRecord(`art-${index}`))
  let readAttempted = false

  await assert.rejects(
    writeAndVerifyBackup(sources, {
      backupRoot: path.resolve("reports/catalog-migration-backups"),
      now: new Date("2026-08-08T02:03:04.000Z"),
      io: {
        mkdir: async () => undefined,
        writeFile: async () => { throw new Error("backup disk full") },
        readFile: async () => {
          readAttempted = true
          return "[]"
        },
      },
    }),
    /backup disk full/,
  )
  assert.equal(readAttempted, false)
})

test("backup read failure aborts after the write", async () => {
  const sources = Array.from({ length: 63 }, (_, index) => sourceRecord(`art-${index}`))
  let writeCompleted = false

  await assert.rejects(
    writeAndVerifyBackup(sources, {
      backupRoot: path.resolve("reports/catalog-migration-backups"),
      now: new Date("2026-08-08T02:03:04.000Z"),
      io: {
        mkdir: async () => undefined,
        writeFile: async () => { writeCompleted = true },
        readFile: async () => { throw new Error("backup read failed") },
      },
    }),
    /backup read failed/,
  )
  assert.equal(writeCompleted, true)
})

test("apply orchestration stops before mutation when backup verification fails", async () => {
  const sources = Array.from({ length: 63 }, (_, index) => sourceRecord(`art-${index}`))
  const plans = sources.map((source) => readyPlan(source))
  const decisions = new Map(sources.map((source) => [source._id, decisionFor(source)]))
  const events: string[] = []

  await assert.rejects(runApplyMigration({
    token: "configured",
    sources,
    plans,
    decisionsByArtworkId: decisions,
    acquireLease: async () => {
      events.push("lease:acquire")
      return {
        release: async () => { events.push("lease:release") },
        retain: async () => { events.push("lease:retain") },
      }
    },
    preflightTerminalResult: async () => { events.push("canonical:preflight") },
    writeBackup: async () => {
      events.push("backup")
      throw new Error("backup verification failed")
    },
    readCurrentIdentity: async () => {
      events.push("read")
      throw new Error("must not read")
    },
    commitPatch: async () => { events.push("commit") },
    persistResult: async () => { events.push("persist") },
    persistTerminalResult: async () => {
      events.push("terminal")
      return "apply-result.json"
    },
  }), /backup verification failed/)

  assert.deepEqual(events, ["lease:acquire", "canonical:preflight", "backup", "lease:release"])
})

test("apply orchestration retains the exact source count and token gates", async () => {
  const sources = Array.from({ length: 63 }, (_, index) => sourceRecord(`art-${index}`))
  const plans = sources.map((source) => readyPlan(source))
  const decisions = new Map(sources.map((source) => [source._id, decisionFor(source)]))
  let backupAttempts = 0
  let leaseAttempts = 0
  const dependencies = {
    plans,
    decisionsByArtworkId: decisions,
    writeBackup: async () => {
      backupAttempts += 1
      return "backup.json"
    },
    readCurrentIdentity: async () => null,
    commitPatch: async () => undefined,
    persistResult: async () => undefined,
    persistTerminalResult: async () => "apply-result.json",
    preflightTerminalResult: async () => undefined,
    acquireLease: async () => {
      leaseAttempts += 1
      return { release: async () => undefined, retain: async () => undefined }
    },
  }

  await assert.rejects(runApplyMigration({
    ...dependencies,
    token: "configured",
    sources: sources.slice(0, 62),
    plans: plans.slice(0, 62),
  }), /Apply requires exactly 63 source records; received 62/)
  await assert.rejects(runApplyMigration({
    ...dependencies,
    token: undefined,
    sources,
  }), /Apply requires SANITY_WRITE_TOKEN or SANITY_API_WRITE_TOKEN/)
  assert.equal(backupAttempts, 0)
  assert.equal(leaseAttempts, 0)
})

test("apply orchestration writes successful, partial-error, and uncertain terminal summaries", async () => {
  const sources = Array.from({ length: 63 }, (_, index) => sourceRecord(`art-${index}`))
  const skippedPlans: PlannedArtworkMigration[] = sources.map((source, index) => index === 0
    ? readyPlan(source)
    : { status: "skipped", artworkId: source._id, reason: "missing_review_decision" })

  for (const mode of ["success", "partial-error", "uncertain"] as const) {
    const terminal: ApplyResult[] = []
    const { result, resultPath } = await runApplyMigration({
      token: "configured",
      sources,
      plans: skippedPlans,
      decisionsByArtworkId: new Map([[sources[0]._id, decisionFor(sources[0])]]),
      acquireLease: async () => ({
        release: async () => undefined,
        retain: async () => undefined,
      }),
      preflightTerminalResult: async () => undefined,
      writeBackup: async () => "backup.json",
      readCurrentIdentity: async (id) => {
        const source = sources.find((item) => item._id === id)!
        return { _id: id, _rev: source._rev, slug: source.slug }
      },
      commitPatch: async () => {
        if (mode === "partial-error") throw new Error("commit rejected")
        if (mode === "uncertain") throw new UncertainMutationError("response lost")
      },
      persistResult: async () => undefined,
      persistTerminalResult: async (value) => {
        terminal.push(cloneResult(value))
        return `canonical-${mode}.json`
      },
    })

    assert.equal(resultPath, `canonical-${mode}.json`)
    assert.deepEqual(terminal, [result])
    if (mode === "success") {
      assert.deepEqual(result.appliedIds, ["art-0"])
      assert.equal(result.skippedIds.length, 62)
      assert.deepEqual(result.errors, [])
    } else if (mode === "partial-error") {
      assert.deepEqual(result.pendingIds, [])
      assert.deepEqual(result.errors, [{ artworkId: "art-0", message: "commit rejected" }])
      assert.equal(result.skippedIds.length, 62)
    } else {
      assert.deepEqual(result.pendingIds, ["art-0"])
      assert.deepEqual(result.uncertain, [{ artworkId: "art-0", message: "response lost" }])
      assert.deepEqual(result.skippedIds, [])
    }
  }
})

test("empty ready patches are durably skipped without identity reads", async () => {
  const source = sourceRecord("art-1")
  const snapshots: ApplyResult[] = []

  const result = await applyPlansSequentially({
    sources: [source],
    plans: [readyPlan(source, {})],
    decisionsByArtworkId: new Map([[source._id, decisionFor(source)]]),
    readCurrentIdentity: async () => { throw new Error("identity read was not expected") },
    commitPatch: async () => { throw new Error("commit was not expected") },
    persistResult: async (value) => { snapshots.push(cloneResult(value)) },
  })

  assert.deepEqual(result, {
    appliedIds: [],
    skippedIds: ["art-1"],
    pendingIds: [],
    uncertain: [],
    errors: [],
  })
  assert.deepEqual(snapshots, [
    { appliedIds: [], skippedIds: [], pendingIds: [], uncertain: [], errors: [] },
    result,
  ])
})

test("slug and revision races are recorded without patch commits", async () => {
  const slugRace = sourceRecord("slug-race")
  const revisionRace = sourceRecord("revision-race")
  const commits: string[] = []
  const snapshots: ApplyResult[] = []

  const result = await applyPlansSequentially({
    sources: [slugRace, revisionRace],
    plans: [readyPlan(slugRace), readyPlan(revisionRace)],
    decisionsByArtworkId: new Map([
      [slugRace._id, decisionFor(slugRace)],
      [revisionRace._id, decisionFor(revisionRace)],
    ]),
    readCurrentIdentity: async (id) => id === slugRace._id
      ? { _id: id, _rev: slugRace._rev, slug: { current: "changed-slug" } }
      : { _id: id, _rev: "changed-revision", slug: revisionRace.slug },
    commitPatch: async ({ artworkId }) => { commits.push(artworkId) },
    persistResult: async (value) => { snapshots.push(cloneResult(value)) },
  })

  assert.deepEqual(commits, [])
  assert.deepEqual(result.errors, [
    { artworkId: "slug-race", message: "Artwork slug changed after the dry-run inventory" },
    { artworkId: "revision-race", message: "Artwork _rev changed after the dry-run inventory" },
  ])
  assert.equal(snapshots.length, 3)
  assert.deepEqual(snapshots.at(-1), result)
})

test("sequential partial failures persist each pending and final record outcome", async () => {
  const sources = [sourceRecord("a"), sourceRecord("b"), sourceRecord("c")]
  const events: string[] = []
  const snapshots: ApplyResult[] = []

  const result = await applyPlansSequentially({
    sources,
    plans: sources.map((source) => readyPlan(source)),
    decisionsByArtworkId: new Map(sources.map((source) => [source._id, decisionFor(source)])),
    readCurrentIdentity: async (id) => {
      events.push(`read:${id}`)
      const source = sources.find((item) => item._id === id)!
      return { _id: id, _rev: source._rev, slug: source.slug }
    },
    commitPatch: async ({ artworkId, revisionId }) => {
      events.push(`commit:${artworkId}:${revisionId}`)
      if (artworkId === "b") throw new Error("commit rejected")
    },
    persistResult: async (value) => { snapshots.push(cloneResult(value)) },
  })

  assert.deepEqual(events, [
    "read:a", "commit:a:rev-a",
    "read:b", "commit:b:rev-b",
    "read:c", "commit:c:rev-c",
  ])
  assert.deepEqual(result, {
    appliedIds: ["a", "c"],
    skippedIds: [],
    pendingIds: [],
    uncertain: [],
    errors: [{ artworkId: "b", message: "commit rejected" }],
  })
  assert.equal(snapshots.length, 7)
  assert.deepEqual(snapshots[0], {
    appliedIds: [], skippedIds: [], pendingIds: [], uncertain: [], errors: [],
  })
  assert.deepEqual(snapshots[1].pendingIds, ["a"])
  assert.deepEqual(snapshots[2].appliedIds, ["a"])
  assert.deepEqual(snapshots[3].pendingIds, ["b"])
  assert.deepEqual(snapshots[4].errors, [{ artworkId: "b", message: "commit rejected" }])
  assert.deepEqual(snapshots.at(-1), result)
})

test("result persistence failure stops after leaving a durable pending checkpoint", async () => {
  const sources = [sourceRecord("a"), sourceRecord("b")]
  const durableSnapshots: ApplyResult[] = []
  const commits: string[] = []
  const reads: string[] = []

  await assert.rejects(applyPlansSequentially({
    sources,
    plans: sources.map((source) => readyPlan(source)),
    decisionsByArtworkId: new Map(sources.map((source) => [source._id, decisionFor(source)])),
    readCurrentIdentity: async (id) => {
      reads.push(id)
      const source = sources.find((item) => item._id === id)!
      return { _id: id, _rev: source._rev, slug: source.slug }
    },
    commitPatch: async ({ artworkId }) => { commits.push(artworkId) },
    persistResult: async (value) => {
      if (value.appliedIds.includes("a")) throw new Error("result disk full")
      durableSnapshots.push(cloneResult(value))
    },
  }), /result disk full/)

  assert.deepEqual(reads, ["a"])
  assert.deepEqual(commits, ["a"])
  assert.deepEqual(durableSnapshots.at(-1), {
    appliedIds: [],
    skippedIds: [],
    pendingIds: ["a"],
    uncertain: [],
    errors: [],
  })
})

test("dispatched commit rejection remains pending and uncertain until operator reconciliation", async () => {
  const sources = [sourceRecord("a"), sourceRecord("b")]
  const reads: string[] = []
  const commits: string[] = []
  const snapshots: unknown[] = []

  const result = await applyPlansSequentially({
    sources,
    plans: sources.map((source) => readyPlan(source)),
    decisionsByArtworkId: new Map(sources.map((source) => [source._id, decisionFor(source)])),
    readCurrentIdentity: async (id) => {
      reads.push(id)
      const source = sources.find((item) => item._id === id)!
      return { _id: id, _rev: source._rev, slug: source.slug }
    },
    commitPatch: async ({ artworkId }) => {
      commits.push(artworkId)
      throw new UncertainMutationError("remote response was lost after dispatch")
    },
    persistResult: async (value) => { snapshots.push(structuredClone(value)) },
  })

  assert.deepEqual(reads, ["a"])
  assert.deepEqual(commits, ["a"])
  assert.deepEqual(result, {
    appliedIds: [],
    skippedIds: [],
    pendingIds: ["a"],
    uncertain: [{ artworkId: "a", message: "remote response was lost after dispatch" }],
    errors: [],
  })
  assert.equal(snapshots.length, 3)
  assert.deepEqual(snapshots.at(-1), result)
})
