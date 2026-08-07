import { randomUUID } from "node:crypto"
import {
  lstat,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import type {
  MigrationDecision,
  MigrationSkipReason,
  PlannedArtworkMigration,
  SourceArtwork,
} from "./catalog-migration"

const EXPECTED_SOURCE_COUNT = 63
const SIZE_PROFILES = ["square", "two-three", "three-four", "near-square", "panoramic"] as const
const CATEGORIES = [
  "Abstract",
  "Landscape",
  "Portrait",
  "Figurative",
  "Texture",
  "Textured Art",
  "Wabi-sabi",
  "Minimalist",
] as const
const ROOM_TYPES = [
  "Living room",
  "Bedroom",
  "Dining room",
  "Entryway",
  "Office",
  "Hospitality space",
] as const
const COLOR_FAMILIES = [
  "Neutral",
  "White",
  "Black",
  "Gray",
  "Blue",
  "Green",
  "Red",
  "Pink",
  "Yellow",
  "Orange",
  "Earth tone",
  "Multicolor",
] as const
const DECISION_FIELDS = new Set([
  "artworkId",
  "expectedSlug",
  "sizeProfile",
  "physicalSize",
  "category",
  "roomTypes",
  "colorFamilies",
  "styleTags",
  "rightsApproved",
  "contentReady",
  "enableRolledCheckout",
  "seriesSlug",
  "seriesRank",
])

export type CatalogMigrationArgs = {
  apply: boolean
  inventoryOnly: boolean
  decisions?: string
  reportDir: string
}

export type MigrationPlanSummary = {
  total: number
  ready: number
  skipped: number
  reasons: Partial<Record<MigrationSkipReason, number>>
}

export type MigrationSourceRecord = SourceArtwork & {
  _rev: string
  title?: unknown
  sizeProfile?: unknown
  standardSizes?: unknown
  frameOptions?: unknown
  seriesSlug?: unknown
  seriesRank?: unknown
}

export type CurrentArtworkIdentity = {
  _id: string
  _rev: string
  slug?: { current?: string }
}

export type ApplyResult = {
  appliedIds: string[]
  skippedIds: string[]
  pendingIds: string[]
  errors: Array<{ artworkId: string; message: string }>
}

type BackupIo = {
  mkdir: (directory: string, options: { recursive: true }) => Promise<unknown>
  writeFile: (
    filePath: string,
    data: string,
    options: { encoding: "utf8"; flag: "wx" },
  ) => Promise<unknown>
  readFile: (filePath: string, encoding: "utf8") => Promise<string>
}

type ApplyDependencies = {
  sources: MigrationSourceRecord[]
  plans: PlannedArtworkMigration[]
  decisionsByArtworkId: Map<string, MigrationDecision>
  readCurrentIdentity: (artworkId: string) => Promise<CurrentArtworkIdentity | null>
  commitPatch: (input: {
    artworkId: string
    revisionId: string
    patch: Extract<PlannedArtworkMigration, { status: "ready" }>["patch"]
  }) => Promise<void>
  persistResult: (result: ApplyResult) => Promise<void>
}

function readArgumentValue(argument: string, name: "--decisions" | "--report-dir") {
  const value = argument.slice(`${name}=`.length).trim()
  if (!value) throw new Error(`${name} requires a non-empty value`)
  return value
}

export function parseCatalogMigrationArgs(values: string[]): CatalogMigrationArgs {
  let apply = false
  let inventoryOnly = false
  let decisions: string | undefined
  let reportDir: string | undefined

  for (const value of values) {
    if (value === "--apply") apply = true
    else if (value === "--inventory-only") inventoryOnly = true
    else if (value.startsWith("--decisions=")) decisions = readArgumentValue(value, "--decisions")
    else if (value.startsWith("--report-dir=")) reportDir = readArgumentValue(value, "--report-dir")
    else throw new Error(`Unknown argument: ${value}`)
  }

  if (!reportDir) throw new Error("--report-dir is required")
  if (apply && inventoryOnly) throw new Error("--apply cannot be used with --inventory-only")
  if (!inventoryOnly && !decisions) {
    throw new Error("--decisions is required unless --inventory-only is present")
  }

  return {
    apply,
    inventoryOnly,
    ...(decisions ? { decisions } : {}),
    reportDir,
  }
}

export function buildBackupFilename(date: Date) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  const hours = String(date.getUTCHours()).padStart(2, "0")
  const minutes = String(date.getUTCMinutes()).padStart(2, "0")
  const seconds = String(date.getUTCSeconds()).padStart(2, "0")
  return `sanity-artworks-${year}${month}${day}-${hours}${minutes}${seconds}.json`
}

