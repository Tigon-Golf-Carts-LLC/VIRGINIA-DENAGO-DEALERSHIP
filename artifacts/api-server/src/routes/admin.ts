import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { db, reviewsTable, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { NOTIFICATION_ERROR_KEY, sendTestNotification } from "../lib/gmail-notify";

const router: IRouter = Router();

/* ------------------------------------------------------------------ */
/* Per-IP rate limiter for test-notification (1 req / 60 s)           */
/* ------------------------------------------------------------------ */

const TEST_NOTIFICATION_WINDOW_MS = 60_000;
/** Map of IP → timestamp of last accepted request */
const testNotificationLastSent = new Map<string, number>();

function testNotificationRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Use the rightmost trusted forwarded IP, falling back to socket address.
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (Array.isArray(forwarded) ? forwarded[forwarded.length - 1] : forwarded?.split(",").pop()?.trim()) ??
    req.socket.remoteAddress ??
    "unknown";

  const now = Date.now();
  const last = testNotificationLastSent.get(ip) ?? 0;
  const elapsed = now - last;

  if (elapsed < TEST_NOTIFICATION_WINDOW_MS) {
    const retryAfter = Math.ceil((TEST_NOTIFICATION_WINDOW_MS - elapsed) / 1000);
    res.setHeader("Retry-After", String(retryAfter));
    res.status(429).json({
      error: "Too many requests. Please wait before sending another test email.",
      retryAfter,
    });
    return;
  }

  testNotificationLastSent.set(ip, now);
  next();
}

/* ------------------------------------------------------------------ */
/* Auth middleware                                                      */
/* ------------------------------------------------------------------ */

function adminAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    res
      .status(503)
      .json({ error: "Admin access is not configured on this server." });
    return;
  }
  const provided = req.headers["x-admin-secret"];
  if (!provided || provided !== secret) {
    res.status(401).json({ error: "Unauthorized." });
    return;
  }
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
router.post("/admin/test-notification", adminAuth, testNotificationRateLimit, async (_req, res) => {
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

export default router;
