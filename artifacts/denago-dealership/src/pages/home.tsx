import { Link } from 'wouter';
import { Seo } from '@/components/seo';
import { denagoModels, DEALERSHIP } from '@/data/denago-models';
import { ModelCard } from '@/components/model-card';
import { Phone, ArrowRight, ShieldCheck, Zap, Wrench, FileText } from 'lucide-react';

export default function Home() {
  const featuredModels = denagoModels.filter(m => 
    ['ev-city', 'ev-nomad', 'ev-rover-xl', 'ev-oxen'].includes(m.slug)
  );

  const faqData = [
    {
      q: "Are DENAGO EV golf carts street legal?",
      a: "Yes, many DENAGO models including the CITY and ROVER series are classified as Neighborhood Electric Vehicles (NEVs) or Low-Speed Vehicles (LSVs) and come with DOT-approved safety equipment (windshield, seatbelts, turn signals, mirrors) making them street legal on most roads with a speed limit of 35 mph or less."
    },
    {
      q: "How far can I drive on a single charge?",
      a: "DENAGO electric vehicles typically offer a range of 40 to 50 miles per charge depending on the model, terrain, and passenger load. The OXEN utility model can reach 50-70+ miles."
    },
    {
      q: "How long does it take to charge?",
      a: "With a standard 110V household outlet, a full charge from empty takes approximately 6-8 hours. You can plug it in overnight and be ready for a full day of driving."
    },
    {
      q: "What kind of batteries do DENAGO carts use?",
      a: "All DENAGO EV models in our lineup feature advanced Lithium-Ion batteries, which are lighter, charge faster, require zero maintenance, and last significantly longer than traditional lead-acid batteries."
    },
    {
      q: "What is the warranty on a new DENAGO?",
      a: "DENAGO EVs typically come with a comprehensive manufacturer's warranty, including a multi-year warranty on the lithium battery and major drivetrain components. Contact us for specific model warranty details."
    },
    {
      q: "Do you offer financing?",
      a: "Yes, we offer competitive financing options with flexible terms to help you get into your new DENAGO EV today. Call our sales team to get pre-approved."
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutoDealer",
        "name": DEALERSHIP.name,
        "image": "https://denagodealership.com/assets/denago/denago-ev-rover-xl.jpg",
        "@id": "https://denagodealership.com",
        "url": "https://denagodealership.com",
        "telephone": DEALERSHIP.phone,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "123 Electric Ave",
          "addressLocality": "Austin",
          "addressRegion": "TX",
          "postalCode": "78701",
          "addressCountry": "US"
        }
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqData.map(faq => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ]
  };

  return (
    <>
      <Seo 
        title={`${DEALERSHIP.name} | Premium Electric Golf Carts`}
        description="Discover the DENAGO EV lineup. Shop premium street-legal electric golf carts, multi-passenger rovers, and rugged utility vehicles. Call us today!"
        schema={schema}
      />

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={`${import.meta.env.BASE_URL}assets/denago/denago-ev-city.jpg`}
            alt="DENAGO CITY Golf Cart"
            width="1920"
            height="1080"
            loading="eager"
            className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 z-10 relative py-20">
          <div className="max-w-3xl">
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-bold uppercase tracking-wider mb-6 animate-in slide-in-from-bottom-4 duration-500">
              The Future of Local Transport
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground mb-6 leading-[1.1] animate-in slide-in-from-bottom-6 duration-700 delay-100">
              ELECTRIFY YOUR <span className="text-primary">JOURNEY.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-200">
              Experience the unmatched performance, style, and reliability of the DENAGO EV lineup. From street-legal city cruisers to rugged off-road adventurers.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-10 duration-700 delay-300">
              <Link 
                href="/denago" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all hover:gap-3 clip-path-slant shadow-lg shadow-primary/25"
              >
                Explore Lineup <ArrowRight className="h-5 w-5" />
              </Link>
              <a 
                href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
                className="bg-card text-card-foreground hover:bg-secondary px-8 py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-colors border border-border shadow-sm"
              >
                <Phone className="h-5 w-5" /> {DEALERSHIP.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Zap, title: "Lithium Power", desc: "Maintenance-free lithium-ion batteries standard on every model." },
              { icon: ShieldCheck, title: "Street Legal", desc: "DOT-approved safety equipment for neighborhood driving." },
              { icon: Wrench, title: "Expert Service", desc: "Certified technicians for maintenance and upgrades." },
              { icon: FileText, title: "Easy Financing", desc: "Flexible terms to get you driving your new EV today." }
            ].map((prop, i) => (
              <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-secondary/50 border border-border/50 hover:bg-secondary transition-colors">
                <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                  <prop.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold mb-2">{prop.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Models */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">FEATURED <span className="text-primary">MODELS</span></h2>
              <p className="text-muted-foreground text-lg">Hand-picked selections from our premium electric vehicle inventory.</p>
            </div>
            <Link href="/denago" className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all shrink-0">
              View All Models <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {featuredModels.map(model => (
              <ModelCard key={model.slug} model={model} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section for AEO */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">FREQUENTLY ASKED <span className="text-primary">QUESTIONS</span></h2>
            <p className="text-muted-foreground">Everything you need to know about buying and owning a DENAGO EV.</p>
          </div>

          <div className="space-y-6">
            {faqData.map((faq, i) => (
              <article key={i} className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold mb-3 flex gap-3">
                  <span className="text-primary">Q:</span> {faq.q}
                </h3>
                <p className="text-muted-foreground leading-relaxed pl-7">
                  {faq.a}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center bg-primary text-primary-foreground p-8 rounded-2xl clip-path-slant">
            <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
            <p className="mb-6 text-primary-foreground/80">Our EV experts are standing by to help.</p>
            <a 
              href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-2 bg-background text-foreground hover:bg-background/90 px-8 py-4 rounded-lg font-bold text-lg transition-colors"
            >
              <Phone className="h-5 w-5 text-primary" /> Call {DEALERSHIP.phoneDisplay}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
