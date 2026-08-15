import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Key/value store for server-side flags and settings.
 * Each row is a singleton keyed by `key`.
 *
 * Known keys:
 *   notification_error — set when all Gmail retry attempts are exhausted;
 *                        cleared on the next successful send.
 */
export const appSettingsTable = pgTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AppSetting = typeof appSettingsTable.$inferSelect;
