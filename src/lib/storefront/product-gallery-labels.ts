import {
  productMediaRoleLabels,
  type ProductMediaRole,
} from "../artwork-media"

export type ProductGalleryLabelModel = {
  visibleLabel: string
  thumbnailLabels: string[]
}

export function buildProductGalleryLabelModel(
  roles: ProductMediaRole[],
  selectedIndex: number,
): ProductGalleryLabelModel {
  const roleCounts = new Map<ProductMediaRole, number>()
  for (const role of roles) {
    roleCounts.set(role, (roleCounts.get(role) || 0) + 1)
  }

  const selectedRole = roles[selectedIndex] || roles[0]
  return {
    visibleLabel: selectedRole ? productMediaRoleLabels[selectedRole] : "",
    thumbnailLabels: roles.map((role, index) => {
      const roleLabel = productMediaRoleLabels[role].toLowerCase()
      const position = roleCounts.get(role)! > 1 ? `, view ${index + 1}` : ""
      return `Show ${roleLabel}${position}`
    }),
  }
}
