import { useQuery } from '@tanstack/react-query';

export interface ApiReview {
  id: number;
  author: string;
  location: string;
  model: string | null;
  rating: number;
  title: string;
  text: string;
  createdAt: string;
}

const API_URL = `${import.meta.env.BASE_URL}api/reviews`;

/** Approved site-wide customer reviews (from the reviews page form). */
export function useReviews() {
  const { data: reviews = [] } = useQuery<ApiReview[]>({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to load reviews');
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const reviewCount = reviews.length;
  const ratingValue =
    reviewCount === 0
      ? 0
      : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10;

  return { reviews, reviewCount, ratingValue };
}
