"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useLanguage } from "@/context/LanguageContext"
import { useWishlist } from "@/context/WishlistContext"
import { useCart } from "@/context/CartContext"
import StorefrontControls from "@/components/StorefrontControls"
import SearchDialog from "@/components/SearchDialog"
import { siteAssetUrl } from "@/lib/assets"
import { headerNavigationGroups } from "@/lib/storefront/editorial-presentation"

const primaryNav = [
  { href: "/artworks", label: "Shop Art" },
  { href: "/collections/large-canvas-art", label: "Large Wall Art" },
  { href: "/custom-painting", label: "Custom Painting" },
  { href: "/size-guide", label: "Size Guide" },
  { href: "/reviews", label: "Reviews" },
  { href: "/artists", label: "Artists" },
]

export default function Header() {
  const { data: session, status } = useSession()
  const { t } = useLanguage()
  const { items: wishlistItems } = useWishlist()
  const { itemCount: cartItemCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const navigationGroups = headerNavigationGroups(primaryNav)

  const closeMobileMenu = () => setMobileMenuOpen(false)
  const openSearch = () => {
    closeMobileMenu()
    setSearchOpen(true)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/15 bg-[#1d1c18]/95 text-[#fffdf8] backdrop-blur-xl">
      <div className="bg-[#75432f] px-4 py-2 text-center text-xs text-[#fffdf8] sm:text-sm">
        Hand-painted modern art, custom sizes, and worldwide delivery options.
      </div>
      <div className="mx-auto flex min-h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="shrink-0" onClick={closeMobileMenu} aria-label="YiiArt home">
            <img src={siteAssetUrl("/brand/yiiart-logo-light.svg")} alt="YiiArt" className="h-8 w-auto" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm lg:flex" aria-label="Primary navigation">
            <div className="flex items-center gap-6 text-white/88">
            {navigationGroups.primary.map((item) => (
              <Link key={item.href} href={item.href} className="transition-colors duration-200 hover:text-white">
                {item.label}
              </Link>
            ))}
            </div>
            <div className="flex items-center gap-4 border-l border-white/20 pl-5 text-xs text-white/72">
              {navigationGroups.secondary.map((item) => (
                <Link key={item.href} href={item.href} className="transition-colors duration-200 hover:text-white/90">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <StorefrontControls />
          </div>

          <button
            type="button"
            onClick={openSearch}
            className="hidden h-9 border border-white/20 px-3 text-xs uppercase tracking-[0.08em] text-white/75 transition-colors duration-200 hover:border-white/60 hover:text-white md:inline-flex md:items-center"
          >
            {t("common.search")}
          </button>

          <Link
            href="/contact"
            className="hidden h-9 items-center bg-[#fffdf8] px-4 text-xs font-medium uppercase tracking-[0.08em] text-[#1d1c18] transition-colors duration-200 hover:bg-[#e9e2d6] 2xl:inline-flex"
          >
            {t("home.requestRoomAdvice")}
          </Link>

          <Link
            href="/wishlist"
            className="relative hidden h-9 items-center border border-transparent px-2 text-sm text-white/80 transition-colors duration-200 hover:border-white/35 hover:text-white md:inline-flex"
          >
            {t("common.wishlist")}
            {wishlistItems.length > 0 && (
              <span className="ml-2 flex h-5 min-w-5 items-center justify-center bg-[#fffdf8] px-1.5 text-xs text-[#1d1c18]">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {session && (
            <Link
              href="/orders"
              className="hidden h-9 items-center border border-transparent px-2 text-sm text-white/80 transition-colors duration-200 hover:border-white/35 hover:text-white md:inline-flex"
            >
              {t("common.orders")}
            </Link>
          )}

          <Link
            href="/cart"
            className="relative hidden h-9 items-center border border-transparent px-2 text-sm text-white/80 transition-colors duration-200 hover:border-white/35 hover:text-white md:inline-flex"
          >
            {t("common.cart")}
            {cartItemCount > 0 && (
              <span className="ml-2 flex h-5 min-w-5 items-center justify-center bg-[#fffdf8] px-1.5 text-xs text-[#1d1c18]">
                {cartItemCount}
              </span>
            )}
          </Link>

          {status === "loading" ? (
            <div className="hidden h-8 w-8 animate-pulse bg-stone-200 md:block" />
          ) : session ? (
            <div
              className="group relative hidden md:block"
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
                className="flex h-8 w-8 items-center justify-center bg-stone-200 text-sm text-stone-700"
              >
                {session.user?.name?.[0] || session.user?.email?.[0] || "?"}
              </button>
              <div
                className={`absolute right-0 mt-3 w-56 border border-stone-200 bg-white shadow-xl group-hover:block ${accountMenuOpen ? "block" : "hidden"}`}
              >
                <div className="border-b border-stone-200 px-4 py-3 text-sm">
                  <p className="font-medium">{session.user?.name || "User"}</p>
                  <p className="mt-1 truncate text-xs text-stone-500">{session.user?.email}</p>
                </div>
                <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-stone-50" onClick={() => setAccountMenuOpen(false)}>
                  {t("common.orders")}
                </Link>
                <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-stone-50" onClick={() => setAccountMenuOpen(false)}>
                  {t("common.wishlist")}
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
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login" className="text-sm text-white/80 transition-colors hover:text-white">
                {t("common.login")}
              </Link>
              <Link href="/register" className="border border-white/65 px-3 py-2 text-sm transition-colors hover:bg-white hover:text-[#1d1c18]">
                {t("common.register")}
              </Link>
            </div>
          )}

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1 border border-white/35 bg-transparent md:hidden"
            aria-label={mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="h-px w-5 bg-white" />
            <span className="h-px w-5 bg-white" />
            <span className="h-px w-5 bg-white" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/15 bg-[#1d1c18] px-4 py-4 text-[#fffdf8] shadow-xl md:hidden">
          <div className="mb-4 sm:hidden">
            <StorefrontControls />
          </div>

          <nav className="grid gap-1 text-base" aria-label="Mobile navigation">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMobileMenu} className="px-3 py-2 text-white/88 hover:bg-white/10">
                {item.label}
              </Link>
            ))}
            <Link href="/contact" onClick={closeMobileMenu} className="px-3 py-2 text-white/88 hover:bg-white/10">
              {t("nav.contact")}
            </Link>
          </nav>

          <div className="mt-3 grid gap-1 border-t border-white/15 pt-3 text-sm">
            <button type="button" onClick={openSearch} className="px-3 py-2 text-left text-white/88 hover:bg-white/10">
              {t("common.search")}
            </button>
            <Link href="/wishlist" onClick={closeMobileMenu} className="px-3 py-2 text-white/88 hover:bg-white/10">
              {t("common.wishlist")}{wishlistItems.length > 0 ? ` (${wishlistItems.length})` : ""}
            </Link>
            <Link href="/cart" onClick={closeMobileMenu} className="px-3 py-2 text-white/88 hover:bg-white/10">
              {t("common.cart")}{cartItemCount > 0 ? ` (${cartItemCount})` : ""}
            </Link>
            {session && (
              <Link href="/orders" onClick={closeMobileMenu} className="px-3 py-2 text-white/88 hover:bg-white/10">
                {t("common.orders")}
              </Link>
            )}
            {session ? (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu()
                  signOut()
                }}
                className="px-3 py-2 text-left text-red-300 hover:bg-white/10"
              >
                {t("auth.signOut")}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3 pt-2">
                <Link href="/login" onClick={closeMobileMenu} className="border border-white/35 px-3 py-2 text-center text-white hover:bg-white/10">
                  {t("common.login")}
                </Link>
                <Link href="/register" onClick={closeMobileMenu} className="bg-white px-3 py-2 text-center text-[#1d1c18]">
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
