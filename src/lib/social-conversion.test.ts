import assert from "node:assert/strict"
import test from "node:test"
import { publicMarketingParams } from "./marketing-events"
import { parseEnquiryAttribution, sanitizeEnquiryAttribution } from "./attribution"
import { enquirySourceLabel, parseEnquiryIntent } from "./enquiry-intent"
import { isStaleSocialProfileUrl, resolveSocialProfileHref } from "./social-profiles"
import { orderSocialLinkPicks } from "./social-links-picks"

test("keeps product context and drops emails from analytics payloads", () => {
  assert.deepEqual(
    publicMarketingParams({
      content_name: "walled-garden",
      email: "collector@example.com",
      message: "wall photo attached",
      value: 12,
    }),
    { content_name: "walled-garden", value: 12 },
  )
})

test("size-advice intent does not look like a generic custom-painting source", () => {
  assert.equal(parseEnquiryIntent("size-advice"), "size-advice")
  assert.equal(enquirySourceLabel("size-advice", "/artwork/walled-garden"), "size-advice:/artwork/walled-garden")
  assert.equal(enquirySourceLabel("custom"), "custom-painting-page")
})

test("keeps first-touch landing path when later pages have no UTM", () => {
  const first = parseEnquiryAttribution({
    currentPath: "/links",
    search: "?utm_source=instagram&utm_medium=organic_social&utm_campaign=bio",
  })
  const later = parseEnquiryAttribution({
    currentPath: "/custom-painting?intent=size-advice",
    search: "",
    stored: first,
  })
  assert.equal(later.utmSource, "instagram")
  assert.equal(later.landingPath, "/links")
  assert.match(later.sourcePage, /custom-painting/)
})

test("form attribution fields stay short and non-empty only when present", () => {
  const form = new FormData()
  form.set("sourcePage", "/artwork/white-peony-relief")
  form.set("utmSource", "pinterest")
  const saved = sanitizeEnquiryAttribution(form)
  assert.equal(saved.sourcePage, "/artwork/white-peony-relief")
  assert.equal(saved.utmSource, "pinterest")
  assert.equal(saved.utmCampaign, "")
})

test("ignores stale personal Instagram and Facebook profile URLs", () => {
  assert.equal(isStaleSocialProfileUrl("https://www.instagram.com/lishuxian100721/"), true)
  assert.equal(
    resolveSocialProfileHref(
      "Instagram",
      "https://www.instagram.com/lishuxian100721/",
      "https://www.instagram.com/yiiartstudio/",
    ),
    "https://www.instagram.com/yiiartstudio/",
  )
  assert.equal(
    resolveSocialProfileHref(
      "Facebook",
      "https://www.facebook.com/profile.php?id=61593697816451",
      "https://www.facebook.com/profile.php?id=61593697816451",
    ),
    "https://www.facebook.com/profile.php?id=61593697816451",
  )
})

test("orders link-in-bio picks by latest public posts and drops missing slugs", () => {
  const ordered = orderSocialLinkPicks([
    { slug: { current: "walled-garden" } },
    { slug: { current: "electric-pink-meadow" } },
    { slug: { current: "missing-work" } },
  ])
  assert.deepEqual(ordered.map((item) => item.pick.slug), ["electric-pink-meadow", "walled-garden"])
})
