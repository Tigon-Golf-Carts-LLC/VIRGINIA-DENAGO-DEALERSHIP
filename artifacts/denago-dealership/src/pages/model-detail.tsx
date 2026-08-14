import { useParams, Link } from 'wouter';
import { getModelBySlug, DEALERSHIP } from '@/data/denago-models';
import { Seo } from '@/components/seo';
import NotFound from './not-found';
import { Phone, ChevronRight, CheckCircle2, ShieldCheck, Battery, Gauge, ArrowLeft } from 'lucide-react';

export default function ModelDetail() {
  const { slug } = useParams();
  const model = slug ? getModelBySlug(slug) : undefined;

  if (!model) {
    return <NotFound />;
  }

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
        "item": `${DEALERSHIP.domain}/denago/${model.slug}`
      }
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": ["Product", "Vehicle"],
    "name": model.name,
    "image": `${DEALERSHIP.domain}${model.image}`,
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
      "url": `${DEALERSHIP.domain}/denago/${model.slug}`,
      "priceCurrency": "USD",
      "price": model.priceNumber,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "AutoDealer",
        "name": DEALERSHIP.name
      }
    }
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
        url={`${DEALERSHIP.domain}/denago/${model.slug}`}
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
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-4/3 shadow-xl">
              <img 
                src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${model.image}`}
                alt={model.name}
                width="1200"
                height="900"
                loading="eager"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-6 left-6">
                <span className="bg-background text-foreground text-sm font-bold uppercase tracking-wider py-2 px-4 rounded-full shadow-lg">
                  {model.category}
                </span>
              </div>
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
                  </div>
                  
                  <a 
                    href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-colors shadow-lg clip-path-slant"
                  >
                    <Phone className="h-6 w-6" />
                    Call to Buy
                  </a>
                </div>
                
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

      </article>
    </>
  );
}
