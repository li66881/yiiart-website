import HeaderClient from "@/components/HeaderClient"
import { getCatalogNavigationState } from "@/lib/storefront/collection-catalog"

export default async function Header() {
  const navigationState = await getCatalogNavigationState()
  return <HeaderClient navigationState={navigationState} />
}
