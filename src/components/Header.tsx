"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { useLanguage } from "@/context/LanguageContext"
import { useWishlist } from "@/context/WishlistContext"

export default function Header() {
  const { data: session, status } = useSession()
  const { locale, t, setLocale } = useLanguage()
  const { items: wishlistItems } = useWishlist()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-light">Yii<span className="font-medium">Art</span></Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/artworks" className="hover:text-gray-600">Explore</Link>
          <Link href="/artists" className="hover:text-gray-600">Artists</Link>
          <Link href="/artworks?category=Abstract" className="hover:text-gray-600">Abstract</Link>
          <Link href="/artworks?category=Texture" className="hover:text-gray-600">Texture</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center border">
            <button
              onClick={() => setLocale("en")}
              className={`px-2 py-1 text-sm ${locale === "en" ? "bg-black text-white" : "hover:bg-gray-100"}`}
            >
              EN
            </button>
            <button
              onClick={() => setLocale("zh")}
              className={`px-2 py-1 text-sm ${locale === "zh" ? "bg-black text-white" : "hover:bg-gray-100"}`}
            >
              中文
            </button>
          </div>
          
          <button className="p-2 hover:bg-gray-100 rounded-full">🔍</button>
          
          {/* Wishlist */}
          <Link href="/wishlist" className="p-2 hover:bg-gray-100 rounded-full relative">
            ❤️
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
          </Link>
          
          {/* Orders */}
          {session && (
            <Link href="/orders" className="p-2 hover:bg-gray-100 rounded-full" title="My Orders">
              📦
            </Link>
          )}
          
          {/* Cart */}
          <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full">🛒</Link>
          
          {status === "loading" ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : session ? (
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">
                {session.user?.name?.[0] || session.user?.email?.[0] || "?"}
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border hidden group-hover:block">
                <div className="px-4 py-2 text-sm border-b">
                  <p className="font-medium">{session.user?.name || "User"}</p>
                  <p className="text-gray-500 text-xs">{session.user?.email}</p>
                </div>
                <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50">📦 My Orders</Link>
                <Link href="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50">❤️ Wishlist</Link>
                <button 
                  onClick={() => signOut()}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm hover:underline">Login</Link>
              <Link href="/register" className="px-4 py-1 bg-black text-white text-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
