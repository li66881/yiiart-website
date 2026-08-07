import type {
  MigrationSkipReason,
  PlannedArtworkMigration,
} from "./catalog-migration"

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
