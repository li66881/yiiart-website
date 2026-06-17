import { createHash, randomBytes } from "crypto"
import type Stripe from "stripe"
import { getOrderSql } from "@/lib/order-storage"
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
  created_at: string | Date
  paid_at: string | Date | null
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
  const sql = getOrderSql()
  const address = normalizeCheckoutAddress(input.shippingAddress)
  const currency = input.currency.toUpperCase()
  const displayCurrency = input.displayCurrency?.trim().toUpperCase() || currency
  const subtotal = roundAmount(input.items.reduce((sum, item) => sum + item.price * item.quantity, 0))
  const shipping = 0
  const total = roundAmount(subtotal + shipping)
  const now = new Date().toISOString()
  const metadata = JSON.stringify({
    address_hash: createHash("sha256").update(JSON.stringify(address)).digest("hex"),
    created_by: "yiiart-checkout",
  })

  const orderRows = (await sql`
    insert into orders (
      order_number,
      status,
      payment_status,
      fulfillment_status,
      payment_provider,
      currency,
      display_currency,
      subtotal_amount,
      shipping_amount,
      total_amount,
      customer_email,
      customer_name,
      customer_phone,
      shipping_address_line1,
      shipping_city,
      shipping_postal_code,
      shipping_country,
      customer_notes,
      metadata,
      created_at
    )
    values (
      ${createOrderNumber()},
      ${"pending_payment"},
      ${"pending"},
      ${"unfulfilled"},
      ${input.provider},
      ${currency},
      ${displayCurrency},
      ${subtotal},
      ${shipping},
      ${total},
      ${address.email},
      ${address.name},
      ${address.phone},
      ${address.address},
      ${address.city},
      ${address.postalCode},
      ${address.country},
      ${address.notes || null},
      ${metadata}::jsonb,
      ${now}::timestamptz
    )
    returning *
  `) as OrderRow[]
  const order = orderRows[0]

  if (!order) {
    throw new Error("Could not create order.")
  }

  try {
    for (const item of input.items) {
      await sql`
        insert into order_items (
          order_id,
          artwork_id,
          title,
          artist_name,
          image_url,
          quantity,
          unit_amount,
          total_amount,
          currency
        )
        values (
          ${order.id},
          ${item.id},
          ${item.title},
          ${item.artistName || null},
          ${item.image || null},
          ${item.quantity},
          ${roundAmount(item.price)},
          ${roundAmount(item.price * item.quantity)},
          ${currency}
        )
      `
    }
  } catch (error) {
    await sql`delete from orders where id = ${order.id}`
    throw error
  }

  return {
    id: order.id,
    orderNumber: order.order_number,
    total,
    currency,
    address,
  }
}

export async function attachStripeCheckoutToOrder(orderId: string, session: Stripe.Checkout.Session) {
  const sql = getOrderSql()
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id

  await sql`
    update orders
    set
      provider_checkout_id = ${session.id},
      provider_payment_id = ${paymentIntent || null},
      payment_status = ${"payment_processing"},
      status = ${"payment_processing"}
    where id = ${orderId}
  `
}

export async function attachPayPalOrderToOrder(orderId: string, paypalOrderId: string) {
  const sql = getOrderSql()

  await sql`
    update orders
    set
      provider_checkout_id = ${paypalOrderId},
      payment_status = ${"payment_processing"},
      status = ${"payment_processing"}
    where id = ${orderId}
  `
}

export async function recordPaymentEvent(input: {
  provider: PaymentProvider
  eventId: string
  eventType: string
  orderId?: string | null
  payload: unknown
}) {
  const sql = getOrderSql()

  try {
    await sql`
      insert into payment_events (
        provider,
        event_id,
        event_type,
        order_id,
        payload
      )
      values (
        ${input.provider},
        ${input.eventId},
        ${input.eventType},
        ${input.orderId || null},
        ${JSON.stringify(input.payload)}::jsonb
      )
    `
    return true
  } catch (error) {
    if (isUniqueViolation(error)) return false
    throw error
  }
}

export async function markOrderPaid(input: {
  orderId: string
  provider: PaymentProvider
  providerCheckoutId?: string | null
  providerPaymentId?: string | null
}) {
  const sql = getOrderSql()
  const now = new Date().toISOString()

  await sql`
    update orders
    set
      status = ${"paid"},
      payment_status = ${"paid"},
      payment_provider = ${input.provider},
      provider_checkout_id = coalesce(${input.providerCheckoutId || null}, provider_checkout_id),
      provider_payment_id = coalesce(${input.providerPaymentId || null}, provider_payment_id),
      paid_at = ${now}::timestamptz
    where id = ${input.orderId}
  `

  const orderRows = (await sql`
    select order_number
    from orders
    where id = ${input.orderId}
    limit 1
  `) as Array<{ order_number?: string }>
  const orderItems = await getOrderItems(input.orderId)

  try {
    const artworkIds = orderItems
      .map((item) => item.artwork_id)
      .filter((id): id is string => Boolean(id))
    const orderNumber = orderRows[0]?.order_number || input.orderId
    await markArtworksSold(artworkIds, orderNumber)
  } catch (inventoryError) {
    console.error("Failed to mark artworks sold:", inventoryError)
  }
}

