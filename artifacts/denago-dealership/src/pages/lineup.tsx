import { Link } from 'wouter';
import { Seo } from '@/components/seo';
import { denagoModels, DEALERSHIP, getModelPath } from '@/data/denago-models';
import { ModelCard } from '@/components/model-card';

const faqs: { q: string; a: string; link?: { href: string; label: string } }[] = [
  {
    q: "What Denago golf cart models are for sale?",
    a: "We carry the full lineup of new Denago golf cart models for sale: the 2-passenger Scout 2, Nomad and Nomad XL, the lifted 4-seat Rover XL, 6-passenger Rover XL6, 8-passenger Rover XXL, the street-legal City NEV, and the Oxen utility cart with dump bed. Call us for current inventory and pricing.",
  },
  {
    q: "How much do Denago golf cart models cost?",
    a: "New Denago golf cart prices range from $8,995 for the Scout 2 up to $16,500 for the street-legal Denago City. The Nomad starts at $9,995, the Rover XL at $10,995, and the Rover XL6, Rover XXL, and Oxen at $12,995. Every listing on this site shows the current MSRP.",
  },
  {
    q: "Do you sell new or used Denago golf cart models?",
    a: "We specialize in brand-new Denago golf cart models backed by full factory warranties, including an 8-year battery warranty on lithium models. Used and pre-owned Denago carts occasionally come through trade-ins — call us to ask what's available.",
  },
  {
    q: "Where can I find Denago golf cart models nearby?",
    a: "We have 16 dealership locations across Pennsylvania, New Jersey, Delaware, North Carolina, Indiana, Virginia, South Carolina, Ohio, Florida, and Texas. Visit our Locations page to find the closest showroom, or call (844) 336-2461.",
  },
  {
    q: "What colors do Denago golf cart models come in?",
    a: "Denago golf carts are available in a range of factory colors depending on model, including black, white, gray, blue, navy blue, and red. Call us to check current color availability for the model you want.",
  },
  {
    q: "What are the dimensions of Denago golf cart models?",
    a: "Dimensions vary by model — compact 2-passenger carts like the Scout 2 have a golf-course-friendly footprint, while the 8-passenger Rover XXL is significantly longer. Full dimensions and spec tables are listed on each product page, and our team can provide detailed measurements for trailering or garage fit.",
  },
  {
    q: "Do Denago golf carts come with golf bag holders and cargo racks?",
    a: "Yes. The Scout 2 includes a golf bag holder with rear storage basket as standard, and the Oxen features a heavy-duty rear utility cargo bed with dump function. Additional accessories like cargo racks, enclosures, and covers are available through our parts department.",
    link: { href: '/accessories', label: 'Browse Denago accessories & parts →' },
  },
  {
    q: "Should I buy a Denago golf cart from eBay or an authorized dealer?",
    a: "We recommend buying from an authorized Denago dealer rather than eBay or other marketplaces. An authorized dealership provides full factory warranty registration, pre-delivery inspection, financing options, genuine replacement parts, and local service support that private-party or marketplace purchases can't match.",
  },
  {
    q: "Do you offer delivery or free shipping on Denago golf cart models?",
    a: "Delivery options vary by location and model. With 16 dealership locations, most customers are within driving distance of a showroom — call us to ask about delivery or shipping promotions in your area.",
  },
  {
    q: "What do Denago golf cart reviews say?",
    a: "Denago golf cart reviews consistently highlight the value of lithium power at this price point — LiFePO₄ batteries with 8-year warranties, smooth 5kW–6.3kW AC motors, and standard features like touchscreens with Apple CarPlay and Android Auto that competitors charge extra for. Visit a showroom to test drive one and see for yourself.",
  },
  {
    q: "Where can I get a Denago golf cart manual?",
    a: "Owner's manuals for every Denago golf cart model are available through our dealership — including operation guides, battery care, charging instructions, and maintenance schedules. Call (844) 336-2461 or stop by any of our locations and we'll get you the manual for your model.",
  },
  {
    q: "Where can I find Denago golf cart specs?",
    a: "Every product page on this site includes a complete Denago golf cart specs table — motor, battery, range, top speed, charge time, brakes, suspension, and seating. Use our Compare page to view specs for all models side by side.",
  },
  {
    q: "Are there Denago golf cart dealers near me?",
    a: "With 16 authorized Denago dealership locations across PA, NJ, DE, NC, IN, VA, SC, OH, FL, and TX, there's likely a Denago golf cart dealer near you. Check our Locations page for addresses, phone numbers, and directions to your closest showroom.",
  },
  {
    q: "How do Denago dealers compare — Tigon Golf Carts, No Limit Carts, World Famous Golf Carts?",
    a: "Denago EV models are sold through a network of authorized dealers. Our dealership group operates 16 locations and offers the complete current Denago lineup, transparent MSRP pricing, factory warranties, and in-house service — call us to compare pricing and availability before you buy anywhere else.",
  },
];

