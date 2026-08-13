import {
  resolveFinishDeltaCny,
  type NormalizedFinishOption,
} from "./finish-options"

export type ProductFinishSelectorChoice = NormalizedFinishOption & {
  selected: boolean
  priceDeltaCny: number | null
}

export type ProductFinishSelectorViewModel = {
  selectedLabel: string
  choices: ProductFinishSelectorChoice[]
}

export function buildProductFinishSelectorViewModel(
  finishes: NormalizedFinishOption[],
  rolledPriceCny: number,
  selectedId: string,
): ProductFinishSelectorViewModel {
  const selectedFinish = finishes.find((finish) => finish.id === selectedId) || finishes[0]

  return {
    selectedLabel: selectedFinish?.label || "",
    choices: finishes.map((finish) => {
      const priceDeltaCny = resolveFinishDeltaCny(finish, rolledPriceCny)

      return {
        ...finish,
        selected: finish.id === selectedFinish?.id,
        priceDeltaCny: priceDeltaCny > 0 ? priceDeltaCny : null,
      }
    }),
  }
}
