import { permanentRedirect } from "next/navigation"

export default async function ShopArtworkRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  permanentRedirect(`/artwork/${encodeURIComponent(slug)}`)
}
