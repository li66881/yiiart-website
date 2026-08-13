"use client"

import { useId, useState } from "react"
import styles from "./storefront.module.css"

type Props = {
  description: string
}

const DESCRIPTION_EXPANSION_THRESHOLD = 140

export default function ProductDescription({ description }: Props) {
  const descriptionId = useId()
  const [expanded, setExpanded] = useState(false)
  const canExpand = description.trim().length > DESCRIPTION_EXPANSION_THRESHOLD
  const visiblyExpanded = !canExpand || expanded

  return (
    <>
      <p
        id={descriptionId}
        className={styles.description}
        data-expanded={visiblyExpanded}
      >
        {description}
      </p>
      {canExpand ? (
        <button
          type="button"
          className={styles.descriptionToggle}
          aria-expanded={expanded}
          aria-controls={descriptionId}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}
    </>
  )
}
