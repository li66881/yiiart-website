"use client"

import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { useWishlist } from "@/context/WishlistContext"
import { useLanguage } from "@/context/LanguageContext"

export default function WishlistPage() {
  const { t } = useLanguage()
  const { items, removeFromWishlist } = useWishlist()

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-light mb-8">My Wishlist</h1>

          {items.length === 0 ? (
            <div className="text-center py-20 bg-gray-50">
              <p className="text-gray-500 mb-4">Your wishlist is empty</p>
              <Link href="/artworks" className="px-6 py-2 bg-black text-white hover:bg-gray-800">
                Browse Artworks
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {items.map((item) => (
                <div key={item.id} className="border group">
                  <Link href={`/artwork/${item.slug}`}>
                    <div className="aspect-[4/5] bg-gray-100 overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.artist}</p>
                    <p className="mt-1">¥{item.price.toLocaleString()}</p>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex-1 py-2 border text-red-500 hover:bg-red-50 text-sm"
                      >
                        Remove
                      </button>
                      <Link 
                        href={`/artwork/${item.slug}`}
                        className="flex-1 py-2 bg-black text-white text-center hover:bg-gray-800 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
