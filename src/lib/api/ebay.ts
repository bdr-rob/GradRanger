import { 
  APIResponse, 
  EbaySearchParams, 
  EbaySearchResponse,
  CardListing,
  Card 
} from '@/types';

// eBay API Configuration
const EBAY_API_BASE = 'https://api.ebay.com';
const EBAY_FINDING_API = `${EBAY_API_BASE}/buy/browse/v1`;

interface EbayConfig {
  appId: string;
  certId?: string;
  devId?: string;
  authToken?: string;
}

class EbayAPI {
  private config: EbayConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: EbayConfig) {
    this.config = config;
  }

  /**
   * Get OAuth access token for eBay API
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    // Get new token from your backend/Supabase Edge Function
    const response = await fetch('/api/ebay/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId: this.config.appId }),
    });

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

    return this.accessToken;
  }

  /**
   * Search for cards on eBay
   */
  async searchCards(params: EbaySearchParams): Promise<APIResponse<EbaySearchResponse>> {
    try {
      const token = await this.getAccessToken();
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        q: params.keywords,
        limit: (params.limit || 50).toString(),
        offset: (params.offset || 0).toString(),
      });

      // Add filters
      if (params.filter) {
        const filters: string[] = [];
        
        if (params.filter.price) {
          if (params.filter.price.min) {
            filters.push(`price:[${params.filter.price.min}..${params.filter.price.max || '*'}]`);
          }
        }
        
        if (params.filter.buyingFormat) {
          filters.push(`buyingOptions:{${params.filter.buyingFormat.join('|')}}`);
        }

        if (filters.length > 0) {
          queryParams.append('filter', filters.join(','));
        }
      }

      // Add sorting
      if (params.sort) {
        const sortMap = {
          price: 'price',
          endingSoonest: 'endingSoonest',
          newlyListed: 'newlyListed',
        };
        queryParams.append('sort', sortMap[params.sort]);
      }

      const response = await fetch(
        `${EBAY_FINDING_API}/item_summary/search?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
            'X-EBAY-C-ENDUSERCTX': 'affiliateCampaignId=<your_campaign_id>',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`eBay API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Transform eBay response to our CardListing format
      const listings: CardListing[] = data.itemSummaries?.map((item: any) => 
        this.transformEbayItem(item)
      ) || [];

      return {
        success: true,
        data: {
          total: data.total || 0,
          items: listings,
          refinements: data.refinement,
        },
        metadata: {
          timestamp: new Date(),
          requestId: data.requestId || '',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EBAY_SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
      };
    }
  }

  /**
   * Get detailed item information
   */
  async getItemDetails(itemId: string): Promise<APIResponse<CardListing>> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(
        `${EBAY_FINDING_API}/item/${itemId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`eBay API error: ${response.statusText}`);
      }

      const data = await response.json();
      const listing = this.transformEbayItem(data);

      return {
        success: true,
        data: listing,
        metadata: {
          timestamp: new Date(),
          requestId: '',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EBAY_ITEM_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get completed/sold listings for market data
   */
  async getCompletedListings(keywords: string, days: number = 90): Promise<APIResponse<CardListing[]>> {
    try {
      const token = await this.getAccessToken();

      const queryParams = new URLSearchParams({
        q: keywords,
        filter: `soldItems:true,listingEndDate:[${days}d..]`,
        limit: '200',
      });

      const response = await fetch(
        `${EBAY_FINDING_API}/item_summary/search?${queryParams}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`eBay API error: ${response.statusText}`);
      }

      const data = await response.json();
      const listings = data.itemSummaries?.map((item: any) => 
        this.transformEbayItem(item)
      ) || [];

      return {
        success: true,
        data: listings,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EBAY_COMPLETED_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Transform eBay item to our CardListing format
   */
  private transformEbayItem(item: any): CardListing {
    // Extract card details from title
    const cardInfo = this.parseCardTitle(item.title);

    return {
      id: item.itemId,
      card: cardInfo,
      price: parseFloat(item.price?.value || '0'),
      currency: item.price?.currency || 'USD',
      condition: item.condition,
      seller: item.seller?.username || '',
      marketplace: 'ebay',
      listingUrl: item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`,
      imageUrls: item.image?.imageUrl ? [item.image.imageUrl] : [],
      endDate: item.itemEndDate ? new Date(item.itemEndDate) : undefined,
      isBuyNow: item.buyingOptions?.includes('FIXED_PRICE') || false,
      isAuction: item.buyingOptions?.includes('AUCTION') || false,
      currentBid: item.currentBidPrice?.value ? parseFloat(item.currentBidPrice.value) : undefined,
      bidCount: item.bidCount,
      watchers: item.watchCount,
    };
  }

  /**
   * Parse card information from title
   * This is a basic parser - you can enhance with ML/NLP
   */
  private parseCardTitle(title: string): Card {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

    // Common card brands
    const brands = ['Topps', 'Panini', 'Upper Deck', 'Bowman', 'Fleer', 'Donruss'];
    const brand = brands.find(b => title.toLowerCase().includes(b.toLowerCase())) || 'Unknown';

    // Detect sport
    const sportKeywords = {
      baseball: ['baseball', 'mlb', 'topps', 'bowman'],
      basketball: ['basketball', 'nba', 'hoops', 'prizm'],
      football: ['football', 'nfl', 'score'],
      hockey: ['hockey', 'nhl', 'opc'],
      soccer: ['soccer', 'football', 'uefa'],
    };

    let sport: any = 'other';
    for (const [sportName, keywords] of Object.entries(sportKeywords)) {
      if (keywords.some(kw => title.toLowerCase().includes(kw))) {
        sport = sportName;
        break;
      }
    }

    return {
      id: `card-${Date.now()}`,
      title,
      player: this.extractPlayerName(title),
      year,
      brand,
      cardNumber: this.extractCardNumber(title) || '',
      sport,
      isRookie: title.toLowerCase().includes('rookie') || title.toLowerCase().includes('rc'),
      isAutograph: title.toLowerCase().includes('auto') || title.toLowerCase().includes('autograph'),
      isMemorabiliaCard: title.toLowerCase().includes('patch') || title.toLowerCase().includes('jersey'),
    };
  }

  private extractPlayerName(title: string): string {
    // Remove common keywords to isolate player name
    const cleaned = title
      .replace(/\b(19|20)\d{2}\b/g, '')
      .replace(/\b(PSA|BGS|CGC|SGC)\s*\d+/gi, '')
      .replace(/\b(Rookie|RC|Auto|Autograph|Patch|Jersey|Prizm|Refractor)\b/gi, '')
      .replace(/[#\d]+/g, '')
      .trim();

    // Take first 2-3 words as player name
    const words = cleaned.split(/\s+/).filter(w => w.length > 2);
    return words.slice(0, 3).join(' ');
  }

  private extractCardNumber(title: string): string | null {
    const match = title.match(/#(\d+[A-Z]*)/i);
    return match ? match[1] : null;
  }
}

// Export singleton instance
export const ebayAPI = new EbayAPI({
  appId: import.meta.env.VITE_EBAY_APP_ID || '',
  certId: import.meta.env.VITE_EBAY_CERT_ID,
  devId: import.meta.env.VITE_EBAY_DEV_ID,
});

export default ebayAPI;