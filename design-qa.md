# YiiArt 2.1 Design QA

## Captured state

- Reference: `D:\Documents\网站yiiart.com建设\.worktrees\yiiart-preview`
- Migrated production build: `D:\Documents\网站yiiart.com建设\.worktrees\yiiart-integration`
- Captured browser route: `http://127.0.0.1:3002/`

## Automated evidence

- `npm run test`: 31 tests passed; public copy check passed.
- `npm run build`: completed successfully and generated 41 routes.

## Accepted current captures

- Home: current 2.1 hero copy, dark editorial header, image-led composition, and three trust points are visible.
- Artworks: current 2.1 header, editorial display typography, warm paper surface, and curated path grid are visible.

## Visual review status

The local preview initially reused an older listener on port 3001. Port 3002 now serves the current production build and has accepted home and catalogue captures. Product detail, cart, checkout, and mobile captures remain outstanding, so this is not a release approval.

## Required interactive checks after a current preview is available

- Collection tabs and filters update the visible artwork grid.
- Product gallery thumbnails update the selected image.
- Size and finish selections add the correct cart variant.
- Original artworks remain quantity one.
- Cart proceeds to checkout; enabled payment choices remain selectable.
- Mobile menu, search, focus state, and reduced-motion behavior remain usable.

final result: blocked
