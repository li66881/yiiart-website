type Props = {
  items?: string[]
}

const DEFAULT_ITEMS = [
  "Free shipping worldwide",
  "30-day easy returns",
  "Hand-painted to order",
  "Secure checkout",
]

export default function TrustBar({ items = DEFAULT_ITEMS }: Props) {
  return (
    <div className="hidden border-b border-white/10 bg-[#1d1c18] px-4 py-2 sm:block">
      <ul className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-0 gap-y-1 text-[11px] text-white/72 sm:text-xs">
        {items.map((item, index) => (
          <li key={item} className="flex items-center">
            {index > 0 && <span className="mx-2 hidden text-white/25 sm:inline" aria-hidden>|</span>}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
