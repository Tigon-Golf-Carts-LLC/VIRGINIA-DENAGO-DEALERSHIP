import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { getModelBySlug, getModelPath, DEALERSHIP } from '@/data/denago-models';
import { expertReviews } from '@/data/expert-reviews';
import { modelReviews } from '@/data/model-reviews';
import { Seo } from '@/components/seo';
import NotFound from './not-found';
import { Phone, ChevronRight, CheckCircle2, ShieldCheck, Battery, Gauge, ArrowLeft, BadgePercent, Star } from 'lucide-react';

export default function ModelDetail({ slugOverride }: { slugOverride?: string; params?: unknown } = {}) {
  const params = useParams();
  const slug = slugOverride ?? params.slug;
  const model = slug ? getModelBySlug(slug) : undefined;
  const [activeImage, setActiveImage] = useState(0);

  if (!model) {
    return <NotFound />;
  }

  const gallery = model.gallery && model.gallery.length > 0 ? model.gallery : [model.image];
  const currentImage = gallery[Math.min(activeImage, gallery.length - 1)];
  const modelUrl = `${DEALERSHIP.domain}${getModelPath(model)}`;

  // 0% APR for 48 months with 20% down (same basis as the /financing offer)
  const expertReview = expertReviews[model.slug];
  const ownerReview = modelReviews[model.slug];
  const msrp = Number(model.price.replace(/[^0-9.]/g, ''));
  const monthlyPayment = msrp > 0 ? ((msrp * 0.8) / 48).toFixed(2) : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": DEALERSHIP.domain
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Lineup",
        "item": `${DEALERSHIP.domain}/denago`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": model.name,
        "item": modelUrl
      }
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": ["Product", "Vehicle"],
    "name": model.name,
    "image": gallery.map((img) => `${DEALERSHIP.domain}${img}`),
    "description": model.description,
    "brand": {
      "@type": "Brand",
      "name": DEALERSHIP.brand
    },
    "category": model.category,
    "vehicleConfiguration": model.category,
    "vehicleSeatingCapacity": model.seats,
    "speed": {
      "@type": "QuantitativeValue",
      "value": parseInt(model.topSpeed),
      "unitCode": "HM" // Miles per hour
    },
    "offers": {
      "@type": "Offer",
      "url": modelUrl,
      "priceCurrency": "USD",
      "price": model.priceNumber,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "AutoDealer",
        "name": DEALERSHIP.name
      }
    },
    ...(ownerReview
      ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ownerReview.rating,
            "reviewCount": 1,
            "bestRating": 5,
            "worstRating": 1
          },
          "review": [
            {
              "@type": "Review",
              "author": { "@type": "Person", "name": ownerReview.author },
              "datePublished": ownerReview.date,
              "name": ownerReview.title,
              "reviewBody": ownerReview.text,
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": ownerReview.rating,
                "bestRating": 5,
                "worstRating": 1
              }
            }
          ]
        }
      : {})
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, productSchema]
  };

  return (
    <>
      <Seo 
        title={`${model.name} | Premium Electric Golf Cart`}
        description={`Discover the ${model.name}. ${model.tagline} Starting at ${model.price}. Call ${DEALERSHIP.name} today.`}
        url={modelUrl}
        image={`${DEALERSHIP.domain}${model.image}`}
        type="product"
        schema={schema}
      />

      {/* Breadcrumbs */}
      <div className="bg-muted/50 border-b border-border py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/denago" className="hover:text-primary transition-colors">Models</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-semibold">{model.name}</span>
          </nav>
        </div>
      </div>

      <article className="pb-24">
        {/* Product Hero */}
        <div className="container mx-auto px-4 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Image */}
            <div className="flex flex-col gap-4">
              <div className="relative rounded-2xl overflow-hidden bg-muted aspect-4/3 shadow-xl">
                <img 
                  src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${currentImage}`}
                  alt={model.name}
                  width="1200"
                  height="900"
                  loading="eager"
                  className="w-full h-full object-contain object-center"
                />
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {gallery.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImage(idx)}
                      aria-label={`View photo ${idx + 1} of ${model.name}`}
                      className={`relative rounded-lg overflow-hidden bg-muted aspect-4/3 border-2 transition-colors ${
                        idx === Math.min(activeImage, gallery.length - 1)
                          ? 'border-primary'
                          : 'border-transparent hover:border-border'
                      }`}
                    >
                      <img
                        src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${img}`}
                        alt={`${model.name} photo ${idx + 1}`}
                        width="300"
                        height="225"
                        loading="lazy"
                        className="w-full h-full object-contain object-center"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Header Info */}
            <div className="flex flex-col">
              <Link href="/denago" className="inline-flex items-center gap-2 text-primary font-semibold text-sm mb-6 hover:underline w-max">
                <ArrowLeft className="h-4 w-4" /> Back to Lineup
              </Link>
              
              <h1 className="text-4xl lg:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight leading-none">
                {model.name}
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground font-light mb-8">
                "{model.tagline}"
              </p>
              
              <div className="bg-secondary/50 border border-border rounded-xl p-8 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                  <div>
                    <span className="text-muted-foreground text-sm font-semibold uppercase tracking-wider block mb-1">Starting Price</span>
                    <span className="text-4xl font-bold text-primary">{model.price}</span>
                    {monthlyPayment && (
                      <span className="block mt-1 text-sm font-semibold text-foreground/80">
                        or <span className="text-primary">${monthlyPayment}/mo</span> for 48 months at 0% APR*
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <a 
                      href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg clip-path-slant"
                    >
                      <Phone className="h-6 w-6" />
                      Call to Buy
                    </a>
                    <Link
                      href="/financing"
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-colors clip-path-slant"
                    >
                      <BadgePercent className="h-6 w-6" />
                      0% Financing
                    </Link>
                  </div>
                </div>
                {monthlyPayment && (
                  <p className="text-xs text-muted-foreground -mt-4 mb-6">
                    *${monthlyPayment}/month based on {model.price} MSRP with 20% down, financed for 48 months at 0% APR with approved credit through participating lenders. Taxes, fees, and optional equipment not included.
                  </p>
                )}
                
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="bg-background rounded-full p-3 shadow-sm border border-border text-primary">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block font-bold text-lg">{model.seats}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Seats</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="bg-background rounded-full p-3 shadow-sm border border-border text-primary">
                      <Battery className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block font-bold text-lg">{model.range}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Range</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="bg-background rounded-full p-3 shadow-sm border border-border text-primary">
                      <Gauge className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="block font-bold text-lg">{model.topSpeed}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Top Speed</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-lg leading-relaxed text-foreground/80">
                {model.description}
              </p>
            </div>
          </div>
        </div>

        {/* Specs and Features */}
        <div className="bg-background border-t border-border py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
              
              {/* Features */}
              <section>
                <h2 className="text-3xl font-display font-bold mb-8 uppercase tracking-tight">Key <span className="text-primary">Features</span></h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {model.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-secondary/30 p-4 rounded-lg border border-border/50">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                      <span className="font-medium text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Specifications Table */}
              <section>
                <h2 className="text-3xl font-display font-bold mb-8 uppercase tracking-tight">Technical <span className="text-primary">Specs</span></h2>
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {model.specs.map((spec, idx) => (
                        <tr 
                          key={idx} 
                          className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                        >
                          <th className="py-4 px-6 font-semibold text-muted-foreground w-1/3 border-r border-border/50">
                            {spec.label}
                          </th>
                          <td className="py-4 px-6 font-bold text-foreground">
                            {spec.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* Owner Review */}
        {ownerReview && (
          <div className="container mx-auto px-4 max-w-4xl mt-4">
            <section aria-label={`Customer review of the ${model.name}`}>
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-8 uppercase tracking-tight">
                What <span className="text-primary">Owners Say</span>
              </h2>
              <article className="bg-card border border-border rounded-xl p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-0.5" aria-label={`${ownerReview.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i <= ownerReview.rating ? 'text-primary fill-primary' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                  <time className="text-sm text-muted-foreground" dateTime={ownerReview.date}>
                    {new Date(ownerReview.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </time>
                </div>
                <h3 className="font-bold text-xl mb-3">{ownerReview.title}</h3>
                <p className="text-foreground/80 leading-relaxed mb-5">{ownerReview.text}</p>
                <div className="pt-4 border-t border-border text-sm">
                  <span className="font-semibold text-foreground">{ownerReview.author}</span>
                  <span className="text-muted-foreground"> — {ownerReview.location}</span>
                  <div className="text-xs text-primary font-semibold uppercase tracking-wider mt-1">
                    {model.name} owner
                  </div>
                </div>
              </article>
              <p className="text-sm text-muted-foreground mt-4">
                Own a {model.name}?{' '}
                <Link href="/reviews" className="text-primary font-semibold hover:underline">
                  Share your review
                </Link>.
              </p>
            </section>
          </div>
        )}

        {/* Expert Take */}
        {expertReview && (
          <div className="bg-secondary/30 border-t border-border py-20">
            <div className="container mx-auto px-4 max-w-4xl">
              <section>
                <h2 className="text-3xl lg:text-4xl font-display font-bold mb-8 uppercase tracking-tight">
                  My Expert Take on the <span className="text-primary">{model.name}</span>
                </h2>
                {expertReview.intro.map((p, idx) => (
                  <p key={idx} className="text-lg leading-relaxed text-foreground/80 mb-5">{p}</p>
                ))}

                <h3 className="text-2xl font-display font-bold mt-10 mb-5 uppercase tracking-tight">
                  What the {model.name} Does — and What It Has
                </h3>
                <ul className="space-y-3 mb-8">
                  {expertReview.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-2xl font-display font-bold mt-10 mb-5 uppercase tracking-tight">
                  What You Can Do With It
                </h3>
                <ul className="space-y-3 mb-8">
                  {expertReview.useCases.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-2xl font-display font-bold mt-10 mb-5 uppercase tracking-tight">
                  Why the {model.name} Is a Good Golf Cart to Own
                </h3>
                {expertReview.whyBuy.map((p, idx) => (
                  <p key={idx} className="text-lg leading-relaxed text-foreground/80 mb-5">{p}</p>
                ))}

                <h3 className="text-2xl font-display font-bold mt-10 mb-5 uppercase tracking-tight">
                  Engineering Every {model.name} Shares
                </h3>
                <p className="text-lg leading-relaxed text-foreground/80 mb-5">
                  Under the bodywork, every Denago is built on the same modern core: a LiFePO4 lithium
                  battery with integrated battery-management-system protection, a smooth AC drive motor,
                  four-wheel disc brakes, fully independent front and rear suspension, an electric parking
                  brake, and an onboard 110-volt charger that refills from a standard outlet. Range figures
                  are "up to" estimates — speed, passenger load, hills, temperature, and tire pressure all
                  play a part, so tell us your typical trip and we'll confirm this model covers it with room
                  to spare. Learn more on our{' '}
                  <Link href="/power" className="text-primary font-semibold hover:underline">lithium power</Link>{' '}
                  and{' '}
                  <Link href="/technology" className="text-primary font-semibold hover:underline">onboard tech</Link>{' '}
                  pages.
                </p>

                <h3 className="text-2xl font-display font-bold mt-10 mb-5 uppercase tracking-tight">
                  Warranty Coverage You Can Count On
                </h3>
                <p className="text-lg leading-relaxed text-foreground/80 mb-5">
                  One more reason I stand behind every Denago I sell: the factory warranty is among the strongest in the industry. Denago models have a lifetime warranty on the Aluminum Chassis, an 8-year warranty on the LiFePO4 Lithium Battery, and a 2-year warranty on other major parts and components.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/90"><strong>Lifetime warranty</strong> on the Aluminum Chassis</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/90"><strong>8-year warranty</strong> on the LiFePO4 Lithium Battery</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground/90"><strong>2-year warranty</strong> on other major parts and components</span>
                  </li>
                </ul>
                <p className="text-lg leading-relaxed text-foreground/80">
                  You can find full warranty details in our{' '}
                  <Link href="/warranty" className="text-primary font-semibold hover:underline">
                    Warranty Terms and Conditions
                  </Link>.
                </p>
              </section>
            </div>
          </div>
        )}

      </article>
    </>
  );
}
