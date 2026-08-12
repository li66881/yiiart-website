import Image from "next/image"
import Link from "next/link"
import HeroSection, { type HeroSlide } from "@/components/HeroSection"
import BestSellerTabs from "@/components/home/BestSellerTabs"
import HomeProductCard from "@/components/home/HomeProductCard"
import { PriceDisclosure } from "@/components/PriceText"
import { normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl, hasArtworkImage } from "@/lib/artwork-images"
import { buildEditorialHomeEdit, resolveVisualImage } from "@/lib/storefront/visual-content"
import styles from "./editorial-home.module.css"

type EditorialHomeProps = {
  artworks: any[]
}

const heroMessages = [
  {
    eyebrow: "New collection",
    title: "Art for the room you live in.",
    ctaHref: "/artworks?sort=newest",
    ctaLabel: "Shop new arrivals",
  },
  {
    eyebrow: "Hand-painted to order",
    title: "Choose the scale of your wall.",
    ctaHref: "/artworks?sort=featured",
    ctaLabel: "Shop featured art",
  },
  {
    eyebrow: "Custom painting",
    title: "A painting shaped around your space.",
    ctaHref: "/custom-painting",
    ctaLabel: "Start a custom request",
  },
] as const

const popularPaths = [
  { title: "Abstract", href: "/artworks?category=Abstract", match: ["abstract"] },
  { title: "Textured", href: "/collections/textured-wall-art", match: ["texture", "textured", "plaster"] },
  { title: "Neutral", href: "/artworks?color=Neutral", match: ["neutral", "minimal"] },
  { title: "Black and white", href: "/artworks?color=Black&color=White", match: ["black", "white", "monochrome"] },
  { title: "Minimalist", href: "/artworks?category=Minimalist", match: ["minimal"] },
  { title: "Large wall art", href: "/collections/large-canvas-art", match: ["large", "oversized"] },
]

const roomShows = [
  { title: "Living Room", href: "/collections/abstract-art-for-living-room" },
  { title: "Bedroom", href: "/collections/bedroom-wall-art" },
  { title: "Dining room", href: "/artworks?room=Dining%20Room" },
  { title: "Office", href: "/artworks?room=Office" },
]

const orientations = [
  { title: "Horizontal", href: "/artworks?orientation=Landscape" },
  { title: "Vertical", href: "/artworks?orientation=Portrait" },
  { title: "Square", href: "/artworks?orientation=Square" },
]

const trustIcons = [
  ["Hand-painted", "Studio artists complete each canvas by hand."],
  ["Custom sizing", "Ask about scale, finish, or palette direction."],
  ["Worldwide support", "Delivery is confirmed for the destination."],
  ["Damage support", "Keep packaging and send clear photos."],
] as const

