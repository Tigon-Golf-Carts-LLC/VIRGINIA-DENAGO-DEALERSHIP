# Deploying to Cloudflare Workers

The dealership site is a Vite + React SPA (`artifacts/denago-dealership`) with
no backend. It deploys as a Cloudflare Worker with static assets: the build
output in `artifacts/denago-dealership/dist/public` is uploaded as the asset
bundle, and `worker/index.js` serves it and handles client-side routing.

Every contact path on the site is a `tel:` or `mailto:` link — phone
`(804) 792-0234` and email `denagodealership@gmail.com`, both defined once in
`artifacts/denago-dealership/src/data/denago-models.ts` (`DEALERSHIP` and
`HEADQUARTERS`). There are no forms and nothing to submit, so the Worker never
needs to talk to a server, a database, or a mail service.

## Cloudflare dashboard settings

| Setting          | Value                 |
| ---------------- | --------------------- |
| Build command    | `pnpm run build`      |
| Deploy command   | `npx wrangler deploy` |
| Root directory   | `/`                   |
| Build variables  | none required         |

`pnpm run build` typechecks and builds every workspace package. To build only
what the Worker needs, use `pnpm run build:cloudflare` instead — it is a drop-in
replacement for the build command and is considerably faster.

No build variables are needed. `PORT` and `BASE_PATH` are Replit runtime
variables; the Vite configs only require them when starting a server, and fall
back to defaults during `vite build`.

## Editing site content

- **Contact details** — `src/data/denago-models.ts` (`DEALERSHIP.phone`,
  `DEALERSHIP.phoneDisplay`, `HEADQUARTERS.email`). Changing them there updates
  the navbar, footer, contact page, every call/email CTA, and the JSON-LD.
  The same address also appears in `public/` text files (`llms.txt`,
  `security.txt`, `accessibility.txt`, `schema.json`).
- **Customer reviews** — `src/data/reviews.ts`. Reviews ship in the bundle, so
  adding one means editing that file and redeploying. `REVIEWS_ARE_REAL` gates
  the Review/AggregateRating structured data; keep it true only while every
  entry is a genuine customer review.

## Local checks

```sh
pnpm install
pnpm run build:cloudflare
npx wrangler dev                # serves the built site on 127.0.0.1:8787
npx wrangler deploy --dry-run   # validates wrangler.jsonc without deploying
```

## Package manager

`package.json` pins `"packageManager": "pnpm@10.33.0"`. Cloudflare's build image
otherwise defaults to an older pnpm (10.11.x), which predates the
`minimumReleaseAge` supply-chain setting in `pnpm-workspace.yaml` and can
disagree with the lockfile's recorded `overrides`, failing the install step with
`ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`. Keep this pin in sync with the pnpm version
used to regenerate `pnpm-lock.yaml`.

If an install still fails with a lockfile/config mismatch, clear the build cache
in the Cloudflare dashboard (Settings -> Build -> clear cache) and retry: the
build log line `Restoring from dependencies cache` means a previous build's
`node_modules` was reused.

## The api-server package is no longer used by the site

`artifacts/api-server` (Express + Postgres + Gmail notifications) existed to
receive review submissions and serve the `/admin` moderation page. Both are
gone, so nothing the Worker serves calls it. It is left in the repo untouched —
it still builds and typechecks — but it is not part of the Cloudflare
deployment and does not need to be running for the site to work.
