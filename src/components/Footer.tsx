import FooterClient from "@/components/FooterClient"
import { getCatalogNavigationState } from "@/lib/storefront/collection-catalog"

export default async function Footer() {
  const navigationState = await getCatalogNavigationState()
  return <FooterClient navigationState={navigationState} />
}
