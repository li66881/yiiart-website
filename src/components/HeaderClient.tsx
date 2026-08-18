"use client"

import Link from "next/link"
import { useEffect, useState, type ReactNode } from "react"
import { signOut, useSession } from "next-auth/react"
import SearchDialog from "@/components/SearchDialog"
import StorefrontControls from "@/components/StorefrontControls"
import { useCart } from "@/context/CartContext"
import { useLanguage } from "@/context/LanguageContext"
import { useWishlist } from "@/context/WishlistContext"
import { siteAssetUrl } from "@/lib/assets"
import type { CatalogNavigationState } from "@/lib/storefront/catalog-navigation"
import { getHeaderNavigationModel } from "@/lib/storefront/catalog-presentation"

const primaryNav = [
  { href: "/artworks?sort=featured", label: "Best Sellers" },
  { href: "/artworks?sort=newest", label: "New In" },
  { href: "/custom-painting", label: "Custom Art" },
  { href: "/custom-painting?intent=trade", label: "Trade Program" },
  { href: "/custom-painting?intent=gift", label: "Gift" },
  { href: "/reviews", label: "Reviews" },
  { href: "/artists", label: "Artists" },
  { href: "/about", label: "Our Story" },
  { href: "/artworks", label: "All Art" },
  { href: "/collections/large-canvas-art", label: "Large Wall Art" },
  { href: "/collections/textured-wall-art", label: "Textured Art" },
  { href: "/collections/abstract-art-for-living-room", label: "Living Room" },
]

const trustMessages = [
  "Delivery options confirmed for every order",
  "Custom sizing available on request",
  "Hand-painted by studio artists",
  "Secure checkout and personal art support",
]

type HeaderClientProps = {
  navigationState: CatalogNavigationState
}

