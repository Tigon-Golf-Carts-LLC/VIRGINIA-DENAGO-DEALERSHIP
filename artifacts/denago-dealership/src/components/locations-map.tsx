import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import type { DealershipLocation } from '@/data/locations';
import { Phone, Navigation } from 'lucide-react';
import { getMapsUrl } from '@/lib/maps';

type LocationWithDistance = DealershipLocation & { distance?: number | null };

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Highlighted icon: larger, primary-colored via SVG data URI
const highlightedIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="52" viewBox="0 0 36 52">
    <path d="M18 0C8.059 0 0 8.059 0 18c0 12.765 18 34 18 34S36 30.765 36 18C36 8.059 27.941 0 18 0z" fill="#f97316"/>
    <circle cx="18" cy="18" r="8" fill="white"/>
  </svg>`,
  iconSize: [36, 52],
  iconAnchor: [18, 52],
  popupAnchor: [0, -54],
});

function PanToNearest({
  locations,
  nearestName,
}: {
  locations: LocationWithDistance[];
  nearestName: string | null;
}) {
  const map = useMap();
  const prevName = useRef<string | null>(null);

  useEffect(() => {
    if (!nearestName || nearestName === prevName.current) return;
    const loc = locations.find((l) => l.name === nearestName);
    if (loc) {
      map.flyTo([loc.lat, loc.lng], 12, { duration: 1.2 });
      prevName.current = nearestName;
    }
  }, [nearestName, locations, map]);

  return null;
}

export function LocationsMap({
  locations,
  nearestName = null,
}: {
  locations: LocationWithDistance[];
  nearestName?: string | null;
}) {
  const bounds = L.latLngBounds(locations.map((loc) => [loc.lat, loc.lng]));

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-sm">
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [40, 40] }}
        scrollWheelZoom={false}
        className="h-[420px] md:h-[520px] w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <PanToNearest locations={locations} nearestName={nearestName} />
        {locations.map((loc) => {
          const isNearest = loc.name === nearestName;
          return (
            <Marker
              key={loc.name}
              position={[loc.lat, loc.lng]}
              icon={isNearest ? highlightedIcon : defaultIcon}
              zIndexOffset={isNearest ? 1000 : 0}
            >
              <Popup>
                <div className="flex flex-col gap-1 min-w-[180px]">
                  {isNearest && (
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">
                      ★ Nearest Virginia area
                    </span>
                  )}
                  <span className="font-bold">{loc.name}</span>
                  <span className="text-sm">{loc.address}</span>
                  {loc.distance != null && (
                    <span className="text-xs font-semibold text-orange-500">
                      {loc.distance < 1
                        ? `${(loc.distance * 5280).toFixed(0)} ft away`
                        : `${loc.distance.toFixed(1)} mi away`}
                    </span>
                  )}
                  <a
                    href={`tel:+1${loc.phone.replace(/[^0-9]/g, '')}`}
                    className="inline-flex items-center gap-1.5 font-semibold text-sm mt-1"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {loc.phone}
                  </a>
                  <a
                    href={getMapsUrl(loc.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-sm text-blue-600 hover:text-blue-800 mt-0.5"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    {loc.type === 'showroom' ? 'Get directions' : 'View service area'}
                  </a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
