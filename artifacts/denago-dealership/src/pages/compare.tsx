import { Seo } from '@/components/seo';
import { denagoModels, DEALERSHIP, getModelPath } from '@/data/denago-models';
import { Link } from 'wouter';
import { Check, Phone, ArrowRight } from 'lucide-react';

export default function Compare() {
  // Features that are common across models or we want to compare
  const comparisonFeatures = [
    "Lithium Ion Battery",
    "LED Lighting",
    "Digital Display",
    "Street Legal (NEV)",
    "Off-Road Capable"
  ];

  const hasFeature = (modelFeatures: string[], feature: string) => {
    const fStr = modelFeatures.join(' ').toLowerCase();
    const searchStr = feature.toLowerCase();
    if (searchStr === 'street legal (nev)') return fStr.includes('street legal') || fStr.includes('nev');
    if (searchStr === 'off-road capable') return fStr.includes('all-terrain') || fStr.includes('off-road');
    if (searchStr === 'led lighting') return fStr.includes('led');
    return fStr.includes(searchStr);
  };

  return (
    <>
      <Seo 
        title={`Compare DENAGO Models | ${DEALERSHIP.name}`}
        description="Compare specs, prices, and features across the entire DENAGO electric vehicle lineup to find the perfect cart for your needs."
        url={`${DEALERSHIP.domain}/compare`}
      />

      <div className="bg-background pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 uppercase tracking-tight">
              COMPARE <span className="text-primary">MODELS</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Side-by-side comparison of the DENAGO EV lineup. Find the perfect balance of seating, range, and capability.
            </p>
          </div>

          <div className="overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[800px] border-collapse bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="p-6 text-left w-1/5 min-w-[200px]">
                    <span className="font-display font-bold text-lg uppercase tracking-wider">Specs & Features</span>
                  </th>
                  {denagoModels.map(model => (
                    <th key={model.slug} className="p-6 text-center border-l border-border min-w-[180px]">
                      <Link href={getModelPath(model)} className="block group">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-background mb-4 border border-border/50 group-hover:border-primary transition-colors">
                          <img 
                            src={`${import.meta.env.BASE_URL.replace(/\/$/, '')}${model.image}`} 
                            alt={model.name} 
                            width="400"
                            height="300"
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{model.name}</h3>
                        <p className="text-primary font-bold mt-1">{model.price}</p>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Core Specs */}
                <tr className="border-b border-border bg-background">
                  <td className="p-4 px-6 font-semibold text-muted-foreground border-r border-border">Category</td>
                  {denagoModels.map(model => (
                    <td key={model.slug} className="p-4 text-center font-medium text-sm border-r border-border last:border-r-0">
                      {model.category}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="p-4 px-6 font-semibold text-muted-foreground border-r border-border">Seating</td>
                  {denagoModels.map(model => (
                    <td key={model.slug} className="p-4 text-center font-bold border-r border-border last:border-r-0">
                      {model.seats}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border bg-background">
                  <td className="p-4 px-6 font-semibold text-muted-foreground border-r border-border">Est. Range</td>
                  {denagoModels.map(model => (
                    <td key={model.slug} className="p-4 text-center font-bold border-r border-border last:border-r-0">
                      {model.range}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border bg-muted/20">
                  <td className="p-4 px-6 font-semibold text-muted-foreground border-r border-border">Top Speed</td>
                  {denagoModels.map(model => (
                    <td key={model.slug} className="p-4 text-center font-bold border-r border-border last:border-r-0">
                      {model.topSpeed}
                    </td>
                  ))}
                </tr>

                {/* Features */}
                <tr className="bg-foreground text-background">
                  <td colSpan={denagoModels.length + 1} className="p-4 px-6 font-display font-bold uppercase tracking-wider text-sm">
                    Key Features
                  </td>
                </tr>
                
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={feature} className={`border-b border-border ${idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}>
                    <td className="p-4 px-6 font-semibold text-muted-foreground border-r border-border">
                      {feature}
                    </td>
                    {denagoModels.map(model => {
                      const present = hasFeature(model.features, feature);
                      return (
                        <td key={model.slug} className="p-4 text-center border-r border-border last:border-r-0">
                          {present ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <span className="text-muted-foreground/30">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Actions */}
                <tr className="bg-background">
                  <td className="p-6 border-r border-border"></td>
                  {denagoModels.map(model => (
                    <td key={model.slug} className="p-6 text-center border-r border-border last:border-r-0">
                      <div className="flex flex-col gap-3">
                        <Link 
                          href={getModelPath(model)}
                          className="flex items-center justify-center gap-2 text-sm font-bold bg-secondary hover:bg-secondary/80 text-foreground py-2 rounded-md transition-colors"
                        >
                          Details <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a 
                          href={`tel:${DEALERSHIP.phone.replace(/[^0-9+]/g, '')}`}
                          className="flex items-center justify-center gap-2 text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-md transition-colors"
                        >
                          <Phone className="h-4 w-4" /> Call
                        </a>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
