"use client"

import FooterClient from "@/components/FooterClient"
import { useCatalogNavigationState } from "@/components/CatalogNavigationProvider"

export default function Footer() {
  const navigationState = useCatalogNavigationState()
  return <FooterClient navigationState={navigationState} />
}
