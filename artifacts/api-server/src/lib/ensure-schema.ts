import { pool } from "@workspace/db";

/**
 * Ensures any schema additions introduced after the initial database
 * provisioning exist before the server begins serving requests.
 *
 * Each statement uses CREATE TABLE / ALTER TABLE … IF NOT EXISTS so it is
 * idempotent and safe to run on every startup across all environments
 * (development, staging, production) without a separate migration step.
 */
export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}
