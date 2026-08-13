type MainActionPosition = {
  isIntersecting: boolean
  top: number
}

type StickyPurchaseVisibility = {
  hasSelection: boolean
  actionVisible: boolean
  footerVisible: boolean
}

export type StickyPurchaseBodyTarget = {
  dataset: {
    stickyPurchaseVisible?: string
  }
}

export function clearStickyPurchaseBodyState(target: StickyPurchaseBodyTarget) {
  delete target.dataset.stickyPurchaseVisible
}

export function applyStickyPurchaseBodyState(target: StickyPurchaseBodyTarget) {
  target.dataset.stickyPurchaseVisible = "true"
  return () => clearStickyPurchaseBodyState(target)
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
