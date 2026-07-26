import Image from "next/image"
import Link from "next/link"
import { PriceDisclosure, PriceText } from "@/components/PriceText"
import { formatArtworkDimensions, normalizeCategory, normalizeMedium, pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl, hasArtworkImage } from "@/lib/artwork-images"
import { buildEditorialHomeEdit, resolveVisualImage } from "@/lib/storefront/visual-content"
import HeroSection from "@/components/HeroSection"
import styles from "./editorial-home.module.css"

type EditorialHomeProps = {
  artworks: any[]
}

const roomPaths = [
  { title: "Living room", href: "/collections/abstract-art-for-living-room", text: "Statement paintings for calm focal walls." },
  { title: "Bedroom", href: "/collections/bedroom-wall-art", text: "Quiet pieces for softer, more personal spaces." },
  { title: "Large walls", href: "/collections/large-canvas-art", text: "Generous canvases for rooms that need presence." },
]

const process = [
  "Share a room photo, wall size, and the colour direction you like.",
  "We confirm the canvas size, composition, finish, and shipping format.",
  "A studio artist hand-paints the work to order with natural brushwork.",
  "Your canvas is carefully packed and prepared for worldwide delivery.",
]

const trust = [
  ["01", "Painted by hand", "Every made-to-order canvas is completed by a studio artist."],
  ["02", "Made for your wall", "Choose the size, orientation, and finish that fits the room."],
  ["03", "Global delivery", "We plan packing and shipping around the scale of your canvas."],
] as const

const faqs = [
  ["Is each painting handmade?", "Yes. Made-to-order pieces are painted by hand for the selected size and finish."],
  ["Can I ask for a custom size?", "Yes. Send your wall measurement and room photo for a practical recommendation."],
  ["Can I check the palette first?", "Yes. Contact the studio if colour accuracy is important for your room."],
]

