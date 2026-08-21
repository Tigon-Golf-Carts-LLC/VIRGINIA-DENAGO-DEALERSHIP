/**
 * Cloudflare Worker that serves the Denago dealership site.
 *
 * Static assets come from the Vite build in
 * `artifacts/denago-dealership/dist/public` (bound as `env.ASSETS` by
 * wrangler.jsonc). Anything that is not a real file falls back to
 * `index.html` so the client-side router (wouter) can handle the route.
 *
 * `/api/*` is reverse-proxied to `env.API_ORIGIN` when that variable is set,
 * which is how the review + admin endpoints of `@workspace/api-server` are
 * reached. Workers cannot run that Express/Postgres server itself, so when
 * `API_ORIGIN` is unset those routes answer with a 503 instead of returning
 * the SPA shell as if it were JSON.
 */

const SPA_ENTRYPOINT = '/index.html';

/** Paths that must never be indexed by search engines. */
function isAdminPath(pathname) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isApiPath(pathname) {
  return pathname === '/api' || pathname.startsWith('/api/');
}

/** Proxies an /api/* request to the configured backend origin. */
async function proxyApi(request, env, url) {
  const apiOrigin = env.API_ORIGIN;

  if (!apiOrigin) {
    return Response.json(
      {
        error: 'API origin is not configured',
        detail:
          'Set the API_ORIGIN variable on this Worker to the base URL of the ' +
          'api-server deployment (for example https://api.example.com).',
      },
      { status: 503 },
    );
  }

  const target = new URL(url.pathname + url.search, apiOrigin);

  // `redirect: 'manual'` keeps redirects addressed to the browser rather than
  // being followed (and thus hidden) by the Worker.
  return fetch(
    new Request(target, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'manual',
    }),
  );
}

/**
 * True for paths that name a file rather than a client-side route, e.g.
 * `/assets/index-D9AiQ8WI.js` or `/favicon.ico`. A missing file must stay a
 * 404 -- answering it with the HTML shell would make a stale asset reference
 * look like a successful load.
 */
function looksLikeFile(pathname) {
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1);
  return lastSegment.includes('.');
}

/** Serves a static asset, falling back to the SPA entrypoint. */
async function serveAsset(request, env, url) {
  const assetResponse = await env.ASSETS.fetch(request);

  if (assetResponse.status !== 404 || looksLikeFile(url.pathname)) {
    return assetResponse;
  }

  const entrypoint = new URL(SPA_ENTRYPOINT, url.origin);
  const shell = await env.ASSETS.fetch(new Request(entrypoint, { method: 'GET' }));

  if (shell.status === 404) {
    return shell;
  }

  // The SPA shell is the correct document for an unknown route, but it must
  // not be cached as if it were that route's own asset.
  const headers = new Headers(shell.headers);
  headers.set('Cache-Control', 'no-cache');

  return new Response(shell.body, { status: 200, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (isApiPath(url.pathname)) {
      return proxyApi(request, env, url);
    }

    const response = await serveAsset(request, env, url);

    if (!isAdminPath(url.pathname)) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};
