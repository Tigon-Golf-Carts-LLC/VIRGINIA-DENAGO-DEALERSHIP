---
name: Admin secret rotation design
description: How the rotatable admin secret is implemented — scrypt, advisory lock, WeakMap, no cache.
---

# Admin secret rotation

## The rule
Per-request DB lookup (no per-process cache), scrypt hash, `pg_advisory_xact_lock` in a transaction, WeakMap to carry the plaintext through to the txn re-verify step.

**Why:** No cache means rotation takes effect instantly. Advisory lock covers the no-row initial-rotation race (SELECT…FOR UPDATE locks nothing when no row exists). WeakMap avoids mutating Express Request type and gets GC'd with the request.

## How to apply
- `getStoredSecret()` queries DB every call, falls back to `ADMIN_SECRET` env var.
- `adminAuth` middleware: stores provided plaintext in `resolvedSecrets` WeakMap (NOT the hash).
- `POST /admin/rotate-secret`: BEGIN → `pg_advisory_xact_lock(hashtext(key))` → `SELECT value` → `verifySecret(plaintext, currentInDb)` → upsert → COMMIT. Returns 409 if concurrent rotation detected.
- Test mock: `pool.connect()` returns a client; advisory lock SQL pattern matched by `s.startsWith("SELECT PG_ADVISORY_XACT_LOCK")`; `txSelectOverride` map lets tests control what the txn SELECT sees independently of what `db.select()` sees (needed for concurrent-rotation tests).
- `pool.query` atomic conditional upsert for rate-limiting: `INSERT...ON CONFLICT DO UPDATE WHERE updated_at < NOW() - interval`; `rowCount === 0` means rate-limited.