export function summarizeMigrationPlans(plans: PlannedArtworkMigration[]): MigrationPlanSummary {
  const summary: MigrationPlanSummary = {
    total: plans.length,
    ready: 0,
    skipped: 0,
    reasons: {},
  }

  for (const plan of plans) {
    if (plan.status === "ready") {
      summary.ready += 1
      continue
    }

    summary.skipped += 1
    summary.reasons[plan.reason] = (summary.reasons[plan.reason] ?? 0) + 1
  }

  return summary
}

export function parseMigrationDecisions(value: unknown): MigrationDecision[] {
  if (!Array.isArray(value)) throw new Error("Migration decisions must be a JSON array")
  return value.map((decision, index) => parseMigrationDecision(decision, index))
}

function parseMigrationDecision(value: unknown, index: number): MigrationDecision {
  if (!isRecord(value)) throw new Error(`Migration decision ${index} must be an object`)

  for (const field of Object.keys(value)) {
    if (!DECISION_FIELDS.has(field)) {
      throw new Error(`Migration decision ${index} contains unknown field: ${field}`)
    }
  }

  requireNonEmptyString(value.artworkId, index, "artworkId")
  requireNonEmptyString(value.expectedSlug, index, "expectedSlug")
  requireAllowedValue(value.sizeProfile, SIZE_PROFILES, index, "sizeProfile")
  requireBoolean(value.rightsApproved, index, "rightsApproved")
  requireBoolean(value.contentReady, index, "contentReady")
  requireBoolean(value.enableRolledCheckout, index, "enableRolledCheckout")

  if (value.physicalSize !== undefined) validatePhysicalSize(value.physicalSize, index)
  if (value.category !== undefined) requireAllowedValue(value.category, CATEGORIES, index, "category")
  validateStringArray(value.roomTypes, index, "roomTypes", ROOM_TYPES)
  validateStringArray(value.colorFamilies, index, "colorFamilies", COLOR_FAMILIES)
  validateStringArray(value.styleTags, index, "styleTags")
  if (value.seriesSlug !== undefined) requireNonEmptyString(value.seriesSlug, index, "seriesSlug")
  if (value.seriesRank !== undefined
    && (typeof value.seriesRank !== "number" || !Number.isFinite(value.seriesRank))) {
    throw new Error(`Migration decision ${index} seriesRank must be finite`)
  }

  return value as MigrationDecision
}

function requireNonEmptyString(value: unknown, index: number, field: string): asserts value is string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Migration decision ${index} ${field} must be a non-empty string`)
  }
}

function requireBoolean(value: unknown, index: number, field: string): asserts value is boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Migration decision ${index} ${field} must be a boolean`)
  }
}

function requireAllowedValue<const Value extends string>(
  value: unknown,
  allowed: readonly Value[],
  index: number,
  field: string,
): asserts value is Value {
  if (typeof value !== "string" || !allowed.includes(value as Value)) {
    throw new Error(`Migration decision ${index} ${field} must be one of: ${allowed.join(", ")}`)
  }
}

function validateStringArray<const Value extends string>(
  value: unknown,
  index: number,
  field: string,
  allowed?: readonly Value[],
) {
  if (value === undefined) return
  if (!Array.isArray(value)) throw new Error(`Migration decision ${index} ${field} must be a string array`)

  value.forEach((item, itemIndex) => {
    if (typeof item !== "string" || !item.trim()) {
      throw new Error(`Migration decision ${index} ${field}[${itemIndex}] must be a non-empty string`)
    }
    if (allowed && !allowed.includes(item as Value)) {
      throw new Error(`Migration decision ${index} ${field}[${itemIndex}] must be one of: ${allowed.join(", ")}`)
    }
  })
}

function validatePhysicalSize(value: unknown, index: number) {
  if (!isRecord(value)) throw new Error(`Migration decision ${index} physicalSize must be an object`)
  for (const field of Object.keys(value)) {
    if (field !== "widthCm" && field !== "heightCm") {
      throw new Error(`Migration decision ${index} physicalSize contains unknown field: ${field}`)
    }
  }
  for (const field of ["widthCm", "heightCm"] as const) {
    if (typeof value[field] !== "number" || !Number.isFinite(value[field]) || value[field] <= 0) {
      throw new Error(`Migration decision ${index} physicalSize.${field} must be positive and finite`)
    }
  }
}

