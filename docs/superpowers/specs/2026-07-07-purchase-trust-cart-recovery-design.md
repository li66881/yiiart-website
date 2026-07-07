# Purchase Trust And Cart Recovery Design

Date: 2026-07-07

## Goal

Improve near-purchase confidence for developed-market collectors without redesigning the whole storefront.

## Scope

- Product detail pages should make payment, shipping, returns, and pre-purchase photo reassurance visible near the main purchase actions.
- The empty cart state should recover buyers into three useful paths: curated artworks, room advice, and custom painting.
- Do not change payment logic, database logic, CMS schemas, or checkout API behavior.

## Customer Experience

On artwork pages, the buyer should see a restrained trust strip close to the add-to-cart or invoice action. The copy should feel like a premium art studio: clear, specific, and reassuring, without discount-style urgency.

On an empty cart, the page should stop feeling like a dead end. It should offer paths for different buyer intents:

- Browse curated ready-made artwork.
- Ask for room advice before choosing.
- Start a custom painting request.

## Constraints

- Keep the visual style quiet and editorial.
- Avoid loud promotional badges, fake scarcity, or wholesale marketplace language.
- Use existing routes and components where possible.
- Add tests that catch the key public copy and recovery links.
