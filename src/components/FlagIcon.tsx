import { siteAssetUrl } from "@/lib/assets"

type FlagIconProps = {
  code: string
  label: string
  className?: string
}

export default function FlagIcon({ code, label, className = "" }: FlagIconProps) {
  return (
    <span className={`inline-flex h-4 w-5 shrink-0 overflow-hidden border bg-white align-middle ${className}`}>
      <img
        src={siteAssetUrl(`/flags/${code.toLowerCase()}.svg`)}
        alt={`${label} flag`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </span>
  )
}
