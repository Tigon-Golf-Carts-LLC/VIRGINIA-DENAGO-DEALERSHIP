/**
 * Unit tests for sendReviewNotification and sendTestNotification.
 *
 * The Gmail API and database are mocked so no real network or DB calls are
 * made. Each test resets modules so the module-level `cachedEmail` starts
 * fresh.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// ---------------------------------------------------------------------------
// DB mock (used by sendTestNotification via setNotificationError /
// clearNotificationError)
// ---------------------------------------------------------------------------

/** Shared fake for the drizzle db object. Returned by the @workspace/db mock. */
function mockDb() {
  const insertSpy = vi.fn().mockReturnValue({
    onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
  });
  const deleteSpy = vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue(undefined),
  });

  vi.doMock("@workspace/db", () => ({
    db: { insert: insertSpy, delete: deleteSpy },
    appSettingsTable: {},
    reviewsTable: {},
    eq: vi.fn(),
  }));

  return { insertSpy, deleteSpy };
}

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

  it("clears cachedEmail and retries successfully after a 403 from the send endpoint", async () => {
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
          // First attempt: simulate a revoked OAuth token (403 Access Denied)
          return {
            ok: false,
            status: 403,
            text: async () => "Access Denied",
            json: async () => ({}),
          };
        }
        // Second attempt (retry): succeed
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: "msg-retry-403" }),
          text: async () => "",
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class Retry403Connectors {
      proxy = proxySpy;
    }

    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: Retry403Connectors,
    }));

    const { sendReviewNotification } = await import("./gmail-notify.js");
    const promise = sendReviewNotification(sampleReview);
    await vi.runAllTimersAsync();
    await promise;

    // Message must ultimately be delivered
    expect(sendCallCount).toBe(2);

    // cachedEmail was cleared after the 403, so the profile must be fetched
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

  it("resolves silently and records the error when Gmail access is permanently revoked (403 on every attempt)", async () => {
    let sendCallCount = 0;

    // Track DB upsert calls — chain: insert().values().onConflictDoUpdate()
    const onConflictDoUpdateSpy = vi.fn().mockResolvedValue(undefined);
    const valuesSpy = vi.fn().mockReturnValue({ onConflictDoUpdate: onConflictDoUpdateSpy });
    const dbInsertSpy = vi.fn().mockReturnValue({ values: valuesSpy });
    const dbDeleteSpy = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    vi.doMock("@workspace/db", () => ({
      db: {
        insert: dbInsertSpy,
        delete: dbDeleteSpy,
      },
      appSettingsTable: {},
      eq: vi.fn(),
    }));

    class PermanentlyRevokedConnectors {
      proxy = vi.fn(async (_service: string, path: string) => {
        if (path.endsWith("/me/profile")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
            text: async () => "",
          };
        }
        if (path.endsWith("/messages/send")) {
          sendCallCount++;
          // Every attempt returns 403 — access is permanently revoked
          return {
            ok: false,
            status: 403,
            text: async () => "Access Denied",
            json: async () => ({}),
          };
        }
        return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
      });
    }

    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: PermanentlyRevokedConnectors,
    }));

    const { sendReviewNotification, NOTIFICATION_ERROR_KEY } = await import("./gmail-notify.js");
    const promise = sendReviewNotification(sampleReview);
    await vi.runAllTimersAsync();

    // Must resolve, never reject — review submissions must not be blocked
    await expect(promise).resolves.toBeUndefined();

    // All attempts must have been made (1 initial + MAX_RETRIES retries = 3 total)
    expect(sendCallCount).toBe(3);

    // The error must be persisted in the DB so the admin panel can surface it
    expect(dbInsertSpy).toHaveBeenCalled();
    expect(valuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ value: expect.stringContaining("403") })
    );
    expect(onConflictDoUpdateSpy).toHaveBeenCalled();
  });

  it("resolves silently and records the error when ReplitConnectors constructor throws (connector not installed)", async () => {
    const onConflictDoUpdateSpy = vi.fn().mockResolvedValue(undefined);
    const valuesSpy = vi.fn().mockReturnValue({ onConflictDoUpdate: onConflictDoUpdateSpy });
    const dbInsertSpy = vi.fn().mockReturnValue({ values: valuesSpy });
    const dbDeleteSpy = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    vi.doMock("@workspace/db", () => ({
      db: {
        insert: dbInsertSpy,
        delete: dbDeleteSpy,
      },
      appSettingsTable: {},
      eq: vi.fn(),
    }));

    // Simulate the connector not being installed: constructor throws synchronously.
    class ThrowingConnectors {
      constructor() {
        throw new Error("Connector not configured: google-mail");
      }
      proxy = vi.fn();
    }

    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: ThrowingConnectors,
    }));

    const { sendReviewNotification } = await import("./gmail-notify.js");
    const promise = sendReviewNotification(sampleReview);
    await vi.runAllTimersAsync();

    // Must resolve, never reject — review submissions must not be blocked
    await expect(promise).resolves.toBeUndefined();

    // The error must be persisted in the DB so the admin panel can surface it
    expect(dbInsertSpy).toHaveBeenCalled();
    expect(valuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ value: expect.stringContaining("Connector not configured") })
    );
    expect(onConflictDoUpdateSpy).toHaveBeenCalled();
  });

  it("resolves silently and records the error when the proxy call throws synchronously (no OAuth session)", async () => {
    const onConflictDoUpdateSpy = vi.fn().mockResolvedValue(undefined);
    const valuesSpy = vi.fn().mockReturnValue({ onConflictDoUpdate: onConflictDoUpdateSpy });
    const dbInsertSpy = vi.fn().mockReturnValue({ values: valuesSpy });
    const dbDeleteSpy = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    vi.doMock("@workspace/db", () => ({
      db: {
        insert: dbInsertSpy,
        delete: dbDeleteSpy,
      },
      appSettingsTable: {},
      eq: vi.fn(),
    }));

    // Simulate no OAuth session at all: proxy throws on every call instead of
    // returning a response object.
    class NoSessionConnectors {
      proxy = vi.fn(() => {
        throw new Error("No OAuth session for google-mail");
      });
    }

    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: NoSessionConnectors,
    }));

    const { sendReviewNotification } = await import("./gmail-notify.js");
    const promise = sendReviewNotification(sampleReview);
    await vi.runAllTimersAsync();

    // Must resolve, never reject — review submissions must not be blocked
    await expect(promise).resolves.toBeUndefined();

    // The error must be persisted in the DB so the admin panel can surface it
    expect(dbInsertSpy).toHaveBeenCalled();
    expect(valuesSpy).toHaveBeenCalledWith(
      expect.objectContaining({ value: expect.stringContaining("No OAuth session") })
    );
    expect(onConflictDoUpdateSpy).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// sendTestNotification — token-refresh scenarios
