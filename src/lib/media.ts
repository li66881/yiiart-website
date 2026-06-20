const configuredMediaBaseUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "https://media.yiiart.com"

export const mediaBaseUrl = configuredMediaBaseUrl.replace(/\/$/, "")

export function mediaUrl(path: string) {
  const cleanPath = path.replace(/^\/+/, "")
  return `${mediaBaseUrl}/${cleanPath}`
}