export function indexMigrationDecisions(
  decisions: MigrationDecision[],
  sources: Array<Pick<MigrationSourceRecord, "_id">>,
) {
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

export async function prepareContainedOutputDirectory(repositoryRoot: string, requestedPath: string) {
  const repository = path.resolve(repositoryRoot)
  const reportsRoot = path.join(repository, "reports")
  const requested = path.isAbsolute(requestedPath)
    ? path.resolve(requestedPath)
    : path.resolve(repository, requestedPath)

  if (!isContainedPath(reportsRoot, requested)) {
    throw new Error("Output directory must stay within the repository reports directory")
  }

  await mkdir(reportsRoot, { recursive: true })
  const repositoryReal = await realpath(repository)
  const reportsReal = await realpath(reportsRoot)
  if (!isContainedPath(repositoryReal, reportsReal)) {
    throw new Error("Repository reports directory resolves outside the repository")
  }

  const ancestor = await nearestExistingAncestor(requested)
  const ancestorReal = await realpath(ancestor)
  if (!isContainedPath(reportsReal, ancestorReal)) {
    throw new Error("Output directory resolves outside the repository reports directory")
  }

  await mkdir(requested, { recursive: true })
  const requestedReal = await realpath(requested)
  if (!isContainedPath(reportsReal, requestedReal)) {
    throw new Error("Output directory resolves outside the repository reports directory")
  }
  return requested
}

function isContainedPath(root: string, candidate: string) {
  const relative = path.relative(root, candidate)
  return relative === "" || (!path.isAbsolute(relative) && relative !== ".." && !relative.startsWith(`..${path.sep}`))
}

async function nearestExistingAncestor(candidate: string) {
  let current = candidate
  while (true) {
    try {
      await lstat(current)
      return current
    } catch (error) {
      if (!isErrorCode(error, "ENOENT")) throw error
      const parent = path.dirname(current)
      if (parent === current) throw error
      current = parent
    }
  }
}

export async function writeJsonAtomic(
  filePath: string,
  value: unknown,
  options: { canReplaceExisting?: (existing: unknown) => boolean } = {},
) {
  await mkdir(path.dirname(filePath), { recursive: true })
  let existing: unknown
  let exists = false

  try {
    const metadata = await lstat(filePath)
    if (metadata.isSymbolicLink()) throw new Error(`Refusing to replace a symlink: ${filePath}`)
    existing = JSON.parse(await readFile(filePath, "utf8"))
    exists = true
  } catch (error) {
    if (!isErrorCode(error, "ENOENT")) {
      if (error instanceof SyntaxError) {
        throw new Error(`Refusing to replace an unrelated or previous-run file: ${filePath}`)
      }
      throw error
    }
  }

  if (exists && !options.canReplaceExisting?.(existing)) {
    throw new Error(`Refusing to replace an unrelated or previous-run file: ${filePath}`)
  }

  const temporaryPath = `${filePath}.${process.pid}-${randomUUID()}.tmp`
  try {
    await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx",
    })
    await rename(temporaryPath, filePath)
  } catch (error) {
    await rm(temporaryPath, { force: true }).catch(() => undefined)
    throw error
  }
}

export function createApplyResultPersister(filePath: string, runId: string) {
  let initialized = false
  return async (result: ApplyResult) => {
    await writeJsonAtomic(filePath, {
      format: "yiiart-catalog-migration-apply-result-v1",
      runId,
      ...result,
    }, {
      canReplaceExisting: (existing) => initialized
        && isRecord(existing)
        && existing.format === "yiiart-catalog-migration-apply-result-v1"
        && existing.runId === runId,
    })
    initialized = true
  }
}

export async function writeAndVerifyBackup(
  sources: MigrationSourceRecord[],
  {
    backupRoot,
    now,
    io = { mkdir, writeFile, readFile },
  }: {
    backupRoot: string
    now: Date
    io?: BackupIo
  },
) {
  if (sources.length !== EXPECTED_SOURCE_COUNT) {
    throw new Error(`Backup requires exactly ${EXPECTED_SOURCE_COUNT} source records; received ${sources.length}`)
  }

  const filename = buildBackupFilename(now)
  const timestamp = filename.slice("sanity-artworks-".length, -".json".length)
  const backupDirectory = path.join(backupRoot, timestamp)
  const backupPath = path.join(backupDirectory, filename)
  const serialized = `${JSON.stringify(sources, null, 2)}\n`

  await io.mkdir(backupDirectory, { recursive: true })
  await io.writeFile(backupPath, serialized, { encoding: "utf8", flag: "wx" })

  const verified: unknown = JSON.parse(await io.readFile(backupPath, "utf8"))
  if (!Array.isArray(verified) || verified.length !== EXPECTED_SOURCE_COUNT) {
    throw new Error(`Backup verification requires ${EXPECTED_SOURCE_COUNT} parsed records`)
  }
  if (JSON.stringify(verified) !== JSON.stringify(sources)) {
    throw new Error("Backup verification did not reproduce the full source inventory")
  }

  return backupPath
}

