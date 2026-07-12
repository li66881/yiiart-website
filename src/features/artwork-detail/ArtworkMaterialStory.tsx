import type { ArtworkGalleryItem } from "./model"

export default function ArtworkMaterialStory({
  items,
  heading,
}: {
  items: ArtworkGalleryItem[]
  heading: string
}) {
  const detailItems = items
    .filter((item) => item.role === "texture" || item.role === "edge")
    .slice(0, 2)

  if (detailItems.length < 2) return null

  return (
    <section className="grid gap-8 border-t border-[#ded8ce] py-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">
      <h2 className="max-w-sm font-serif text-4xl font-light leading-tight text-[#181613] lg:text-5xl">
        {heading}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {detailItems.map((item) => (
          <img
            key={item.url}
            src={item.url}
            alt={item.alt}
            className="aspect-[4/3] h-full w-full object-cover"
          />
        ))}
      </div>
    </section>
  )
}
