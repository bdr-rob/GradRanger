import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import DealCard from './DealCard';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, TrendingUp, AlertCircle, Gavel, Shield } from 'lucide-react';

export default function DealFinder() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sportFilter, setSportFilter] = useState('All');
  const [minScore, setMinScore] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [goldinAuctions, setGoldinAuctions] = useState<any[]>([]);
  const [pwccListings, setPwccListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('BestMatch');
  const [dataSource, setDataSource] = useState('all');
  const { toast } = useToast();
  const searchEbayCards = async () => {
    setLoading(true);
    try {
      const searchQuery = searchTerm || 'rookie card PSA 10';
      const categoryMap: Record<string, string> = {
        'Baseball': '213',
        'Basketball': '214',
        'Football': '215',
        'Hockey': '216',
        'All': '212'
      };

      const { data, error } = await supabase.functions.invoke('ebay-search', {
        body: { 
          query: searchQuery,
          categoryId: categoryMap[sportFilter],
          sortOrder: sortBy,
          limit: 20
        },
      });
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error('Failed to search eBay listings');
      }
      
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to fetch eBay listings');
      }
      
      if (data?.items && Array.isArray(data.items)) {
        const formattedCards = data.items.map((item: any, index: number) => ({
          id: item.itemId || `item-${index}`,
          player: item.title?.substring(0, 50) || 'Unknown Card',
          year: extractYear(item.title) || '2024',
          sport: sportFilter === 'All' ? 'Baseball' : sportFilter,
          grade: extractGrade(item.title) || 'Raw',
          currentPrice: parseFloat(item.price) || 0,
          marketPrice: parseFloat(item.price) * 1.1,
          dealScore: calculateDealScore(item),
          imageUrl: item.imageUrl || '/placeholder.svg',
          ebayUrl: item.viewItemURL,
          condition: item.condition || 'Unknown',
          endTime: item.endTime,
          watchCount: item.watchCount || 0,
          shippingCost: parseFloat(item.shippingCost) || 0
        }));
        
        setCards(formattedCards);
        if (formattedCards.length > 0) {
          toast({
            title: "Search Complete",
            description: `Found ${formattedCards.length} cards matching your criteria`,
          });
        } else {
          toast({
            title: "No Results",
            description: "No cards found matching your search criteria",
          });
        }
      } else {
        setCards([]);
        toast({
          title: "No Results",
          description: "No cards found matching your search criteria",
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Unable to fetch eBay listings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const searchGoldinAuctions = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('goldin-auctions', {
        body: { 
          query: searchTerm,
          limit: 20,
          sortBy: sortBy === 'EndTimeSoonest' ? 'endingSoon' : 
                  sortBy === 'PricePlusShippingLowest' ? 'priceLowToHigh' :
                  sortBy === 'PricePlusShippingHighest' ? 'priceHighToLow' : 'mostBids'
        },
      });

      if (data?.success && data?.data?.auctions) {
        const formattedAuctions = data.data.auctions.map((auction: any) => ({
          id: auction.id,
          player: auction.title,
          currentPrice: auction.currentBid,
          marketPrice: auction.estimatedValue,
          dealScore: auction.currentBid < auction.estimatedValue * 0.8 ? 4.5 : 3.5,
          imageUrl: auction.imageUrl,
          source: 'Goldin',
          bids: auction.numberOfBids,
          endTime: auction.endTime,
          lotNumber: auction.lotNumber
        }));
        setGoldinAuctions(formattedAuctions);
      }
    } catch (error) {
      console.error('Goldin search error:', error);
    }
  };

  const searchPwccMarketplace = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('pwcc-marketplace', {
        body: { 
          query: searchTerm,
          category: sportFilter.toLowerCase()
        },
      });

      if (data?.success && data?.data?.items) {
        const formattedListings = data.data.items.map((item: any) => ({
          id: item.id,
          player: item.title,
          currentPrice: item.currentBid,
          buyNowPrice: item.buyNowPrice,
          marketPrice: item.buyNowPrice * 0.85,
          dealScore: item.currentBid < item.buyNowPrice * 0.7 ? 4.8 : 3.8,
          imageUrl: item.image,
          source: 'PWCC',
          bids: item.bids,
          endTime: item.timeLeft,
          vaultEligible: item.vaultEligible,
          vaultStatus: item.vaultStatus,
          seller: item.seller,
          condition: item.condition,
          lotNumber: item.lotNumber
        }));
        setPwccListings(formattedListings);
      }
    } catch (error) {
      console.error('PWCC search error:', error);
    }
  };

  const searchAll = async () => {
    setLoading(true);
    if (dataSource === 'ebay' || dataSource === 'all') await searchEbayCards();
    if (dataSource === 'goldin' || dataSource === 'all') await searchGoldinAuctions();
    if (dataSource === 'pwcc' || dataSource === 'all') await searchPwccMarketplace();
    setLoading(false);
  };
  const extractYear = (title: string): string => {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    return yearMatch ? yearMatch[0] : '2024';
  };

  const extractGrade = (title: string): string => {
    const gradeMatch = title.match(/PSA\s*(\d+)/i) || title.match(/BGS\s*(\d+\.?\d*)/i);
    return gradeMatch ? gradeMatch[0] : 'Raw';
  };

  const calculateDealScore = (item: any): number => {
    let score = 3;
    const price = parseFloat(item.price);
    
    if (item.watchCount > 10) score += 0.5;
    if (item.watchCount > 20) score += 0.5;
    if (item.listingType === 'Auction') score += 0.5;
    if (price < 100) score += 0.5;
    
    return Math.min(5, score);
  };

  const handleUrlEvaluation = async () => {
    if (!urlInput) return;
    
    // Check if it's an eBay URL
    if (urlInput.includes('ebay.com')) {
      const itemIdMatch = urlInput.match(/\/itm\/(\d+)/);
      if (itemIdMatch) {
        toast({
          title: "Evaluating Listing",
          description: `Analyzing eBay item...`,
        });
        
        // Search for the specific item or related items
        const itemTitle = urlInput.split('/').pop()?.replace(/-/g, ' ').replace(/\d+$/, '').trim() || 'sports card';
        setSearchTerm(itemTitle);
        await searchEbayCards();
      } else {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid eBay listing URL",
          variant: "destructive",
        });
      }
    } else {
      // Try to use the URL as a search term
      setSearchTerm(urlInput);
      await searchEbayCards();
    }
  };

  useEffect(() => {
    searchEbayCards();
  }, []);
  const allCards = [...cards, ...goldinAuctions, ...pwccListings];
  const filteredCards = allCards.filter(card => {
    const matchesScore = card.dealScore >= minScore;
    return matchesScore;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-8 h-8 text-[#47682d]" />
          <h2 className="text-3xl font-bold text-[#14314F]">Live Deal Finder</h2>
        </div>
        
        <div className="flex gap-4 mb-4 flex-wrap">
          <button 
            onClick={() => setDataSource('all')}
            className={`px-4 py-2 rounded-lg font-semibold ${dataSource === 'all' ? 'bg-[#47682d] text-white' : 'bg-gray-200'}`}
          >
            All Sources
          </button>
          <button 
            onClick={() => setDataSource('ebay')}
            className={`px-4 py-2 rounded-lg font-semibold ${dataSource === 'ebay' ? 'bg-[#47682d] text-white' : 'bg-gray-200'}`}
          >
            eBay Only
          </button>
          <button 
            onClick={() => setDataSource('goldin')}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${dataSource === 'goldin' ? 'bg-[#47682d] text-white' : 'bg-gray-200'}`}
          >
            <Gavel className="w-4 h-4" />
            Goldin Auctions
          </button>
          <button 
            onClick={() => setDataSource('pwcc')}
            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${dataSource === 'pwcc' ? 'bg-[#47682d] text-white' : 'bg-gray-200'}`}
          >
            <Shield className="w-4 h-4" />
            PWCC Marketplace
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <input
            type="text"
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAll()}
            className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-[#47682d] focus:outline-none"
          />
          
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-[#47682d] focus:outline-none"
          >
            <option>All</option>
            <option>Baseball</option>
            <option>Basketball</option>
            <option>Football</option>
            <option>Hockey</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-[#47682d] focus:outline-none"
          >
            <option value="BestMatch">Best Match</option>
            <option value="EndTimeSoonest">Ending Soon</option>
            <option value="PricePlusShippingLowest">Lowest Price</option>
            <option value="PricePlusShippingHighest">Highest Price</option>
          </select>

          <button 
            onClick={searchAll}
            disabled={loading}
            className="bg-[#47682d] text-white rounded-lg px-4 py-2 hover:bg-[#47682d]/90 transition font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>

        <div className="bg-[#14314F] rounded-lg p-4 mb-6">
          <h3 className="text-white font-semibold mb-2">URL Evaluator</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste eBay URL to analyze..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 rounded-lg px-4 py-2"
            />
            <button 
              onClick={handleUrlEvaluation}
              className="bg-[#47682d] text-white px-6 py-2 rounded-lg hover:bg-[#47682d]/90 transition font-semibold"
            >
              Evaluate
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              <strong>Live Market Data:</strong> {dataSource === 'all' ? 'Showing combined results from eBay, Goldin, and PWCC' : 
                dataSource === 'ebay' ? 'Showing real-time eBay listings' : 
                dataSource === 'goldin' ? 'Showing Goldin premium auctions' : 
                dataSource === 'pwcc' ? 'Showing PWCC Marketplace with vault services' : 'Showing all available sources'}.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-12 h-12 animate-spin text-[#47682d]" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.map(card => (
            <DealCard 
              key={card.id} 
              card={card}
              onViewDetails={(c) => setSelectedCard(c)}
              onAddToWatchlist={(id) => toast({
                title: "Added to Watchlist",
                description: `Card ${id} has been added to your watchlist`,
              })}
            />
          ))}
        </div>
      )}

      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4">{selectedCard.player}</h3>
            <img src={selectedCard.imageUrl} alt={selectedCard.player} className="w-full h-64 object-contain mb-4" />
            <div className="space-y-2 mb-4">
              <p><strong>Current Price:</strong> ${selectedCard.currentPrice.toFixed(2)}</p>
              <p><strong>Shipping:</strong> ${selectedCard.shippingCost.toFixed(2)}</p>
              <p><strong>Condition:</strong> {selectedCard.condition}</p>
              <p><strong>Watch Count:</strong> {selectedCard.watchCount}</p>
              <p><strong>Deal Score:</strong> ⭐ {selectedCard.dealScore}/5</p>
              {selectedCard.endTime && (
                <p><strong>Ends:</strong> {new Date(selectedCard.endTime).toLocaleString()}</p>
              )}
            </div>
            <div className="flex gap-4">
              <a 
                href={selectedCard.ebayUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-[#47682d] text-white px-6 py-2 rounded-lg text-center hover:bg-[#47682d]/90"
              >
                View on eBay
              </a>
              <button 
                onClick={() => setSelectedCard(null)} 
                className="flex-1 bg-gray-500 text-white px-6 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}