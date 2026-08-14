import { Link } from 'wouter';
import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import { ShieldCheck, Lightbulb, UserCheck, Milestone } from 'lucide-react';

const highlights = [
  {
    icon: Lightbulb,
    title: 'Headlights & Turn Signals',
    text: 'DOT-oriented lighting packages with headlights, brake lights, and turn signals so you can safely share the road after dark.',
  },
  {
    icon: UserCheck,
    title: 'Seat Belts for Every Passenger',
    text: 'Factory-installed seat belts at every seating position — a core requirement for low-speed vehicle (LSV) registration.',
  },
  {
    icon: Milestone,
    title: 'Mirrors & Safety Glass',
    text: 'Side and rearview mirrors plus windshield options designed to meet local low-speed road requirements.',
  },
  {
    icon: ShieldCheck,
    title: 'LSV-Ready Configurations',
    text: 'Many Denago models can be configured as street-legal LSVs capable of 25 mph on roads posted 35 mph or less, where local law allows.',
  },
];

export default function FeatureStreetLegal() {
  return (
    <>
      <Seo
        title={`Street-Legal LSV Golf Carts | ${DEALERSHIP.name}`}
        description="Many Denago golf cart configurations are available as street-legal LSVs — headlights, turn signals, seat belts, and mirrors that meet local low-speed vehicle road requirements."
        url={`${DEALERSHIP.domain}/street-legal`}
      />
      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="mb-12 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              STREET <span className="text-primary">LEGAL</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Many Denago configurations are available as low-speed vehicles (LSVs) with headlights, turn
              signals, seat belts, and mirrors to meet local low-speed road requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-4xl">
            {highlights.map((h) => (
              <div key={h.title} className="bg-card border border-border rounded-xl p-6 flex items-start gap-4">
                <div className="bg-secondary p-3 rounded-full text-primary shrink-0">
                  <h.icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-bold text-lg mb-1">{h.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{h.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed mb-16">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-foreground">
              What Makes a Golf Cart Street Legal?
            </h2>
            <p>
              A street-legal golf cart (LSV/NEV) must typically include headlights, tail and brake lights,
              turn signals, mirrors, seat belts, a windshield, a VIN, and the ability to travel 20–25 mph.
              Requirements vary by state and municipality — our team knows the rules in every market we serve
              and can help you configure, title, and register your cart correctly.
            </p>
            <p>
              Under federal law, a Low-Speed Vehicle is a four-wheeled vehicle that travels more than 20 mph
              but no more than 25 mph, has a gross vehicle weight rating below 3,000 pounds, and carries the
              required federal equipment: lighting, turn signals, mirrors, a windshield, reflectors, a parking
              brake, seat belts, a 17-digit VIN, and a federal certification label. Lights and seat belts
              alone do <em>not</em> make a cart street legal — the VIN and certification label are what
              separate a factory LSV from a dressed-up golf cart. Always confirm the manufacturer's
              certificate of origin identifies the correct vehicle class before registering.
            </p>
          </div>

          <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed mb-16">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-foreground">
              Where Can You Drive an LSV?
            </h2>
            <p>
              Street legality is never automatic — registration, insurance, inspection, licensing, and
              approved roads are controlled by state and local law. Most jurisdictions limit LSVs to roads
              posted at 35 mph or below, though rules vary town by town. Two cautions worth stating plainly:
              a 25 mph LSV is not built to passenger-car crashworthiness standards, so drive it accordingly;
              and modifying a cart to exceed 25 mph can remove it from the federal LSV classification,
              make it unregistrable, and void the warranty. We don't sell or install speed modifications —
              and we'd talk you out of them if we did.
            </p>
          </div>

          <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-foreground">
              Factory Street-Legal, Not Retrofit
            </h2>
            <p>
              The <Link href="/denago/ev-city" className="text-primary font-semibold hover:underline">Denago City</Link> is
              purpose-built for neighborhood streets, and most Nomad and Rover configurations can be equipped
              for LSV use. Call <a href={`tel:${DEALERSHIP.phone}`} className="text-primary font-semibold hover:underline">{DEALERSHIP.phoneDisplay}</a> or
              visit a <Link href="/locations" className="text-primary font-semibold hover:underline">dealership near you</Link> to
              talk through your local requirements.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
