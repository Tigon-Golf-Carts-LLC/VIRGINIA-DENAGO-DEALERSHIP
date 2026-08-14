import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import { dealershipLocations } from '@/data/locations';
import { Phone, MapPin, Facebook, Youtube, Globe } from 'lucide-react';
import { LocationsMap } from '@/components/locations-map';

export default function Locations() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": dealershipLocations.map((loc, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "AutoDealer",
        "name": `${DEALERSHIP.name} – ${loc.name}`,
        "telephone": `+1-${loc.phone}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": loc.address,
          "addressRegion": loc.state,
          "addressCountry": "US",
        },
        ...(loc.mapUrl ? { "hasMap": loc.mapUrl } : {}),
      },
    })),
  };

  return (
    <>
      <Seo
        title={`Locations | ${DEALERSHIP.name}`}
        description="Find a DENAGO dealership location near you. 16 locations across PA, NJ, DE, NC, IN, VA, SC, OH, FL, and TX. Call or visit today."
        url={`${DEALERSHIP.domain}/locations`}
        schema={schema}
      />

      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              DENAGO DEALERSHIP <span className="text-primary">LOCATIONS</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Visit any of our dealership locations to see the DENAGO lineup in person, take a test drive, and talk to our team.
            </p>
          </div>

          <div className="mb-12">
            <LocationsMap locations={dealershipLocations} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dealershipLocations.map((loc) => (
              <article
                key={loc.phone}
                className="bg-card rounded-xl border border-border shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col gap-4"
              >
                <h2 className="font-display font-bold text-xl tracking-tight text-card-foreground">
                  {loc.name}
                </h2>

                <div className="flex items-start gap-3 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {loc.mapUrl ? (
                    <a
                      href={loc.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors"
                    >
                      {loc.address}
                    </a>
                  ) : (
                    <span>{loc.address}</span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-auto pt-2">
                  {loc.facebook && (
                    <a
                      href={loc.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${loc.name} on Facebook`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Facebook className="h-4 w-4" />
                    </a>
                  )}
                  {loc.youtube && (
                    <a
                      href={loc.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${loc.name} on YouTube`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Youtube className="h-4 w-4" />
                    </a>
                  )}
                  {loc.website && (
                    <a
                      href={loc.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${loc.name} website`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <a
                  href={`tel:+1${loc.phone.replace(/[^0-9]/g, '')}`}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-bold text-sm transition-colors shadow-sm"
                >
                  <Phone className="h-4 w-4" />
                  {loc.phone}
                </a>
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
