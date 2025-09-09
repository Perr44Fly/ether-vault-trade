import { Shield } from "lucide-react";

const CorporateHeader = () => {
  return (
    <header className="border-b border-corporate-border bg-corporate-surface">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center space-x-8">
          <h1 className="text-xl font-semibold text-corporate-primary">
            Private OTC Desk
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md bg-muted px-3 py-1.5">
          <Shield className="h-4 w-4 text-corporate-accent" />
          <span className="text-sm font-medium text-corporate-secondary">
            Secured by FHE Technology
          </span>
        </div>
      </div>
    </header>
  );
};

export default CorporateHeader;