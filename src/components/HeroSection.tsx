"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { shouldAutoplayCarousel } from "@/lib/storefront/visual-content"

export type HeroSlide = {
  imageUrl: string
  imageAlt: string
  eyebrow: string
  title: string
  ctaHref: string
  ctaLabel: string
  shopHref?: string
  videoUrl?: string
  videoPosterUrl?: string
}

type HeroSectionProps = {
  slides?: HeroSlide[]
  imageUrl?: string
  imageAlt?: string
}

export default function HeroSection({
  slides = [],
  imageUrl,
  imageAlt = "YiiArt hand-painted artwork in a modern interior",
}: HeroSectionProps) {
  const resolvedSlides = slides.length > 0
    ? slides
    : imageUrl
      ? [{
          imageUrl,
          imageAlt,
          eyebrow: "New collection",
          title: "Art for the room you live in.",
          ctaHref: "/artworks",
          ctaLabel: "Shop all art",
        }]
      : []
  const [activeIndex, setActiveIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const slideCount = resolvedSlides.length
  const activeSlide = resolvedSlides[activeIndex] || resolvedSlides[0]
  const autoplay = shouldAutoplayCarousel({ slideCount, userPaused, hoverPaused, prefersReducedMotion })

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const updatePreference = () => setPrefersReducedMotion(motionPreference.matches)
    updatePreference()
    motionPreference.addEventListener("change", updatePreference)
    return () => motionPreference.removeEventListener("change", updatePreference)
  }, [])

  useEffect(() => {
    if (!autoplay) return
    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount)
    }, 5600)
    return () => window.clearInterval(intervalId)
  }, [autoplay, slideCount])

  useEffect(() => {
    if (activeIndex >= slideCount && slideCount > 0) setActiveIndex(0)
  }, [activeIndex, slideCount])

  if (!activeSlide) {
    return null
  }

  return (
    <section
      className="relative mt-[var(--yiiart-header-offset)] overflow-hidden bg-white"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured YiiArt collections"
    >
      <div className="relative min-h-[min(72svh,760px)] w-full overflow-hidden bg-[#eceae4]">
        {resolvedSlides.map((slide, index) => (
          <div
            key={`${slide.imageUrl}-${index}`}
            className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"}`}
            aria-hidden={index !== activeIndex}
          >
            {slide.videoUrl ? (
              <video
                className="absolute inset-0 h-full w-full object-cover object-center"
                autoPlay
                muted
                loop
                playsInline
                poster={slide.videoPosterUrl || slide.imageUrl}
                src={slide.videoUrl}
              />
            ) : (
              <Image
                src={slide.imageUrl}
                alt={slide.imageAlt}
                fill
                priority={index === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            )}
          </div>
        ))}

        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-6 px-5 pb-10 sm:px-10 lg:px-16">
          <div className="max-w-xl text-white">
            <p className="text-[12px] font-medium tracking-[0.08em] uppercase text-white/80">
              {activeSlide.eyebrow}
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-[2.25rem] font-light leading-none tracking-[-0.03em] sm:text-[3.25rem]">
              {activeSlide.title}
            </h1>
            <div className="mt-6">
              <Link href={activeSlide.ctaHref} className="yii-btn-primary">
                {activeSlide.ctaLabel}
              </Link>
            </div>
          </div>

          {activeSlide.shopHref ? (
            <Link
              href={activeSlide.shopHref}
              className="mb-2 hidden h-12 w-12 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[11px] font-medium text-[#171717] sm:inline-flex"
              aria-label="Shop this look"
            >
              Shop
            </Link>
          ) : null}
        </div>

        {slideCount > 1 ? (
          <>
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {resolvedSlides.map((slide, index) => (
                <button
                  key={`${slide.imageUrl}-dot`}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === activeIndex}
                  className={`h-2 w-2 rounded-full border border-white/75 transition ${index === activeIndex ? "bg-white" : "bg-white/30 hover:bg-white/60"}`}
                  onClick={() => setActiveIndex(index)}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label={userPaused ? "Start carousel" : "Pause carousel"}
              title={prefersReducedMotion ? "Autoplay is disabled by your motion preference" : undefined}
              disabled={prefersReducedMotion}
              className="absolute bottom-4 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/55 bg-black/25 text-sm text-white transition hover:bg-black/45 disabled:cursor-default disabled:opacity-55"
              onClick={() => setUserPaused((current) => !current)}
            >
              <span aria-hidden="true">{userPaused ? "\u25b6" : "\u2016"}</span>
            </button>
            <button
              type="button"
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-2xl text-white transition hover:bg-black/45 md:flex"
              onClick={() => setActiveIndex((current) => (current - 1 + slideCount) % slideCount)}
            >
              <span aria-hidden="true">&#8249;</span>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              className="absolute right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-2xl text-white transition hover:bg-black/45 md:flex"
              onClick={() => setActiveIndex((current) => (current + 1) % slideCount)}
            >
              <span aria-hidden="true">&#8250;</span>
            </button>
          </>
        ) : null}
      </div>
    </section>
  )
}
