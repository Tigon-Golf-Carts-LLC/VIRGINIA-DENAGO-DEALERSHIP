import { useMemo } from 'react';

import { seedReviews } from '@/data/reviews';

export interface CustomerReview {
  id: number;
  author: string;
  location: string;
  model: string | null;
  rating: number;
  title: string;
  text: string;
  /** ISO date the review was written. */
  createdAt: string;
}

/**
 * Reviews are static site content -- they ship in the bundle from
 * `@/data/reviews` rather than coming from an API, so the site deploys as a
 * plain Cloudflare Worker with no backend behind it. To publish a new review,
 * add it to `src/data/reviews.ts` and redeploy.
 */
const reviews: CustomerReview[] = seedReviews
  .map((review, index) => ({
    id: index + 1,
    author: review.author,
    location: review.location,
    model: review.model,
    rating: review.rating,
    title: review.title,
    text: review.text,
    createdAt: review.date,
  }))
  .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const reviewCount = reviews.length;
const ratingValue =
  reviewCount === 0
    ? 0
    : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10;

/** Site-wide customer reviews, newest first. */
export function useReviews() {
  return useMemo(() => ({ reviews, reviewCount, ratingValue }), []);
}
