/**
 * Cloudflare Worker that serves the Denago dealership site.
 *
 * The site is static: the Vite build in
 * `artifacts/denago-dealership/dist/public` is uploaded as the asset bundle
 * (bound as `env.ASSETS` by wrangler.jsonc). The Worker serves those files,
 * keeps client-side routing working, and handles one endpoint:
 *
 *   POST /api/lead  ->  TIGON IOT Webhook Flows ("Contact form")
 *
 * The webhook URL contains a private key, so it is never in the repo or the
 * browser bundle. It is read from the Worker secret `LEAD_WEBHOOK_URL`
 * (Cloudflare -> Workers -> virginia-denago-dealership -> Settings ->
 * Variables and Secrets, or synced from the GitHub secret of the same name by
 * .github/workflows/sync-lead-webhook-secret.yml).
 */

const LEAD_PATH = '/api/lead';
const MAX_LEAD_BYTES = 40 * 1024 * 1024; // 3 photos x 10 MB + text fields

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/**
 * Forward a lead from the site's own form to the TIGON webhook. The body is
 * streamed through untouched (multipart with photos, JSON or urlencoded), and
 * TIGON's JSON reply ({ ok, id } or { ok:false, error }) is passed back as-is.
 */
async function handleLead(request, env) {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  }

  // Only this site's own pages may use the relay.
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  if (origin && origin !== url.origin) {
    return json({ ok: false, error: 'Origin not allowed.' }, 403);
  }

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_LEAD_BYTES) {
    return json({ ok: false, error: 'Upload too large. Each photo must be smaller than 10 MB.' }, 413);
  }

  const webhook = env.LEAD_WEBHOOK_URL;
  if (!webhook) {
    console.error('LEAD_WEBHOOK_URL secret is not set; lead not delivered.');
    return json({ ok: false, error: 'Our form is temporarily unavailable. Please call us.' }, 503);
  }

  const headers = new Headers();
  const contentType = request.headers.get('Content-Type');
  if (contentType) headers.set('Content-Type', contentType);
  // Pass the visitor's browser and IP along so the lead shows them rather than Cloudflare's.
  const ua = request.headers.get('User-Agent');
  if (ua) headers.set('User-Agent', ua);
  const ip = request.headers.get('CF-Connecting-IP');
  if (ip) {
    headers.set('X-Forwarded-For', ip);
    headers.set('X-Real-IP', ip);
  }

  let upstream;
  try {
    upstream = await fetch(webhook, { method: 'POST', headers, body: request.body });
  } catch (err) {
    console.error('Lead webhook request failed', err);
    return json({ ok: false, error: 'Sorry, something went wrong. Please try again or call us.' }, 502);
  }

  const text = await upstream.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  if (!upstream.ok) {
    console.error('Lead webhook rejected the lead', upstream.status, text.slice(0, 500));
  }
  if (data && typeof data === 'object') return json(data, upstream.status);
  return json(
    upstream.ok ? { ok: true } : { ok: false, error: 'Sorry, something went wrong. Please try again or call us.' },
    upstream.status,
  );
}

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
    if (new URL(request.url).pathname === LEAD_PATH) {
      return handleLead(request, env);
    }

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
