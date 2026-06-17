import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

type OrderSql = NeonQueryFunction<false, false>

let orderSql: OrderSql | null = null

export function getOrderDatabaseUrl() {
  return process.env.DATABASE_URL
    || process.env.POSTGRES_URL
    || process.env.POSTGRES_PRISMA_URL
    || ""
}

export function isOrderStorageConfigured() {
  return Boolean(getOrderDatabaseUrl())
}

export function getOrderStorageProvider() {
  return isOrderStorageConfigured() ? "postgres" : "none"
}

export function getOrderSql() {
  const databaseUrl = getOrderDatabaseUrl()

  if (!databaseUrl) {
    throw new Error("Postgres order storage is not configured. Set DATABASE_URL first.")
  }

  if (!orderSql) {
    orderSql = neon(databaseUrl)
  }

  return orderSql
}
