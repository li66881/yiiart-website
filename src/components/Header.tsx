"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useLanguage } from "@/context/LanguageContext"
import { useWishlist } from "@/context/WishlistContext"
import { useCart } from "@/context/CartContext"
import StorefrontControls from "@/components/StorefrontControls"
import SearchDialog from "@/components/SearchDialog"
import AnnouncementBar from "@/components/AnnouncementBar"
import { siteAssetUrl } from "@/lib/assets"
import { getStudioSaleEndsAt } from "@/lib/storefront/sale"

const primaryNav: Array<{ href: string; label: string; accent?: boolean }> = [
  { href: "/artworks?sort=featured", label: "Best Sellers" },
  { href: "/artworks?sort=newest", label: "New In" },
  { href: "/custom-painting", label: "Custom Art" },
  { href: "/contact?topic=trade", label: "Trade Program" },
  { href: "/custom-painting?intent=gift", label: "Gift" },
  { href: "/reviews", label: "Reviews" },
  { href: "/artists", label: "Artist" },
  { href: "/about", label: "Our Story" },
]

const styleNav: Array<{ href: string; label: string; accent?: boolean }> = [
  { href: "/artworks", label: "All Art" },
  { href: "/artworks?category=Texture", label: "Plaster & Texture" },
  { href: "/artworks?category=Minimalist", label: "Minimalist" },
  { href: "/artworks?category=Abstract", label: "Abstract" },
  { href: "/collections/large-canvas-art", label: "Large Canvas" },
  { href: "/collections/bedroom-wall-art", label: "Bedroom" },
  { href: "/collections/abstract-art-for-living-room", label: "Living Room" },
  { href: "/artworks?category=Landscape", label: "Landscape" },
  { href: "/artworks?promo=sale", label: "Sale", accent: true },
]

const trustMessages = [
  "Free Shipping & 30 Days Return",
  "Shop now, pay later at checkout",
  "Hand-painted to order for your wall",
  "Secure checkout with major cards",
]

const socialLinks = [
  { label: "Facebook", href: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com", icon: "facebook" },
  { label: "Instagram", href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://www.instagram.com", icon: "instagram" },
  { label: "YouTube", href: process.env.NEXT_PUBLIC_YOUTUBE_URL || "https://www.youtube.com", icon: "youtube" },
  { label: "Pinterest", href: process.env.NEXT_PUBLIC_PINTEREST_URL || "https://www.pinterest.com", icon: "pinterest" },
]

function SocialIcon({ name }: { name: string }) {
  if (name === "facebook") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h2.6l.4-3H14V9z" />
      </svg>
    )
  }
  if (name === "instagram") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
      </svg>
    )
  }
  if (name === "youtube") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M21.6 7.2a2.7 2.7 0 0 0-1.9-1.9C17.9 5 12 5 12 5s-5.9 0-7.7.3A2.7 2.7 0 0 0 2.4 7.2 28.2 28.2 0 0 0 2 12a28.2 28.2 0 0 0 .4 4.8 2.7 2.7 0 0 0 1.9 1.9C6.1 19 12 19 12 19s5.9 0 7.7-.3a2.7 2.7 0 0 0 1.9-1.9A28.2 28.2 0 0 0 22 12a28.2 28.2 0 0 0-.4-4.8zM10 15.2V8.8L15.5 12 10 15.2z" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 3.2c-2.2 0-3.7 1.1-4.4 2.1-.2.3 0 .6.3.7 1.1.4 1.5.8 1.7 1.4.1.5 0 1.1-.4 1.7-.7 1.1-1.8 2.6-1.8 4.5 0 2.8 2.2 5.2 5.6 5.2s5.6-2.4 5.6-5.5c0-2.1-.8-3.5-1.7-4.6-.7-.8-1.4-1.5-1.4-2.2 0-.7.5-1.2 1.1-1.8.3-.3.2-.8-.2-1C14.5 3.5 13.3 3.2 12 3.2z" />
    </svg>
  )
}

