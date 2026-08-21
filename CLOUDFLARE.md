# Deploying to Cloudflare Workers

The dealership site is a Vite + React SPA (`artifacts/denago-dealership`). It is
deployed as a Cloudflare Worker with static assets: the build output in
`artifacts/denago-dealership/dist/public` is uploaded as the asset bundle, and
`worker/index.js` handles SPA routing plus `/api/*` forwarding.

## Cloudflare dashboard settings

| Setting          | Value                |
| ---------------- | -------------------- |
| Build command    | `pnpm run build`     |
| Deploy command   | `npx wrangler deploy` |
| Root directory   | `/`                  |
| Build variables  | none required        |

`pnpm run build` typechecks and builds every workspace package. To build only
what the Worker needs, use `pnpm run build:cloudflare` instead — it is a drop-in
replacement for the build command and is considerably faster.

No build variables are needed. `PORT` and `BASE_PATH` are Replit runtime
variables; the Vite configs only require them when starting a server, and fall
back to defaults during `vite build`.

## The `/api/*` routes

The site's review list, review submission form and `/admin` page call
`/api/reviews` and `/api/admin/*`. Those endpoints are served by
`artifacts/api-server`, an Express app backed by Postgres — it cannot run on
Workers as-is, so the Worker forwards `/api/*` to a separate deployment.

Set the `API_ORIGIN` variable on the Worker to that deployment's base URL:

```
npx wrangler secret put API_ORIGIN
# or: Workers & Pages -> virginia-denago-dealership -> Settings -> Variables
```

Until `API_ORIGIN` is set, `/api/*` responds `503` with a JSON error. The rest
of the site — every marketing page, the model catalogue and the blog — works
without it; only the review widgets and `/admin` degrade.

The api-server also needs `CORS`/cookie configuration that accepts the Worker's
hostname, since the browser talks to the Worker and the Worker talks to it.

## Local checks

```sh
pnpm install
pnpm run build:cloudflare
npx wrangler dev                      # serves the built site on 127.0.0.1:8787
npx wrangler dev --var API_ORIGIN:http://127.0.0.1:3000   # with a local api-server
npx wrangler deploy --dry-run         # validates wrangler.jsonc without deploying
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
