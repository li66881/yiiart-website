import {
  resolveFinishDeltaCny,
  type NormalizedFinishOption,
} from "./finish-options"

export const finishThumbnailImageProps = {
  loading: "eager",
  unoptimized: true,
} as const

export type ProductFinishSelectorChoice = NormalizedFinishOption & {
  selected: boolean
  priceDeltaCny: number | null
  shortLabel: string
  headingLabel: string
}

export const finishFamilyHeading = "Rolled Canvas/Frameless/Framed"

export type ProductFinishSelectorViewModel = {
  selectedLabel: string
  groupLabel: string
  headingSelection: string
  familyHeading: string
  choices: ProductFinishSelectorChoice[]
}

export function shortFinishLabel(id: string, label: string) {
  const value = `${id} ${label}`.toLowerCase()
  if (value.includes("rolled")) return "Rolled"
  if (value.includes("stretch") || value.includes("frameless") || value.includes("gallery")) return "Frameless"
  if (value.includes("gold")) return "Gold"
  if (value.includes("silver")) return "Silver"
  if (value.includes("white")) return "White"
  if (value.includes("black")) return "Black"
  if (value.includes("wood") || value.includes("natural") || value.includes("oak")) return "Wood"
  return label.replace(/float frame/i, "").replace(/canvas/i, "").trim() || label
}

export function finishGroupLabel(id: string, label: string) {
  const value = `${id} ${label}`.toLowerCase()
  if (value.includes("rolled") || value.includes("stretch") || value.includes("frameless") || value.includes("gallery")) {
    return "Finish"
  }
  return "Floating Frame"
}

export function finishHeadingSelection(id: string, label: string) {
  const value = `${id} ${label}`.toLowerCase()
  if (value.includes("rolled")) return "Rolled Canvas"
  if (value.includes("gold")) return "Stretch + Gold Frame"
  if (value.includes("silver")) return "Stretch + Silver Frame"
  if (value.includes("white")) return "Stretch + White Frame"
  if (value.includes("black")) return "Stretch + Black Frame"
  if (value.includes("wood") || value.includes("natural") || value.includes("oak")) return "Stretch + Wood Frame"
  if (value.includes("stretch") || value.includes("frameless") || value.includes("gallery")) return "Frameless"
  return label
}

export function buildProductFinishSelectorViewModel(
  finishes: NormalizedFinishOption[],
  rolledPriceCny: number,
  selectedId: string,
): ProductFinishSelectorViewModel {
  const selectedFinish = finishes.find((finish) => finish.id === selectedId) || finishes[0]

  return {
    selectedLabel: selectedFinish?.label || "",
    groupLabel: finishGroupLabel(selectedFinish?.id || "", selectedFinish?.label || ""),
    familyHeading: finishFamilyHeading,
    headingSelection: finishHeadingSelection(selectedFinish?.id || "", selectedFinish?.label || ""),
    choices: finishes.map((finish) => {
      const priceDeltaCny = resolveFinishDeltaCny(finish, rolledPriceCny)

      return {
        ...finish,
        selected: finish.id === selectedFinish?.id,
        shortLabel: shortFinishLabel(finish.id, finish.label),
        headingLabel: finishHeadingSelection(finish.id, finish.label),
        priceDeltaCny: priceDeltaCny > 0 ? priceDeltaCny : null,
      }
    }),
  }
}
