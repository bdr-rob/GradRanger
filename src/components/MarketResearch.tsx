import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, TrendingDown, DollarSign, BarChart3, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketResearch() {
  const { user } = useAuth();
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [priceData, setPriceData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const popularCards = [
    'Michael Jordan 1986 Fleer Rookie',
    'LeBron James 2003 Topps Chrome',
    'Mike Trout 2011 Topps Update',
    'Patrick Mahomes 2017 Prizm',
    'Shohei Ohtani 2018 Topps Rookie'
  ];

  const suggestions = popularCards.filter(p => 
    p.toLowerCase().includes(playerSearch.toLowerCase())
  );

  const handleSearch = async (card: string) => {
    setSelectedCard(card);
    setPlayerSearch(card);
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ebay-search', {
        body: { 
          query: card,
          sortOrder: 'EndTimeSoonest',
          limit: 20,
          userId: user?.id
        },
      });

      if (error) throw error;
      
      if (data?.success && data?.items) {
        // Calculate stats from the items
        const prices = data.items.map((item: any) => parseFloat(item.price));
        const stats = {
          average: prices.reduce((a: number, b: number) => a + b, 0) / prices.length,
          median: prices.sort((a: number, b: number) => a - b)[Math.floor(prices.length / 2)],
          min: Math.min(...prices),
          max: Math.max(...prices),
          count: data.items.length,
          recentSales: data.items.map((item: any) => ({
            title: item.title,
            price: item.price,
            condition: item.condition,
            endDate: item.endTime
          }))
        };
        
        setPriceData({ 
          ...data, 
          stats,
          isLiveData: data.isLiveData || false
        });
        
        const dataSource = data.isLiveData ? 'live eBay data' : 'demo data';
        toast({
          title: "Market Data Loaded",
          description: `Found ${stats.count} items using ${dataSource}`,
        });
      }
    } catch (error: any) {
      console.error('Market research error:', error);
      toast({
        title: "Research Failed",
        description: error.message || "Unable to fetch market data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const calculateTrend = (avg: number, median: number) => {
    const diff = ((avg - median) / median) * 100;
    return diff > 0 ? { value: diff, trend: 'up' } : { value: Math.abs(diff), trend: 'down' };
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-8 h-8 text-[#47682d]" />
        <h2 className="text-3xl font-bold text-[#14314F]">Live Market Research</h2>
      </div>

      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search card (e.g., 'Michael Jordan 1986 Fleer Rookie')..."
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && playerSearch && handleSearch(playerSearch)}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 text-lg focus:border-[#47682d] focus:outline-none"
          />
          {playerSearch && suggestions.length > 0 && (
            <div className="absolute w-full bg-white border-2 border-gray-200 rounded-lg mt-1 shadow-lg z-10">
              {suggestions.map(card => (
                <button
                  key={card}
                  onClick={() => handleSearch(card)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  {card}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Popular Searches:</p>
          <div className="flex flex-wrap gap-2">
            {popularCards.slice(0, 3).map(card => (
              <button
                key={card}
                onClick={() => handleSearch(card)}
                className="px-3 py-1 bg-[#ABD2BE] text-[#14314F] rounded-full text-sm hover:bg-[#47682d] hover:text-white transition"
              >
                {card.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-[#47682d]" />
        </div>
      )}

      {priceData && !loading && (
        <div className="space-y-6">
          {!priceData.isLiveData && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-amber-800">
                  You're viewing demo data. <Link to="/settings" className="font-medium underline">Add your eBay API key</Link> to see live market prices.
                </p>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-[#14314F] text-white p-6 rounded-lg">
              <h3 className="text-sm text-[#ABD2BE] mb-2">Average Price</h3>
              <p className="text-2xl font-bold">{formatCurrency(priceData.stats.average)}</p>
              <div className="flex items-center gap-1 mt-1">
                {calculateTrend(priceData.stats.average, priceData.stats.median).trend === 'up' ? 
                  <TrendingUp className="w-4 h-4 text-green-400" /> : 
                  <TrendingDown className="w-4 h-4 text-red-400" />
                }
                <p className="text-sm text-green-400">
                  {calculateTrend(priceData.stats.average, priceData.stats.median).value.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="bg-[#47682d] text-white p-6 rounded-lg">
              <h3 className="text-sm text-[#ABD2BE] mb-2">Median Price</h3>
              <p className="text-2xl font-bold">{formatCurrency(priceData.stats.median)}</p>
              <p className="text-sm mt-1">Mid-market value</p>
            </div>
            
            <div className="bg-[#14314F] text-white p-6 rounded-lg">
              <h3 className="text-sm text-[#ABD2BE] mb-2">Price Range</h3>
              <p className="text-lg font-bold">
                {formatCurrency(priceData.stats.min)} - {formatCurrency(priceData.stats.max)}
              </p>
              <p className="text-sm mt-1">Last 30 days</p>
            </div>
            
            <div className="bg-[#47682d] text-white p-6 rounded-lg">
              <h3 className="text-sm text-[#ABD2BE] mb-2">Total Sales</h3>
              <p className="text-2xl font-bold">{priceData.stats.count}</p>
              <p className="text-sm mt-1">Completed listings</p>
            </div>
          </div>

          <div className="border-2 border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#47682d]" />
              Recent Sales
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {priceData.stats.recentSales.map((sale: any, i: number) => (
                <div key={i} className="flex justify-between items-start border-b pb-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{sale.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {sale.condition} • {new Date(sale.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#47682d]">{formatCurrency(parseFloat(sale.price))}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Market Analysis</h4>
            <p className="text-sm text-blue-800">
              Based on {priceData.stats.count} recent sales, the market for "{selectedCard}" 
              shows {priceData.stats.average > priceData.stats.median ? 'strong buyer interest' : 'stable pricing'}. 
              The average sale price of {formatCurrency(priceData.stats.average)} suggests 
              {priceData.stats.average > priceData.stats.median ? ' premium examples are commanding higher prices' : ' consistent market valuation'}.
            </p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => handleSearch(selectedCard!)}
              className="flex-1 bg-[#47682d] text-white px-6 py-3 rounded-lg hover:bg-[#47682d]/90 transition font-semibold"
            >
              Refresh Data
            </button>
            <button 
              onClick={() => {
                const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(selectedCard!)}`;
                window.open(searchUrl, '_blank');
              }}
              className="flex-1 bg-[#14314F] text-white px-6 py-3 rounded-lg hover:bg-[#14314F]/90 transition font-semibold"
            >
              View on eBay
            </button>
          </div>
        </div>
      )}

      {!priceData && !loading && (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Enter a card name to see live market data and price trends</p>
        </div>
      )}
    </div>
  );
}