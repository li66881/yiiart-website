import assert from "node:assert/strict"
import test from "node:test"
import {
  mergeDuplicateArtists,
  resolveCanonicalArtistForSlug,
} from "./artists"

const artworkArtist = {
  _id: "artist-huang-liang-1779297583370",
  _createdAt: "2026-05-20T17:19:46Z",
  name: { en: "Huang Liang", zh: "黄亮" },
  slug: null,
  location: "Beijing, China",
  style: ["Abstract", "Oil painting"],
  bio: {
    en: "Contemporary Chinese painter with a fuller biography and all current YiiArt artworks attached.",
    zh: "黄亮",
  },
  artworkCount: 64,
}

const slugOnlyArtist = {
  _id: "artist-huang-liang-1781338186863",
  _createdAt: "2026-06-13T08:09:47Z",
  name: { en: "Huang Liang", zh: "黄亮" },
  slug: { current: "huang-liang" },
  location: "Beijing",
  style: ["Abstract", "Oil painting"],
  bio: {
    en: "Short duplicate profile.",
    zh: "黄亮",
  },
  artworkCount: 0,
}

const otherArtist = {
  _id: "artist-li-mei",
  _createdAt: "2026-06-20T00:00:00Z",
  name: { en: "Li Mei", zh: "李梅" },
  slug: { current: "li-mei" },
  location: "Shanghai",
  style: ["Landscape"],
  bio: { en: "Landscape painter.", zh: "风景画家" },
  artworkCount: 3,
}

test("merges duplicate artist records by display name and keeps the artwork owner canonical", () => {
  const artists = mergeDuplicateArtists([slugOnlyArtist, artworkArtist, otherArtist])

  assert.equal(artists.length, 2)
  assert.equal(artists[0]._id, artworkArtist._id)
  assert.equal(artists[0].canonicalArtistId, artworkArtist._id)
  assert.equal(artists[0].slug?.current, "huang-liang")
  assert.deepEqual(artists[0].duplicateArtistIds, [slugOnlyArtist._id])
  assert.equal(artists[0].artworkCount, 64)
})

test("resolves the canonical artist when the public slug belongs to a duplicate record", () => {
  const artist = resolveCanonicalArtistForSlug([slugOnlyArtist, artworkArtist], "huang-liang")

  assert.ok(artist)
  assert.equal(artist._id, artworkArtist._id)
  assert.equal(artist.canonicalArtistId, artworkArtist._id)
  assert.equal(artist.slug?.current, "huang-liang")
})

