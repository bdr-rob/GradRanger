import { APIResponse, PWCCSearchParams, PWCCListing, CardListing } from '@/types';

const PWCC_API_BASE = 'https://www.pwccmarketplace.com/api';

class PWCCAPI {
  /**
   * Search PWCC Marketplace
   * Note: PWCC doesn't have a public API, so this uses web scraping
   * You may need to use a proxy service or Supabase Edge Function
   */
  async searchCards(params: PWCCSearchParams): Promise<APIResponse<CardListing[]>> {
    try {
      // Call your Supabase Edge Function that handles PWCC scraping
      const response = await fetch('/api/pwcc/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('PWCC search failed');
      }

      const data = await response.json();

      return {
        success: true,
        data: data.listings,
        metadata: {
          timestamp: new Date(),
          requestId: data.requestId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PWCC_SEARCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Get PWCC auction details
   */
  async getAuctionDetails(auctionId: string): Promise<APIResponse<CardListing>> {
    try {
      const response = await fetch(`/api/pwcc/auction/${auctionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch PWCC auction');
      }

      const data = await response.json();

      return {
        success: true,
        data: data.listing,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PWCC_AUCTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }
}

export const pwccAPI = new PWCCAPI();
export default pwccAPI;