// ---------------------------------------------------------------------------

describe("sendTestNotification", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.REVIEW_NOTIFY_EMAIL;
    vi.useFakeTimers();
  });

  it("succeeds on the happy path and clears any existing error flag", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    const proxySpy = mockConnectors();

    const { sendTestNotification } = await import("./gmail-notify.js");
    const result = await sendTestNotification();

    expect(result).toEqual({ ok: true });

    // Profile was fetched once and send was called once
    expect(proxySpy).toHaveBeenCalledWith(
      "google-mail",
      expect.stringContaining("/me/profile"),
      expect.anything()
    );
    expect(proxySpy).toHaveBeenCalledWith(
      "google-mail",
      expect.stringContaining("/messages/send"),
      expect.anything()
    );

    // clearNotificationError ran (a DELETE on appSettingsTable)
    expect(deleteSpy).toHaveBeenCalled();
    // No error was persisted
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it("delivers the test email after a full token-refresh cycle (stale token 401 → connector refreshes → next send succeeds)", async () => {
    // Models the real-world scenario:
    //   1. Owner clicks "Send test email". The in-process cachedEmail is populated
    //      from a previous request. The connector proxy sends with the cached OAuth
    //      token, but that token has just expired → Gmail returns 401.
    //   2. The code detects the 401, clears cachedEmail, and returns ok:false.
    //   3. The Replit connector proxy completes its internal token refresh cycle.
    //   4. Owner clicks again. Code re-fetches the profile (getting a fresh
    //      credential from the proxy) and sends successfully.
    //
    // We simulate steps 1-4 in two separate sendTestNotification() calls:
    //   call 1 → proxy returns 401 on send  (stale-token window)
    //   call 2 → proxy returns 200 on send  (post-refresh, fresh-token window)
    mockDb();

    let profileCallCount = 0;
    let sendCallCount = 0;

    // The proxy explicitly changes behavior between call 1 and call 2 to
    // represent the connector completing its token refresh.
    const proxySpy = vi.fn(async (_service: string, path: string) => {
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
          // Stale-token window: connector tried the cached token, Gmail rejected it.
          return { ok: false, status: 401, text: async () => "Token has been expired or revoked.", json: async () => ({}) };
        }
        // Post-refresh window: connector has obtained a new token, send succeeds.
        return { ok: true, status: 200, json: async () => ({ id: "msg-after-refresh" }), text: async () => "" };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class TokenRefreshConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: TokenRefreshConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");

    // Call 1 — stale-token window: must fail and clear cachedEmail.
    const first = await sendTestNotification();
    expect(first.ok).toBe(false);
    expect(first.error).toMatch(/401/);
    expect(profileCallCount).toBe(1);
    expect(sendCallCount).toBe(1);

    // Call 2 — post-refresh window: the connector has a fresh token.
    // cachedEmail was cleared, so a new profile request goes out to pick up
    // fresh credentials from the connector, then the send succeeds.
    const second = await sendTestNotification();
    expect(second.ok).toBe(true);
    // Profile must be re-fetched — a stale in-process cache must not be reused
    // after a 401, as it would skip the credential handshake with the connector.
    expect(profileCallCount).toBe(2);
    expect(sendCallCount).toBe(2);
  });

  it("returns ok:false and sets the error banner when the send returns 401 (expired token)", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    const proxySpy = vi.fn(async (_service: string, path: string) => {
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
          ok: false,
          status: 401,
          text: async () => "Token expired",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class ExpiredTokenConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: ExpiredTokenConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const result = await sendTestNotification();

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/401/);

    // Error banner must be persisted
    expect(insertSpy).toHaveBeenCalled();
    // clearNotificationError must NOT run on failure
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("returns ok:false and sets the error banner when the send returns 403 (access revoked)", async () => {
    const { insertSpy } = mockDb();

    const proxySpy = vi.fn(async (_service: string, path: string) => {
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
          ok: false,
          status: 403,
          text: async () => "Access Denied",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class RevokedConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: RevokedConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const result = await sendTestNotification();

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/403/);
    expect(insertSpy).toHaveBeenCalled();
  });

  it("surfaces the error banner immediately when the profile fetch returns 401 — no retries", async () => {
    const { insertSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        return {
          ok: false,
          status: 401,
          text: async () => "Unauthorized",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class FailProfile401Connectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: FailProfile401Connectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — must return immediately, no retry delay.
    const result = await sendTestNotification();

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    // Must not retry — a 401 profile response is not transient.
    expect(profileCallCount).toBe(1);
    // Error banner was persisted
    expect(insertSpy).toHaveBeenCalled();
  });

  it("surfaces the error banner immediately when the profile fetch returns 400 — no retries", async () => {
    const { insertSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        return {
          ok: false,
          status: 400,
          text: async () => "Bad Request",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class FailProfile400Connectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: FailProfile400Connectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — must return immediately, no retry delay.
    const result = await sendTestNotification();

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/400/);
    // Must not retry — 400 is a configuration error, not transient.
    expect(profileCallCount).toBe(1);
    expect(insertSpy).toHaveBeenCalled();
  });

  it("surfaces the error banner immediately when the profile fetch returns 404 — no retries", async () => {
    const { insertSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        return {
          ok: false,
          status: 404,
          text: async () => "Not Found",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class FailProfile404Connectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: FailProfile404Connectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — must return immediately, no retry delay.
    const result = await sendTestNotification();

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/404/);
    // Must not retry — 404 is a configuration error, not transient.
    expect(profileCallCount).toBe(1);
    expect(insertSpy).toHaveBeenCalled();
  });

  it("returns ok:false and persists the error when the profile fetch throws synchronously (no OAuth session)", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        throw new Error("No OAuth session for google-mail");
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class ThrowingProfileConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: ThrowingProfileConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — must return immediately without retrying.
    const result = await sendTestNotification();

    // Must resolve, not throw
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/No OAuth session/);

    // A thrown transport exception is not transient — must not retry
    expect(profileCallCount).toBe(1);

    // Error must be persisted to DB so the admin panel can surface it
    expect(insertSpy).toHaveBeenCalled();
    // clearNotificationError must NOT run on failure
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("reports a 400 immediately without retrying — non-5xx errors are not transient", async () => {
    mockDb();

    let sendCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
          text: async () => "",
        };
      }
      if (path.endsWith("/messages/send")) {
        sendCallCount++;
        return {
          ok: false,
          status: 400,
          text: async () => "Bad Request",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class Bad400Connectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: Bad400Connectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — must return immediately, no retry delay.
    const result = await sendTestNotification();

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/400/);
    // Must stop immediately — 400 is a configuration error, not a transient failure.
    expect(sendCallCount).toBe(1);
  });

  it("reports a 404 immediately without retrying — non-5xx errors are not transient", async () => {
    mockDb();

    let sendCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
          text: async () => "",
        };
      }
      if (path.endsWith("/messages/send")) {
        sendCallCount++;
        return {
          ok: false,
          status: 404,
          text: async () => "Not Found",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 999, text: async () => "unexpected", json: async () => ({}) };
    });

    class NotFound404Connectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: NotFound404Connectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — must return immediately, no retry delay.
    const result = await sendTestNotification();

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/404/);
    // Must stop immediately — 404 is not a transient failure.
    expect(sendCallCount).toBe(1);
  });

  it("returns ok:false and persists the error when ReplitConnectors constructor throws (connector not installed)", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    // Simulate the connector not being installed: constructor throws synchronously.
    class ThrowingConnectors {
      constructor() {
        throw new Error("Connector not configured: google-mail");
      }
      proxy = vi.fn();
    }

    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: ThrowingConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const result = await sendTestNotification();

    // Must resolve with ok:false, not throw
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/Connector not configured/);

    // Error must be persisted to DB so the admin panel can surface it
    expect(insertSpy).toHaveBeenCalled();
    // clearNotificationError must NOT run on failure
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("retries on a transient profile 5xx and succeeds when the second attempt's profile returns 200", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    let profileCallCount = 0;
    let sendCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        if (profileCallCount === 1) {
          // First attempt: transient Gmail outage on profile endpoint
          return {
            ok: false,
            status: 503,
            text: async () => "Service Unavailable",
            json: async () => ({}),
          };
        }
        // Second attempt: outage resolved
        return {
          ok: true,
          status: 200,
          json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
          text: async () => "",
        };
      }
      if (path.endsWith("/messages/send")) {
        sendCallCount++;
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: "msg-after-profile-retry" }),
          text: async () => "",
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class ProfileTransientOutageConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: ProfileTransientOutageConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const promise = sendTestNotification();
    await vi.runAllTimersAsync();
    const result = await promise;

    // Must ultimately succeed — a single profile 5xx should not mislead the owner
    expect(result).toEqual({ ok: true });
    expect(profileCallCount).toBe(2);
    expect(sendCallCount).toBe(1);

    // Success clears the error banner
    expect(deleteSpy).toHaveBeenCalled();
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it("reports failure after exhausting all retries when every profile attempt returns 5xx", async () => {
    const { insertSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        return {
          ok: false,
          status: 500,
          text: async () => "Internal Server Error",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class PersistentProfileOutageConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: PersistentProfileOutageConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const promise = sendTestNotification();
    await vi.runAllTimersAsync();
    const result = await promise;

    // Reports failure — but only after all retries are exhausted
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/500/);
    // 1 initial attempt + MAX_RETRIES (2) retries = 3 total
    expect(profileCallCount).toBe(3);
    // Error banner is persisted
    expect(insertSpy).toHaveBeenCalled();
  });

  it("retries on a transient 5xx and succeeds when the second attempt returns 200", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    let sendCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
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
          // First attempt: transient Gmail outage
          return {
            ok: false,
            status: 500,
            text: async () => "Internal Server Error",
            json: async () => ({}),
          };
        }
        // Second attempt: outage resolved
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: "msg-after-retry" }),
          text: async () => "",
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class TransientOutageConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: TransientOutageConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const promise = sendTestNotification();
    await vi.runAllTimersAsync();
    const result = await promise;

    // Must ultimately succeed — a single 5xx should not mislead the owner
    expect(result).toEqual({ ok: true });
    expect(sendCallCount).toBe(2);

    // Success clears the error banner
    expect(deleteSpy).toHaveBeenCalled();
    expect(insertSpy).not.toHaveBeenCalled();
  });

  it("reports failure only after exhausting all retries when every attempt returns 5xx", async () => {
    const { insertSpy } = mockDb();

    let sendCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
          text: async () => "",
        };
      }
      if (path.endsWith("/messages/send")) {
        sendCallCount++;
        return {
          ok: false,
          status: 503,
          text: async () => "Service Unavailable",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class PersistentOutageConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: PersistentOutageConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const promise = sendTestNotification();
    await vi.runAllTimersAsync();
    const result = await promise;

    // Reports failure — but only after all retries are exhausted
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/503/);
    // 1 initial attempt + MAX_RETRIES (2) retries = 3 total
    expect(sendCallCount).toBe(3);
    // Error banner is persisted
    expect(insertSpy).toHaveBeenCalled();
  });

  it("does not retry a 401 — auth failures are reported immediately with a single send attempt", async () => {
    mockDb();

    let sendCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
          text: async () => "",
        };
      }
      if (path.endsWith("/messages/send")) {
        sendCallCount++;
        return {
          ok: false,
          status: 401,
          text: async () => "Token expired",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class Instant401Connectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: Instant401Connectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const promise = sendTestNotification();
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/401/);
    // Must stop immediately — no retries for auth errors
    expect(sendCallCount).toBe(1);
  });

  it("does not retry a 403 — auth failures are reported immediately with a single send attempt", async () => {
    mockDb();

    let sendCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
          text: async () => "",
        };
      }
      if (path.endsWith("/messages/send")) {
        sendCallCount++;
        return {
          ok: false,
          status: 403,
          text: async () => "Access Denied",
          json: async () => ({}),
        };
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class Instant403Connectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: Instant403Connectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const promise = sendTestNotification();
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/403/);
    // Must stop immediately — no retries for auth errors
    expect(sendCallCount).toBe(1);
  });

  it("reports failure immediately when the send proxy throws a transport error — does not retry", async () => {
    mockDb();

    let sendCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ emailAddress: ACCOUNT_EMAIL }),
          text: async () => "",
        };
      }
      if (path.endsWith("/messages/send")) {
        sendCallCount++;
        // Simulate a transport/proxy exception (not an HTTP error response)
        throw new Error("ECONNRESET: connection reset by peer");
      }
      return { ok: false, status: 404, text: async () => "not found", json: async () => ({}) };
    });

    class TransportErrorConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: TransportErrorConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — must return immediately (thrown errors are not 5xx responses).
    const result = await sendTestNotification();

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/ECONNRESET/);
    // Must not retry — a thrown transport exception is not a 5xx HTTP response.
    expect(sendCallCount).toBe(1);
  });

  it("reports failure immediately when the profile JSON parse throws — does not retry", async () => {
    const { insertSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        return {
          ok: true,
          status: 200,
          // Simulate a corrupted/non-JSON response body
          json: async () => { throw new SyntaxError("Unexpected token < in JSON"); },
          text: async () => "<!DOCTYPE html>",
        };
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class BadJsonConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: BadJsonConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — Phase 1 (profile fetch) always bails immediately on error.
    const result = await sendTestNotification();

    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    // Profile fetch is Phase 1 — any error bails immediately, no retry.
    expect(profileCallCount).toBe(1);
    expect(insertSpy).toHaveBeenCalled();
  });

  it("returns ok:false and persists the error when the profile body is missing the emailAddress field — does not retry", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        // ok:true / 200 but the body has no emailAddress — unexpected API shape
        return {
          ok: true,
          status: 200,
          json: async () => ({ displayName: "Some User" }), // emailAddress deliberately absent
          text: async () => "",
        };
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class MissingEmailConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: MissingEmailConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — a missing field is not a 5xx; must bail immediately.
    const result = await sendTestNotification();

    // Must resolve with ok:false, not throw
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/emailAddress/i);

    // Must not retry — a malformed payload is not a transient 5xx
    expect(profileCallCount).toBe(1);

    // Error must be persisted so the admin panel can surface it
    expect(insertSpy).toHaveBeenCalled();
    // clearNotificationError must NOT run on failure
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("returns ok:false and persists the error when the profile body is null — not just a missing field", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        // ok:true / 200 but the body is null — non-object API shape
        return {
          ok: true,
          status: 200,
          json: async () => null,
          text: async () => "",
        };
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class NullBodyConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: NullBodyConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — a null body is not a 5xx; must bail immediately.
    const result = await sendTestNotification();

    // Must resolve with ok:false, not throw
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/emailAddress/i);

    // Must not retry — a malformed payload is not a transient 5xx
    expect(profileCallCount).toBe(1);

    // Error must be persisted so the admin panel can surface it
    expect(insertSpy).toHaveBeenCalled();
    // clearNotificationError must NOT run on failure
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("returns ok:false and persists the error when the profile body is an empty array — not just a missing field", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        // ok:true / 200 but the body is [] — array instead of object
        return {
          ok: true,
          status: 200,
          json: async () => [],
          text: async () => "",
        };
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class ArrayBodyConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: ArrayBodyConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — an array body is not a 5xx; must bail immediately.
    const result = await sendTestNotification();

    // Must resolve with ok:false, not throw
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/emailAddress/i);

    // Must not retry — a malformed payload is not a transient 5xx
    expect(profileCallCount).toBe(1);

    // Error must be persisted so the admin panel can surface it
    expect(insertSpy).toHaveBeenCalled();
    // clearNotificationError must NOT run on failure
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("returns ok:false and persists the error when the profile body is a bare string — not just a missing field", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        // ok:true / 200 but the body is a bare string — primitive, not an object
        return {
          ok: true,
          status: 200,
          json: async () => "owner@gmail.com",
          text: async () => "",
        };
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class StringBodyConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: StringBodyConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — a bare string body is not a 5xx; must bail immediately.
    const result = await sendTestNotification();

    // Must resolve with ok:false, not throw
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/emailAddress/i);

    // Must not retry — a malformed payload is not a transient 5xx
    expect(profileCallCount).toBe(1);

    // Error must be persisted so the admin panel can surface it
    expect(insertSpy).toHaveBeenCalled();
    // clearNotificationError must NOT run on failure
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("returns ok:false and persists the error when the profile body is a number — not just a missing field", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    let profileCallCount = 0;

    const proxySpy = vi.fn(async (_service: string, path: string) => {
      if (path.endsWith("/me/profile")) {
        profileCallCount++;
        // ok:true / 200 but the body is a number — primitive, not an object
        return {
          ok: true,
          status: 200,
          json: async () => 42,
          text: async () => "",
        };
      }
      return { ok: false, status: 500, text: async () => "error", json: async () => ({}) };
    });

    class NumberBodyConnectors {
      proxy = proxySpy;
    }
    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: NumberBodyConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    // No runAllTimersAsync — a number body is not a 5xx; must bail immediately.
    const result = await sendTestNotification();

    // Must resolve with ok:false, not throw
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.error).toMatch(/emailAddress/i);

    // Must not retry — a malformed payload is not a transient 5xx
    expect(profileCallCount).toBe(1);

    // Error must be persisted so the admin panel can surface it
    expect(insertSpy).toHaveBeenCalled();
    // clearNotificationError must NOT run on failure
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("returns ok:false and persists the error when the proxy throws synchronously on every call (no OAuth session)", async () => {
    const { insertSpy, deleteSpy } = mockDb();

    // Simulate no OAuth session: every proxy call throws synchronously instead
    // of returning a response object.
    class NoSessionConnectors {
      proxy = vi.fn(() => {
        throw new Error("No OAuth session for google-mail");
      });
    }

    vi.doMock("@replit/connectors-sdk", () => ({
      ReplitConnectors: NoSessionConnectors,
    }));

    const { sendTestNotification } = await import("./gmail-notify.js");
    const result = await sendTestNotification();

    // Must resolve with ok:false, not throw
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/No OAuth session/);

    // Error must be persisted to DB so the admin panel can surface it
    expect(insertSpy).toHaveBeenCalled();
    // clearNotificationError must NOT run on failure
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  it("respects REVIEW_NOTIFY_EMAIL as the recipient for the test email", async () => {
    mockDb();

    process.env.REVIEW_NOTIFY_EMAIL = "alerts@example.com";
    const proxySpy = mockConnectors();

    const { sendTestNotification } = await import("./gmail-notify.js");
    const result = await sendTestNotification();

    expect(result.ok).toBe(true);

    // Decode the sent message and verify the To: header
    const sendCall = proxySpy.mock.calls.find((args) =>
      String(args[1]).endsWith("/messages/send")
    );
    expect(sendCall).toBeDefined();
    const opts = sendCall![2] as { body?: string };
    const parsed = JSON.parse(opts.body!) as { raw: string };
    const base64 = parsed.raw.replace(/-/g, "+").replace(/_/g, "/");
    const raw = Buffer.from(base64, "base64").toString("utf-8");
    expect(raw).toMatch(/^To: alerts@example\.com$/m);
  });
});
