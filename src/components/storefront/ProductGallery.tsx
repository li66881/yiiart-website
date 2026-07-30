"use client"

import Image from "next/image"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { productMediaRoleLabels } from "@/lib/artwork-media"
import { buildGallerySlides, type GallerySlide } from "@/lib/storefront/gallery-slides"
import type { ProductMediaItem } from "@/lib/artwork-media"
import styles from "./storefront.module.css"

type Props = {
  media: ProductMediaItem[]
  alt: string
}

const SCENE_SRC = {
  living: "/scenes/living-room.png",
  bedroom: "/scenes/bedroom.png",
} as const

const ZOOM_MIN = 1
const ZOOM_MAX = 4
const ZOOM_STEP = 0.18

function SlideVisual({
  slide,
  alt,
  priority,
  sizes,
  fill = true,
  className,
}: {
  slide: GallerySlide
  alt: string
  priority?: boolean
  sizes?: string
  fill?: boolean
  className?: string
}) {
  const artworkSrc = slide.sourceUrl || slide.url
  const label = slide.alt || alt

  if (slide.type === "video") {
    return (
      <video
        className={styles.galleryVideo}
        controls
        playsInline
        preload="metadata"
        poster={slide.posterUrl}
        aria-label={label}
      >
        <source src={slide.url} />
        Your browser does not support product video playback.
      </video>
    )
  }

  if (slide.viewMode === "white_bg") {
    return (
      <div className={styles.whiteBgStage}>
        <div className={styles.whiteBgFrame}>
          <Image
            src={artworkSrc}
            alt={label}
            fill
            priority={priority}
            sizes={sizes || "(min-width: 1024px) 42vw, 100vw"}
            className={styles.whiteBgImage}
          />
        </div>
      </div>
    )
  }

  if (slide.viewMode === "room") {
    const scene: keyof typeof SCENE_SRC = slide.scene === "bedroom" ? "bedroom" : "living"
    return (
      <div className={styles.roomStage}>
        <Image
          src={SCENE_SRC[scene]}
          alt=""
          fill
          priority={priority}
          sizes={sizes || "(min-width: 1024px) 42vw, 100vw"}
          className={styles.roomPlate}
        />
        <div className={styles.roomArtworkWrap} data-scene={scene}>
          <Image
            src={artworkSrc}
            alt={label}
            fill
            sizes="(min-width: 1024px) 18vw, 40vw"
            className={styles.roomArtwork}
          />
        </div>
      </div>
    )
  }

  if (slide.viewMode === "detail") {
    return (
      <div className={styles.detailStage}>
        <Image
          src={artworkSrc}
          alt={label}
          fill
          priority={priority}
          sizes={sizes || "(min-width: 1024px) 42vw, 100vw"}
          className={styles.detailImage}
        />
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={slide.url}
        alt={label}
        fill
        priority={priority}
        sizes={sizes || "(min-width: 1024px) 42vw, 100vw"}
        className={className}
      />
    )
  }

  return (
    <Image
      src={slide.url}
      alt={label}
      width={1600}
      height={1600}
      className={className}
    />
  )
}

function ThumbVisual({ slide }: { slide: GallerySlide }) {
  const artworkSrc = slide.sourceUrl || slide.url
  if (slide.type === "video") {
    return slide.posterUrl ? (
      <>
        <Image src={slide.posterUrl} alt="" fill sizes="88px" />
        <span className={styles.videoBadge}>Video</span>
      </>
    ) : (
      <span className={styles.videoThumbnail}>Play</span>
    )
  }
  if (slide.viewMode === "room") {
    const scene: keyof typeof SCENE_SRC = slide.scene === "bedroom" ? "bedroom" : "living"
    return (
      <div className={styles.thumbRoom}>
        <Image src={SCENE_SRC[scene]} alt="" fill sizes="88px" className={styles.thumbRoomPlate} />
        <span className={styles.thumbRoomArt}>
          <Image src={artworkSrc} alt="" fill sizes="40px" />
        </span>
      </div>
    )
  }
  if (slide.viewMode === "white_bg") {
    return (
      <div className={styles.thumbWhite}>
        <Image src={artworkSrc} alt="" fill sizes="88px" className={styles.thumbWhiteImage} />
      </div>
    )
  }
  if (slide.viewMode === "detail") {
    return <Image src={artworkSrc} alt="" fill sizes="88px" className={styles.thumbDetail} />
  }
  return <Image src={slide.url} alt="" fill sizes="88px" />
}

