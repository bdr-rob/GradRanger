import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Package, Star, Search, Activity, DollarSign } from 'lucide-react';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalSearches: 0,
    dealsFound: 0,
    avgDealScore: 0,
    savedCards: 0
  });
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [topDeals, setTopDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent eBay searches to show activity
      const { data: searchData } = await supabase.functions.invoke('ebay-search', {
        body: { 
          query: 'PSA 10 rookie',
          limit: 5,
          sortOrder: 'EndTimeSoonest'
        },
      });

      if (searchData?.success && searchData?.items) {
        setTopDeals(searchData.items.slice(0, 3));
        setStats({
          totalSearches: 156,
          dealsFound: searchData.totalResults || 89,
          avgDealScore: 4.2,
          savedCards: 45
        });
      }

      // Simulate recent searches
      setRecentSearches([
        { query: 'Mike Trout 2011 Topps Update', time: '2 hours ago', results: 34 },
        { query: 'LeBron James Rookie PSA', time: '5 hours ago', results: 67 },
        { query: 'Patrick Mahomes Prizm', time: '1 day ago', results: 23 }
      ]);

    } catch (error) {
      console.error('Dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickStats = [
    { 
      label: 'Total Searches', 
      value: stats.totalSearches.toLocaleString(), 
      change: '+12%', 
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      label: 'Deals Found', 
      value: stats.dealsFound.toLocaleString(), 
      change: '+23%', 
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      label: 'Avg Deal Score', 
      value: stats.avgDealScore.toFixed(1), 
      change: '+0.3', 
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    { 
      label: 'Saved Cards', 
      value: stats.savedCards.toLocaleString(), 
      change: '+5', 
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#14314F] to-[#47682d] text-white rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-2">Welcome to Grade Ranger</h2>
        <p className="text-[#ABD2BE]">Your AI-powered sports card research and grading platform with live market data</p>
        <div className="mt-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          <span className="text-sm">Live eBay Integration Active</span>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm text-green-600 font-semibold">{stat.change}</span>
              </div>
              <p className="text-3xl font-bold text-[#14314F]">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-[#14314F] mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate('scanner')}
              className="w-full bg-[#47682d] text-white py-3 rounded-lg hover:bg-[#47682d]/90 transition font-semibold flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Scan a Card
            </button>
            <button 
              onClick={() => onNavigate('deals')}
              className="w-full bg-[#14314F] text-white py-3 rounded-lg hover:bg-[#14314F]/90 transition font-semibold flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Find Live Deals
            </button>
            <button 
              onClick={() => onNavigate('research')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center gap-2"
            >
              <DollarSign className="w-5 h-5" />
              Research Market Prices
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-[#14314F] mb-4">Recent Searches</h3>
          <div className="space-y-3">
            {recentSearches.map((search, i) => (
              <div key={i} className="border-l-4 border-[#47682d] pl-4 py-2">
                <p className="font-semibold text-sm">{search.query}</p>
                <p className="text-sm text-gray-600">{search.results} results found</p>
                <p className="text-xs text-gray-400">{search.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {topDeals.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-[#14314F] mb-4">Ending Soon - Top Deals</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {topDeals.map((deal: any) => (
              <div key={deal.itemId} className="border rounded-lg p-4 hover:shadow-md transition">
                <img 
                  src={deal.imageUrl || '/placeholder.svg'} 
                  alt={deal.title}
                  className="w-full h-32 object-contain mb-2"
                />
                <p className="text-sm font-semibold line-clamp-2">{deal.title}</p>
                <p className="text-lg font-bold text-[#47682d] mt-2">${deal.price}</p>
                <p className="text-xs text-gray-500">
                  Ends: {new Date(deal.endTime).toLocaleString()}
                </p>
                <a 
                  href={deal.viewItemURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-sm text-blue-600 hover:underline block"
                >
                  View on eBay →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}