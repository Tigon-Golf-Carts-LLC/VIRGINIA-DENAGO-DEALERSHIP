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

export const customerReviews: CustomerReview[] = [
  {
    author: 'Sample Customer',
    location: 'Hatfield, PA',
    rating: 5,
    date: '2026-06-02',
    title: 'Example review — replace with a real one',
    text: 'This is a placeholder review showing how a real customer testimonial will appear. Ask your sales and service teams for recent happy customers willing to share a few sentences about their Denago.',
    model: 'EV Rover XL',
  },
  {
    author: 'Sample Customer',
    location: 'Doylestown, PA',
    rating: 5,
    date: '2026-04-18',
    title: 'Example review — replace with a real one',
    text: 'Placeholder testimonial. Real reviews should mention specifics buyers care about: battery life, the CarPlay touchscreen, street-legal registration help, or the buying experience at a specific location.',
    model: 'EV Nomad',
  },
  {
    author: 'Sample Customer',
    location: 'Quakertown, PA',
    rating: 4,
    date: '2026-03-09',
    title: 'Example review — replace with a real one',
    text: 'Placeholder testimonial. A mix of 4- and 5-star reviews reads as more credible than a perfect wall of five stars.',
    model: 'EV City',
  },
];

export function getAggregateRating() {
  const count = customerReviews.length;
  const avg =
    count === 0
      ? 0
      : customerReviews.reduce((sum, r) => sum + r.rating, 0) / count;
  return { ratingValue: Math.round(avg * 10) / 10, reviewCount: count };
}
