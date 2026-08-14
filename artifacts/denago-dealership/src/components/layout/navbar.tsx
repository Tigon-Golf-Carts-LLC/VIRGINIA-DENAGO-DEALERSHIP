import { Link, useLocation } from 'wouter';
import { Phone, Menu, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { DEALERSHIP } from '@/data/denago-models';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/denago', label: 'Models' },
    { href: '/compare', label: 'Compare' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg transform group-hover:scale-105 transition-transform duration-300">
            <Zap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl leading-none tracking-tight">DENAGO</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">Dealership</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-primary ${
                location === link.href ? 'text-primary' : 'text-foreground/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <a
            href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
            className="hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-semibold hover:bg-primary/90 transition-colors shadow-sm clip-path-slant"
          >
            <Phone className="h-4 w-4" />
            <span>{DEALERSHIP.phoneDisplay}</span>
          </a>
          
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`py-4 px-2 border-b border-border/50 text-sm font-bold uppercase tracking-wider ${
                  location === link.href ? 'text-primary' : 'text-foreground'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-6 pb-2">
              <a
                href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground w-full py-3 rounded-md font-bold uppercase"
              >
                <Phone className="h-5 w-5" />
                Call {DEALERSHIP.phoneDisplay}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
