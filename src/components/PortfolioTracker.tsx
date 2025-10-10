import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BulkImport } from './BulkImport';
import AnalyticsDashboard from './AnalyticsDashboard';
import SocialSharing from './SocialSharing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
interface PortfolioItem {
  id: string;
  player: string;
  year: number;
  set: string;
  card_number?: string;
  grade?: number;
  grading_company?: string;
  purchase_price?: number;
  purchase_date?: string;
  current_value?: number;
  quantity: number;
  notes?: string;
}

export default function PortfolioTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    player: '',
    year: '',
    set: '',
    card_number: '',
    grade: '',
    grading_company: 'PSA',
    purchase_price: '',
    purchase_date: '',
    quantity: '1',
    notes: ''
  });

  useEffect(() => {
    if (user) fetchPortfolio();
  }, [user]);

  const fetchPortfolio = async () => {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setItems(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      player: formData.player,
      year: parseInt(formData.year),
      set: formData.set,
      card_number: formData.card_number || null,
      grade: formData.grade ? parseFloat(formData.grade) : null,
      grading_company: formData.grading_company || null,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
      purchase_date: formData.purchase_date || null,
      quantity: parseInt(formData.quantity),
      notes: formData.notes || null,
      user_id: user?.id,
      current_value: formData.purchase_price ? parseFloat(formData.purchase_price) : null
    };

    if (editingItem) {
      await supabase.from('portfolio_items').update(itemData).eq('id', editingItem.id);
      toast({ title: "Item updated successfully" });
    } else {
      await supabase.from('portfolio_items').insert([itemData]);
      toast({ title: "Item added to portfolio" });
    }

    setShowAddModal(false);
    setEditingItem(null);
    fetchPortfolio();
  };

  const deleteItem = async (id: string) => {
    await supabase.from('portfolio_items').delete().eq('id', id);
    toast({ title: "Item removed from portfolio" });
    fetchPortfolio();
  };

  const totalValue = items.reduce((sum, item) => sum + ((item.current_value || 0) * item.quantity), 0);
  const totalCost = items.reduce((sum, item) => sum + ((item.purchase_price || 0) * item.quantity), 0);
  const totalGain = totalValue - totalCost;

  // Transform items for SocialSharing component
  const portfolioItemsForSharing = items.map(item => ({
    id: item.id,
    player_name: item.player,
    year: item.year.toString(),
    set_name: item.set,
    card_number: item.card_number || '',
    grade: item.grade?.toString(),
    grading_company: item.grading_company,
    purchase_price: item.purchase_price || 0,
    current_value: item.current_value || 0,
    purchase_date: item.purchase_date || '',
    image_url: undefined
  }));

  if (loading) return <div className="text-center py-8">Loading portfolio...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="sharing">Social Sharing</TabsTrigger>
          <TabsTrigger value="import">Bulk Import</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Portfolio Tracker</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
              </div>
              <div className={`rounded-lg p-4 ${totalGain >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className="text-sm text-gray-600">Gain/Loss</p>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(totalGain).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2">Card</th>
                    <th className="text-left py-2">Grade</th>
                    <th className="text-right py-2">Cost</th>
                    <th className="text-right py-2">Value</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="font-semibold">{item.player}</p>
                          <p className="text-sm text-gray-600">{item.year} {item.set}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        {item.grade && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                            {item.grading_company} {item.grade}
                          </span>
                        )}
                      </td>
                      <td className="text-right py-3">${item.purchase_price || 0}</td>
                      <td className="text-right py-3">${item.current_value || 0}</td>
                      <td className="text-right py-3">
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 hover:bg-gray-100 rounded text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="sharing">
          <SocialSharing 
            portfolioItems={portfolioItemsForSharing}
            totalValue={totalValue}
            totalGain={totalGain}
          />
        </TabsContent>

        <TabsContent value="import">
          <BulkImport onImportComplete={fetchPortfolio} />
        </TabsContent>
      </Tabs>
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Card to Portfolio</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Player Name"
                value={formData.player}
                onChange={(e) => setFormData({...formData, player: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Year"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Set/Brand"
                  value={formData.set}
                  onChange={(e) => setFormData({...formData, set: e.target.value})}
                  className="p-2 border rounded"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Card Number"
                value={formData.card_number}
                onChange={(e) => setFormData({...formData, card_number: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.grading_company}
                  onChange={(e) => setFormData({...formData, grading_company: e.target.value})}
                  className="p-2 border rounded"
                >
                  <option value="PSA">PSA</option>
                  <option value="BGS">BGS</option>
                  <option value="SGC">SGC</option>
                  <option value="Raw">Raw</option>
                </select>
                <input
                  type="number"
                  step="0.5"
                  placeholder="Grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  className="p-2 border rounded"
                />
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Purchase Price"
                value={formData.purchase_price}
                onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}