"use client"

import Image from "next/image"
import { useState } from "react"
import { productMediaRoleLabels, type ProductMediaItem } from "@/lib/artwork-media"
import styles from "./storefront.module.css"

type Props = {
  media: ProductMediaItem[]
  alt: string
}

export default function ProductGallery({ media, alt }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedMedia = media[selectedIndex] || media[0]

  if (!selectedMedia) {
    return <div className={styles.galleryEmpty}>Artwork image is not available for this listing.</div>
  }

  return (
    <figure className={styles.gallery}>
      <div className={styles.galleryStage}>
        {selectedMedia.type === "video" ? (
          <video
            key={selectedMedia.url}
            className={styles.galleryVideo}
            controls
            playsInline
            preload="metadata"
            poster={selectedMedia.posterUrl}
            aria-label={selectedMedia.alt || `${alt} studio video`}
          >
            <source src={selectedMedia.url} />
            Your browser does not support product video playback.
          </video>
        ) : (
          <Image
            src={selectedMedia.url}
            alt={selectedMedia.alt || alt}
            fill
            priority={selectedIndex === 0}
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        )}
      </div>
      {media.length > 1 && (
        <div className={styles.thumbnailGrid} aria-label="Additional artwork views">
          {media.slice(0, 10).map((item, index) => (
            <button
              type="button"
              className={styles.thumbnail}
              key={item.id}
              aria-label={`Show ${productMediaRoleLabels[item.role].toLowerCase()}`}
              aria-pressed={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
            >
              {item.type === "video" ? (
                item.posterUrl ? (
                  <>
                    <Image src={item.posterUrl} alt="" fill sizes="120px" />
                    <span className={styles.videoBadge}>Video</span>
                  </>
                ) : (
                  <span className={styles.videoThumbnail}>Play video</span>
                )
              ) : (
                <Image src={item.url} alt="" fill sizes="120px" />
              )}
            </button>
          ))}
        </div>
      )}
      <figcaption>{productMediaRoleLabels[selectedMedia.role]}</figcaption>
    </figure>
  )
}
