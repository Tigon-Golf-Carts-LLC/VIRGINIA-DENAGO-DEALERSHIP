import { Router, type IRouter, type Request } from "express";
import { db, reviewsTable, insertReviewSchema } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { sendReviewNotification } from "../lib/gmail-notify.js";

const router: IRouter = Router();

/* ------------------------------------------------------------------ */
/* Spam protection                                                     */
/* ------------------------------------------------------------------ */

// Per-IP rate limiting: max 3 submissions per hour, min 30s between.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const MIN_INTERVAL_MS = 30 * 1000;
const ipHistory = new Map<string, number[]>();

function clientIp(req: Request): string {
  // Use the RIGHTMOST X-Forwarded-For entry: it is appended by Replit's own
  // trusted proxy, while earlier entries can be spoofed by the client.
  const fwd = req.headers["x-forwarded-for"];
  const raw = Array.isArray(fwd) ? fwd.join(",") : fwd;
  const parts = raw?.split(",").map((p) => p.trim()).filter(Boolean) ?? [];
  return (parts[parts.length - 1] || req.socket.remoteAddress) ?? "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entries = (ipHistory.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (
    entries.length >= MAX_PER_WINDOW ||
    (entries.length > 0 && now - entries[entries.length - 1]! < MIN_INTERVAL_MS)
  ) {
    ipHistory.set(ip, entries);
    return true;
  }
  entries.push(now);
  ipHistory.set(ip, entries);
  // Keep the map bounded: prune expired keys, then evict oldest if needed.
  if (ipHistory.size > 2000) {
    for (const [key, times] of ipHistory) {
      if (times.every((t) => now - t >= WINDOW_MS)) ipHistory.delete(key);
    }
    while (ipHistory.size > 2000) {
      const oldest = ipHistory.keys().next().value;
      if (oldest === undefined) break;
      ipHistory.delete(oldest);
    }
  }
  return false;
}

const URL_PATTERN = /(https?:\/\/|www\.|\.(com|net|org|io|ru|cn|xyz)\b)/i;

function looksLikeSpam(fields: {
  author: string;
  title: string;
  text: string;
  location: string;
}): string | null {
  const combined = `${fields.author} ${fields.title} ${fields.text} ${fields.location}`;
  if (URL_PATTERN.test(combined)) return "Links are not allowed in reviews.";
  if (/<[a-z][\s\S]*>/i.test(combined)) return "HTML is not allowed.";
  // Excessive repetition of a single character (e.g. "aaaaaaaa")
  if (/(.)\1{9,}/.test(combined)) return "Review text looks invalid.";
  // Mostly non-letter garbage
  const letters = (fields.text.match(/[a-zA-Z]/g) ?? []).length;
  if (letters / fields.text.length < 0.5)
    return "Review text looks invalid.";
  return null;
}

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

// Public: approved reviews only.
router.get("/reviews", async (_req, res) => {
  const rows = await db
    .select({
      id: reviewsTable.id,
      author: reviewsTable.author,
      location: reviewsTable.location,
      model: reviewsTable.model,
      rating: reviewsTable.rating,
      title: reviewsTable.title,
      text: reviewsTable.text,
      createdAt: reviewsTable.createdAt,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.approved, true))
    .orderBy(desc(reviewsTable.createdAt));
  res.json(rows);
});

router.post("/reviews", async (req, res) => {
  const body = req.body ?? {};

  // Honeypot: real users never fill this hidden field.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    // Pretend success so bots don't learn.
    res.status(201).json({ status: "pending" });
    return;
  }

  // Timing check: form must have been open at least 3 seconds.
  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 3000) {
    res.status(400).json({ error: "Please take a moment before submitting." });
    return;
  }

  if (rateLimited(clientIp(req))) {
    res
      .status(429)
      .json({ error: "Too many submissions. Please try again later." });
    return;
  }

  const parsed = insertReviewSchema.safeParse({
    author: body.author,
    location: body.location ?? "",
    model: body.model || undefined,
    rating: Number(body.rating),
    title: body.title,
    text: body.text,
  });
  if (!parsed.success) {
    res.status(400).json({
      error:
        "Please check your entries — name (2+ chars), title, a 1–5 star rating, and a review of at least 20 characters are required.",
    });
    return;
  }

  const spamReason = looksLikeSpam({
    author: parsed.data.author,
    title: parsed.data.title,
    text: parsed.data.text,
    location: parsed.data.location ?? "",
  });
  if (spamReason) {
    res.status(400).json({ error: spamReason });
    return;
  }

  await db.insert(reviewsTable).values({ ...parsed.data, approved: false });

  // Fire-and-forget: send notification email without blocking the response.
  sendReviewNotification(parsed.data).catch(() => {/* already logged inside */});

  res.status(201).json({ status: "pending" });
});

export default router;
