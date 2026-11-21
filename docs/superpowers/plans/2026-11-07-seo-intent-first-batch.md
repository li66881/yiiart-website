# SEO Intent First Batch Implementation Plan

**Goal:** Improve five existing English landing pages for qualified residential and hospitality enquiries without creating competing URLs.

**Architecture:** Retain existing Next.js pages, collection rules, Sanity inventory, forms and structured data. Change authored copy only; do not change product attribution, materials, prices or payment behavior.

**Scope approved:** The 30-day keyword-to-page plan approved in chat on 2026-11-07. This batch is the first implementation, not completion of the 30-day objective.

## Keyword Ownership

| Primary page | Primary intent | Supporting terms | Product evidence |
| --- | --- | --- | --- |
| /custom-painting | custom abstract paintings | custom size, palette, orientation | Confirm feasible specifications before quoting; finished photos before dispatch |
| /trade | artwork for hotels and restaurants | custom paintings for hotels | Existing selected works are options, not delivered project case studies |
| /collections/textured-wall-art | textured wall art | hand-painted textured paintings | Existing texture category; no blanket oil, mineral or impasto claim |
| /collections/large-canvas-art | large canvas art | oversized wall art, above-sofa paintings | Existing size matching; verify each product's available dimensions |
| /collections/abstract-art-for-living-room | abstract art for living rooms | above sofa wall art | Existing abstract and room matching; no blanket unique-original claim |

Hotel guides support /trade rather than become duplicate procurement pages. Size and pairing guides support the collections. Neutral, earth-tone, horizontal, oil and impasto expansions require suitable inventory evidence before new targeting. No claimed search volumes or ranking-factor weights.

## Tasks

- [x] Add regression coverage for evidence-bounded collection copy and pre-dispatch custom photo approval; observe failures.
- [x] Update the five existing pages' authored copy, retaining URLs, catalogue selection and enquiry routes.
- [x] Run 23 focused tests, public-copy check, TypeScript and diff checks.
- [ ] Complete production-backed validation of all five rendered pages. Local textured collection returned 200 with the new intro and FAQ and correct canonical, but local inventory was empty and auth reported missing configuration. Do not treat local rendering as production inventory or checkout verification.

## Measurement And Limits

Use the existing Search Console export as a historical baseline only; it is not current November performance. Record new account data only if accessible. Assess target-market non-brand clicks, indexing, qualified enquiries and paid orders separately. No guaranteed rankings or AI citations. Real installation/process assets and artist identity remain pending confirmation; do not invent either.
