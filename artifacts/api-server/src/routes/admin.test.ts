/**
 * Tests for admin routes:
 *  - Pure helpers: hashSecret / verifySecret / computeCooldownMs
 *  - HTTP integration: secret rotation (new accepted, old immediately rejected)
 *  - HTTP integration: test-notification persistent rate limit
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

/* ------------------------------------------------------------------ */
/* Shared in-memory key-value store (stands in for app_settings table) */
/* ------------------------------------------------------------------ */

const store: Record<string, string> = {};

/**
 * If a key is set here, the transactional pool client's SELECT returns this
 * value instead of store[key].  Allows tests to simulate a concurrent
 * rotation that changes the DB between auth and the txn write.
 */
const txSelectOverride: Record<string, string> = {};

/* ------------------------------------------------------------------ */
/* Mock drizzle-orm: eq returns a plain string key so where() can      */
/* look it up in the store.                                            */
/* ------------------------------------------------------------------ */

vi.mock("drizzle-orm", () => ({
  eq: (_col: unknown, val: unknown) => String(val),
  desc: (_col: unknown) => _col,
  asc: (_col: unknown) => _col,
}));

/* ------------------------------------------------------------------ */
/* Mock @workspace/db: reads/writes use the store above               */
/* ------------------------------------------------------------------ */

vi.mock("@workspace/db", () => {
  const reviewsTable = { id: "id", approved: "approved", createdAt: "createdAt" };
  const appSettingsTable = { key: "key", value: "value", updatedAt: "updatedAt" };

  /**
   * Mock pool.query for the atomic rate-limit upsert.
   * Simulates the conditional INSERT...ON CONFLICT by checking the store.
   */
  const pool = {
    query(_sql: string, params: unknown[]) {
      const key = params[0] as string;
      const val = params[1] as string;
      const windowMs = Number(params[2]);
      const existing = store[key];
      if (existing !== undefined) {
        const elapsed = Date.now() - Number(existing);
        if (elapsed < windowMs) {
          return Promise.resolve({ rowCount: 0, rows: [] });
        }
      }
      store[key] = val;
      return Promise.resolve({ rowCount: 1, rows: [{ updated_at: new Date() }] });
    },

    /**
     * Mock pool.connect() — returns a client that handles the rotation
     * transaction (BEGIN / SELECT…FOR UPDATE / INSERT / COMMIT / ROLLBACK).
     */
    connect() {
      const client = {
        query(sql: string, params?: unknown[]) {
          const s = sql.trim().toUpperCase();
          if (
            s === "BEGIN" || s === "COMMIT" || s === "ROLLBACK" ||
            s.startsWith("SELECT PG_ADVISORY_XACT_LOCK")
          ) {
            return Promise.resolve({ rows: [], rowCount: 0 });
          }
          // SELECT value FROM app_settings — return current stored value (or override)
          if (s.startsWith("SELECT VALUE FROM APP_SETTINGS")) {
            const key = (params as string[])[0];
            const value = txSelectOverride[key] !== undefined
              ? txSelectOverride[key]
              : store[key];
            return Promise.resolve({
              rows: value !== undefined ? [{ value }] : [],
              rowCount: value !== undefined ? 1 : 0,
            });
          }
          // INSERT … ON CONFLICT DO UPDATE (unconditional upsert in txn)
          if (s.startsWith("INSERT INTO APP_SETTINGS")) {
            const key = (params as string[])[0];
            const val = (params as string[])[1];
            store[key] = val;
            return Promise.resolve({ rows: [], rowCount: 1 });
          }
          return Promise.resolve({ rows: [], rowCount: 0 });
        },
        release() { /* no-op */ },
      };
      return Promise.resolve(client);
    },
  };

  /** Fluent chain that is both awaitable and has chaining methods. */
  function makeWhereResult(rows: unknown[]) {
    return {
      orderBy(_col: unknown) {
        return Promise.resolve(rows);
      },
      returning(_cols: unknown) {
        return Promise.resolve(rows);
      },
      then(
        resolve: (v: unknown) => unknown,
        reject?: (e: unknown) => unknown,
      ) {
        return Promise.resolve(rows).then(resolve, reject);
      },
    };
  }

  const db = {
    select() {
      return {
        from(_table: unknown) {
          return {
            where(key: string) {
              const value = store[key];
              const rows =
                value !== undefined
                  ? [{ key, value, updatedAt: new Date() }]
                  : [];
              return makeWhereResult(rows);
            },
            orderBy(_col: unknown) {
              return Promise.resolve([]);
            },
          };
        },
      };
    },
    insert(_table: unknown) {
      return {
        values(row: Record<string, string>) {
          return {
            onConflictDoUpdate(opts: { set: Record<string, string> }) {
              const key = row["key"]!;
              const val = opts.set["value"] ?? row["value"]!;
              store[key] = val;
              return Promise.resolve();
            },
          };
        },
      };
    },
    update(_table: unknown) {
      return {
        set(_vals: unknown) {
          return {
            where(_cond: unknown) {
              return {
                returning(_cols: unknown) {
                  return Promise.resolve([{ id: 1 }]);
                },
              };
            },
          };
        },
      };
    },
    delete(_table: unknown) {
      return {
        where(key: string) {
          const existed = key in store;
          delete store[key];
          return makeWhereResult(existed ? [{ id: 1 }] : []);
        },
      };
    },
  };

  return { db, pool, reviewsTable, appSettingsTable };
});

