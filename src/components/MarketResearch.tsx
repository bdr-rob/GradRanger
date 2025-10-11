import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ebayAPI } from '@/lib/api/ebay';
import { Loader2 } from 'lucide-react';

export default function MarketResearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await ebayAPI.searchCards({
        keywords: searchQuery,
        limit: 20,
      });

      if (response.success && response.data) {
        setResults(response.data.items);
      } else {
        setError(response.error?.message || 'Search failed');
      }
    } catch (err) {
      setError('Failed to search eBay. Check your API credentials.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-grade-ranger-primary mb-6">
        Card Market Research
      </h1>

      {/* Search Bar */}
      <div className="flex gap-4 mb-8">
        <Input
          placeholder="Search for cards (e.g., 'Michael Jordan 1986 Fleer')"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1"
        />
        <Button 
          onClick={handleSearch} 
          disabled={loading}
          className="bg-grade-ranger-primary hover:bg-grade-ranger-primary-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            'Search eBay'
          )}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              {item.imageUrls?.[0] && (
                <img 
                  src={item.imageUrls[0]} 
                  alt={item.card.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <CardTitle className="text-lg line-clamp-2">
                {item.card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-bold text-grade-ranger-primary">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                {item.grade && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grade:</span>
                    <span className="font-semibold">
                      {item.gradingCompany} {item.grade}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition:</span>
                  <span>{item.condition || 'N/A'}</span>
                </div>
                <Button 
                  className="w-full mt-4"
                  onClick={() => window.open(item.listingUrl, '_blank')}
                >
                  View on eBay
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {!loading && results.length === 0 && searchQuery && (
        <div className="text-center py-12 text-muted-foreground">
          No results found. Try a different search term.
        </div>
      )}
    </div>
  );
}