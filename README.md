# GrubCheck

GrubCheck is a high-fidelity Rust skin compositor focused on one thing first: helping players see whether a kit actually looks good, matches a biome, and is worth the money.

This repo now includes the first end-to-end MVP scaffold:

- `apps/web`: Next.js workbench with mannequin preview, catalog search, item detail pages, and internal status view.
- `apps/api`: Hono API for published catalog items, biome presets, and manual sync endpoints.
- `apps/worker`: Steam sync, asset import, asset matching, and daily price snapshot jobs.
- `packages/domain`: shared schemas, biome presets, classifier rules, and demo fallback data.
- `packages/db`: Drizzle schema and repository helpers for Postgres.
- `packages/render`: scene-composition helpers for slot layering and suppression.

## Current repo shape

- `docs/00-source-prompt.md`: Preserved source context from the initial product prompt.
- `docs/01-product-brief.md`: Structured version of the product idea.
- `docs/02-critical-review.md`: Blunt critique of the concept and scope.
- `docs/03-mvp-roadmap.md`: Focused MVP direction and explicit cuts.
- `docs/04-research-questions.md`: Unknowns that need answers before serious implementation.
- `docs/05-asset-import-format.md`: Expected asset dump manifest format for automatic wearable import.

## Working direction

1. Prove visual trust first.
2. Keep the first build narrow enough to ship.
3. Treat pricing, metadata, and biome scoring as data products, not UI decorations.
4. Delay social features until the core try-on loop is good enough to earn repeat usage.

## Quick start

1. Install dependencies with `bun install`.
2. Copy `.env.example` to `.env` and set at least `NEXT_PUBLIC_API_BASE_URL`, `API_BASE_URL`, and `DATABASE_URL`.
3. Run the apps you need:
   - `bun run dev:web`
   - `bun run dev:api`
   - `bun run dev:worker`

Without a configured Postgres database, the API and web app fall back to demo catalog data so the mannequin workbench still renders.

## Verification

- `bun run check`
- `bun run build`
