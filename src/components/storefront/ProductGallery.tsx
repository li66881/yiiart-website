"use client"

import Image from "next/image"
import { useState } from "react"
import styles from "./storefront.module.css"

type Props = {
  images: string[]
  alt: string
}

export default function ProductGallery({ images, alt }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)
  const image = images[selectedImage] || images[0]

  if (!image) {
    return <div className={styles.galleryEmpty}>Artwork image is not available for this listing.</div>
  }

  return (
    <figure className={styles.gallery}>
      <div className={styles.galleryStage}>
        <Image src={image} alt={alt} fill priority sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
      {images.length > 1 && (
        <div className={styles.thumbnailGrid} aria-label="Additional artwork views">
          {images.slice(0, 8).map((src, index) => (
            <button
              type="button"
              className={styles.thumbnail}
              key={src}
              aria-label={`Show artwork view ${index + 1}`}
              aria-pressed={selectedImage === index}
              onClick={() => setSelectedImage(index)}
            >
              <Image src={src} alt={`${alt}, detail view ${index + 2}`} fill sizes="120px" />
            </button>
          ))}
        </div>
      )}
      <figcaption>Artwork view. Each made-to-order painting is created by hand.</figcaption>
    </figure>
  )
}
