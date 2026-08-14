# DENAGO Dealership

Ecommerce-style dealership catalog website for DENAGO electric golf carts (denagodealership.com) — customers browse the 8-model lineup, compare specs, and call the dealership to buy.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/denago-dealership/` — the website (React + Vite, wouter routing, frontend-only; no backend/DB used)
- `artifacts/denago-dealership/src/data/denago-models.ts` — source of truth for all vehicle data, prices, specs, and dealership constants (name, phone, domain)
- `artifacts/denago-dealership/public/assets/denago/` — model photos (OXEN and SCOUT 2 images are AI-generated; the rest came from the user's upload)
- `public/robots.txt` and `public/sitemap.xml` — SEO crawl files (update sitemap when adding routes/models)
- Reusable `<Seo />` component manages per-route titles, meta, canonical, OG/Twitter tags, and JSON-LD

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
