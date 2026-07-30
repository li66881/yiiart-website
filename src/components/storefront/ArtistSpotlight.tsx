"use client"

import Image from "next/image"
import Link from "next/link"
import ProductCard, { type ProductCardItem } from "@/components/storefront/ProductCard"
import styles from "./storefront.module.css"

type Props = {
  name: string
  slug?: string | null
  bio?: string | null
  location?: string | null
  imageUrl?: string | null
  artworks: ProductCardItem[]
}

export default function ArtistSpotlight({
  name,
  slug,
  bio,
  location,
  imageUrl,
  artworks,
}: Props) {
  if (!name) return null
  const profileHref = slug ? `/artist/${slug}` : "/artists"

  return (
    <section className={styles.artistSpotlight}>
      <div className={styles.artistSpotlightHeader}>
        <div className={styles.artistSpotlightIdentity}>
          <div className={styles.artistAvatar}>
            {imageUrl ? (
              <Image src={imageUrl} alt={name} fill sizes="96px" className={styles.artistAvatarImage} />
            ) : (
              <span>{name.slice(0, 1)}</span>
            )}
          </div>
          <div>
            <p className={styles.artistEyebrow}>About the artist</p>
            <h2 className={styles.artistName}>{name}</h2>
            {location ? <p className={styles.artistLocation}>{location}</p> : null}
          </div>
        </div>
        <Link href={profileHref} className={styles.productRailLink}>
          View artist
        </Link>
      </div>

      {bio ? <p className={styles.artistBio}>{bio}</p> : null}

      {artworks.length > 0 ? (
        <>
          <h3 className={styles.artistWorksTitle}>Artist&apos;s popular works</h3>
          <div className={styles.productRailTrack}>
            {artworks.map((item) => (
              <div key={item.id} className={styles.productRailItem}>
                <ProductCard item={item} />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
