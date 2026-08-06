import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ArtworkDiscoveryGrid from "@/components/ArtworkDiscoveryGrid"
import { ArtworksPageHeroCopy, CuratedPathsCopy, LivingRoomsLinkCopy } from "@/components/ArtworksPageCopy"
import { client } from "@/lib/sanity"
import { getArtworkImageUrl, getArtworkImageUrls, hasArtworkImage } from "@/lib/artwork-images"
import { buildSeoMetadata } from "@/lib/seo"
import { storefrontCollectionTiles } from "@/lib/storefront-content"
import { buildArtworkDiscoveryItem } from "@/lib/artwork-discovery"
import { PUBLIC_ARTWORK_GROQ_FILTER } from "@/lib/artwork-publication"
import { normalizeCategory, pickEnglish } from "@/lib/artwork-display"
import { isStudioSaleActive } from "@/lib/storefront/sale"

export const revalidate = 600

interface Props {
  searchParams: Promise<{ category?: string; orientation?: string; promo?: string; sort?: string }>
}

async function getArtworks() {
  return client.fetch(`*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER}] | order(featured desc, _createdAt desc){
    ...,
    artist->{name}
  }`)
}

async function getCategoryArtworks(category?: string) {
  if (!category) return getArtworks()

  const legacyCategories: Record<string, string[]> = {
    Abstract: ["Abstract", "鎶借薄", "抽象"],
    Landscape: ["Landscape", "鏅", "景观"],
    Portrait: ["Portrait", "鑲栧儚", "肖像"],
    Texture: ["Texture", "Textured Art", "鑲岀悊", "肌理"],
    Minimalist: ["Minimalist", "鏋佺畝", "极简"],
  }

  return client.fetch(
    `*[_type == "artwork" && ${PUBLIC_ARTWORK_GROQ_FILTER} && category in $categories] | order(featured desc, _createdAt desc)[0...12]{
      ...,
      artist->{name}
    }`,
    { categories: legacyCategories[category] || [category] }
  )
}

async function getSeoImage(category?: string) {
  const artworks = await getCategoryArtworks(category).catch(() => [])
  const artworkWithImage = artworks.find(hasArtworkImage)

  if (!artworkWithImage) return undefined

  return {
    image: getArtworkImageUrl(artworkWithImage, { width: 1200, height: 630 }),
    alt: pickEnglish(artworkWithImage.title, "Original YiiArt painting"),
  }
}

export async function generateMetadata({ searchParams }: Props) {
  const params = await searchParams
  const activeCategory = normalizeCategory(params.category)
  const isSale = params.promo === "sale"
  const sortMode = normalizeSortParam(params.sort)
  const seoImage = await getSeoImage(activeCategory)
  const title = isSale
    ? "Studio Sale — Up to 40% Off"
    : sortMode === "newest"
      ? "New Arrivals"
      : sortMode === "featured"
        ? "Best Sellers"
        : activeCategory
          ? `${activeCategory} Original Paintings`
          : "Original Paintings"
  const description = isSale
    ? "Browse the YiiArt studio sale: selected hand-painted canvases up to 40% off, with free worldwide shipping."
    : sortMode === "newest"
      ? "Browse the newest hand-painted canvases from YiiArt, ready to size and ship worldwide."
      : sortMode === "featured"
        ? "Browse YiiArt best sellers — collector favorites across texture, landscape, abstract, and more."
        : activeCategory
          ? `Browse ${activeCategory.toLowerCase()} original paintings from YiiArt, each hand-painted and shipped worldwide with a signed certificate.`
          : "Browse original abstract, landscape, portrait, textured, and minimalist paintings hand-painted on canvas."
  const path = isSale
    ? "/artworks?promo=sale"
    : sortMode
      ? `/artworks?sort=${sortMode}`
      : activeCategory
        ? `/artworks?category=${encodeURIComponent(activeCategory)}`
        : "/artworks"

  return buildSeoMetadata({
    title,
    description,
    path,
    image: seoImage?.image,
    imageAlt: seoImage?.alt,
  })
}

export default async function ArtworksPage({ searchParams }: Props) {
  const params = await searchParams
  const activeCategory = normalizeCategory(params.category)
  const orientation = normalizeOrientationParam(params.orientation)
  const isSale = params.promo === "sale"
  const sortMode = normalizeSortParam(params.sort)
  // Sale / sorted nav uses the full public catalog; category pages keep their focused set.
  const artworks = await (
    isSale || sortMode || !activeCategory
      ? getArtworks()
      : getCategoryArtworks(activeCategory)
  ).catch(() => [])
  const artworkItems = artworks.map((artwork: any) => {
    const images = getArtworkImageUrls(artwork, { width: 700 })
    return buildArtworkDiscoveryItem(artwork, images[0], images[1] || images[0])
  })
  const initialSortMode = isSale
    ? "price-asc"
    : sortMode || "featured"

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5f0] text-stone-950">
      <Header />

      <main className="flex-1 bg-[#f7f5f0] pb-16 pt-[var(--ya-header-offset)] lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
          <ArtworksPageHeroCopy
            activeCategory={activeCategory}
            promo={isSale ? "sale" : null}
            sort={sortMode}
          />

          <section className="mb-8 pb-2">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <CuratedPathsCopy />
              <a href="/collections/abstract-art-for-living-room" className="text-sm underline underline-offset-4">
                <LivingRoomsLinkCopy />
              </a>
            </div>
            <div className="flex snap-x gap-5 overflow-x-auto pb-2">
              {storefrontCollectionTiles.map((collection, index) => {
                const image = artworkItems[index % Math.max(artworkItems.length, 1)]?.imageUrl
                return (
                  <a
                    key={collection.href}
                    href={collection.href}
                    className="flex w-[92px] shrink-0 snap-start flex-col items-center gap-2 text-center"
                  >
                    <span className="relative block h-[92px] w-[92px] overflow-hidden rounded-full border border-stone-300 bg-[#ebe6dc]">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-medium text-stone-700">
                          {collection.title.slice(0, 1)}
                        </span>
                      )}
                    </span>
                    <span className="text-xs leading-snug text-stone-700">{collection.title}</span>
                  </a>
                )
              })}
            </div>
          </section>

          <ArtworkDiscoveryGrid
            items={artworkItems}
            initialFilters={orientation ? { orientations: [orientation] } : undefined}
            initialSortMode={initialSortMode}
            cardBadge={isSale ? "40% OFF" : sortMode === "featured" ? "Best Seller" : null}
            showSalePricing={isSale || isStudioSaleActive()}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}

function normalizeOrientationParam(value?: string) {
  if (!value) return null
  const map: Record<string, string> = {
    Portrait: "Portrait",
    Vertical: "Portrait",
    Landscape: "Landscape",
    Horizontal: "Landscape",
    Square: "Square",
  }
  return map[value] || null
}

function normalizeSortParam(value?: string) {
  if (value === "newest" || value === "featured" || value === "price-asc" || value === "price-desc" || value === "large-first") {
    return value
  }
  return null
}
