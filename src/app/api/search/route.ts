import { NextResponse } from "next/server"
import { client, urlFor } from "@/lib/sanity"
import { formatDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"

const MAX_QUERY_LENGTH = 80

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = normalizeQuery(searchParams.get("q"))

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  try {
    const wildcard = `*${query}*`
    const artworks = await client.fetch(
      `*[_type == "artwork" && (
        title.en match $wildcard
        || title.zh match $wildcard
        || category match $wildcard
        || medium match $wildcard
        || artist->name.en match $wildcard
        || artist->name.zh match $wildcard
      )] | order(featured desc, _createdAt desc)[0...8]{
        _id,
        title,
        slug,
        artist->{name},
        price,
        dimensions,
        medium,
        category,
        images
      }`,
      { wildcard }
    )

    const results = artworks.map((artwork: any) => ({
      id: artwork._id,
      title: pickEnglish(artwork.title, "Untitled artwork"),
      artist: pickEnglish(artwork.artist?.name, "YiiArt artist"),
      href: `/artwork/${artwork.slug?.current || artwork._id}`,
      price: Number(artwork.price || 0),
      image: artwork.images?.[0] ? urlFor(artwork.images[0]).width(240).height(300).url() : "",
      meta: [normalizeCategory(artwork.category), normalizeMedium(artwork.medium), formatDimensions(artwork.dimensions)]
        .filter(Boolean)
        .join(" / "),
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ results: [], error: "Search failed" }, { status: 500 })
  }
}

function normalizeQuery(value: string | null) {
  return (value || "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
}
