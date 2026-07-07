import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import test from "node:test"
import robots from "@/app/robots"
import { getAdminConfigStatus } from "@/lib/admin"

const require = createRequire(import.meta.url)
const nextConfig = require("../../next.config.js")

test("CSP allows Cloudflare R2 public image delivery", async () => {
  const routes = await nextConfig.headers()
  const csp = routes
    .flatMap((route: { headers?: Array<{ key: string; value: string }> }) => route.headers || [])
    .find((header: { key: string }) => header.key.toLowerCase() === "content-security-policy")
    ?.value || ""

  const imgSrc = csp
    .split(";")
    .map((part: string) => part.trim())
    .find((part: string) => part.startsWith("img-src "))

  assert.ok(imgSrc, "Content-Security-Policy must define img-src")
  assert.match(imgSrc, /https:\/\/assets\.yiiart\.com\b/)
})

test("robots blocks both admin route forms", () => {
  const result = robots()
  const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules
  const disallow = Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]

  assert.ok(disallow.includes("/admin"), "robots must block /admin")
  assert.ok(disallow.includes("/admin/"), "robots must block /admin/")
})

test("admin configuration status does not report defaults as configured", () => {
  const originalEnv = { ...process.env }

  try {
    delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    delete process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL
    delete process.env.NEXT_PUBLIC_MEDIA_BASE_URL
    delete process.env.NEXT_PUBLIC_GA_ID
    delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
    process.env.CLOUDFLARE_R2_ACCOUNT_ID = "account"
    process.env.CLOUDFLARE_R2_BUCKET = "yiiart-assets"
    process.env.CLOUDFLARE_API_TOKEN = "token"
    delete process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
    delete process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

    const status = getAdminConfigStatus()

    assert.equal(status.sanityProject, false)
    assert.equal(status.r2MediaPublic, false)
    assert.equal(status.r2MediaUpload, false)
    assert.equal(status.analytics, false)
  } finally {
    process.env = originalEnv
  }
})

test("admin routes declare noindex metadata", async () => {
  const layoutPath = path.join(process.cwd(), "src", "app", "admin", "layout.tsx")

  assert.ok(existsSync(layoutPath), "admin layout metadata is missing")

  const layout = await import("@/app/admin/layout")
  assert.equal(layout.metadata?.robots?.index, false)
  assert.equal(layout.metadata?.robots?.follow, false)
})

test("artist creation form starts without sample artist defaults", () => {
  const source = readFileSync(path.join(process.cwd(), "src", "app", "admin", "artist-new", "page.tsx"), "utf8")

  assert.doesNotMatch(source, /useState\("Huang Liang"\)/)
  assert.doesNotMatch(source, /useState\("Beijing"\)/)
  assert.doesNotMatch(source, /useState\("Abstract, Oil painting"\)/)
  assert.doesNotMatch(source, /Contemporary Chinese artist/)
})
