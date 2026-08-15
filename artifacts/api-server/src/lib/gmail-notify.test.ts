/**
 * Unit tests for sendReviewNotification.
 *
 * The Gmail API is mocked so no real network calls are made.
 * Each test resets modules so the module-level `cachedEmail` starts fresh.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACCOUNT_EMAIL = "owner@gmail.com";

const sampleReview = {
  author: "Jane Doe",
  location: "Austin, TX",
  model: "Denago Citi",
  rating: 5,
  title: "Love this bike",
  text: "Absolutely fantastic ride.",
};

/**
 * Build a vi.doMock factory for @replit/connectors-sdk whose `proxy` method:
 *  - Returns a profile response for GET …/me/profile
 *  - Returns a 200 OK for POST …/messages/send
 * Returns the spy so callers can inspect its calls.
 */
function mockConnectors() {
  const proxySpy = vi.fn(async (_service: string, path: string, _opts?: unknown) => {
    if (path.endsWith("/me/profile")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
        text: async () => "",
      };
    }
    if (path.endsWith("/messages/send")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({ id: "msg-1" }),
        text: async () => "",
      };
    }
    return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
  });

  // ReplitConnectors must be a real constructable class, not an arrow function.
  class FakeConnectors {
    proxy = proxySpy;
  }

  vi.doMock("@replit/connectors-sdk", () => ({
    ReplitConnectors: FakeConnectors,
  }));

  return proxySpy;
}

/**
 * Extract the `To:` header value from the raw RFC 2822 message that was
 * base64url-encoded and sent to the Gmail API via the proxy spy.
 */
function extractToAddress(proxySpy: ReturnType<typeof vi.fn>): string {
  const sendCall = proxySpy.mock.calls.find((args) =>
    String(args[1]).endsWith("/messages/send")
  );
  if (!sendCall) throw new Error("No send call recorded on proxy spy");

  const opts = sendCall[2] as { body?: string };
  if (!opts?.body) throw new Error("No body in send call options");

  const parsed = JSON.parse(opts.body) as { raw: string };
  // Restore base64url → base64, then decode to UTF-8
  const base64 = parsed.raw.replace(/-/g, "+").replace(/_/g, "/");
  const raw = Buffer.from(base64, "base64").toString("utf-8");

  const match = raw.match(/^To: (.+)$/m);
  if (!match) throw new Error(`No To: header found in message:\n${raw}`);
  return match[1].trim();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("sendReviewNotification", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.REVIEW_NOTIFY_EMAIL;
    // Suppress retry delay during tests
    vi.useFakeTimers();
  });

  it("uses REVIEW_NOTIFY_EMAIL as the recipient when the env var is set", async () => {
    const proxySpy = mockConnectors();
    process.env.REVIEW_NOTIFY_EMAIL = "alerts@example.com";

    const { sendReviewNotification } = await import("./gmail-notify.js");
    const promise = sendReviewNotification(sampleReview);
    await vi.runAllTimersAsync();
    await promise;

    expect(extractToAddress(proxySpy)).toBe("alerts@example.com");
  });

  it("falls back to the Gmail account address when REVIEW_NOTIFY_EMAIL is not set", async () => {
    const proxySpy = mockConnectors();
    // env var intentionally absent

    const { sendReviewNotification } = await import("./gmail-notify.js");
    const promise = sendReviewNotification(sampleReview);
    await vi.runAllTimersAsync();
    await promise;

    expect(extractToAddress(proxySpy)).toBe(ACCOUNT_EMAIL);
  });

  it("uses REVIEW_NOTIFY_EMAIL even when its value looks like a plain username (non-standard address)", async () => {
    const proxySpy = mockConnectors();
    process.env.REVIEW_NOTIFY_EMAIL = "not-an-email";

    const { sendReviewNotification } = await import("./gmail-notify.js");
    const promise = sendReviewNotification(sampleReview);
    await vi.runAllTimersAsync();
    await promise;

    expect(extractToAddress(proxySpy)).toBe("not-an-email");
  });

  it("clears cachedEmail and retries successfully after a 401 from the send endpoint", async () => {
    let sendCallCount = 0;
    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string, _opts?: unknown) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        return {
          ok: true,
          status: 200,
          json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
          text: async () => "",
        };
      }
      if (path.endsWith("/messages/send")) {
        sendCallCount++;
        if (sendCallCount === 1) {
          // First attempt: simulate an expired/revoked OAuth token
          return {
            ok: false,
            status: 401,
            text: async () => "Token expired",
            json: async () => ({}),
          };
        }
        // Second attempt (retry): succeed
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: "msg-retry" }),
          text: async () => "",
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class RetryConnectors {
      proxy = proxySpy;
    }

    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: RetryConnectors,
    }));

    const { sendReviewNotification } = await import("./gmail-notify.js");
    const promise = sendReviewNotification(sampleReview);
    await vi.runAllTimersAsync();
    await promise;

    // Message must ultimately be delivered
    expect(sendCallCount).toBe(2);

    // cachedEmail was cleared after the 401, so the profile must be fetched
    // again on the retry (two profile calls total: one before each send)
    expect(profileCallCount).toBe(2);

    // The final send must have gone to the right address
    expect(extractToAddress(proxySpy)).toBe(ACCOUNT_EMAIL);
  });

  it("does not throw even when the Gmail API returns an error on every attempt", async () => {
    class FailConnectors {
      proxy = vi.fn(async (_service: string, path: string) => {
        if (path.endsWith("/me/profile")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
            text: async () => "",
          };
        }
        return {
          ok: false,
          status: 500,
          text: async () => "internal server error",
          json: async () => ({}),
        };
      });
    }

    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: FailConnectors,
    }));

    const { sendReviewNotification } = await import("./gmail-notify.js");
    const promise = sendReviewNotification(sampleReview);
    await vi.runAllTimersAsync();

    // Must resolve (not reject) — failures are swallowed to avoid blocking reviews.
    await expect(promise).resolves.toBeUndefined();
  });
});
