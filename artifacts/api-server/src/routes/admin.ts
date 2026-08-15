import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { db, pool, reviewsTable, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { NOTIFICATION_ERROR_KEY, sendTestNotification } from "../lib/gmail-notify";
import {
  ADMIN_SECRET_KEY,
  TEST_NOTIFICATION_LAST_SENT_KEY,
  TEST_NOTIF_MIN_INTERVAL_MS,
  hashSecret,
  verifySecret,
  computeCooldownMs,
} from "./admin-helpers.js";

const router: IRouter = Router();

/**
 * Per-request map from Request object → the stored credential value that
 * adminAuth resolved.  Using a WeakMap avoids mutating the Request type and
 * ensures the entry is GC'd when the request is done.
 */
const resolvedSecrets = new WeakMap<Request, string>();

/* ------------------------------------------------------------------ */
/* Auth middleware                                                      */
/* ------------------------------------------------------------------ */

/**
 * Retrieve the current stored secret (scrypt hash or plain env-var fallback).
 * Queries the database on every call — no per-process cache — so a rotation
 * from any instance takes effect immediately for all instances.
 * Returns null when neither source is configured.
 */
async function getStoredSecret(): Promise<string | null> {
  const [row] = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, ADMIN_SECRET_KEY));

  if (row?.value) return row.value;

  // Fall back to environment variable (first-run / pre-rotation path).
  return process.env.ADMIN_SECRET ?? null;
}

async function adminAuth(req: Request, res: Response, next: NextFunction) {
  const stored = await getStoredSecret();
  if (!stored) {
    res
      .status(503)
      .json({ error: "Admin access is not configured on this server." });
    return;
  }
  const provided = req.headers["x-admin-secret"];
  if (typeof provided !== "string") {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }
  const ok = await verifySecret(provided, stored);
  if (!ok) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }
  // Store the *provided* plaintext so rotate-secret can re-verify it against
  // the DB value inside the transaction (binding the write to the authed cred).
  resolvedSecrets.set(req, provided);
  next();
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

// List all pending (unapproved) reviews.
router.get("/admin/reviews", adminAuth, async (_req, res) => {
  const rows = await db
    .select()
    .from(reviewsTable)
    .where(eq(reviewsTable.approved, false))
    .orderBy(reviewsTable.createdAt);
  res.json(rows);
});

// Approve a review — sets approved = true so it appears publicly.
router.post("/admin/reviews/:id/approve", adminAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ error: "Invalid review id." });
    return;
  }
  const [row] = await db
    .update(reviewsTable)
    .set({ approved: true })
    .where(eq(reviewsTable.id, id))
    .returning({ id: reviewsTable.id });
  if (!row) {
    res.status(404).json({ error: "Review not found." });
    return;
  }
  res.json({ ok: true });
});

// Return current notification error status (null when no error).
router.get("/admin/notification-status", adminAuth, async (_req, res) => {
  const [row] = await db
    .select()
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, NOTIFICATION_ERROR_KEY));
  if (!row) {
    res.json({ error: null });
    return;
  }
  res.json({ error: row.value, updatedAt: row.updatedAt });
});

