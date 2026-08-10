import { filterCatalogLinks, type CatalogNavigationState } from "./catalog-navigation"
import { headerNavigationGroups } from "./editorial-presentation"

type NavigationLink = { href: string }

export function getHeaderNavigationModel<Link extends NavigationLink>(links: readonly Link[], state: CatalogNavigationState) {
  const visibleLinks = filterCatalogLinks(links, state)
  return {
    ...headerNavigationGroups(visibleLinks),
    mobile: visibleLinks,
  }
}

export function getFooterNavigationModel<ShopLink extends NavigationLink, SupportLink extends NavigationLink>(
  shopLinks: readonly ShopLink[],
  supportLinks: readonly SupportLink[],
  state: CatalogNavigationState,
) {
  return {
    shop: filterCatalogLinks(shopLinks, state),
    support: supportLinks,
  }
}