export async function runApplyMigration({
  token,
  writeBackup,
  ...dependencies
}: ApplyDependencies & {
  token: string | undefined
  writeBackup: (sources: MigrationSourceRecord[]) => Promise<string>
}) {
  if (dependencies.sources.length !== EXPECTED_SOURCE_COUNT) {
    throw new Error(`Apply requires exactly ${EXPECTED_SOURCE_COUNT} source records; received ${dependencies.sources.length}`)
  }
  if (!token) throw new Error("Apply requires SANITY_WRITE_TOKEN or SANITY_API_WRITE_TOKEN")

  const backupPath = await writeBackup(dependencies.sources)
  const result = await applyPlansSequentially(dependencies)
  return { backupPath, result }
}

export async function applyPlansSequentially({
  sources,
  plans,
  decisionsByArtworkId,
  readCurrentIdentity,
  commitPatch,
  persistResult,
}: ApplyDependencies): Promise<ApplyResult> {
  if (plans.length !== sources.length) throw new Error("Every source record must have exactly one migration plan")
  for (let index = 0; index < sources.length; index += 1) {
    if (plans[index].artworkId !== sources[index]._id) {
      throw new Error(`Migration plan identity mismatch at source index ${index}`)
    }
  }

  const result: ApplyResult = {
    appliedIds: [],
    skippedIds: [],
    pendingIds: [],
    errors: [],
  }
  await persistResult(snapshotApplyResult(result))

  for (let index = 0; index < sources.length; index += 1) {
    const source = sources[index]
    const plan = plans[index]
    if (plan.status !== "ready" || Object.keys(plan.patch).length === 0) {
      result.skippedIds.push(source._id)
      await persistResult(snapshotApplyResult(result))
      continue
    }

    const decision = decisionsByArtworkId.get(source._id)
    if (!decision) {
      result.errors.push({ artworkId: source._id, message: "Ready plan has no migration decision" })
      await persistResult(snapshotApplyResult(result))
      continue
    }

    let identityError: Error | undefined
    try {
      const current = await readCurrentIdentity(source._id)
      if (!current || current._id !== source._id) {
        throw new Error("Artwork _id changed or no longer resolves uniquely")
      }
      if (current.slug?.current !== decision.expectedSlug) {
        throw new Error("Artwork slug changed after the dry-run inventory")
      }
      if (current._rev !== source._rev) {
        throw new Error("Artwork _rev changed after the dry-run inventory")
      }
    } catch (error) {
      identityError = toError(error, "Unknown identity check error")
    }
    if (identityError) {
      result.errors.push({ artworkId: source._id, message: identityError.message })
      await persistResult(snapshotApplyResult(result))
      continue
    }

    result.pendingIds.push(source._id)
    await persistResult(snapshotApplyResult(result))

    let commitError: Error | undefined
    try {
      await commitPatch({
        artworkId: source._id,
        revisionId: source._rev,
        patch: plan.patch,
      })
    } catch (error) {
      commitError = toError(error, "Unknown apply error")
    }

    result.pendingIds = result.pendingIds.filter((id) => id !== source._id)
    if (commitError) {
      result.errors.push({ artworkId: source._id, message: commitError.message })
    } else {
      result.appliedIds.push(source._id)
    }
    await persistResult(snapshotApplyResult(result))
  }

  return result
}

function snapshotApplyResult(result: ApplyResult): ApplyResult {
  return {
    appliedIds: [...result.appliedIds],
    skippedIds: [...result.skippedIds],
    pendingIds: [...result.pendingIds],
    errors: result.errors.map((error) => ({ ...error })),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value))
}

function isErrorCode(error: unknown, code: string): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === code
}

function toError(error: unknown, fallback: string) {
  return error instanceof Error ? error : new Error(fallback)
}
