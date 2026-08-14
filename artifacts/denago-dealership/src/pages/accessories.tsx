import { Link } from 'wouter';
import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import {
  Phone,
  ArrowRight,
  Flag,
  Package,
  Umbrella,
  Shield,
  BatteryCharging,
  Wrench,
} from 'lucide-react';

const accessoryCategories = [
  {
    icon: Flag,
    title: 'Golf Bag Holders',
    description:
      'Factory-fit golf bag holders and rear storage baskets for the Scout 2, Nomad, and Rover series — carry two bags securely without straps or bungees.',
  },
  {
    icon: Package,
    title: 'Cargo Racks & Storage',
    description:
      'Rear cargo racks, flip-seat cargo decks, under-seat storage trays, and dash organizers to turn your Denago into a hauler for the course, campsite, or neighborhood.',
  },
  {
    icon: Umbrella,
    title: 'Enclosures',
    description:
      'All-weather enclosures with zip-down doors and clear vinyl windows sized for 2-, 4-, 6-, and 8-passenger Denago models. Drive comfortably in rain, wind, and cold.',
  },
  {
    icon: Shield,
    title: 'Covers',
    description:
      'Breathable, UV-resistant storage covers cut to fit each Denago body style — protect your paint, seats, and touchscreen from sun, dust, and weather.',
  },
  {
    icon: BatteryCharging,
    title: 'Chargers',
    description:
      'Genuine Denago replacement chargers and charging accessories matched to your LiFePO4 lithium battery pack — the safe way to protect your 8-year battery warranty.',
  },
  {
    icon: Wrench,
    title: 'Replacement Parts',
    description:
      'Genuine Denago replacement parts: controllers, motors, tires and wheels, brakes, lights, mirrors, seats, windshields, and body panels for every current model.',
  },
];

const accessoryFaqs = [
  {
    q: 'What accessories are available for Denago golf carts?',
    a: 'Popular Denago golf cart accessories include golf bag holders, cargo racks, all-weather enclosures, storage covers, replacement chargers, lift kits, custom wheels, and audio upgrades. Our dealership parts departments stock or can order accessories for every current Denago model.',
  },
  {
    q: 'Where can I buy replacement parts for my Denago golf cart?',
    a: 'Genuine Denago replacement parts — chargers, controllers, tires, brakes, lights, seats, and body panels — are available through our 16 dealership parts departments. Call (866) 996-3867 and we can ship parts to your closest location or install them in our service centers.',
  },
  {
    q: 'Do accessories void the Denago factory warranty?',
    a: 'Genuine Denago accessories installed by an authorized dealer preserve your factory warranty, including the 8-year lithium battery warranty. Aftermarket electrical modifications from unauthorized shops can put coverage at risk — ask our team before you modify.',
  },
  {
    q: 'Can you install accessories on my Denago golf cart?',
    a: 'Yes. Every accessory and part we sell can be professionally installed at any of our 16 service centers — enclosures, lift kits, chargers, lighting, and more. Or buy over the counter if you prefer to install it yourself.',
  },
];

export default function Accessories() {
  const telHref = `tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: 'Denago Golf Cart Accessories & Parts',
        itemListElement: accessoryCategories.map((cat, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: cat.title,
          description: cat.description,
          url: 'https://denagodealership.com/accessories',
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: accessoryFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      },
    ],
  };

  return (
    <>
      <Seo
        title="Denago Golf Cart Accessories & Replacement Parts | Call to Order"
        description="Shop Denago golf cart accessories — golf bag holders, cargo racks, enclosures, covers, chargers & genuine replacement parts. In stock at 16 dealership locations. Call (866) 996-3867 to order."
        url="https://denagodealership.com/accessories"
        schema={schema}
      />

      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              DENAGO ACCESSORIES <span className="text-primary">&amp; PARTS</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Genuine Denago golf cart accessories and replacement parts, stocked through our 16
              dealership parts departments. Everything fits right, preserves your factory warranty,
              and can be professionally installed by our service centers.
            </p>
            <a
              href={telHref}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg shadow-primary/25"
            >
              <Phone className="h-5 w-5" /> Call {DEALERSHIP.phoneDisplay} to Order
            </a>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessoryCategories.map((cat) => (
              <div
                key={cat.title}
                className="bg-card border border-border rounded-xl p-6 flex flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-secondary p-3 rounded-full text-primary shrink-0">
                    <cat.icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-display font-bold text-lg text-card-foreground">
                    {cat.title}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  {cat.description}
                </p>
                <a
                  href={telHref}
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline"
                >
                  <Phone className="h-4 w-4" /> Call Now to Order
                </a>
              </div>
            ))}
          </div>

          {/* SEO content */}
          <section className="mt-20 max-w-4xl">
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-6">
              Genuine Denago Golf Cart <span className="text-primary">Accessories</span>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Whether you're outfitting a new Scout 2 with a golf bag holder, adding an
                all-weather enclosure to a Rover XL6 for winter driving, or replacing a charger on
                an older Denago, our parts departments carry genuine factory accessories and
                replacement parts for every current Denago golf cart model.
              </p>
              <p>
                If we don't have your accessory on the shelf, we order it directly from Denago EV
                and ship it to your closest location — and our{' '}
                <Link href="/service-center" className="text-primary font-semibold hover:underline">
                  service centers
                </Link>{' '}
                can install anything we sell. Looking for mechanical or electrical components?
                Visit our{' '}
                <Link href="/parts" className="text-primary font-semibold hover:underline">
                  replacement parts page
                </Link>{' '}
                or call{' '}
                <a href={telHref} className="text-primary font-semibold hover:underline">
                  {DEALERSHIP.phoneDisplay}
                </a>{' '}
                with your model and serial number.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-16 max-w-4xl">
            <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8">
              Accessories <span className="text-primary">FAQ</span>
            </h2>
            <div className="space-y-4">
              {accessoryFaqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group bg-card border border-border rounded-xl overflow-hidden"
                >
                  <summary className="cursor-pointer list-none p-6 font-bold text-foreground flex items-center justify-between gap-4">
                    <h3 className="text-base font-bold">{faq.q}</h3>
                    <span className="text-primary shrink-0 transition-transform group-open:rotate-45 text-2xl leading-none">
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-6 text-muted-foreground leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="mt-16 max-w-4xl text-center bg-primary text-primary-foreground p-8 rounded-2xl clip-path-slant">
            <h3 className="text-2xl font-bold mb-2">Need an accessory or part?</h3>
            <p className="mb-6 text-primary-foreground/80">
              Our parts specialists will confirm fitment for your model and get it ordered today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={telHref}
                className="inline-flex items-center justify-center gap-2 bg-background text-foreground hover:bg-background/90 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                <Phone className="h-5 w-5 text-primary" /> Call {DEALERSHIP.phoneDisplay}
              </a>
              <Link
                href="/locations"
                className="inline-flex items-center justify-center gap-2 border border-primary-foreground/40 hover:bg-primary-foreground/10 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
              >
                Find a Location <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
