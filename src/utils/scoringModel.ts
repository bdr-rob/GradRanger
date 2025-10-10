export interface ScoringWeights {
  physicalCondition: number;
  playerProfile: number;
  marketSignals: number;
  timingTrends: number;
}

export const defaultWeights: ScoringWeights = {
  physicalCondition: 0.4,
  playerProfile: 0.3,
  marketSignals: 0.2,
  timingTrends: 0.1
};

export interface CardAnalysis {
  centering: number;
  corners: number;
  edges: number;
  surface: number;
  popularity: number;
  isRookie: boolean;
  rarity: number;
  priceVelocity: number;
  seasonalDemand: number;
}

export function calculateDealScore(analysis: CardAnalysis, weights: ScoringWeights = defaultWeights): number {
  const physicalScore = (analysis.centering + analysis.corners + analysis.edges + analysis.surface) / 4;
  const profileScore = (analysis.popularity + (analysis.isRookie ? 100 : 50) + analysis.rarity) / 3;
  const marketScore = analysis.priceVelocity;
  const timingScore = analysis.seasonalDemand;

  const totalScore = 
    (physicalScore * weights.physicalCondition) +
    (profileScore * weights.playerProfile) +
    (marketScore * weights.marketSignals) +
    (timingScore * weights.timingTrends);

  return Math.min(5, Math.max(1, totalScore / 20));
}