export default function EditorialHome({ artworks }: EditorialHomeProps) {
  const { featured, newArrivals: newestCatalogArtworks, artistCollection } = buildEditorialHomeEdit(artworks)
  const withImages = artworks.filter(hasArtworkImage)
  const featuredArtworks = uniqueArtworks([...featured, ...withImages]).slice(0, 12)
  const newArrivals = newestCatalogArtworks.filter(hasArtworkImage).slice(0, 12)
  const heroArtworks = uniqueArtworks([...newArrivals, ...featuredArtworks, ...withImages]).slice(0, 3)
  const heroSlides: HeroSlide[] = heroArtworks.map((artwork, index) => ({
    imageUrl: getArtworkImageUrl(artwork, { width: 1800, height: 1200 }) || "",
    imageAlt: `${pickEnglish(artwork.title, "YiiArt painting")} styled for a modern interior`,
    shopHref: `/artwork/${artwork.slug?.current || artwork._id}`,
    ...heroMessages[index % heroMessages.length],
  }))
  const visualPool = withImages.map((artwork) => getArtworkImageUrl(artwork, { width: 1400, height: 900 })).filter(Boolean)

  return (
    <main className={styles.home}>
      <HeroSection slides={heroSlides} />

      <section id="featured-works" className={`${styles.section} ${styles.featured}`}>
        <div className={styles.shell}>
          {featuredArtworks.length > 0 ? (
            <>
              <BestSellerTabs artworks={featuredArtworks} />
              <p className={styles.priceDisclosure}><PriceDisclosure /></p>
            </>
          ) : (
            <EmptyArtworkState />
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles.popular}`} aria-label="Shop by popular">
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <h2>Shop By Popular</h2>
          </div>
          <div className={styles.mosaic}>
            {popularPaths.map((style, index) => {
              const matchedArtwork = withImages.find((artwork) => style.match.some((term) => artworkSearchText(artwork).includes(term)))
              const image = matchedArtwork ? getArtworkImageUrl(matchedArtwork, { width: 1200, height: 900 }) : resolveVisualImage(visualPool.slice(index))
              return (
                <Link key={style.title} href={style.href} className={`${styles.mosaicTile} ${index === 0 ? styles.mosaicFeature : ""}`}>
                  {image ? <Image src={image} alt={`${style.title} collection`} fill sizes="(min-width: 960px) 40vw, 100vw" /> : null}
                  <span className={styles.mosaicLabel}>
                    <small>0{index + 1}</small>
                    <strong>{style.title}</strong>
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className={styles.roomShows} aria-label="Shop by room">
        {roomShows.map((room, index) => {
          const image = resolveVisualImage(visualPool.slice(index + 1))
          return (
            <Link key={room.title} href={room.href} className={styles.roomShow}>
              {image ? <Image src={image} alt={`${room.title} wall art`} fill sizes="100vw" /> : null}
              <span className={styles.roomShowCopy}>
                <small>Shop by room</small>
                <strong>{room.title}</strong>
              </span>
            </Link>
          )
        })}
      </section>

      {newArrivals.length > 0 ? (
        <section className={`${styles.section} ${styles.newArrivals}`}>
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <h2>New In</h2>
              <Link href="/artworks?sort=newest" className={styles.textLink}>View all</Link>
            </div>
            <div className={styles.artworkRail}>
              {newArrivals.map((artwork) => (
                <div key={`new-${artwork._id}`} className={styles.railItem}>
                  <HomeProductCard artwork={artwork} badge="new" compact />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={`${styles.section} ${styles.orientations}`}>
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <h2>Shop By Orientation</h2>
          </div>
          <div className={styles.orientGrid}>
            {orientations.map((item, index) => {
              const image = resolveVisualImage(visualPool.slice(index + 3))
              return (
                <Link key={item.title} href={item.href} className={styles.orientCard}>
                  {image ? <Image src={image} alt={`${item.title} paintings`} fill sizes="(min-width: 960px) 33vw, 100vw" /> : null}
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {artistCollection.length > 0 ? (
        <section className={`${styles.section} ${styles.artistCollection}`}>
          <div className={styles.shell}>
            <div className={styles.sectionHeading}>
              <h2>Featured Artists</h2>
              <Link href="/artists" className={styles.textLink}>View all</Link>
            </div>
            <div className={styles.artworkRail}>
              {artistCollection.slice(0, 8).map((artwork) => (
                <div key={artwork._id} className={styles.railItem}>
                  <HomeProductCard artwork={artwork} compact />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.custom}>
        <div className={`${styles.shell} ${styles.customLayout}`}>
          <div className={styles.customMedia}>
            {resolveVisualImage(visualPool) ? (
              <Image src={resolveVisualImage(visualPool) || ""} alt="Custom painting shown in a considered interior" fill sizes="(min-width: 960px) 55vw, 100vw" />
            ) : (
              <span>Custom painting service</span>
            )}
          </div>
          <div className={styles.customCopy}>
            <p className={styles.darkEyebrow}>Custom painting</p>
            <h2>Made for your space.</h2>
            <p>Share a room photo, wall size, and palette. The studio will confirm the practical details before painting begins.</p>
            <Link href="/custom-painting" className={styles.lightButton}>Start a custom order</Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.brand}`}>
        <div className={styles.shell}>
          <div className={styles.brandGrid}>
            <div>
              <h2>Brand Story</h2>
              <p>
                YiiArt makes hand-painted canvas art for real rooms. Choose a composition, confirm the scale,
                and the studio paints it to order — with natural variation in the brushwork.
              </p>
              <Link href="/about" className={styles.textLink}>Our story</Link>
            </div>
            <div className={styles.trustIcons}>
              {trustIcons.map(([title, copy]) => (
                <div key={title}>
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.advisory}>
            <div>
              <h3>Not sure about size?</h3>
              <p>Send a room photo and wall measurement for a practical recommendation. Dining room and office walls welcome.</p>
            </div>
            <Link href="/size-guide" className={styles.textLink}>Open the size guide</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function EmptyArtworkState() {
  return <div className={styles.emptyState}>Explore the current collection or contact the studio for a custom canvas.</div>
}

function uniqueArtworks(artworks: any[]) {
  return Array.from(new Map(artworks.filter(Boolean).map((artwork) => [artwork._id, artwork])).values())
}

function artworkSearchText(artwork: any) {
  return [pickEnglish(artwork.title), normalizeCategory(artwork.category), normalizeMedium(artwork.medium), ...(Array.isArray(artwork.tags) ? artwork.tags : [])].join(" ").toLowerCase()
}
