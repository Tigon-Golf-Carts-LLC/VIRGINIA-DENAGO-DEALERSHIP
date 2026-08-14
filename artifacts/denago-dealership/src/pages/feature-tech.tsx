import { Link } from 'wouter';
import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import { MonitorSmartphone, Camera, Music, Smartphone, KeyRound, Usb, Gauge, Plug } from 'lucide-react';

const highlights = [
  {
    icon: MonitorSmartphone,
    title: '10.1-Inch Touchscreen',
    text: 'A bright, automotive-grade touchscreen display puts speed, battery level, and media controls front and center.',
  },
  {
    icon: Smartphone,
    title: 'Apple CarPlay & Android Auto',
    text: 'Connect your phone for navigation, calls, messages, and music — the same seamless experience you expect in a modern car.',
  },
  {
    icon: Camera,
    title: 'Backup Camera',
    text: 'An integrated rear camera feeds live video to the touchscreen, making reversing out of tight spots safer and easier.',
  },
  {
    icon: Music,
    title: 'Bluetooth Soundbar',
    text: 'Weather-resistant Bluetooth audio built for the outdoors — stream your playlist on the course, around the neighborhood, or at the campsite.',
  },
  {
    icon: KeyRound,
    title: 'NFC Key-Card Ignition',
    text: 'Tap-to-start NFC key cards alongside traditional keys — hand a card to family members instead of cutting spares.',
  },
  {
    icon: Gauge,
    title: 'Digital Instrument Display',
    text: 'Digital speedometer, odometer, and real-time battery state of charge — no more guessing how much range is left.',
  },
  {
    icon: Usb,
    title: 'USB & USB-C Charging',
    text: 'Fast-charge ports for every row keep phones and tablets topped up on long rides — plus lockable glove box storage for them.',
  },
  {
    icon: Plug,
    title: 'Inverter-Ready Power',
    text: 'An optional 2,000-watt inverter (with 3,000–4,000W surge) turns the lithium pack into a mobile power source for lights, laptops, TVs, coffee makers, and tailgates.',
  },
];

export default function FeatureTech() {
  return (
    <>
      <Seo
        title={`Touchscreen, CarPlay & Backup Camera Tech | ${DEALERSHIP.name}`}
        description="Denago golf carts come loaded with tech: 10.1-inch touchscreens with Apple CarPlay and Android Auto, backup cameras, and Bluetooth soundbars — standard, not optional."
        url={`${DEALERSHIP.domain}/technology`}
      />
      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="mb-12 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              ONBOARD <span className="text-primary">TECH</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Denago golf carts come equipped with technology most brands charge thousands extra for —
              10.1-inch touchscreens with Apple CarPlay and Android Auto, backup cameras, and Bluetooth soundbars.
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
              Standard Equipment That Reads Like an Options Sheet
            </h2>
            <p>
              Depending on model and trim, Denago carts include equipment most brands sell as add-ons:
              premium stitched seats with folding armrests, a tilt steering column, folding or ventilated
              windshields, integrated LED headlights with high and low beams, self-canceling turn signals,
              hazard lights, a horn, side mirrors with built-in signal indicators, three-point seat belts,
              front brush guards, LED light bars, running boards, extended roofs, and DOT-rated street or
              all-terrain tires. Front trunks, lockable glove compartments, and rear storage keep gear out
              of the weather. A 110-volt power outlet or inverter-ready connection is available on
              compatible models.
            </p>
            <p>
              The flagship <Link href="/denago/ev-city" className="text-primary font-semibold hover:underline">Denago City</Link> steps
              up further with a 13-inch touchscreen, panoramic see-through roof, electric windshield wiper,
              DOT glass windshield, lounge-style seating with a reversible captain's chair, and ambient,
              roof, and underbody lighting.
            </p>
          </div>

          <div className="max-w-3xl space-y-4 text-muted-foreground leading-relaxed">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight text-foreground">
              Car-Level Tech, Golf Cart Fun
            </h2>
            <p>
              Whether you're navigating to a friend's house in your street-legal Denago City or queuing up music
              for a sunset cruise in a Rover XL6, the integrated tech package makes every ride better. Feature
              availability varies by model and trim — see each product page for details.
            </p>
            <p>
              <Link href="/denago" className="text-primary font-semibold hover:underline">Explore the full lineup</Link> or
              call <a href={`tel:${DEALERSHIP.phone}`} className="text-primary font-semibold hover:underline">{DEALERSHIP.phoneDisplay}</a> to
              see the touchscreen in action at a <Link href="/locations" className="text-primary font-semibold hover:underline">showroom near you</Link>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
