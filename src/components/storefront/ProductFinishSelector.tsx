"use client"

import Image from "next/image"
import { PriceText } from "@/components/PriceText"
import type { NormalizedFinishOption } from "@/lib/storefront/finish-options"
import { buildProductFinishSelectorViewModel } from "@/lib/storefront/finish-selector"
import styles from "./storefront.module.css"

type Props = {
  finishes: NormalizedFinishOption[]
  rolledPriceCny: number
  selectedId: string
  onChange: (finishId: string) => void
}

export function ProductFinishSelector({
  finishes,
  rolledPriceCny,
  selectedId,
  onChange,
}: Props) {
  const viewModel = buildProductFinishSelectorViewModel(finishes, rolledPriceCny, selectedId)

  return (
    <fieldset className={`${styles.options} ${styles.finishSelector}`}>
      <legend>Choose a presentation</legend>
      <div className={styles.finishGrid}>
        {viewModel.choices.map((finish) => (
          <label
            key={finish.id}
            className={`${styles.finishChoice} ${finish.selected ? styles.finishChoiceSelected : ""}`}
            data-selected={finish.selected}
          >
            <input
              className={styles.finishRadio}
              type="radio"
              name="product-finish"
              value={finish.id}
              checked={finish.selected}
              onChange={() => onChange(finish.id)}
            />
            <span className={styles.finishControl}>
              <span className={styles.finishThumbnail}>
                <Image
                  src={finish.assetSrc}
                  alt=""
                  width={88}
                  height={88}
                  sizes="88px"
                />
              </span>
              <span className={styles.finishName}>{finish.label}</span>
              {finish.priceDeltaCny !== null ? (
                <span className={styles.finishPrice}>
                  +<PriceText amountCny={finish.priceDeltaCny} />
                </span>
              ) : null}
            </span>
          </label>
        ))}
      </div>
      <p className={styles.finishSelection} aria-live="polite">
        Selected: <strong>{viewModel.selectedLabel}</strong>
      </p>
      <details className={styles.finishDetails}>
        <summary>Framing details</summary>
        <p>
          Rolled canvas ships without stretcher bars. Stretched and framed presentations arrive ready to hang.
        </p>
      </details>
    </fieldset>
  )
}
