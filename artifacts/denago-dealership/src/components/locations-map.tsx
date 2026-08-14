import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { Phone } from 'lucide-react';
import type { DealershipLocation } from '@/data/locations';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export function LocationsMap({ locations }: { locations: DealershipLocation[] }) {
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
        {locations.map((loc) => (
          <Marker key={loc.phone} position={[loc.lat, loc.lng]} icon={defaultIcon}>
            <Popup>
              <div className="flex flex-col gap-1 min-w-[180px]">
                <span className="font-bold">{loc.name}</span>
                <span className="text-sm">{loc.address}</span>
                <a
                  href={`tel:+1${loc.phone.replace(/[^0-9]/g, '')}`}
                  className="inline-flex items-center gap-1.5 font-semibold text-sm mt-1"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {loc.phone}
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
