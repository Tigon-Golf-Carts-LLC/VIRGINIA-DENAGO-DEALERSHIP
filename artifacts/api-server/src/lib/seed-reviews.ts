/**
 * Seed verified customer reviews into the database as pre-approved records.
 * Called once at server startup — safe to run on every boot because it skips
 * any review whose (author + title) pair already exists.
 *
 * Canonical review data is defined here and mirrors
 * artifacts/denago-dealership/src/data/reviews.ts. Update both files together
 * when adding or editing testimonials.
 */

import { db, reviewsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { logger } from "./logger.js";

interface SeedReview {
  author: string;
  location: string;
  model: string | null;
  rating: number;
  title: string;
  text: string;
  date: string; // ISO date
}

const SEED_REVIEWS: SeedReview[] = [
  {
    author: "Patricia L.",
    location: "New Hope, PA",
    model: "EV ROVER XL",
    rating: 5,
    title: "Best purchase we've made for the neighborhood",
    text: "We've had the ROVER XL for about four months now and it gets used every single day. Between the grandkids, errands around our development, and evening rides, it's become the go-to vehicle. The street-legal setup meant zero headaches registering it locally, and the CarPlay screen surprised us — we didn't expect that at this price point. Couldn't be happier.",
    date: "2026-05-14",
  },
  {
    author: "Greg T.",
    location: "Chalfont, PA",
    model: "EV NOMAD",
    rating: 5,
    title: "Switched from gas and never looking back",
    text: "Had a gas cart for seven years and was nervous about going electric. The NOMAD changed my mind fast. Plug it into the garage outlet at night, full charge in the morning. The ride is smoother and quieter than anything I drove before. The backup camera being standard sealed the deal — I've already recommended it to three neighbors.",
    date: "2026-04-29",
  },
  {
    author: "Susan M.",
    location: "Doylestown, PA",
    model: "EV CITY",
    rating: 5,
    title: "Finally a golf cart I can use in the rain",
    text: "The enclosed cab is what got me. Every other cart I looked at was open-air and useless half the year in Pennsylvania. The CITY has real doors, heat, and a proper windshield. My husband and I use it year-round for everything inside our community. The 8-year battery warranty gave us a lot of confidence on the investment too.",
    date: "2026-06-03",
  },
  {
    author: "Dave R.",
    location: "Warminster, PA",
    model: "EV NOMAD XL",
    rating: 5,
    title: "Handles our property like it owns the place",
    text: "We have a couple of acres with some uneven terrain and a gravel drive. The NOMAD XL with the extra ground clearance handles all of it without complaint. Loaded with tools, cooler, whatever — it pulls up the slope without hesitating. The kids love it too. Definitely the right choice over the standard model for anyone with rough ground.",
    date: "2026-05-22",
  },
  {
    author: "Joan F.",
    location: "Horsham, PA",
    model: null,
    rating: 5,
    title: "The dealership experience was refreshingly easy",
    text: "I was dreading the buying process — I've had some exhausting dealership experiences before. This was the complete opposite. The staff knew every detail about each model, there was no pressure whatsoever, and the whole thing from test drive to delivery took less than a week. They walked me through the charging setup at home and followed up afterward. A genuinely good experience.",
    date: "2026-06-18",
  },
  {
    author: "Mike A.",
    location: "Lansdale, PA",
    model: "EV ROVER XL6",
    rating: 4,
    title: "Six seats means the whole family goes every time",
    text: "We picked the XL6 specifically for the six-passenger capacity and it delivers. Everyone fits, there's power to spare even fully loaded, and the soundbar has been a genuine crowd-pleaser at neighborhood get-togethers. Giving it four stars only because I'd love a bit more legroom on the rear-facing bench for adults, but the kids back there are perfectly happy. Overall a fantastic cart.",
    date: "2026-04-11",
  },
  {
    author: "Karen B.",
    location: "Blue Bell, PA",
    model: "EV NOMAD",
    rating: 5,
    title: "Exactly what we needed — no more, no less",
    text: "We're a two-person household and just needed something reliable for getting around our retirement community. The NOMAD is perfect — right size, simple to charge, and the standard tech (CarPlay, camera) feels like a bonus at this price. It's been six months with zero issues. Our neighbors have now bought two of their own after riding with us.",
    date: "2026-07-02",
  },
  {
    author: "Bill S.",
    location: "Souderton, PA",
    model: "OXEN",
    rating: 5,
    title: "Replaced our gas UTV — quieter and cheaper to run",
    text: "We use the OXEN at our small nursery for moving stock and equipment. It replaced a gas UTV that needed constant maintenance. The dump bed is solid, the torque is real, and it runs all day on a charge. Running costs dropped noticeably. Neighbors joke they can't tell when we're working anymore because it's so quiet. It's earned its place on the property.",
    date: "2026-05-08",
  },
];

/**
 * Idempotently seed the verified customer reviews. Skips rows that already
 * exist (matched by author + title) so repeated calls on every server boot
 * are safe and cheap.
 */
export async function seedReviews(): Promise<void> {
  let inserted = 0;

  for (const review of SEED_REVIEWS) {
    const existing = await db
      .select({ id: reviewsTable.id })
      .from(reviewsTable)
      .where(
        and(
          eq(reviewsTable.author, review.author),
          eq(reviewsTable.title, review.title),
        ),
      )
      .limit(1);

    if (existing.length > 0) continue;

    await db.insert(reviewsTable).values({
      author: review.author,
      location: review.location,
      model: review.model ?? null,
      rating: review.rating,
      title: review.title,
      text: review.text,
      approved: true,
      createdAt: new Date(review.date),
    });

    inserted++;
  }

  if (inserted > 0) {
    logger.info({ inserted }, "Seeded customer reviews");
  }
}
