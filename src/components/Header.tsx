"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useLanguage } from "@/context/LanguageContext"
import { useWishlist } from "@/context/WishlistContext"
import StorefrontControls from "@/components/StorefrontControls"
import SearchDialog from "@/components/SearchDialog"

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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-3">
        <Link href="/" className="shrink-0" onClick={closeMobileMenu} aria-label="YiiArt home">
          <img src="/brand/yiiart-logo.svg" alt="YiiArt" className="h-9 w-auto" />
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/artworks" className="hover:text-gray-600">{t("nav.explore")}</Link>
          <Link href="/artists" className="hover:text-gray-600">{t("nav.artists")}</Link>
          <Link href="/artworks?category=Abstract" className="hover:text-gray-600">{t("nav.abstract")}</Link>
          <Link href="/artworks?category=Texture" className="hover:text-gray-600">{t("nav.texture")}</Link>
        </nav>
        
        <div className="flex items-center gap-2 md:gap-4">
          <StorefrontControls />
          
          <button
            type="button"
            onClick={openSearch}
            className="hidden md:inline-flex p-2 hover:bg-gray-100 rounded-full"
          >
            {t("common.search")}
          </button>
          
          {/* Wishlist */}
          <Link href="/wishlist" className="hidden md:inline-flex p-2 hover:bg-gray-100 rounded-full relative">
            {t("common.wishlist")}
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          
          {/* Orders */}
          {session && (
            <Link href="/orders" className="hidden md:inline-flex p-2 hover:bg-gray-100 rounded-full" title={t("common.orders")}>
              {t("common.orders")}
            </Link>
          )}
          
          {/* Cart */}
          <Link href="/cart" className="hidden md:inline-flex p-2 hover:bg-gray-100 rounded-full">{t("common.cart")}</Link>
          
          {status === "loading" ? (
            <div className="hidden md:block w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            <div className="relative group hidden md:block">
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                {session.user?.name?.[0] || session.user?.email?.[0] || "?"}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border hidden group-hover:block">
                <div className="px-4 py-2 text-sm border-b">
                  <p className="font-medium">{session.user?.name || "User"}</p>
                  <p className="text-gray-500 text-xs">{session.user?.email}</p>
                </div>
                <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50">{t("common.orders")}</Link>
                <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50">{t("common.wishlist")}</Link>
                <button 
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                >
                  {t("auth.signOut")}
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="text-sm hover:underline">{t("common.login")}</Link>
              <Link href="/register" className="px-4 py-1 bg-black text-white text-sm">{t("common.register")}</Link>
            </div>
          )}

          <button
            type="button"
            className="md:hidden flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-1 border bg-white"
            aria-label={mobileMenuOpen ? t("common.closeMenu") : t("common.openMenu")}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span className="h-px w-4 bg-black" />
            <span className="h-px w-4 bg-black" />
            <span className="h-px w-4 bg-black" />
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 shadow-lg">
          <nav className="grid gap-1 text-base">
            <Link href="/artworks" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-gray-50">{t("nav.explore")}</Link>
            <Link href="/artists" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-gray-50">{t("nav.artists")}</Link>
            <Link href="/artworks?category=Abstract" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-gray-50">{t("nav.abstract")}</Link>
            <Link href="/artworks?category=Texture" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-gray-50">{t("nav.texture")}</Link>
          </nav>

          <div className="mt-3 grid gap-1 border-t pt-3 text-sm">
            <button type="button" onClick={openSearch} className="px-3 py-2 text-left hover:bg-gray-50">{t("common.search")}</button>
            <Link href="/wishlist" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-gray-50">
              {t("common.wishlist")}{wishlistItems.length > 0 ? ` (${wishlistItems.length})` : ""}
            </Link>
            <Link href="/cart" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-gray-50">{t("common.cart")}</Link>
            {session && (
              <Link href="/orders" onClick={closeMobileMenu} className="px-3 py-2 hover:bg-gray-50">{t("common.orders")}</Link>
            )}
            {session ? (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu()
                  signOut()
                }}
                className="px-3 py-2 text-left text-red-600 hover:bg-gray-50"
              >
                {t("auth.signOut")}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3 pt-2">
                <Link href="/login" onClick={closeMobileMenu} className="border px-3 py-2 text-center hover:bg-gray-50">{t("common.login")}</Link>
                <Link href="/register" onClick={closeMobileMenu} className="bg-black px-3 py-2 text-center text-white">{t("common.register")}</Link>
              </div>
            )}
          </div>
        </div>
      )}
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
