import { Link } from 'wouter';
import { denagoResources } from '@/data/resources';

export function ResourcesSection() {
  return (
    <section className="bg-background border-t border-border py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight mb-3">
            DENAGO <span className="text-primary">Resources</span>
          </h2>
          <p className="text-muted-foreground">
            Everything you need for your DENAGO golf cart, all in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
          {denagoResources.map((resource) => (
            <Link
              key={resource.slug}
              href={`/${resource.slug}`}
              className="bg-card border border-border rounded-lg px-4 py-6 text-center text-sm font-semibold text-card-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center"
            >
              {resource.cardTitle}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
