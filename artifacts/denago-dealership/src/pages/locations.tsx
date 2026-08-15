import { useState, useCallback } from 'react';
import { Seo } from '@/components/seo';
import { DEALERSHIP } from '@/data/denago-models';
import { dealershipLocations } from '@/data/locations';
import { Phone, MapPin, Facebook, Youtube, Globe, Navigation, Loader2, Star, X } from 'lucide-react';
import { LocationsMap } from '@/components/locations-map';
import { getMapsUrl } from '@/lib/maps';

const LOCATION_STORAGE_KEY = 'denago_user_coords';

function loadStoredCoords(): { lat: number; lng: number } | null {
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
      return parsed;
    }
  } catch {
    // ignore corrupt data
  }
  return null;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Locations() {
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => loadStoredCoords());
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'denied' | 'error'>('idle');

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

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState('error');
      return;
    }
    setGeoState('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setGeoState('idle');
        try {
          localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
        } catch {
          // storage unavailable — proceed without persisting
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoState('denied');
        } else {
          setGeoState('error');
        }
      },
      { timeout: 10000 }
    );
  }, []);

  const handleClearLocation = useCallback(() => {
    setUserCoords(null);
    setGeoState('idle');
    try {
      localStorage.removeItem(LOCATION_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const locationsWithDistance = dealershipLocations.map((loc) => ({
    ...loc,
    distance: userCoords
      ? haversineDistance(userCoords.lat, userCoords.lng, loc.lat, loc.lng)
      : null,
  }));

  const sortedLocations = userCoords
    ? [...locationsWithDistance].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
    : locationsWithDistance;

  const nearestPhone = userCoords ? sortedLocations[0]?.phone ?? null : null;

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

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                onClick={handleUseMyLocation}
                disabled={geoState === 'loading'}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 rounded-lg font-bold text-sm transition-colors shadow-sm"
              >
                {geoState === 'loading' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                {geoState === 'loading' ? 'Finding your location…' : 'Use my location'}
              </button>

              {userCoords && (
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  Showing stores sorted by distance from you
                  <button
                    onClick={handleClearLocation}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground/70 hover:text-destructive transition-colors underline underline-offset-2"
                    aria-label="Clear my saved location"
                  >
                    <X className="h-3 w-3" />
                    Clear my location
                  </button>
                </span>
              )}
              {geoState === 'denied' && (
                <span className="text-sm text-destructive">
                  Location access was denied — please allow it in your browser settings and try again.
                </span>
              )}
              {geoState === 'error' && (
                <span className="text-sm text-destructive">
                  Could not determine your location. Please try again.
                </span>
              )}
            </div>
          </div>

          <div className="mb-12">
            <LocationsMap locations={sortedLocations} nearestPhone={nearestPhone} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLocations.map((loc) => {
              const isNearest = nearestPhone === loc.phone;
              return (
                <article
                  key={loc.phone}
                  className={`bg-card rounded-xl border shadow-sm hover:shadow-lg transition-shadow p-6 flex flex-col gap-4 ${
                    isNearest
                      ? 'border-primary ring-2 ring-primary/30'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-display font-bold text-xl tracking-tight text-card-foreground">
                      {loc.name}
                    </h2>
                    {isNearest && (
                      <span className="inline-flex items-center gap-1 shrink-0 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-primary" />
                        Nearest
                      </span>
                    )}
                  </div>

                  {loc.distance !== null && (
                    <p className="text-sm font-semibold text-primary -mt-2">
                      {loc.distance < 1
                        ? `${(loc.distance * 5280).toFixed(0)} ft away`
                        : `${loc.distance.toFixed(1)} mi away`}
                    </p>
                  )}

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
                    href={getMapsUrl(loc.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-bold text-sm transition-colors shadow-sm"
                  >
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </a>
                  <a
                    href={`tel:+1${loc.phone.replace(/[^0-9]/g, '')}`}
                    className="flex items-center justify-center gap-2 border border-border text-foreground hover:bg-muted py-3 rounded-lg font-bold text-sm transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    {loc.phone}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
