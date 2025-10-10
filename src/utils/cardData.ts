export interface Card {
  id: string;
  player: string;
  sport: string;
  year: number;
  set: string;
  cardNumber: string;
  image: string;
  currentPrice: number;
  marketValue: number;
  gradedValue: { PSA10: number; PSA9: number };
  recentSales: number[];
  priceVelocity: number;
  popularity: number;
  isRookie: boolean;
  rarity: string;
  dealScore: number;
}

export const sampleCards: Card[] = [
  {
    id: '1',
    player: 'Mike Trout',
    sport: 'Baseball',
    year: 2011,
    set: 'Topps Update',
    cardNumber: 'US175',
    image: 'https://d64gsuwffb70l.cloudfront.net/68e70345fbf6f06bade6fa40_1759970174339_a1f7edac.webp',
    currentPrice: 450,
    marketValue: 520,
    gradedValue: { PSA10: 2800, PSA9: 850 },
    recentSales: [480, 465, 490, 455],
    priceVelocity: 8.5,
    popularity: 95,
    isRookie: true,
    rarity: 'High',
    dealScore: 4.5
  },
  {
    id: '2',
    player: 'LeBron James',
    sport: 'Basketball',
    year: 2003,
    set: 'Topps Chrome',
    cardNumber: '111',
    image: 'https://d64gsuwffb70l.cloudfront.net/68e70345fbf6f06bade6fa40_1759970179365_e946e133.webp',
    currentPrice: 1200,
    marketValue: 1450,
    gradedValue: { PSA10: 8500, PSA9: 2200 },
    recentSales: [1250, 1180, 1300, 1220],
    priceVelocity: 12.3,
    popularity: 98,
    isRookie: true,
    rarity: 'Very High',
    dealScore: 5
  },
  {
    id: '3',
    player: 'Tom Brady',
    sport: 'Football',
    year: 2000,
    set: 'Playoff Contenders',
    cardNumber: '144',
    image: 'https://d64gsuwffb70l.cloudfront.net/68e70345fbf6f06bade6fa40_1759970183627_7719eca8.webp',
    currentPrice: 3500,
    marketValue: 4200,
    gradedValue: { PSA10: 25000, PSA9: 8500 },
    recentSales: [3600, 3450, 3700, 3550],
    priceVelocity: 15.2,
    popularity: 99,
    isRookie: true,
    rarity: 'Extremely High',
    dealScore: 4.8
  }
];
