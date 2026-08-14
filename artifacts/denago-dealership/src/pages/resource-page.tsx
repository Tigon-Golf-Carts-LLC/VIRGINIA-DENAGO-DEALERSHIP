import { Link } from 'wouter';
import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import { denagoResources, type DenagoResource } from '@/data/resources';
import { Phone } from 'lucide-react';

export default function ResourcePage({ resource }: { resource: DenagoResource }) {
  return (
    <>
      <Seo
        title={`${resource.seoTitle} | ${DEALERSHIP.name}`}
        description={resource.seoDescription}
        url={`${DEALERSHIP.domain}/${resource.slug}`}
      />
      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="mb-12 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              {resource.title} <span className="text-primary">{resource.titleAccent}</span>
            </h1>
            <p className="text-lg text-muted-foreground">{resource.intro}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-5xl">
            {resource.sections.map((section) => (
              <div key={section.heading} className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-bold text-lg mb-2">{section.heading}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.text}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl bg-card border border-border rounded-xl p-8 mb-16">
            <h2 className="text-2xl font-display font-bold uppercase tracking-tight mb-3">
              Talk to a <span className="text-primary">DENAGO Specialist</span>
            </h2>
            <p className="text-muted-foreground mb-6">
              Call us or visit one of our 16 dealership locations — we're happy to help with anything
              Denago.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`tel:${DEALERSHIP.phone}`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Phone className="h-5 w-5" /> {DEALERSHIP.phoneDisplay}
              </a>
              <Link
                href="/locations"
                className="inline-flex items-center gap-2 border border-border bg-background font-bold px-6 py-3 rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                Find a Location
              </Link>
            </div>
          </div>

          <div className="max-w-5xl">
            <h2 className="text-xl font-display font-bold uppercase tracking-tight mb-6">
              More DENAGO <span className="text-primary">Resources</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {denagoResources
                .filter((r) => r.slug !== resource.slug)
                .map((r) => (
                  <Link
                    key={r.slug}
                    href={`/${r.slug}`}
                    className="bg-card border border-border rounded-lg px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
                  >
                    {r.cardTitle}
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