/* ------------------------------------------------------------------ */
/* Mock gmail-notify                                                   */
/* ------------------------------------------------------------------ */

const sendTestNotificationMock = vi.fn().mockResolvedValue({ ok: true });

vi.mock("../lib/gmail-notify.js", () => ({
  NOTIFICATION_ERROR_KEY: "notification_error",
  sendTestNotification: sendTestNotificationMock,
  sendReviewNotification: vi.fn().mockResolvedValue(undefined),
}));

/* ------------------------------------------------------------------ */
/* Pure helper unit tests — no mocking required                        */
/* ------------------------------------------------------------------ */

describe("hashSecret / verifySecret", async () => {
  const { hashSecret, verifySecret } = await import("./admin-helpers.js");

  it("accepts the correct plaintext against a hash", async () => {
    const hash = await hashSecret("super-secret-value-here");
    await expect(verifySecret("super-secret-value-here", hash)).resolves.toBe(true);
  });

  it("rejects a wrong plaintext against a hash", async () => {
    const hash = await hashSecret("correct-secret-value-here");
    await expect(verifySecret("wrong-secret-value-here!!", hash)).resolves.toBe(false);
  });

  it("handles plain env-var fallback (no scrypt: prefix)", async () => {
    await expect(verifySecret("my-plain-secret", "my-plain-secret")).resolves.toBe(true);
    await expect(verifySecret("wrong", "my-plain-secret")).resolves.toBe(false);
  });

  it("different hashes of the same input both verify (salt uniqueness)", async () => {
    const h1 = await hashSecret("same-passphrase-12345");
    const h2 = await hashSecret("same-passphrase-12345");
    expect(h1).not.toBe(h2); // different salts
    await expect(verifySecret("same-passphrase-12345", h1)).resolves.toBe(true);
    await expect(verifySecret("same-passphrase-12345", h2)).resolves.toBe(true);
  });
});

describe("computeCooldownMs", async () => {
  const { computeCooldownMs, TEST_NOTIF_MIN_INTERVAL_MS } = await import("./admin-helpers.js");

  it("returns 0 when enough time has passed", () => {
    expect(computeCooldownMs(Date.now() - TEST_NOTIF_MIN_INTERVAL_MS - 1, Date.now())).toBe(0);
  });

  it("returns remaining ms when within the window", () => {
    const lastSent = Date.now() - 60_000; // 1 minute ago
    const remaining = computeCooldownMs(lastSent, Date.now());
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(TEST_NOTIF_MIN_INTERVAL_MS - 60_000 + 50);
  });

  it("returns 0 exactly at the boundary", () => {
    expect(computeCooldownMs(Date.now() - TEST_NOTIF_MIN_INTERVAL_MS, Date.now())).toBe(0);
  });
});

/* ------------------------------------------------------------------ */
/* HTTP integration: approve endpoint                                  */
/* ------------------------------------------------------------------ */

