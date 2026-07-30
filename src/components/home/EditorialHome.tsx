import Image from "next/image"
import Link from "next/link"
import { PriceDisclosure } from "@/components/PriceText"
import ProductCard from "@/components/storefront/ProductCard"
import { pickEnglish } from "@/lib/artwork-display"
import { getArtworkImageUrl, getArtworkImageUrls, hasArtworkImage } from "@/lib/artwork-images"
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

const styleChips = [
  { label: "Abstract", href: "/artworks?category=Abstract" },
  { label: "Texture", href: "/artworks?category=Texture" },
  { label: "Minimalist", href: "/artworks?category=Minimalist" },
  { label: "Landscape", href: "/artworks?category=Landscape" },
  { label: "Wabi-sabi", href: "/collections/textured-wall-art" },
  { label: "Large canvas", href: "/collections/large-canvas-art" },
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
  ["04", "Easy returns", "Ready-made works can be returned within 30 days."],
] as const

const faqs = [
  ["Is each painting handmade?", "Yes. Made-to-order pieces are painted by hand for the selected size and finish."],
  ["Can I ask for a custom size?", "Yes. Send your wall measurement and room photo for a practical recommendation."],
  ["Can I check the palette first?", "Yes. Contact the studio if colour accuracy is important for your room."],
]

function toCard(artwork: any) {
  const images = getArtworkImageUrls(artwork, { width: 900 })
  return {
    id: artwork._id,
    href: `/artwork/${artwork.slug?.current || artwork._id}`,
    title: pickEnglish(artwork.title, "Untitled artwork"),
    priceCny: artwork.price,
    image: images[0] || getArtworkImageUrl(artwork, { width: 900 }),
    hoverImage: images[1] || images[0] || null,
    sku: artwork.sku || artwork.slug?.current?.toUpperCase?.() || null,
    badge: artwork.collectionType === "new_collection" || artwork.featured ? "Gallery Quality" : null,
  }
}

export default function EditorialHome({ artworks }: EditorialHomeProps) {
  const { featured, artistCollection } = buildEditorialHomeEdit(artworks)
  const withImages = artworks.filter(hasArtworkImage)
  const heroCandidates = [
    ...featured.filter(hasArtworkImage),
    ...withImages,
  ]
  const heroSlides = Array.from(
    new Map(
      heroCandidates.map((artwork) => {
        const urls = getArtworkImageUrls(artwork, { width: 1800, height: 1200 })
        const imageUrl = urls[1] || urls[0] || getArtworkImageUrl(artwork, { width: 1800, height: 1200 })
        return [
          artwork._id,
          {
            imageUrl: imageUrl || "",
            imageAlt: `${pickEnglish(artwork.title, "YiiArt painting")} in a styled interior`,
            eyebrow: "Summer Sale",
            title: "Deals still going",
            subtitle: "Selected hand-painted canvases · Free worldwide shipping",
            ctaHref: "/artworks",
            ctaLabel: "Shop All Art",
            promo: true,
          },
        ] as const
      }),
    ).values(),
  )
    .filter((slide) => Boolean(slide.imageUrl))
    .slice(0, 5)

  const roomImages = [
    ...featured.map((artwork) => getArtworkImageUrl(artwork, { width: 1000, height: 700 })),
    ...artworks.map((artwork) => getArtworkImageUrl(artwork, { width: 1000, height: 700 })),
  ].filter(Boolean)
  const bestSellers = featured.slice(0, 8)
  const newArrivals = artworks.filter(hasArtworkImage).slice(0, 8)

  return (
    <main className={styles.home}>
      <HeroSection slides={heroSlides} />

      <section className={`${styles.section} ${styles.featured}`}>
        <div className={styles.shell}>
          <div className={styles.styleChipRow}>
            {styleChips.map((chip) => (
              <Link key={chip.href} href={chip.href} className={styles.styleChip}>
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="featured-works" className={`${styles.section} ${styles.featured}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Best sellers" title="Most-loved paintings this season" action={{ href: "/artworks", label: "View all" }} />
          <div className={styles.productCardGrid}>
            {bestSellers.length > 0
              ? bestSellers.map((artwork) => <ProductCard key={artwork._id} item={toCard(artwork)} />)
              : <EmptyArtworkState />}
          </div>
          {bestSellers.length > 0 && <p className={styles.priceDisclosure}><PriceDisclosure /></p>}
        </div>
      </section>

      <section className={`${styles.section} ${styles.rooms}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="Shop by room" title="Art for every wall" />
          <div className={styles.roomCircleRow}>
            {roomPaths.map((room, index) => (
              <Link key={room.href} href={room.href} className={styles.roomCircle}>
                <span className={styles.roomCircleMedia}>
                  {resolveVisualImage(roomImages.slice(index)) ? (
                    <Image
                      src={resolveVisualImage(roomImages.slice(index)) || ""}
                      alt={`${room.title} wall art inspiration`}
                      fill
                      sizes="120px"
                    />
                  ) : null}
                </span>
                <span>{room.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.featured}`}>
        <div className={styles.shell}>
          <SectionHeading eyebrow="New arrivals" title="Fresh canvases for the season." action={{ href: "/artworks", label: "Shop new" }} />
          <div className={styles.productCardGrid}>
            {newArrivals.map((artwork) => (
              <ProductCard key={`new-${artwork._id}`} item={toCard(artwork)} />
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
            <div className={styles.productCardGridCompact}>
              {artistCollection.map((artwork) => (
                <ProductCard key={artwork._id} item={toCard(artwork)} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className={`${styles.section} ${styles.realHomes}`}>
        <div className={styles.shell}>
          <SectionHeading
            eyebrow="YiiArt in real homes"
            title="Get inspired by art in real spaces."
            action={{ href: "/art-in-real-homes", label: "Shop the look" }}
          />
          <div className={styles.realHomesGrid}>
            {roomImages.slice(0, 4).map((src, index) => (
              <Link key={`${src}-${index}`} href="/art-in-real-homes" className={styles.realHomeCard}>
                <Image src={src || ""} alt="Artwork styled in a real home" fill sizes="25vw" />
                <span>Shop the look</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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
          <div className={styles.trustGridFour}>
            {trust.map(([number, title, copy]) => <div key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></div>)}
          </div>
          <div className={styles.advisoryHome}>
            <div>
              <h3>Complimentary art advisory</h3>
              <p>Share a room photo and wall size. We help confirm scale, finish, and colour before production.</p>
            </div>
            <Link href="/contact" className={styles.textLink}>Work with a curator</Link>
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

function EmptyArtworkState() {
  return <div className={styles.emptyState}>Explore the current collection or contact the studio for a custom canvas.</div>
}
