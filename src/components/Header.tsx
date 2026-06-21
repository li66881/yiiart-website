"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useLanguage } from "@/context/LanguageContext"
import { useWishlist } from "@/context/WishlistContext"
import StorefrontControls from "@/components/StorefrontControls"
import SearchDialog from "@/components/SearchDialog"
import { siteAssetUrl } from "@/lib/assets"

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const closeMobileMenu = () => setMobileMenuOpen(false)
  const openSearch = () => {
    closeMobileMenu()
    setSearchOpen(true)
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-stone-200 bg-[#fbfaf6]/92 backdrop-blur-xl">
      <div className="bg-stone-950 px-4 py-2 text-center text-xs text-white sm:text-sm">
        Handmade modern paintings, custom canvas art, free worldwide shipping, and 30-day returns.
      </div>
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex min-w-0 items-center gap-8">
          <Link href="/" className="shrink-0" onClick={closeMobileMenu} aria-label="YiiArt home">
            <img src={siteAssetUrl("/brand/yiiart-logo.svg")} alt="YiiArt" className="h-8 w-auto" />
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-stone-700 lg:flex" aria-label="Primary navigation">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-black">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <StorefrontControls />
          </div>

          <button
            type="button"
            onClick={openSearch}
            className="hidden h-9 border border-stone-300 px-3 text-sm text-stone-700 transition hover:border-black hover:text-black md:inline-flex md:items-center"
          >
            {t("common.search")}
          </button>

          <Link
            href="/contact"
            className="hidden h-9 items-center bg-black px-4 text-sm text-white transition hover:bg-stone-800 xl:inline-flex"
          >
            {t("home.requestRoomAdvice")}
          </Link>

          <Link
            href="/wishlist"
            className="relative hidden h-9 items-center border border-transparent px-2 text-sm text-stone-700 transition hover:border-stone-300 hover:text-black md:inline-flex"
          >
            {t("common.wishlist")}
            {wishlistItems.length > 0 && (
              <span className="ml-2 flex h-5 min-w-5 items-center justify-center bg-black px-1.5 text-xs text-white">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {session && (
            <Link
              href="/orders"
              className="hidden h-9 items-center border border-transparent px-2 text-sm text-stone-700 transition hover:border-stone-300 hover:text-black md:inline-flex"
            >
              {t("common.orders")}
            </Link>
          )}

          <Link
            href="/cart"
            className="hidden h-9 items-center border border-transparent px-2 text-sm text-stone-700 transition hover:border-stone-300 hover:text-black md:inline-flex"
          >
            {t("common.cart")}
          </Link>

          {status === "loading" ? (
            <div className="hidden h-8 w-8 animate-pulse bg-stone-200 md:block" />
          ) : session ? (
            <div className="group relative hidden md:block">
              <button className="flex h-8 w-8 items-center justify-center bg-stone-200 text-sm text-stone-700">
                {session.user?.name?.[0] || session.user?.email?.[0] || "?"}
              </button>
              <div className="absolute right-0 mt-3 hidden w-56 border border-stone-200 bg-white shadow-xl group-hover:block">
                <div className="border-b border-stone-200 px-4 py-3 text-sm">
                  <p className="font-medium">{session.user?.name || "User"}</p>
                  <p className="mt-1 truncate text-xs text-stone-500">{session.user?.email}</p>
                </div>
                <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-stone-50">
                  {t("common.orders")}
                </Link>
                <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-stone-50">
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
              <Link href="/login" className="text-sm text-stone-700 transition hover:text-black">
                {t("common.login")}
              </Link>
              <Link href="/register" className="border border-black px-3 py-2 text-sm transition hover:bg-black hover:text-white">
                {t("common.register")}
              </Link>
            </div>
          )}

          <button
            type="button"
            className="flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1 border border-stone-300 bg-white md:hidden"
            aria-label={mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="h-px w-5 bg-black" />
            <span className="h-px w-5 bg-black" />
            <span className="h-px w-5 bg-black" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-stone-200 bg-[#fbfaf6] px-4 py-4 shadow-xl md:hidden">
          <div className="mb-4 sm:hidden">
            <StorefrontControls />
          </div>

          <nav className="grid gap-1 text-base" aria-label="Mobile navigation">
            {primaryNav.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMobileMenu} className="px-3 py-2 hover:bg-white">
                {item.label}
              </Link>
            ))}
            <Link href="/contact" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-white">
              {t("nav.contact")}
            </Link>
          </nav>

          <div className="mt-3 grid gap-1 border-t border-stone-200 pt-3 text-sm">
            <button type="button" onClick={openSearch} className="px-3 py-2 text-left hover:bg-white">
              {t("common.search")}
            </button>
            <Link href="/wishlist" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-white">
              {t("common.wishlist")}{wishlistItems.length > 0 ? ` (${wishlistItems.length})` : ""}
            </Link>
            <Link href="/cart" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-white">
              {t("common.cart")}
            </Link>
            {session && (
              <Link href="/orders" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-white">
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
                className="px-3 py-2 text-left text-red-700 hover:bg-white"
              >
                {t("auth.signOut")}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3 pt-2">
                <Link href="/login" onClick={closeMobileMenu} className="border border-stone-300 px-3 py-2 text-center hover:bg-white">
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