export default function HeaderClient({ navigationState }: HeaderClientProps) {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const { items: wishlistItems } = useWishlist()
  const { itemCount: cartItemCount, openCart } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [trustIndex, setTrustIndex] = useState(0)
  const navigationGroups = getHeaderNavigationModel(primaryNav, navigationState)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTrustIndex((current) => (current + 1) % trustMessages.length)
    }, 4800)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)
  const openSearch = () => {
    closeMenu()
    setSearchOpen(true)
  }

  return (
    <header className="optimized-storefront-header fixed left-0 right-0 top-0 z-50 border-b border-[#e5e5e5] bg-white text-[#171717]">
      <div className="bg-[#e8e4d8] px-4 py-2 text-center text-[11px] font-normal tracking-[0.04em] text-[#171717]">
        Hand-painted art, custom sizes, and worldwide delivery.
      </div>

      <div className="hidden border-b border-[#e5e5e5] bg-[#f7f6f2] md:block">
        <div className="mx-auto flex min-h-8 max-w-[1600px] items-center justify-center gap-3 px-6 text-[12px] text-[#171717]">
          <button
            type="button"
            aria-label="Previous trust message"
            className="px-1 text-base leading-none text-[#a4a4a4] hover:text-black"
            onClick={() => setTrustIndex((current) => (current - 1 + trustMessages.length) % trustMessages.length)}
          >
            <span aria-hidden="true">&#8249;</span>
          </button>
          <p className="min-w-[280px] text-center" aria-live="polite">
            {trustMessages[trustIndex]}
          </p>
          <button
            type="button"
            aria-label="Next trust message"
            className="px-1 text-base leading-none text-[#a4a4a4] hover:text-black"
            onClick={() => setTrustIndex((current) => (current + 1) % trustMessages.length)}
          >
            <span aria-hidden="true">&#8250;</span>
          </button>
        </div>
      </div>

      <div className="mx-auto grid h-14 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 lg:px-10">
        <div className="flex items-center">
          <IconButton
            label={menuOpen ? t("common.closeMenu") : t("common.openMenu")}
            onClick={() => setMenuOpen((open) => !open)}
            expanded={menuOpen}
          >
            <MenuIcon open={menuOpen} />
          </IconButton>
          <IconButton label={t("common.search")} onClick={openSearch}>
            <SearchIcon />
          </IconButton>
        </div>

        <Link href="/" className="justify-self-center" onClick={closeMenu} aria-label="YiiArt home">
          <img src={siteAssetUrl("/brand/yiiart-logo.svg")} alt="YiiArt" className="h-6 w-auto sm:h-8" />
        </Link>

        <div className="flex items-center justify-end">
          <HeaderCountLink href="/wishlist" label={t("common.wishlist")} count={wishlistItems.length}>
            <HeartIcon />
          </HeaderCountLink>
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center text-[#171717] transition hover:opacity-60"
            aria-label={`${t("common.cart")}${cartItemCount > 0 ? `, ${cartItemCount} items` : ""}`}
            onClick={openCart}
          >
            <BagIcon />
            {cartItemCount > 0 ? (
              <span key={cartItemCount} className="yii-count-pop absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] font-medium text-white">
                {cartItemCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>

      <nav className="hidden border-t border-[#e5e5e5] lg:block" aria-label="Primary">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-x-6 gap-y-1 px-6 py-2.5 text-[13px] text-[#171717]">
          {navigationGroups.mobile.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="whitespace-nowrap hover:opacity-60"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-[#171717]/40"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <div className="fixed bottom-0 left-0 top-0 z-50 flex w-[min(100%,380px)] flex-col border-r border-[#e5e5e5] bg-white">
            <div className="flex h-14 items-center justify-between border-b border-[#e5e5e5] px-3">
              <IconButton label={t("common.closeMenu")} onClick={closeMenu}>
                <MenuIcon open />
              </IconButton>
              <span className="text-sm font-medium">Menu</span>
              <span className="w-10" />
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-6 border-b border-[#e5e5e5] pb-4">
                <StorefrontControls />
              </div>
              <nav className="grid text-[15px] font-normal" aria-label="Store navigation">
                {navigationGroups.mobile.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    onClick={closeMenu}
                    className="border-b border-[#e5e5e5] py-3.5 text-[#171717]"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/contact" onClick={closeMenu} className="border-b border-[#e5e5e5] py-3.5">
                  Art advisory
                </Link>
                <Link href="/size-guide" onClick={closeMenu} className="border-b border-[#e5e5e5] py-3.5">
                  Size Guide
                </Link>
              </nav>
              <div className="mt-6 grid gap-2 text-sm">
                {status !== "loading" && session ? (
                  <>
                    <Link href="/orders" onClick={closeMenu} className="yii-btn-secondary">
                      {t("common.orders")}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu()
                        signOut()
                      }}
                      className="yii-btn-secondary text-red-700"
                    >
                      {t("auth.signOut")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu} className="yii-btn-secondary">
                      {t("common.login")}
                    </Link>
                    <Link href="/register" onClick={closeMenu} className="yii-btn-primary">
                      {t("common.register")}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      ) : null}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

function IconButton({
  label,
  children,
  onClick,
  expanded,
}: {
  label: string
  children: ReactNode
  onClick: () => void
  expanded?: boolean
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      className="inline-flex h-10 w-10 items-center justify-center text-[#171717] transition hover:opacity-60"
    >
      {children}
    </button>
  )
}

function HeaderCountLink({ href, label, count, children }: { href: string; label: string; count: number; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="relative inline-flex h-10 w-10 items-center justify-center text-[#171717] transition hover:opacity-60"
      aria-label={`${label}${count > 0 ? `, ${count} items` : ""}`}
    >
      {children}
      {count > 0 ? (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] font-medium text-white">
          {count}
        </span>
      ) : null}
    </Link>
  )
}

function MenuIcon({ open }: { open?: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-6.5-4.2-8.8-8C1.5 9 3 6 6.2 6c1.8 0 3.1 1 3.8 2 .7-1 2-2 3.8-2C17 6 18.5 9 16.8 12c-2.3 3.8-8.8 8-8.8 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 8h12l-1 11H7L6 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
