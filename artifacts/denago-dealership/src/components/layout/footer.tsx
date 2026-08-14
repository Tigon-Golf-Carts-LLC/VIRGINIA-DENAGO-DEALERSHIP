import { Link } from 'wouter';
import { DEALERSHIP, HEADQUARTERS, HOURS } from '@/data/denago-models';
import { Zap, Phone, MapPin, Mail, Clock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-foreground text-background border-t border-border/10 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group w-max">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl leading-none tracking-tight text-white">DENAGO</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">Dealership</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Your premier destination for DENAGO electric vehicles. We offer the full lineup of street-legal NEVs, multi-passenger rovers, and rugged utility carts.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-bold tracking-widest text-sm uppercase text-white mb-2">Contact Us</h3>
            <a href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-3 text-white/70 hover:text-primary transition-colors text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <span>{DEALERSHIP.phoneDisplay}</span>
            </a>
            <div className="flex items-start gap-3 text-white/70 text-sm">
              <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>{HEADQUARTERS.street}<br />{HEADQUARTERS.city}, {HEADQUARTERS.state} {HEADQUARTERS.zip}</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span>{HEADQUARTERS.email}</span>
            </div>
          </div>

          {/* Hours */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-bold tracking-widest text-sm uppercase text-white mb-2">Hours</h3>
            <div className="flex items-start gap-3 text-white/70 text-sm">
              <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col gap-2 w-full">
                {HOURS.map((entry) => (
                  <div key={entry.days} className="flex justify-between w-full max-w-[200px]">
                    <span>{entry.days}</span>
                    <span className="font-medium text-white/90">{entry.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-bold tracking-widest text-sm uppercase text-white mb-2">Quick Links</h3>
            <nav className="flex flex-col gap-3 text-sm">
              <Link href="/denago" className="text-white/70 hover:text-primary transition-colors w-max">View Inventory</Link>
              <Link href="/compare" className="text-white/70 hover:text-primary transition-colors w-max">Compare Models</Link>
              <Link href="/locations" className="text-white/70 hover:text-primary transition-colors w-max">Locations</Link>
              <Link href="/contact" className="text-white/70 hover:text-primary transition-colors w-max">Contact Dealership</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} {DEALERSHIP.legalName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
