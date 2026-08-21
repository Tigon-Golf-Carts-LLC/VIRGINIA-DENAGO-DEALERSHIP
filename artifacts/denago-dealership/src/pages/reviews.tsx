import { Link } from 'wouter';
import { Seo } from '@/components/seo';
import { DEALERSHIP, HEADQUARTERS } from '@/data/denago-models';
import { CustomerReviews } from '@/components/customer-reviews';
import { useReviews } from '@/hooks/use-reviews';
import { Mail, Phone } from 'lucide-react';
import { REVIEWS_ARE_REAL } from '@/data/reviews';

export default function Reviews() {
  const { reviews, reviewCount, ratingValue } = useReviews();

  // Review/AggregateRating structured data — emitted only when REVIEWS_ARE_REAL
  // is true AND verified approved reviews exist. The flag must stay false until
  // real customer reviews are loaded; publishing placeholder ratings as schema
  // violates Google's review-snippet guidelines.
  const schema =
    REVIEWS_ARE_REAL && reviewCount > 0
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
          </div>

          {/* Rating badge, review cards, expander + infinite scroll */}
          <div className="mb-16">
            <CustomerReviews />
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
              Own a Denago? <span className="text-primary">Tell Us About It</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              We'd love to hear about your experience — call us, email us, or stop by our
              Gloucester Point showroom. Still deciding? Shop the lineup.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Phone className="h-5 w-5" /> {DEALERSHIP.phoneDisplay}
              </a>
              <a
                href={`mailto:${HEADQUARTERS.email}`}
                className="inline-flex items-center gap-2 border border-border bg-background font-bold px-6 py-3 rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" /> Email Us
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
