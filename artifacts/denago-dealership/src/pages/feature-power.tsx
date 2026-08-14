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

          <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed mb-16">
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
              LiFePO4 stands for lithium iron phosphate — the most stable, longest-lived lithium chemistry in
              common use. Beyond zero watering, it charges faster than lead-acid, holds steadier voltage under
              load (no fading uphill on a half-empty pack), and carries integrated battery-management-system
              (BMS) protection against over-charge, over-discharge, and temperature extremes. Core lifestyle
              models pair a 51.2V 105Ah pack (about 5.4 kWh) with a 5kW–6.3kW AC motor, a 400-amp controller,
              and an onboard 110-volt charger that refills the pack in roughly five hours from a standard
              outlet. The long-range Denago City and OXEN step up to a 51.2V 205Ah pack — roughly 10.5 kWh,
              about double the energy.
            </p>
          </div>

          <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed mb-16">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-foreground">
              Real-World Range: What "Up To" Means
            </h2>
            <p>
              Published ranges are estimates, not EPA figures — real-world range depends on speed, passenger
              and cargo weight, hills, tire style and pressure, outside temperature, stop-and-go driving, and
              how hard the headlights and sound system are working. A fully loaded six-seater climbing hills
              won't match an unloaded two-seater on flat pavement, whatever the brand. The honest way to shop
              is to describe your typical trip to us — we'll tell you which pack and model covers it with
              margin to spare.
            </p>
            <p>
              A few habits protect the pack for its full 8-year-warranty life: use only the matching onboard
              charger, never wire accessories directly to the battery terminals, keep connectors dry (skip
              the pressure washer around electrical components), and follow the owner's manual for long-term
              winter storage. See our <Link href="/battery" className="text-primary font-semibold hover:underline">battery guide</Link> for
              the full care checklist.
            </p>
          </div>

          <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-foreground">
              Braking and Suspension to Match
            </h2>
            <p>
              Power is only half the drivetrain story. Denago pairs it with four-wheel disc brakes,
              regenerative braking that recovers energy on descents, an electric parking brake, and fully
              independent front and rear suspension — equipment that legacy fleet carts simply don't carry.
              Lifted XL models add all-terrain tires and extra ground clearance for gravel, grass, and
              trail duty.
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
