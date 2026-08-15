import { useEffect, useMemo, useRef, useState } from 'react';
import { Star, ChevronDown } from 'lucide-react';
import { ReviewForm } from '@/components/review-form';
import { useReviews, type ApiReview } from '@/hooks/use-reviews';

/** Maps model slugs to the review "model" labels stored in the database. */
export const REVIEW_MODEL_BY_SLUG: Record<string, string> = {
  'ev-city': 'EV City',
  'ev-nomad': 'EV Nomad',
  'ev-nomad-xl': 'EV Nomad XL',
  'ev-rover-xl': 'EV Rover XL',
  'ev-rover-xl6': 'EV Rover XL6',
  'ev-rover-xxl': 'EV Rover XXL',
  oxen: 'OXEN',
  scout2: 'Scout 2',
};

const INLINE_COUNT = 4; // shown inline on desktop; first 2 on mobile
const SCROLL_BATCH = 9; // reviews loaded per infinite-scroll step

export function Stars({ rating, size = 'h-4 w-4' }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${size} ${i <= rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export function ReviewCard({ review, className = '' }: { review: ApiReview; className?: string }) {
  return (
    <article
      className={`bg-card border border-border rounded-xl p-6 flex flex-col gap-3 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        <time className="text-xs text-muted-foreground" dateTime={review.createdAt}>
          {new Date(review.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </div>
      <h3 className="font-bold text-lg leading-snug">{review.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">{review.text}</p>
      <div className="pt-2 border-t border-border text-sm">
        <span className="font-semibold text-foreground">{review.author}</span>
        {review.location && <span className="text-muted-foreground"> — {review.location}</span>}
        {review.model && (
          <div className="text-xs text-primary font-semibold uppercase tracking-wider mt-1">
            {review.model} owner
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Full customer-reviews experience: aggregate badge, 4 inline cards on
 * desktop (2 on mobile), a "Read All" expander with infinite scroll, and the
 * write-a-review form. Pass `model` to scope everything to one model
 * (model pages); omit it for the site-wide reviews page.
 */
export function CustomerReviews({ model }: { model?: string }) {
  const { reviews: allReviews } = useReviews();
  // Case-insensitive match: stored model labels are canonically uppercase
  // (e.g. "EV NOMAD"), but be tolerant of any legacy casing.
  const reviews = useMemo(
    () =>
      model
        ? allReviews.filter((r) => r.model?.toUpperCase() === model.toUpperCase())
        : allReviews,
    [allReviews, model],
  );
  const reviewCount = reviews.length;
  const ratingValue =
    reviewCount === 0
      ? 0
      : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 10) / 10;

  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(SCROLL_BATCH);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll: load the next batch when the sentinel enters the viewport.
  useEffect(() => {
    if (!showAll) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((c) => Math.min(c + SCROLL_BATCH, reviewCount));
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [showAll, reviewCount]);

  return (
    <div>
      {reviewCount > 0 && (
        <div className="inline-flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3 mb-8">
          <span className="text-3xl font-display font-bold text-foreground">
            {ratingValue.toFixed(1)}
          </span>
          <div className="flex flex-col">
            <Stars rating={Math.round(ratingValue)} />
            <span className="text-xs text-muted-foreground mt-1">
              Based on {reviewCount} customer review{reviewCount === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      )}

      {reviewCount > 0 && (
        <div className="mb-12 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.slice(0, INLINE_COUNT).map((review, i) => (
              <ReviewCard
                key={review.id}
                review={review}
                className={i >= 2 ? 'hidden sm:flex' : ''}
              />
            ))}
          </div>

          {/* Read all reviews (expand + infinite scroll) */}
          {reviewCount > 2 && (
            <div className="mt-8">
              {!showAll ? (
                <button
                  type="button"
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-2 border border-border bg-card font-bold px-6 py-3 rounded-lg hover:border-primary hover:text-primary transition-colors"
                  aria-expanded={showAll}
                >
                  Read All {reviewCount} Reviews
                  <ChevronDown className="h-5 w-5" />
                </button>
              ) : (
                <>
                  <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-6">
                    All <span className="text-primary">Reviews</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviews.slice(0, visibleCount).map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                  {visibleCount < reviewCount && (
                    <div ref={sentinelRef} className="h-10" aria-hidden="true" />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      <ReviewForm fixedModel={model} />
    </div>
  );
}
