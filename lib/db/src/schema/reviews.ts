import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewsTable = pgTable("reviews", {
  id: serial("id").primaryKey(),
  author: text("author").notNull(),
  location: text("location").notNull().default(""),
  model: text("model"),
  rating: integer("rating").notNull(),
  title: text("title").notNull(),
  text: text("text").notNull(),
  approved: boolean("approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReviewSchema = createInsertSchema(reviewsTable)
  .omit({ id: true, approved: true, createdAt: true })
  .extend({
    author: z.string().trim().min(2).max(80),
    location: z.string().trim().max(80).default(""),
    model: z.string().trim().max(60).optional(),
    rating: z.number().int().min(1).max(5),
    title: z.string().trim().min(3).max(120),
    text: z.string().trim().min(20).max(2000),
  });

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
