import { ReplitConnectors } from "@replit/connectors-sdk";

/**
 * Sends a notification email via the connected Gmail account.
 * The email is sent from and to the same Gmail address (self-notification).
 *
 * Failed attempts are retried up to MAX_RETRIES times with an exponential
 * back-off delay. If all retries are exhausted a structured error is emitted
 * so it surfaces clearly in logs / monitoring.
 *
 * Failures never propagate to the caller — review submissions are not blocked.
 */

const MAX_RETRIES = 2; // total attempts = 1 initial + MAX_RETRIES retries
const RETRY_BASE_DELAY_MS = 1_000; // 1 s → 2 s

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let cachedEmail: string | null = null;

async function getAccountEmail(connectors: ReplitConnectors): Promise<string> {
  if (cachedEmail) return cachedEmail;
  const resp = await connectors.proxy("google-mail", "/gmail/v1/users/me/profile", {
    method: "GET",
  });
  if (!resp.ok) throw new Error(`Gmail profile fetch failed: ${resp.status}`);
  const data = (await resp.json()) as { emailAddress: string };
  cachedEmail = data.emailAddress;
  return cachedEmail;
}

/** Encode a raw RFC 2822 message as base64url (no padding). */
function toBase64Url(raw: string): string {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function buildMessage(
  from: string,
  to: string,
  subject: string,
  body: string
): string {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="UTF-8"`,
    ``,
    body,
  ];
  return lines.join("\r\n");
}

export interface ReviewPayload {
  author: string;
  location?: string | null;
  model?: string | null;
  rating: number;
  title: string;
  text: string;
}

/**
 * Inner function that actually sends the email.
 * Throws on any failure so the retry wrapper can catch it.
 */
async function attemptSend(review: ReviewPayload): Promise<void> {
  const connectors = new ReplitConnectors();

  // If a previous profile fetch was cached but is now stale (token revoked),
  // clear the cache so the next attempt re-fetches.
  const email = await getAccountEmail(connectors);

  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const body = [
    `A new customer review is waiting for your approval.`,
    ``,
    `Reviewer : ${review.author}${review.location ? ` (${review.location})` : ""}`,
    `Rating   : ${stars} (${review.rating}/5)`,
    review.model ? `Model    : ${review.model}` : null,
    `Title    : ${review.title}`,
    ``,
    review.text,
    ``,
    `---`,
    `Log in to the DENAGO dealership admin panel to approve or reject this review.`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const raw = buildMessage(
    email,
    email,
    `[DENAGO] New review from ${review.author} — ${stars}`,
    body
  );

  const resp = await connectors.proxy(
    "google-mail",
    "/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw: toBase64Url(raw) }),
    }
  );

  if (!resp.ok) {
    // A 401/403 usually means the OAuth token is expired or revoked.
    // Clear the cached email address so the next retry re-authenticates.
    if (resp.status === 401 || resp.status === 403) {
      cachedEmail = null;
    }
    const text = await resp.text().catch(() => "(no body)");
    throw new Error(`Gmail send failed ${resp.status}: ${text}`);
  }
}

export async function sendReviewNotification(review: ReviewPayload): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_BASE_DELAY_MS * attempt;
      console.warn(
        `[review-notify] Retrying email notification (attempt ${attempt}/${MAX_RETRIES}) after ${delay} ms …`
      );
      await sleep(delay);
    }

    try {
      await attemptSend(review);
      return; // success — exit early
    } catch (err) {
      lastError = err;
      console.warn(
        `[review-notify] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        err
      );
    }
  }

  // All retries exhausted — emit a structured error for monitoring.
  console.error("[review-notify] NOTIFICATION_FAILED", {
    event: "review_notification_failed",
    reviewer: review.author,
    rating: review.rating,
    attemptsTotal: MAX_RETRIES + 1,
    error: lastError instanceof Error ? lastError.message : String(lastError),
    timestamp: new Date().toISOString(),
  });
}
