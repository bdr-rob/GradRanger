import { APIResponse, URLEvaluationResult, Marketplace } from '@/types';
import ebayAPI from './ebay';
import pwccAPI from './pwcc';
import { calculateDealScore } from '@/utils/scoringModel';

class URLEvaluator {
  /**
   * Evaluate a card listing URL from any marketplace
   */
  async evaluateURL(url: string): Promise<APIResponse<URLEvaluationResult>> {
    try {
      const marketplace = this.detectMarketplace(url);
      
      if (!marketplace) {
        return {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Could not detect marketplace from URL',
          },
        };
      }

      let listing;
      
      switch (marketplace) {
        case 'ebay':
          listing = await this.evaluateEbayURL(url);
          break;
        case 'pwcc':
          listing = await this.evaluatePWCCURL(url);
          break;
        case 'goldin':
          listing = await this.evaluateGoldinURL(url);
          break;
        case 'fanatics':
          listing = await this.evaluateFanaticsURL(url);
          break;
        default:
          return {
            success: false,
            error: {
              code: 'UNSUPPORTED_MARKETPLACE',
              message: `Marketplace ${marketplace} is not yet supported`,
            },
          };
      }

      if (!listing) {
        throw new Error('Failed to fetch listing details');
      }

      // Calculate deal score
      const dealScore = await calculateDealScore(listing);

      // Generate recommendation
      const recommendation = this.generateRecommendation(dealScore);

      const result: URLEvaluationResult = {
        isValid: true,
        marketplace,
        listing,
        card: listing.card,
        dealScore: dealScore.overall,
        recommendation: recommendation.text,
        analysis: recommendation.analysis,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'URL_EVALUATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  /**
   * Detect marketplace from URL
   */
  private detectMarketplace(url: string): Marketplace | null {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('ebay.com')) return 'ebay';
    if (urlLower.includes('pwccmarketplace.com')) return 'pwcc';
    if (urlLower.includes('goldinauctions.com')) return 'goldin';
    if (urlLower.includes('fanatics.com')) return 'fanatics';
    
    return null;
  }

  /**
   * Evaluate eBay URL
   */
  private async evaluateEbayURL(url: string) {
    const itemId = this.extractEbayItemId(url);
    if (!itemId) throw new Error('Invalid eBay URL');

    const response = await ebayAPI.getItemDetails(itemId);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch eBay listing');
    }

    return response.data;
  }

  /**
   * Evaluate PWCC URL
   */
  private async evaluatePWCCURL(url: string) {
    const auctionId = this.extractPWCCAuctionId(url);
    if (!auctionId) throw new Error('Invalid PWCC URL');

    const response = await pwccAPI.getAuctionDetails(auctionId);
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch PWCC listing');
    }

    return response.data;
  }

  /**
   * Evaluate Goldin URL
   */
  private async evaluateGoldinURL(url: string) {
    // Implement Goldin-specific logic
    throw new Error('Goldin evaluation not yet implemented');
  }

  /**
   * Evaluate Fanatics URL
   */
  private async evaluateFanaticsURL(url: string) {
    // Implement Fanatics-specific logic
    throw new Error('Fanatics evaluation not yet implemented');
  }

  /**
   * Extract eBay item ID from URL
   */
  private extractEbayItemId(url: string): string | null {
    const match = url.match(/\/itm\/(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Extract PWCC auction ID from URL
   */
  private extractPWCCAuctionId(url: string): string | null {
    const match = url.match(/\/lot\/(\d+)/);
    return match ? match[1] : null;
  }

  /**
   * Generate recommendation based on deal score
   */
  private generateRecommendation(dealScore: any) {
    const score = dealScore.overall;
    
    if (score >= 4.5) {
      return {
        text: '🟢 STRONG BUY - Excellent opportunity!',
        analysis: [
          'High profit potential',
          'Strong market indicators',
          'Favorable timing',
          ...dealScore.reasoning,
        ],
      };
    } else if (score >= 3.5) {
      return {
        text: '🟡 BUY - Good opportunity with moderate risk',
        analysis: [
          'Decent profit potential',
          'Acceptable market conditions',
          ...dealScore.reasoning,
        ],
      };
    } else if (score >= 2.5) {
      return {
        text: '🟠 HOLD - Consider waiting for better opportunity',
        analysis: [
          'Limited profit potential',
          'Market conditions uncertain',
          ...dealScore.reasoning,
        ],
      };
    } else {
      return {
        text: '🔴 PASS - Not recommended',
        analysis: [
          'Low profit potential',
          'Unfavorable market conditions',
          ...dealScore.reasoning,
        ],
      };
    }
  }
}

export const urlEvaluator = new URLEvaluator();
export default urlEvaluator;