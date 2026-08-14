import { Link } from 'wouter';
import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import { Battery, Zap, Timer, ShieldCheck } from 'lucide-react';

const highlights = [
  {
    icon: Battery,
    title: 'LiFePO4 Lithium Batteries',
    text: 'Lithium iron phosphate chemistry delivers thousands of charge cycles, zero maintenance, and stable performance in heat and cold — no watering, no acid, no memory effect.',
  },
  {
    icon: Zap,
    title: '5kW AC Motors',
    text: 'Smooth, quiet AC power with strong hill-climbing torque and regenerative braking. Select models step up to 6.3kW for lifted, heavier configurations.',
  },
  {
    icon: Timer,
    title: 'Long Range, Fast Charging',
    text: 'Estimated ranges from 40 to 70+ miles per charge depending on model, with full recharges in as little as 8 hours from a standard outlet.',
  },
  {
    icon: ShieldCheck,
    title: '8-Year Battery Warranty',
    text: 'Denago backs its lithium battery packs with an industry-leading 8-year warranty, registered through your authorized dealer.',
  },
];

export default function FeaturePower() {
  return (
    <>
      <Seo
        title={`Lithium Battery Power & 5kW AC Motors | ${DEALERSHIP.name}`}
        description="Every Denago golf cart runs on maintenance-free LiFePO4 lithium batteries paired with 5kW AC motors — 40 to 70+ mile range, 8-hour charging, and an 8-year battery warranty."
        url={`${DEALERSHIP.domain}/power`}
      />
      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="mb-12 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              LITHIUM <span className="text-primary">POWER</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Every Denago electric golf cart is built around lithium-ion (LiFePO4) batteries paired with
              5kW AC motors — modern, maintenance-free power that outlasts and outperforms lead-acid carts.
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

          <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-foreground">
              Why Lithium Beats Lead-Acid
            </h2>
            <p>
              Traditional lead-acid golf cart batteries need watering, corrode terminals, lose range as they
              discharge, and typically last 3–5 years. Denago's LiFePO4 packs are sealed and maintenance-free,
              hold consistent voltage until empty, weigh hundreds of pounds less, and are warrantied for 8 years.
              Less weight means more range, better hill performance, and less wear on tires and suspension.
            </p>
            <p>
              Ready to feel the difference? <Link href="/denago" className="text-primary font-semibold hover:underline">Browse all Denago models</Link> or
              call <a href={`tel:${DEALERSHIP.phone}`} className="text-primary font-semibold hover:underline">{DEALERSHIP.phoneDisplay}</a> to
              schedule a test drive at a <Link href="/locations" className="text-primary font-semibold hover:underline">dealership near you</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
