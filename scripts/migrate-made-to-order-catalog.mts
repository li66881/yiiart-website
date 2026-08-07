import { createClient } from "@sanity/client"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { loadEnvFile } from "node:process"
import {
  planArtworkMigration,
  type MigrationDecision,
  type PlannedArtworkMigration,
  type SourceArtwork,
} from "../src/lib/catalog-migration"
import {
  buildBackupFilename,
  parseCatalogMigrationArgs,
  summarizeMigrationPlans,
} from "../src/lib/catalog-migration-io"

const EXPECTED_SOURCE_COUNT = 63

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

type RuntimeSourceArtwork = SourceArtwork & {
  _rev: string
  title?: unknown
  sizeProfile?: unknown
  standardSizes?: unknown
  frameOptions?: unknown
  seriesSlug?: unknown
  seriesRank?: unknown
}

type CurrentArtworkIdentity = {
  _id: string
  _rev: string
  slug?: { current?: string }
}

type ApplyResult = {
  appliedIds: string[]
  skippedIds: string[]
  errors: Array<{ artworkId: string; message: string }>
}

async function main() {
  loadEnvFile(path.resolve(".env.local"))
  const args = parseCatalogMigrationArgs(process.argv.slice(2))
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
  const decisionsByArtworkId = indexDecisions(decisions, sources)
  const plans = sources.map((source) => planArtworkMigration(
    source,
    decisionsByArtworkId.get(source._id),
  ))
  const summary = summarizeMigrationPlans(plans)
  const reportDirectory = path.resolve(args.reportDir)
  const dryRunPath = path.join(reportDirectory, "dry-run.json")

  await writeJson(dryRunPath, {
    sourceCount: sources.length,
    decisionCount: decisions.length,
    summary,
    plans,
  })

  printSummary(summary)
  console.log(`dry-run report: ${dryRunPath}`)

  if (!args.apply) {
    console.log("dry-run only: no backup created and no mutation attempted")
    return
  }

  if (sources.length !== EXPECTED_SOURCE_COUNT) {
    throw new Error(`Apply requires exactly ${EXPECTED_SOURCE_COUNT} source records; received ${sources.length}`)
  }
  if (!token) throw new Error("Apply requires SANITY_WRITE_TOKEN or SANITY_API_WRITE_TOKEN")

  const backupPath = await writeAndVerifyBackup(sources, new Date())
  console.log(`verified backup: ${backupPath}`)

  const result = await applyPlansSequentially({
    sanity,
    sources,
    plans,
    decisionsByArtworkId,
  })
  const applyResultPath = path.join(reportDirectory, "apply-result.json")
  await writeJson(applyResultPath, result)
  console.log(`apply result: ${applyResultPath}`)

  if (result.errors.length > 0) {
    throw new Error(`Apply completed with ${result.errors.length} error(s); first failed artwork: ${result.errors[0].artworkId}`)
  }
}

function validateSources(value: unknown): RuntimeSourceArtwork[] {
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
    return item as RuntimeSourceArtwork
  })
}

async function readDecisions(filePath: string): Promise<MigrationDecision[]> {
  const parsed: unknown = JSON.parse(await readFile(filePath, "utf8"))
  if (!Array.isArray(parsed)) throw new Error("Migration decisions must be a JSON array")

  return parsed.map((decision, index) => {
    if (!isRecord(decision) || typeof decision.artworkId !== "string" || !decision.artworkId) {
      throw new Error(`Migration decision ${index} is missing a valid artworkId`)
    }
    return decision as MigrationDecision
  })
}

function indexDecisions(decisions: MigrationDecision[], sources: RuntimeSourceArtwork[]) {
  const sourceCounts = new Map<string, number>()
  for (const source of sources) {
    sourceCounts.set(source._id, (sourceCounts.get(source._id) ?? 0) + 1)
  }

  const indexed = new Map<string, MigrationDecision>()
  for (const decision of decisions) {
    if (sourceCounts.get(decision.artworkId) !== 1) {
      throw new Error(`Decision artworkId must match exactly one source record: ${decision.artworkId}`)
    }
    if (indexed.has(decision.artworkId)) {
      throw new Error(`Duplicate migration decision for artworkId: ${decision.artworkId}`)
    }
    indexed.set(decision.artworkId, decision)
  }
  return indexed
}

async function writeAndVerifyBackup(sources: RuntimeSourceArtwork[], now: Date) {
  const filename = buildBackupFilename(now)
  const timestamp = filename.slice("sanity-artworks-".length, -".json".length)
  const backupDirectory = path.resolve("reports/catalog-migration-backups", timestamp)
  const backupPath = path.join(backupDirectory, filename)
  const serialized = `${JSON.stringify(sources, null, 2)}\n`

  await mkdir(backupDirectory, { recursive: true })
  await writeFile(backupPath, serialized, { encoding: "utf8", flag: "wx" })

  const verified: unknown = JSON.parse(await readFile(backupPath, "utf8"))
  if (!Array.isArray(verified) || verified.length !== EXPECTED_SOURCE_COUNT) {
    throw new Error(`Backup verification requires ${EXPECTED_SOURCE_COUNT} parsed records`)
  }
  if (JSON.stringify(verified) !== JSON.stringify(sources)) {
    throw new Error("Backup verification did not reproduce the full source inventory")
  }

  return backupPath
}

async function applyPlansSequentially({
  sanity,
  sources,
  plans,
  decisionsByArtworkId,
}: {
  sanity: ReturnType<typeof createClient>
  sources: RuntimeSourceArtwork[]
  plans: PlannedArtworkMigration[]
  decisionsByArtworkId: Map<string, MigrationDecision>
}): Promise<ApplyResult> {
  const result: ApplyResult = {
    appliedIds: [],
    skippedIds: [],
    errors: [],
  }

  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index]
    const plan = plans[index]
    if (plan.status !== "ready" || Object.keys(plan.patch).length === 0) {
      result.skippedIds.push(source._id)
      continue
    }

    try {
      const decision = decisionsByArtworkId.get(source._id)
      if (!decision) throw new Error("Ready plan has no migration decision")

      const current = await sanity.fetch<CurrentArtworkIdentity | null>(
        `*[_type == "artwork" && _id == $id][0]{_id, _rev, slug}`,
        { id: source._id },
      )
      if (!current || current._id !== source._id) {
        throw new Error("Artwork _id changed or no longer resolves uniquely")
      }
      if (current.slug?.current !== decision.expectedSlug) {
        throw new Error("Artwork slug changed after the dry-run inventory")
      }
      if (current._rev !== source._rev) {
        throw new Error("Artwork _rev changed after the dry-run inventory")
      }

      await sanity
        .patch(source._id)
        .ifRevisionId(source._rev)
        .set(plan.patch)
        .commit()
      result.appliedIds.push(source._id)
    } catch (error) {
      result.errors.push({
        artworkId: source._id,
        message: error instanceof Error ? error.message : "Unknown apply error",
      })
    }
  }

  return result
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
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