export default function Lineup() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        "itemListElement": denagoModels.map((model, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `${DEALERSHIP.domain}${getModelPath(model)}`,
          "name": model.name
        }))
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": { "@type": "Answer", "text": faq.a },
        })),
      },
    ],
  };

  return (
    <>
      <Seo 
        title="Denago Golf Cart Models for Sale | Prices, Reviews & New Inventory"
        description="Shop all new Denago golf cart models for sale — Scout 2, Nomad, Rover XL, XL6, XXL, City & Oxen. Compare prices from $8,995, colors, dimensions & accessories. 16 dealership locations nearby."
        url={`${DEALERSHIP.domain}/denago`}
        schema={schema}
      />

      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              DENAGO GOLF CART <span className="text-primary">MODELS</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our full inventory of premium electric vehicles. From the compact SCOUT 2 to the massive 8-passenger ROVER XXL, find the perfect EV for your lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {denagoModels.map(model => (
              <ModelCard key={model.slug} model={model} />
            ))}
          </div>

          {/* SEO content */}
          <section className="mt-20 max-w-4xl">
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6">
              New Denago Golf Cart Models <span className="text-primary">for Sale</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                As an authorized Denago EV dealership with 16 locations, we stock the complete range of new
                Denago golf cart models — from the entry-level 2-passenger Scout 2 at $8,995 to the lifted
                Rover series, the street-legal Denago City NEV, and the hard-working Oxen utility cart.
                Every cart is sold at transparent MSRP pricing with full factory warranty coverage, including
                an 8-year battery warranty on lithium models.
              </p>
              <p>
                Looking for a specific color? Denago models are offered in black, white, gray, blue, navy
                blue, and red depending on the series. Need exact dimensions for your garage, trailer, or
                golf course? Each product page includes a full specification table, and our team can confirm
                measurements before you buy. We also carry genuine{' '}
                <Link href="/accessories" className="text-primary font-semibold hover:underline">
                  Denago accessories and replacement parts
                </Link>{' '}
                — golf bag holders, storage baskets, cargo racks, enclosures, and more — and can supply
                owner's manuals and full Denago golf cart specs for every model in the lineup.
              </p>
              <p>
                Skip the risk of eBay and marketplace listings: buying from an authorized dealership means
                pre-delivery inspection, warranty registration, financing options, and local service support.
                Call <a href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`} className="text-primary font-semibold hover:underline">{DEALERSHIP.phoneDisplay}</a> or
                visit a <Link href="/locations" className="text-primary font-semibold hover:underline">dealership location near you</Link>.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-16 max-w-4xl">
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.q} className="group bg-card border border-border rounded-xl overflow-hidden">
                  <summary className="cursor-pointer list-none p-6 font-bold text-foreground flex items-center justify-between gap-4">
                    <h3 className="text-base font-bold">{faq.q}</h3>
                    <span className="text-primary shrink-0 transition-transform group-open:rotate-45 text-2xl leading-none">+</span>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                    {faq.link && (
                      <Link href={faq.link.href} className="mt-3 inline-block text-sm text-primary font-semibold hover:underline">
                        {faq.link.label}
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
