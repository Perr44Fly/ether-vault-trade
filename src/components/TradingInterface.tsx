import { useState } from "react";
import { ArrowDownUp, TrendingUp, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TradingInterface = () => {
  const [fromToken, setFromToken] = useState("USDT");
  const [toToken, setToToken] = useState("ETH");
  const [amount, setAmount] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const tokens = [
    { symbol: "USDT", name: "Tether USD", balance: "1,250,000" },
    { symbol: "ETH", name: "Ethereum", balance: "456.78" },
    { symbol: "BTC", name: "Bitcoin", balance: "12.45" },
    { symbol: "USDC", name: "USD Coin", balance: "890,000" },
  ];

  const recentTrades = [
    { pair: "ETH/USDT", amount: "500,000", price: "2,450.30", status: "Completed", pnl: "+2.1%" },
    { pair: "BTC/USDT", amount: "250,000", price: "42,150.80", status: "Completed", pnl: "+0.8%" },
    { pair: "ETH/USDC", amount: "750,000", price: "2,448.90", status: "Pending", pnl: "-" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Trading Card */}
      <Card className="border-corporate-border">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-corporate-primary">
            <span>Execute Private Trade</span>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              {isPrivate ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{isPrivate ? "Private Mode" : "Standard Mode"}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Selection */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-corporate-secondary">From</label>
              <Select value={fromToken} onValueChange={setFromToken}>
                <SelectTrigger className="border-corporate-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {token.balance}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-corporate-secondary">To</label>
              <Select value={toToken} onValueChange={setToToken}>
                <SelectTrigger className="border-corporate-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tokens.map((token) => (
                    <SelectItem key={token.symbol} value={token.symbol}>
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {token.balance}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-corporate-secondary">
              Trade Amount ({fromToken})
            </label>
            <Input
              type="text"
              placeholder="Enter large trade amount..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-corporate-border text-lg font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Minimum trade size: 100,000 {fromToken}
            </p>
          </div>

          {/* Trade Preview */}
          {amount && (
            <div className="rounded-lg border border-corporate-border bg-muted/30 p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-corporate-secondary">Estimated Rate</span>
                  <span className="font-mono">2,451.45 USDT/ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-corporate-secondary">You'll Receive</span>
                  <span className="font-mono font-medium">
                    ~{(parseFloat(amount.replace(/,/g, '')) / 2451.45).toFixed(4)} {toToken}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-corporate-secondary">Privacy Level</span>
                  <span className="text-corporate-accent font-medium">Maximum</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="border-corporate-border hover:bg-muted"
              onClick={() => setIsPrivate(!isPrivate)}
            >
              <ArrowDownUp className="mr-2 h-4 w-4" />
              Toggle Privacy
            </Button>
            <Button className="bg-corporate-primary hover:bg-corporate-secondary">
              <TrendingUp className="mr-2 h-4 w-4" />
              Execute Trade
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card className="border-corporate-border">
        <CardHeader>
          <CardTitle className="text-corporate-primary">Recent Large Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTrades.map((trade, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-corporate-border p-3"
              >
                <div className="space-y-1">
                  <div className="font-medium text-corporate-primary">{trade.pair}</div>
                  <div className="text-sm text-muted-foreground">
                    Amount: ${trade.amount}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="font-mono text-sm">${trade.price}</div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        trade.status === "Completed"
                          ? "bg-corporate-success/10 text-corporate-success"
                          : "bg-corporate-warning/10 text-corporate-warning"
                      }`}
                    >
                      {trade.status}
                    </span>
                    {trade.pnl !== "-" && (
                      <span className="text-xs font-medium text-trading-profit">
                        {trade.pnl}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingInterface;