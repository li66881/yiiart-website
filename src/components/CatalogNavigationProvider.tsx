"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { CatalogNavigationState } from "@/lib/storefront/catalog-navigation"

const emptyCatalogNavigationState: CatalogNavigationState = {
  visibleCollectionSlugs: [],
  visibleCategories: [],
}

const CatalogNavigationContext = createContext<CatalogNavigationState>(emptyCatalogNavigationState)

export default function CatalogNavigationProvider({
  navigationState,
  children,
}: {
  navigationState: CatalogNavigationState
  children: ReactNode
}) {
  return (
    <CatalogNavigationContext.Provider value={navigationState}>
      {children}
    </CatalogNavigationContext.Provider>
  )
}

export function useCatalogNavigationState() {
  return useContext(CatalogNavigationContext)
}
