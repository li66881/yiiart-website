import { createHash, randomBytes } from "crypto"
import type Stripe from "stripe"
import { getSupabaseAdmin } from "@/lib/supabase-admin"
import type { CheckoutLineItem } from "@/lib/checkout"
import { markArtworksSold } from "@/lib/inventory"

export type PaymentProvider = "stripe" | "paypal" | "manual"
export type OrderStatus =
  | "pending_payment"
  | "payment_processing"
  | "paid"
  | "payment_failed"
  | "cancelled"
  | "fulfilled"
  | "refunded"
  | "disputed"

export type CheckoutAddress = {
  email: string
  name: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  notes?: string
}

type CreatePendingOrderInput = {
  provider: PaymentProvider
  items: CheckoutLineItem[]
  shippingAddress: unknown
  currency: string
  displayCurrency?: string
}

export type PublicOrder = {
  id: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: string
  fulfillmentStatus: string
  paymentProvider?: string | null
  providerCheckoutId?: string | null
  providerPaymentId?: string | null
  currency: string
  displayCurrency?: string | null
  subtotalAmount: number
  shippingAmount: number
  totalAmount: number
  customerEmail: string
  customerName: string
  customerPhone?: string | null
  shippingAddress: {
    address: string
    city: string
    postalCode: string
    country: string
    notes?: string | null
  }
  items: Array<{
    artworkId: string
    title: string
    artistName?: string | null
    imageUrl?: string | null
    quantity: number
    unitAmount: number
    totalAmount: number
    currency: string
  }>
  createdAt: string
  paidAt?: string | null
}

type OrderRow = {
  id: string
  order_number: string
  status: OrderStatus
  payment_status: string
  fulfillment_status: string
  payment_provider: string | null
  provider_checkout_id: string | null
  provider_payment_id: string | null
  currency: string
  display_currency: string | null
  subtotal_amount: number | string
  shipping_amount: number | string
  total_amount: number | string
  customer_email: string
  customer_name: string
  customer_phone: string | null
  shipping_address_line1: string
  shipping_city: string
  shipping_postal_code: string
  shipping_country: string
  customer_notes: string | null
  created_at: string
  paid_at: string | null
  order_items?: OrderItemRow[]
}

type OrderItemRow = {
  artwork_id: string
  title: string
  artist_name: string | null
  image_url: string | null
  quantity: number
  unit_amount: number | string
  total_amount: number | string
  currency: string
}

export async function createPendingOrder(input: CreatePendingOrderInput) {
  const supabase = getSupabaseAdmin()
  const address = normalizeCheckoutAddress(input.shippingAddress)
  const currency = input.currency.toUpperCase()
  const displayCurrency = input.displayCurrency?.trim().toUpperCase() || currency
  const subtotal = roundAmount(input.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const shipping = 0
  const total = roundAmount(subtotal + shipping)
  const now = new Date().toISOString()

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: createOrderNumber(),
      status: "pending_payment",
      payment_status: "pending",
      fulfillment_status: "unfulfilled",
      payment_provider: input.provider,
      currency,
      display_currency: displayCurrency,
      subtotal_amount: subtotal,
      shipping_amount: shipping,
      total_amount: total,
      customer_email: address.email,
      customer_name: address.name,
      customer_phone: address.phone,
      shipping_address_line1: address.address,
      shipping_city: address.city,
      shipping_postal_code: address.postalCode,
      shipping_country: address.country,
      customer_notes: address.notes || null,
      metadata: {
        address_hash: createHash("sha256").update(JSON.stringify(address)).digest("hex"),
        created_by: "yiiart-checkout",
      },
      created_at: now,
    })
    .select("*")
    .single()

  if (orderError || !order) {
    throw new Error(orderError?.message || "Could not create order.")
  }

  const itemRows = input.items.map((item) => ({
    order_id: order.id,
    artwork_id: item.id,
    title: item.title,
    artist_name: item.artistName || null,
    image_url: item.image || null,
    quantity: item.quantity,
    unit_amount: roundAmount(item.price),
    total_amount: roundAmount(item.price * item.quantity),
    currency,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(itemRows)
  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id)
    throw new Error(itemsError.message || "Could not create order items.")
  }

  return {
    id: order.id as string,
    orderNumber: order.order_number as string,
    total,
    currency,
    address,
  }
}

export async function attachStripeCheckoutToOrder(orderId: string, session: Stripe.Checkout.Session) {
  const supabase = getSupabaseAdmin()
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id

  const { error } = await supabase
    .from("orders")
    .update({
      provider_checkout_id: session.id,
      provider_payment_id: paymentIntent || null,
      payment_status: "payment_processing",
      status: "payment_processing",
    })
    .eq("id", orderId)

  if (error) throw new Error(error.message)
}

export async function attachPayPalOrderToOrder(orderId: string, paypalOrderId: string) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("orders")
    .update({
      provider_checkout_id: paypalOrderId,
      payment_status: "payment_processing",
      status: "payment_processing",
    })
    .eq("id", orderId)

  if (error) throw new Error(error.message)
}

export async function recordPaymentEvent(input: {
  provider: PaymentProvider
  eventId: string
  eventType: string
  orderId?: string | null
  payload: unknown
}) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from("payment_events").insert({
    provider: input.provider,
    event_id: input.eventId,
    event_type: input.eventType,
    order_id: input.orderId || null,
    payload: input.payload,
  })

  if (!error) return true
  if (error.code === "23505") return false
  throw new Error(error.message)
}

