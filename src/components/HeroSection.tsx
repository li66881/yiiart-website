"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export type HeroSlide = {
  imageUrl: string
  imageAlt: string
  eyebrow?: string
  title?: string
  subtitle?: string
  ctaHref?: string
  ctaLabel?: string
  promo?: boolean
}

type HeroSectionProps = {
  slides: HeroSlide[]
  /** @deprecated prefer slides */
  imageUrl?: string
  imageAlt?: string
}

export default function HeroSection({
  slides,
  imageUrl,
  imageAlt = "Original YiiArt artwork in a home interior",
}: HeroSectionProps) {
  const resolved =
    slides.length > 0
      ? slides
      : imageUrl
        ? [
            {
              imageUrl,
              imageAlt,
              eyebrow: "New Arrivals",
              title: "Hand-painted canvas for modern homes.",
              subtitle: "Browse best sellers and new arrivals, then choose size and finish for your wall.",
              ctaHref: "/artworks",
              ctaLabel: "Shop All Art",
              promo: true,
            },
          ]
        : []

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = resolved.length
  const active = resolved[index] || resolved[0]

  useEffect(() => {
    if (count < 2 || paused) return
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % count)
    }, 5600)
    return () => window.clearInterval(id)
  }, [count, paused])

  if (!active) {
    return (
      <section className="relative mt-[var(--ya-header-offset-lg)] min-h-[68svh] bg-stone-200" />
    )
  }

  return (
    <section
      className="relative mt-[var(--ya-header-offset-lg)] overflow-hidden bg-[#f3efe8]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative mx-auto min-h-[min(72svh,760px)] w-full max-w-[1600px] px-3 sm:px-5 lg:px-8">
        <div className="relative min-h-[min(68svh,720px)] overflow-hidden rounded-[18px] bg-[#ece7de]">
          {resolved.map((slide, slideIndex) => (
            <div
              key={`${slide.imageUrl}-${slideIndex}`}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                slideIndex === index ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={slideIndex !== index}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.imageAlt}
                fill
                priority={slideIndex === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
            </div>
          ))}

          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/5" />

          {active.promo !== false ? (
            <div className="absolute inset-y-0 right-0 z-10 flex w-full max-w-md items-stretch sm:max-w-lg md:w-[40%]">
              <div className="m-4 flex flex-1 flex-col justify-center bg-[#f7f2ea]/94 px-6 py-8 backdrop-blur-md sm:m-6 sm:px-8 md:my-8 md:mr-8">
                <p className="font-[Georgia,serif] text-[1.35rem] italic tracking-wide text-[#8a6a45]">
                  {active.eyebrow || "Summer Sale"}
                </p>
                <h1 className="mt-2 max-w-[11ch] text-[2.4rem] font-semibold leading-[1.05] tracking-[-0.03em] text-[#1d1c18] sm:text-[2.8rem]">
                  {active.title || "Deals still going"}
                </h1>
                <p className="mt-3 text-[2.6rem] font-bold tracking-tight text-[#2f5d46] sm:text-[3rem]">
                  40% off
                </p>
                {active.subtitle ? (
                  <p className="mt-3 max-w-sm text-sm leading-6 text-stone-600">{active.subtitle}</p>
                ) : null}
                <div className="mt-7">
                  <Link
                    href={active.ctaHref || "/artworks"}
                    className="inline-flex min-h-11 items-center rounded-full bg-[#efe8dc] px-7 text-xs font-semibold uppercase tracking-[0.12em] text-[#1d1c18] transition hover:bg-[#e5dccb]"
                  >
                    {active.ctaLabel || "Shop All Art"}
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 z-10 flex items-end">
              <div className="mx-auto w-full max-w-[1440px] px-4 pb-10 sm:px-6 lg:px-10">
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-[#e0bda8]">
                  {active.eyebrow || "New Arrivals"}
                </p>
                <h1 className="max-w-[14ch] text-4xl font-light leading-[.98] tracking-[-0.05em] text-white sm:text-5xl">
                  {active.title}
                </h1>
                {active.subtitle ? (
                  <p className="mt-4 max-w-md text-base text-white/85">{active.subtitle}</p>
                ) : null}
                <Link
                  href={active.ctaHref || "/artworks"}
                  className="mt-6 inline-flex min-h-12 items-center rounded-full bg-white px-7 text-xs font-medium uppercase tracking-[0.1em] text-black"
                >
                  {active.ctaLabel || "Shop All Art"}
                </Link>
              </div>
            </div>
          )}

          {count > 1 ? (
            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
              {resolved.map((_, slideIndex) => (
                <button
                  key={slideIndex}
                  type="button"
                  aria-label={`Show slide ${slideIndex + 1}`}
                  aria-current={slideIndex === index}
                  className={`h-2 w-2 rounded-full border border-white/70 transition ${
                    slideIndex === index ? "bg-white" : "bg-white/30 hover:bg-white/60"
                  }`}
                  onClick={() => setIndex(slideIndex)}
                />
              ))}
            </div>
          ) : null}

          {count > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous slide"
                className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 md:flex"
                onClick={() => setIndex((current) => (current - 1 + count) % count)}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Next slide"
                className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45 md:flex"
                onClick={() => setIndex((current) => (current + 1) % count)}
              >
                ›
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
