export function shouldIndexRealHomesGallery(photoCount: number) {
  return photoCount > 0
}

export function realHomesGalleryRobots(photoCount: number) {
  return { index: shouldIndexRealHomesGallery(photoCount), follow: true }
}

export function filterRealHomesSitemapRoutes<T extends { path: string }>(routes: T[], photoCount: number) {
  return routes.filter((route) => route.path !== "/art-in-real-homes" || shouldIndexRealHomesGallery(photoCount))
}

export function shouldIndexReviewsPage(reviewCount: number) {
  return reviewCount > 0
}

export function reviewsPageRobots(reviewCount: number) {
  return { index: shouldIndexReviewsPage(reviewCount), follow: true }
}

export function filterReviewSitemapRoutes<T extends { path: string }>(routes: T[], reviewCount: number, photoCount: number) {
  return routes.filter((route) => {
    if (route.path === "/reviews") return shouldIndexReviewsPage(reviewCount)
    if (route.path === "/art-in-real-homes") return shouldIndexRealHomesGallery(photoCount)
    return true
  })
}
