import Image from "next/image"
import Link from "next/link"
import HeroSection, { type HeroSlide } from "@/components/HeroSection"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { formatArtworkDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl, getArtworkImageUrls, hasArtworkImage } from "@/lib/artwork-images"
import { buildEditorialHomeEdit, resolveVisualImage } from "@/lib/storefront/visual-content"
import styles from "./editorial-home.module.css"

type EditorialHomeProps = {
  artworks: any[]
}

const heroMessages = [
  {
    eyebrow: "New collection",
    title: "Handmade modern paintings for beautiful interiors.",
    subtitle: "Canvas art with real brushwork, created for living rooms, bedrooms, offices, and design projects.",
    ctaHref: "/artworks?sort=newest",
    ctaLabel: "Shop new arrivals",
  },
  {
    eyebrow: "Hand-painted to order",
    title: "Choose the scale that belongs on your wall.",
    subtitle: "Explore adaptable compositions, then select the size and finish that suit your space.",
    ctaHref: "/artworks?sort=featured",
    ctaLabel: "Shop featured art",
  },
  {
    eyebrow: "Custom painting",
    title: "A painting shaped around your room.",
    subtitle: "Share a wall size, room photo, and palette direction with the YiiArt studio.",
    ctaHref: "/custom-painting",
    ctaLabel: "Start a custom request",
  },
] as const

const roomPaths = [
  { title: "Living room", href: "/collections/abstract-art-for-living-room", text: "Statement art for the room where people gather." },
  { title: "Bedroom", href: "/collections/bedroom-wall-art", text: "Softer palettes and balanced compositions." },
  { title: "Dining room", href: "/artworks?room=Dining%20Room", text: "Horizontal pieces for long walls and tables." },
  { title: "Office", href: "/artworks?room=Office", text: "Calm artwork for focused, considered spaces." },
  { title: "Large walls", href: "/collections/large-canvas-art", text: "Generous canvases with visual presence." },
]

const stylePaths = [
  { title: "Abstract paintings", href: "/artworks?category=Abstract", match: ["abstract"] },
  { title: "Textured wall art", href: "/collections/textured-wall-art", match: ["texture", "textured", "plaster"] },
  { title: "Neutral wall art", href: "/artworks?color=Neutral", match: ["neutral", "minimal"] },
  { title: "Black and white", href: "/artworks?color=Black&color=White", match: ["black", "white", "monochrome"] },
  { title: "Minimalist art", href: "/artworks?category=Minimalist", match: ["minimal"] },
  { title: "Large wall art", href: "/collections/large-canvas-art", match: ["large", "oversized"] },
]

const process = [
  ["01", "Choose a work", "Start with a composition, palette, or room mood that feels right."],
  ["02", "Confirm the details", "Select the available size and finish, or ask the studio for guidance."],
  ["03", "Studio painting", "The selected design is hand-painted with natural variation in the brushwork."],
  ["04", "Packed for delivery", "Packing and delivery options are planned around the finished canvas."],
] as const

const trust = [
  ["Hand-painted", "Physical canvas art completed by studio artists."],
  ["Custom options", "Ask about size, orientation, finish, or palette direction."],
  ["Worldwide support", "Delivery options are confirmed for the destination and format."],
  ["Damage support", "Keep the packaging and contact the studio with clear photos."],
] as const

const faqs = [
  ["Is each painting handmade?", "Yes. Made-to-order pieces are painted by hand, so small variations in brushwork and color are part of the finished work."],
  ["Can I customize the size?", "Available sizes appear on each product page. For another scale, send the studio your wall dimensions and room photo."],
  ["How long does shipping take?", "Production and delivery depend on size, finish, destination, and carrier route. The applicable details are confirmed for the order."],
  ["What if the artwork arrives damaged?", "Keep the artwork and packaging, then contact YiiArt with clear photos so the available carrier process can be reviewed."],
] as const

