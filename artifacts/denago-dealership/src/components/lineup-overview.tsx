import { Link } from 'wouter';
import { denagoModels, getModelPath } from '@/data/denago-models';
import { Battery, MonitorSmartphone, ShieldCheck, Wrench } from 'lucide-react';

interface LineupItem {
  title: string;
  slug?: string; // link to a model page when available
  description: string;
}

const lineupItems: LineupItem[] = [
  {
    title: 'Scout',
    slug: 'scout2',
    description:
      'A compact, entry-level 2-passenger model designed for basic cruising and course use.',
  },
  {
    title: 'Nomad / Nomad XL',
    slug: 'ev-nomad',
    description:
      'A versatile 2+2 configuration featuring two forward seats and a rear flip-seat/cargo deck, offering an estimated range up to 40 miles.',
  },
  {
    title: 'Rover XL',
    slug: 'ev-rover-xl',
    description:
      'A popular lifted 4-seater with forward-facing seating, all-terrain tires, and rugged suspension for rougher paths.',
  },
  {
    title: 'Rover XL6 & XXL',
    slug: 'ev-rover-xl6',
    description:
      'Expanded 6-passenger versions of the lifted Rover frame, built for group and family cruising.',
  },
  {
    title: 'City',
    slug: 'ev-city',
    description:
      'A more polished, street-oriented neighborhood shuttle or low-speed vehicle configuration.',
  },
];

const standardFeatures = [
  {
    icon: Battery,
    title: 'Power',
    href: '/power',
    description:
      'Lithium-ion (LiFePO4) batteries paired with 5kW AC motors.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Tech',
    href: '/technology',
    description:
      '10.1-inch touchscreens with Apple CarPlay and Android Auto compatibility, backup cameras, and Bluetooth soundbars.',
  },
  {
    icon: ShieldCheck,
    title: 'Street Legality',
    href: '/street-legal',
    description:
      'Many configurations are available as LSVs with headlights, turn signals, seat belts, and mirrors to meet local low-speed road requirements.',
  },
  {
    icon: Wrench,
    title: 'Accessories & Parts',
    href: '/accessories',
    description:
      'Golf bag holders, cargo racks, enclosures, covers, chargers, and genuine Denago replacement parts — stocked through our dealership parts departments.',
  },
];

function modelHref(slug?: string): string | undefined {
  if (!slug) return undefined;
  const model = denagoModels.find((m) => m.slug === slug);
  return model ? getModelPath(model) : undefined;
}

export function LineupOverview() {
  return (
    <section className="bg-secondary/30 border-t border-border py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8">
          Core Denago EV <span className="text-primary">Lineup</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
          {lineupItems.map((item) => {
            const href = modelHref(item.slug);
            return (
              <div key={item.title} className="bg-card border border-border rounded-xl p-6 flex flex-col gap-2">
                {href ? (
                  <Link href={href} className="font-display font-bold text-lg text-card-foreground hover:text-primary transition-colors">
                    {item.title}
                  </Link>
                ) : (
                  <h3 className="font-display font-bold text-lg text-card-foreground">{item.title}</h3>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>

        <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-8">
          Standard <span className="text-primary">Features</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {standardFeatures.map((feature) => (
            <div key={feature.title} className="bg-card border border-border rounded-xl p-6 flex items-start gap-4">
              <div className="bg-secondary p-3 rounded-full text-primary shrink-0">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <Link href={feature.href} className="font-bold text-lg mb-1 block hover:text-primary transition-colors">
                  {feature.title}
                </Link>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">{feature.description}</p>
                <Link href={feature.href} className="text-sm text-primary font-semibold hover:underline">
                  Learn more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
