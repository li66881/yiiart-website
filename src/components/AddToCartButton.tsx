"use client"

import { useState } from "react"
import { useCart } from "@/context/CartContext"

type AddToCartButtonProps = {
  item: {
    id: string
    title: string
    titleZh?: string
    artist: string
    artistId?: string
    price: number
    image: string
    size?: string
  }
}

export default function AddToCartButton({ item }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addItem({ ...item, quantity: 1 })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full py-4 bg-black text-white hover:bg-gray-800 transition"
    >
      {added ? "Added to cart" : "Add to cart"}
    </button>
  )
}
