import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { Seo } from "@/components/seo";

export default function NotFound() {
  return (
    <>
      <Seo title="404 Page Not Found | DENAGO Dealership" description="The page you are looking for does not exist." />
      <div className="min-h-[80vh] w-full flex items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md w-full">
          <AlertCircle className="h-24 w-24 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-5xl font-display font-bold text-foreground mb-4 uppercase tracking-tight">
            404
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The road ends here. This page doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Return Home
            </Link>
            <Link 
              href="/denago"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-6 py-3 rounded-lg font-bold transition-colors border border-border"
            >
              View Inventory
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
