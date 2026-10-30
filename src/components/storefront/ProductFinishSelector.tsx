"use client"

import Image from "next/image"
import { PriceText } from "@/components/PriceText"
import type { NormalizedFinishOption } from "@/lib/storefront/finish-options"
import {
  buildProductFinishSelectorViewModel,
  finishThumbnailImageProps,
  getFinishThumbnailSrc,
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
                  src={getFinishThumbnailSrc(finish.assetSrc)}
                  alt=""
                  width={88}
                  height={88}
                  sizes="88px"
                  {...finishThumbnailImageProps}
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
      <p className={styles.finishSelection}>
        {finishDeliveryDescription(viewModel.choices.find((choice) => choice.selected)?.id)}
      </p>
      <details className={styles.finishDetails}>
        <summary>Framing details</summary>
        <p>
          The listed finish is rolled canvas: unmounted, without stretcher bars, and shipped in a protective tube. Stretched canvas is attached to stretcher bars without an outer frame. A float frame is fitted around the stretched canvas. Requests for stretched or framed delivery require confirmation of size, destination, packaging, and carrier suitability before ordering.
        </p>
      </details>
    </fieldset>
  )
}

function finishDeliveryDescription(finishId?: string) {
  if (finishId === "rolled") {
    return "Ships rolled without stretcher bars. Carrier transit and delivery format depend on the destination and size."
  }
  if (finishId === "stretched") {
    return "Mounted on stretcher bars, with no outer frame. Contact YiiArt to confirm destination and carrier suitability before payment."
  }
  if (finishId?.endsWith("-frame")) {
    return "Mounted on stretcher bars and fitted with a float frame. Contact YiiArt to confirm destination and carrier suitability before payment."
  }
  return "The selected presentation and delivery route are confirmed before payment."
}
