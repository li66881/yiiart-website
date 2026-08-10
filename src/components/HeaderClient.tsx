"use client"

import Link from "next/link"
import { useState, type ReactNode } from "react"
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
  { href: "/artworks?sort=featured", label: "Featured Art" },
  { href: "/artworks?sort=newest", label: "New In" },
  { href: "/artworks", label: "All Art" },
  { href: "/collections/large-canvas-art", label: "Large Wall Art" },
  { href: "/collections/textured-wall-art", label: "Textured Art" },
  { href: "/collections/abstract-art-for-living-room", label: "Living Room" },
  { href: "/custom-painting", label: "Custom Painting" },
  { href: "/artists", label: "Artists" },
  { href: "/about", label: "Our Story" },
]

type HeaderClientProps = {
  navigationState: CatalogNavigationState
}

export default function HeaderClient({ navigationState }: HeaderClientProps) {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const { items: wishlistItems } = useWishlist()
  const { itemCount: cartItemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const navigationGroups = getHeaderNavigationModel(primaryNav, navigationState)

  const closeMobileMenu = () => setMobileMenuOpen(false)
  const openSearch = () => {
    closeMobileMenu()
    setSearchOpen(true)
  }

  return (
    <header className="optimized-storefront-header fixed left-0 right-0 top-0 z-50 border-b border-stone-200 bg-[#fbfaf7]/98 text-[#1d1c18] backdrop-blur-xl">
      <div className="bg-[#75432f] px-4 py-2 text-center text-[11px] font-medium tracking-[0.03em] text-[#fffdf8] sm:text-xs">
        Hand-painted art, custom sizes, and worldwide delivery.
      </div>

      <div className="hidden border-b border-stone-200/80 bg-white/80 md:block">
        <div className="mx-auto flex min-h-7 max-w-[1440px] items-center justify-between gap-6 px-6 text-[11px] text-stone-500 lg:px-10">
          <p>Made for homes, hospitality, offices, and design projects.</p>
          <StorefrontControls />
        </div>
      </div>

      <div className="mx-auto grid min-h-[54px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center lg:hidden"
            aria-label={mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="grid gap-1.5" aria-hidden="true">
              <span className="h-px w-5 bg-current" />
              <span className="h-px w-5 bg-current" />
              <span className="h-px w-5 bg-current" />
            </span>
          </button>
          <Link href="/contact" className="hidden text-xs font-medium text-stone-600 hover:text-black lg:inline-flex">
            Art advisory
          </Link>
        </div>

        <Link href="/" className="justify-self-center" onClick={closeMobileMenu} aria-label="YiiArt home">
          <img src={siteAssetUrl("/brand/yiiart-logo.svg")} alt="YiiArt" className="h-7 w-auto sm:h-8" />
        </Link>

        <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
          <IconButton label={t("common.search")} onClick={openSearch}>
            <SearchIcon />
          </IconButton>

          {status !== "loading" && session ? (
            <div
              className="relative hidden sm:block"
              onKeyDown={(event) => {
                if (event.key === "Escape") setAccountMenuOpen(false)
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setAccountMenuOpen(false)
              }}
            >
              <IconButton
                label="Account menu"
                onClick={() => setAccountMenuOpen((open) => !open)}
                expanded={accountMenuOpen}
              >
                <AccountIcon />
              </IconButton>
              <div className={`absolute right-0 mt-2 w-56 border border-stone-200 bg-white shadow-xl ${accountMenuOpen ? "block" : "hidden"}`}>
                <div className="border-b border-stone-200 px-4 py-3 text-sm">
                  <p className="font-medium">{session.user?.name || "User"}</p>
                  <p className="mt-1 truncate text-xs text-stone-500">{session.user?.email}</p>
                </div>
                <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-stone-50" onClick={() => setAccountMenuOpen(false)}>
                  {t("common.orders")}
                </Link>
                <button type="button" onClick={() => signOut()} className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-stone-50">
                  {t("auth.signOut")}
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden h-10 w-10 items-center justify-center text-stone-700 hover:text-black sm:inline-flex" aria-label={t("common.login")}>
              <AccountIcon />
            </Link>
          )}

          <HeaderCountLink href="/wishlist" label={t("common.wishlist")} count={wishlistItems.length}>
            <HeartIcon />
          </HeaderCountLink>
          <HeaderCountLink href="/cart" label={t("common.cart")} count={cartItemCount}>
            <BagIcon />
          </HeaderCountLink>
        </div>
      </div>

      <nav className="hidden border-t border-stone-200 bg-white lg:block" aria-label="Primary navigation">
        <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-7 px-4 py-2 text-[13px]">
          {navigationGroups.primary.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="font-medium text-stone-800 transition hover:text-black">
              {item.label}
            </Link>
          ))}
          {navigationGroups.secondary.length > 0 ? <span className="h-4 w-px bg-stone-200" aria-hidden="true" /> : null}
          {navigationGroups.secondary.map((item) => (
            <Link key={`${item.href}-${item.label}`} href={item.href} className="text-stone-600 transition hover:text-black">
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {mobileMenuOpen ? (
        <div className="max-h-[calc(100svh-var(--yiiart-header-offset))] overflow-y-auto border-t border-stone-200 bg-[#fbfaf7] px-4 py-4 shadow-xl lg:hidden">
          <div className="mb-4 md:hidden">
            <StorefrontControls />
          </div>
          <nav className="grid text-base" aria-label="Mobile navigation">
            {navigationGroups.mobile.map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href} onClick={closeMobileMenu} className="border-b border-stone-200 px-2 py-3 text-stone-800">
                {item.label}
              </Link>
            ))}
            <Link href="/contact" onClick={closeMobileMenu} className="border-b border-stone-200 px-2 py-3 text-stone-800">
              {t("nav.contact")}
            </Link>
            <Link href="/size-guide" onClick={closeMobileMenu} className="border-b border-stone-200 px-2 py-3 text-stone-800">
              Size Guide
            </Link>
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {session ? (
              <>
                <Link href="/orders" onClick={closeMobileMenu} className="border border-stone-300 px-3 py-2.5 text-center">{t("common.orders")}</Link>
                <button type="button" onClick={() => { closeMobileMenu(); signOut() }} className="border border-stone-300 px-3 py-2.5 text-red-700">{t("auth.signOut")}</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={closeMobileMenu} className="border border-stone-300 px-3 py-2.5 text-center">{t("common.login")}</Link>
                <Link href="/register" onClick={closeMobileMenu} className="bg-[#1d1c18] px-3 py-2.5 text-center text-white">{t("common.register")}</Link>
              </>
            )}
          </div>
        </div>
      ) : null}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}

function IconButton({ label, children, onClick, expanded }: { label: string; children: ReactNode; onClick: () => void; expanded?: boolean }) {
  return (
    <button type="button" aria-label={label} aria-expanded={expanded} onClick={onClick} className="inline-flex h-10 w-10 items-center justify-center text-stone-700 transition hover:bg-stone-100 hover:text-black">
      {children}
    </button>
  )
}

function HeaderCountLink({ href, label, count, children }: { href: string; label: string; count: number; children: ReactNode }) {
  return (
    <Link href={href} className="relative inline-flex h-10 w-10 items-center justify-center text-stone-700 transition hover:bg-stone-100 hover:text-black" aria-label={`${label}${count > 0 ? `, ${count} items` : ""}`}>
      {children}
      {count > 0 ? <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#75432f] px-1 text-[10px] text-white">{count}</span> : null}
    </Link>
  )
}

function SearchIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.6" /><path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}

function AccountIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" /><path d="M5 19c1.6-3.2 4-4.8 7-4.8s5.4 1.6 7 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}

function HeartIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s-6.5-4.2-8.8-8C1.5 9 3 6 6.2 6c1.8 0 3.1 1 3.8 2 .7-1 2-2 3.8-2C17 6 18.5 9 16.8 12c-2.3 3.8-8.8 8-8.8 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
}

function BagIcon() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
