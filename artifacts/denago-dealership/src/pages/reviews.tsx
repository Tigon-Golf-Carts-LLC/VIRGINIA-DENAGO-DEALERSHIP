import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import { ReviewForm } from '@/components/review-form';
import { Phone, Star } from 'lucide-react';

interface ApiReview {
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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`}
        />
      ))}
    </div>
  );
}

export default function Reviews() {
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

  // Review/AggregateRating structured data — emitted only when verified,
  // approved customer reviews exist. Publishing placeholder ratings as schema
  // violates Google's review-snippet guidelines.
  const schema =
    reviewCount > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'AutoDealer',
          name: DEALERSHIP.name,
          url: `${DEALERSHIP.domain}/reviews`,
          telephone: DEALERSHIP.phone,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue,
            reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
          review: reviews.map((r) => ({
            '@type': 'Review',
            author: { '@type': 'Person', name: r.author },
            datePublished: r.createdAt.slice(0, 10),
            name: r.title,
            reviewBody: r.text,
            reviewRating: {
              '@type': 'Rating',
              ratingValue: r.rating,
              bestRating: 5,
              worstRating: 1,
            },
          })),
        }
      : undefined;

  return (
    <>
      <Seo
        title={`DENAGO Golf Cart Reviews | Real Customer Testimonials | ${DEALERSHIP.name}`}
        description="Read Denago golf cart reviews from real customers — what owners say about lithium battery life, CarPlay touchscreens, street-legal models, and buying from our 16 dealership locations."
        url={`${DEALERSHIP.domain}/reviews`}
        schema={schema}
      />
      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              DENAGO <span className="text-primary">Reviews</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              What customers say about their Denago golf carts — battery life, standard tech, and
              the buying experience across our 16 dealership locations.
            </p>
            {reviewCount > 0 && (
              <div className="inline-flex items-center gap-3 bg-card border border-border rounded-xl px-5 py-3">
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
          </div>

          {/* Review cards */}
          {reviewCount > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 max-w-6xl">
              {reviews.map((review) => (
                <article
                  key={review.id}
                  className="bg-card border border-border rounded-xl p-6 flex flex-col gap-3"
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
                  <h2 className="font-bold text-lg leading-snug">{review.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {review.text}
                  </p>
                  <div className="pt-2 border-t border-border text-sm">
                    <span className="font-semibold text-foreground">{review.author}</span>
                    {review.location && (
                      <span className="text-muted-foreground"> — {review.location}</span>
                    )}
                    {review.model && (
                      <div className="text-xs text-primary font-semibold uppercase tracking-wider mt-1">
                        {review.model} owner
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Write a review */}
          <div className="mb-16">
            <ReviewForm />
          </div>

          {/* What reviews highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl">
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-2">What Reviewers Highlight</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                LiFePO4 lithium batteries with 8-year warranties, smooth 5kW–6.3kW AC motors, and
                standard 10.1-inch CarPlay touchscreens, backup cameras, and soundbars — features
                competitors sell as upgrades.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-2">Value for Money</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                With MSRPs from $8,995 to $16,500, Denago models undercut comparable lithium carts
                from legacy brands while including more equipment out of the box.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-bold text-lg mb-2">Judge for Yourself</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The best review is a test drive. Visit a showroom, drive the models back to back,
                and compare the spec sheets — we're confident in the comparison.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="max-w-3xl bg-card border border-border rounded-xl p-8">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-3">
              Own a Denago? <span className="text-primary">Share Your Review</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              We'd love to hear about your experience — scroll up to write a review, call us, or
              stop by any of our 16 locations. Still deciding? Shop the lineup.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${DEALERSHIP.phone}`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Phone className="h-5 w-5" /> {DEALERSHIP.phoneDisplay}
              </a>
              <Link
                href="/denago"
                className="inline-flex items-center gap-2 border border-border bg-background font-bold px-6 py-3 rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                View the Lineup
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
