/**
 * Pure, side-effect-free helpers used by admin.ts.
 * Kept in a separate file so tests can import them without pulling in
 * any database or Express dependencies.
 */

import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

/** app_settings key that holds the active (hashed) admin secret. */
export const ADMIN_SECRET_KEY = "admin_secret";

/** app_settings key that holds the ISO-ms timestamp of the last test notification. */
export const TEST_NOTIFICATION_LAST_SENT_KEY = "test_notification_last_sent";

/** Minimum interval between test-notification sends (5 minutes). */
export const TEST_NOTIF_MIN_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Stored format for hashed secrets: "scrypt:<hex-salt>:<hex-derivedKey>"
 * Secrets stored as plain env-var text never contain this prefix.
 */
const HASH_PREFIX = "scrypt:";

/** Hash a plaintext secret for safe storage. */
export async function hashSecret(plaintext: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(plaintext, salt, 64)) as Buffer;
  return `${HASH_PREFIX}${salt}:${derived.toString("hex")}`;
}

/**
 * Timing-safe verification of a plaintext candidate against a stored value.
 * Handles both hashed DB secrets (scrypt:…) and plain env-var fallback strings.
 */
export async function verifySecret(
  plaintext: string,
  stored: string,
): Promise<boolean> {
  if (stored.startsWith(HASH_PREFIX)) {
    const rest = stored.slice(HASH_PREFIX.length);
    const colonIdx = rest.indexOf(":");
    if (colonIdx === -1) return false;
    const salt = rest.slice(0, colonIdx);
    const storedKey = Buffer.from(rest.slice(colonIdx + 1), "hex");
    const derived = (await scryptAsync(plaintext, salt, 64)) as Buffer;
    if (derived.length !== storedKey.length) return false;
    return timingSafeEqual(derived, storedKey);
  }
  // Plain env-var fallback — constant-time comparison.
  const a = Buffer.from(plaintext);
  const b = Buffer.from(stored);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Pure helper: given the last-sent timestamp (ms since epoch) and the current
 * time, returns how many milliseconds remain in the cool-down window.
 * Returns 0 when the request is allowed.
 */
export function computeCooldownMs(lastSentMs: number, nowMs: number): number {
  const elapsed = nowMs - lastSentMs;
  return elapsed < TEST_NOTIF_MIN_INTERVAL_MS
    ? TEST_NOTIF_MIN_INTERVAL_MS - elapsed
    : 0;
}
