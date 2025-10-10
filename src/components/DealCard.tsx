import React from 'react';
import { Card } from '../utils/cardData';
import ScoringBadge from './ScoringBadge';

interface DealCardProps {
  card: Card;
  onViewDetails: (card: Card) => void;
  onAddToWatchlist: (cardId: string) => void;
}

export default function DealCard({ card, onViewDetails, onAddToWatchlist }: DealCardProps) {
  const profitPotential = (card.gradedValue?.PSA9 || 0) - card.currentPrice;
  const profitPercent = ((profitPotential / card.currentPrice) * 100).toFixed(0);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition overflow-hidden group">
      <div className="relative">
        <img 
          src={card.image} 
          alt={card.player}
          className="w-full h-64 object-cover group-hover:scale-105 transition"
        />
        <div className="absolute top-2 right-2">
          <ScoringBadge score={card.dealScore} />
        </div>
        {card.isRookie && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
            ROOKIE
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-[#14314F] mb-1">{card.player}</h3>
        <p className="text-sm text-gray-600 mb-3">{card.year} {card.set} #{card.cardNumber}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Current Price:</span>
            <span className="font-bold text-[#14314F]">${card.currentPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">PSA 9 Value:</span>
            <span className="font-bold text-[#47682d]">${card.gradedValue?.PSA9 || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Profit Potential:</span>
            <span className="font-bold text-green-600">+${profitPotential} ({profitPercent}%)</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onViewDetails(card)}
            className="flex-1 bg-[#47682d] text-white py-2 rounded-lg hover:bg-[#47682d]/90 transition font-semibold"
          >
            View Details
          </button>
          <button 
            onClick={() => onAddToWatchlist(card.id)}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            ⭐
          </button>
        </div>
      </div>
    </div>
  );
}
