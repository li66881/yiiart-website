type MainActionPosition = {
  isIntersecting: boolean
  top: number
}

type StickyPurchaseVisibility = {
  hasSelection: boolean
  actionVisible: boolean
  footerVisible: boolean
}

export function mainActionBlocksSticky(position: MainActionPosition) {
  return position.isIntersecting || position.top >= 0
}

export function shouldShowStickyPurchase({
  hasSelection,
  actionVisible,
  footerVisible,
}: StickyPurchaseVisibility) {
  return hasSelection && !actionVisible && !footerVisible
}