describe("POST /api/admin/reviews/:id/approve", () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    for (const k of Object.keys(txSelectOverride)) delete txSelectOverride[k];
    vi.unstubAllEnvs();
    vi.stubEnv("ADMIN_SECRET", "initial-env-secret-abcd");
  });

  it("returns 200 and ok:true for a valid id", async () => {
    const { default: app } = await import("../app.js");
    const res = await request(app)
      .post("/api/admin/reviews/1/approve")
      .set("x-admin-secret", "initial-env-secret-abcd");
    // The mock update always succeeds (returns [{id:1}]), so we should get ok.
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("returns 400 for a non-numeric id", async () => {
    const { default: app } = await import("../app.js");
    const res = await request(app)
      .post("/api/admin/reviews/abc/approve")
      .set("x-admin-secret", "initial-env-secret-abcd");
    expect(res.status).toBe(400);
  });

  it("does not delete the review (regression guard)", async () => {
    const { default: app } = await import("../app.js");
    // Track whether delete was called on reviewsTable — it must NOT be.
    let deleteCalled = false;
    const originalDelete = (await import("@workspace/db")).db.delete;
    const spy = vi.spyOn((await import("@workspace/db")).db, "delete").mockImplementation((...args) => {
      deleteCalled = true;
      return originalDelete.apply(null, args as Parameters<typeof originalDelete>);
    });
    await request(app)
      .post("/api/admin/reviews/1/approve")
      .set("x-admin-secret", "initial-env-secret-abcd");
    expect(deleteCalled).toBe(false);
    spy.mockRestore();
  });
});

/* ------------------------------------------------------------------ */
/* HTTP integration: secret rotation                                   */
/* ------------------------------------------------------------------ */

describe("POST /api/admin/rotate-secret", () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    for (const k of Object.keys(txSelectOverride)) delete txSelectOverride[k];
    vi.unstubAllEnvs();
    vi.stubEnv("ADMIN_SECRET", "initial-env-secret-abcd");
  });

  it("returns 401 when x-admin-secret header is missing", async () => {
    const { default: app } = await import("../app.js");
    const res = await request(app)
      .post("/api/admin/rotate-secret")
      .send({ newSecret: "brand-new-secret-abcdef" });
    expect(res.status).toBe(401);
  });

  it("returns 400 when newSecret is shorter than 16 characters", async () => {
    const { default: app } = await import("../app.js");
    const res = await request(app)
      .post("/api/admin/rotate-secret")
      .set("x-admin-secret", "initial-env-secret-abcd")
      .send({ newSecret: "tooshort" });
    expect(res.status).toBe(400);
  });

  it("accepts the new secret and immediately rejects the old one", async () => {
    const { default: app } = await import("../app.js");

    const rotateRes = await request(app)
      .post("/api/admin/rotate-secret")
      .set("x-admin-secret", "initial-env-secret-abcd")
      .send({ newSecret: "brand-new-secret-abcdef" });
    expect(rotateRes.status).toBe(200);
    expect(rotateRes.body.ok).toBe(true);

    // The DB store must now contain a scrypt hash for admin_secret.
    expect(store["admin_secret"]).toMatch(/^scrypt:/);

    // Old secret must be rejected on the very next request.
    const oldSecretRes = await request(app)
      .get("/api/admin/reviews")
      .set("x-admin-secret", "initial-env-secret-abcd");
    expect(oldSecretRes.status).toBe(401);

    // New secret must be accepted.
    const newSecretRes = await request(app)
      .get("/api/admin/reviews")
      .set("x-admin-secret", "brand-new-secret-abcdef");
    expect(newSecretRes.status).toBe(200);
  });

  it("second concurrent initial rotation gets 409 even when no DB row existed (advisory-lock no-row path)", async () => {
    const { default: app } = await import("../app.js");

    // Operator rotates first (no DB row → inserts H1).
    const r1 = await request(app)
      .post("/api/admin/rotate-secret")
      .set("x-admin-secret", "initial-env-secret-abcd")
      .send({ newSecret: "operators-new-secret-12345" });
    expect(r1.status).toBe(200);

    // Simulate the attacker's request, whose auth was resolved BEFORE the
    // operator's rotation committed (both saw no DB row at auth time).
    // We achieve this by:
    //   - Moving H1 into txSelectOverride (so the attacker's txn sees it)
    //   - Clearing it from store (so auth falls back to env var, matching
    //     the concurrent scenario where auth occurred before H1 was written)
    txSelectOverride["admin_secret"] = store["admin_secret"]!;
    delete store["admin_secret"];

    // Auth passes (store empty → env var fallback).
    // Txn SELECT returns H1 (via override) — mismatch → 409.
    const r2 = await request(app)
      .post("/api/admin/rotate-secret")
      .set("x-admin-secret", "initial-env-secret-abcd")
      .send({ newSecret: "attackers-secret-12345678" });
    expect(r2.status).toBe(409);
  });

  it("returns 409 when the secret changes between authentication and write (concurrent rotation)", async () => {
    const { default: app } = await import("../app.js");

    // Rotate once so the DB has a real hash for "first-rotation-secret-xyz".
    await request(app)
      .post("/api/admin/rotate-secret")
      .set("x-admin-secret", "initial-env-secret-abcd")
      .send({ newSecret: "first-rotation-secret-xyz" });

    // Auth (db.select) still sees the real hash, so the next request passes
    // adminAuth.  But we tell the transactional SELECT (pool.connect client)
    // to return a *different* hash — simulating a concurrent rotation that
    // landed between auth and the txn write.
    txSelectOverride["admin_secret"] =
      "scrypt:deadbeef00:abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890" +
      "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

    const res = await request(app)
      .post("/api/admin/rotate-secret")
      .set("x-admin-secret", "first-rotation-secret-xyz")
      .send({ newSecret: "attacker-chosen-secret-xyz" });
    expect(res.status).toBe(409);
  });

  it("old secret is rejected immediately after a second rotation", async () => {
    const { default: app } = await import("../app.js");

    await request(app)
      .post("/api/admin/rotate-secret")
      .set("x-admin-secret", "initial-env-secret-abcd")
      .send({ newSecret: "rotated-secret-xyz-99999" });

    const secondRotate = await request(app)
      .post("/api/admin/rotate-secret")
      .set("x-admin-secret", "rotated-secret-xyz-99999")
      .send({ newSecret: "third-secret-abcdefghij" });
    expect(secondRotate.status).toBe(200);

    // Both prior secrets must be rejected.
    expect((await request(app).get("/api/admin/reviews").set("x-admin-secret", "initial-env-secret-abcd")).status).toBe(401);
    expect((await request(app).get("/api/admin/reviews").set("x-admin-secret", "rotated-secret-xyz-99999")).status).toBe(401);

    // Only the latest secret works.
    expect((await request(app).get("/api/admin/reviews").set("x-admin-secret", "third-secret-abcdefghij")).status).toBe(200);
  });
});