export default function Header() {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const { items: wishlistItems } = useWishlist()
  const { itemCount: cartItemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [trustIndex, setTrustIndex] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setTrustIndex((current) => (current + 1) % trustMessages.length)
    }, 4200)
    return () => window.clearInterval(id)
  }, [])

  const closeMobileMenu = () => setMobileMenuOpen(false)
  const openSearch = () => {
    closeMobileMenu()
    setSearchOpen(true)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-stone-200 bg-[#fbfaf7]/96 text-[#1d1c18] backdrop-blur-xl">
      <AnnouncementBar saleEndsAt={getStudioSaleEndsAt()} />

      <div className="hidden border-b border-stone-200/80 bg-white md:block">
        <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-1 sm:px-6 lg:px-10">
          <div className="flex items-center gap-2.5 text-stone-500">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className="inline-flex h-5 w-5 items-center justify-center hover:text-black"
              >
                <SocialIcon name={item.icon} />
              </a>
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-500">
            <button
              type="button"
              aria-label="Previous trust message"
              className="px-1 hover:text-black"
              onClick={() =>
                setTrustIndex((current) => (current - 1 + trustMessages.length) % trustMessages.length)
              }
            >
              ‹
            </button>
            <p className="min-w-[220px] text-center transition-opacity duration-300">{trustMessages[trustIndex]}</p>
            <button
              type="button"
              aria-label="Next trust message"
              className="px-1 hover:text-black"
              onClick={() => setTrustIndex((current) => (current + 1) % trustMessages.length)}
            >
              ›
            </button>
          </div>
          <div className="justify-self-end">
            <StorefrontControls />
          </div>
        </div>
      </div>

      <div className="mx-auto grid min-h-[48px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 flex-col items-center justify-center gap-1 lg:hidden"
            aria-label={mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="h-px w-5 bg-[#1d1c18]" />
            <span className="h-px w-5 bg-[#1d1c18]" />
            <span className="h-px w-5 bg-[#1d1c18]" />
          </button>
        </div>

        <Link href="/" className="justify-self-center" onClick={closeMobileMenu} aria-label="YiiArt home">
          <img src={siteAssetUrl("/brand/yiiart-logo.svg")} alt="YiiArt" className="h-6 w-auto sm:h-7" />
        </Link>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            type="button"
            onClick={openSearch}
            className="inline-flex h-9 w-9 items-center justify-center text-sm text-stone-700 hover:text-black"
            aria-label={t("common.search")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
              <path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>

          {status !== "loading" && session ? (
            <div
              className="relative hidden sm:block"
              onKeyDown={(event) => {
                if (event.key === "Escape") setAccountMenuOpen(false)
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setAccountMenuOpen(false)
                }
              }}
            >
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-label="Account menu"
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200 text-sm text-stone-700"
              >
                {session.user?.name?.[0] || session.user?.email?.[0] || "?"}
              </button>
              <div
                className={`absolute right-0 mt-3 w-56 border border-stone-200 bg-white shadow-xl ${accountMenuOpen ? "block" : "hidden"}`}
              >
                <div className="border-b border-stone-200 px-4 py-3 text-sm">
                  <p className="font-medium">{session.user?.name || "User"}</p>
                  <p className="mt-1 truncate text-xs text-stone-500">{session.user?.email}</p>
                </div>
                <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-stone-50" onClick={() => setAccountMenuOpen(false)}>
                  {t("common.orders")}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-stone-50"
                >
                  {t("auth.signOut")}
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-9 w-9 items-center justify-center text-stone-700 hover:text-black sm:inline-flex"
              aria-label={t("common.login")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5 19c1.6-3.2 4-4.8 7-4.8s5.4 1.6 7 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
          )}

          <Link
            href="/wishlist"
            className="relative inline-flex h-9 w-9 items-center justify-center text-stone-700 hover:text-black"
            aria-label={t("common.wishlist")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 20s-6.5-4.2-8.8-8C1.5 9 3 6 6.2 6c1.8 0 3.1 1 3.8 2 0.7-1 2-2 3.8-2C17 6 18.5 9 16.8 12c-2.3 3.8-8.8 8-8.8 8z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
              {wishlistItems.length}
            </span>
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center text-stone-700 hover:text-black"
            aria-label={t("common.cart")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 8h12l-1 11H7L6 8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
              {cartItemCount}
            </span>
          </Link>
        </div>
      </div>

      <nav
        className="hidden border-t border-stone-200 bg-white lg:block"
        aria-label="Primary navigation"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-6 px-4 py-1.5 text-[13px] text-stone-700">
          {primaryNav.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="hover:text-black">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <nav
        className="hidden overflow-x-auto border-t border-stone-200 bg-[#f7f5f0] lg:block"
        aria-label="Style navigation"
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-5 px-4 py-1 text-xs text-stone-600">
          {styleNav.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={`whitespace-nowrap hover:text-black ${
                item.accent ? "font-semibold text-[#c62828] hover:text-[#a01f1f]" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-stone-200 bg-white px-4 py-4 shadow-xl lg:hidden">
          <div className="mb-4">
            <StorefrontControls />
          </div>
          <nav className="grid gap-1 text-base" aria-label="Mobile navigation">
            {[...primaryNav, ...styleNav].map((item) => (
              <Link
                key={`m-${item.href}-${item.label}`}
                href={item.href}
                onClick={closeMobileMenu}
                className={`px-3 py-2 hover:bg-stone-50 ${
                  item.accent ? "font-semibold text-[#c62828]" : "text-stone-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contact" onClick={closeMobileMenu} className="px-3 py-2 text-stone-800 hover:bg-stone-50">
              {t("nav.contact")}
            </Link>
          </nav>
          <div className="mt-3 grid gap-1 border-t border-stone-200 pt-3 text-sm">
            <button type="button" onClick={openSearch} className="px-3 py-2 text-left hover:bg-stone-50">
              {t("common.search")}
            </button>
            {session ? (
              <>
                <Link href="/orders" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-stone-50">
                  {t("common.orders")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMobileMenu()
                    signOut()
                  }}
                  className="px-3 py-2 text-left text-red-700 hover:bg-stone-50"
                >
                  {t("auth.signOut")}
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3 pt-2">
                <Link href="/login" onClick={closeMobileMenu} className="border border-stone-300 px-3 py-2 text-center">
                  {t("common.login")}
                </Link>
                <Link href="/register" onClick={closeMobileMenu} className="bg-black px-3 py-2 text-center text-white">
                  {t("common.register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
