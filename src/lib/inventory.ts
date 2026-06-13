import { createClient } from "@sanity/client"

const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

export async function markArtworksSold(artworkIds: string[], orderNumber: string) {
  if (!process.env.SANITY_WRITE_TOKEN || artworkIds.length === 0) return

  const now = new Date().toISOString()
  const transaction = sanityWriteClient.transaction()

  for (const artworkId of [...new Set(artworkIds)]) {
    transaction.patch(artworkId, (patch) =>
      patch.set({
        availability: "sold",
        allowCheckout: false,
        soldAt: now,
        soldOrderNumber: orderNumber,
      })
    )
  }

  await transaction.commit()
}
