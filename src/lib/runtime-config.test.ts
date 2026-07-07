import { readFileSync } from "node:fs"
import path from "node:path"
import test from "node:test"
import assert from "node:assert/strict"

test("package declares Node 24 runtime for Vercel builds", () => {
  const packageJson = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf8"))

  assert.equal(packageJson.engines?.node, "24.x")
})
