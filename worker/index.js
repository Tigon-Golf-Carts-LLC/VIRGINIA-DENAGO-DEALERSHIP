/**
 * Cloudflare Worker that serves the Denago dealership site.
 *
 * The site is fully static: the Vite build in
 * `artifacts/denago-dealership/dist/public` is uploaded as the asset bundle
 * (bound as `env.ASSETS` by wrangler.jsonc) and there is no backend. Contact
 * happens through `tel:` and `mailto:` links in the page itself, so the Worker
 * only has to serve files and keep client-side routing working.
 */

const SPA_ENTRYPOINT = '/index.html';

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

export default {
  async fetch(request, env) {
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    const url = new URL(request.url);

    if (looksLikeFile(url.pathname)) {
      return assetResponse;
    }

    // Unknown path with no file extension: hand the SPA shell to the browser
    // and let wouter render the route (or the site's own 404 page).
    const entrypoint = new URL(SPA_ENTRYPOINT, url.origin);
    const shell = await env.ASSETS.fetch(new Request(entrypoint, { method: 'GET' }));

    if (shell.status === 404) {
      return shell;
    }

    // The shell is the correct document for an unknown route, but it must not
    // be cached as if it were that route's own asset.
    const headers = new Headers(shell.headers);
    headers.set('Cache-Control', 'no-cache');

    return new Response(shell.body, { status: 200, headers });
  },
};
