# YiiArt 2.1 Design QA

## Captured state

- Reference: `D:\Documents\网站yiiart.com建设\.worktrees\yiiart-preview`
- Migrated production build: `D:\Documents\网站yiiart.com建设\.worktrees\yiiart-integration`
- Captured browser route: `http://127.0.0.1:3001/`

## Automated evidence

- `npm run test`: 31 tests passed; public copy check passed.
- `npm run build`: completed successfully and generated 41 routes.

## Visual review status

The browser surface returned an earlier local server response after the current production build was restarted. The captured home hero still displayed the prior 1.0 copy rather than the committed 2.1 hero copy, so it cannot be accepted as evidence for the current build.

No release decision may be made from that stale preview. A new browser capture must show the current build for the home, `/artworks`, a made-to-order artwork detail page, cart, and checkout at desktop and mobile widths.

## Required interactive checks after a current preview is available

- Collection tabs and filters update the visible artwork grid.
- Product gallery thumbnails update the selected image.
- Size and finish selections add the correct cart variant.
- Original artworks remain quantity one.
- Cart proceeds to checkout; enabled payment choices remain selectable.
- Mobile menu, search, focus state, and reduced-motion behavior remain usable.

final result: blocked
