import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, DollarSign, Package, Award, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PortfolioItem {
  id: string;
  player_name: string;
  year: string;
  set_name: string;
  card_number: string;
  grade: string;
  purchase_price: number;
  current_value: number;
  quantity: number;
  created_at: string;
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalValue: 0,
    totalGain: 0,
    gainPercent: 0,
    topPerformer: null as any,
    worstPerformer: null as any
  });

  useEffect(() => {
    if (user) loadPortfolio();
  }, [user]);

  const loadPortfolio = async () => {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) {
      setItems(data);
      calculateMetrics(data);
    }
    setLoading(false);
  };

  const calculateMetrics = (data: PortfolioItem[]) => {
    const totalValue = data.reduce((sum, item) => sum + (item.current_value * item.quantity), 0);
    const totalCost = data.reduce((sum, item) => sum + (item.purchase_price * item.quantity), 0);
    const totalGain = totalValue - totalCost;
    const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

    const performers = data.map(item => ({
      ...item,
      gain: ((item.current_value - item.purchase_price) / item.purchase_price) * 100
    })).sort((a, b) => b.gain - a.gain);

    setMetrics({
      totalValue,
      totalGain,
      gainPercent,
      topPerformer: performers[0],
      worstPerformer: performers[performers.length - 1]
    });
  };

  const getCompositionData = () => {
    const playerData: Record<string, number> = {};
    items.forEach(item => {
      playerData[item.player_name] = (playerData[item.player_name] || 0) + (item.current_value * item.quantity);
    });
    return Object.entries(playerData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const getYearData = () => {
    const yearData: Record<string, number> = {};
    items.forEach(item => {
      yearData[item.year] = (yearData[item.year] || 0) + 1;
    });
    return Object.entries(yearData)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  };

  const getTrendData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return last30Days.map((date, index) => ({
      date: new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: metrics.totalValue * (1 + (Math.random() - 0.5) * 0.1)
    }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (loading) return <div className="flex justify-center p-8">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalValue.toFixed(2)}</div>
            <div className={`text-sm ${metrics.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {metrics.gainPercent >= 0 ? '+' : ''}{metrics.gainPercent.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gain/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(metrics.totalGain).toFixed(2)}
            </div>
            <div className="text-sm text-muted-foreground">
              {metrics.totalGain >= 0 ? <TrendingUp className="inline w-4 h-4" /> : <TrendingDown className="inline w-4 h-4" />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.topPerformer && (
              <>
                <div className="text-lg font-semibold">{metrics.topPerformer.player_name}</div>
                <div className="text-sm text-green-600">+{metrics.topPerformer.gain.toFixed(1)}%</div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cards Owned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <div className="text-sm text-muted-foreground">Unique cards</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="composition">Portfolio Composition</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Value Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="composition">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Players by Value</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={getCompositionData()} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {getCompositionData().map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards by Year</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getYearData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions">
          <Card>
            <CardHeader>
              <CardTitle>Predicted Future Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.slice(0, 5).map(item => {
                  const prediction = item.current_value * (1 + Math.random() * 0.3);
                  return (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-semibold">{item.player_name}</div>
                        <div className="text-sm text-muted-foreground">{item.year} {item.set_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${prediction.toFixed(2)}</div>
                        <div className="text-sm text-green-600">
                          +{((prediction - item.current_value) / item.current_value * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}