export async function markOrderPaid(input: {
  orderId: string
  provider: PaymentProvider
  providerCheckoutId?: string | null
  providerPaymentId?: string | null
}) {
  const supabase = getSupabaseAdmin()
  const now = new Date().toISOString()
  const { error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      payment_provider: input.provider,
      provider_checkout_id: input.providerCheckoutId || undefined,
      provider_payment_id: input.providerPaymentId || undefined,
      paid_at: now,
    })
    .eq("id", input.orderId)

  if (error) throw new Error(error.message)

  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("order_number, order_items(artwork_id)")
    .eq("id", input.orderId)
    .maybeSingle()

  if (readError) throw new Error(readError.message)

  try {
    const artworkIds = ((order as { order_items?: Array<{ artwork_id?: string }> } | null)?.order_items || [])
      .map((item) => item.artwork_id)
      .filter((id): id is string => Boolean(id))
    const orderNumber = (order as { order_number?: string } | null)?.order_number || input.orderId
    await markArtworksSold(artworkIds, orderNumber)
  } catch (inventoryError) {
    console.error("Failed to mark artworks sold:", inventoryError)
  }
}

export async function markOrderPaymentFailed(orderId: string) {
  await updateOrderStatus(orderId, "payment_failed", "failed")
}

export async function markOrderCancelled(orderId: string) {
  await updateOrderStatus(orderId, "cancelled", "cancelled", { cancelled_at: new Date().toISOString() })
}

export async function markOrderRefunded(orderId: string) {
  await updateOrderStatus(orderId, "refunded", "refunded", { refunded_at: new Date().toISOString() })
}

export async function markOrderDisputed(orderId: string) {
  await updateOrderStatus(orderId, "disputed", "disputed", { disputed_at: new Date().toISOString() })
}

export async function findOrderByProviderCheckout(provider: PaymentProvider, providerCheckoutId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelection)
    .eq("payment_provider", provider)
    .eq("provider_checkout_id", providerCheckoutId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? serializeOrder(data as OrderRow) : null
}

export async function findOrderByProviderPayment(provider: PaymentProvider, providerPaymentId: string) {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelection)
    .eq("payment_provider", provider)
    .eq("provider_payment_id", providerPaymentId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data ? serializeOrder(data as OrderRow) : null
}

export async function listOrdersByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return []

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelection)
    .eq("customer_email", normalizedEmail)
    .order("created_at", { ascending: false })
    .limit(25)

  if (error) throw new Error(error.message)
  return (data || []).map((order) => serializeOrder(order as OrderRow))
}

export async function findOrderByNumber(orderNumber: string, email?: string) {
  const supabase = getSupabaseAdmin()
  let query = supabase
    .from("orders")
    .select(orderSelection)
    .eq("order_number", orderNumber.trim())

  const normalizedEmail = normalizeEmail(email || "")
  if (normalizedEmail) query = query.eq("customer_email", normalizedEmail)

  const { data, error } = await query.maybeSingle()
  if (error) throw new Error(error.message)
  return data ? serializeOrder(data as OrderRow) : null
}

export function normalizeCheckoutAddress(value: unknown): CheckoutAddress {
  if (!value || typeof value !== "object") {
    throw new Error("Shipping information is required.")
  }

  const source = value as Record<string, unknown>
  const address = {
    email: normalizeEmail(stringValue(source.email)),
    name: stringValue(source.name),
    phone: stringValue(source.phone),
    address: stringValue(source.address),
    city: stringValue(source.city),
    postalCode: stringValue(source.postalCode),
    country: normalizeCountry(stringValue(source.country)),
    notes: stringValue(source.notes),
  }

  if (!isValidEmail(address.email)) throw new Error("A valid email address is required.")
  if (!address.name) throw new Error("Full name is required.")
  if (!address.phone) throw new Error("Phone number is required.")
  if (!address.address) throw new Error("Shipping address is required.")
  if (!address.city) throw new Error("City is required.")
  if (!address.postalCode) throw new Error("Postal code is required.")
  if (!address.country) throw new Error("Country is required.")
  if (!/^[A-Z]{2}$/.test(address.country)) throw new Error("Country must be a two-letter ISO code.")

  return address
}

function serializeOrder(order: OrderRow): PublicOrder {
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
    paymentProvider: order.payment_provider,
    providerCheckoutId: order.provider_checkout_id,
    providerPaymentId: order.provider_payment_id,
    currency: order.currency,
    displayCurrency: order.display_currency,
    subtotalAmount: Number(order.subtotal_amount),
    shippingAmount: Number(order.shipping_amount),
    totalAmount: Number(order.total_amount),
    customerEmail: order.customer_email,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    shippingAddress: {
      address: order.shipping_address_line1,
      city: order.shipping_city,
      postalCode: order.shipping_postal_code,
      country: order.shipping_country,
      notes: order.customer_notes,
    },
    items: (order.order_items || []).map((item) => ({
      artworkId: item.artwork_id,
      title: item.title,
      artistName: item.artist_name,
      imageUrl: item.image_url,
      quantity: item.quantity,
      unitAmount: Number(item.unit_amount),
      totalAmount: Number(item.total_amount),
      currency: item.currency,
    })),
    createdAt: order.created_at,
    paidAt: order.paid_at,
  }
}

async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus: string,
  extra: Record<string, unknown> = {}
) {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from("orders")
    .update({
      status,
      payment_status: paymentStatus,
      ...extra,
    })
    .eq("id", orderId)

  if (error) throw new Error(error.message)
}

function createOrderNumber() {
  const date = new Date()
  const stamp = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("")
  return `YA-${stamp}-${randomBytes(3).toString("hex").toUpperCase()}`
}

function roundAmount(amount: number) {
  return Math.round(amount * 100) / 100
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function normalizeCountry(value: string) {
  return value.trim().toUpperCase()
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const orderSelection = `
  *,
  order_items(
    artwork_id,
    title,
    artist_name,
    image_url,
    quantity,
    unit_amount,
    total_amount,
    currency
  )
`
