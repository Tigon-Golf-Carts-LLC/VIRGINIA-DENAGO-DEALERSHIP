import { ReplitConnectors } from "@replit/connectors-sdk";
import { db, appSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

/**
 * Sends a notification email via the connected Gmail account.
 * The email is sent from and to the same Gmail address (self-notification).
 *
 * Failed attempts are retried up to MAX_RETRIES times with an exponential
 * back-off delay. If all retries are exhausted a structured error is emitted
 * so it surfaces clearly in logs / monitoring, and a flag is persisted in the
 * database so the admin panel can show an in-app warning banner.
 *
 * Failures never propagate to the caller — review submissions are not blocked.
 */

const MAX_RETRIES = 2; // total attempts = 1 initial + MAX_RETRIES retries
const RETRY_BASE_DELAY_MS = 1_000; // 1 s → 2 s

/** Database key used to store the last notification error message. */
export const NOTIFICATION_ERROR_KEY = "notification_error";

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

  const recipient = process.env.REVIEW_NOTIFY_EMAIL || email;

  const raw = buildMessage(
    email,
    recipient,
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

/** Persist an error message in the DB so the admin panel can surface it. */
async function setNotificationError(message: string): Promise<void> {
  try {
    await db
      .insert(appSettingsTable)
      .values({ key: NOTIFICATION_ERROR_KEY, value: message })
      .onConflictDoUpdate({
        target: appSettingsTable.key,
        set: { value: message, updatedAt: new Date() },
      });
  } catch (err) {
    console.warn("[review-notify] Failed to persist notification error flag:", err);
  }
}

/** Clear the error flag after a successful send. */
async function clearNotificationError(): Promise<void> {
  try {
    await db
      .delete(appSettingsTable)
      .where(eq(appSettingsTable.key, NOTIFICATION_ERROR_KEY));
  } catch (err) {
    console.warn("[review-notify] Failed to clear notification error flag:", err);
  }
}

/**
 * Sends a short test email to confirm the Gmail connection is healthy.
 * Returns true on success, false on failure (and persists the error flag).
 *
 * Both the profile fetch and the send call use the same 5xx-only retry
 * classifier inside a single loop (up to MAX_RETRIES retries with exponential
 * back-off), matching sendReviewNotification's behaviour.  A brief Gmail
 * hiccup during either step therefore doesn't produce a false "broken
 * connection" report.
 *
 * All other failures are reported immediately without retrying:
 *   - Constructor throws (connector absent/unconfigured)
 *   - Non-5xx HTTP responses (401/403, 400, 404, …) — auth or config problems
 *   - Thrown transport/proxy/JSON exceptions — not a 5xx server response
 */
export async function sendTestNotification(): Promise<{ ok: boolean; error?: string }> {
  let lastError: string | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = RETRY_BASE_DELAY_MS * attempt;
      console.warn(
        `[review-notify] Retrying test notification (attempt ${attempt}/${MAX_RETRIES}) after ${delay} ms …`
      );
      await sleep(delay);
    }

    // Constructor failure means the connector is absent — report immediately.
    let connectors: ReplitConnectors;
    try {
      connectors = new ReplitConnectors();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await setNotificationError(message);
      return { ok: false, error: message };
    }

    // ── Profile fetch ────────────────────────────────────────────────────────
    // Use cached email when available; otherwise fetch and classify the response.
    // Transport/JSON exceptions → immediate fail (not a 5xx HTTP response).
    // Non-5xx HTTP errors       → immediate fail (auth/config, won't resolve).
    // 5xx HTTP errors           → transient; continue the retry loop.
    let email: string;
    if (cachedEmail) {
      email = cachedEmail;
    } else {
      let profileResp: Awaited<ReturnType<ReplitConnectors["proxy"]>>;
      try {
        profileResp = await connectors.proxy("google-mail", "/gmail/v1/users/me/profile", {
          method: "GET",
        });
      } catch (err) {
        // Transport/proxy exception — not a server response; report immediately.
        const message = err instanceof Error ? err.message : String(err);
        await setNotificationError(message);
        return { ok: false, error: message };
      }

      if (!profileResp.ok) {
        const detail = await profileResp.text().catch(() => "(no body)");
        const message = `Gmail profile fetch failed: ${profileResp.status}: ${detail}`;
        if (profileResp.status >= 500) {
          // Transient server error — retry.
          lastError = message;
          console.warn(
            `[review-notify] Test notification attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
            message
          );
          continue;
        }
        // Non-5xx (401, 403, 400, 404, …) — report immediately.
        await setNotificationError(message);
        return { ok: false, error: message };
      }

      let profileData: unknown;
      try {
        profileData = await profileResp.json();
      } catch (err) {
        // JSON parse error — not a 5xx; report immediately.
        const message = err instanceof Error ? err.message : String(err);
        await setNotificationError(message);
        return { ok: false, error: message };
      }

      // Guard against non-object shapes (null, arrays, bare strings) that
      // would throw if we accessed .emailAddress directly.
      if (
        profileData == null ||
        typeof profileData !== "object" ||
        Array.isArray(profileData) ||
        typeof (profileData as Record<string, unknown>).emailAddress !== "string" ||
        !(profileData as Record<string, unknown>).emailAddress
      ) {
        const message = `Gmail profile response is missing the emailAddress field (unexpected API shape)`;
        await setNotificationError(message);
        return { ok: false, error: message };
      }

      cachedEmail = (profileData as { emailAddress: string }).emailAddress;
      email = cachedEmail;
    }

    // ── Send ─────────────────────────────────────────────────────────────────
    const recipient = process.env.REVIEW_NOTIFY_EMAIL || email;
    const body = [
      `This is a test notification from DENAGO Dealership.`,
      ``,
      `Your Gmail connection is working correctly. Review alerts will be`,
      `delivered to this address when new customer reviews are submitted.`,
      ``,
      `---`,
      `Sent from the DENAGO admin panel.`,
    ].join("\n");

    const raw = buildMessage(email, recipient, `[DENAGO] Test notification`, body);

    let resp: Awaited<ReturnType<ReplitConnectors["proxy"]>>;
    try {
      resp = await connectors.proxy("google-mail", "/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: toBase64Url(raw) }),
      });
    } catch (err) {
      // Transport/proxy exception — not a 5xx; report immediately.
      const message = err instanceof Error ? err.message : String(err);
      await setNotificationError(message);
      return { ok: false, error: message };
    }

    if (resp.ok) {
      await clearNotificationError();
      return { ok: true };
    }

    const text = await resp.text().catch(() => "(no body)");
    const message = `Gmail send failed ${resp.status}: ${text}`;

    if (resp.status === 401 || resp.status === 403) {
      // Auth failure — retrying won't help; report immediately.
      cachedEmail = null;
      await setNotificationError(message);
      return { ok: false, error: message };
    }

    if (resp.status >= 500) {
      // Transient server error — record and retry.
      lastError = message;
      console.warn(
        `[review-notify] Test notification attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        message
      );
      continue;
    }

    // Other non-ok status (400, 404, …) — config/validation problem;
    // retrying won't help; report immediately.
    await setNotificationError(message);
    return { ok: false, error: message };
  }

  // All retries exhausted — persist the error so the admin banner shows.
  const message = lastError ?? "Unknown error";
  await setNotificationError(message);
  return { ok: false, error: message };
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
      // Success — clear any previous error flag so the banner goes away.
      await clearNotificationError();
      return;
    } catch (err) {
      lastError = err;
      console.warn(
        `[review-notify] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed:`,
        err
      );
    }
  }

  // All retries exhausted — emit a structured error for monitoring and
  // persist the error flag so the admin panel can show a warning banner.
  const errorMessage =
    lastError instanceof Error ? lastError.message : String(lastError);

  console.error("[review-notify] NOTIFICATION_FAILED", {
    event: "review_notification_failed",
    reviewer: review.author,
    rating: review.rating,
    attemptsTotal: MAX_RETRIES + 1,
    error: errorMessage,
    timestamp: new Date().toISOString(),
  });

  await setNotificationError(errorMessage);
}
