import assert from "node:assert/strict"
import test from "node:test"
import { filterRealHomesSitemapRoutes, realHomesGalleryRobots, shouldIndexRealHomesGallery } from "./real-homes-seo"

test("only index the real-homes gallery when it contains permitted collector photos", () => {
  assert.equal(shouldIndexRealHomesGallery(0), false)
  assert.equal(shouldIndexRealHomesGallery(1), true)
  assert.deepEqual(realHomesGalleryRobots(0), { index: false, follow: true })
  assert.deepEqual(realHomesGalleryRobots(1), { index: true, follow: true })
})

test("keep the real-homes route out of the sitemap until permitted photos exist", () => {
  const routes = [{ path: "/" }, { path: "/art-in-real-homes" }]
  assert.deepEqual(filterRealHomesSitemapRoutes(routes, 0), [{ path: "/" }])
  assert.deepEqual(filterRealHomesSitemapRoutes(routes, 2), routes)
})
