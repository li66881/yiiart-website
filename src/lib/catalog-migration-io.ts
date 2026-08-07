import { randomUUID } from "node:crypto"
import {
  link,
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rm,
  unlink,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
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
  uncertain: Array<{ artworkId: string; message: string }>
  errors: Array<{ artworkId: string; message: string }>
}

export type ArtifactOwner = {
  projectId: string
  dataset: string
  runId: string
}

type DurableHandle = {
  writeFile: (data: string) => Promise<unknown>
  sync: () => Promise<unknown>
  close: () => Promise<unknown>
}

type DurableWriteIo = {
  open: (filePath: string, flags: "wx" | "r" | "r+") => Promise<DurableHandle>
  link: (existingPath: string, newPath: string) => Promise<unknown>
  unlink: (filePath: string) => Promise<unknown>
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

export class UncertainMutationError extends Error {
  override name = "UncertainMutationError"
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
  const allowedRoots = fixedArtifactRoots(repository)

  if (!isContainedPath(reportsRoot, requested)) {
    throw new Error("Output directory must stay within the repository reports directory")
  }
  if (!allowedRoots.includes(requested)) {
    throw new Error("Output directory must be a fixed catalog migration reports directory")
  }

  await mkdir(reportsRoot, { recursive: true })
  const repositoryReal = await realpath(repository)
  const reportsReal = await realpath(reportsRoot)
  if (!isContainedPath(repositoryReal, reportsReal)) {
    throw new Error("Repository reports directory resolves outside the repository")
  }

  const ancestor = await nearestExistingAncestor(requested)
  await assertNoSymlinkComponents(repository, ancestor)
  const ancestorReal = await realpath(ancestor)
  if (!isContainedPath(reportsReal, ancestorReal)) {
    throw new Error("Output directory resolves outside the repository reports directory")
  }

  await mkdir(requested, { recursive: true })
  await assertNoSymlinkComponents(repository, requested)
  const requestedReal = await realpath(requested)
  if (!isContainedPath(reportsReal, requestedReal)) {
    throw new Error("Output directory resolves outside the repository reports directory")
  }
  return requested
}

export function repositoryRootFromScriptUrl(scriptUrl: string) {
  return path.resolve(path.dirname(fileURLToPath(scriptUrl)), "..")
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

function fixedArtifactRoots(repositoryRoot: string) {
  return [
    path.join(repositoryRoot, "reports", "catalog-migration"),
    path.join(repositoryRoot, "reports", "catalog-migration-backups"),
  ]
}

function artifactRootForTarget(repositoryRoot: string, target: string) {
  const resolvedTarget = path.resolve(target)
  return fixedArtifactRoots(path.resolve(repositoryRoot)).find((root) => isContainedPath(root, resolvedTarget))
}

async function assertNoSymlinkComponents(repositoryRoot: string, candidate: string) {
  const relative = path.relative(repositoryRoot, candidate)
  let current = repositoryRoot
  for (const component of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, component)
    const metadata = await lstat(current)
    if (metadata.isSymbolicLink()) throw new Error(`Output path contains a symbolic link: ${current}`)
  }
}

async function prepareArtifactParent(repositoryRoot: string, filePath: string) {
  const repository = path.resolve(repositoryRoot)
  const target = path.resolve(filePath)
  const artifactRoot = artifactRootForTarget(repository, target)
  if (!artifactRoot) throw new Error("Artifact must stay within a fixed catalog migration reports directory")

  const reportsRoot = path.join(repository, "reports")
  const parent = path.dirname(target)
  await mkdir(reportsRoot, { recursive: true })
  const existingAncestor = await nearestExistingAncestor(parent)
  const repositoryReal = await realpath(repository)
  await assertNoSymlinkComponents(repository, existingAncestor)
  const ancestorReal = await realpath(existingAncestor)
  if (!isContainedPath(repositoryReal, ancestorReal)) {
    throw new Error("Artifact output resolves outside the repository")
  }

  await mkdir(parent, { recursive: true })
  await assertNoSymlinkComponents(repository, parent)
  const reportsReal = await realpath(reportsRoot)
  const artifactRootReal = await realpath(artifactRoot)
  const parentReal = await realpath(parent)
  if (!isContainedPath(repositoryReal, reportsReal)
    || !isContainedPath(reportsReal, artifactRootReal)
    || !isContainedPath(artifactRootReal, parentReal)) {
    throw new Error("Artifact output resolves outside the fixed repository reports tree")
  }

  const metadata = await lstat(parent)
  return { repository, target, parent, parentReal, device: metadata.dev, inode: metadata.ino }
}

const defaultDurableIo: DurableWriteIo = {
  open: async (filePath, flags) => {
    const handle = await open(filePath, flags)
    return {
      writeFile: (data) => handle.writeFile(data, "utf8"),
      sync: () => handle.sync(),
      close: () => handle.close(),
    }
  },
  link,
  unlink,
}

export async function writeJsonCrashDurableOnce(
  filePath: string,
  value: unknown,
  {
    repositoryRoot,
    io = defaultDurableIo,
    beforePublish,
  }: {
    repositoryRoot: string
    io?: DurableWriteIo
    beforePublish?: () => Promise<unknown> | unknown
  },
) {
  const boundary = await prepareArtifactParent(repositoryRoot, filePath)
  await assertPathAbsent(boundary.target, `Artifact already exists: ${boundary.target}`)
  const temporaryPath = path.join(boundary.parent, `.${path.basename(filePath)}.${process.pid}-${randomUUID()}.tmp`)
  let published = false
  try {
    const temporaryHandle = await io.open(temporaryPath, "wx")
    try {
      await temporaryHandle.writeFile(`${JSON.stringify(value, null, 2)}\n`)
      await temporaryHandle.sync()
    } finally {
      await temporaryHandle.close()
    }

    await beforePublish?.()
    await revalidateArtifactParent(boundary)
    await assertPathAbsent(boundary.target, `Artifact destination appeared during publication: ${boundary.target}`)
    await io.link(temporaryPath, boundary.target)
    published = true
    await syncPublishedEntry(io, boundary.parent, boundary.target)
  } finally {
    await io.unlink(temporaryPath).catch(() => undefined)
    if (!published) await rm(temporaryPath, { force: true }).catch(() => undefined)
  }
}

async function revalidateArtifactParent(boundary: Awaited<ReturnType<typeof prepareArtifactParent>>) {
  await assertNoSymlinkComponents(boundary.repository, boundary.parent)
  const currentReal = await realpath(boundary.parent)
  const metadata = await lstat(boundary.parent)
  if (currentReal !== boundary.parentReal || metadata.dev !== boundary.device || metadata.ino !== boundary.inode) {
    throw new Error("Output directory changed during publication")
  }
}

async function assertPathAbsent(filePath: string, message: string) {
  try {
    await lstat(filePath)
    throw new Error(message)
  } catch (error) {
    if (isErrorCode(error, "ENOENT")) return
    throw error
  }
}

async function syncPublishedEntry(io: DurableWriteIo, directory: string, destination: string) {
  let directoryHandle: DurableHandle | undefined
  try {
    directoryHandle = await io.open(directory, "r")
    await directoryHandle.sync()
    return
  } catch (error) {
    if (!isUnsupportedDirectorySync(error)) throw error
  } finally {
    await directoryHandle?.close().catch(() => undefined)
  }

  // Windows may reject directory fsync; syncing the published destination is the safe fallback.
  const destinationHandle = await io.open(destination, "r+")
  try {
    await destinationHandle.sync()
  } finally {
    await destinationHandle.close()
  }
}

function isUnsupportedDirectorySync(error: unknown) {
  return ["EPERM", "EINVAL", "EISDIR", "EBADF", "ENOTSUP"].some((code) => isErrorCode(error, code))
}

function validateOwner(owner: ArtifactOwner) {
  for (const field of ["projectId", "dataset", "runId"] as const) {
    if (!owner[field].trim()) throw new Error(`Artifact owner ${field} must be non-empty`)
  }
  if (!/^[A-Za-z0-9._-]+$/.test(owner.runId)) {
    throw new Error("Artifact owner runId contains unsupported path characters")
  }
}

export async function writeDryRunReportOnce({
  repositoryRoot,
  reportDirectory,
  owner,
  report,
}: {
  repositoryRoot: string
  reportDirectory: string
  owner: ArtifactOwner
  report: unknown
}) {
  validateOwner(owner)
  return writeJsonCrashDurableOnce(path.join(reportDirectory, "dry-run.json"), {
    ...(isRecord(report) ? report : { report }),
    format: "yiiart-catalog-migration-dry-run",
    version: 2,
    owner,
  }, { repositoryRoot })
}

export function createApplyResultPersister({
  repositoryRoot,
  reportDirectory,
  owner,
}: {
  repositoryRoot: string
  reportDirectory: string
  owner: ArtifactOwner
}) {
  validateOwner(owner)
  let sequence = 0
  return async (result: ApplyResult) => {
    const filePath = sequence === 0
      ? path.join(reportDirectory, "apply-result.json")
      : path.join(
        reportDirectory,
        "apply-runs",
        owner.runId,
        "checkpoints",
        `${String(sequence).padStart(6, "0")}.json`,
      )
    try {
      await writeJsonCrashDurableOnce(filePath, {
        ...result,
        format: "yiiart-catalog-migration-apply-result",
        version: 2,
        owner,
        sequence,
      }, { repositoryRoot })
    } catch (error) {
      if (sequence === 0 && isExistingArtifactError(error)) {
        throw new Error(`Refusing to replace an unrelated or previous-run file: ${filePath}`, { cause: error })
      }
      throw error
    }
    sequence += 1
  }
}

function isExistingArtifactError(error: unknown) {
  return isErrorCode(error, "EEXIST")
    || (error instanceof Error && /already exists|destination appeared/.test(error.message))
}

export async function acquireApplyLease({
  repositoryRoot,
  reportDirectory,
  owner,
  createdAt,
}: {
  repositoryRoot: string
  reportDirectory: string
  owner: ArtifactOwner
  createdAt: string
}) {
  validateOwner(owner)
  const lockPath = path.join(reportDirectory, "apply.lock")
  const lockValue = {
    format: "yiiart-catalog-migration-apply-lock",
    version: 2,
    owner,
    createdAt,
    pid: process.pid,
  }
  try {
    await writeJsonCrashDurableOnce(lockPath, lockValue, { repositoryRoot })
  } catch (error) {
    if (isExistingArtifactError(error)) {
      throw new Error("Apply lock already exists; concurrent or stale lock requires deliberate operator recovery", {
        cause: error,
      })
    }
    throw error
  }

  const lockHandle = await open(lockPath, "r")
  const lockIdentity = await lockHandle.stat()
  let released = false
  return {
    lockPath,
    async release() {
      if (released) return
      const current = await lstat(lockPath)
      const parsed: unknown = JSON.parse(await readFile(lockPath, "utf8"))
      if (current.dev !== lockIdentity.dev || current.ino !== lockIdentity.ino
        || !isRecord(parsed) || JSON.stringify(parsed.owner) !== JSON.stringify(owner)) {
        throw new Error("Apply lock ownership changed; refusing automatic release")
      }
      await lockHandle.close()
      await unlink(lockPath)
      released = true
    },
  }
}

export async function writeAndVerifyBackup(
  sources: MigrationSourceRecord[],
  {
    backupRoot,
    now,
    repositoryRoot,
    io,
  }: {
    backupRoot: string
    now: Date
    repositoryRoot?: string
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

  if (io) {
    await io.mkdir(backupDirectory, { recursive: true })
    await io.writeFile(backupPath, serialized, { encoding: "utf8", flag: "wx" })
  } else {
    if (!repositoryRoot) throw new Error("Crash-durable backup writes require repositoryRoot")
    await writeJsonCrashDurableOnce(backupPath, sources, { repositoryRoot })
  }

  const verified: unknown = JSON.parse(await (io?.readFile(backupPath, "utf8") ?? readFile(backupPath, "utf8")))
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
  acquireLease,
  ...dependencies
}: ApplyDependencies & {
  token: string | undefined
  writeBackup: (sources: MigrationSourceRecord[]) => Promise<string>
  acquireLease: () => Promise<{ release: () => Promise<void> }>
}) {
  if (dependencies.sources.length !== EXPECTED_SOURCE_COUNT) {
    throw new Error(`Apply requires exactly ${EXPECTED_SOURCE_COUNT} source records; received ${dependencies.sources.length}`)
  }
  if (!token) throw new Error("Apply requires SANITY_WRITE_TOKEN or SANITY_API_WRITE_TOKEN")

  const lease = await acquireLease()
  try {
    const backupPath = await writeBackup(dependencies.sources)
    const result = await applyPlansSequentially(dependencies)
    return { backupPath, result }
  } finally {
    await lease.release()
  }
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
    uncertain: [],
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

    if (commitError) {
      if (commitError instanceof UncertainMutationError) {
        result.uncertain.push({ artworkId: source._id, message: commitError.message })
        await persistResult(snapshotApplyResult(result))
        return result
      }
      result.pendingIds = result.pendingIds.filter((id) => id !== source._id)
      result.errors.push({ artworkId: source._id, message: commitError.message })
    } else {
      result.pendingIds = result.pendingIds.filter((id) => id !== source._id)
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
    uncertain: result.uncertain.map((item) => ({ ...item })),
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