function LightboxViewer({
  slide,
  alt,
  onClose,
  onPrev,
  onNext,
  index,
  total,
}: {
  slide: GallerySlide
  alt: string
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  index: number
  total: number
}) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const zoomRef = useRef(1)
  const offsetRef = useRef({ x: 0, y: 0 })
  const dragRef = useRef<{ pointerId: number; x: number; y: number; ox: number; oy: number } | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const src = slide.sourceUrl || slide.url
  const label = slide.alt || alt

  const applyZoom = useCallback((next: number) => {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next))
    zoomRef.current = clamped
    setZoom(clamped)
    if (clamped <= ZOOM_MIN) {
      offsetRef.current = { x: 0, y: 0 }
      setOffset({ x: 0, y: 0 })
    }
  }, [])

  const applyOffset = useCallback((next: { x: number; y: number }) => {
    offsetRef.current = next
    setOffset(next)
  }, [])

  useEffect(() => {
    zoomRef.current = 1
    offsetRef.current = { x: 0, y: 0 }
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setDragging(false)
    dragRef.current = null
  }, [slide.id])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowLeft") onPrev()
      if (event.key === "ArrowRight") onNext()
      if (event.key === "+" || event.key === "=") applyZoom(zoomRef.current + ZOOM_STEP)
      if (event.key === "-" || event.key === "_") applyZoom(zoomRef.current - ZOOM_STEP)
      if (event.key === "0") applyZoom(1)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKey)
    }
  }, [applyZoom, onClose, onNext, onPrev])

  useEffect(() => {
    const node = viewportRef.current
    if (!node) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const direction = event.deltaY < 0 ? 1 : -1
      applyZoom(zoomRef.current + direction * ZOOM_STEP)
    }
    node.addEventListener("wheel", onWheel, { passive: false })
    return () => node.removeEventListener("wheel", onWheel)
  }, [applyZoom])

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      event.preventDefault()
      applyOffset({
        x: drag.ox + (event.clientX - drag.x),
        y: drag.oy + (event.clientY - drag.y),
      })
    }

    const endDrag = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return
      dragRef.current = null
      setDragging(false)
    }

    window.addEventListener("pointermove", onPointerMove, { passive: false })
    window.addEventListener("pointerup", endDrag)
    window.addEventListener("pointercancel", endDrag)
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", endDrag)
      window.removeEventListener("pointercancel", endDrag)
    }
  }, [applyOffset])

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (zoomRef.current <= ZOOM_MIN) return
    event.preventDefault()
    event.stopPropagation()
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      ox: offsetRef.current.x,
      oy: offsetRef.current.y,
    }
    setDragging(true)
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Window listeners still handle pan if capture is rejected.
    }
  }

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="Artwork lightbox">
      <button type="button" className={styles.lightboxClose} aria-label="Close" onClick={onClose}>
        ×
      </button>
      <div className={styles.lightboxInner}>
        <div
          ref={viewportRef}
          className={styles.lightboxViewport}
          onPointerDown={onPointerDown}
          onDoubleClick={(event) => {
            event.preventDefault()
            if (zoomRef.current > ZOOM_MIN) applyZoom(1)
            else applyZoom(2)
          }}
        >
          <div
            className={styles.lightboxZoomLayer}
            data-dragging={dragging ? "true" : "false"}
            style={{
              transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${zoom})`,
              cursor: zoom > ZOOM_MIN ? (dragging ? "grabbing" : "grab") : "zoom-in",
            }}
          >
            {slide.viewMode === "room" ? (
              <div className={styles.lightboxRoomFrame} data-scene={slide.scene || "living"}>
                <Image
                  src={SCENE_SRC[slide.scene === "bedroom" ? "bedroom" : "living"]}
                  alt=""
                  fill
                  sizes="90vw"
                  draggable={false}
                  className={styles.lightboxRoomPlate}
                  onDragStart={(event) => event.preventDefault()}
                />
                <span className={styles.lightboxRoomArt}>
                  <Image
                    src={src}
                    alt={label}
                    fill
                    sizes="40vw"
                    draggable={false}
                    className={styles.lightboxContainImage}
                    onDragStart={(event) => event.preventDefault()}
                  />
                </span>
              </div>
            ) : (
              <div className={styles.lightboxImageFrame}>
                <Image
                  src={src}
                  alt={label}
                  fill
                  sizes="90vw"
                  draggable={false}
                  className={styles.lightboxContainImage}
                  priority
                  onDragStart={(event) => event.preventDefault()}
                />
              </div>
            )}
          </div>
        </div>
        <p className={styles.lightboxHint}>Scroll to zoom · Drag to pan · Esc to close</p>
        {total > 1 && (
          <div className={styles.lightboxControls}>
            <button type="button" onClick={onPrev} aria-label="Previous image">
              ‹
            </button>
            <span>
              {index + 1} / {total}
            </span>
            <button type="button" onClick={onNext} aria-label="Next image">
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductGallery({ media, alt }: Props) {
  const slides = useMemo(() => buildGallerySlides(media, alt), [alt, media])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [fadeKey, setFadeKey] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const selectedMedia = slides[selectedIndex] || slides[0]

  const goTo = useCallback(
    (index: number) => {
      if (!slides.length) return
      const next = (index + slides.length) % slides.length
      setSelectedIndex(next)
      setFadeKey((value) => value + 1)
    },
    [slides.length],
  )

  const goPrev = useCallback(() => goTo(selectedIndex - 1), [goTo, selectedIndex])
  const goNext = useCallback(() => goTo(selectedIndex + 1), [goTo, selectedIndex])

  useEffect(() => {
    setSelectedIndex(0)
  }, [media])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false)
      if (event.key === "ArrowLeft") goPrev()
      if (event.key === "ArrowRight") goNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [goNext, goPrev, lightboxOpen])

  if (!selectedMedia) {
    return <div className={styles.galleryEmpty}>Artwork image is not available for this listing.</div>
  }

  const onTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const delta = (event.changedTouches[0]?.clientX ?? 0) - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 40) return
    if (delta > 0) goPrev()
    else goNext()
  }

  const thumbs = (
    <div className={styles.thumbnailRail} aria-label="Additional artwork views">
      {slides.slice(0, 12).map((item, index) => (
        <button
          type="button"
          className={styles.thumbnail}
          key={item.id}
          aria-label={`Show ${(productMediaRoleLabels[item.role as keyof typeof productMediaRoleLabels] || "image").toLowerCase()}`}
          aria-current={selectedIndex === index}
          onClick={() => goTo(index)}
        >
          <ThumbVisual slide={item} />
        </button>
      ))}
    </div>
  )

  return (
    <>
      <figure className={styles.gallery}>
        <div
          className={`${styles.galleryLayout} ${slides.length > 1 ? styles.galleryLayoutWithThumbs : ""}`}
        >
          {slides.length > 1 ? <div className={styles.thumbnailRailDesktop}>{thumbs}</div> : null}

          <div
            className={styles.galleryStage}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div key={fadeKey} className={styles.galleryFade}>
              {selectedMedia.type === "video" ? (
                <SlideVisual slide={selectedMedia} alt={alt} priority={selectedIndex === 0} />
              ) : (
                <button
                  type="button"
                  className={styles.galleryMainButton}
                  onClick={() => setLightboxOpen(true)}
                  aria-label="Open larger image"
                >
                  <SlideVisual
                    slide={selectedMedia}
                    alt={alt}
                    priority={selectedIndex === 0}
                    sizes="(min-width: 1024px) 42vw, 100vw"
                  />
                </button>
              )}
            </div>

            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  className={`${styles.galleryNav} ${styles.galleryNavPrev}`}
                  onClick={goPrev}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.galleryNav} ${styles.galleryNavNext}`}
                  onClick={goNext}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <button
              type="button"
              className={styles.expandCue}
              onClick={() => setLightboxOpen(true)}
              aria-label="Expand image"
            >
              ⤢
            </button>

            <button
              type="button"
              className={styles.galleryRoomCue}
              onClick={() => {
                const roomIndex = slides.findIndex(
                  (item) => item.role === "living_room" || item.role === "bedroom" || item.viewMode === "room",
                )
                if (roomIndex >= 0) goTo(roomIndex)
                else setLightboxOpen(true)
              }}
            >
              View VR Effect
            </button>
          </div>
        </div>

        {slides.length > 1 ? <div className={styles.thumbnailRailMobile}>{thumbs}</div> : null}
      </figure>

      {lightboxOpen && selectedMedia.type !== "video" ? (
        <LightboxViewer
          slide={selectedMedia}
          alt={alt}
          index={selectedIndex}
          total={slides.length}
          onClose={() => setLightboxOpen(false)}
          onPrev={goPrev}
          onNext={goNext}
        />
      ) : null}
    </>
  )
}
