import { ReplitConnectors } from "@replit/connectors-sdk";

/**
 * Sends a notification email via the connected Gmail account.
 * The email is sent from and to the same Gmail address (self-notification).
 *
 * Failures are caught and logged — they never propagate to the caller.
 */

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

export async function sendReviewNotification(review: ReviewPayload): Promise<void> {
  try {
    const connectors = new ReplitConnectors();
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
      const text = await resp.text().catch(() => "(no body)");
      throw new Error(`Gmail send failed ${resp.status}: ${text}`);
    }
  } catch (err) {
    // Notification failures must never block the review submission.
    console.error("[review-notify] Failed to send email:", err);
  }
}
