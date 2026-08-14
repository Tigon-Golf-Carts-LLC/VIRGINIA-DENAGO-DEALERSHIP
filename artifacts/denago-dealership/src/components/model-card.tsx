import { Link } from 'wouter';
import { VehicleModel, DEALERSHIP, getModelPath } from '@/data/denago-models';
import { Phone, Users, Battery, Gauge } from 'lucide-react';

interface ModelCardProps {
  model: VehicleModel;
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <article className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col">
      {/* Image container */}
      <Link href={getModelPath(model)} className="relative aspect-[4/3] overflow-hidden bg-muted/30 block">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        <img
          src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${model.image}`}
          alt={`${model.name} - ${model.category}`}
          width="800"
          height="600"
          loading="lazy"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
        />
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-display font-bold text-2xl tracking-tight text-card-foreground">
              {model.name}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">{model.tagline}</p>
          </div>
          <div className="text-right">
            <span className="block text-sm text-muted-foreground font-medium mb-0.5">Starting at</span>
            <span className="font-bold text-xl text-primary">{model.price}</span>
          </div>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-cols-3 gap-2 py-5 mt-auto border-t border-b border-border/50 my-5">
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold">{model.seats} Seats</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1 border-l border-r border-border/50">
            <Battery className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold">{model.range}</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center gap-1">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold">{model.topSpeed}</span>
          </div>
        </div>

        {/* Actions (Hard Requirement: TWO buttons) */}
        <div className="grid grid-cols-2 gap-3 mt-auto pt-2">
          <Link
            href={getModelPath(model)}
            className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 py-3 rounded-lg font-bold text-sm transition-colors border border-border"
          >
            View Model
          </Link>
          <a
            href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-3 rounded-lg font-bold text-sm transition-colors shadow-sm"
          >
            <Phone className="h-4 w-4" />
            Call Now
          </a>
        </div>
      </div>
    </article>
  );
}
