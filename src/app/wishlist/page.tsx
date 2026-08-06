"use client"

import Image from "next/image"
import Link from "next/link"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { PriceText } from "@/components/PriceText"
import { useWishlist } from "@/context/WishlistContext"

export default function WishlistPage() {
  const { items, removeFromWishlist } = useWishlist()

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5f0] text-[#181613]">
      <Header />

      <main className="flex-1 pb-20 pt-[var(--ya-header-offset)] lg:pt-[var(--ya-header-offset-lg)]">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-10">
          <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">Saved works</p>
          <h1 className="mb-10 text-4xl font-medium tracking-[-0.03em] md:text-5xl">Wishlist</h1>

          {items.length === 0 ? (
            <div className="border-y border-stone-200 py-20 text-center">
              <p className="mb-6 text-stone-500">Your wishlist is empty</p>
              <Link
                href="/artworks?sort=featured"
                className="inline-flex min-h-12 items-center rounded-full bg-[#111] px-8 text-sm font-semibold tracking-[0.04em] text-white transition hover:bg-[#2a2a2a]"
              >
                Browse artworks
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {items.map((item) => (
                <div key={item.id} className="border border-stone-200 bg-white">
                  <Link href={`/artwork/${item.slug}`}>
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe6dc]">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                        />
                      ) : null}
                    </div>
                  </Link>
                  <div className="p-4">
                    <h3 className="font-medium">
                      <Link href={`/artwork/${item.slug}`} className="hover:underline">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-stone-500">{item.artist}</p>
                    <p className="mt-2 font-medium">
                      <PriceText amountCny={item.price} />
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex-1 border border-stone-300 py-2.5 text-sm text-stone-600 transition hover:border-black hover:text-black"
                      >
                        Remove
                      </button>
                      <Link
                        href={`/artwork/${item.slug}`}
                        className="flex flex-1 items-center justify-center rounded-full bg-[#111] py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
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
