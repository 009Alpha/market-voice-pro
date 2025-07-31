import React from 'react';
import { TrendingUp, BarChart3, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const StockMarketHeader: React.FC = () => {
  return (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
          Stockest
        </h1>
        <p className="text-xl text-muted-foreground mb-2">
          Your AI-Powered Stock Market Voice Assistant
        </p>
        <p className="text-sm text-muted-foreground">
          Get real-time market insights in multiple Indian languages
        </p>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4 bg-gradient-secondary border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">NIFTY 50</p>
              <p className="text-2xl font-bold text-bull">21,456.78</p>
              <p className="text-sm text-bull">+234.56 (1.11%)</p>
            </div>
            <TrendingUp className="w-8 h-8 text-bull" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-secondary border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">SENSEX</p>
              <p className="text-2xl font-bold text-bull">71,234.89</p>
              <p className="text-sm text-bull">+456.78 (0.65%)</p>
            </div>
            <BarChart3 className="w-8 h-8 text-bull" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-secondary border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">USD/INR</p>
              <p className="text-2xl font-bold text-neutral">83.45</p>
              <p className="text-sm text-bear">-0.12 (-0.14%)</p>
            </div>
            <DollarSign className="w-8 h-8 text-neutral" />
          </div>
        </Card>
      </div>
    </div>
  );
};