export type CartProductionModel = "hand_painted_to_order" | "original"

export type CartItem = {
  key: string
  id: string
  slug?: string
  title: string
  titleZh?: string
  artist: string
  artistId?: string
  price: number
  image: string
  quantity: number
  productionModel: CartProductionModel
  sizeId?: string
  sizeLabel?: string
  finishId?: string
  finishLabel?: string
  size?: string
}

export type CartItemInput = Omit<CartItem, "key"> & { key?: string }

export function cartLineKey(input: Pick<CartItemInput, "id"> & Partial<Pick<CartItemInput, "sizeId" | "finishId">>) {
  const id = text(input.id)
  const sizeId = text(input.sizeId)
  const finishId = text(input.finishId)
  if (!sizeId && !finishId) return id
  return [id, sizeId || "default", finishId || "default"].join(":")
}

export function normalizeStoredCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const normalized = normalizeCartItem(item)
    return normalized ? [normalized] : []
  })
}

export function addCartItem(items: CartItem[], input: CartItemInput) {
  const next = normalizeCartItem(input)
  if (!next) return items

  const existing = items.find((item) => item.key === next.key)
  if (!existing) return [...items, next]

  return items.map((item) => item.key === next.key
    ? {
        ...item,
        ...next,
        quantity: item.productionModel === "original"
          ? 1
          : clampQuantity(item.quantity + next.quantity),
      }
    : item)
}

export function removeCartItem(items: CartItem[], key: string) {
  return items.filter((item) => item.key !== key)
}

export function updateCartQuantity(items: CartItem[], key: string, quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) return removeCartItem(items, key)
  return items.map((item) => item.key === key
    ? { ...item, quantity: item.productionModel === "original" ? 1 : clampQuantity(quantity) }
    : item)
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null
  const item = value as Partial<CartItem>
  const id = text(item.id)
  const title = text(item.title)
  const price = number(item.price)
  if (!id || !title || !price || price <= 0) return null

  const productionModel: CartProductionModel = item.productionModel === "hand_painted_to_order"
    ? "hand_painted_to_order"
    : "original"
  const sizeId = text(item.sizeId) || undefined
  const finishId = text(item.finishId) || undefined
  const sizeLabel = text(item.sizeLabel) || text(item.size) || undefined
  const input: CartItemInput = {
    id,
    slug: text(item.slug) || undefined,
    title,
    titleZh: text(item.titleZh) || undefined,
    artist: text(item.artist) || "YiiArt Studio",
    artistId: text(item.artistId) || undefined,
    price,
    image: text(item.image),
    quantity: productionModel === "original" ? 1 : clampQuantity(number(item.quantity) || 1),
    productionModel,
    sizeId,
    sizeLabel,
    finishId,
    finishLabel: text(item.finishLabel) || undefined,
    size: sizeLabel,
  }

  return {
    ...input,
    key: text(item.key) || cartLineKey(input),
  }
}

function clampQuantity(value: number) {
  return Math.min(99, Math.max(1, Math.floor(value)))
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function number(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
