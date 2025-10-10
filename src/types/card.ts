// Card-related type definitions
export interface Card {
  id: string;
  title: string;
  player: string;
  year: number;
  brand: string;
  cardNumber: string;
  sport: Sport;
  isRookie: boolean;
  isAutograph: boolean;
  isMemorabiliaCard: boolean;
  rarity?: string;
  imageUrl?: string;
  description?: string;
}

export type Sport = 
  | 'baseball' 
  | 'basketball' 
  | 'football' 
  | 'hockey' 
  | 'soccer' 
  | 'other';

export interface CardListing {
  id: string;
  card: Card;
  price: number;
  currency: string;
  condition?: string;
  grade?: number;
  gradingCompany?: GradingCompany;
  seller: string;
  marketplace: Marketplace;
  listingUrl: string;
  imageUrls: string[];
  endDate?: Date;
  shippingCost?: number;
  isBuyNow: boolean;
  isAuction: boolean;
  currentBid?: number;
  bidCount?: number;
  watchers?: number;
}

export type Marketplace = 
  | 'ebay' 
  | 'pwcc' 
  | 'goldin' 
  | 'fanatics' 
  | 'other';

export type GradingCompany = 
  | 'PSA' 
  | 'BGS' 
  | 'CGC' 
  | 'SGC' 
  | 'HGA' 
  | 'none';

export interface MarketData {
  card: Card;
  averagePrice: number;
  medianPrice: number;
  lowestPrice: number;
  highestPrice: number;
  recentSales: Sale[];
  priceHistory: PricePoint[];
  volume: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

export interface Sale {
  id: string;
  price: number;
  date: Date;
  marketplace: Marketplace;
  grade?: number;
  gradingCompany?: GradingCompany;
  url?: string;
}

export interface PricePoint {
  date: Date;
  price: number;
  volume: number;
}

export interface DealScore {
  overall: number; // 1-5
  physicalCondition: number;
  playerProfile: number;
  marketSignals: number;
  timingTrends: number;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'pass' | 'avoid';
  reasoning: string[];
  estimatedProfit?: number;
  estimatedGrade?: number;
}