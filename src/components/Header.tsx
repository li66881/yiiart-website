"use client"

import HeaderClient from "@/components/HeaderClient"
import { useCatalogNavigationState } from "@/components/CatalogNavigationProvider"

export default function Header() {
  const navigationState = useCatalogNavigationState()
  return <HeaderClient navigationState={navigationState} />
}
