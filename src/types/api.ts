// API response types
import { Card, CardListing, MarketData } from './card';
import { GradingHistory } from './grading';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
  metadata?: ResponseMetadata;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMetadata {
  timestamp: Date;
  requestId: string;
  rateLimit?: RateLimitInfo;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
}

// eBay API Types
export interface EbaySearchParams {
  keywords: string;
  categoryId?: string;
  filter?: {
    price?: { min?: number; max?: number };
    condition?: string[];
    buyingFormat?: ('AUCTION' | 'FIXED_PRICE')[];
  };
  sort?: 'price' | 'endingSoonest' | 'newlyListed';
  limit?: number;
  offset?: number;
}

export interface EbaySearchResponse {
  total: number;
  items: CardListing[];
  refinements?: any;
}

// PWCC API Types
export interface PWCCSearchParams {
  query: string;
  sport?: string;
  year?: number;
  grade?: number;
  limit?: number;
}

export interface PWCCListing {
  id: string;
  title: string;
  currentBid: number;
  endDate: Date;
  imageUrl: string;
  url: string;
  grade?: number;
  gradingCompany?: string;
}

// URL Evaluation Types
export interface URLEvaluationResult {
  isValid: boolean;
  marketplace: string;
  card?: Card;
  listing?: CardListing;
  marketData?: MarketData;
  dealScore?: number;
  recommendation: string;
  analysis: string[];
}

// Market Analysis Types
export interface MarketAnalysisParams {
  card: Partial<Card>;
  includeGraded?: boolean;
  includeRaw?: boolean;
  timeframe?: '7d' | '30d' | '90d' | '1y' | 'all';
}

export interface AggregatedMarketData {
  ebay?: MarketData;
  pwcc?: MarketData;
  goldin?: MarketData;
  combined: MarketData;
  insights: MarketInsight[];
}

export interface MarketInsight {
  type: 'price_trend' | 'volume_spike' | 'opportunity' | 'warning';
  message: string;
  confidence: number;
  data?: any;
}