export default function EditorialHome({ artworks }: EditorialHomeProps) {
  const { featured, newArrivals: newestCatalogArtworks, artistCollection } = buildEditorialHomeEdit(artworks)
  const withImages = artworks.filter(hasArtworkImage)
  const featuredArtworks = uniqueArtworks([...featured, ...withImages]).slice(0, 8)
  const newArrivals = newestCatalogArtworks.filter(hasArtworkImage)
  const heroArtworks = uniqueArtworks([...newArrivals, ...featuredArtworks, ...withImages]).slice(0, 3)
  const heroSlides: HeroSlide[] = heroArtworks.map((artwork, index) => ({
    imageUrl: getArtworkImageUrl(artwork, { width: 1800, height: 1200 }) || "",
    imageAlt: `${pickEnglish(artwork.title, "YiiArt painting")} styled for a modern interior`,
    ...heroMessages[index % heroMessages.length],
  }))
  const visualPool = withImages.map((artwork) => getArtworkImageUrl(artwork, { width: 1100, height: 900 })).filter(Boolean)

  return (
    <main className={styles.home}>
      <HeroSection slides={heroSlides} />

      <section className={styles.quickLinks} aria-label="Popular art categories">
        <div className={styles.shell}>
          <div className={styles.quickLinkRow}>
            {["Abstract", "Textured", "Minimalist", "Large canvas", "Living room", "Custom art"].map((label, index) => {
              const links = [
                "/artworks?category=Abstract",
                "/collections/textured-wall-art",
                "/artworks?category=Minimalist",
                "/collections/large-canvas-art",
                "/collections/abstract-art-for-living-room",
                "/custom-painting",
              ]
              return <Link key={label} href={links[index]}>{label}</Link>
            })}
          </div>
        </div>
      </section>

      <section id="featured-works" className={`${styles.section} ${styles.featured}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Best Sellers" title="Most-loved paintings for modern rooms." action={{ href: "/artworks?sort=featured", label: "Shop best sellers" }} />
          <div className={styles.artworkGrid}>
            {featuredArtworks.length > 0 ? featuredArtworks.map((artwork) => <ArtworkCard key={artwork._id} artwork={artwork} />) : <EmptyArtworkState />}
          </div>
          {featuredArtworks.length > 0 ? <p className={styles.priceDisclosure}><PriceDisclosure /></p> : null}
        </div>
      </section>

      <section className={`${styles.section} ${styles.rooms}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Shop by room" title="Find art for every wall." />
          <div className={styles.roomGrid}>
            {roomPaths.map((room, index) => (
              <Link key={room.title} href={room.href} className={styles.roomCard}>
                <span className={styles.roomMedia}>
                  {resolveVisualImage(visualPool.slice(index)) ? <Image src={resolveVisualImage(visualPool.slice(index)) || ""} alt={`${room.title} wall art inspiration`} fill sizes="(min-width: 960px) 20vw, 44vw" /> : <span>Room inspiration</span>}
                </span>
                <span className={styles.roomCopy}><strong>{room.title}</strong><small>{room.text}</small></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.styles}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Shop by style" title="Start with the feeling you want." />
          <div className={styles.styleGrid}>
            {stylePaths.map((style, index) => {
              const matchedArtwork = withImages.find((artwork) => style.match.some((term) => artworkSearchText(artwork).includes(term)))
              const image = matchedArtwork ? getArtworkImageUrl(matchedArtwork, { width: 1000, height: 760 }) : resolveVisualImage(visualPool.slice(index))
              return (
                <Link key={style.title} href={style.href} className={styles.styleCard}>
                  {image ? <Image src={image} alt={`${style.title} collection`} fill sizes="(min-width: 960px) 33vw, 100vw" /> : null}
                  <span className={styles.styleShade} />
                  <span className={styles.styleCopy}><strong>{style.title}</strong><small>Explore collection</small></span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {newArrivals.length > 0 ? (
        <section className={`${styles.section} ${styles.newArrivals}`}>
          <div className={styles.shell}>
            <SectionHeading eyebrow="New arrivals" title="Fresh from the studio edit." action={{ href: "/artworks?sort=newest", label: "Shop new arrivals" }} />
            <div className={styles.artworkRail}>
              {newArrivals.map((artwork) => <ArtworkCard key={`new-${artwork._id}`} artwork={artwork} compact />)}
            </div>
          </div>
        </section>
      ) : null}

      {artistCollection.length > 0 ? (
        <section className={`${styles.section} ${styles.artistCollection}`}>
          <div className={`${styles.shell} ${styles.splitLayout}`}>
            <div className={styles.stickyCopy}>
              <p className={styles.eyebrow}>Artist collection</p>
              <h2>Original works from independent artists.</h2>
              <p>Original one-of-one works remain clearly separated from the hand-painted-to-order collection.</p>
              <Link href="/artworks" className={styles.textLink}>Explore artist work</Link>
            </div>
            <div className={styles.artistGrid}>
              {artistCollection.map((artwork) => <ArtworkCard key={artwork._id} artwork={artwork} compact />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.custom}>
        <div className={`${styles.shell} ${styles.customLayout}`}>
          <div className={styles.customMedia}>
            {resolveVisualImage(visualPool) ? <Image src={resolveVisualImage(visualPool) || ""} alt="Custom painting shown in a considered interior" fill sizes="(min-width: 960px) 55vw, 100vw" /> : <span>Custom painting service</span>}
          </div>
          <div className={styles.customCopy}>
            <p className={styles.darkEyebrow}>Custom painting service</p>
            <h2>Made for your space, palette, and scale.</h2>
            <p>Share your room image, wall dimensions, preferred colors, and inspiration. The studio will help clarify the practical details before production begins.</p>
            <Link href="/custom-painting" className={styles.lightButton}>Start a custom order</Link>
          </div>
        </div>
      </section>

      <section id="process" className={styles.process}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Studio process" title="From first choice to finished canvas." />
          <ol className={styles.processGrid}>
            {process.map(([number, title, copy]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></li>)}
          </ol>
        </div>
      </section>

      <section className={`${styles.section} ${styles.trust}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Why YiiArt" title="Clear guidance for a considered purchase." />
          <div className={styles.trustGrid}>
            {trust.map(([title, copy], index) => <div key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></div>)}
          </div>
          <div className={styles.advisory}>
            <div><h3>Not sure about size?</h3><p>Send a room photo and wall measurement for a practical recommendation.</p></div>
            <Link href="/size-guide" className={styles.textLink}>Open the size guide</Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faq}`}>
        <div className={`${styles.shell} ${styles.faqLayout}`}>
          <div><p className={styles.eyebrow}>Frequently asked</p><h2>Useful details before you order.</h2></div>
          <div className={styles.faqList}>
            {faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
          </div>
        </div>
      </section>
    </main>
  )
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: { href: string; label: string } }) {
  return <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2></div>{action ? <Link href={action.href} className={styles.textLink}>{action.label}</Link> : null}</div>
}

function ArtworkCard({ artwork, compact = false }: { artwork: any; compact?: boolean }) {
  const href = `/artwork/${artwork.slug?.current || artwork._id}`
  const images = getArtworkImageUrls(artwork, { width: 900, height: 1125 })
  const title = pickEnglish(artwork.title, "Untitled artwork")
  const meta = [normalizeCategory(artwork.category), normalizeMedium(artwork.medium)].filter(Boolean).join(" / ")

  return <Link href={href} className={`${styles.artworkCard} ${compact ? styles.compactCard : ""}`}>
    <div className={styles.artworkMedia}>
      {images[0] ? <Image src={images[0]} alt={`${title}, hand-painted canvas art`} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" /> : <span>Artwork image available on request</span>}
      {images[1] ? <Image src={images[1]} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className={styles.hoverImage} /> : null}
    </div>
    <div className={styles.artworkCopy}>
      <p>{meta || "Hand-painted artwork"}</p>
      <div><h3>{title}</h3><span>{formatArtworkDimensions(artwork)}</span></div>
      <strong><PriceText amountCny={artwork.price} /></strong>
    </div>
  </Link>
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
