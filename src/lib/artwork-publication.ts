export type ArtworkPublicationRecord = {
  collectionType?: string | null
  rightsStatus?: string | null
  migrationStatus?: string | null
}

export const PUBLIC_ARTWORK_GROQ_FILTER = `(
  !defined(collectionType) ||
  collectionType != "new_collection" ||
  (rightsStatus == "approved" && migrationStatus == "ready")
)`

export function isArtworkPubliclyVisible(record: ArtworkPublicationRecord) {
  if (record.collectionType !== "new_collection") return true
  return record.rightsStatus === "approved" && record.migrationStatus === "ready"
}
