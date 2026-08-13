type StickyPurchaseVisibility = {
  hasSelection: boolean
  mainActionPassed: boolean
  footerVisible: boolean
}

export function shouldShowStickyPurchase({
  hasSelection,
  mainActionPassed,
  footerVisible,
}: StickyPurchaseVisibility) {
  return hasSelection && mainActionPassed && !footerVisible
}
