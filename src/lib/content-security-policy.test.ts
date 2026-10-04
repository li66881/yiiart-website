import assert from "node:assert/strict"
import { createRequire } from "node:module"
import test from "node:test"

const require = createRequire(import.meta.url)
const nextConfig = require("../../next.config.js")

test("allows the configured analytics beacons without broadening other CSP sources", async () => {
  const headerGroups = await nextConfig.headers()
  const csp = headerGroups
    .flatMap((group: { headers: Array<{ key: string; value: string }> }) => group.headers)
    .find((header: { key: string }) => header.key === "Content-Security-Policy")?.value

  assert.ok(csp)
  const directives = new Map<string, string[]>(
    csp.split(";").map((directive: string): [string, string[]] => {
      const [name, ...sources] = directive.trim().split(/\s+/)
      return [name, sources]
    })
  )

  assert.ok(directives.get("script-src")?.includes("https://static.cloudflareinsights.com"))
  assert.ok(directives.get("img-src")?.includes("https://www.googletagmanager.com"))
  assert.ok(directives.get("img-src")?.includes("https://*.google-analytics.com"))
  assert.equal(directives.get("img-src")?.includes("*"), false)
})
