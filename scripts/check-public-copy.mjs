import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

const root = process.cwd()
const sourceDir = path.join(root, "src")
const messagesDir = path.join(root, "messages")

const bannedPatterns = [
  { pattern: /This area uses the current artwork data/i, reason: "internal data-source note" },
  { pattern: /sales ranking data/i, reason: "internal ranking roadmap" },
  { pattern: /real order performance/i, reason: "internal ranking roadmap" },
  { pattern: /Until verified customer room photos/i, reason: "internal content availability note" },
  { pattern: /Real customer photos will appear/i, reason: "placeholder customer-photo copy" },
  { pattern: /\bwill appear here\b/i, reason: "placeholder future-state copy" },
  { pattern: /\bcoming soon\b/i, reason: "unfinished public copy" },
  { pattern: /\bbeing prepared\b/i, reason: "unfinished public copy" },
]

const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx"])
const violations = []

function walkFiles(dir) {
  if (!existsSync(dir)) return []

  return readdirSync(dir).flatMap((entry) => {
    const absolutePath = path.join(dir, entry)
    const stats = statSync(absolutePath)

    if (stats.isDirectory()) {
      return walkFiles(absolutePath)
    }

    return [absolutePath]
  })
}

function checkText(filePath, location, text) {
  for (const { pattern, reason } of bannedPatterns) {
    const match = text.match(pattern)
    if (!match) continue

    violations.push({
      filePath,
      location,
      reason,
      match: match[0],
    })
  }
}

function checkJsonStrings(filePath, value, stack = []) {
  if (typeof value === "string") {
    checkText(filePath, stack.join(".") || "$", value)
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => checkJsonStrings(filePath, item, [...stack, String(index)]))
    return
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      checkJsonStrings(filePath, child, [...stack, key])
    }
  }
}

for (const filePath of walkFiles(sourceDir)) {
  if (!sourceExtensions.has(path.extname(filePath))) continue

  const text = readFileSync(filePath, "utf8")
  const relativePath = path.relative(root, filePath)
  text.split(/\r?\n/).forEach((line, index) => {
    checkText(relativePath, `line ${index + 1}`, line)
  })
}

for (const filePath of walkFiles(messagesDir)) {
  if (path.extname(filePath) !== ".json") continue

  const relativePath = path.relative(root, filePath)
  const data = JSON.parse(readFileSync(filePath, "utf8"))
  checkJsonStrings(relativePath, data)
}

if (violations.length > 0) {
  console.error("Public copy check failed:")
  for (const violation of violations) {
    console.error(`- ${violation.filePath}:${violation.location} [${violation.reason}] "${violation.match}"`)
  }
  process.exit(1)
}

console.log("Public copy check passed.")
