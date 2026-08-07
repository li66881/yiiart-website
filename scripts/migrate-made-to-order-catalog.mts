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
  acquireApplyLease,
  createDryRunReport,
  createApplyResultPersister,
  indexMigrationDecisions,
  parseCatalogMigrationArgs,
  parseMigrationDecisions,
  prepareContainedOutputDirectory,
  repositoryRootFromScriptUrl,
  runApplyMigration,
  UncertainMutationError,
  verifyDryRunReportForApply,
  writeAndVerifyBackup,
  writeDryRunReportOnce,
  type MigrationPlanSummary,
  type MigrationSourceRecord,
} from "../src/lib/catalog-migration-io"

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
  const repositoryRoot = repositoryRootFromScriptUrl(import.meta.url)
  loadEnvFile(path.join(repositoryRoot, ".env.local"))
  const args = parseCatalogMigrationArgs(process.argv.slice(2))
  const reportDirectory = await prepareContainedOutputDirectory(repositoryRoot, args.reportDir)
  const token = process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_WRITE_TOKEN
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i"
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production"
  const sanity = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  })

  const sources = validateSources(await sanity.fetch<unknown>(ARTWORK_QUERY))
  const decisions = args.decisions
    ? await readDecisions(path.resolve(repositoryRoot, args.decisions))
    : []
  const decisionsByArtworkId = indexMigrationDecisions(decisions, sources)
  const plans = sources.map((source) => planArtworkMigration(
    source,
    decisionsByArtworkId.get(source._id),
  ))
  const dryRunReport = createDryRunReport({ sources, decisions, plans })
  const summary = dryRunReport.summary
  const dryRunPath = path.join(reportDirectory, "dry-run.json")

  printSummary(summary)
  if (!args.apply) {
    const owner = { projectId, dataset, runId: randomUUID() }
    await writeDryRunReportOnce({
      repositoryRoot,
      reportDirectory,
      owner,
      report: dryRunReport,
    })
    console.log(`dry-run report: ${dryRunPath}`)
    console.log("dry-run only: no backup created and no mutation attempted")
    return
  }

  const owner = await verifyDryRunReportForApply({
    repositoryRoot,
    reportDirectory,
    projectId,
    dataset,
    expectedReport: dryRunReport,
  })
  console.log(`verified dry-run report: ${dryRunPath}`)

  const resultJournal = createApplyResultPersister({ repositoryRoot, reportDirectory, owner })

  const { backupPath, result, resultPath } = await runApplyMigration({
    token,
    sources,
    plans,
    decisionsByArtworkId,
    acquireLease: () => acquireApplyLease({
      repositoryRoot,
      reportDirectory,
      owner,
      createdAt: new Date().toISOString(),
    }),
    writeBackup: async (records) => {
      const backupRoot = await prepareContainedOutputDirectory(
        repositoryRoot,
        path.join("reports", "catalog-migration-backups"),
      )
      const verifiedPath = await writeAndVerifyBackup(records, {
        repositoryRoot,
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
      const mutation = sanity
        .patch(artworkId)
        .ifRevisionId(revisionId)
        .set(patch)
      try {
        await mutation.commit()
      } catch (error) {
        throw new UncertainMutationError(
          error instanceof Error ? error.message : "Sanity commit outcome is unknown",
        )
      }
    },
    persistResult: resultJournal.persistCheckpoint,
    persistTerminalResult: resultJournal.persistTerminal,
  })

  console.log(`verified backup: ${backupPath}`)
  console.log(`apply result: ${resultPath}`)
  if (result.uncertain.length > 0) {
    throw new Error(`Apply stopped with an uncertain mutation for ${result.uncertain[0].artworkId}; operator reconciliation is required`)
  }
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

function printSummary(summary: MigrationPlanSummary) {
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