export async function markOrderPaymentFailed(orderId: string) {
  await updateOrderStatus(orderId, "payment_failed", "failed")
}

export async function markOrderCancelled(orderId: string) {
  await updateOrderStatus(orderId, "cancelled", "cancelled", "cancelled_at")
}

export async function markOrderRefunded(orderId: string) {
  await updateOrderStatus(orderId, "refunded", "refunded", "refunded_at")
}

export async function markOrderDisputed(orderId: string) {
  await updateOrderStatus(orderId, "disputed", "disputed", "disputed_at")
}

export async function findOrderByProviderCheckout(provider: PaymentProvider, providerCheckoutId: string) {
  const sql = getOrderSql()
  const rows = (await sql`
    select *
    from orders
    where payment_provider = ${provider}
      and provider_checkout_id = ${providerCheckoutId}
    limit 1
  `) as OrderRow[]

  return rows[0] ? serializeOrder(rows[0], await getOrderItems(rows[0].id)) : null
}

export async function findOrderByProviderPayment(provider: PaymentProvider, providerPaymentId: string) {
  const sql = getOrderSql()
  const rows = (await sql`
    select *
    from orders
    where payment_provider = ${provider}
      and provider_payment_id = ${providerPaymentId}
    limit 1
  `) as OrderRow[]

  return rows[0] ? serializeOrder(rows[0], await getOrderItems(rows[0].id)) : null
}

export async function listOrdersByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return []

  const sql = getOrderSql()
  const rows = (await sql`
    select *
    from orders
    where customer_email = ${normalizedEmail}
    order by created_at desc
    limit 25
  `) as OrderRow[]

  const orders = await Promise.all(rows.map(async (order) => (
    serializeOrder(order, await getOrderItems(order.id))
  )))

  return orders
}

export async function findOrderByNumber(orderNumber: string, email?: string) {
  const sql = getOrderSql()
  const normalizedEmail = normalizeEmail(email || "")
  const rows = normalizedEmail
    ? (await sql`
        select *
        from orders
        where order_number = ${orderNumber.trim()}
          and customer_email = ${normalizedEmail}
        limit 1
      `) as OrderRow[]
    : (await sql`
        select *
        from orders
        where order_number = ${orderNumber.trim()}
        limit 1
      `) as OrderRow[]

  return rows[0] ? serializeOrder(rows[0], await getOrderItems(rows[0].id)) : null
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

async function getOrderItems(orderId: string) {
  const sql = getOrderSql()
  return (await sql`
    select
      artwork_id,
      title,
      artist_name,
      image_url,
      quantity,
      unit_amount,
      total_amount,
      currency
    from order_items
    where order_id = ${orderId}
    order by created_at asc
  `) as OrderItemRow[]
}

function serializeOrder(order: OrderRow, items: OrderItemRow[]): PublicOrder {
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
    items: items.map((item) => ({
      artworkId: item.artwork_id,
      title: item.title,
      artistName: item.artist_name,
      imageUrl: item.image_url,
      quantity: item.quantity,
      unitAmount: Number(item.unit_amount),
      totalAmount: Number(item.total_amount),
      currency: item.currency,
    })),
    createdAt: dateValue(order.created_at),
    paidAt: order.paid_at ? dateValue(order.paid_at) : null,
  }
}

async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  paymentStatus: string,
  timestampColumn?: "cancelled_at" | "refunded_at" | "disputed_at"
) {
  const sql = getOrderSql()
  const now = new Date().toISOString()

  if (timestampColumn === "cancelled_at") {
    await sql`
      update orders
      set status = ${status}, payment_status = ${paymentStatus}, cancelled_at = ${now}::timestamptz
      where id = ${orderId}
    `
    return
  }

  if (timestampColumn === "refunded_at") {
    await sql`
      update orders
      set status = ${status}, payment_status = ${paymentStatus}, refunded_at = ${now}::timestamptz
      where id = ${orderId}
    `
    return
  }

  if (timestampColumn === "disputed_at") {
    await sql`
      update orders
      set status = ${status}, payment_status = ${paymentStatus}, disputed_at = ${now}::timestamptz
      where id = ${orderId}
    `
    return
  }

  await sql`
    update orders
    set status = ${status}, payment_status = ${paymentStatus}
    where id = ${orderId}
  `
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

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && (error as { code?: string }).code === "23505")
}

function dateValue(value: string | Date) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString()
}
