import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Search,
  Plus,
  Heart,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';

interface WatchlistItem {
  id: string;
  card_name: string;
  card_set?: string;
  card_number?: string;
  market_price?: number;
  image_url?: string;
  notes?: string;
  created_at: string;
}

export default function Watchlist() {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add form state
  const [newCard, setNewCard] = useState({
    card_name: '',
    card_set: '',
    card_number: '',
    market_price: '',
    notes: ''
  });

  useEffect(() => {
    loadWatchlist();
  }, [user]);

  const loadWatchlist = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load watchlist",
        variant: "destructive"
      });
    } else {
      setWatchlist(data || []);
    }
    setLoading(false);
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const { error } = await supabase
      .from('watchlist')
      .insert({
        user_id: user.id,
        card_name: newCard.card_name,
        card_set: newCard.card_set || null,
        card_number: newCard.card_number || null,
        market_price: newCard.market_price ? parseFloat(newCard.market_price) : null,
        notes: newCard.notes || null
      });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to add card to watchlist",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Card added to watchlist"
      });
      setNewCard({ card_name: '', card_set: '', card_number: '', market_price: '', notes: '' });
      setShowAddForm(false);
      loadWatchlist();
    }
  };

  const handleRemoveCard = async (id: string) => {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to remove card",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Card removed from watchlist"
      });
      loadWatchlist();
    }
  };

  const filteredWatchlist = watchlist.filter(item =>
    item.card_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.card_set?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Watchlist</h1>
            <p className="text-gray-600 mt-2">Track your favorite cards and monitor price changes</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </div>

        {/* Add Card Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add Card to Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCard} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Card Name *"
                  value={newCard.card_name}
                  onChange={(e) => setNewCard({...newCard, card_name: e.target.value})}
                  required
                />
                <Input
                  placeholder="Set Name"
                  value={newCard.card_set}
                  onChange={(e) => setNewCard({...newCard, card_set: e.target.value})}
                />
                <Input
                  placeholder="Card Number"
                  value={newCard.card_number}
                  onChange={(e) => setNewCard({...newCard, card_number: e.target.value})}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Market Price"
                  value={newCard.market_price}
                  onChange={(e) => setNewCard({...newCard, market_price: e.target.value})}
                />
                <Input
                  placeholder="Notes"
                  value={newCard.notes}
                  onChange={(e) => setNewCard({...newCard, notes: e.target.value})}
                  className="md:col-span-2"
                />
                <div className="md:col-span-2 flex gap-2">
                  <Button type="submit">Add to Watchlist</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search your watchlist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Watchlist Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredWatchlist.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cards in your watchlist</h3>
              <p className="text-gray-500 mb-4">Start adding cards to track their prices</p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Card
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWatchlist.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{item.card_name}</CardTitle>
                      {item.card_set && (
                        <CardDescription>{item.card_set}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCard(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {item.card_number && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Card #</span>
                        <span>{item.card_number}</span>
                      </div>
                    )}
                    {item.market_price && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Market Price</span>
                        <span className="text-xl font-bold">${item.market_price.toFixed(2)}</span>
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-sm text-gray-600 italic">{item.notes}</p>
                    )}
                    <div className="pt-2">
                      <Badge variant="outline" className="text-xs">
                        Added {new Date(item.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}