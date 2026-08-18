"use client"

import Image from "next/image"
import type { NormalizedFinishOption } from "@/lib/storefront/finish-options"
import {
  buildProductFinishSelectorViewModel,
  finishThumbnailImageProps,
} from "@/lib/storefront/finish-selector"
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
      <p className={styles.optionHeading} aria-live="polite">
        {viewModel.familyHeading}: <strong>{viewModel.headingSelection}</strong>
      </p>
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
              aria-label={finish.label}
              onChange={() => onChange(finish.id)}
            />
            <span className={styles.finishControl}>
              <span className={styles.finishThumbnail}>
                <Image
                  src={finish.assetSrc}
                  alt=""
                  width={60}
                  height={60}
                  sizes="60px"
                  {...finishThumbnailImageProps}
                />
              </span>
              <span className={styles.finishTooltip}>{finish.headingLabel}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
