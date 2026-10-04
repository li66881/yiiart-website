export function shouldIndexRealHomesGallery(photoCount: number) {
  return photoCount > 0
}

export function realHomesGalleryRobots(photoCount: number) {
  return { index: shouldIndexRealHomesGallery(photoCount), follow: true }
}

export function filterRealHomesSitemapRoutes<T extends { path: string }>(routes: T[], photoCount: number) {
  return routes.filter((route) => route.path !== "/art-in-real-homes" || shouldIndexRealHomesGallery(photoCount))
}
