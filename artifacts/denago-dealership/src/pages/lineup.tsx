import { Seo } from '@/components/seo';
import { denagoModels, DEALERSHIP } from '@/data/denago-models';
import { ModelCard } from '@/components/model-card';

export default function Lineup() {
  const categories = Array.from(new Set(denagoModels.map(m => m.category)));

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": denagoModels.map((model, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${DEALERSHIP.domain}/denago/${model.slug}`,
      "name": model.name
    }))
  };

  return (
    <>
      <Seo 
        title={`All DENAGO Models | ${DEALERSHIP.name}`}
        description="Browse the complete lineup of DENAGO electric vehicles. Compare street-legal golf carts, multi-passenger rovers, and off-road utility vehicles."
        url={`${DEALERSHIP.domain}/denago`}
        schema={schema}
      />

      <div className="bg-muted/30 pt-16 pb-24 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
              DENAGO <span className="text-primary">LINEUP</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our full inventory of premium electric vehicles. From the compact SCOUT 2 to the massive 8-passenger ROVER XXL, find the perfect EV for your lifestyle.
            </p>
          </div>

          {categories.map((category) => {
            const modelsInCategory = denagoModels.filter(m => m.category === category);
            return (
              <div key={category} className="mb-16 last:mb-0">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold uppercase tracking-wider">{category}</h2>
                  <div className="h-px bg-border flex-1"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {modelsInCategory.map(model => (
                    <ModelCard key={model.slug} model={model} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
