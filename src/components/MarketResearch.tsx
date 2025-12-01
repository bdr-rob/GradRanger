import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ebayAPI } from '@/lib/api/ebay';
import { Loader2, Search, ExternalLink, TrendingUp, AlertCircle } from 'lucide-react';
import type { CardListing } from '@/types';

export default function MarketResearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<CardListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setResults([]);

    try {
      console.log('🔍 Searching for:', searchQuery);
      
      const response = await ebayAPI.searchCards({
        keywords: searchQuery,
        limit: 24,
        offset: 0,
      });

      console.log('📦 eBay Response:', response);

      if (response.success && response.data) {
        setResults(response.data.items);
        setTotalResults(response.data.total);
        
        if (response.data.items.length === 0) {
          setError('No results found. Try a different search term.');
        }
      } else {
        setError(response.error?.message || 'Search failed. Please check your eBay API credentials.');
      }
    } catch (err) {
      console.error('❌ Search Error:', err);
      setError('Failed to search eBay. Please check your API credentials in environment variables.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-grade-ranger-primary mb-2">
          Card Market Research
        </h1>
        <p className="text-muted-foreground">
          Search eBay for sports cards and analyze market prices
        </p>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for cards (e.g., 'Michael Jordan 1986 Fleer PSA 10')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 h-12 text-lg border-grade-ranger-primary/30 focus:border-grade-ranger-primary"
            disabled={loading}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={loading || !searchQuery.trim()}
          className="bg-grade-ranger-primary hover:bg-grade-ranger-primary-700 h-12 px-8"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-5 w-5" />
              Search eBay
            </>
          )}
        </Button>
      </div>

      {/* Results Count */}
      {totalResults > 0 && !loading && (
        <div className="mb-6 flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-4 w-4" />
          <span>Found {totalResults.toLocaleString()} results</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.map((item) => (
            <Card 
              key={item.id} 
              className="hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group"
            >
              {/* Card Image */}
              <div className="relative h-48 bg-gradient-to-br from-grade-ranger-primary/10 to-grade-ranger-secondary/10 overflow-hidden">
                {item.imageUrls?.[0] ? (
                  <img 
                    src={item.imageUrls[0]} 
                    alt={item.card.title}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <span className="text-sm">No Image</span>
                  </div>
                )}
                
                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {item.isAuction && (
                    <Badge variant="destructive" className="text-xs">
                      Auction
                    </Badge>
                  )}
                  {item.isBuyNow && (
                    <Badge variant="default" className="text-xs bg-green-600">
                      Buy Now
                    </Badge>
                  )}
                  {item.grade && (
                    <Badge variant="secondary" className="text-xs">
                      {item.gradingCompany} {item.grade}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <CardHeader className="pb-3">
                <CardTitle className="text-sm line-clamp-2 leading-tight">
                  {item.card.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Price */}
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-grade-ranger-primary">
                    ${item.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.currency}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-sm">
                  {item.condition && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="font-medium">{item.condition}</span>
                    </div>
                  )}
                  
                  {item.currentBid && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Bid:</span>
                      <span className="font-medium text-green-600">
                        ${item.currentBid.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {item.seller && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seller:</span>
                      <span className="font-medium text-xs truncate max-w-[120px]">
                        {item.seller}
                      </span>
                    </div>
                  )}
                </div>

                {/* View on eBay Button */}
                <Button 
                  className="w-full mt-4 bg-grade-ranger-secondary hover:bg-grade-ranger-secondary-700"
                  onClick={() => window.open(item.listingUrl, '_blank')}
                  size="sm"
                >
                  View on eBay
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results State */}
      {!loading && results.length === 0 && searchQuery && !error && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-grade-ranger-primary/10 mb-4">
            <Search className="h-8 w-8 text-grade-ranger-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your search terms or use different keywords
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-grade-ranger-primary/10"
              onClick={() => setSearchQuery('Michael Jordan rookie')}
            >
              Michael Jordan rookie
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-grade-ranger-primary/10"
              onClick={() => setSearchQuery('Tom Brady PSA 10')}
            >
              Tom Brady PSA 10
            </Badge>
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-grade-ranger-primary/10"
              onClick={() => setSearchQuery('LeBron James Prizm')}
            >
              LeBron James Prizm
            </Badge>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && !searchQuery && !error && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-grade-ranger-primary/20 to-grade-ranger-secondary/20 mb-6">
            <Search className="h-10 w-10 text-grade-ranger-primary" />
          </div>
          <h3 className="text-2xl font-bold mb-3">Start Your Card Research</h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Search for sports cards on eBay to analyze market prices, find deals, and make informed investment decisions
          </p>
          
          {/* Popular Searches */}
          <div className="max-w-2xl mx-auto">
            <p className="text-sm font-semibold mb-3 text-muted-foreground">
              Popular Searches:
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {[
                'Michael Jordan 1986 Fleer',
                'Tom Brady Rookie PSA 10',
                'LeBron James Prizm',
                'Patrick Mahomes Rookie',
                'Kobe Bryant Topps Chrome',
                'Wayne Gretzky Rookie',
              ].map((term) => (
                <Badge 
                  key={term}
                  variant="outline" 
                  className="cursor-pointer hover:bg-grade-ranger-primary hover:text-white transition-colors px-4 py-2"
                  onClick={() => {
                    setSearchQuery(term);
                    setTimeout(() => handleSearch(), 100);
                  }}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}