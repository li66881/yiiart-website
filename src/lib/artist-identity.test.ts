import assert from "node:assert/strict"
import test from "node:test"
import { matchesArtistIdentity } from "./artist-identity"

test("matches a canonical artist profile to a duplicate reference by exact bilingual identity", () => {
  assert.equal(matchesArtistIdentity(
    { id: "artist-with-slug", name: { en: "Huang Liang", zh: "黄亮" } },
    { id: "legacy-artist", name: { en: "Huang Liang", zh: "黄亮" } },
  ), true)
})

test("does not merge different artists who share only one localized name", () => {
  assert.equal(matchesArtistIdentity(
    { id: "artist-one", name: { en: "Alex Lee", zh: "李明" } },
    { id: "artist-two", name: { en: "Alex Lee", zh: "李强" } },
  ), false)
})

test("uses a matching document id even when localized names are incomplete", () => {
  assert.equal(matchesArtistIdentity(
    { id: "artist-one", name: { en: "Alex Lee" } },
    { id: "artist-one", name: {} },
  ), true)
})
