"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import {
  addCartItem,
  normalizeStoredCart,
  removeCartItem,
  updateCartQuantity,
  type CartItem,
  type CartItemInput,
} from "@/lib/cart/cart"

export type { CartItem, CartItemInput } from "@/lib/cart/cart"

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItemInput) => void
  removeItem: (key: string) => void
  updateQuantity: (key: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  ready: boolean
  cartOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load from localStorage
    const saved = localStorage.getItem("yiiart-cart")
    if (saved) {
      try {
        setItems(normalizeStoredCart(JSON.parse(saved)))
      } catch (e) {
        console.error("Failed to load cart", e)
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("yiiart-cart", JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = (item: CartItemInput) => {
    setItems((current) => addCartItem(current, item))
    setCartOpen(true)
  }

  const removeItem = (key: string) => setItems((current) => removeCartItem(current, key))

  const updateQuantity = (key: string, quantity: number) => {
    setItems((current) => updateCartQuantity(current, key, quantity))
  }

  const clearCart = () => setItems([])

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const openCart = () => setCartOpen(true)
  const closeCart = () => setCartOpen(false)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, ready: mounted, cartOpen, openCart, closeCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