export default function EditorialHome({ artworks }: EditorialHomeProps) {
  const { featured, artistCollection } = buildEditorialHomeEdit(artworks)
  const heroArtwork = featured.find(hasArtworkImage) || artworks.find(hasArtworkImage)
  const heroImage = heroArtwork ? getArtworkImageUrl(heroArtwork, { width: 1800, height: 1200 }) : undefined
  const roomImages = [
    ...featured.map((artwork) => getArtworkImageUrl(artwork, { width: 1000, height: 700 })),
    ...artworks.map((artwork) => getArtworkImageUrl(artwork, { width: 1000, height: 700 })),
  ].filter(Boolean)

  return (
    <main className={styles.home}>
      <HeroSection
        imageUrl={heroImage}
        imageAlt={heroArtwork ? `${pickEnglish(heroArtwork.title, "YiiArt painting")} in a styled interior` : undefined}
      />

      <section id="featured-works" className={`${styles.section} ${styles.featured}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Made for your walls" title="Featured paintings" action={{ href: "/artworks", label: "View all art" }} />
          <div className={styles.artworkGrid}>
            {featured.length > 0 ? featured.map((artwork) => <ArtworkCard key={artwork._id} artwork={artwork} />) : <EmptyArtworkState />}
          </div>
          {featured.length > 0 && <p className={styles.priceDisclosure}><PriceDisclosure /></p>}
        </div>
      </section>

      <section className={`${styles.section} ${styles.rooms}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Place it with confidence" title="Find the right scale for your room." />
          <div className={styles.roomGrid}>
            {roomPaths.map((room, index) => (
              <Link key={room.href} href={room.href} className={styles.roomCard}>
                <div className={styles.roomMedia}>
                  {resolveVisualImage(roomImages.slice(index)) ? (
                    <Image
                      src={resolveVisualImage(roomImages.slice(index)) || ""}
                      alt={`${room.title} wall art inspiration`}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <span>Room guidance</span>
                  )}
                </div>
                <div className={styles.roomCopy}>
                  <h3>{room.title}</h3>
                  <p>{room.text}</p>
                  <span>Explore collection</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className={styles.process}>
        <div className={`${styles.shell} ${styles.processLayout}`}>
          <div className={styles.stickyCopy}>
            <p className={styles.darkEyebrow}>From studio to wall</p>
            <h2>A clear process, from room advice to final brushwork.</h2>
          </div>
          <ol className={styles.processList}>
            {process.map((item, index) => <li key={item}><span>0{index + 1}</span><p>{item}</p></li>)}
          </ol>
        </div>
      </section>

      {artistCollection.length > 0 && (
        <section className={`${styles.section} ${styles.artistCollection}`}>
          <div className={`${styles.shell} ${styles.collectionLayout}`}>
            <div className={styles.stickyCopy}>
              <p className={styles.eyebrow}>Artist collection</p>
              <h2>Original works from independent artists.</h2>
              <p>Legacy original artworks remain in a separate collection, so they never interrupt the made-to-order edit.</p>
              <Link href="/artworks" className={styles.textLink}>Explore artist work</Link>
            </div>
            <div className={styles.artistGrid}>
              {artistCollection.map((artwork) => <ArtworkCard key={artwork._id} artwork={artwork} compact />)}
            </div>
          </div>
        </section>
      )}

      <section className={styles.custom}>
        <div className={`${styles.shell} ${styles.customLayout}`}>
          <div className={styles.customMedia}>
            {resolveVisualImage(roomImages) ? (
              <Image
                src={resolveVisualImage(roomImages) || ""}
                alt="Custom canvas art styled in a warm interior"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            ) : (
              <span>Custom canvas art</span>
            )}
          </div>
          <div className={styles.customCopy}>
            <p className={styles.darkEyebrow}>Custom art service</p>
            <h2>Commission a painting for your exact wall.</h2>
            <p>Send a room image, wall size, palette direction, and the mood you want. The studio will help shape the canvas before production begins.</p>
            <Link href="/custom-painting" className={styles.lightButton}>Start a custom order</Link>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.trust}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Why YiiArt" title="A quieter, clearer way to buy art online." />
          <div className={styles.trustGrid}>
            {trust.map(([number, title, copy]) => <div key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faq}`}>
        <div className={`${styles.shell} ${styles.faqLayout}`}>
          <div><p className={styles.eyebrow}>Questions before buying</p><h2>Helpful details, without the hard sell.</h2></div>
          <div className={styles.faqList}>
            {faqs.map(([question, answer]) => <details key={question}><summary>{question}<span>+</span></summary><p>{answer}</p></details>)}
          </div>
        </div>
      </section>
    </main>
  )
}

function SectionHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: { href: string; label: string } }) {
  return <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{eyebrow}</p><h2>{title}</h2></div>{action && <Link href={action.href} className={styles.textLink}>{action.label}</Link>}</div>
}

function ArtworkCard({ artwork, compact = false }: { artwork: any; compact?: boolean }) {
  const href = `/artwork/${artwork.slug?.current || artwork._id}`
  const image = getArtworkImageUrl(artwork, { width: 900, height: 1125 })
  const title = pickEnglish(artwork.title, "Untitled artwork")
  const meta = [normalizeCategory(artwork.category), normalizeMedium(artwork.medium)].filter(Boolean).join(" / ")

  return <Link href={href} className={styles.artworkCard}>
    <div className={styles.artworkMedia}>
      {image ? (
        <Image
          src={image}
          alt={`${title}, hand-painted canvas art`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
      ) : (
        <span>Artwork image available on request</span>
      )}
    </div>
    <div className={styles.artworkCopy}><p>{meta}</p><div><h3>{title}</h3><span>{compact ? pickEnglish(artwork.artist?.name, "YiiArt") : formatArtworkDimensions(artwork)}</span></div><strong><PriceText amountCny={artwork.price} /></strong></div>
  </Link>
}

function EmptyArtworkState() {
  return <div className={styles.emptyState}>Explore the current collection or contact the studio for a custom canvas.</div>
}
