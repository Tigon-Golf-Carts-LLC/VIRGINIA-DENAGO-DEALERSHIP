import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Redirect, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { Shell } from '@/components/layout/shell';

// Pages
import Home from '@/pages/home';
import Lineup from '@/pages/lineup';
import ModelDetail from '@/pages/model-detail';
import Compare from '@/pages/compare';
import Contact from '@/pages/contact';
import Locations from '@/pages/locations';
import FeaturePower from '@/pages/feature-power';
import FeatureTech from '@/pages/feature-tech';
import FeatureStreetLegal from '@/pages/feature-street-legal';
import ResourcePage from '@/pages/resource-page';
import { denagoResources } from '@/data/resources';
import NotFound from '@/pages/not-found';
import Accessories from '@/pages/accessories';
import Reviews from '@/pages/reviews';
import Financing from '@/pages/financing';

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/denago" component={Lineup} />
          <Route path="/denago/ev-oxen">
            <Redirect to="/oxen" replace />
          </Route>
          <Route path="/denago/ev-scout-2">
            <Redirect to="/scout2" replace />
          </Route>
          <Route path="/scout2">
            <ModelDetail slugOverride="scout2" />
          </Route>
          <Route path="/oxen">
            <ModelDetail slugOverride="oxen" />
          </Route>
          <Route path="/denago/:slug" component={ModelDetail} />
          <Route path="/compare" component={Compare} />
          <Route path="/locations" component={Locations} />
          <Route path="/power" component={FeaturePower} />
          <Route path="/technology" component={FeatureTech} />
          <Route path="/street-legal" component={FeatureStreetLegal} />
          <Route path="/reviews" component={Reviews} />
          <Route path="/financing" component={Financing} />
          <Route path="/accessories" component={Accessories} />
          {denagoResources.map((resource) => (
            <Route key={resource.slug} path={`/${resource.slug}`}>
              <ResourcePage resource={resource} />
            </Route>
          ))}
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
