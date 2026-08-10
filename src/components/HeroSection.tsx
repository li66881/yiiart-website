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
  subtitle: string
  ctaHref: string
  ctaLabel: string
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
          eyebrow: "Hand-painted to order",
          title: "Art made for the room you live in.",
          subtitle: "Choose the scale, palette, and finish that feel right for your wall.",
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
    return (
      <section className="relative mt-[var(--yiiart-header-offset)] min-h-[68svh] overflow-hidden bg-[#d8d0c2]">
        <div className="absolute inset-x-[12%] top-[16%] h-[54%] border border-black/10 bg-[#b9aea0]" />
        <div className="absolute bottom-0 left-0 right-0 h-[28%] bg-[#93877a]" />
      </section>
    )
  }

  return (
    <section
      className="relative mt-[var(--yiiart-header-offset)] min-h-[min(78svh,820px)] overflow-hidden bg-[#25231f] text-white"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured YiiArt collections"
    >
      {resolvedSlides.map((slide, index) => (
        <div
          key={`${slide.imageUrl}-${index}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-out motion-reduce:transition-none ${index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"}`}
          aria-hidden={index !== activeIndex}
        >
          <Image
            src={slide.imageUrl}
            alt={slide.imageAlt}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/32 to-black/5" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[min(78svh,820px)] max-w-[1440px] items-end px-5 pb-12 pt-24 sm:px-8 sm:pb-16 lg:px-12">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#e8cbb9]">
            {activeSlide.eyebrow}
          </p>
          <h1 className="max-w-[12ch] text-5xl font-light leading-[0.98] sm:text-6xl lg:text-7xl">
            {activeSlide.title}
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/84 sm:text-lg">
            {activeSlide.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={activeSlide.ctaHref}
              className="inline-flex min-h-12 items-center bg-white px-7 text-xs font-semibold uppercase tracking-[0.1em] text-[#1d1c18] transition hover:bg-[#efe8dc]"
            >
              {activeSlide.ctaLabel}
            </Link>
            <Link
              href="/custom-painting"
              className="inline-flex min-h-12 items-center border border-white/60 px-7 text-xs font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-white/12"
            >
              Request custom painting
            </Link>
          </div>
        </div>
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
                className={`h-2.5 w-2.5 rounded-full border border-white/75 transition ${index === activeIndex ? "bg-white" : "bg-transparent hover:bg-white/45"}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label={userPaused ? "Start carousel" : "Pause carousel"}
            title={prefersReducedMotion ? "Autoplay is disabled by your motion preference" : undefined}
            disabled={prefersReducedMotion}
            className="absolute bottom-3 right-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/55 bg-black/25 text-sm text-white backdrop-blur-sm transition hover:bg-black/45 disabled:cursor-default disabled:opacity-55"
            onClick={() => setUserPaused((current) => !current)}
          >
            <span aria-hidden="true">{userPaused ? "\u25b6" : "\u2016"}</span>
          </button>
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/20 text-2xl text-white backdrop-blur-sm transition hover:bg-black/40 md:flex"
            onClick={() => setActiveIndex((current) => (current - 1 + slideCount) % slideCount)}
          >
            <span aria-hidden="true">&#8249;</span>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-4 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/45 bg-black/20 text-2xl text-white backdrop-blur-sm transition hover:bg-black/40 md:flex"
            onClick={() => setActiveIndex((current) => (current + 1) % slideCount)}
          >
            <span aria-hidden="true">&#8250;</span>
          </button>
        </>
      ) : null}
    </section>
  )
}
