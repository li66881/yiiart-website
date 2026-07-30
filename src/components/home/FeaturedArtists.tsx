import Image from "next/image"
import Link from "next/link"
import styles from "./editorial-home.module.css"

export type FeaturedArtistCard = {
  id: string
  name: string
  href: string
  location?: string | null
  imageUrl?: string | null
  role?: string
}

type Props = {
  artists: FeaturedArtistCard[]
}

export default function FeaturedArtists({ artists }: Props) {
  if (!artists.length) return null

  return (
    <section className={`${styles.section} ${styles.featuredArtists}`}>
      <div className={styles.shell}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>Featured artists</p>
            <h2>Studio painters worth watching</h2>
          </div>
          <Link href="/artists" className={styles.textLink}>
            View all
          </Link>
        </div>
        <div className={styles.featuredArtistGrid}>
          {artists.map((artist) => (
            <Link key={artist.id} href={artist.href} className={styles.featuredArtistCard}>
              <span className={styles.featuredArtistMedia}>
                {artist.imageUrl ? (
                  <Image
                    src={artist.imageUrl}
                    alt={artist.name}
                    fill
                    sizes="(min-width: 1024px) 30vw, 80vw"
                  />
                ) : (
                  <span className={styles.featuredArtistFallback}>{artist.name.slice(0, 1)}</span>
                )}
              </span>
              <span className={styles.featuredArtistCopy}>
                <strong>{artist.name}</strong>
                <span>{artist.role || "Painter"}</span>
                {artist.location ? <em>{artist.location}</em> : null}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
