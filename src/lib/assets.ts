export function siteAssetUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL?.replace(/\/+$/, "")
  const cleanPath = path.startsWith("/") ? path : `/${path}`
  const isEssentialBrandAsset = /^(\/brand\/|\/flags\/|\/favicon\.svg$)/.test(cleanPath)

  if (!baseUrl || isEssentialBrandAsset) return cleanPath

  return `${baseUrl}${cleanPath}`
}
