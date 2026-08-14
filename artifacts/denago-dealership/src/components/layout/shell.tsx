import { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { LineupOverview } from '@/components/lineup-overview';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/20">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <LineupOverview />
      <Footer />
    </div>
  );
}
