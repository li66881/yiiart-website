import styles from "./storefront.module.css"

type Props = {
  images: string[]
  alt: string
}

export default function ProductGallery({ images, alt }: Props) {
  const image = images[0]

  if (!image) {
    return <div className={styles.galleryEmpty}>Artwork image is not available for this listing.</div>
  }

  return (
    <figure className={styles.gallery}>
      <div className={styles.galleryStage}>
        <img src={image} alt={alt} />
      </div>
      {images.length > 1 && (
        <div className={styles.thumbnailGrid} aria-label="Additional artwork views">
          {images.slice(1, 9).map((src, index) => (
            <div className={styles.thumbnail} key={src}>
              <img src={src} alt={`${alt}, detail view ${index + 2}`} />
            </div>
          ))}
        </div>
      )}
      <figcaption>Artwork view. Each made-to-order painting is created by hand.</figcaption>
    </figure>
  )
}
