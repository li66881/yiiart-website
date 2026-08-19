import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@sanity/client"
import { adminMutationError, validateAdminPublishing } from "@/lib/admin"

export const runtime = "nodejs"

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "zlh03v8i",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})

const ARTIST_ID = "artist-sofie-lindberg-1787056654546"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const auth = validateAdminPublishing(body.password)
    if (!auth.ok) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status })
    }

    const action = String(body.action || "")
    if (action === "official-copy-and-homepage") {
      return NextResponse.json(await officialCopyAndHomepage(Array.isArray(body.videoCodes) ? body.videoCodes : []))
    }
    if (action === "attach-video") {
      return NextResponse.json(await attachVideo(body))
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 })
  } catch (error: any) {
    console.error("Patch catalog error:", error)
    const adminError = adminMutationError(error, "Catalog patch failed.")
    return NextResponse.json({ success: false, error: adminError.error }, { status: adminError.status })
  }
}

async function officialCopyAndHomepage(videoCodes: unknown[]) {
  const videoSet = new Set(videoCodes.map((value) => String(value || "").trim()).filter(Boolean))
  const artworks = await writeClient.fetch<Array<{
    _id: string
    catalogCode?: string
    title?: { en?: string, zh?: string }
  }>>(`*[_type == "artwork" && artist._ref == $artistId]{ _id, catalogCode, title }`, {
    artistId: ARTIST_ID,
  })

  const transaction = writeClient.transaction()
  transaction.patch(ARTIST_ID, (patch) => patch.set({
    featured: true,
    bio: {
      en: "Sofie Lindberg (b. 1981, Helsingør) paints from a north-facing loft studio in Copenhagen. After studies at the Royal Danish Academy of Fine Arts, she spent several winters in Lisbon, where dry light and plaster walls still show in her palettes. Her work moves between landscape, botanical still life, and constructed texture. Each YiiArt listing is a finished composition available hand-painted to order; brushwork, edge, and pigment density vary from piece to piece.",
      zh: "索菲·林德伯格，1981年生于丹麦赫尔辛格，现于哥本哈根北向阁楼工作室作画。毕业于丹麦皇家美术学院，曾在里斯本过冬，干爽光线与灰泥墙面仍出现在她的色调里。作品在风景、植物与建构肌理之间切换。YiiArt 上的每件都是可按尺寸手绘订制的正式作品；笔触、边缘与颜料厚度会因画而异。",
    },
  }))

  const homepage: string[] = []
  for (const artwork of artworks) {
    const code = String(artwork.catalogCode || "")
    const titleEn = artwork.title?.en || "Artwork"
    const titleZh = artwork.title?.zh || titleEn
    const featured = videoSet.size > 0 ? videoSet.has(code) : true
    if (featured) homepage.push(code)
    transaction.patch(artwork._id, (patch) => patch.set({
      featured,
      collectionType: "new_collection",
      productionModel: "hand_painted_to_order",
      rightsStatus: "approved",
      migrationStatus: "ready",
      shortDescription: {
        en: `${titleEn} is a hand-painted canvas by Sofie Lindberg, made to order in custom sizes. The listing shows the finished composition; brushwork will vary.`,
      },
      artworkStory: {
        en: `This painting is part of Sofie Lindberg’s YiiArt collection. The images show the approved composition, palette, and texture. Each canvas is painted by hand to order, so edges, pigment density, and small marks differ while keeping the same visual direction.`,
      },
      description: {
        en: `${titleEn} (${code}) is a made-to-order painting by Sofie Lindberg. Size and price follow YiiArt’s rolled-canvas matrix. The piece you receive is hand-painted, not a print.`,
        zh: `《${titleZh}》（${code}）是索菲·林德伯格的正式作品，支持按尺寸手绘订制。尺码与价格对齐 YiiArt 卷画矩阵。您收到的是手绘作品，不是印刷品。`,
      },
    }))
  }

  await transaction.commit()
  return {
    success: true,
    updated: artworks.length,
    homepage,
    featuredCount: homepage.length,
    message: "Official copy applied; new works promoted to the homepage.",
  }
}

async function attachVideo(body: Record<string, unknown>) {
  const catalogCode = String(body.catalogCode || "").trim()
  const url = String(body.url || "").trim()
  const posterUrl = String(body.posterUrl || "").trim()
  const key = String(body.key || "").trim()
  if (!catalogCode || !url) {
    return { success: false, error: "catalogCode and url are required." }
  }

  const artwork = await writeClient.fetch<{ _id: string, title?: { en?: string }, productMedia?: unknown[] } | null>(
    `*[_type == "artwork" && catalogCode == $catalogCode][0]{ _id, title, productMedia }`,
    { catalogCode },
  )
  if (!artwork?._id) {
    return { success: false, error: `Artwork ${catalogCode} was not found.` }
  }

  const nextMedia = (Array.isArray(artwork.productMedia) ? artwork.productMedia : [])
    .filter((item) => {
      if (!item || typeof item !== "object") return true
      const media = item as { mediaType?: string, role?: string, _key?: string }
      return !(media.mediaType === "video" && (media.role === "process" || media._key === `video-${catalogCode}`))
    })

  nextMedia.push({
    _type: "productMedia",
    _key: `video-${catalogCode.toLowerCase()}`,
    mediaType: "video",
    role: "process",
    url,
    posterUrl: posterUrl || undefined,
    key: key || undefined,
    contentType: "video/mp4",
    alt: `${artwork.title?.en || catalogCode} hang-on-wall video`,
    sortOrder: 15,
    sourceFolder: catalogCode,
    sourceNote: "Hang-on-wall video from the product media folder.",
    approvedForStorefront: true,
  })

  await writeClient.patch(artwork._id).set({ productMedia: nextMedia }).commit()
  return { success: true, catalogCode, id: artwork._id }
}