// Send a test notification email to verify the Gmail connection.
// Rate-limited: at most one per 5 minutes, enforced with an atomic
// conditional upsert so concurrent authenticated requests cannot both
// pass the cooldown window simultaneously.
router.post("/admin/test-notification", adminAuth, async (_req, res) => {
  // Atomically claim the rate-limit slot.
  // The INSERT succeeds on first use; the ON CONFLICT branch only fires
  // when the existing row is old enough (cooldown elapsed).
  // rowCount === 0 means the cooldown is still active.
  const claimResult = await pool.query<{ updated_at: Date }>(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, updated_at = NOW()
       WHERE app_settings.updated_at < NOW() - ($3 || ' milliseconds')::interval
     RETURNING updated_at`,
    [TEST_NOTIFICATION_LAST_SENT_KEY, String(Date.now()), String(TEST_NOTIF_MIN_INTERVAL_MS)],
  );

  if (claimResult.rowCount === 0) {
    // Cooldown still active — fetch the stored timestamp to report how long to wait.
    const [lastRow] = await db
      .select()
      .from(appSettingsTable)
      .where(eq(appSettingsTable.key, TEST_NOTIFICATION_LAST_SENT_KEY));
    const remaining = lastRow
      ? computeCooldownMs(Number(lastRow.value), Date.now())
      : 0;
    res.status(429).json({
      error: `Please wait ${Math.ceil(remaining / 1000)} seconds before sending another test email.`,
      retryAfterSeconds: Math.ceil(remaining / 1000),
    });
    return;
  }

  const result = await sendTestNotification();
  if (result.ok) {
    res.json({ ok: true });
  } else {
    res.status(502).json({ ok: false, error: result.error });
  }
});

// Dismiss the notification error banner (deletes the flag).
router.delete("/admin/notification-status", adminAuth, async (_req, res) => {
  await db
    .delete(appSettingsTable)
    .where(eq(appSettingsTable.key, NOTIFICATION_ERROR_KEY));
  res.json({ ok: true });
});

// Reject a review — permanently deletes it.
router.delete("/admin/reviews/:id", adminAuth, async (req, res) => {
  const id = Number(req.params["id"]);
  if (!Number.isFinite(id) || id <= 0) {
    res.status(400).json({ error: "Invalid review id." });
    return;
  }
  const [row] = await db
    .delete(reviewsTable)
    .where(eq(reviewsTable.id, id))
    .returning({ id: reviewsTable.id });
  if (!row) {
    res.status(404).json({ error: "Review not found." });
    return;
  }
  res.json({ ok: true });
});

/**
 * POST /admin/rotate-secret
 * Body: { newSecret: string }
 *
 * Atomically rotates the admin secret:
 * 1. Opens a transaction and locks the admin_secret row with SELECT … FOR UPDATE.
 * 2. Re-verifies that the stored credential still matches what was authenticated
 *    (guards against a concurrent rotation that already changed the secret).
 * 3. Writes the new scrypt hash and commits.
 *
 * Returns 409 if the secret was changed by a concurrent request between the
 * authentication check and the write — the caller should re-authenticate with
 * the current secret and retry.
 *
 * Requires the current secret in the x-admin-secret header (via adminAuth).
 * The endpoint is operator-facing and is called via curl or an admin tool;
 * no front-end form is included because the admin UI does not hold a session.
 */
router.post("/admin/rotate-secret", adminAuth, async (req, res) => {
  const { newSecret } = req.body as { newSecret?: unknown };
  if (typeof newSecret !== "string" || newSecret.trim().length < 16) {
    res.status(400).json({
      error: "newSecret must be a string of at least 16 characters.",
    });
    return;
  }

  const authenticatedWith = resolvedSecrets.get(req)!;
  const hashed = await hashSecret(newSecret.trim());

  // Use a transaction with SELECT … FOR UPDATE to serialize concurrent
  // rotations.  If the stored credential changed between auth and write,
  // abort with 409 so the caller can re-authenticate.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Acquire an exclusive transaction-scoped advisory lock keyed on the
    // admin_secret settings key.  This serializes ALL rotations — including
    // the initial one where no row exists yet (SELECT…FOR UPDATE locks
    // nothing when the row is absent, leaving the no-row path unprotected).
    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      [ADMIN_SECRET_KEY],
    );

    const { rows } = await client.query<{ value: string }>(
      "SELECT value FROM app_settings WHERE key = $1",
      [ADMIN_SECRET_KEY],
    );

    const currentInDb: string | null = rows[0]?.value ?? null;
    const envSecret = process.env.ADMIN_SECRET ?? null;

    // Determine whether the credential we authenticated with is still current.
    let authStillValid: boolean;
    if (currentInDb !== null) {
      // A DB record exists — it must still match what we authenticated with.
      authStillValid = await verifySecret(authenticatedWith, currentInDb);
    } else {
      // No DB record — the env-var fallback must match (plaintext comparison).
      authStillValid =
        envSecret !== null && authenticatedWith === envSecret;
    }

    if (!authStillValid) {
      await client.query("ROLLBACK");
      res.status(409).json({
        error:
          "The admin secret was changed by a concurrent request. " +
          "Re-authenticate with the current secret and try again.",
      });
      return;
    }

    await client.query(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = NOW()`,
      [ADMIN_SECRET_KEY, hashed],
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  res.json({ ok: true });
});

export default router;
