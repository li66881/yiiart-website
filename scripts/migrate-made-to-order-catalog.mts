import { createClient } from "@sanity/client"
import { randomUUID } from "node:crypto"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { loadEnvFile } from "node:process"
import {
  planArtworkMigration,
  type MigrationDecision,
} from "../src/lib/catalog-migration"
import {
  indexMigrationDecisions,
  createApplyResultPersister,
  parseCatalogMigrationArgs,
  parseMigrationDecisions,
  prepareContainedOutputDirectory,
  runApplyMigration,
  summarizeMigrationPlans,
  writeAndVerifyBackup,
  writeJsonAtomic,
  type MigrationSourceRecord,
} from "../src/lib/catalog-migration-io"

const DRY_RUN_FORMAT = "yiiart-catalog-migration-dry-run-v1"

const ARTWORK_QUERY = `*[_type == "artwork"] | order(_id asc){
  _id,
  _rev,
  title,
  slug,
  dimensions,
  widthCm,
  heightCm,
  orientation,
  category,
  roomTypes,
  colorFamilies,
  styleTags,
  collectionType,
  productionModel,
  rightsStatus,
  migrationStatus,
  allowCheckout,
  shippingProfile,
  sizeProfile,
  standardSizes,
  frameOptions,
  seriesSlug,
  seriesRank,
  productMedia
}`

async function main() {
  loadEnvFile(path.resolve(".env.local"))
  const args = parseCatalogMigrationArgs(process.argv.slice(2))
  const repositoryRoot = process.cwd()
  const reportDirectory = await prepareContainedOutputDirectory(repositoryRoot, args.reportDir)
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN
  const sanity = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  })

  const sources = validateSources(await sanity.fetch<unknown>(ARTWORK_QUERY))
  const decisions = args.decisions
    ? await readDecisions(path.resolve(args.decisions))
    : []
  const decisionsByArtworkId = indexMigrationDecisions(decisions, sources)
  const plans = sources.map((source) => planArtworkMigration(
    source,
    decisionsByArtworkId.get(source._id),
  ))
  const summary = summarizeMigrationPlans(plans)
  const dryRunPath = path.join(reportDirectory, "dry-run.json")

  await writeJsonAtomic(dryRunPath, {
    format: DRY_RUN_FORMAT,
    sourceCount: sources.length,
    decisionCount: decisions.length,
    summary,
    plans,
  }, {
    canReplaceExisting: isOwnedDryRunReport,
  })

  printSummary(summary)
  console.log(`dry-run report: ${dryRunPath}`)

  if (!args.apply) {
    console.log("dry-run only: no backup created and no mutation attempted")
    return
  }

  const applyResultPath = path.join(reportDirectory, "apply-result.json")
  const applyRunId = randomUUID()
  const persistResult = createApplyResultPersister(applyResultPath, applyRunId)

  const { backupPath, result } = await runApplyMigration({
    token,
    sources,
    plans,
    decisionsByArtworkId,
    writeBackup: async (records) => {
      const backupRoot = await prepareContainedOutputDirectory(
        repositoryRoot,
        path.join("reports", "catalog-migration-backups"),
      )
      const verifiedPath = await writeAndVerifyBackup(records, {
        backupRoot,
        now: new Date(),
      })
      return verifiedPath
    },
    readCurrentIdentity: (artworkId) => sanity.fetch(
      `*[_type == "artwork" && _id == $id][0]{_id, _rev, slug}`,
      { id: artworkId },
    ),
    commitPatch: async ({ artworkId, revisionId, patch }) => {
      await sanity
        .patch(artworkId)
        .ifRevisionId(revisionId)
        .set(patch)
        .commit()
    },
    persistResult,
  })

  console.log(`verified backup: ${backupPath}`)
  console.log(`apply result: ${applyResultPath}`)
  if (result.errors.length > 0) {
    throw new Error(`Apply completed with ${result.errors.length} error(s); first failed artwork: ${result.errors[0].artworkId}`)
  }
}

function validateSources(value: unknown): MigrationSourceRecord[] {
  if (!Array.isArray(value)) throw new Error("Sanity artwork inventory must be an array")

  const seenIds = new Set<string>()
  return value.map((item, index) => {
    if (!isRecord(item) || typeof item._id !== "string" || !item._id) {
      throw new Error(`Source record ${index} is missing a valid _id`)
    }
    if (typeof item._rev !== "string" || !item._rev) {
      throw new Error(`Source record ${item._id} is missing a valid _rev`)
    }
    if (seenIds.has(item._id)) throw new Error(`Source artwork _id is not unique: ${item._id}`)
    seenIds.add(item._id)
    return item as MigrationSourceRecord
  })
}

async function readDecisions(filePath: string): Promise<MigrationDecision[]> {
  const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"))
  return parseMigrationDecisions(parsed)
}

function isOwnedDryRunReport(value: unknown) {
  if (!isRecord(value)) return false
  if (value.format === DRY_RUN_FORMAT) return true

  return typeof value.sourceCount === "number"
    && typeof value.decisionCount === "number"
    && isRecord(value.summary)
    && Array.isArray(value.plans)
}

function printSummary(summary: ReturnType<typeof summarizeMigrationPlans>) {
  console.log(`total: ${summary.total}`)
  console.log(`ready: ${summary.ready}`)
  console.log(`skipped: ${summary.skipped}`)
  console.log(`reasons: ${JSON.stringify(summary.reasons)}`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

main().catch((error) => {
  console.error(`Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  process.exitCode = 1
})
