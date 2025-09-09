import CorporateHeader from "@/components/CorporateHeader";
import TradingInterface from "@/components/TradingInterface";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <CorporateHeader />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-corporate-primary mb-2">
            Institutional Trading Desk
          </h2>
          <p className="text-corporate-secondary">
            Execute large token swaps with maximum privacy and zero slippage reveal
          </p>
        </div>
        <TradingInterface />
      </main>
    </div>
  );
};

export default Index;