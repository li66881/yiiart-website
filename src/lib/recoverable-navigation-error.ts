function errorText(error: unknown) {
  if (!error) return ""
  if (typeof error === "string") return error
  if (error instanceof Error) {
    return `${error.name} ${error.message} ${error.stack ?? ""}`
  }
  if (typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message)
  }
  return String(error)
}

const RECOVERABLE_PATTERNS = [
  /ChunkLoadError/i,
  /Loading chunk \d+ failed/i,
  /Loading CSS chunk/i,
  /Failed to load chunk/i,
  /Failed to fetch RSC payload/i,
  /error loading dynamically imported module/i,
  /Importing a module script failed/i,
  /\/_next\/static\//i,
]

export function isRecoverableNavigationError(error: unknown) {
  const text = errorText(error)
  return RECOVERABLE_PATTERNS.some((pattern) => pattern.test(text))
}

const RELOAD_KEY = "yiiart-stale-asset-reload"
const RELOAD_COOLDOWN_MS = 15_000

export function reloadForStaleAssets() {
  if (typeof window === "undefined") return

  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || "0")
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // Private mode can block sessionStorage; still try a single reload.
  }

  window.location.reload()
}
