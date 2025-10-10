import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Plus, Loader2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';

interface SavedSearch {
  id: string;
  search_query: string;
  filters?: any;
  created_at: string;
}

export default function SavedSearches() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSearch, setNewSearch] = useState('');

  useEffect(() => {
    loadSearches();
  }, [user]);

  const loadSearches = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('saved_searches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    setSearches(data || []);
    setLoading(false);
  };

  const handleAddSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSearch) return;
    
    await supabase
      .from('saved_searches')
      .insert({
        user_id: user.id,
        search_query: newSearch
      });
    
    toast({ title: "Search saved!" });
    setNewSearch('');
    loadSearches();
  };

  const handleDelete = async (id: string) => {
    await supabase
      .from('saved_searches')
      .delete()
      .eq('id', id);
    
    toast({ title: "Search removed" });
    loadSearches();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Saved Searches</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Search</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSearch} className="flex gap-2">
              <Input
                placeholder="Enter search query..."
                value={newSearch}
                onChange={(e) => setNewSearch(e.target.value)}
              />
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Save Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {searches.map((search) => (
              <Card key={search.id}>
                <CardContent className="flex justify-between items-center p-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <span>{search.search_query}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(search.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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