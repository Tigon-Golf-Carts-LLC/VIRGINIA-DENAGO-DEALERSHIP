import { Seo } from '@/components/seo';
import { denagoModels, DEALERSHIP, getModelPath } from '@/data/denago-models';
import { ModelCard } from '@/components/model-card';

export default function Lineup() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": denagoModels.map((model, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${DEALERSHIP.domain}${getModelPath(model)}`,
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
              DENAGO GOLF CART <span className="text-primary">MODELS</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our full inventory of premium electric vehicles. From the compact SCOUT 2 to the massive 8-passenger ROVER XXL, find the perfect EV for your lifestyle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {denagoModels.map(model => (
              <ModelCard key={model.slug} model={model} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
