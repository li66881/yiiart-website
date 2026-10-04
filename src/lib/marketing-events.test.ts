import assert from "node:assert/strict"
import test from "node:test"
import { shouldTrackPageView, subscribeToLocationChanges } from "./marketing-events"

test("tracks a new full URL after client-side query navigation", () => {
  assert.equal(shouldTrackPageView(true, "/artworks?style=abstract", "/artworks?style=abstract"), false)
  assert.equal(shouldTrackPageView(true, "/artworks?style=abstract", "/artworks?style=modern"), true)
})

test("does not track page views without analytics consent", () => {
  assert.equal(shouldTrackPageView(false, null, "/artworks"), false)
})

test("notifies page-view tracking after client-side history navigation", () => {
  const listeners = new Set<EventListenerOrEventListenerObject>()
  const history = {
    pushState: function (..._args: Parameters<History["pushState"]>) {},
    replaceState: function (..._args: Parameters<History["replaceState"]>) {},
  }
  const target = {
    addEventListener: (name: string, listener: EventListenerOrEventListenerObject) => {
      if (name === "popstate") listeners.add(listener)
    },
    removeEventListener: (name: string, listener: EventListenerOrEventListenerObject) => {
      if (name === "popstate") listeners.delete(listener)
    },
    history,
  }
  let notifications = 0
  const cleanup = subscribeToLocationChanges(target, () => notifications++)

  history.pushState(null, "", "/artworks?style=modern")
  assert.equal(notifications, 1)
  for (const listener of listeners) {
    if (typeof listener === "function") listener(new Event("popstate"))
    else listener.handleEvent(new Event("popstate"))
  }
  assert.equal(notifications, 2)

  cleanup()
  assert.equal(listeners.size, 0)
})
