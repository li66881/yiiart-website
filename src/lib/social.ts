import { siteUrl } from "./seo"

export type SocialCampaign = {
  source: string
  medium?: string
  campaign?: string
  content?: string
}

export function withCampaignParams(urlOrPath: string, campaign: SocialCampaign) {
  const url = /^https?:\/\//.test(urlOrPath)
    ? new URL(urlOrPath)
    : new URL(urlOrPath.startsWith("/") ? urlOrPath : `/${urlOrPath}`, `${siteUrl}/`)

  url.searchParams.set("utm_source", campaign.source)
  url.searchParams.set("utm_medium", campaign.medium || "social")
  if (campaign.campaign) url.searchParams.set("utm_campaign", campaign.campaign)
  if (campaign.content) url.searchParams.set("utm_content", campaign.content)
  return url.toString()
}

export function campaignSearch(campaign: SocialCampaign) {
  return new URL(withCampaignParams("/", campaign)).search
}

export function buildSocialShareCaption(input: {
  title: string
  artistName?: string
  caption?: string
}) {
  const provided = input.caption?.replace(/\s+/g, " ").trim()
  if (provided) return provided

  const artist = input.artistName?.trim()
  return artist
    ? `${input.title} — original hand-painted artwork by ${artist}.`
    : `${input.title} — original hand-painted artwork from YiiArt.`
}
