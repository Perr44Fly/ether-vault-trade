import CorporateHeader from "@/components/CorporateHeader";
import TradingInterface from "@/components/TradingInterface";
import WalletConnect from "@/components/WalletConnect";

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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TradingInterface />
          </div>
          <div className="lg:col-span-1">
            <WalletConnect />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;