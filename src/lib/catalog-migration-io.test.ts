import assert from "node:assert/strict"
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import test from "node:test"
import {
  applyPlansSequentially,
  buildBackupFilename,
  createApplyResultPersister,
  indexMigrationDecisions,
  parseCatalogMigrationArgs,
  parseMigrationDecisions,
  prepareContainedOutputDirectory,
  runApplyMigration,
  summarizeMigrationPlans,
  writeAndVerifyBackup,
  writeJsonAtomic,
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

  const escape = path.join(repository, "reports", "escape")
  await symlink(outside, escape, "junction")
  await assert.rejects(
    prepareContainedOutputDirectory(repository, path.join("reports", "escape", "run")),
    /Output directory resolves outside the repository reports directory/,
  )

  const contained = await prepareContainedOutputDirectory(
    repository,
    path.join("reports", "catalog-migration"),
  )
  assert.equal(contained, path.join(repository, "reports", "catalog-migration"))
})

test("atomic JSON output refuses to replace an unrelated fixed file", async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-json-"))
  context.after(() => rm(directory, { recursive: true, force: true }))
  const filePath = path.join(directory, "dry-run.json")
  await writeFile(filePath, "unrelated content\n", "utf8")

  await assert.rejects(
    writeJsonAtomic(filePath, { format: "yiiart-catalog-dry-run-v1" }, {
      canReplaceExisting: () => false,
    }),
    /Refusing to replace an unrelated or previous-run file/,
  )
  assert.equal(await readFile(filePath, "utf8"), "unrelated content\n")
})

test("apply result persister atomically journals one run and refuses a previous run", async (context) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "catalog-migration-result-"))
  context.after(() => rm(directory, { recursive: true, force: true }))
  const filePath = path.join(directory, "apply-result.json")
  const persist = createApplyResultPersister(filePath, "run-1")
  const initial: ApplyResult = { appliedIds: [], skippedIds: [], pendingIds: [], errors: [] }

  await persist(initial)
  await persist({ ...initial, pendingIds: ["art-1"] })
  await persist({ ...initial, appliedIds: ["art-1"] })

  assert.deepEqual(JSON.parse(await readFile(filePath, "utf8")), {
    format: "yiiart-catalog-migration-apply-result-v1",
    runId: "run-1",
    appliedIds: ["art-1"],
    skippedIds: [],
    pendingIds: [],
    errors: [],
  })

  const nextRun = createApplyResultPersister(filePath, "run-2")
  await assert.rejects(nextRun(initial), /Refusing to replace an unrelated or previous-run file/)
  assert.equal(JSON.parse(await readFile(filePath, "utf8")).runId, "run-1")
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
  }), /backup verification failed/)

  assert.deepEqual(events, ["backup"])
})

test("apply orchestration retains the exact source count and token gates", async () => {
  const sources = Array.from({ length: 63 }, (_, index) => sourceRecord(`art-${index}`))
  const plans = sources.map((source) => readyPlan(source))
  const decisions = new Map(sources.map((source) => [source._id, decisionFor(source)]))
  let backupAttempts = 0
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
    errors: [],
  })
  assert.deepEqual(snapshots, [
    { appliedIds: [], skippedIds: [], pendingIds: [], errors: [] },
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
    errors: [{ artworkId: "b", message: "commit rejected" }],
  })
  assert.equal(snapshots.length, 7)
  assert.deepEqual(snapshots[0], { appliedIds: [], skippedIds: [], pendingIds: [], errors: [] })
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
    errors: [],
  })
})
