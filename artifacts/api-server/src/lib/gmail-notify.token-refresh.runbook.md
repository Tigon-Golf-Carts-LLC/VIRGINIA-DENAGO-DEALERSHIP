# Token-Refresh Runbook — Test Notification End-to-End

## Purpose

Unit tests can mock the Replit connector proxy but cannot exercise a real OAuth
token refresh cycle. This runbook documents the manual steps to confirm that
`sendTestNotification` delivers an email even after the underlying Gmail OAuth
token has been refreshed mid-session.

The unit test suite covers the code path mechanically (stale-token 401 →
`cachedEmail` cleared → profile re-fetched → send succeeds). This runbook is
the integration verification layer that runs against a live Gmail connector.

---

## When to run this runbook

- After rotating or re-authorising the Gmail connector in the Replit Integrations
  panel.
- After a long server downtime (token refresh may be needed on the next send).
- Before releasing any change to `gmail-notify.ts` or the admin notification flow.

---

## Pre-conditions

1. The API server is running and reachable.
2. A Gmail connector is attached and authorised (Replit Integrations → Gmail).
3. `ADMIN_SECRET` is set; you have the value.
4. You have access to the Gmail inbox that will receive the test email.

---

## Steps

### 1 — Warm the in-process `cachedEmail`

Send the first test notification. This causes the server to fetch the Gmail
profile and cache the email address in memory.

```bash
curl -s -X POST https://<your-dev-domain>/api/admin/test-notification \
  -H "x-admin-secret: $ADMIN_SECRET" | jq .
```

Expected: `{ "ok": true }` and an email arrives in the inbox within ~30 s.

---

### 2 — Force a token-refresh cycle

The Replit connector proxy refreshes OAuth tokens automatically. To confirm the
code handles the post-refresh state:

**Option A — Wait for natural expiry (low effort, slow)**

Gmail access tokens expire after 60 minutes. Leave the server running for at
least 1 hour without sending another email, then proceed to step 3.

**Option B — Revoke and re-authorise (fast, thorough)**

1. In Replit Integrations, disconnect the Gmail connector.
2. Reconnect and re-authorise it.
3. The server's `cachedEmail` now holds a stale reference — the next proxy call
   will use the new token.

---

### 3 — Send a second test notification (post-refresh)

```bash
curl -s -X POST https://<your-dev-domain>/api/admin/test-notification \
  -H "x-admin-secret: $ADMIN_SECRET" | jq .
```

**Expected outcomes:**

| Scenario | Expected response | Expected email |
|----------|------------------|----------------|
| Transparent refresh (Option A) | `{ "ok": true }` | Delivered |
| Revoke + re-auth (Option B), first click after revoke | `{ "ok": false, "error": "Gmail send failed 401: …" }` | Not delivered |
| Revoke + re-auth (Option B), second click after error | `{ "ok": true }` | Delivered |

> **Option B note:** The first click after revoke is expected to fail with 401
> because the server's `cachedEmail` was populated under the old token. The
> server clears the cache on 401 so the *second* click will re-fetch the profile
> and deliver successfully. This matches the unit-test scenario.

---

### 4 — Verify the admin panel reflects the correct state

Check notification status:

```bash
curl -s https://<your-dev-domain>/api/admin/notification-status \
  -H "x-admin-secret: $ADMIN_SECRET" | jq .
```

- After a successful send: `{ "error": null }`.
- After a failed send: `{ "error": "Gmail send failed 401: …", "updatedAt": "…" }`.
  The admin panel should display this as a warning banner.

---

## Pass / Fail criteria

| Check | Pass |
|-------|------|
| At least one test email delivered after the token-refresh cycle | ✓ |
| A 401 failure sets the error banner (visible in notification-status) | ✓ |
| The second send after a 401 succeeds and clears the error banner | ✓ |
| No error banner remains after a successful send | ✓ |

If any check fails, inspect the API server logs for `[review-notify]` entries.
