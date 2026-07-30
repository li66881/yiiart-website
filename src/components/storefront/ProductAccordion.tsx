"use client"

import { useId, useState, type ReactNode } from "react"
import styles from "./storefront.module.css"

export type AccordionItem = {
  id: string
  title: string
  content: ReactNode
}

type Props = {
  items: AccordionItem[]
  defaultOpenId?: string
}

export default function ProductAccordion({ items, defaultOpenId }: Props) {
  const baseId = useId()
  const [openId, setOpenId] = useState(defaultOpenId || items[0]?.id || "")

  return (
    <div className={styles.accordion}>
      {items.map((item) => {
        const isOpen = openId === item.id
        const panelId = `${baseId}-${item.id}-panel`
        const buttonId = `${baseId}-${item.id}-button`
        return (
          <div key={item.id} className={styles.accordionItem}>
            <h3 className={styles.accordionHeading}>
              <button
                id={buttonId}
                type="button"
                className={styles.accordionTrigger}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? "" : item.id)}
              >
                <span>{item.title}</span>
                <span className={styles.accordionIcon} aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={styles.accordionPanel}
              hidden={!isOpen}
            >
              <div className={styles.accordionPanelInner}>{item.content}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
