import React from 'react';

interface ScoringBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ScoringBadge({ score, size = 'md' }: ScoringBadgeProps) {
  const getColor = (score: number) => {
    if (score >= 4.5) return 'bg-green-500';
    if (score >= 3.5) return 'bg-blue-500';
    if (score >= 2.5) return 'bg-yellow-500';
    if (score >= 1.5) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  };

  return (
    <div className={`${getColor(score)} ${sizeClasses[size]} rounded-full text-white font-bold inline-flex items-center gap-1`}>
      <span>{score.toFixed(1)}</span>
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
  );
}