/* ------------------------------------------------------------------ */
/* HTTP integration: test-notification rate limit                      */
/* ------------------------------------------------------------------ */

describe("POST /api/admin/test-notification rate limit", () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    for (const k of Object.keys(txSelectOverride)) delete txSelectOverride[k];
    vi.unstubAllEnvs();
    vi.stubEnv("ADMIN_SECRET", "admin-secret-for-testing-1");
    sendTestNotificationMock.mockResolvedValue({ ok: true });
  });

  it("allows the first request through", async () => {
    const { default: app } = await import("../app.js");
    const res = await request(app)
      .post("/api/admin/test-notification")
      .set("x-admin-secret", "admin-secret-for-testing-1");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("returns 429 when called again within the 5-minute window", async () => {
    const { default: app } = await import("../app.js");

    // Simulate a send 30 seconds ago (within the 5-min cool-down).
    store["test_notification_last_sent"] = String(Date.now() - 30_000);

    const res = await request(app)
      .post("/api/admin/test-notification")
      .set("x-admin-secret", "admin-secret-for-testing-1");
    expect(res.status).toBe(429);
    expect(typeof res.body.retryAfterSeconds).toBe("number");
    expect(res.body.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("allows a request after the cool-down window has elapsed", async () => {
    const { default: app } = await import("../app.js");

    // Simulate a send 6 minutes ago (outside the 5-min window).
    store["test_notification_last_sent"] = String(Date.now() - 6 * 60 * 1000);

    const res = await request(app)
      .post("/api/admin/test-notification")
      .set("x-admin-secret", "admin-secret-for-testing-1");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("records the send timestamp in the DB so the limit persists", async () => {
    const { default: app } = await import("../app.js");

    expect(store["test_notification_last_sent"]).toBeUndefined();

    await request(app)
      .post("/api/admin/test-notification")
      .set("x-admin-secret", "admin-secret-for-testing-1");

    expect(store["test_notification_last_sent"]).toBeDefined();
    const ts = Number(store["test_notification_last_sent"]);
    expect(ts).toBeGreaterThan(Date.now() - 5000);
  });
});
