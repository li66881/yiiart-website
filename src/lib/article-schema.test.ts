import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"

test("links guide author and publisher to the site Organization entity", async () => {
  const guidePage = await readFile("src/app/guides/home-wall-art-pairing-guide/page.tsx", "utf8")

  assert.match(guidePage, /author:\s*\{[\s\S]*?"@id": absoluteUrl\("\/#organization"\)/)
  assert.match(guidePage, /publisher:\s*\{\s*"@id": absoluteUrl\("\/#organization"\)/)
})
