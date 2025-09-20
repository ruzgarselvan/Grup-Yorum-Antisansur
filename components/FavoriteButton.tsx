'use client';

import { type MouseEvent, useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

import { isFavorite, toggleFavorite } from '@/lib/favorites';

interface FavoriteButtonProps {
  songId: string;
  className?: string;
  onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteButton({ songId, className = '', onToggle }: FavoriteButtonProps) {
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    setFavorite(isFavorite(songId));
  }, [songId]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    const next = toggleFavorite(songId);
    setFavorite(next);
    onToggle?.(next);
  };

  return (
    <button
      type="button"
      aria-pressed={favorite}
      onClick={handleClick}
      className={`rounded-full p-1.5 transition-all duration-300 hover:bg-white/10 ${className}`.trim()}
    >
      <Heart
        size={18}
        className={favorite ? 'text-[#e74c3c] fill-[#e74c3c]' : 'text-white/70'}
      />
    </button>
  );
}
