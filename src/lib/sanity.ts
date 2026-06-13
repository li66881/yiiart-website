import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: '2024-01-01',
  useCdn: process.env.SANITY_USE_CDN !== "false",
  timeout: Number(process.env.SANITY_REQUEST_TIMEOUT_MS || "10000"),
})

const builder = createImageUrlBuilder({ 
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
})

export function urlFor(source: any) {
  return builder.image(source)
}
