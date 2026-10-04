import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

test("size guide answers the sofa artwork sizing query before the detailed table", async () => {
  const page = await readFile("src/app/size-guide/page.tsx", "utf8")
  const answerHeading = page.indexOf("What size wall art should go above a sofa?")
  const sizingTable = page.indexOf("Suggested total artwork width by sofa width")

  assert.ok(answerHeading >= 0)
  assert.ok(sizingTable > answerHeading)
  assert.match(page, /60%-75% of the sofa's width/)
  assert.match(page, /84-inch sofa/)
  assert.match(page, /Measure the clear wall and include gaps between pieces/)
  assert.match(page, /instead of treating the ratio as a rule/)
})
