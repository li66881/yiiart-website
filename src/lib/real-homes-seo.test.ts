import assert from "node:assert/strict"
import test from "node:test"
import {
  filterReviewSitemapRoutes,
  filterRealHomesSitemapRoutes,
  realHomesGalleryRobots,
  reviewsPageRobots,
  shouldIndexRealHomesGallery,
  shouldIndexReviewsPage,
} from "./real-homes-seo"

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

test("only index the reviews page and list it in the sitemap when public reviews exist", () => {
  assert.equal(shouldIndexReviewsPage(0), false)
  assert.equal(shouldIndexReviewsPage(1), true)
  assert.deepEqual(reviewsPageRobots(0), { index: false, follow: true })
  assert.deepEqual(reviewsPageRobots(1), { index: true, follow: true })

  const routes = [{ path: "/reviews" }, { path: "/art-in-real-homes" }, { path: "/about" }]
  assert.deepEqual(filterReviewSitemapRoutes(routes, 0, 0), [{ path: "/about" }])
  assert.deepEqual(filterReviewSitemapRoutes(routes, 1, 0), [{ path: "/reviews" }, { path: "/about" }])
  assert.deepEqual(filterReviewSitemapRoutes(routes, 0, 1), [{ path: "/art-in-real-homes" }, { path: "/about" }])
})
