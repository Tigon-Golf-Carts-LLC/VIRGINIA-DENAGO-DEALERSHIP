import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { LineupOverview } from '@/components/lineup-overview';
import { ResourcesSection } from '@/components/resources-section';

function isModelPage(location: string): boolean {
  const path = location.replace(/\/$/, '') || '/';
  return path === '/oxen' || path === '/scout2' || /^\/denago\/[^/]+$/.test(path);
}

export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <LineupOverview />
      {isModelPage(location) && <ResourcesSection />}
      <Footer />
    </div>
  );
}
