import assert from "node:assert/strict"
import test from "node:test"
import { buildSocialShareCaption, campaignSearch, withCampaignParams } from "./social"

test("adds UTM parameters for social campaigns without inventing profiles", () => {
  assert.match(
    withCampaignParams("/artwork/sage-labyrinth", {
      source: "pinterest",
      campaign: "pdp_share",
      content: "sage-labyrinth",
    }),
    /utm_source=pinterest/,
  )
  assert.equal(
    campaignSearch({ source: "link_in_bio", medium: "social", campaign: "bio" }),
    "?utm_source=link_in_bio&utm_medium=social&utm_campaign=bio",
  )
})

test("uses reviewed caption copy when present and otherwise names the artwork plainly", () => {
  assert.equal(
    buildSocialShareCaption({
      title: "Sage Labyrinth",
      artistName: "Studio Artist",
      caption: "  Sage Labyrinth in a quiet living room.  ",
    }),
    "Sage Labyrinth in a quiet living room.",
  )
  assert.equal(
    buildSocialShareCaption({ title: "Sage Labyrinth", artistName: "Studio Artist" }),
    "Sage Labyrinth — original hand-painted artwork by Studio Artist.",
  )
})
