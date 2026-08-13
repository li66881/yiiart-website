export function purchaseTrustLabel(madeToOrder: boolean) {
  return madeToOrder ? "Hand-painted to order" : "Original artwork"
}

export function bindPurchaseAction(action: () => void) {
  return {
    main: action,
    sticky: action,
  }
}
