import { handPaintedDisclosure } from "@/lib/storefront/visual-content"
import styles from "./storefront.module.css"

export default function ProductDisclosure({ productionModel }: { productionModel: string }) {
  const copy = handPaintedDisclosure(productionModel)
  return copy ? <p className={styles.productDisclosure}>{copy}</p> : null
}
