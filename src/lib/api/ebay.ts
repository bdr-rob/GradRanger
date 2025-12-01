import { APIResponse, EbaySearchParams, CardListing, Card } from '@/types';

const EBAY_API_BASE = 'https://api.ebay.com';
const EBAY_BROWSE_API = `${EBAY_API_BASE}/buy/browse/v1`;

class EbayAPI {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Get OAuth token for eBay API
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      console.log('✅ Using cached eBay token');
      return this.accessToken;
    }

    try {
      const appId = import.meta.env.VITE_EBAY_APP_ID;
      const certId = import.meta.env.VITE_EBAY_CERT_ID;

      if (!appId || !certId) {
        throw new Error('eBay API credentials not found in environment variables');
      }

      console.log('🔑 Getting new eBay OAuth token...');
      
      const credentials = btoa(`${appId}:${certId}`);

      const response = await fetch(
        `${EBAY_API_BASE}/identity/v1/oauth2/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
          },
          body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ eBay OAuth Error:', errorText);
        throw new Error(`Failed to get eBay token: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000));

      console.log('✅ eBay token obtained successfully!');
      return this.accessToken;
    } catch (error) {
      console.error('❌ eBay Auth Error:', error);
      throw error;
    }
  }

  /**
   * Search for cards on eBay - REAL DATA
   */
  async searchCards(params: EbaySearchParams): Promise<APIResponse<any>> {
    try {
      console.log('🔍 Searching eBay for REAL data:', params.keywords);
      
      const token = await this.getAccessToken();
      
      const queryParams = new URLSearchParams({
        q: params.keywords,
        limit: (params.limit || 20).toString(),
        offset: (params.offset || 0).toString(),
      });

      // Filter to Sports Trading Cards category
      queryParams.append('category_ids', '261328');

      const url = `${EBAY_BROWSE_API}/item_summary/search?${queryParams}`;
      console.log('📡 Calling eBay API:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          'X-EBAY-C-ENDUSERCTX': 'contextualLocation=country=US,zip=10001',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ eBay API Error Response:', errorText);
        throw new Error(`eBay API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ eBay REAL Data Received:', data);
      console.log(`📊 Found ${data.total || 0} total results`);

      const listings: CardListing[] = (data.itemSummaries || []).map((item: any) => {
        console.log('🎴 Processing card:', item.title);
        return this.transformEbayItem(item);
      });

      console.log(`✅ Transformed ${listings.length} listings`);

      return {
        success: true,
        data: {
          total: data.total || 0,
          items: listings,
        },
        metadata: {
          timestamp: new Date(),
          requestId: data.warnings?.[0]?.message || '',
        },
      };
    } catch (error) {
      console.error('❌ eBay Search Error:', error);
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
   * Transform eBay item to CardListing format
   */
  private transformEbayItem(item: any): CardListing {
    const cardInfo = this.parseCardTitle(item.title);

    return {
      id: item.itemId,
      card: cardInfo,
      price: parseFloat(item.price?.value || '0'),
      currency: item.price?.currency || 'USD',
      condition: item.condition || 'Not Specified',
      seller: item.seller?.username || 'Unknown',
      marketplace: 'ebay',
      listingUrl: item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`,
      imageUrls: item.image?.imageUrl ? [item.image.imageUrl] : [],
      isBuyNow: item.buyingOptions?.includes('FIXED_PRICE') || false,
      isAuction: item.buyingOptions?.includes('AUCTION') || false,
      currentBid: item.currentBidPrice?.value ? parseFloat(item.currentBidPrice.value) : undefined,
      bidCount: item.bidCount,
      watchers: item.watchCount,
    };
  }

  /**
   * Parse card information from title
   */
  private parseCardTitle(title: string): Card {
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();

    const brands = ['Topps', 'Panini', 'Upper Deck', 'Bowman', 'Fleer', 'Donruss', 'Prizm', 'Select', 'Optic'];
    const brand = brands.find(b => title.toLowerCase().includes(b.toLowerCase())) || 'Unknown';

    let sport: any = 'other';
    const sportKeywords = {
      baseball: ['baseball', 'mlb', 'topps', 'bowman'],
      basketball: ['basketball', 'nba', 'hoops', 'prizm'],
      football: ['football', 'nfl', 'score'],
      hockey: ['hockey', 'nhl', 'opc'],
      soccer: ['soccer', 'football', 'uefa'],
    };

    for (const [sportName, keywords] of Object.entries(sportKeywords)) {
      if (keywords.some(kw => title.toLowerCase().includes(kw))) {
        sport = sportName;
        break;
      }
    }

    return {
      id: `card-${Date.now()}-${Math.random()}`,
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
    const cleaned = title
      .replace(/\b(19|20)\d{2}\b/g, '')
      .replace(/\b(PSA|BGS|CGC|SGC)\s*\d+/gi, '')
      .replace(/\b(Rookie|RC|Auto|Autograph|Patch|Jersey|Prizm|Refractor)\b/gi, '')
      .replace(/[#\d]+/g, '')
      .trim();

    const words = cleaned.split(/\s+/).filter(w => w.length > 2);
    return words.slice(0, 3).join(' ');
  }

  private extractCardNumber(title: string): string | null {
    const match = title.match(/#(\d+[A-Z]*)/i);
    return match ? match[1] : null;
  }
}

export const ebayAPI = new EbayAPI();
export default ebayAPI;