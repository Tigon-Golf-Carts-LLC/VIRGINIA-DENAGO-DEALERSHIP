/**
 * Customer reviews for the /reviews page.
 *
 * IMPORTANT: The entries below are PLACEHOLDER examples illustrating the page
 * structure. Replace them with real customer reviews (name, rating, date,
 * text) before publishing. Once real reviews are in place, set
 * REVIEWS_ARE_REAL to true — this enables the Review/AggregateRating JSON-LD
 * structured data. Publishing fake ratings as structured data violates
 * Google's guidelines and can hurt rankings, so the schema stays off until
 * the reviews are genuine.
 */

export const REVIEWS_ARE_REAL = false;

export interface CustomerReview {
  author: string;
  location: string;
  rating: number; // 1–5
  date: string; // ISO date, e.g. '2026-05-14'
  title: string;
  text: string;
  model?: string;
}

export const customerReviews: CustomerReview[] = [];

export function getAggregateRating() {
  const count = customerReviews.length;
  const avg =
    count === 0
      ? 0
      : customerReviews.reduce((sum, r) => sum + r.rating, 0) / count;
  return { ratingValue: Math.round(avg * 10) / 10, reviewCount: count };
}
