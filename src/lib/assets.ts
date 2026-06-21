export function siteAssetUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_ASSET_BASE_URL?.replace(/\/+$/, "")
  const cleanPath = path.startsWith("/") ? path : `/${path}`

  if (!baseUrl) return cleanPath

  return `${baseUrl}${cleanPath}`
}
